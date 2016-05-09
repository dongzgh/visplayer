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
    state('editSlide.Views', {
      url: '/views',
      templateUrl: 'modules/slides/views/edit-slide-views.client.view.html'
    }).
    state('editSlide.Scene', {
      url: '/scene',
      templateUrl: 'modules/slides/views/edit-slide-scene.client.view.html'
    }).
    state('editSlide.Files', {
      url: '/files',
      templateUrl: 'modules/slides/views/edit-slide-files.client.view.html'
    }).
    state('editSlide.Modeling', {
      url: '/modeling',
      templateUrl: 'modules/slides/views/edit-slide-modeling.client.view.html'
    }).
    state('editSlide.Materials', {
      url: '/materials',
      templateUrl: 'modules/slides/views/edit-slide-materials.client.view.html'
    }).
    state('editSlide.Markups', {
      url: '/markups',
      templateUrl: 'modules/slides/views/edit-slide-markups.client.view.html'
    }).
    state('listSlides', {
      url: '/slides',
      templateUrl: 'modules/slides/views/list-slides.client.view.html'
    }).
    state('viewSlide', {
      url: '/slides/:slideId',
      templateUrl: 'modules/slides/views/view-slide.client.view.html'
    });
  }
]);
