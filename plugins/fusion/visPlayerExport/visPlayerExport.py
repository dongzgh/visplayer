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
curve2DIds = []
curve3DIds = []
pointIds = []

# Function to get topology data
def getTopologyData(occs):
  # Create objects.
  topology = []
  surfaces = []
  curves = []
  points = []

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
            "type": "face",
            "loops": []
          }

          # append data.
          shellData["faces"].append(faceData)
          surfaceData = getSurfaceData(face.geometry, face.tempId)
          surfaces.append(surfaceData)
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
                "type": "uvedge"
              }

              # prepare edge data.
              edge = uvedge.edge
              edgeData = {
                "_description": "edge data",
                "id": edge.tempId,
                "uvedgeId": idUVEdge,
                "curveId": edge.tempId,
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
              curve3DData = getCurve3DData(uvedge.edge.geometry, uvedge.edge.tempId)
              if curve3DData != None:
                curves.append(curve3DData)
              pointData = getPointData(uvedge.edge.startVertex.geometry, uvedge.edge.startVertex.tempId)
              if pointData != None:
                points.append(pointData)
              pointData = getPointData(uvedge.edge.endVertex.geometry, uvedge.edge.endVertex.tempId)
              if pointData != None:
                points.append(pointData)

  # Return object.
  return topology, surfaces, curves, points

# Function to get surface data.
def getSurfaceData(surface, surfaceId):
  # check and append ids.
  global surfaceIds
  if surfaceId in surfaceIds:
    return None
  surfaceIds.append(surfaceId)

  # return based on surface type.
  if surface.surfaceType == adsk.core.SurfaceTypes.PlaneSurfaceType:
    # cast surface.
    plane = adsk.core.Plane.cast(surface)

    # return data.
    return {
      "_description": "plane data",
      "id": surfaceId,
      "type": "plane",
      "origin": [plane.origin.x, plane.origin.y, plane.origin.z],
      "normal": [plane.normal.x, plane.normal.y, plane.normal.z],
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.CylinderSurfaceType:
    # cast surface.
    cylinder = adsk.core.Cylinder.cast(surface)

    # return data.
    return {
      "_description": "cylinder data",
      "id": surfaceId,
      "type": "cylinder",
      "origin": [cylinder.origin.x, cylinder.origin.y, cylinder.origin.z],
      "normal": [cylinder.axis.x, cylinder.axis.y, cylinder.axis.z],
      "radius": cylinder.radius
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.ConeSurfaceType:
    # cast surface.
    cone = adsk.core.Cone.cast(surface)

    # return data.
    return {
      "_description": "cone data",
      "id": surfaceId,
      "type": "cone",
      "origin": [cone.origin.x, cone.origin.y, cone.origin.z],
      "normal": [cone.axis.x, cone.axis.y, cone.axis.z],
      "radius": cone.radius,
      "angle": cone.halfAngle
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.SphereSurfaceType:
    # cast surface.
    sphere = adsk.core.Sphere.cast(surface)

    # return data.
    return {
      "_description": "sphere data",
      "id": surfaceId,
      "type": "sphere",
      "origin": [sphere.origin.x, sphere.origin.y, sphere.origin.z],
      "radius": sphere.radius
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.TorusSurfaceType:
    # cast surface.
    torus = adsk.core.Torus.cast(surface)

    # return data.
    return {
      "_description": "torus data",
      "id": surfaceId,
      "type": "torus",
      "origin": [torus.origin.x, torus.origin.y, torus.origin.z],
      "normal": [torus.axis.x, torus.axis.y, torus.axis.z],
      "radii": {
        "major": torus.majorRadius,
        "minor": torus.minorRadius
      }
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.EllipticalCylinderSurfaceType:
    # cast surface.
    ellipticalCylinder = adsk.core.EllipticalCylinder.cast(surface)

    # return data.
    return {
      "_description": "elliptical cylinder data",
      "id": surfaceId,
      "type": "ellipticalCylinder",
      "origin": [ellipticalCylinder.origin.x, ellipticalCylinder.origin.y, ellipticalCylinder.origin.z],
      "normal": [ellipticalCylinder.axis.x, ellipticalCylinder.axis.y, ellipticalCylinder.axis.z],
      "orientation": [ellipticalCylinder.majorAxis.x, ellipticalCylinder.majorAxis.y, ellipticalCylinder.majorAxis.z],
      "radii": {
        "major": ellipticalCylinder.majorRadius,
        "minor": ellipticalCylinder.minorRadius
      }
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.EllipticalConeSurfaceType:
    # cast surface.
    ellipticalCone = adsk.core.EllipticalCone.cast(surface)

    # return data.
    return {
      "_description": "elliptical cone data",
      "id": surfaceId,
      "type": "ellipticalCone",
      "origin": [ellipticalCone.origin.x, ellipticalCone.origin.y, ellipticalCone.origin.z],
      "normal": [ellipticalCone.axis.x, ellipticalCone.axis.y, ellipticalCone.axis.z],
      "orientation": [ellipticalCone.majorAxis.x, ellipticalCone.majorAxis.y, ellipticalCone.majorAxis.z],
      "radii": {
        "major": ellipticalCone.majorRadius,
        "minor": ellipticalCone.minorRadius
      },
      "angle": ellipticalCone.halfAngle,
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.NurbsSurfaceType:
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

# Get curve data.
def getCurve2DData(curve, curve2DId):
  # check and append ids.
  global curve2DIds
  if curve2DId in curve2DIds:
    return None
  curve2DIds.append(curve2DId)

  # return based on curve type.
  if curve.curveType == adsk.core.Curve2DTypes.Line2DCurveType:
    # cast curve.
    line = adsk.core.Line2D.cast(curve)

    # return data.
    return {
      "_description": "line data",
      "id": curve2DId,
      "type": "line",
      "cardinal": 2,
      "start": [line.startPoint.x, line.startPoint.y],
      "end": [line.endPoint.x, line.endPoint.y]
    }
  elif curve.curveType == adsk.core.Curve2DTypes.Arc2DCurveType:
    # cast curve.
    arc = adsk.core.Arc2D.cast(curve)

    # return data.
    return {
      "_description": "arc data",
      "id": curve2DId,
      "type": "arc",
      "cardinal": 2,
      "center": [arc.center.x, arc.center.y],
      "radius": arc.radius,
      "orientation": [1.0, 0.0],
      "angles": {
        "start": arc.startAngle,
        "end": arc.endAngle
      }
    }
  elif curve.curveType == adsk.core.Curve2DTypes.Circle2DCurveType:
    # cast curve.
    circle = adsk.core.Circle2D.cast(curve)

    # return data.
    return {
      "_description": "circle data",
      "id": curve2DId,
      "type": "circle",
      "cardinal": 2,
      "center": [circle.center.x, circle.center.y],
      "radius": circle.radius
    }
  elif curve.curveType == adsk.core.Curve2DTypes.Ellipse2DCurveType:
    # cast curve.
    ellipse = adsk.core.Ellipse2D.cast(curve)

    # return data.
    return {
      "_description": "ellipse data",
      "id": curve2DId,
      "type": "ellipse",
      "cardinal": 2,
      "center": [ellipse.center.x, ellipse.center.y],
      "orientation": [ellipse.majorAxis.x, ellipse.majorAxis.y],
      "radii": {
        "major": ellipse.majorRadius,
        "minor": ellipse.minorRadius
      }
    }
  elif curve.curveType == adsk.core.Curve2DTypes.EllipticalArc2DCurveType:
    # cast curve.
    ellipticalArc = adsk.core.EllipticalArc2D.cast(curve)

    # return data.
    return {
      "_description": "elliptical arc data",
      "id": curve2DId,
      "type": "ellipticalArc",
      "cardinal": 2,
      "center": [ellipticalArc.center.x, ellipticalArc.center.y],
      "orientation": [ellipticalArc.majorAxis.x, ellipticalArc.majorAxis.y],
      "radii": {
        "major": ellipticalArc.majorRadius,
        "minor": ellipticalArc.minorRadius
      },
      "angles": {
        "start": ellipticalArc.startAngle,
        "end": ellipticalArc.endAngle
      }
    }
  elif curve.curveType == adsk.core.Curve2DTypes.NurbsCurve2DCurveType:
    # cast curve.
    nurbs = adsk.core.NurbsCurve2D.cast(curve)

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

# Get curve data.
def getCurve3DData(curve, curve3DId):
  # check and append ids.
  global curve3DIds
  if curve3DId in curve3DIds:
    return None
  curve3DIds.append(curve3DId)

  # return based on curve type.
  if curve.curveType == adsk.core.Curve3DTypes.Line3DCurveType:
    # cast curve.
    line = adsk.core.Line3D.cast(curve)

    # return data.
    return {
      "_description": "line data",
      "id": curve3DId,
      "type": "line",
      "cardinal": 3,
      "start": [line.startPoint.x, line.startPoint.y, line.startPoint.z],
      "end": [line.endPoint.x, line.endPoint.y, line.endPoint.z]
    }
  elif curve.curveType == adsk.core.Curve3DTypes.Arc3DCurveType:
    # cast curve.
    arc = adsk.core.Arc3D.cast(curve)

    # return data.
    return {
      "_description": "arc data",
      "id": curve3DId,
      "type": "arc",
      "cardinal": 3,
      "center": [arc.center.x, arc.center.y, arc.center.z],
      "normal": [arc.normal.x, arc.normal.y, arc.normal.z],
      "radius": arc.radius,
      "orientation": [arc.referenceVector.x, arc.referenceVector.y, arc.referenceVector.z],
      "angles": {
        "start": arc.startAngle,
        "end": arc.endAngle
      }
    }
  elif curve.curveType == adsk.core.Curve3DTypes.Circle3DCurveType:
    # cast curve.
    circle = adsk.core.Circle3D.cast(curve)

    # return data.
    return {
      "_description": "circle data",
      "id": curve3DId,
      "type": "circle",
      "cardinal": 3,
      "center": [circle.center.x, circle.center.y, circle.center.z],
      "normal": [circle.normal.x, circle.normal.y, circle.normal.z],
      "radius": circle.radius
    }
  elif curve.curveType == adsk.core.Curve3DTypes.Ellipse3DCurveType:
    # cast curve.
    ellipse = adsk.core.Ellipse3D.cast(curve)

    # return data.
    return {
      "_description": "ellipse data",
      "id": curve3DId,
      "type": "ellipse",
      "cardinal": 3,
      "center": [ellipse.center.x, ellipse.center.y, ellipse.center.z],
      "normal": [ellipse.normal.x, ellipse.normal.y, ellipse.normal.z],
      "orientation": [ellipse.majorAxis.x, ellipse.majorAxis.y, ellipse.majorAxis.z],
      "radii": {
        "major": ellipse.majorRadius,
        "minor": ellipse.minorRadius
      }
    }
  elif curve.curveType == adsk.core.Curve3DTypes.EllipticalArc3DCurveType:
    # cast curve.
    ellipticalArc = adsk.core.EllipticalArc3D.cast(curve)

    # return data.
    return {
      "_description": "elliptical arc data",
      "id": curve3DId,
      "type": "ellipticalArc",
      "cardinal": 3,
      "center": [ellipticalArc.center.x, ellipticalArc.center.y, ellipticalArc.center.z],
      "normal": [ellipticalArc.normal.x, ellipticalArc.normal.y, ellipticalArc.normal.z],
      "orientation": [ellipticalArc.majorAxis.x, ellipticalArc.majorAxis.y, ellipticalArc.majorAxis.z],
      "radii": {
        "major": ellipticalArc.majorRadius,
        "minor": ellipticalArc.minorRadius
      },
      "angles": {
        "start": ellipticalArc.startAngle,
        "end": ellipticalArc.endAngle
      }
    }
  elif curve.curveType == adsk.core.Curve3DTypes.NurbsCurve3DCurveType:
    # cast curve.
    nurbs = adsk.core.NurbsCurve3D.cast(curve)

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

# Function to get surface data.
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

        # Get the active app.
        app = adsk.core.Application.get()

        # Get the ui.
        ui  = app.userInterface

        # Get the active design.
        design = app.activeProduct

        # Get the root compoment.
        root = adsk.fusion.Component.cast(design.rootComponent)

        # Get component name.
        visName = root.name + '.vis'

        # Get the occurrences.
        occs = root.occurrences

        # Get topology data.
        [topology, surfaces, curves, points] = getTopologyData(occs)

        # Write json data.
        output = json.dumps(topology, indent=2, separators=(',',': '), sort_keys=True)
        ft.write(output)
        output = json.dumps(surfaces, indent=2, separators=(',',': '), sort_keys=True)
        fs.write(output)
        output = json.dumps(curves, indent=2, separators=(',',': '), sort_keys=True)
        fc.write(output)
        output = json.dumps(points, indent=2, separators=(',',': '), sort_keys=True)
        fp.write(output)

        # Close serialization file.
        ft.close()
        fs.close()
        fc.close()
        fp.close()

        # create zip file.
        if os.path.isfile(visName):
          os.remove(visName)
        compression = zipfile.ZIP_DEFLATED
        vis = zipfile.ZipFile(visName, mode="w")
        vis.write("t", compress_type=compression)
        vis.write("s", compress_type=compression)
        vis.write("c", compress_type=compression)
        vis.write("p", compress_type=compression)
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

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))
