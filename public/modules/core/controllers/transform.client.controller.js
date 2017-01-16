'use strict';

angular.module('core').controller('TransformController', ['$rootScope', '$window', '$scope', '$log', 'Scene',
  function($rootScope, $window, $scope, $log, Scene) {
    // State variables
    $scope.enablePicking = true;

    // Enable selection
    Scene.selectType = Scene.GEOMETRY_TYPES.model;
    Scene.selectMode = Scene.SELECTION_MODES.single;
    Scene.selectNotify = false;
    $scope.mode = 'translate';
    var selected;
    var stack = [];

    //---------------------------------------------------
    //  Callbacks
    //---------------------------------------------------
    // Updaet mode
    $scope.updateMode = function() {
      Scene.createTransformer($scope.mode);
    };

  	// OnOK
  	$scope.onOK = function() {
      Scene.clearView();
      Scene.clearSelection();
      Scene.deleteTransformer();
  		$rootScope.$broadcast('dialog.close');
  	};

  	// OnCancel
  	$scope.onCancel = function() {
      Scene.clearView();
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
    $scope.$on('scene.selected', function(event, selects) {
      selects.forEach(function(object){
        Scene.createTransformer($scope.mode, object);
        selected = object;
        stack.push(object.clone());
      });
  });
  }
]);
