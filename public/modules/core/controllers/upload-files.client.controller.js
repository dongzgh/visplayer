'use strict';

angular.module('core').controller('UploadFilesController', ['$rootScope', '$scope', '$log', '$modalInstance', 'Files',

  function($rootScope, $scope, $log, $modalInstance, Files) {
    // Initialize file name list
    $scope.files = [];
    $scope.names = [];

    // Collect files
    $scope.collect = function(files) {
      // Check input data
      if (!angular.isDefined(files) || files.length <= 0)
        return;

      // Collect files
      $scope.names = [];
      files.forEach(function(file) {
        $scope.names.push(file.name);
      });
    };

    // Watch on files
    $scope.$watch('files', function() {
      $scope.collect($scope.files);
    });

    // Upload files
    $scope.upload = function() {
      // Define success callback
      function onsuccess(config) {
        $rootScope.$broadcast('upload-files.success', config.file.name);
      }

      // Define final callback
      function onfinal(passed, failed) {
        if(passed.length === $scope.files.length) {
          $modalInstance.dismiss('success');
        } else {
          $modalInstance.dismiss('failed');
        }
      }

      if ($scope.files.length > 0) {
        Files.upload($scope.files, null, onsuccess, null, onfinal);
      }
    };
  }
]);
