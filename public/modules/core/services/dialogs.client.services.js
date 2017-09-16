'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Dialogs', ['$window', '$uibModal',
  function($window, $uibModal) {
    // Upload modal dialog
    this.upload = function() {
      return $uibModal.open({
        templateUrl: 'modules/core/views/upload.client.view.html',
        controller: 'UploadController',
        size: 'sm'
      });
    };

    // Transform dialog
    this.translate = function() {
      return 'modules/core/views/translate.client.view.html';
    };
  }
]);