'use strict';

angular.module('core').controller('TransformController', ['$rootScope', '$scope', '$log', 'Scene',
  function($rootScope, $scope, $log, Scene) {
    // State variables
    $scope.enablePicking = true;

    // Enable selection
    Scene.selectType = Scene.GEOMETRY_TYPES.model;
    Scene.selectMode = Scene.SELECTION_MODES.single;
    Scene.selectNotify = false;
    $scope.mode = 'translate';

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
  		$rootScope.$broadcast('dialog.close');
  	};

    //---------------------------------------------------
    //  Listeners
    //---------------------------------------------------
    $scope.$on('scene.selected', function(event, selects) {
      selects.forEach(function(selected){
        Scene.createTransformer($scope.mode);
        Scene.attachTransformer(selected);
      });
  });
  }
]);
