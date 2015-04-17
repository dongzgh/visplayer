'use strict';

// Configuring the Slides module
angular.module('slides').run(['Menus', 'Tools', 'Trees', 'Dialogs',
  function(Menus, Tools, Trees, Dialogs) {
    // Set topbar menu items
    Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown');
    Menus.addSubMenuItem('topbar', 'slides', 'New Slide', 'slides/create');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'Views', 'glyphicon-blackboard', 'slides/create/views');
    Tools.addToolItem('sidebar', 'Scene', 'glyphicon-camera', 'slides/create/scene');
    Tools.addToolItem('sidebar', 'Files', 'glyphicon-file', 'slides/create/files');
    Tools.addToolItem('sidebar', 'Tools', 'glyphicon-wrench', 'slides/create/tools');
    Tools.addToolItem('sidebar', 'Materials', 'glyphicon-tint', 'slides/create/materials');
    Tools.addToolItem('sidebar', 'Markups', 'glyphicon-tags', 'slides/create/markups');

    // Set panel tool items
    Tools.addToolItem('panel', 'Upload Files', 'glyphicon-cloud-upload', null, 'uploadFiles', 'Upload multiple files');
    Tools.addToolItem('panel', 'Take Snapshot', 'glyphicon-picture', null, 'takeSnapshot', 'Take a snapshot for the scene');

    // Set file tree node items
    Trees.addTreeItem('fileTree', 'Models', 'glyphicon-briefcase', 'models');
    Trees.addTreeItem('fileTree', 'Images', 'glyphicon-briefcase', 'images');
    Trees.addTreeItem('fileTree', 'Texts', 'glyphicon-briefcase', 'texts');
    Trees.addTreeItem('fileTree', 'Others', 'glyphicon-briefcase', 'others');

    // Set scene tree node items 
    Trees.addTreeItem('sceneTree', 'Models', 'glyphicon-briefcase', 'models');
    Trees.addTreeItem('sceneTree', 'Lights', 'glyphicon-briefcase', 'lights');
    Trees.addTreeItem('sceneTree', 'Markups', 'glyphicon-briefcase', 'markups');
  }
]);

// Configuring file widgets
angular.module('slides').constant('fileWidgets', {
  'Delete': {
    'action': 'deleteFile',
    'icon': 'glyphicon-trash',
    'tooltip': 'Delete the file from server'
  },
  'Download': {
    'action': 'downloadFile',
    'icon': 'glyphicon-cloud-download',
    'tooltip': 'Download the file from server'
  },
  'Load': {
    'action': 'loadFile',
    'icon': 'glyphicon-download',
    'tooltip': 'Load the file into scene'
  },
  'Edit': {
    'action': 'editFile',
    'icon': 'glyphicon-edit',
    'tooltip': 'Edit the file'
  }
});

// Configuring scene widgets
angular.module('slides').constant('sceneWidgets', {
  'Remove': {
    'action': 'removeModel',
    'icon': 'glyphicon-remove',
    'tooltip': 'Remove item from scene'
  }
});

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