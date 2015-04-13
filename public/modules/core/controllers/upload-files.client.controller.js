'use strict';

angular.module('slides').controller('UploadFilesController', ['$scope', '$log', '$upload', 'Files',
  function($scope, $log, $upload, Files) {
    $scope.list = [];

    $scope.upload = function (files) {
      $log.log(files);
      if(angular.isDefined(files) && files.length > 0) {
        files.forEach(function(file){
          $scope.list.push(file.name);
        });
      }        
    };
    
    // Watch on files
    $scope.$watch('files', function() {
      $scope.upload($scope.files);
    });
  }
]);
