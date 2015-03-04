'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$upload', 'Authentication', 'Files', 'Tools', 'Nodes', 'fileTypes', 'Slides', function($scope, $stateParams, $location, $upload, Authentication, Files, Tools, Nodes, fileTypes, Slides) {
    $scope.authentication = Authentication;

		//---------------------------------------------------
		//  Initialization
		//---------------------------------------------------
		// Find a list of Tools
		$scope.tools = Tools.getTool('sidebar').items;

		// Find a list of Nodes
		$scope.tree  = Nodes.getNode('tree').items;
    $scope.filenames = Files.query({username: $scope.authentication.user.username}, function (filenames) {
      if (filenames && filenames.length) {
        for (var i = 0; i < filenames.length; i++) {
          var filename = filenames[i];

          // Prepare icon and widgets
          var ext = filename.split('.').reverse()[0];
          var icon = $scope.getFileIcon(ext);
          var widgets = $scope.getFileWidgets(ext);

          // Insert nodes
          Nodes.addSubNodeItem('tree', 'resources', filename, icon, widgets, filename);
        }
      }
    });

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

		// Activate a tool
		$scope.activateTool = function (index) {
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

    // Activate a widget
    $scope.activateWidget = function (action) {
      $scope[action]();
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
    // Watch on files
		$scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    // Upload files
		$scope.upload = function (files) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          $upload.upload({
              url: '/files/upload',
              fields: {'user': $scope.authentication.user},
              file: file
          }).progress($scope.uploadProgress).success($scope.uploadSuccess);
        }
      }
    };

    // Upload progress
    $scope.uploadProgress = function(evt) {
    	 var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
       console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
    };

    // Get file icon
    $scope.getFileIcon = function (ext) {
      if(fileTypes.models.indexOf(ext) !== -1) {
        return 'glyphicon-king';
      } else if (fileTypes.images.indexOf(ext) !== -1) {
        return 'glyphicon-picture';
      } else if (fileTypes.texts.indexOf(ext) !== -1) {
        return 'glyphicon-list-alt';
      } else {
        return 'glyphicon-file';
      }
    };

    // Get widgets associated with file
    $scope.getFileWidgets = function (ext) {
      // Default widgets
      var widget1 = {name: 'Delete', action: 'deleteFile', icon: 'glyphicon-remove'};
      var widget2 = {name: 'Load', action: 'loadModel', icon: 'glyphicon-download'};
      var widget3 = {name: 'Edit', action: 'editFile', icon: 'glyphicon-edit'};

      // Populate widgets
      var widgets = [];
      if(fileTypes.models.indexOf(ext) !== -1) {
        widgets.push(widget1);
        widgets.push(widget2);
      } else if (fileTypes.images.indexOf(ext) !== -1) {
        widgets.push(widget1);
      } else if (fileTypes.texts.indexOf(ext) !== -1) {
        widgets.push(widget1);
        widgets.push(widget3);
      } else {
        widgets.push(widget1);
      }

      return widgets;
    };

    // Upload success
    $scope.uploadSuccess = function (data, status, headers, config) {
    	// Prepare icon and widgets
      var ext = config.file.name.split('.').reverse()[0];
      var icon = $scope.getFileIcon(ext);
      var widgets = $scope.getFileWidgets(ext);

    	// Insert nodes
    	Nodes.addSubNodeItem('tree', 'resources', config.file.name, icon, widgets, config.file.name);

    	// Log response
    	console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
    };
	}
]);
