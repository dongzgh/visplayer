'use strict';


angular.module('core').controller('HomeController', ['$rootScope', '$scope', 'Authentication', 'Languages',
  function($rootScope, $scope, Authentication, Languages) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);