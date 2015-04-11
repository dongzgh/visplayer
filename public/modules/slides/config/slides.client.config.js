'use strict';

// Configuring the Slides module
angular.module('slides').run(['Menus', 'Tools', 'Trees',
  function(Menus, Tools, Trees) {
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
    Tools.addToolItem('panel', 'Upload File', 'glyphicon-upload', null, 'uploadFiles');
    Tools.addToolItem('panel', 'Download File', 'glyphicon-download', null, 'downloadFile');
    Tools.addToolItem('panel', 'Take Snapshot', 'glyphicon-picture', null, 'takeSnapshot');

    // Set file tree node items
    Trees.addTreeItem('fileTree', 'Resources', 'glyphicon-briefcase', 'resources');

    // Set scene tree node items 
    Trees.addTreeItem('sceneTree', 'Models', 'glyphicon-briefcase', 'models');
  }
]);

// Configuring file widgets
angular.module('slides').constant('fileWidgets', [{
  'name': 'Delete',
  'action': 'deleteFile',
  'icon': 'glyphicon-trash'
}, {
  'name': 'Load',
  'action': 'loadFile',
  'icon': 'glyphicon-download'
}, {
  'name': 'Edit',
  'action': 'editFile',
  'icon': 'glyphicon-edit'
}]);

// Configuring scene widgets
angular.module('slides').constant('sceneWidgets', [{
  'name': 'Remove',
  'action': 'removeModel',
  'icon': 'glyphicon-remove'
}]);

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