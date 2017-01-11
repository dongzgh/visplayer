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
    Tools.addToolItem('sidebar', 'Files', 'icon-files', 'slides/edit/files', null, null, 'List of files');    
    Tools.addToolItem('sidebar', 'Scene', 'icon-scenes', 'slides/edit/scene', null, null, 'List of scene objects');
    Tools.addToolItem('sidebar', 'Modeling', 'icon-tools', 'slides/edit/modeling', null, null, 'List of modeling tools');
    

    // Set files tool items
    Tools.addToolItem('files', 'Upload Files', 'icon-cloud-upload', null, null, 'uploadFiles', 'Upload files to server');
    Tools.addToolItem('files', 'Download Files', 'icon-cloud-download', null, null, 'downloadFiles', 'Download files from server');
    Tools.addToolItem('files', 'Load Files', 'icon-load', null, null, 'loadFiles', 'Load files into scene');
    Tools.addToolItem('files', 'Delete Files', 'icon-delete', null, null, 'deleteFiles', 'Delete files from server');

    // Set scene tool items
    Tools.addToolItem('scene', 'Take Snapshot', 'icon-snapshot', null, null, 'takeSnapshot', 'Take a snapshot for the scene');
    Tools.addToolItem('scene', 'Remove Objects', 'icon-delete', null, null, 'removeObjects', 'Remove objects from scene');

    // Set modeling tool items
    Tools.addToolItem('modeling', 'Fit View', 'icon-view-fit', null, null, 'fitView', 'Fit view');
    Tools.addToolItem('modeling', 'Top View', 'icon-view-top', null, null, 'topView', 'View scene from top');
    Tools.addToolItem('modeling', 'Bottom View', 'icon-view-bottom', null, null, 'bottomView', 'View scene from bottom');
    Tools.addToolItem('modeling', 'Left View', 'icon-view-left', null, null, 'leftView', 'View scene from left');
    Tools.addToolItem('modeling', 'Right View', 'icon-view-right', null, null, 'rightView', 'View scene from right');
    Tools.addToolItem('modeling', 'Front View', 'icon-view-front', null, null, 'frontView', 'View scene from front');
    Tools.addToolItem('modeling', 'Back View', 'icon-view-back', null, null, 'backView', 'View scene from back');
    Tools.addToolItem('modeling', 'Clear Scene', 'icon-pick-nothing', null, null, 'clearView', 'Clear view');
    Tools.addToolItem('modeling', 'Pick Model', 'icon-pick-model', null, false, 'pickModel', 'Pick a model from scene');
    Tools.addToolItem('modeling', 'Pick Face', 'icon-pick-face', null, false, 'pickFace', 'Pick a face from scene');
    Tools.addToolItem('modeling', 'Pick Edge', 'icon-pick-edge', null, false, 'pickEdge', 'Pick an edge from scene');
    Tools.addToolItem('modeling', 'Pick line', 'icon-pick-curve', null, false, 'pickCurve', 'Pick a curve from scene');
    Tools.addToolItem('modeling', 'Pick Point', 'icon-pick-point', null, false, 'pickPoint', 'Pick a point from scene');
    Tools.addToolItem('modeling', 'Shaded Display', 'icon-display-shaded', null, null, 'displayShaded', 'Display in shaded mode');
    Tools.addToolItem('modeling', 'Rendered Display', 'icon-display-rendered', null, null, 'displayRendered', 'Display in rendered mode');
    Tools.addToolItem('modeling', 'Analysis Display', 'icon-display-analysis', null, null, 'displayAnalysis', 'Display in analysis mode');
    Tools.addToolItem('modeling', 'Mesh Display', 'icon-display-mesh', null, null, 'displayMesh', 'Display in mesh mode');
    Tools.addToolItem('modeling', 'Wireframe Display', 'icon-display-wireframe', null, null, 'displayWireframe', 'Display in wireframe mode');
    Tools.addToolItem('modeling', 'Move Model', 'icon-move-model', null, null, 'moveModel', 'Move model');
    Tools.addToolItem('modeling', 'Rotate Model', 'icon-rotate-model', null, null, 'rotateModel', 'Rotate model');
    Tools.addToolItem('modeling', 'Scale Model', 'icon-scale-model', null, null, null, null, 'scaleModel', 'Scale model');

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
