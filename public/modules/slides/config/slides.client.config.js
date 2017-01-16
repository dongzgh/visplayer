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
    Tools.addToolItem('sidebar', 'Files', 'icon-files', 'slides/edit/files', undefined, undefined, 'List of files');    
    Tools.addToolItem('sidebar', 'Scene', 'icon-scenes', 'slides/edit/scene', undefined, undefined, 'List of scene objects');
    Tools.addToolItem('sidebar', 'Modeling', 'icon-tools', 'slides/edit/modeling', undefined, undefined, 'List of modeling tools');
    

    // Set files tool items
    Tools.addToolItem('files', 'Upload Files', 'icon-upload', undefined, undefined, 'uploadFiles', 'Upload files to server');
    Tools.addToolItem('files', 'Download Files', 'icon-download', undefined, undefined, 'downloadFiles', 'Download files from server');
    Tools.addToolItem('files', 'Load Files', 'icon-load', undefined, undefined, 'loadFiles', 'Load files into scene');
    Tools.addToolItem('files', 'Delete Files', 'icon-delete', undefined, undefined, 'deleteFiles', 'Delete files from server');

    // Set scene tool items
    Tools.addToolItem('scene', 'Take Snapshot', 'icon-snapshot', undefined, undefined, 'takeSnapshot', 'Take a snapshot for the scene');
    Tools.addToolItem('scene', 'Remove Objects', 'icon-delete', undefined, undefined, 'removeObjects', 'Remove objects from scene');

    // Set modeling tool items
    Tools.addToolItem('modeling', 'Fit View', 'icon-view-fit', undefined, undefined, 'fitView', 'Fit view');
    Tools.addToolItem('modeling', 'Top View', 'icon-view-top', undefined, undefined, 'topView', 'View scene from top');
    Tools.addToolItem('modeling', 'Bottom View', 'icon-view-bottom', undefined, undefined, 'bottomView', 'View scene from bottom');
    Tools.addToolItem('modeling', 'Left View', 'icon-view-left', undefined, undefined, 'leftView', 'View scene from left');
    Tools.addToolItem('modeling', 'Right View', 'icon-view-right', undefined, undefined, 'rightView', 'View scene from right');
    Tools.addToolItem('modeling', 'Front View', 'icon-view-front', undefined, undefined, 'frontView', 'View scene from front');
    Tools.addToolItem('modeling', 'Back View', 'icon-view-back', undefined, undefined, 'backView', 'View scene from back');
    Tools.addToolItem('modeling', 'Clear Scene', 'icon-pick-nothing', undefined, undefined, 'clearView', 'Clear view');
    Tools.addToolItem('modeling', 'Pick Model', 'icon-pick-model', undefined, false, 'pickModel', 'Pick a model from scene');
    Tools.addToolItem('modeling', 'Pick Face', 'icon-pick-face', undefined, false, 'pickFace', 'Pick a face from scene');
    Tools.addToolItem('modeling', 'Pick Edge', 'icon-pick-edge', undefined, false, 'pickEdge', 'Pick an edge from scene');
    Tools.addToolItem('modeling', 'Pick line', 'icon-pick-curve', undefined, false, 'pickCurve', 'Pick a curve from scene');
    Tools.addToolItem('modeling', 'Pick Point', 'icon-pick-point', undefined, false, 'pickPoint', 'Pick a point from scene');
    Tools.addToolItem('modeling', 'Shaded Display', 'icon-display-shaded', undefined, undefined, 'displayShaded', 'Display in shaded mode');
    Tools.addToolItem('modeling', 'Rendered Display', 'icon-display-rendered', undefined, undefined, 'displayRendered', 'Display in rendered mode');
    Tools.addToolItem('modeling', 'Analysis Display', 'icon-display-analysis', undefined, undefined, 'displayAnalysis', 'Display in analysis mode');
    Tools.addToolItem('modeling', 'Mesh Display', 'icon-display-mesh', undefined, undefined, 'displayMesh', 'Display in mesh mode');
    Tools.addToolItem('modeling', 'Wireframe Display', 'icon-display-wireframe', undefined, undefined, 'displayWireframe', 'Display in wireframe mode');
    Tools.addToolItem('modeling', 'Transform', 'icon-transform', undefined, undefined, 'transform', 'Transform');

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
