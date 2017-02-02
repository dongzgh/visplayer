'use strict';

//Setting up route
angular.module('slides').config(['$stateProvider',
  function($stateProvider) {
    // Slides state routing
    $stateProvider.
    state('editSlide', {
      url: '/slides/edit',
      templateUrl: 'modules/slides/views/edit-slide.client.view.html'
    }).
    state('editSlide.Files', {
      url: '/files',
      templateUrl: 'modules/slides/views/edit-slide-files.client.view.html'
    }).
    state('editSlide.Scene', {
      url: '/scene',
      templateUrl: 'modules/slides/views/edit-slide-scene.client.view.html'
    }).
    state('editSlide.Modeling', {
      url: '/modeling',
      templateUrl: 'modules/slides/views/edit-slide-modeling.client.view.html'
    });    
  }
]);
