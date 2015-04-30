'use strict';

angular.module('core').controller('TransformModelsController', ['$rootScope', '$scope', '$window', '$log',

  function($rootScope, $scope, $window, $log) {
    // Initialize
    $scope.mode = 'Translate';

    // Define OK callback
    $scope.onOK = function () {
      $window.alert('OK button is clicked!');
    };

    // Define Apply callback
    $scope.onApply = function() {
      $window.alert('Apply button is clicked!');
    };

    // Define Cancel callback
    $scope.onCancel = function() {
      $rootScope.$broadcast('gui-dialog.cancel');
    };
  }
]);
