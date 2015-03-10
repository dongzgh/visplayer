'use strict';

// Configuring the Slides module
angular.module('slides').run(['Menus', 'Tools', 'Nodes',
  function(Menus, Tools, Nodes) {
    // Set topbar menu items
    Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown', '/slides(/create)?');
    Menus.addSubMenuItem('topbar', 'slides', 'New Slide', 'slides/create');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'Files', 'glyphicon-file', 'files', 'dropdown');
    Tools.addSubToolItem('sidebar', 'files', 'Import Model', 'glyphicon-cloud-upload', 'importModel', 'import/model');
    Tools.addToolItem('sidebar', 'Edits', 'glyphicon-edit', 'edits', 'dropdown');
    Tools.addToolItem('sidebar', 'Materials', 'glyphicon-tint', 'materials', 'dropdown');
    Tools.addToolItem('sidebar', 'Views', 'glyphicon-camera', 'views', 'dropdown');
    Tools.addToolItem('sidebar', 'Markups', 'glyphicon-tags', 'markups', 'dropdown');
    Tools.addToolItem('sidebar', 'Scripts', 'glyphicon-list-alt', 'scripts', 'dropdown');

    // Set tree node items
    Nodes.addNodeItem('tree', 'Resources', 'glyphicon-briefcase', 'resources', 'dropdown');
  }
]);

// Configuring file widgets
angular.module('slides').constant('Widgets', [
  {'name': 'Delete', 'action': 'deleteFile', 'icon': 'glyphicon-remove'},
  {'name': 'Load', 'action': 'loadFile', 'icon': 'glyphicon-download'},
  {'name': 'Edit', 'action': 'editFile', 'icon': 'glyphicon-edit'}
]);
