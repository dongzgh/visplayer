#Author-
#Description-

import adsk.core, adsk.fusion, adsk.cam, traceback
import json, zipfile, os, os.path

#def dumpInfo(objs):
#  fi = open("c:\\Temp\\objs.txt", "w+")
#  for i in range(len(objs)):
#    fi.write("object id = " + str(id(objs[i])) + '\n')
#  fi.close()

surfaceIds = []
surfaceMeshIds = []
curve2DIds = []
curve2DMeshIds = []
curve3DIds = []
curve3DMeshIds = []
pointIds = []


# Function to get topology data
def getTopologyData(occs):
  # Create objects.
  topology = []
  surfaces = []
  curves = []
  points = []
  meshes = []

  # Initialize counters.
  idBody = -1
  idShell = -1
  idLoop = -1
  idUVEdge = -1

  # Save data
  for occ in occs:
    for body in occ.bRepBodies:
      # prepare body data.
      idBody += 1
      bodyData = {
        "_description":  "body data",
        "id": idBody,
        "type": "body",
        "shells": []
      }

      # append data.
      topology.append(bodyData)
      lump = body.lumps.item(0)
      for shell in lump.shells:
        # prepare shell data.
        idShell += 1
        shellData = {
          "_description": "shell data",
          "id": idShell,
          "bodyId": idBody,
          "type": "shell",
          "faces": []
        }

        # append data.
        bodyData["shells"].append(shellData)
        for face in shell.faces:
          # prepare face data.
          faceData = {
            "_description": "face data",
            "id": face.tempId,
            "shellId": idShell,
            "surfaceId": face.tempId, # id(face.geometry) returned not unique.
            "meshId": face.tempId,
            "type": "face",
            "loops": []
          }

          # append data.
          shellData["faces"].append(faceData)
          surfaceData = getSurfaceData(face.geometry, face.tempId)
          surfaces.append(surfaceData)
          mesh = face.meshManager.displayMeshes.bestMesh
          meshData = getSurfaceMeshData(mesh, face.tempId)
          meshes.append(meshData)
          for loop in face.loops:
            # prepare loop data.
            idLoop += 1
            loopData = {
              "_description": "loop data",
              "id": idLoop,
              "faceId": face.tempId,
              "type": "loop",
              "uvedges": []
            }
            faceData["loops"].append(loopData)
            for uvedge in loop.coEdges:
              # prepare uvedge data.
              idUVEdge += 1
              uvedgeData = {
                "_description": "uvedge data",
                "id": idUVEdge,
                "loopId": idLoop,
                "curveId": idUVEdge,
                "meshId": idUVEdge,
                "type": "uvedge"
              }

              # prepare edge data.
              edge = uvedge.edge
              edgeData = {
                "_description": "edge data",
                "id": edge.tempId,
                "uvedgeId": idUVEdge,
                "curveId": edge.tempId,
                "meshId": edge.tempId,
                "type": "edge"
              }

              # prepare start vertex data.
              startVertex = edge.startVertex
              startVertexData = {
                "_description": "vertex data",
                "id": startVertex.tempId,
                "edgeId": edge.tempId,
                "pointId": startVertex.tempId,
                "type": "vertex"
              }

              # prepare end vertex data.
              endVertex = edge.endVertex
              endVertexData = {
                "_description": "vertex data",
                "id": endVertex.tempId,
                "edgeId": edge.tempId,
                "pointId": endVertex.tempId,
                "type": "vertex"
              }

              # append data.
              edgeData['startVertex'] = startVertexData
              edgeData['endVertex'] = endVertexData
              uvedgeData['edge'] = edgeData
              loopData["uvedges"].append(uvedgeData)
              curve2DData = getCurve2DData(uvedge.geometry, idUVEdge)
              if curve2DData != None:
                curves.append(curve2DData)
              curve2DMeshData = getCurve2DMeshData(uvedge.geometry, idUVEdge)
              if curve2DMeshData != None:
                meshes.append(curve2DMeshData)
              curve3DData = getCurve3DData(uvedge.edge.geometry, uvedge.edge.tempId)
              if curve3DData != None:
                curves.append(curve3DData)
              curv3DMeshData = getCurve3DMeshData(uvedge.edge.geometry, uvedge.edge.tempId)
              if curv3DMeshData != None:
                meshes.append(curv3DMeshData)
              pointData = getPointData(uvedge.edge.startVertex.geometry, uvedge.edge.startVertex.tempId)
              if pointData != None:
                points.append(pointData)
              pointData = getPointData(uvedge.edge.endVertex.geometry, uvedge.edge.endVertex.tempId)
              if pointData != None:
                points.append(pointData)

  # Return object.
  return topology, surfaces, curves, points, meshes

# Function to get only nurbs surface data.
def getSurfaceData(surface, surfaceId):
  # check and append ids.
  global surfaceIds
  if surfaceId in surfaceIds:
    return None

  # prepare nurbs surface data.
  if surface.surfaceType == adsk.core.SurfaceTypes.NurbsSurfaceType:
    # append id.
    surfaceIds.append(surfaceId)

    # cast surface.
    nurbs = adsk.core.NurbsSurface.cast(surface)

    # prepare points.
    points = []
    for p in nurbs.controlPoints:
      points.append(p.x)
      points.append(p.y)
      points.append(p.z)

    # return data.
    return {
      "_description": "nurbs data",
      "id": surfaceId,
      "type": "nurbs",
      "degree": {
        "u": nurbs.degreeU,
        "v": nurbs.degreeV
      },
      "poles": {
        "countU": nurbs.controlPointCountU,
        "countV": nurbs.controlPointCountV,
        "points": points,
        "weights": []
      },
      "knots": {
        "countU": nurbs.knotCountU,
        "countV": nurbs.knotCountV,
        "valuesU": nurbs.knotsU,
        "valuesV": nurbs.knotsV
      }
    }
  else:
    return None

# Function to get surface mesh data.
def getSurfaceMeshData(mesh, meshId):
  # check and append ids.
  global meshIds
  if meshId in surfaceMeshIds:
    return None

  # append id.
  surfaceMeshIds.append(meshId)

  # return data.
  return {
    "_descriptioin": "mesh data",
    "id": meshId,
    "type": "surfaceMesh",
    "tolerance": 0.001,
    "nodes": {
      "count": len(mesh.nodeCoordinates),
      "points": mesh.nodeCoordinatesAsDouble,
      "normals": mesh.normalVectorsAsDouble
    },
    "facets": {
      "count": mesh.triangleCount,
      "indices": mesh.nodeIndices
    }
  }

# Function to get only nurbs curve 2D data.
def getCurve2DData(curve, curve2DId):
  # check and append ids.
  global curve2DIds
  if curve2DId in curve2DIds:
    return None

  # cast and reevaluate curve.
  if curve.curveType == adsk.core.Curve2DTypes.Line2DCurveType:
    line = adsk.core.Line2D.cast(curve)
    nurbs = line.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.Arc2DCurveType:
    arc = adsk.core.Arc2D.cast(curve)
    nurbs = arc.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.Circle2DCurveType:
    circle = adsk.core.Circle2D.cast(curve)
    nurbs = circle.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.Ellipse2DCurveType:
    ellipse = adsk.core.Ellipse2D.cast(curve)
    nurbs = ellipse.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.EllipticalArc2DCurveType:
    ellipticalArc = adsk.core.EllipticalArc2D.cast(curve)
    nurbs = ellipticalArc.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.NurbsCurve2DCurveType:
    nurbs = adsk.core.NurbsCurve2D.cast(curve)
  else:
    return None

  # append id.
  curve2DIds.append(curve2DId)

  # prepare points.
  points = []
  for p in nurbs.controlPoints:
    points.append(p.x)
    points.append(p.y)

  # return data.
  return {
    "_description": "nurbs data",
    "id": curve2DId,
    "type": "nurbs",
    "cardinal": 2,
    "degree": nurbs.degree,
    "poles": {
      "count": nurbs.controlPointCount,
      "points": points,
      "weights": []
    },
    "knot": {
      "count": nurbs.knotCount,
      "values": nurbs.knots
    }
  }

# Function to get only nurbs curve 2D data.
def getCurve2DMeshData(curve, curveId):
  # check and append ids.
  global curve2DMeshIds
  if curveId in curve2DMeshIds:
    return None

  # cast and reevaluate curve.
  if curve.curveType == adsk.core.Curve2DTypes.Line2DCurveType:
    line = adsk.core.Line2D.cast(curve)
    nurbs = line.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.Arc2DCurveType:
    arc = adsk.core.Arc2D.cast(curve)
    nurbs = arc.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.Circle2DCurveType:
    circle = adsk.core.Circle2D.cast(curve)
    nurbs = circle.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.Ellipse2DCurveType:
    ellipse = adsk.core.Ellipse2D.cast(curve)
    nurbs = ellipse.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.EllipticalArc2DCurveType:
    ellipticalArc = adsk.core.EllipticalArc2D.cast(curve)
    nurbs = ellipticalArc.asNurbsCurve
  elif curve.curveType == adsk.core.Curve2DTypes.NurbsCurve2DCurveType:
    nurbs = adsk.core.NurbsCurve2D.cast(curve)
  else:
    return None

  # append id.
  curve2DMeshIds.append(curveId)

  # evalute strokes.
  curveEvaluator = nurbs.evaluator
  tolerance = 0.001
  (ret, start, end) = curveEvaluator.getParameterExtents()
  (ret, pointsArray) = curveEvaluator.getStrokes(start, end, tolerance)

  # prepare points.
  points = []
  for p in pointsArray:
    points.append(p.x)
    points.append(p.y)

  # return data.
  return {
    "_description": "mesh data",
    "id": curveId,
    "type": "curveMesh",
    "cardinal": 2,
    "tolerance": tolerance,
    "nodes": {
      "count": len(pointsArray),
      "points": points
    },
  }

# Function to get only nurbs curve 3D data.
def getCurve3DData(curve, curve3DId):
  # check and append ids.
  global curve3DIds
  if curve3DId in curve3DIds:
    return None

  # cast and reevaluate curve.
  if curve.curveType == adsk.core.Curve3DTypes.Line3DCurveType:
    line = adsk.core.Line3D.cast(curve)
    nurbs = line.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.Arc3DCurveType:
    arc = adsk.core.Arc3D.cast(curve)
    nurbs = arc.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.Circle3DCurveType:
    circle = adsk.core.Circle3D.cast(curve)
    nurbs = circle.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.Ellipse3DCurveType:
    ellipse = adsk.core.Ellipse3D.cast(curve)
    nurbs = ellipse.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.EllipticalArc3DCurveType:
    ellipticalArc = adsk.core.EllipticalArc3D.cast(curve)
    nurbs = ellipticalArc.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.NurbsCurve3DCurveType:
    nurbs = adsk.core.NurbsCurve3D.cast(curve)
  else:
    return None

  # append id.
  curve3DIds.append(curve3DId)

  # prepare points.
  points = []
  for p in nurbs.controlPoints:
    points.append(p.x)
    points.append(p.y)
    points.append(p.z)

  # return data.
  return {
    "_description": "nurbs data",
    "id": curve3DId,
    "type": "nurbs",
    "cardinal": 3,
    "degree": nurbs.degree,
    "poles": {
      "count": nurbs.controlPointCount,
      "points": points,
      "weights": []
    },
    "knots": {
      "count": nurbs.knotCount,
      "values": nurbs.knots
    }
  }

# Function to get only nurbs curve 3D data.
def getCurve3DMeshData(curve, curveId):
  # check and append ids.
  global curve3DMeshIds
  if curveId in curve3DMeshIds:
    return None

  # cast and reevaluate curve.
  if curve.curveType == adsk.core.Curve3DTypes.Line3DCurveType:
    line = adsk.core.Line3D.cast(curve)
    nurbs = line.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.Arc3DCurveType:
    arc = adsk.core.Arc3D.cast(curve)
    nurbs = arc.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.Circle3DCurveType:
    circle = adsk.core.Circle3D.cast(curve)
    nurbs = circle.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.Ellipse3DCurveType:
    ellipse = adsk.core.Ellipse3D.cast(curve)
    nurbs = ellipse.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.EllipticalArc3DCurveType:
    ellipticalArc = adsk.core.EllipticalArc3D.cast(curve)
    nurbs = ellipticalArc.asNurbsCurve
  elif curve.curveType == adsk.core.Curve3DTypes.NurbsCurve3DCurveType:
    nurbs = adsk.core.NurbsCurve3D.cast(curve)
  else:
    return None

  # append id.
  curve3DMeshIds.append(curveId)

  # evalute strokes.
  curveEvaluator = nurbs.evaluator
  tolerance = 0.001
  (ret, start, end) = curveEvaluator.getParameterExtents()
  (ret, pointsArray) = curveEvaluator.getStrokes(start, end, tolerance)

  # prepare points.
  points = []
  for p in pointsArray:
    points.append(p.x)
    points.append(p.y)
    points.append(p.z)

  # return data.
  return {
    "_description": "mesh data",
    "id": curveId,
    "type": "curveMesh",
    "cardinal": 3,
    "tolerance": 0,
    "nodes": {
      "count": len(pointsArray),
      "points": points
    },
  }

# Function to get point data.
def getPointData(point, pointId):
  # check and append ids.
  global pointIds
  if pointId in pointIds:
    return None
  pointIds.append(pointId)

  # return data.
  return {
    "_descriptioin": "point data",
    "id": pointId,
    "cardinal": 3,
    "point": [point.x, point.y, point.z]
  }

# Main entry point
def run(context):
    ui = None
    try:
        # Open serialization file.
        ft = open("t", "w+")
        fs = open("s", "w+")
        fc = open("c", "w+")
        fp = open("p", "w+")
        fm = open("m", "w+")

        # Get the active app.
        app = adsk.core.Application.get()

        # Get the ui.
        ui  = app.userInterface

        # Get the active design.
        design = app.activeProduct

        # Get the root compoment.
        root = adsk.fusion.Component.cast(design.rootComponent)

        # Get component name.
        visName = root.name.replace(' ', '') + '.vis'

        # Get the occurrences.
        occs = root.occurrences

        # Get topology data.
        [topology, surfaces, curves, points, meshes] = getTopologyData(occs)

        # Write json data.
        output = json.dumps(topology, indent=2, separators=(',',': '), sort_keys=True)
        ft.write(output)
        output = json.dumps(surfaces, indent=2, separators=(',',': '), sort_keys=True)
        fs.write(output)
        output = json.dumps(curves, indent=2, separators=(',',': '), sort_keys=True)
        fc.write(output)
        output = json.dumps(points, indent=2, separators=(',',': '), sort_keys=True)
        fp.write(output)
        output = json.dumps(meshes, indent=2, separators=(',',': '), sort_keys=True)
        fm.write(output)

        # Close serialization file.
        ft.close()
        fs.close()
        fc.close()
        fp.close()
        fm.close()

        # create zip file.
        if os.path.isfile(visName):
          os.remove(visName)
        compression = zipfile.ZIP_DEFLATED
        vis = zipfile.ZipFile(visName, mode="w")
        vis.write("t", compress_type=compression)
        vis.write("s", compress_type=compression)
        vis.write("c", compress_type=compression)
        vis.write("p", compress_type=compression)
        vis.write("m", compress_type=compression)
        vis.close()

        # move files.
        visName1 = "c:\\temp\\" + visName
        if os.path.isfile(visName1):
          os.remove(visName1)
        os.rename(visName, visName1)
        os.remove("t")
        os.remove("s")
        os.remove("c")
        os.remove("p")
        os.remove("m")

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))
