'use strict';

angular.module('core').controller('TransformController', ['$rootScope', '$scope', '$log',
  function($rootScope, $scope, $log) {
    // State variables
    $scope.enablePicking = true;

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
