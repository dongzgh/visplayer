'use strict';

// Configuring the Articles module
angular.module('slides').run(['Menus', 'Tools',
	function(Menus, Tools) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown', '/slides(/create)?');
		Menus.addSubMenuItem('topbar', 'slides', 'New Slide', 'slides/create');

		// Set side bar tool items
		Tools.addToolItem('sidebar', 'Files', 'files', 'glyphicon-file', 'dropdown', '/files');
		Tools.addToolItem('sidebar', 'Edits', 'edit', 'glyphicon-edit', 'dropdown', '/edits');
		Tools.addToolItem('sidebar', 'Materials', 'materials', 'glyphicon-tint', 'dropdown', '/materials');
		Tools.addToolItem('sidebar', 'Views', 'views', 'glyphicon-camera', 'dropdown', '/views');
		Tools.addToolItem('sidebar', 'Markups', 'markups', 'glyphicon-tags', 'dropdown', '/markups');
		Tools.addToolItem('sidebar', 'Scripts', 'scripts', 'glyphicon-list-alt', 'dropdown', '/scripts');
	}
]);
