#Author-
#Description-

import adsk.core, adsk.fusion, adsk.cam, traceback

def run(context):
    ui = None
    try:
        # Create geometry object.
        #data = object()

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

        # Get the occs information
        faceCount = 0
        for occIndex in range(0, occs.count):
          occ = occs.item(occIndex)
          for bodyIndex in range(0, occ.bRepBodies.count):
            body = occ.bRepBodies.item(bodyIndex)
            for lumpIndex in range(0, body.lumps.count):
                lump = body.lumps.item(lumpIndex)
                for shellIndex in range(0, lump.shells.count):
                  shell = lump.shells.item(shellIndex)
                  for faceIndex in range(0, shell.faces.count):
                    faceCount += 1

        # Print face count.
          ui.messageBox("Face count = " + str(faceCount))

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))
