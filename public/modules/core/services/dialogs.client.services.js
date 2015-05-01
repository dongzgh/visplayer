'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Dialogs', ['$window', '$modal',

  function($window, $modal) {
    // Define uploadFiles modal dialog box
    this.uploadFiles = function() {
      return $modal.open({
        templateUrl: 'modules/core/views/upload-files.client.view.html',
        controller: 'UploadFilesController',
        size: 'sm'
      });
    };
  }
]);
