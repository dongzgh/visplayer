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
      bodyData = {
        "_description":  "body data",
        "id": id(body),
        "type": "body",
        "shells": []
      }
      topology.append(bodyData)
      lump = body.lumps.item(0)
      for shell in lump.shells:
        shellData = {
          "_description": "shell data",
          "id": id(shell),
          "bodyId": id(body),
          "type": "shell",
          "faces": []
        }
        bodyData["shells"].append(shellData)
        for face in shell.faces:
          faceData = {
            "_description": "face data",
            "id": id(face),
            "shellId": id(shell),
            "surfaceId": id(face.geometry),
            "type": "face",
            "loops": []
          }
          shellData["faces"].append(faceData)
          surfaceData = getSurfaceData(face.geometry)
          surfaces.append(surfaceData)
          for loop in face.loops:
            loopData = {
              "_description": "loop data",
              "id": id(loop),
              "faceId": id(face),
              "type": "loop",
              "uvedges": []
            }
            faceData["loops"].append(loopData)
            for uvedge in loop.coEdges:
              uvedgeData = {
                "_description": "uvedge data",
                "id": id(uvedge),
                "loopId": id(loop),
                "curveId": id(uvedge.geometry),
                "type": "uvedge",
                "edge": {
                  "_description": "edge data",
                  "id": id(uvedge.edge),
                  "uvedgeId": id(uvedge),
                  "curveId": id(uvedge.edge.geometry),
                  "type": "edge",
                  "startVertex": {
                    "_description": "vertex data",
                    "id": id(uvedge.edge.startVertex),
                    "edgeId": id(uvedge.edge),
                    "pointId": id(uvedge.edge.startVertex.geometry),
                    "type": "vertex"
                  },
                  "endVertex": {
                    "_description": "vertex data",
                    "id": id(uvedge.edge.endVertex),
                    "edgeId": id(uvedge.edge),
                    "pointId": id(uvedge.edge.endVertex.geometry),
                    "type": "vertex"
                  }
                }
              }
              loopData["uvedges"].append(uvedgeData)
              curveData = getCurveData(uvedge.geometry)
              curves.append(curveData)
              curveData = getCurveData(uvedge.edge.geometry)
              curves.append(curveData)
              pointData = getPointData(uvedge.edge.startVertex)
              points.append(pointData)
              pointData = getPointData(uvedge.edge.endVertex)
              points.append(pointData)

  # Return object.
  return topology

# Function to get surface data.
def getSurfaceData(surface):
  if surface.surfaceType == adsk.core.SurfaceTypes.PlaneSurfaceType:
    plane = adsk.core.Plane.cast(surface)
    return {
      "_description": "plane data",
      "id": id(surface),
      "type": "plane",
      "origin": [plane.origin.x, plane.origin.y, plane.origin.z],
      "normal": [plane.normal.x, plane.normal.y, plane.normal.z],
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.CylinderSurfaceType:
    cylinder = adsk.core.Cylinder.cast(surface)
    return {
      "_description": "cylinder data",
      "id": id(surface),
      "type": "cylinder",
      "origin": [cylinder.origin.x, cylinder.origin.y, cylinder.origin.z],
      "normal": [cylinder.axis.x, cylinder.axis.y, cylinder.axis.z],
      "radius": cylinder.radius
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.ConeSurfaceType:
    cone = adsk.core.Cone.cast(surface)
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
    sphere = adsk.core.Sphere.cast(surface)
    return {
      "_description": "sphere data",
      "id": id(surface),
      "type": "sphere",
      "origin": [sphere.origin.x, sphere.origin.y, sphere.origin.z],
      "radius": sphere.radius
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.TorusSurfaceType:
    torus = adsk.core.Torus.cast(surface)
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
    ellipticalCylinder = adsk.core.EllipticalCylinder.cast(surface)
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
    ellipticalCone = adsk.core.EllipticalCone.cast(surface)
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
    nurbs = adsk.core.NurbsSurface.cast(surface)
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
        "points": nurbs.controlPoints, # need calculation
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
def getCurveData(curve):
  if curve.curveType == adsk.core.Curve2DTypes.Line2DCurveType:
    line = adsk.core.Line2D.cast(curve)
    return {
      "_description": "line data",
      "id": id(curve),
      "type": "line",
      "cardinal": 2,
      "start": [line.startPoint.x, line.startPoint.y],
      "end": [line.endPoint.x, line.endPoint.y]
    }
  elif curve.curveType == adsk.core.Curve3DTypes.Line3DCurveType:
    line = adsk.core.Line3D.cast(curve)
    return {
      "_description": "line data",
      "id": id(curve),
      "type": "line",
      "cardinal": 3,
      "start": [line.startPoint.x, line.startPoint.y, line.startPoint.z],
      "end": [line.endPoint.x, line.endPoint.y, line.endPoint.z]
    }
  elif curve.curveType == adsk.core.Curve2DTypes.Arc2DCurveType:
    arc = adsk.core.Arc2D.cast(curve)
    return {
      "_description": "arc data",
      "id": id(curve),
      "type": "arc",
      "cardinal": 2, 
      "center": [arc.center.x, arc.center.y],
      "radius": arc.radius,
      "orientation": arc.startPoint, # needs calculation
      "angles": {
        "start": arc.startAngle,
        "end": arc.endAngle
      }
    }
  elif curve.curveType == adsk.core.Curve3DTypes.Arc3DCurveType:
    arc = adsk.core.Arc3D.cast(curve)
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
  elif curve.curveType == adsk.core.Curve2DTypes.Circle2DCurveType:
    circle = adsk.core.Circle2D.cast(curve)
    return {
      "_description": "circle data",
      "id": id(curve),
      "type": "circle",
      "cardinal": 2,
      "center": [circle.center.x, circle.center.y],
      "radius": circle.radius
    }
  elif curve.curveType == adsk.core.Curve3DTypes.Circle3DCurveType:
    circle = adsk.core.Circle3D.cast(curve)
    return {
      "_description": "circle data",
      "id": id(curve),
      "type": "circle",
      "cardinal": 3,
      "center": [circle.center.x, circle.center.y, circle.center.z],
      "normal": [circle.normal.x, circle.normal.y, circle.normal.z],
      "radius": circle.radius
    }
  elif curve.curveType == adsk.core.Curve2DTypes.Ellipse2DCurveType:
    ellipse = adsk.core.Ellipse2D.cast(curve)
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
  elif curve.curveType == adsk.core.Curve3DTypes.Ellipse3DCurveType:
    ellipse = adsk.core.Ellipse3D.cast(curve)
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
  elif curve.curveType == adsk.core.Curve2DTypes.EllipticalArc2DCurveType:
    ellipticalArc = adsk.core.EllipticalArc2D.cast(curve)
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
  elif curve.curveType == adsk.core.Curve3DTypes.EllipticalArc3DCurveType:
    ellipticalArc = adsk.core.EllipticalArc3D.cast(curve)
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
  elif curve.curveType == adsk.core.Curve2DTypes.NurbsCurve2DCurveType:
    nurbs = adsk.core.NurbsCurve2D.cast(curve)
    return {
      "_description": "nurbs data",
      "id": id(curve),
      "type": "nurbs",
      "cardinal": 2,
      "degree": nurbs.degree,
      "poles": {
        "count": nurbs.controlPointCount,
        "points": nurbs.controlPoints, # needs calculation
        "weights": []
      },
      "knot": {
        "count": nurbs.knotCount,
        "values": nurbs.knots
      }
    }
  elif curve.curveType == adsk.core.Curve3DTypes.NurbsCurve3DCurveType:
    nurbs = adsk.core.NurbsCurve3D.cast(curve)
    return {
      "_description": "nurbs data",
      "id": id(curve),
      "type": "nurbs",
      "cardinal": 3,
      "degree": nurbs.degree,
      "poles": {
        "count": nurbs.controlPointCount,
        "points": nurbs.controlPoints, # needs calculation
        "weights": []
      },
      "knots": {
        "count": nurbs.knotCount,
        "values": nurbs.knots
      }
    }
   
# Function to get surface data.
def getPointData(point):
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
        output = json.dumps(topology, indent=2, separators=(',', ': '))
        ft.write(output)
        output = json.dumps(surfaces, indent=2, separators=(',', ': '))
        fs.write(output)
        output = json.dumps(curves, indent=2, separators=(',', ': '))
        fc.write(output)
        output = json.dumps(points, indent=2, separators=(',', ': '))
        fp.write(output)

        # Close serialization file.
        ft.close()
        fs.close()
        fc.close()
        fp.close()

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))
