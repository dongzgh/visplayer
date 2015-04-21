'use strict';

angular.module('slides').controller('UploadFilesController', ['$rootScope', '$scope', '$log', '$modalInstance', 'Files',

  function($rootScope, $scope, $log, $modalInstance, Files) {
    // Initialize file name list
    $scope.files = [];
    $scope.names = [];

    // Initialize ticker
    $scope.ticker = 0.0;
    $scope.showTicker = false;

    // Collect files
    $scope.collect = function(files) {
      $scope.files = files;
      $scope.names = [];
      if (angular.isDefined(files) && files.length > 0) {
        files.forEach(function(file) {
          $scope.names.push(file.name);
        });
      }
    };

    // Watch on files
    $scope.$watch('files', function() {
      $scope.collect($scope.files);
    });

    // Upload files
    $scope.upload = function() {
      if ($scope.files.length > 0) {
        $scope.showTicker = true;
        Files.upload($scope.files, $scope.onprogress, $scope.onsuccess, $scope.onerror);
      }
    };

    // Define progress callback
    $scope.onprogress = function(evt) {
      $scope.ticker = (evt.loaded / evt.total * 100).toFixed();
      $log.log('progress: ' + $scope.ticker + '% ' + evt.config.file.name);
    };

    // Define success callback
    $scope.onsuccess = function(data, status, headers, config) {
      $log.info('%s is uploaded successfully.', config.file.name);
      $scope.ticker = 0.0;
      $scope.showTicker = false;
      $modalInstance.dismiss('success');
      $rootScope.$broadcast('upload-files.success', config.file.name);
    };

    // Define error callback
    $scope.onerror = function(err) {
      $log.error(err);
      $scope.ticker = 0.0;
      $scope.showTicker = false;
      $modalInstance.dismiss('failed');
      $rootScope.$broadcast('upload-files.failed');
    };
  }
]);
