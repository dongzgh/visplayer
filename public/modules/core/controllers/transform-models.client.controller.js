'use strict';

angular.module('core').controller('TransformModelsController', ['$rootScope', '$scope', '$window', '$log', 'Scene',

  function($rootScope, $scope, $window, $log, Scene) {
    // Initialize
    $scope.mode = 'Translate';
    $scope.modelname = null;
    $scope.enablePicking = false;

    //---------------------------------------------------
    //  Callbacks
    //------------------------------------------------
    // Pick a component
    $scope.pickModel = function() {
      $scope.enablePicking = !$scope.enablePicking;
      Scene.enablePicking($scope.enablePicking, 'model');
    };

    // OK
    $scope.onOK = function () {
      $rootScope.$broadcast('gui-dialog.close');
    };

    // Cancel
    $scope.onCancel = function() {
      $rootScope.$broadcast('gui-dialog.close');
    };

    //---------------------------------------------------
    //  Listeners
    //------------------------------------------------
    $scope.$on('scene.picked', function (event, object) {
      $scope.modelname = object.displayName;
      $scope.$apply();
    });
  }
]);
