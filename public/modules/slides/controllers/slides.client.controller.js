'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$window', '$timeout', '$log', '$upload', 'Authentication', 'Scene', 'Files', 'Tools', 'Trees', 'Dialogs', 'FileTypes', 'fileWidgets', 'sceneWidgets', 'Slides', function($scope, $stateParams, $location, $window, $timeout, $log, $upload, Authentication, Scene, Files, Tools, Trees, Dialogs, FileTypes, fileWidgets, sceneWidgets, Slides) {
  $scope.authentication = Authentication;

  //---------------------------------------------------
  //  Initialization
  //---------------------------------------------------
  // Initialize panel visibility toggle
  $scope.link = null;
  $scope.url = $location.url();
  $scope.isVisible = false;

  // Initialize ticker
  $scope.ticker = 0.0;
  $scope.showTicker = false;

  // Find a list of sidebar Tools
  $scope.sidebarTools = Tools.getTool('sidebar');

  // Find a list of panel Tools
  $scope.panelTools = Tools.getTool('panel');

  // Find a list of file Trees  
  $scope.fileTree = Trees.getTree('fileTree');
  Files.query(function(filenames) {
    if (filenames && filenames.length > 0) {
      filenames.forEach(function(filename) {
        addFileTree(filename.toLowerCase());
      });
    }
  });

  // Initialize scene
  Scene.initialize();

  // Find a list of scene model Trees
  $scope.sceneTree = Trees.getTree('sceneTree');
  Scene.queryModels(function(modelnames) {
    modelnames.forEach(function(modelname) {
      addSceneTree(modelname);
    });
  });

  //---------------------------------------------------
  //  Callbacks
  //---------------------------------------------------
  // Tool callbacks
  $scope.toggleVisibility = function(link) {
    if (link !== $scope.link) {
      $scope.isVisible = true;
      $scope.link = link;
    } else {
      $scope.isVisible = !$scope.isVisible;
    }
  };

  // Import model
  $scope.uploadFiles = function() {
    $scope.modalInstance = Dialogs.uploadFiles();
    //angular.element(document.querySelector('#upload')).triggerHandler('click');
  };

  // Widget callbacks
  // Load a file
  $scope.loadFile = function(tree) {
    var filename = tree.title;

    // Define progress callback
    function onprogress(evt, total) {
      // Set ticker
      $scope.ticker = (evt.loaded / total * 100).toFixed();
      $scope.$apply();

      // Log
      $log.log('progress: ' + $scope.ticker + '% ' + filename);
    }

    // Define success callback
    function onsuccess(evt, res) {
      // Log
      $log.info('Model is loaded successfully.');

      // Load data to scene
      var data = JSON.parse(res);
      Scene.loadModel(data, function(object) {
        // Add scene tree
        addSceneTree(object.displayName.toLowerCase());

        // Reset ticker
        resetTicker();
      });
    }

    // Define error callback
    function onerror(evt) {
      // Log
      $log.error('Failed to load model %s!', filename);

      // Reset ticker
      resetTicker();
    }

    // Load file
    $scope.showTicker = true;
    Files.load(filename, onprogress, onsuccess, onerror);
  };

  // Delete a file
  $scope.deleteFile = function(tree) {
    var filename = tree.title;
    var message = 'Delete ' + filename + ' from server?';
    var res = $window.confirm(message);

    // Define delete callback
    function ondelete(filename) {
      removeFileTree(filename);
    }

    // Delete file
    if (res === true) {
      Files.delete(filename, ondelete);
    }
  };

  // Remove a model
  $scope.removeModel = function(tree) {
    Scene.removeModel(tree.title);
    removeSceneTree(tree.title);
  };

  /**
   * Hidden callbacks
   */
  // Watch on files
  $scope.$watch('files', function() {
    $scope.upload($scope.files);
  });

  // Upload files
  $scope.upload = function(files) {
    // Define progress callback
    function onprogress(evt) {
      // Set ticker
      $scope.ticker = (evt.loaded / evt.total * 100).toFixed();

      // Log
      $log.log('progress: ' + $scope.ticker + '% ' + evt.config.file.name);
    }

    // Define success callback
    function onsuccess(data, status, headers, config) {
      // Log
      $log.info('%s is uploaded successfully.', config.file.name);

      // Prepare icon and widgets
      var ext = config.file.name.split('.').reverse()[0];
      var icon = getFileIcon(ext);
      var widgets = getFileWidgets(ext);

      // Add file tree
      Trees.addSubTreeItem('fileTree', 'resources', config.file.name, icon, widgets, config.file.name);

      // Reset ticker
      resetTicker();
    }

    // Define error callback
    function onerror(err) {
      // Log
      $log.error(err);

      // Reset ticker
      resetTicker();
    }

    // Upload
    $scope.showTicker = true;
    Files.upload(files, onprogress, onsuccess, onerror);
  };

  /**
   * DB callbacks
   */
  // Create new Slide
  $scope.create = function() {
    // Create new Slide object
    var slide = new Slides({
      name: this.name
    });

    // Redirect after save
    slide.$save(function(res) {
      $location.path('slides/' + res._id);

      // Clear form fields
      $scope.name = '';
    }, function(errorres) {
      $scope.error = errorres.data.message;
    });
  };

  // Remove existing Slide
  $scope.remove = function(slide) {
    if (slide) {
      slide.$remove();

      for (var i in $scope.slides) {
        if ($scope.slides[i] === slide) {
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
    }, function(errorres) {
      $scope.error = errorres.data.message;
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
  /**
   * GUI related
   */
  function resetTicker() {
    $timeout(function() {
      $scope.showTicker = false;
      $scope.ticker = 0.0;
      $scope.$apply();
    }, 1000);
  }

  /**
   * File related
   */
  // Get file icon
  function getFileIcon(ext) {
    if (FileTypes.models.indexOf(ext) !== -1) {
      return 'glyphicon-knight';
    } else if (FileTypes.images.indexOf(ext) !== -1) {
      return 'glyphicon-picture';
    } else if (FileTypes.texts.indexOf(ext) !== -1) {
      return 'glyphicon-list-alt';
    } else {
      return 'glyphicon-file';
    }
  }

  // Get widgets associated with file
  function getFileWidgets(ext) {
    var widgets = [];
    if (FileTypes.models.indexOf(ext) !== -1) {
      widgets.push(fileWidgets[0]);
      widgets.push(fileWidgets[1]);
    } else if (FileTypes.images.indexOf(ext) !== -1) {
      widgets.push(fileWidgets[0]);
    } else if (FileTypes.texts.indexOf(ext) !== -1) {
      widgets.push(fileWidgets[0]);
      widgets.push(fileWidgets[2]);
    } else {
      widgets.push(fileWidgets[0]);
    }
    return widgets;
  }

  // Add file tree
  function addFileTree(filename) {
    var ext = filename.split('.').reverse()[0];
    var icon = getFileIcon(ext);
    var widgets = getFileWidgets(ext);
    Trees.addSubTreeItem('fileTree', 'resources', filename, icon, widgets, filename);
  }

  // Remove file tree
  function removeFileTree(filename) {
    Trees.removeSubTreeItem('fileTree', filename);
  }

  /**
   * Scene related
   */
  // Add scene tree
  function addSceneTree(modelname) {
    var widgets = [];
    widgets.push(sceneWidgets[0]);
    Trees.addSubTreeItem('sceneTree', 'models', modelname, 'glyphicon-knight', widgets, modelname);
  }

  // Remove scene tree
  function removeSceneTree(modelname) {
    Trees.removeSubTreeItem('sceneTree', modelname);
  }
}]);
