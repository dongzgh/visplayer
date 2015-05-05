'use strict';

angular.module('core').controller('TransformModelsController', ['$rootScope', '$scope', '$window', '$log', 'Scene',

  function($rootScope, $scope, $window, $log, Scene) {
    // Initialize
    $scope.enablePicking = false;
    $scope.picked = null;
    $scope.mode = 'translate';

    //---------------------------------------------------
    //  Callbacks
    //------------------------------------------------
    // Pick a component
    $scope.pickModel = function() {
      $scope.enablePicking = !$scope.enablePicking;
      Scene.enablePicking($scope.enablePicking, 'model');
    };

    // Change transformer
    $scope.changeType = function() {
      if($scope.picked === null) return;
      Scene.attachTransformer($scope.picked, $scope.mode);
    };

    // OK
    $scope.onOK = function () {
      // Disable picking
      Scene.enablePicking(false);
      Scene.clear();

      // Broadcast
      $rootScope.$broadcast('gui-dialog.close');
    };

    // Cancel
    $scope.onCancel = function() {
      // Disable picking
      Scene.enablePicking(false);
      Scene.clear();

      // Broadcast
      $rootScope.$broadcast('gui-dialog.close');
    };

    //---------------------------------------------------
    //  Listeners
    //------------------------------------------------
    $scope.$on('scene.picked', function (event, object) {
      // Save picked
      $scope.picked = object;

      // Attach transformer
      Scene.attachTransformer($scope.picked, $scope.mode);

      // Update gui
      $scope.$apply();
    });
  }
]);
