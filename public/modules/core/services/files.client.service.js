'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').factory('Files', ['$resource',
	function($resource) {
		return $resource('files/:username/:fileId', 
      { 
        username: '@username',
        fileId: '@_id'   
      }, 
      {
        update: {
          method: 'PUT'
      }
    });
  }
]);
