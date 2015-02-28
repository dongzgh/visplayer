'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Slides', 'Tools',
	function($scope, $stateParams, $location, Authentication, Slides, Tools) {
		$scope.authentication = Authentication;

		// Find a list of Tools
		$scope.tool = Tools.getTool('sidebar');

		// Create new Slide
		$scope.create = function() {
			// Create new Slide object
			var slide = new Slides ({
				name: this.name
			});

			// Redirect after save
			slide.$save(function(response) {
				$location.path('slides/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Slide
		$scope.remove = function(slide) {
			if ( slide ) { 
				slide.$remove();

				for (var i in $scope.slides) {
					if ($scope.slides [i] === slide) {
						$scope.slides.splice(i, 1);
					}
				}
			} else {
				$scope.slide.$remove(function() {
					$location.path('slides');
				});
			}
		};

		// Update existing Slide
		$scope.update = function() {
			var slide = $scope.slide;

			slide.$update(function() {
				$location.path('slides/' + slide._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Slides
		$scope.find = function() {
			$scope.slides = Slides.query();
		};

		// Find existing Slide
		$scope.findOne = function() {
			$scope.slide = Slides.get({ 
				slideId: $stateParams.slideId
			});
		};
	}
]);