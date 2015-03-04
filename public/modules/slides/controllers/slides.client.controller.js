'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$upload', 'Authentication', 'Slides', 'Tools', 'Nodes', 'fileTypes', function($scope, $stateParams, $location, $upload, Authentication, Slides, Tools, Nodes, fileTypes) {
		$scope.authentication = Authentication;

		//---------------------------------------------------
		//  Initialization
		//---------------------------------------------------
		// Find a list of Tools
		$scope.tools = Tools.getTool('sidebar').items;

		// Find a list of Nodes
		$scope.tree  = Nodes.getNode('tree').items;

		//---------------------------------------------------
		//  Callbacks
		//---------------------------------------------------
		// Active a Tool set
		$scope.isVisible = false;
		$scope.subTools = [];
		$scope.activeIndex = -1;
		$scope.activeTool = function (index) {
			if($scope.activeIndex === -1) {
				$scope.activeIndex = index;
				$scope.isVisible = true;
				$scope.subTools = $scope.tools[index].items;
			} else if($scope.activeIndex === index) {
				$scope.activeIndex = -1;
				$scope.isVisible = false;
				$scope.subTools = [];
			} else if($scope.activeIndex !== index) {
				$scope.subTools = $scope.tools[index].items;
				$scope.activeIndex = index;
				$scope.isVisible = $scope.subTools.length > 0 ? true : false;
			}
		};

		// Dispatch actions
		$scope.action = function (index) {
			$scope[$scope.subTools[index].action]();
		};

		// Import model
		$scope.importModel = function () {
			angular.element(document.querySelector('#upload')).triggerHandler('click');
		};

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

		//---------------------------------------------------
		//  Utilities
		//---------------------------------------------------
		$scope.$watch('files', function () {
        $scope.upload($scope.files);
    });


		$scope.upload = function (files) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          $upload.upload({
              url: '/upload',
              fields: {'user': Authentication.user},
              file: file
          }).progress($scope.uploadProgress).success($scope.uploadSuccess);
        }
      }
    };

    $scope.uploadProgress = function(evt) {
    	 var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
       console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
    };

    $scope.uploadSuccess = function (data, status, headers, config) {
    	var widgets = [];
    	var ext = config.file.name.split('.').reverse()[0];
    	var icon = '';
    	if(fileTypes.models.indexOf(ext) !== -1) {
    		icon = 'glyphicon-king';
    	} else if (fileTypes.images.indexOf(ext) !== -1) {
    		icon = 'glyphicon-picture';
    	} else if (fileTypes.texts.indexOf(ext) !== -1) {
    		icon = 'glyphicon-list-alt';
    	} else {
    		icon = 'glyphicon-file';
    	}
    	Nodes.addSubNodeItem('tree', 'resources', config.file.name, icon, [], config.file.name);
    	console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
    };
	}
]);
