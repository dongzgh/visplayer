'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$window', '$timeout', '$log', '$upload', 'Authentication', 'Scene', 'Files', 'Tools', 'Trees', 'Dialogs', 'FileTypes', 'Slides', function($scope, $stateParams, $location, $window, $timeout, $log, $upload, Authentication, Scene, Files, Tools, Trees, Dialogs, FileTypes, Slides) {
  $scope.authentication = Authentication;

  //---------------------------------------------------
  //  Initialization
  //---------------------------------------------------
  // Initialize panel params
  $scope.link = null;
  $scope.showPanel = false;

  // Initialize modal instance
  $scope.modalInstance = null;

  // Initialize ticker
  $scope.ticker = 0.0;
  $scope.showTicker = false;

  // Find a list of tools
  $scope.sidebarTools = Tools.getTool('sidebar');
  $scope.viewTools = Tools.getTool('views');
  $scope.sceneTools = Tools.getTool('scene');
  $scope.fileTools = Tools.getTool('files');
  $scope.modelingTools = Tools.getTool('modeling');
  $scope.materialTools = Tools.getTool('materials');
  $scope.markupTools = Tools.getTool('markups');

  // Find a list of file tree items
  $scope.fileTree = Trees.getTree('files');
  Files.query(function(filenames) {
    if (filenames && filenames.length > 0) {
      filenames.forEach(function(filename) {
        addFileItem(filename.toLowerCase());
      });
    }
  });

  // Initialize scene
  Scene.initialize();

  // Find a list of scene tree items
  $scope.sceneTree = Trees.getTree('scene');
  Scene.queryModels(function(modelnames) {
    modelnames.forEach(function(modelname) {
      addSceneItem(modelname);
    });
  });

  //---------------------------------------------------
  //  Callbacks
  //---------------------------------------------------
  // Tool callbacks
  // Activate the panel
  $scope.activatePanel = function(link) {
    if (link !== $scope.link) {
      $scope.showPanel = true;
      $scope.link = link;
      $location.url(link);
    } else {
      $scope.showPanel = !$scope.showPanel;
    }
  };

  // Activate a tool
  $scope.activateTool = function(action) {
    $scope[action]();
  };

  // Import files
  $scope.uploadFiles = function() {
    $scope.modalInstance = Dialogs.uploadFiles();
  };

  // Download files
  $scope.downloadFiles = function() {
    var items = Trees.getCheckedSubTreeItems('files');
    // TODO: downloa files from server
  };

  // Load files
  $scope.loadFiles = function(item) {
    // Define progress callback
    function onprogress(perc) {
      $scope.ticker = perc;
      $scope.$apply();
    }

    // Define success callback
    function onsuccess(res) {
      var data = JSON.parse(res);
      Scene.loadModel(data, function(object) {
        addSceneItem(object.displayName.toLowerCase());
        resetTicker();
      });
    }

    // Define error callback
    function onerror(evt) {
      resetTicker();
    }

    // Load file
    var filename = item.title;
    $scope.showTicker = true;
    Files.load(filename, onprogress, onsuccess, onerror);
  };

  // Delete files
  $scope.deleteFiles = function() {
    // Get selected files
    var items = Trees.getCheckedSubTreeItems('files');

    // Collect filenames
    var filenames = [];
    items.forEach(function(item){
      filenames.push(item.title);
    });

    // Define success callback
    function onsuccess(passed) {
      passed.forEach(function(filename) {
        Trees.removeSubTreeItem('files', filename);
      });
    }

    // Define error callback
    function onerror(failed) {
      var msg = 'Failed to delete:\n';
      failed.forEach(function(filename) {
        msg += filename + '\n';
      });
      $window.alert(msg);
    }

    // Delete files
    Files.delete(filenames, onsuccess, onerror);
  };

  // Remove models
  $scope.removeObjects = function(item) {
    var objectname = item.title;
    Scene.removeObject(objectname);
    Trees.removeSubTreeItem('scene', objectname);
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
  //  Listeners
  //---------------------------------------------------
  // Listener for upload-files.success
  $scope.$on('upload-files.success', function(event, filename) {
    addFileItem(filename);
  });

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

  // Add file item to tree
  function addFileItem(filename) {
    var ext = filename.split('.').reverse()[0];
    var icon = getFileIcon(ext);
    if (FileTypes.models.indexOf(ext) !== -1) {
      Trees.addSubTreeItem('files', 'models', filename, icon, filename);
    } else if (FileTypes.images.indexOf(ext) !== -1) {
      Trees.addSubTreeItem('files', 'images', filename, icon, filename);
    } else if (FileTypes.texts.indexOf(ext) !== -1) {
      Trees.addSubTreeItem('files', 'texts', filename, icon, filename);
    } else {
      Trees.addSubTreeItem('files', 'others', filename, icon, filename);
    }
  }

  /**
   * Scene related
   */
  // Add scene item to tree
  function addSceneItem(modelname) {
    Trees.addSubTreeItem('scene', 'models', modelname, 'glyphicon-knight', modelname);
  }
}]);
