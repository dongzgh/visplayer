'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Dialogs', ['$window', '$modal', 
  function($window, $modal) {
    // Define upload modal dialog box
    this.upload = function() {
      return $modal.open({
        templateUrl: 'modules/core/views/upload.client.view.html',
        controller: 'UploadController',
        size: 'sm'
      });
    };
  }
]);
