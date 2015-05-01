'use strict';

angular.module('core').controller('TransformModelsController', ['$rootScope', '$scope', '$window', '$log', 'Scene',

  function($rootScope, $scope, $window, $log, Scene) {
    // Initialize
    $scope.mode = 'Translate';

    //---------------------------------------------------
    //  Callbacks
    //------------------------------------------------
    // Pick a component
    $scope.pickComponent = function() {
      Scene.enablePicking(true);
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
    });
  }
]);
