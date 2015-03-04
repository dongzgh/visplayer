'use strict';

// Configuring file type constants
angular.module('core').constant('FileTypes', {
  'models': ['vis', 'json'],
  'images': ['bmp', 'png', 'jpg', 'gif', 'tif', 'tiff', 'tga', 'eps', 'svg'],
  'texts':  ['txt', 'dat', 'json', 'js', 'sh', 'md', 'cpp', 'h']
});

// Configuring file widgets
angular.module('core').constant('Widgets', [
  {'name': 'Delete', 'action': 'deleteFile', 'icon': 'glyphicon-remove'},
  {'name': 'Load', 'action': 'loadModel', 'icon': 'glyphicon-download'},
  {'name': 'Edit', 'action': 'editFile', 'icon': 'glyphicon-edit'}
]);

