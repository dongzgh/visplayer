'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').factory('Files', ['$resource',
  function($resource) {
    return $resource('files/:username/:filename', {
      username: '@username',
      filename: '@filename'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
