'use strict';

// Configuring the Slides module
angular.module('slides').run(['Menus', 'Tools', 'Nodes',
  function(Menus, Tools, Nodes) {
    // Set topbar menu items
    Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown');
    Menus.addSubMenuItem('topbar', 'slides', 'New Slide', 'slides/create');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'Views', 'glyphicon-camera', 'slides/create/views', 'dropdown');
    Tools.addToolItem('sidebar', 'Files', 'glyphicon-file', 'slides/create/files', 'dropdown');
    Tools.addToolItem('sidebar', 'Tools', 'glyphicon-wrench', 'slides/create/tools', 'dropdown');
    Tools.addSubToolItem('sidebar', 'tools', 'Upload Files', 'glyphicon-cloud-upload', 'slides/create/tools/uploadFiles', 'uploadFiles');        
    Tools.addToolItem('sidebar', 'Materials', 'glyphicon-tint', 'slides/create/materials', 'dropdown');    
    Tools.addToolItem('sidebar', 'Markups', 'glyphicon-tags', 'slides/create/markups', 'dropdown');

    // Set file tree node items
    Nodes.addNodeItem('fileTree', 'Resources', 'glyphicon-briefcase', 'resources', 'dropdown');

    // Set scene tree node items 
    Nodes.addNodeItem('sceneTree', 'Models', 'glyphicon-briefcase', 'models', 'dropdown');
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
.config(['$httpProvider',function($httpProvider) {
    $httpProvider.interceptors.push('httpResponseInterceptor');
}]);
