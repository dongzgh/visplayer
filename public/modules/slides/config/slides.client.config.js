'use strict';

// Configuring the Articles module
angular.module('slides').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown', '/slides(/create)?');
		Menus.addSubMenuItem('topbar', 'slides', 'List Slides', 'slides');
		Menus.addSubMenuItem('topbar', 'slides', 'New Slide', 'slides/create');
	}
]);