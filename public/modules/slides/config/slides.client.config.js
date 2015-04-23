'use strict';

// Configuring the Slides module
angular.module('slides').run(['Menus', 'Tools', 'Trees', 'Dialogs',
  function(Menus, Tools, Trees, Dialogs) {
    // Set topbar menu items
    Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown');
    Menus.addSubMenuItem('topbar', 'slides', 'New Project', 'slides/create');

    // Adding tools
    Tools.addTool('sidebar');
    Tools.addTool('views');
    Tools.addTool('scene');
    Tools.addTool('files');
    Tools.addTool('modeling');
    Tools.addTool('materials');
    Tools.addTool('markups');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'Views', 'glyphicon-blackboard', 'slides/create/views');
    Tools.addToolItem('sidebar', 'Scene', 'glyphicon-camera', 'slides/create/scene');
    Tools.addToolItem('sidebar', 'Files', 'glyphicon-file', 'slides/create/files');
    Tools.addToolItem('sidebar', 'Modeling', 'glyphicon-wrench', 'slides/create/modeling');
    Tools.addToolItem('sidebar', 'Materials', 'glyphicon-tint', 'slides/create/materials');
    Tools.addToolItem('sidebar', 'Markups', 'glyphicon-tags', 'slides/create/markups');

    // Set views tool items

    // Set scene tool items
    Tools.addToolItem('scene', 'Take Snapshot', 'glyphicon-picture', null, 'takeSnapshot', 'Take a snapshot for the scene');
    Tools.addToolItem('scene', 'Remove Objects', 'glyphicon-remove', null, 'removeObjects', 'Remove objects from scene');

    // Set files tool items
    Tools.addToolItem('files', 'Upload Files', 'glyphicon-cloud-upload', null, 'uploadFiles', 'Upload files to server');
    Tools.addToolItem('files', 'Download Files', 'glyphicon-cloud-download', null, 'downloadFiles', 'Download files from server');
    Tools.addToolItem('files', 'Load Files', 'glyphicon-download', null, 'loadFiles', 'Load files into scene');
    Tools.addToolItem('files', 'Delete Files', 'glyphicon-remove', null, 'deleteFiles', 'Delete files from server');

    // Set modeling tool items

    // Set marterials tool items

    // Set markups tool items

    // Adding trees
    Trees.addTree('files');
    Trees.addTree('scene');

    // Set file tree node items
    Trees.addTreeItem('files', 'Models', 'glyphicon-briefcase', 'models');
    Trees.addTreeItem('files', 'Images', 'glyphicon-briefcase', 'images');
    Trees.addTreeItem('files', 'Texts', 'glyphicon-briefcase', 'texts');
    Trees.addTreeItem('files', 'Others', 'glyphicon-briefcase', 'others');

    // Set scene tree node items
    Trees.addTreeItem('scene', 'Models', 'glyphicon-briefcase', 'models');
    Trees.addTreeItem('scene', 'Lights', 'glyphicon-briefcase', 'lights');
    Trees.addTreeItem('scene', 'Markups', 'glyphicon-briefcase', 'markups');
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
