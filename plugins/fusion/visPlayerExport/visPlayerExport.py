#Author-
#Description-

import adsk.core, adsk.fusion, adsk.cam, traceback
import json

# Function to get topology data
def getTopologyData(occs):
  # Create objects.
  topology = []
  surfaces = []
  curves = []
  points = []

  # Save data
  for occ in occs:
    for body in occ.bRepBodies:
      # prepare body data.
      bodyData = {
        "_description":  "body data",
        "id": id(body),
        "type": "body",
        "shells": []
      }

      # append data.
      topology.append(bodyData)
      lump = body.lumps.item(0)
      for shell in lump.shells:
        # prepare shell data.
        shellData = {
          "_description": "shell data",
          "id": id(shell),
          "bodyId": id(body),
          "type": "shell",
          "faces": []
        }

        # append data.
        bodyData["shells"].append(shellData)
        for face in shell.faces:
          # prepare face data.
          faceData = {
            "_description": "face data",
            "id": id(face),
            "shellId": id(shell),
            "surfaceId": id(face.geometry),
            "type": "face",
            "loops": []
          }

          # append data.
          shellData["faces"].append(faceData)
          surfaceData = getSurfaceData(face.geometry)
          surfaces.append(surfaceData)
          for loop in face.loops:
            # prepare loop data.
            loopData = {
              "_description": "loop data",
              "id": id(loop),
              "faceId": id(face),
              "type": "loop",
              "uvedges": []
            }
            faceData["loops"].append(loopData)
            for uvedge in loop.coEdges:
              # prepare uvedge data.
              uvedgeData = {
                "_description": "uvedge data",
                "id": id(uvedge),
                "loopId": id(loop),
                "curveId": id(uvedge.geometry),
                "type": "uvedge"
              }

              # prepare edge data.
              edge = uvedge.edge
              edgeData = {
                "_description": "edge data",
                "id": id(edge),
                "uvedgeId": id(uvedge),
                "curveId": id(edge.geometry),
                "type": "edge"
              }

              # prepare start vertex data.
              startVertex = edge.startVertex
              startVertexData = {
                "_description": "vertex data",
                "id": id(startVertex),
                "edgeId": id(edge),
                "pointId": id(startVertex.geometry),
                "type": "vertex"
              }

              # prepare end vertex data.
              endVertex = edge.endVertex
              endVertexData = {
                "_description": "vertex data",
                "id": id(endVertex),
                "edgeId": id(edge),
                "pointId": id(endVertex.geometry),
                "type": "vertex"
              }

              # append data.
              edgeData['startVertex'] = startVertexData
              edgeData['endVertex'] = endVertexData
              uvedgeData['edge'] = edgeData
              loopData["uvedges"].append(uvedgeData)
              curveData = getCurve2DData(uvedge.geometry)
              curves.append(curveData)
              curveData = getCurve3DData(uvedge.edge.geometry)
              curves.append(curveData)
              pointData = getPointData(uvedge.edge.startVertex.geometry)
              points.append(pointData)
              pointData = getPointData(uvedge.edge.endVertex.geometry)
              points.append(pointData)

  # Return object.
  return topology, surfaces, curves, points

# Function to get surface data.
def getSurfaceData(surface):
  if surface.surfaceType == adsk.core.SurfaceTypes.PlaneSurfaceType:
    # cast surface.
    plane = adsk.core.Plane.cast(surface)

    # return data.
    return {
      "_description": "plane data",
      "id": id(surface),
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
      "id": id(surface),
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
      "id": id(surface),
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
      "id": id(surface),
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
      "id": id(surface),
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
      "id": id(surface),
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
      "id": id(surface),
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
      "id": id(surface),
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
def getCurve2DData(curve):
  if curve.curveType == adsk.core.Curve2DTypes.Line2DCurveType:
    # cast curve.
    line = adsk.core.Line2D.cast(curve)

    # return data.
    return {
      "_description": "line data",
      "id": id(curve),
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
      "id": id(curve),
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
      "id": id(curve),
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
      "id": id(curve),
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
      "id": id(curve),
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
      "id": id(curve),
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
def getCurve3DData(curve):
  if curve.curveType == adsk.core.Curve3DTypes.Line3DCurveType:
    # cast curve.
    line = adsk.core.Line3D.cast(curve)

    # return data.
    return {
      "_description": "line data",
      "id": id(curve),
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
      "id": id(curve),
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
      "id": id(curve),
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
      "id": id(curve),
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
      "id": id(curve),
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
      "id": id(curve),
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
def getPointData(point):
  # return data.
  return {
    "_descriptioin": "point data",
    "id": id(point),
    "cardinal": 3,
    "point": [point.x, point.y, point.z]
  }

# Main entry point
def run(context):
    ui = None
    try:
        # Open serialization file.
        ft = open("c:\\temp\\t.vis", "w+")
        fs = open("c:\\temp\\s.vis", "w+")
        fc = open("c:\\temp\\c.vis", "w+")
        fp = open("c:\\temp\\p.vis", "w+")

        # Get the active app.
        app = adsk.core.Application.get()

        # Get the ui.
        ui  = app.userInterface

        # Get the active design.
        design = app.activeProduct

        # Get the root compoment.
        root = design.rootComponent

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

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))
