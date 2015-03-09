'use strict';

//Slides service used to communicate Slides REST endpoints
angular.module('slides').factory('Slides', ['$resource',
  function($resource) {
    return $resource('slides/:slideId', {
      slideId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
