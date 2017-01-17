'use strict';

angular.module('core').controller('TransformController', ['$window', '$scope', '$log', 'Scene', 'Languages',
  function($window, $scope, $log, Scene, Languages) {
    // State variables
    $scope.enablePicking = true;
    $scope.language = Languages.localization();

    // Enable selection
    Scene.selectType = Scene.GEOMETRY_TYPES.model;
    Scene.selectMode = Scene.SELECTION_MODES.single;
    Scene.displaySelect = false;
    $scope.mode = 'translate';
    var selected;
    var stack = [];

    //---------------------------------------------------
    //  Callbacks
    //---------------------------------------------------
    // Updaet mode
    $scope.updateMode = function() {
      Scene.switchTransformer($scope.mode);
    };

    // On undo
    $scope.onUndo = function () {
      if(stack.length === 1) {
        let object = stack[0];
        selected.copy(object, false);
      }      
      else if(stack.length > 1) {
        let object = stack.pop();
        if(selected.matrix.equals(object.matrix))
          $scope.onUndo();
        else
          selected.copy(object, false);
      }
    };

  	// On OK
  	$scope.onOK = function() {
      Scene.viewClear();
      Scene.clearSelection();
      Scene.deleteTransformer();
  		$rootScope.$broadcast('dialog.close');
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
    $scope.$on('scene.transformer.update', function (event){
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
