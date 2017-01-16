'use strict';

angular.module('core').controller('TransformController', ['$rootScope', '$scope', '$log', 'Scene',
  function($rootScope, $scope, $log, Scene) {
    // State variables
    $scope.enablePicking = true;

    // Enable selection
    Scene.numSelectors = 1;
    Scene.selectType = Scene.GEOMETRY_TYPES.model;
    Scene.selectMode = Scene.SELECTION_MODES.single;
    Scene.displaySelection = false; // to be reset after dialog closed

    //---------------------------------------------------
    //  Callbacks
    //---------------------------------------------------
  	// OnOK
  	$scope.onOK = function() {
  		$rootScope.$broadcast('dialog.close');
  	};

  	// OnCancel
  	$scope.onCancel = function() {
  		$rootScope.$broadcast('dialog.close');
  	};

    //---------------------------------------------------
    //  Listeners
    //---------------------------------------------------
    $scope.$on('scene.selected', function(event, selects) {
      selects.forEach(function(selected){
        console.log(selected);
      });
  });
  }
]);
