'use strict';

angular.module('slides').controller('UploadFilesController', ['$scope', '$log', '$upload', 'Files',
  function($scope, $log, $upload, Files) {
    $scope.upload = function (files) {
      $log.log(files);
    };
    
    // Watch on files
    $scope.$watch('files', function() {
      $scope.upload($scope.files);
    });
  }
]);
