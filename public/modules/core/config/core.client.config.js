'use strict';

// Configuring file type constants
angular.module('core').constant('FileTypes', {
  'models': ['vis', 'ply', 'obj']
});

angular.module('core').run(['Menus',
  function(Menus) {
    // Set topbar menu items
    Menus.addMenuItem('topbar', 'vis3D', 'slides/edit');
  }
]);