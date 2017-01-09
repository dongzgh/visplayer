'use strict';

// Configuring the Slides module
angular.module('slides').run(['Menus', 'Tools', 'Trees', 'Dialogs',
  function(Menus, Tools, Trees, Dialogs) {
    // Adding tools
    Tools.addTool('sidebar');
    Tools.addTool('files');
    Tools.addTool('scene');
    Tools.addTool('modeling');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'Files', 'icon-files', 'slides/edit/files', null, 'List of files');    
    Tools.addToolItem('sidebar', 'Scene', 'icon-scenes', 'slides/edit/scene', null, 'List of scene objects');
    Tools.addToolItem('sidebar', 'Modeling', 'icon-tools', 'slides/edit/modeling', null, 'List of modeling tools');
    

    // Set files tool items
    Tools.addToolItem('files', 'Upload Files', 'icon-cloud-upload', null, 'uploadFiles', 'Upload files to server');
    Tools.addToolItem('files', 'Download Files', 'icon-cloud-download', null, 'downloadFiles', 'Download files from server');
    Tools.addToolItem('files', 'Load Files', 'icon-load', null, 'loadFiles', 'Load files into scene');
    Tools.addToolItem('files', 'Delete Files', 'icon-delete', null, 'deleteFiles', 'Delete files from server');

    // Set scene tool items
    Tools.addToolItem('scene', 'Take Snapshot', 'icon-snapshot', null, 'takeSnapshot', 'Take a snapshot for the scene');
    Tools.addToolItem('scene', 'Remove Objects', 'icon-delete', null, 'removeObjects', 'Remove objects from scene');

    // Set modeling tool items
    Tools.addToolItem('modeling', 'Fit View', 'icon-view-fit', null, 'fitView', 'Fit view');
    Tools.addToolItem('modeling', 'Top View', 'icon-view-top', null, 'topView', 'View scene from top');
    Tools.addToolItem('modeling', 'Bottom View', 'icon-view-bottom', null, 'bottomView', 'View scene from bottom');
    Tools.addToolItem('modeling', 'Left View', 'icon-view-left', null, 'leftView', 'View scene from left');
    Tools.addToolItem('modeling', 'Right View', 'icon-view-right', null, 'rightView', 'View scene from right');
    Tools.addToolItem('modeling', 'Front View', 'icon-view-front', null, 'frontView', 'View scene from front');
    Tools.addToolItem('modeling', 'Back View', 'icon-view-back', null, 'backView', 'View scene from back');
    Tools.addToolItem('modeling', 'Clear Scene', 'icon-view-clear', null, 'clearView', 'Clear view');
    Tools.addToolItem('modeling', 'Pick Model', 'icon-pick-model', null, 'pickModel', 'Pick a model from scene');
    Tools.addToolItem('modeling', 'Pick Face', 'icon-pick-face', null, 'pickFace', 'Pick a face from scene');
    Tools.addToolItem('modeling', 'Pick Edge', 'icon-pick-edge', null, 'pickEdge', 'Pick an edge from scene');
    Tools.addToolItem('modeling', 'Pick line', 'icon-pick-curve', null, 'pickCurve', 'Pick a curve from scene');
    Tools.addToolItem('modeling', 'Pick point', 'icon-pick-point', null, 'pickPoint', 'Pick a point from scene');
    Tools.addToolItem('modeling', 'Move Model', 'icon-move-model', null, 'moveModel', 'Move model');
    Tools.addToolItem('modeling', 'Rotate Model', 'icon-rotate-model', null, 'rotateModel', 'Rotate model');
    Tools.addToolItem('modeling', 'Scale Model', 'icon-scale-model', null, 'scaleModel', 'Scale model');

    // Adding trees
    Trees.addTree('scene');
    Trees.addTree('files');

    // Set file tree node items
    Trees.addTreeItem('files', 'Models', 'icon-file', 'models');

    // Set scene tree node items
    Trees.addTreeItem('scene', 'Models', 'icon-file', 'models');
  }
]);

// Configure http interseptor
angular.module('slides').factory('httpResponseInterceptor', ['$q', function($q) {
    return {
      response: function(res) {
        return res || $q.when(res);
      }
    };
  }])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpResponseInterceptor');
  }]);
