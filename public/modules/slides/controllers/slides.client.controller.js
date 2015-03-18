'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$window', '$upload', 'Authentication', 'Scene', 'Files', 'Tools', 'Nodes', 'FileTypes', 'fileWidgets', 'sceneWidgets', 'Slides', function($scope, $stateParams, $location, $window, $upload, Authentication, Scene, Files, Tools, Nodes, FileTypes, fileWidgets, sceneWidgets, Slides) {
  $scope.authentication = Authentication;

  //---------------------------------------------------
  //  Initialization
  //---------------------------------------------------
  // Find a list of Tools
  $scope.tools = Tools.getTool('sidebar').items;

  // Find a list of file Nodes  
  $scope.fileTree = Nodes.getNode('fileTree').items;
  Files.query(function(filenames) {
    if (filenames && filenames.length > 0) {
      filenames.forEach(function(filename) {
        addFileNode(filename.toLowerCase());
      });
    }
  });

  // Initialize scene
  Scene.initialize();

  // Find a list of scene model Nodes
  $scope.sceneTree = Nodes.getNode('sceneTree').items;
  Scene.queryModels(function(modelnames) {
    modelnames.forEach(function(modelname) {
      addSceneNode(modelname);
    });
  });

  //---------------------------------------------------
  //  Callbacks
  //---------------------------------------------------
  /**
   * Tools callbacks
   */
  // Active a tool set
  $scope.isVisible = false;
  $scope.subTools = [];
  $scope.activeIndex = -1;
  $scope.activateToolset = function(index) {
    if ($scope.activeIndex === -1) {
      $scope.activeIndex = index;
      $scope.isVisible = true;
      $scope.subTools = $scope.tools[index].items;
    } else if ($scope.activeIndex === index) {
      $scope.activeIndex = -1;
      $scope.isVisible = false;
      $scope.subTools = [];
    } else if ($scope.activeIndex !== index) {
      $scope.subTools = $scope.tools[index].items;
      $scope.activeIndex = index;
      $scope.isVisible = $scope.subTools.length > 0 ? true : false;
    }
  };

  // Tool callbacks
  // Activate a tool
  $scope.activateTool = function(index) {
    $scope[$scope.subTools[index].action]();
  };

  // Import model
  $scope.importModel = function() {
    angular.element(document.querySelector('#upload')).triggerHandler('click');
  };

  // Widget callbacks
  // Activate a widget
  $scope.activateWidget = function(action, node) {
    $scope[action](node);
  };

  // Load a file
  $scope.loadFile = function(node) {
    var filename = node.title;

    // Define progress callback
    function onprogress (evt, total) {      
      var perc = (evt.loaded / total).toPrecision(2) * 100;
      console.log('progress: ' + perc + '% ' + filename);
    }

    // Define loaded callback
    function onsuccess (evt, res) {
      console.log('Received vis data ...');
      var data = JSON.parse(res);
      Scene.loadModel(data, function(object){
        addSceneNode(object.displayName.toLowerCase());
      });
    }

    // Define error callback
    function onerror (evt) {
      console.log('Failed to load %s', filename);
    }

    Files.load(filename, onprogress, onsuccess, onerror);
  };

  // Delete a file
  $scope.deleteFile = function(node) {
    var filename = node.title;
    var message = 'Delete ' + filename + ' from server?';
    var res = $window.confirm(message);

    // Define delete callback
    function ondelete (filename) {
      removeFileNode(filename);
    } 

    // Delete file
    if (res === true) {
      Files.delete(filename, ondelete);
    }
  };

  // Remove a model
  $scope.removeModel = function(node) {
    Scene.removeModel(node.title);
    removeSceneNode(node.title);
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
    if (files && files.length) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        $upload.upload({
          url: '/files/upload',
          fields: {
            'user': $scope.authentication.user
          },
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


  // Upload success
  $scope.uploadSuccess = function(data, status, headers, config) {
    // Prepare icon and widgets
    var ext = config.file.name.split('.').reverse()[0];
    var icon = getFileIcon(ext);
    var widgets = getFileWidgets(ext);

    // Insert nodes
    Nodes.addSubNodeItem('fileTree', 'resources', config.file.name, icon, widgets, config.file.name);

    // Log res
    console.log('file ' + config.file.name + 'uploaded. res: ' + data);
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

  // Add file node
  function addFileNode(filename) {
    var ext = filename.split('.').reverse()[0];
    var icon = getFileIcon(ext);
    var widgets = getFileWidgets(ext);
    Nodes.addSubNodeItem('fileTree', 'resources', filename, icon, widgets, filename);
  }

  // Remove file node
  function removeFileNode(filename) {
    Nodes.removeSubNodeItem('fileTree', filename);
  }

  /**
   * Scene related
   */
  // Add scene node
  function addSceneNode(modelname) {
    var widgets = [];
    widgets.push(sceneWidgets[0]);
    Nodes.addSubNodeItem('sceneTree', 'models', modelname, 'glyphicon-knight', widgets, modelname);
  }

  // Remove scene node
  function removeSceneNode(modelname) {
    Nodes.removeSubNodeItem('sceneTree', modelname);
  }
}]);
