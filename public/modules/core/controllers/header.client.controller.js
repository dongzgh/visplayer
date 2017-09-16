'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', 'Authentication', 'Menus',
  function($rootScope, $scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');

    // Toggle collapsible menu.
    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Activete working mode.
    $scope.changeMode = function(item) {
      $rootScope.mode = item.title;
      $rootScope.$broadcast('mode.change');
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });
  }
]);