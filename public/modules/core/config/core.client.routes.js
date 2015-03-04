'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);

// Configuring module constants
angular.module('core').constant('fileTypes', {
	'models': ['vis', 'json'],
	'images': ['bmp', 'png', 'jpg', 'gif', 'tif', 'tiff', 'tga', 'eps', 'svg'],
	'texts':  ['txt', 'dat', 'json', 'js', 'sh', 'md', 'cpp', 'h']
});
