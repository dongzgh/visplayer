'use strict';

// Configuring the Articles module
angular.module('slides').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown', '/slides(/create)?');
		//menus.addsubmenuitem('topbar', 'slides', 'list slides', 'slides');
		Menus.addSubMenuItem('topbar', 'slides', 'New Slide', 'slides/create');
	}
]);
