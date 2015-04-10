'use strict';

//Setting up route
angular.module('slides').config(['$stateProvider',
  function($stateProvider) {
    // Slides state routing
    $stateProvider.
    state('listSlides', {
      url: '/slides',
      templateUrl: 'modules/slides/views/list-slides.client.view.html'
    }).
    state('createSlide', {
      url: '/slides/create',
      templateUrl: 'modules/slides/views/create-slide.client.view.html'
    }).
    state('createSlide.Views', {
      url: '/views',
      templateUrl: 'modules/slides/views/create-slide-views.client.view.html'
    }).
    state('createSlide.Files', {
      url: '/files',
      templateUrl: 'modules/slides/views/create-slide-files.client.view.html'
    }).
    state('createSlide.Tools', {
      url: '/tools',
      templateUrl: 'modules/slides/views/create-slide-tools.client.view.html'
    }).
    state('createSlide.Materials', {
      url: '/materials',
      templateUrl: 'modules/slides/views/create-slide-materials.client.view.html'
    }).
    state('createSlide.Markups', {
      url: '/markups',
      templateUrl: 'modules/slides/views/create-slide-markups.client.view.html'
    }).
    state('viewSlide', {
      url: '/slides/:slideId',
      templateUrl: 'modules/slides/views/view-slide.client.view.html'
    }).
    state('editSlide', {
      url: '/slides/:slideId/edit',
      templateUrl: 'modules/slides/views/edit-slide.client.view.html'
    });
  }
]);
