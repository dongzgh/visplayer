'use strict';

// Configuring the Slides module
angular.module('slides').run(['Menus', 'Tools', 'Trees', 'Dialogs',
  function(Menus, Tools, Trees, Dialogs) {
    // Adding tools
    Tools.addTool('sidebar');
    Tools.addTool('files');
    Tools.addTool('scene');
    Tools.addTool('modeling');
    Tools.addTool('materials');
    Tools.addTool('markups');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'Modeling', 'glyphicon-wrench', 'slides/edit/modeling', null, 'List of modeling tools');
    Tools.addToolItem('sidebar', 'Scene', 'glyphicon-camera', 'slides/edit/scene', null, 'List of scene objects');
    Tools.addToolItem('sidebar', 'Files', 'glyphicon-file', 'slides/edit/files', null, 'List of files');   
 
    // Set files tool items
    Tools.addToolItem('files', 'Upload Files', 'glyphicon-cloud-upload', null, 'uploadFiles', 'Upload files to server');
    Tools.addToolItem('files', 'Download Files', 'glyphicon-cloud-download', null, 'downloadFiles', 'Download files from server');
    Tools.addToolItem('files', 'Load Files', 'glyphicon-download', null, 'loadFiles', 'Load files into scene');
    Tools.addToolItem('files', 'Delete Files', 'glyphicon-remove', null, 'deleteFiles', 'Delete files from server');

    // Set scene tool items
    Tools.addToolItem('scene', 'Take Snapshot', 'glyphicon-picture', null, 'takeSnapshot', 'Take a snapshot for the scene');
    Tools.addToolItem('scene', 'Remove Objects', 'glyphicon-remove', null, 'removeObjects', 'Remove objects from scene');

    // Set modeling tool items
    Tools.addToolItem('modeling', 'Fit View', 'glyphicon-fullscreen', null, 'fitView', 'Fit view');
    Tools.addToolItem('modeling', 'Top View', 'glyphicon-hand-down', null, 'topView', 'View scene from top');
    Tools.addToolItem('modeling', 'Bottom View', 'glyphicon-hand-up', null, 'bottomView', 'View scene from bottom');
    Tools.addToolItem('modeling', 'Left View', 'glyphicon-hand-right', null, 'leftView', 'View scene from left');
    Tools.addToolItem('modeling', 'Right View', 'glyphicon-hand-left', null, 'rightView', 'View scene from right');
    Tools.addToolItem('modeling', 'Clear Scene', 'glyphicon-refresh', null, 'clearView', 'Clear view');
    Tools.addToolItem('modeling', 'Pick Model', 'glyphicon-screenshot', null, 'pickModel', 'Pick a model from scene');
    Tools.addToolItem('modeling', 'Pick Face', 'glyphicon-screenshot', null, 'pickFace', 'Pick a face from scene');
    Tools.addToolItem('modeling', 'Pick Edge', 'glyphicon-screenshot', null, 'pickEdge', 'Pick an edge from scene');
    Tools.addToolItem('modeling', 'Move Model', 'glyphicon-move', null, 'moveModel', 'Move model');
    Tools.addToolItem('modeling', 'Rotate Model', 'glyphicon-repeat', null, 'rotateModel', 'Rotate model');
    Tools.addToolItem('modeling', 'Scale Model', 'glyphicon-resize-full', null, 'scaleModel', 'Scale model');

    // Adding trees
    Trees.addTree('scene');
    Trees.addTree('files');    

    // Set file tree node items
    Trees.addTreeItem('files', 'Models', 'glyphicon-briefcase', 'models');

    // Set scene tree node items
    Trees.addTreeItem('scene', 'Models', 'glyphicon-briefcase', 'models');
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
