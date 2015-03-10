'use strict';

// Configuring file type constants
angular.module('core').constant('FileTypes', {
  'models': ['vis', 'json', '7z', 'zip', 'gz'],
  'images': ['bmp', 'png', 'jpg', 'gif', 'tif', 'tiff', 'tga', 'eps', 'svg'],
  'texts':  ['txt', 'dat', 'json', 'js', 'sh', 'md', 'cpp', 'h']
});
