#Author-
#Description-

import adsk.core, adsk.fusion, adsk.cam, traceback
import json

# Function to get topology data
def getTData(occs):
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
          surfaceData = getSData(face.geometry)
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
#              curveData = getCData(uvedge.geometry)
#              curves.append(curveData)
#              curveData = getCData(uvedge.edge.geometry)
#              curves.append(curveData)
#              pointData = getPData(uvedge.edge.startVertex)
#              points.append(pointData)
#              pointData = getPData(uvedge.edge.endVertex)
#              points.append(pointData)

  # Return object.
  return topology

# Function to get surface data.
def getSData(surface):
  if surface.surfaceType == adsk.core.SurfaceTypes.PlaneSurfaceType:
    plane = adsk.core.Plane.cast(surface)
    return {
      "_description": "plane data",
      "id": id(surface),
      "type": "plane",
      "origin": plane.origin,
      "normal": plane.normal,
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.CylinderSurfaceType:
    cylinder = adsk.core.Cylinder.cast(surface)
    return {
      "_description": "cylinder data",
      "id": id(surface),
      "type": "cylinder",
      "origin": cylinder.origin,
      "normal": cylinder.axis,
      "radius": cylinder.radius
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.ConeSurfaceType:
    cone = adsk.core.Cone.cast(surface)
    return {
      "_description": "cone data",
      "id": id(surface),
      "type": "cone",
      "origin": cone.origin,
      "normal": cone.axis,
      "radius": cone.radius,
      "angle": cone.halfAngle
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.SphereSurfaceType:
    sphere = adsk.core.Sphere.cast(surface)
    return {
      "_description": "sphere data",
      "id": id(surface),
      "type": "sphere",
      "origin": sphere.origin,
      "radius": sphere.radius
    }
  elif surface.surfaceType == adsk.core.SurfaceTypes.TorusSurfaceType:
    torus = adsk.core.Torus.cast(surface)
    return {
      "_description": "torus data",
      "id": id(surface),
      "type": "torus",
      "origin": torus.origin,
      "normal": torus.axis,
      "radius": {
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
      "origin": ellipticalCylinder.origin,
      "normal": ellipticalCylinder.axis,
      "orientation": ellipticalCylinder.majorAxis,
      "radius": {
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
      "origin": ellipticalCone.origin,
      "normal": ellipticalCone.axis,
      "orientation": ellipticalCone.majorAxis,
      "radius": {
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
      "pole": {
        "u": nurbs.controlPointCountU,
        "v": nurbs.controlPointCountV,
        "ps": nurbs.controlPoints,
        "ws": []
      },
      "knot": {
        "u": nurbs.knotCountU,
        "v": nurbs.knotCountV,
        "us": nurbs.knotsU,
        "vs": nurbs.knotsV
      }
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
        [topology, surfaces, curves, points] = getTData(occs)

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
