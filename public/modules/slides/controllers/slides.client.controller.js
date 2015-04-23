'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$window', '$timeout', '$log', '$upload', 'Authentication', 'Scene', 'Files', 'Tools', 'Trees', 'Dialogs', 'FileTypes', 'fileWidgets', 'sceneWidgets', 'Slides', function($scope, $stateParams, $location, $window, $timeout, $log, $upload, Authentication, Scene, Files, Tools, Trees, Dialogs, FileTypes, fileWidgets, sceneWidgets, Slides) {
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
  $scope.fileTree = Trees.getTree('fileTree');
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
  $scope.sceneTree = Trees.getTree('sceneTree');
  Scene.queryModels(function(modelnames) {
    modelnames.forEach(function(modelname) {
      addSceneItem(modelname);
    });
  });

  //---------------------------------------------------
  //  Callbacks
  //---------------------------------------------------
  // Tool callbacks
  // Activate a tool
  $scope.activateTool = function(action) {
    $scope[action]();
  };

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

  // Import files
  $scope.uploadFiles = function() {
    $scope.modalInstance = Dialogs.uploadFiles();
  };

  // Widget callbacks
  // Activate a widget
  $scope.activateWidget = function(action, subItem) {
    $scope[action](subItem);
  };

  // Download a file
  $scope.downloadFile = function(item) {
    $log.log('Download %s', item.title);
  };

  // Load a file
  $scope.loadFile = function(item) {
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

  // Delete a file
  $scope.deleteFile = function(item) {
    // Define delete callback
    function onsuccess(res) {
      Trees.removeSubTreeItem('fileTree', filename);
    }

    // Confirm deletion
    var filename = item.title;
    var msg = 'Delete ' + filename + ' from server?';
    var ret = $window.confirm(msg);

    // Delete file
    if (ret === true) {
      Files.delete(filename, onsuccess);
    }
  };

  // Remove a model
  $scope.removeModel = function(item) {
    var modelname = item.title;
    Scene.removeModel(modelname);
    Trees.removeSubTreeItem('sceneTree', modelname);
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

  // Get widgets associated with file
  function getFileWidgets(ext) {
    var widgets = [];
    if (FileTypes.models.indexOf(ext) !== -1) {
      widgets.push(fileWidgets.Delete);
      widgets.push(fileWidgets.Download);
      widgets.push(fileWidgets.Load);
    } else if (FileTypes.images.indexOf(ext) !== -1) {
      widgets.push(fileWidgets.Delete);
      widgets.push(fileWidgets.Download);
      widgets.push(fileWidgets.Load);
    } else if (FileTypes.texts.indexOf(ext) !== -1) {
      widgets.push(fileWidgets.Delete);
      widgets.push(fileWidgets.Download);
      widgets.push(fileWidgets.Edit);
    } else {
      widgets.push(fileWidgets.Delete);
    }
    return widgets;
  }

  // Add file item to tree
  function addFileItem(filename) {
    var ext = filename.split('.').reverse()[0];
    var icon = getFileIcon(ext);
    var widgets = getFileWidgets(ext);
    if (FileTypes.models.indexOf(ext) !== -1) {
      Trees.addSubTreeItem('fileTree', 'models', filename, icon, widgets, filename);
    } else if (FileTypes.images.indexOf(ext) !== -1) {
      Trees.addSubTreeItem('fileTree', 'images', filename, icon, widgets, filename);
    } else if (FileTypes.texts.indexOf(ext) !== -1) {
      Trees.addSubTreeItem('fileTree', 'texts', filename, icon, widgets, filename);
    } else {
      Trees.addSubTreeItem('fileTree', 'others', filename, icon, widgets, filename);
    }
  }

  /**
   * Scene related
   */
  // Add scene item to tree
  function addSceneItem(modelname) {
    var widgets = [];
    widgets.push(sceneWidgets.Remove);
    Trees.addSubTreeItem('sceneTree', 'models', modelname, 'glyphicon-knight', widgets, modelname);
  }
}]);
