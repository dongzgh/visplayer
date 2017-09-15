'use strict';

angular.module('core').controller('HomeController', ['$rootScope', '$scope', 'Authentication',
  function($rootScope, $scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);