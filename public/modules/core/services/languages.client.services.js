'use strict';

//Files service used to communicate languages REST endpoints
angular.module('core').service('Languages', [
  function() {
    this.code = 'eng';
    this.localization = function (language) {
      let code = 'eng';
      if(language !== undefined)
        code = language;
      switch (code) {
        case 'eng':
          return {
            sidebar: {
              files: 'List of files',
              scene: 'List of scene objects',
              modeling: 'List of modeling tools' 
            },
            files: {
              upload: 'Upload files to server',
              download: 'Download files from server',
              load: 'Load files into scene',
              delete: 'Delete files from server'
            },
            scene: {
              snapshot: 'Take a snapshot of scene',
              delete: 'Delete objects from scene'
            },
            modeling: {
              viewFit: 'Fit view',
              viewTop: 'Top view',
              viewBottom: 'Bottom view',
              viewLeft: 'Left view',
              viewRight: 'Right view',
              viewFront: 'Front view',
              viewBack: 'Back view',
              viewClear: 'Clear view',
              pickModel: 'Pick model',
              pickFace: 'Pick face',
              pickEdge: 'Pick edge',
              pickCurve: 'Pick curve',
              pickPoint: 'Pick point',
              displayShaded: 'Shaded display',
              displayRendered: 'Rendered display',
              displayAnalysis: 'Analysis display',
              displayMesh: 'Mesh display',
              displayWireframe: 'Wireframe display',
              transform: 'Transform model'
            },
            dialogTransform: {
              pickModel: 'Pick a model',
              modeTranslate: 'Translate',
              modeRotate: 'Rotate',
              undo: 'Undo',
              ok: 'OK',
              cancel: 'Cancel'
            }
          };
        default:
          return undefined;
      }
    };
  }
]);
