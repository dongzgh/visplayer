'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$window', '$document', '$log', '$controller', '$upload', 'Authentication', 'Scene', 'Files', 'Tools', 'Trees', 'Dialogs', 'FileTypes', 'Slides', function($scope, $stateParams, $location, $window, $document, $log, $controller, $upload, Authentication, Scene, Files, Tools, Trees, Dialogs, FileTypes, Slides) {
  $scope.authentication = Authentication;

  //---------------------------------------------------
  //  Initialization
  //---------------------------------------------------
  // Initialize panel params
  $scope.link = null;
  $scope.showPanel = false;

  // Initialize modal and gui instance
  $scope.modal = null;
  $scope.gui = null;
  $scope.guiTemplate = null;

  // Find a list of tools
  $scope.sidebarTools = Tools.getTool('sidebar');
  $scope.fileTools = Tools.getTool('files');
  $scope.sceneTools = Tools.getTool('scene');
  $scope.modelingTools = Tools.getTool('modeling');

  // Find a list of file tree items
  Trees.emptyTree('files');
  $scope.fileTree = Trees.getTree('files');
  Files.list(function(filenames) {
    if (filenames && filenames.length > 0) {
      filenames.forEach(function(filename) {
        addFileItem(filename.toLowerCase());
      });
    }
  });

  // Initialize scene
  Scene.initialize();

  // Find a list of scene tree items
  Trees.emptyTree('scene');
  $scope.sceneTree = Trees.getTree('scene');
  Scene.queryModels(function(modelnames) {
    modelnames.forEach(function(modelname) {
      addSceneItem(modelname);
    });
  });

  //---------------------------------------------------
  //  Callbacks
  //---------------------------------------------------
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
    if (action !== null && angular.isDefined($scope[action])) $scope[action]();
  };

  // Select tree item.
  $scope.checkItem = function(tree, item) {
    item.checked = !item.checked;
    Trees.checkAllSubTreeItems(tree, item.link, item.checked);
  };


  // Disable tree item check.
  $scope.isCheckDisabled = function(item) {
    if (item.items.length === 0) {
      item.checked = false;
      return true;
    } else {
      return false;
    }
  };

  /**
   * Scene callbacks
   */
  // Take snapshot
  $scope.takeSnapshot = function() {
    var el = $document[0].getElementById('canvas').children[0];
    var url = el.toDataURL('image/png');
    downloadData(url, 'screenshot.png');
  };

  // Remove objects
  $scope.removeObjects = function() {
    // Get checked objects
    var objnames = getCheckedItems('scene');

    // Remove objects
    objnames.forEach(function(objname) {
      Scene.removeObject(objname);
      Trees.removeSubTreeItem('scene', objname);
    });
  };

  /**
   * File callbacks
   */
  // Import files
  $scope.uploadFiles = function() {
    $scope.modal = Dialogs.uploadFiles();
  };

  // Download files
  $scope.downloadFiles = function() {
    // Get selected filenames
    var filenames = getCheckedItems('files');

    // Define success callback
    function onsuccess(data, filename) {
      var blob = new $window.Blob([data]);
      var windowURL = $window.URL || $window.webkitURL;
      var url = windowURL.createObjectURL(blob);
      downloadData(url, filename);
    }

    // Download file
    Files.download(filenames, onsuccess);
  };

  // Load files
  $scope.loadFiles = function() {
    // Get selected filenames
    var filenames = getCheckedItems('files');

    // Define success callback
    function onsuccess(res) {
      var data = JSON.parse(res);
      Scene.loadModel(data, function(object) {
        addSceneItem(object.displayName.toLowerCase());
      });
    }

    // Load file
    Files.load(filenames, null, onsuccess);
  };

  // Delete files
  $scope.deleteFiles = function() {
    // Get selected filenames
    var filenames = getCheckedItems('files');

    // Define success callback
    function onsuccess(filename) {
      Trees.removeSubTreeItem('files', filename);
    }

    // Define error callback
    function onerror(filename) {
      $window.alert('Failed to delete: ' + filename);
    }

    // Delete files
    Files.delete(filenames, onsuccess, onerror);
  };

  /**
   * Modeling callbacks
   */
  // View callbacks
  $scope.fitView = Scene.fitView;
  $scope.topView = Scene.topView;
  $scope.bottomView = Scene.bottomView;
  $scope.leftView = Scene.leftView;
  $scope.rightView = Scene.rightView;

  // Picking callbacks
  $scope.clearView = Scene.clearView;
  $scope.pickModel = Scene.pickModel;
  $scope.pickFace = Scene.pickFace;
  $scope.pickEdge = Scene.pickEdge;

  // Transform model
  $scope.moveModel = Scene.moveModel;
  $scope.rotateModel = Scene.rotateModel;
  $scope.scaleModel = Scene.scaleModel;

  // Transform model
  $scope.transformModel = function() {
    $scope.guiTemplate = 'modules/core/views/transform-models.client.view.html';
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

  // Listener for gui-dialog
  $scope.$on('gui-dialog.close', function(event) {
    $scope.guiTemplate = null;
  });

  //---------------------------------------------------
  //  Utilities
  //---------------------------------------------------
  /**
   * GUI related
   */
  // Get checked subtree items
  function getCheckedItems(treeId) {
    var items = Trees.getCheckedSubTreeItems(treeId);
    var names = [];
    items.forEach(function(item) {
      names.push(item.title);
    });
    return names;
  }

  /**
   * File related
   */
  // Get file icon
  function getFileIcon(ext) {
    if (FileTypes.models.indexOf(ext) !== -1) {
      return 'glyphicon-knight';
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
    } else {
      Trees.addSubTreeItem('files', 'others', filename, icon, filename);
    }
  }

  // Download data
  function downloadData(url, filename) {
    var el = $document[0].getElementById('download');
    el.href = url;
    el.download = filename;
    el.click();
  }

  /**
   * Scene related
   */
  // Add scene item to tree
  function addSceneItem(modelname) {
    Trees.addSubTreeItem('scene', 'models', modelname, 'glyphicon-knight', modelname);
  }
}]);
