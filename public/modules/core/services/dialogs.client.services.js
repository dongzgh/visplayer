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

    // Define transformModel non-modal dialog box
    this.transformModel = function() {
      var items = {
        title: 'Transform Model',
        method: 'translate'
      };
      var gui = new $window.dat.GUI();
      gui.add(items, 'title');
      gui.add(items, 'method', ['translate', 'rotate', 'scale']);
      return gui;
    };
  }
]);
