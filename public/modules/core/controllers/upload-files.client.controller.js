'use strict';

angular.module('slides').controller('UploadFilesController', ['$scope', '$log', '$modalInstance', '$upload', 'Files',

  function($scope, $log, $modalInstance, $upload, Files) {
    // Initialize file name list
    $scope.files = [];
    $scope.names = [];

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
    $scope.upload = function () {
      if($scope.files.length > 0) {
        Files.upload($scope.files);
      }      
      $modalInstance.dismiss('success');
    };
  }
]);