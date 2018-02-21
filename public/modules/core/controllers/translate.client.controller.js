'use strict';

angular.module('core').controller('TranslateController', ['$rootScope', '$window', '$scope', '$log', 'Scene', 'Languages',
  function($rootScope, $window, $scope, $log, Scene, Languages) {
    // State variables
    $scope.enablePicking = true;
    $scope.language = Languages.localization();

    // Enable selection
    Scene.selectType = Scene.GEOMETRY_TYPES.model;
    Scene.selectMode = Scene.SELECTION_MODES.single;
    Scene.displaySelect = false;
    $scope.mode = 'translate';
    $scope.x = 0.0;
    $scope.y = 0.0;
    $scope.z = 0.0;
    var selected;
    var stack = [];

    //---------------------------------------------------
    //  Callbacks
    //---------------------------------------------------
    // On undo
    $scope.onUndo = function() {
      var object;
      if(stack.length === 1) {
        object = stack[0];
        selected.copy(object, false);
      } else if(stack.length > 1) {
        object = stack.pop();
        if(selected.matrix.equals(object.matrix)) {
          $scope.onUndo();
        } else {
          selected.copy(object, false);
        }
      }
    };

    // On OK
    $scope.onOK = function() {
      $scope.onApply();
      selected.data.matrixWorld = selected.matrixWorld;
      Scene.viewClear();
      Scene.clearSelection();
      Scene.deleteTransformer();
      $rootScope.$broadcast('dialog.close');
    };

    // On Apply.
    $scope.onApply = function() {
      if(selected === undefined) {
        return;
      }
      selected.translateX($scope.x);
      selected.translateY($scope.y);
      selected.translateZ($scope.z);
    };

    // On Cancel
    $scope.onCancel = function() {
      Scene.viewClear();
      Scene.clearSelection();
      Scene.deleteTransformer();
      if(stack.length > 0) {
        selected.copy(stack[0], false);
        stack = [];
      }
      $rootScope.$broadcast('dialog.close');
    };

    //---------------------------------------------------
    //  Listeners
    //---------------------------------------------------
    $scope.$on('scene.transformer.update', function(event) {
      event.preventDefault();
      stack.push(selected.clone());
    });

    $scope.$on('scene.selected', function(event, selects) {
      event.preventDefault();
      if(Scene.createTransformer($scope.mode, selects[0])) {
        selected = selects[0];
        stack.push(selects[0].clone());
      }
    });
  }
]);