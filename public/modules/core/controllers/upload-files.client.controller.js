'use strict';

angular.module('slides').controller('UploadFilesController', ['$rootScope', '$scope', '$log', '$modalInstance', 'Files',

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
        $modalInstance.dismiss('success');
        $rootScope.$broadcast('upload-files.success', config.file.name);
      }

      // Define error callback
      function onerror(err) {
        $modalInstance.dismiss('failed');
        $rootScope.$broadcast('upload-files.failed');
      }

      if ($scope.files.length > 0) {
        Files.upload($scope.files, null, onsuccess, onerror);
      }
    };
  }
]);
