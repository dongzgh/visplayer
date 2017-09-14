'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  // Init module configuration options
  var applicationModuleName = 'visplayer';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') window.location.hash = '#!';

	// Fixing google bug with redirect
	if (window.location.href[window.location.href.length - 1] === '#' &&
			// for just the error url (origin + /#)
			(window.location.href.length - window.location.origin.length) === 2) {
			window.location.href = window.location.origin + '/#!';
	}

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('core');

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('slides');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring file type constants
angular.module('core').constant('FileTypes', {
  'models': ['vis', 'ply', 'obj']
});

angular.module('core').run(['Menus',
  function(Menus) {
  	// Set topbar menu items
    Menus.addMenuItem('topbar', 'vis3D', 'slides/edit');
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');

    // Home state routing
    $stateProvider.
    state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);
'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', 'Authentication', 'Menus',
  function($rootScope, $scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');

    // Toggle collapsible menu.
    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Activete working mode.
    $scope.changeMode = function (item) {
      $rootScope.mode = item.title;
      $rootScope.$broadcast('mode.change');
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });
  }
]);
'use strict';

angular.module('core').controller('HomeController', ['$rootScope', '$scope', 'Authentication', 'Languages',
  function($rootScope, $scope, Authentication, Languages) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);
'use strict';

angular.module('core').controller('TranslateController', ['$rootScope', '$window', '$scope', '$log', 'Scene', 'Languages',
  function($rootScope, $window, $scope, $log, Scene, Languages) {
    // State variables
    $scope.enablePicking = true;
    $scope.language = Languages.localization();

    // Enable selection
    Scene.selectType = Scene.GEOMETRY_TYPES.model;
    Scene.selectMode = Scene.SELECTION_MODES.single;
    Scene.displaySelect = false;
    $scope.mode = 'translate';
    $scope.x = 0.0;
    $scope.y = 0.0;
    $scope.z = 0.0;
    var selected;
    var stack = [];

    //---------------------------------------------------
    //  Callbacks
    //---------------------------------------------------
    // On undo
    $scope.onUndo = function () {
      if(stack.length === 1) {
        let object = stack[0];
        selected.copy(object, false);
      }      
      else if(stack.length > 1) {
        let object = stack.pop();
        if(selected.matrix.equals(object.matrix))
          $scope.onUndo();
        else
          selected.copy(object, false);
      }
    };

  	// On OK
  	$scope.onOK = function() {
      $scope.onApply();
      selected.data.matrixWorld = selected.matrixWorld;
      Scene.viewClear();
      Scene.clearSelection();
      Scene.deleteTransformer();
  		$rootScope.$broadcast('dialog.close');
  	};

    // On Apply.
    $scope.onApply = function() {
      if(selected === undefined) return;
      selected.translateX($scope.x);
      selected.translateY($scope.y);
      selected.translateZ($scope.z);
  	};

  	// On Cancel
  	$scope.onCancel = function() {
      Scene.viewClear();
      Scene.clearSelection();
      Scene.deleteTransformer();
      if(stack.length > 0) {
        selected.copy(stack[0], false);
        stack = [];
      }
  		$rootScope.$broadcast('dialog.close');
  	};

    //---------------------------------------------------
    //  Listeners
    //---------------------------------------------------
    $scope.$on('scene.transformer.update', function (event){
      event.preventDefault();
      stack.push(selected.clone());
    });

    $scope.$on('scene.selected', function(event, selects) {
      event.preventDefault();
      if(Scene.createTransformer($scope.mode, selects[0])) {
        selected = selects[0];
        stack.push(selects[0].clone());
      }
    });
  }
]);

'use strict';

angular.module('core').controller('UploadController', ['$rootScope', '$scope', '$log', '$uibModalInstance', 'Files',
  function($rootScope, $scope, $log, $uibModalInstance, Files) {
    // Initialize file name list
    $scope.files = [];
    $scope.names = [];

    // Collect files
    $scope.collect = function(files) {
      // Check input data
      if (files === undefined || files.length <= 0) return;

      // Collect files
      $scope.names = [];
      files.forEach(function(file) {
        $scope.names.push(file.name);
      });
    };

    // Watch on files
    $scope.$watch('files', function() {
      $scope.collect($scope.files);
    });

    // Upload files
    $scope.upload = function() {
      // Define success callback
      function onsuccess(config) {
        $rootScope.$broadcast('upload.success', config.file.name);
      }

      // Define final callback
      function onfinal(passed, failed) {
        if (passed.length === $scope.files.length) {
          $uibModalInstance.dismiss('success');
        } else {
          $uibModalInstance.dismiss('failed');
        }
      }

      if ($scope.files.length > 0)
        Files.upload($scope.files, null, onsuccess, null, onfinal);
    };
  }
]);

'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Dialogs', ['$window', '$uibModal', 
  function($window, $uibModal) {
    // Upload modal dialog
    this.upload = function() {
      return $uibModal.open({
        templateUrl: 'modules/core/views/upload.client.view.html',
        controller: 'UploadController',
        size: 'sm'
      });
    };

    // Transform dialog
    this.translate = function() {
      return 'modules/core/views/translate.client.view.html';
    };
  }
]);

'use strict';

// Files service used to communicate Files REST endpoints
angular.module('core').service('Files', ['$resource', '$http', '$window', '$log', '$upload', 'Authentication', 
  function($resource, $http, $window, $log, $upload, Authentication) {
    var authentication = Authentication;

    // Define file resouce binding
    var rc = $resource('files/:fileName', {
      fileName: '@fileName'
    }, {
      update: {
        method: 'PUT'
      }
    });

    // Decrypt encrypted data
    this.decryptData = function(data, userId) {
      var raw = JSON.parse(data);
      var params = $window.CryptoJS.lib.CipherParams.create({
        ciphertext: $window.CryptoJS.enc.Hex.parse(raw.ciphertext)
      });
      var salt = $window.CryptoJS.enc.Hex.parse(raw.salt);
      var key = $window.CryptoJS.EvpKDF(userId, salt, {
        keySize: 128 / 32
      });
      var iv = $window.CryptoJS.enc.Hex.parse(raw.iv);
      var dec = $window.CryptoJS.AES.decrypt(params, key, {
        iv: iv,
        mode: $window.CryptoJS.mode.CBC
      });
      var res = dec.toString($window.CryptoJS.enc.Utf8);
    };

    // Define upload method
    this.upload = function(files, onprogress, onsuccess, onerror, onfinal) {
      // Check input data
      if (files === undefined || files.length <= 0) return;

      // Upload each file
      var passed = [];
      var failed = [];
      files.forEach(function(file, index) {
        // Define progress callback
        function cbprogress(update) {
          var progress = (update.loaded / update.total * 100).toFixed();
          $log.log('progress: ' + progress + '% ' + update.config.file.name);
          if (onprogress) onprogress(progress);
        }

        // Define success callback
        function cbsuccess(data, status, getHeaders, config) {
          passed.push(config.file.name);
          $log.info('%s is uploaded successfully.', config.file.name);
          if (onsuccess) onsuccess(config);
          cbfinal();
        }

        // Define error callback
        function cberror(data, status, getHeaders, config) {
          failed.push(config.file.name);
          $log.error('Failed to upload %s.', config.file.name);
          if (onerror) onerror(config);
          cbfinal();
        }

        // Define final callback
        function cbfinal() {
          if (index === files.length - 1 && onfinal) onfinal(passed, failed);
        }

        // Send request
        $upload.upload({
          url: '/upload',
          file: file
        }).progress(cbprogress).success(cbsuccess).error(cberror);
      });
    };

    // Define query method
    this.list = function(onsuccess) {
      // Define success callback
      function cbsuccess(data, getHeaders) {
        if (onsuccess) onsuccess(data);
      }

      // Send request
      rc.query(cbsuccess);
    };

    // Define download method
    this.download = function(fileNames, onsuccess, onerror) {
      // Check input data
      if (fileNames === undefined || fileNames.length <= 0) return;

      // Download each file
      fileNames.forEach(function(fileName) {
        // Define success callback
        function cbsuccess(data, status, getHeaders, config) {
          if (data && onsuccess) onsuccess(data, fileName);
        }

        // Define error callback
        function cberror(data, status, getHeaders, config) {
          if (onerror) onerror(status);
        }

        // Send request
        var url = 'files/' + fileName;
        $http.get(url, {
            params: {
              mode: 'download'
            },
            responseType: 'blob'
          })
          .success(cbsuccess)
          .error(cberror);
      });
    };

    // Deinfe load method
    this.load = function(fileNames, onprogress, onsuccess, onerror) {
      // Check input data
      if (fileNames === undefined || fileNames.length <= 0) return;

      // Load each file
      fileNames.forEach(function(fileName) {
        // Define progress callback
        function cbprogress(evt) {
          var total = req.getResponseHeader('ContentLength');
          var progress = (evt.loaded / total * 100).toFixed();
          $log.log('progress: ' + progress + '% ' + fileName);
          if (onprogress) onprogress(progress);
        }

        // Define success callback
        function cbsuccess(evt) {
          // // Decrypt encrypted data
          //decryptData(req.responseText, authentication.user._id);
          $log.info('%s is loaded successfully.', fileName);
          if (onsuccess) onsuccess(req.response);
        }

        // Define error callback
        function cberror(evt) {
          $log.error('Failed to load %s.', fileNames);
          if (onerror) onerror(evt);
        }

        // Initialize XMLHttpRequest
        var req = new $window.XMLHttpRequest();

        // Add event listeners
        req.addEventListener('progress', cbprogress, false);
        req.addEventListener('load', cbsuccess, false);
        req.addEventListener('error', cberror, false);

        // Send request
        req.open('get', 'files/' + fileName, true);
        req.send();
      });
    };

    // Define delete method
    this.delete = function(fileNames, onsuccess, onerror) {
      // Check input data
      if (fileNames === undefined || fileNames.length <= 0) return;

      // Delete each file
      fileNames.forEach(function(fileName) {
        // Define success callback
        function cbsuccess(data, getHeader) {
          $log.info('%s is deleted successfully.', fileName);
          if (onsuccess) onsuccess(fileName);
        }

        // Define error callback
        function cberror(data) {
          $log.error('Failed to delete %s!', fileName);
          if (onerror) onerror(fileName);
        }

        // Send request
        rc.delete({
          fileName: fileName
        }, cbsuccess, cberror);
      });
    };
  }
]);

'use strict';

//Files service used to communicate languages REST endpoints
angular.module('core').service('Languages', [
  function() {
    this.code = 'eng';
    this.localization = function (language) {
      if(language !== undefined)
        this.code = language;
      switch (this.code) {
        case 'eng':
          return {
            sidebar: {
              files: 'List of files',
              scene: 'List of scene objects',
              modeling: 'List of modeling tools' 
            },
            files: {
              upload: 'Upload files to server',
              download: 'Download files from server',
              load: 'Load files into scene',
              delete: 'Delete files from server'
            },
            scene: {
              snapshot: 'Take a snapshot of scene',
              delete: 'Delete objects from scene'
            },
            modeling: {
              createBox: 'Create Box',
              serialize: 'Serialize',
              viewFit: 'Fit view',
              viewTop: 'Top view',
              viewBottom: 'Bottom view',
              viewLeft: 'Left view',
              viewRight: 'Right view',
              viewFront: 'Front view',
              viewBack: 'Back view',
              viewClear: 'Clear view',
              pickModel: 'Pick model',
              pickFace: 'Pick face',
              pickEdge: 'Pick edge',
              pickCurve: 'Pick curve',
              pickPoint: 'Pick point',
              displayShaded: 'Shaded display',
              displayRendered: 'Rendered display',
              displayAnalysis: 'Analysis display',
              displayMesh: 'Mesh display',
              displayWireframe: 'Wireframe display',
              translate: 'Translate model'
            },
            dialogTranslate: {
              pickModel: 'Pick a model',
              x: 'x value',
              y: 'y value',
              z: 'z value',
              ok: 'OK',
              cancel: 'Cancel'
            }
          };
        default:
          return undefined;
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
	function() {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function(user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function(menuId) {
      if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
        }
			} else {
				throw new Error('MenuId was not provided');
      }

			return false;
    };

    // Get the menu object by menu id
    this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function(menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || ('/' + menuItemURL),
        isPublic: ((isPublic === null || isPublic === undefined) ? this.menus[menuId].isPublic : isPublic),
        roles: ((roles === null || roles === undefined) ? this.menus[menuId].roles : roles),
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || ('/' + menuItemURL),
            isPublic: ((isPublic === null || isPublic === undefined) ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || roles === undefined) ? this.menus[menuId].items[itemIndex].roles : roles),
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
    this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar');
  }
]);
'use strict';

//Scene service used for managing scene
angular.module('core').service('Scene', ['$rootScope', '$window', '$document', '$log',
  function($rootScope, $window, $document, $log) {
    //---------------------------------------------------
    //  Initialization
    //---------------------------------------------------
    var scope = this;

    // Static variables
    var SIZE_BOX = 2000;
    var SIZE_GAP = 100;
    var CAMERA_ANGLE = 45;
    var CAMERA_NEAR = 0.1;
    var CAMERA_FAR = SIZE_BOX * 10;
    var CLR_FACE = 0xcecece;
    var CLR_EDGE = 0x333333;
    var CLR_SELECTED = 0xca00f7;

    // Geometry types
    scope.GEOMETRY_TYPES = {
      model: 1,
      face:  1 << 1,
      edge:  1 << 2,
      curve: 1 << 3,
      point: 1 << 4
    };

    // Selection modes
    scope.SELECTION_MODES =  {
      single:   0,
      multiple: 1
    };
    scope.selectType = 0;
    scope.selectMode = scope.SELECTION_MODES.multiple;
    scope.displaySelect = true;

    // Material definitions
    var meshDefaultMaterial = new $window.THREE.MeshStandardMaterial({
      color: CLR_FACE,
      transparent: true,
      opacity: 0.8,
      emissive: 0x000000,
      side: $window.THREE.DoubleSide
    });
    var meshAnalysisMaterial = new $window.THREE.MeshNormalMaterial({
      side: $window.THREE.DoubleSide
    });
    var meshWireframeMaterial = new $window.THREE.MeshBasicMaterial({
      wireframe: true
    });
    var meshShinyGlassMaterial = new $window.THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.8,
      reflectivity: 0.5,
      envMap: (function() {
        return new $window.THREE.CubeTextureLoader()
        .setPath('modules/core/images/cube/')
        .load(['posx.jpg','negx.jpg', 'posy.jpg','negy.jpg', 'posz.jpg', 'negz.jpg']);
      })(),
      combine: $window.THREE.MixOperation,
      side: $window.THREE.DoubleSide
    });
    var lineDefaultMaterial = new $window.THREE.LineBasicMaterial({
      color: CLR_EDGE,
    });
    scope.DISPLAY_MODES = {
      shaded:     1,
      rendered:   2,
      analysis:   3,
      mesh:       4,
      wireframe:  5
    };
    scope.displayMode = scope.DISPLAY_MODES.shaded;

    // Scene definitions
    var container;
    var renderer;
    var canvas3d;
    var canvas2d;
    var context;
    var cameras = [];
    var activeCamera;
    var scenes = [];
    var activeScene;
    var papers = [];
    var activePaper;
    var eyeLight;
    var acs;
    var controller;
    var controllerType = 2; // 1 - trackball; 2 - orbitor
    var raycaster;
    var selects = [];
    var mouse = new $window.THREE.Vector2();
    var transformer;

    // Transient variables
    var i = 0;
    var j = 0;
    var k = 0;

    //---------------------------------------------------
    //  Callbacks
    //---------------------------------------------------
    /**
     * Scene
     */
    // Initialize scene
    scope.initialize = function() {
      // Check webgl
      if (!$window.Detector.webgl) {
        $window.Detector.addGetWebGLMessage();
        return;
      }

      // Create render
      createRenderer();

      // Create camera
      createCamera();

      // Create scene
      createScene();

      // Create helpers
      createHelpers();

      // Create lights
      createLights();

      // Create controller
      createController();

      // Create raycaster
      raycaster = new $window.THREE.Raycaster();

      // Add listeners
      $window.addEventListener('resize', onWindowResize, false);
      canvas3d.addEventListener('mousedown', onCanvasMouseDown, false);
      canvas3d.addEventListener('mousemove', onCanvasMouseMove, false);
      canvas3d.addEventListener('mouseup', onCanvasMouseUp, false);

      // Animate
      animate();
    };

    // Query models
    scope.queryModels = function(onSuccess) {
      let modelNames = [];
      activeScene.traverse(function(object) {
        if (object.type === scope.GEOMETRY_TYPES.model) modelNames.push(object.name);
      });
      if (onSuccess) onSuccess(modelNames);
    };

    // Load model
    scope.loadModel = function(data, onSuccess) {
      // Check input data
      if (data === undefined) return;

      // Get display settings
      let displaySettings = getDisplaySettings();

      // Count instances
      let count = countModels(data.name) + 1;

      // Create scene object
      var model = new $window.THREE.Object3D();
      model.data = data;
      model.name = data.name;
      model.displayName = model.name + ' #' + count;
      model.type = scope.GEOMETRY_TYPES.model;
      model.box = new $window.THREE.Box3();
      let faces = new $window.THREE.Object3D();
      faces.name = 'faces';
      model.add(faces);
      let edges = new $window.THREE.Object3D();
      edges.name = 'edges';
      model.add(edges);

      // Create faces
      for (i = 0; i < data.meshes.length; i++) {
        // Get mesh.
        let mesh = data.meshes[i];

        // Save mesh
        if (mesh.type === 'surfaceMesh') {
          // Create geometry
          let geometry = new $window.THREE.Geometry();

          // Save vertices.
          for (j = 0; j < mesh.nodes.count; j++) {
            geometry.vertices.push(
              new $window.THREE.Vector3(
                mesh.nodes.points[j * 3],
                mesh.nodes.points[j * 3 + 1],
                mesh.nodes.points[j * 3 + 2]
              ));
          }

          // Save facets
          for (j = 0; j < mesh.facets.count; j++) {
            let a = mesh.facets.indices[j * 3];
            let b = mesh.facets.indices[j * 3 + 1];
            let c = mesh.facets.indices[j * 3 + 2];
            let facet = new $window.THREE.Face3(a, b, c);
            facet.vertexNormals = [
              new $window.THREE.Vector3(mesh.nodes.normals[a * 3], mesh.nodes.normals[a * 3 + 1], mesh.nodes.normals[a * 3 + 2]),
              new $window.THREE.Vector3(mesh.nodes.normals[b * 3], mesh.nodes.normals[b * 3 + 1], mesh.nodes.normals[b * 3 + 2]),
              new $window.THREE.Vector3(mesh.nodes.normals[c * 3], mesh.nodes.normals[c * 3 + 1], mesh.nodes.normals[c * 3 + 2])];
            geometry.faces.push(facet);
          }

          // Evaluate geometry addtional data
          geometry.key = mesh.id;
          geometry.computeFaceNormals();
          geometry.computeBoundingBox();
          model.box.union(geometry.boundingBox);

          // Create mesh
          let face = new $window.THREE.Mesh(geometry, displaySettings.meshMaterial.clone());
          face.savedMaterial = face.material;
          face.visible = displaySettings.meshVisibility;
          face.type = scope.GEOMETRY_TYPES.face;
          face.selected = false;

          // Add to parent
          faces.add(face);
        } else if (mesh.type === 'curveMesh' && mesh.cardinal === 3) {
          // Create geometry
          let geometry = new $window.THREE.Geometry();

          // Save vertices.
          for (j = 0; j < mesh.nodes.count; j++) {
            geometry.vertices.push(
              new $window.THREE.Vector3(
                mesh.nodes.points[j * 3],
                mesh.nodes.points[j * 3 + 1],
                mesh.nodes.points[j * 3 + 2]
              ));
          }

          // Evaluate geometry addtional data
          geometry.key = mesh.id;
          geometry.computeBoundingBox();

          // Create line
          let edge = new $window.THREE.Line(geometry, displaySettings.lineMaterial.clone());
          edge.savedMaterial = edge.material;
          edge.visible = displaySettings.lineVisibility;
          edge.type = scope.GEOMETRY_TYPES.edge;
          edge.selected = false;

          // Add to parent
          edges.add(edge);
        }
      }

      // Update model center
      model.center = new $window.THREE.Vector3();
      model.center.copy(model.box.min).add(model.box.max).multiplyScalar(0.5);

      // Update matrix.
      model.children.forEach(function(set){
        set.children.forEach(function(entity){
          let geometry = entity.geometry;
          geometry.translate(-model.center.x, -model.center.y, -model.center.z);
        });
      });
      model.position.copy(model.center);

      // Add to scene
      activeScene.add(model);

      // Fit view.
      scope.viewFit();

      // Post-processing
      if (onSuccess) onSuccess(model);
    };

    // Remove object
    scope.removeObject = function(name) {
      // Check input data
      if (name === undefined) return;

      // Remove object
      let index = 0;
      activeScene.children.forEach(function(object) {
        if (object.displayName === name) {
          activeScene.children.splice(index, 1);
          return;
        }
        index++;
      });
    };

    // Update displays
    scope.updateDisplays = function (object) {
      if (object === undefined) {
        // Default to update scene displays
        scope.updateDisplays(activeScene);
      } else {
         // Ignore helpers
        if (!(object.constructor.name === 'Scene' ||
          object.constructor.name === 'Mesh' ||
          object.constructor.name === 'Line' ||
          object.constructor.name === 'Object3D'))
          return;

        // Update children displays
        if (object.children !== undefined && object.children.length > 0) {
          object.children.forEach(function(child){
            scope.updateDisplays(child);
          });
        }

        // Update displays based on display settings
        if (object.material !== undefined) {
          let displaySettings = getDisplaySettings();
          if (object instanceof $window.THREE.Mesh) {
            object.material = displaySettings.meshMaterial.clone();
            object.savedMaterial = displaySettings.meshMaterial.clone();
            object.visible = displaySettings.meshVisibility;
          } else if (object instanceof $window.THREE.Line) {
            object.material = displaySettings.lineMaterial.clone();
            object.savedMaterial = displaySettings.lineMaterial.clone();
            object.visible = displaySettings.lineVisibility;
          }

          // Update specific displays
          if (object.visible) {
            // Display selected
            if (object.selected) {
              if (object.material.color !== undefined)
                object.material.color.setHex(CLR_SELECTED);
            }
          }
        }        
      }
    };

    // Clear selected objects
    scope.viewClear = function() {
      setSelected(activeScene, false);
      selects = [];
      scope.updateDisplays();
    };

    // Clear selection
    scope.clearSelection = function() {
      scope.selectType = 0;
      scope.selectMode = scope.SELECTION_MODES.multiple;
      scope.displaySelect = true;
    };

    /**
     * View
     */
    // Fit view
    scope.viewFit = function(direction) {
      // Update scene box
      updateSceneBox(activeScene);
      if (activeScene.box.isEmpty()) return;

      // Evaluate direction
      let v = new $window.THREE.Vector3();
      if (direction !== undefined)
        v.copy(direction);
      else
        v.copy(activeCamera.position).sub(activeScene.center).normalize();

      // Evaluate projection radius
      let sphere = activeScene.box.getBoundingSphere();
      let r = sphere.radius;

      // Evaluate distance
      let d = r / Math.sin(toRadian(CAMERA_ANGLE / 2.0));
      v.multiplyScalar(d);

      // Evalute eye
      let p = new $window.THREE.Vector3();
      p.copy(activeScene.center).add(v);

      // Set camera and controller
      activeCamera.position.copy(p);
      activeCamera.lookAt(activeScene.center);
      controller.target.copy(activeScene.center);
    };

    // Bottom view
    scope.viewTop = function() {
      scope.viewFit(new $window.THREE.Vector3(0, 0, 1));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 1, 0));
    };

    // Bottom view
    scope.viewBottom = function() {
      scope.viewFit(new $window.THREE.Vector3(0, 0, -1));
      activeCamera.up.copy(new $window.THREE.Vector3(0, -1, 0));
    };

    // Left view
    scope.viewLeft = function() {
      scope.viewFit(new $window.THREE.Vector3(-1, 0, 0));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 0, 1));
    };

    // Right view
    scope.viewRight = function() {
      scope.viewFit(new $window.THREE.Vector3(1, 0, 0));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 0, 1));
    };

    // Front view
    scope.viewFront = function() {
      scope.viewFit(new $window.THREE.Vector3(0, -1, 0));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 0, 1));
    };

    // Back view
    scope.viewBack = function() {
      scope.viewFit(new $window.THREE.Vector3(0, 1, 0));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 0, 1));
    };

    /**
     * Transformation
     */
    // Create transformer
    scope.createTransformer = function(mode, object) {
      if (transformer !== undefined) return false;
      transformer = new $window.THREE.TransformControls(activeCamera, canvas3d);
      transformer.setMode(mode);
      transformer.addEventListener('change', render);
      transformer.addEventListener('mouseUp', function(event){
        $rootScope.$broadcast('scene.transformer.update');
      });
      activeScene.add(transformer);
      if (object !== undefined)
        transformer.attach(object);
      return true;
    };

    // Switch transformer
    scope.switchTransformer = function (mode) {
      if (transformer === undefined) return;
      transformer.setMode(mode);
    };

    // Delete transformer
    scope.deleteTransformer = function () {
      if (transformer !== undefined) {
        transformer.detach();
        activeScene.remove(transformer);
        transformer = undefined;
      }
    };

    /**
     * Debug
     */
    // Create a box
    scope.createBox = function () {
      let box = createBox(300, 300, 300, 0xff0000);
      activeScene.add(box);
    };

    // Serialize
    scope.serialize = function () {
    };

    //---------------------------------------------------
    //  Listeners
    //------------------------------------------------
    // Resize
    function onWindowResize() {
      activeCamera.aspect = $window.innerWidth / $window.innerHeight;
      activeCamera.updateProjectionMatrix();
      renderer.setSize($window.innerWidth, $window.innerHeight);
    }

    // Mouse down
    function onCanvasMouseDown(event) {
      event.preventDefault();
      if (event.button !== 0) return;
      if (scope.selectType > 0) selectObjects();
    }

    // Mouse move
    function onCanvasMouseMove(event) {
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Mouse up
    function onCanvasMouseUp(event) {
      event.preventDefault();
    }

    //---------------------------------------------------
    //  Utilities
    //---------------------------------------------------
    /**
     * Math
     */
    // Convert degree to radian
    function toRadian(degree) {
      return degree / 180 * Math.PI;
    }

    // Convert radian to degree
    function toDegree(radian) {
      return radian / Math.PI * 180;
    }

    /**
     * Scene
     */
    // Create scene
    function createScene() {
      let scene = new $window.THREE.Scene();
      scenes.push(scene);
      activeScene = scene;

      let paper = new $window.THREE.Scene();
      papers.push(paper);
      activePaper = paper;
    }

    // Evaluate scene center
    function updateSceneBox(scene) {
      // Check input data
      if (!(scene instanceof $window.THREE.Scene)) return;

      // Update box
      let count = 0;
      scene.box = new $window.THREE.Box3();
      scene.traverse(function(object) {
        if (object.type !== undefined && object.type === scope.GEOMETRY_TYPES.model) {
          let box = new $window.THREE.Box3();
          box.setFromObject(object);
          scene.box.union(box);
          count++;
        }
      });
      if (count === 0)
        scene.box.makeEmpty();

      // Update center
      scene.center = new $window.THREE.Vector3();
      if (count > 0)
        scene.center.copy(scene.box.min).add(scene.box.max).multiplyScalar(0.5);
    }

    // Create renderer
    function createRenderer() {
      container = $document[0].getElementById('canvases');

      // 3d canvas
      renderer = $window.WebGLRenderingContext ?
        new $window.THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true
        }) :
        new $window.THREE.CanvasRenderer();
      canvas3d = renderer.domElement;
      canvas3d.id = 'canvas3d';
      renderer.setSize($window.innerWidth, $window.innerHeight);
      renderer.setPixelRatio($window.devicePixelRatio);
      renderer.autoClear = true;
      container.appendChild(canvas3d);

      // 2d canvas
      canvas2d = $document[0].createElement('canvas');
      canvas2d.id = 'canvas2d';
      canvas2d.width = $window.innerWidth;
      canvas2d.height = $window.innerHeight;
      canvas2d.style.width = $window.innerWidth.toString() + 'px';
      canvas2d.style.height = $window.innerHeight.toString() + 'px';
      canvas2d.style.pointerEvents = 'none';
      container.appendChild(canvas2d);
      context = canvas2d.getContext('2d');
      context.paint = function (paper) {
        context.clearRect(0, 0, $window.innerWidth, $window.innerHeight);
        paper.children.forEach(function(child){
          child.paint(context);
        });
      };
    }

    // Create camera
    function createCamera() {
      let camera = new $window.THREE.PerspectiveCamera(CAMERA_ANGLE, $window.innerWidth / $window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
      camera.name = 'VIEW #' + cameras.length + 1;
      camera.position.set(- SIZE_BOX * 2, - SIZE_BOX * 2, SIZE_BOX);
      camera.up.copy(new $window.THREE.Vector3(0, 0, 1));
      camera.target = new $window.THREE.Vector3();
      cameras.push(camera);
      activeCamera = camera;
    }

    // Create helpers
    function createHelpers() {
      // Grid
      let grid = new $window.THREE.GridHelper(SIZE_BOX, SIZE_GAP);
      grid.name = 'GRID';
      grid.rotateX(Math.PI / 2.0);
      activeScene.add(grid);

      // Axis
      let axis = new $window.THREE.AxisHelper(SIZE_BOX);
      axis.name = 'AXIS';
      activeScene.add(axis);

      // ACS
      acs = new $window.THREE.AcsHelper(activeCamera, 150, $window.innerHeight - 50, 50);
      acs.name = 'ACS';
      activePaper.add(acs);
    }

    function createTextSprite(text, parameters)
    {
      // Set parameters
      if (parameters === undefined) parameters = {};
      let fontFace = parameters.hasOwnProperty('fontFace') ? parameters.fontFace : 'Arial';
      let fontSize = parameters.hasOwnProperty('fontSize') ? parameters.fontSize : 28;
      let borderThickness = parameters.hasOwnProperty('borderThickness') ? parameters.borderThickness : 2;
      let borderColor = parameters.hasOwnProperty('borderColor') ? parameters.borderColor : {r:0, g:0, b:0, a:1.0};
      let backgroundColor = parameters.hasOwnProperty('backgroundColor') ? parameters.backgroundColor : {r:255, g:255, b:255, a:1.0};

      // Create canvas and context
      let canvas = $document[0].createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      let context = canvas.getContext('2d');
      context.font = 'Bold ' + fontSize + 'px ' + fontFace;
      let metrics = context.measureText(text);
      let textWidth = metrics.width;

      // Paint text border
      context.fillStyle   = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';
      context.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';
      context.lineWidth = borderThickness;
      function createTextBorder (x, y, w, h, r) {
        context.beginPath();
        context.moveTo(x+r, y);
        context.lineTo(x+w-r, y);
        context.quadraticCurveTo(x+w, y, x+w, y+r);
        context.lineTo(x+w, y+h-r);
        context.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        context.lineTo(x+r, y+h);
        context.quadraticCurveTo(x, y+h, x, y+h-r);
        context.lineTo(x, y+r);
        context.quadraticCurveTo(x, y, x+r, y);
        context.closePath();
        context.fill();
        context.stroke();
      }
      createTextBorder(borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontSize * 1.4 + borderThickness, 6);

      // Paint text
      context.fillStyle = 'rgba(0, 0, 0, 1.0)';
      context.fillText(text, borderThickness, fontSize + borderThickness);

      // Create sprite
      let texture = new $window.THREE.Texture(canvas);
      texture.needsUpdate = true;
      let spriteMaterial = new $window.THREE.SpriteMaterial({map: texture});
      let sprite = new $window.THREE.Sprite(spriteMaterial);
      sprite.scale.set(100, 50, 1.0);
      return sprite;
    }

    // Create lights
    function createLights() {
      eyeLight = new $window.THREE.DirectionalLight(0xffffff, 0.5);
      eyeLight.name = 'EYE LIGHT';
      eyeLight.position.set(SIZE_BOX * 2, SIZE_BOX, SIZE_BOX * 2);
      activeScene.add(eyeLight);
    }

    // Create controller
    function createController() {
      // Create controller
      if (controller === undefined) {
        if (controllerType === 1) {
          let trackball = new $window.THREE.TrackballControls(activeCamera);
          trackball.rotateSpeed = 4.0;
          trackball.zoomSpeed = 2.0;
          trackball.panSpeed = 1.0;
          trackball.noZoom = false;
          trackball.noPan = false;
          trackball.staticMoving = true;
          trackball.dynamicDampingFactor = 0.3;
          controller = trackball;
        }
        else if (controllerType === 2) {
          let orbitor = new $window.THREE.OrbitControls(activeCamera, canvas3d);
          controller = orbitor;
        }
      }
    }

    // Count object instances
    function countModels(name) {
      // Check input data
      if (name === undefined) return 0;

      // Count object instances
      let count = 0;
      activeScene.traverse(function(object) {
        if (object.type === scope.GEOMETRY_TYPES.model) {
          if (object.name === name) count++;
        }
      });
      return count;
    }

    // Get materials for display mode
    function getDisplaySettings () {
      let meshMaterial = meshDefaultMaterial;
      let lineMaterial = lineDefaultMaterial;
      let meshVisibility = true;
      let lineVisibility = true;
      switch (scope.displayMode) {
        case scope.DISPLAY_MODES.shaded:
          break;
        case scope.DISPLAY_MODES.rendered:
          lineVisibility = false;
          break;
        case scope.DISPLAY_MODES.analysis:
          meshMaterial = meshAnalysisMaterial;
          break;
        case scope.DISPLAY_MODES.mesh:
          meshMaterial = meshWireframeMaterial;
          break;
        case scope.DISPLAY_MODES.wireframe:
          meshVisibility = false;
          break;
      }
      return {
        meshMaterial: meshMaterial,
        meshVisibility: meshVisibility,
        lineMaterial: lineMaterial,
        lineVisibility: lineVisibility
      };
    }

    /**
     * Selection
     */
    // Set selected
    function setSelected (object, selected) {
      if (!(object instanceof $window.THREE.Scene))
        object.selected = selected;
      if (object.children !== undefined && object.children.length > 0) {
        object.children.forEach(function (child){
          setSelected(child, selected);
        });
      }
    }

    // Click pick objects
    function selectObjects() {
      raycaster.setFromCamera(mouse, activeCamera);
      let intersects = raycaster.intersectObjects(activeScene.children, true);
      if (intersects.length > 0) {
        // Get candidates by type
        let candidates = [];
        let candidate;
        if (scope.selectType & scope.GEOMETRY_TYPES.model) {
          candidate = getPickedModel(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidate === undefined && scope.selectType & scope.GEOMETRY_TYPES.face) {
          candidate = getPickedFace(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidate === undefined && scope.selectType & scope.GEOMETRY_TYPES.edge) {
          candidate = getPickedEdge(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidate === undefined && scope.selectType & scope.GEOMETRY_TYPES.curve) {
          candidate = getPickedCurve(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidate === undefined && scope.selectType & scope.GEOMETRY_TYPES.point) {
          candidate = getPickedPoint(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidates.length === 0) return;

        // Update selects
        candidates.forEach(function(candidate) {
          if (scope.selectMode === scope.SELECTION_MODES.single) {
            selects.forEach(function(object) {
              setSelected(object, false);
            });
            selects = [];
          }
          if (selects.length > 0 && selects.indexOf(candidate) !== -1) {
            let index = selects.indexOf(candidate);
            selects.splice(index, 1);
            setSelected(candidate, false);
          } else {
            setSelected(candidate, true);
            selects.push(candidate);
          }
        });
      }

      // Update displays
      if (scope.displaySelect)
        scope.updateDisplays();

      // Broadcast
      if (selects.length > 0)
        $rootScope.$broadcast('scene.selected', selects);
    }

    // Get picked model
    function getPickedModel(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Mesh) {
          let candidate = intersects[i].object.parent.parent;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.model)
            return candidate;
        }
      }
    }

    // Get picked face
    function getPickedFace(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Mesh) {
          let candidate = intersects[i].object;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.face)
            return candidate;
        }
      }
    }

    // Get picked edge
    function getPickedEdge(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Line) {
          let candidate = intersects[i].object;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.edge)
            return candidate;
        }
      }
    }

    // Get picked curve
    function getPickedCurve(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Line) {
          let candidate = intersects[i].object;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.curve)
            return candidate;
        }
      }
    }

    // Get picked point
    function getPickedPoint(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Vector3) {
          let candidate = intersects[i].object;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.point)
            return candidate;
        }
      }
    }

    /**
     * Rendering
     */
    // Animate
    function animate() {
      $window.requestAnimationFrame(animate);
      update();
      render();
    }

    // Render
    function render() {
      renderer.render(activeScene, activeCamera);
      context.paint(activePaper);
    }

    // Update
    function update() {
      // ACS
      if (acs !== undefined) acs.update();

      // Controller
      if (controller !== undefined) controller.update();

       // Transformer
      if (transformer !== undefined) transformer.update();

      // Lights
      let direction = new $window.THREE.Vector3();
      direction.copy(activeCamera.position).sub(activeCamera.target).normalize();
      eyeLight.position.copy(direction);
    }

    //---------------------------------------------------
    //  Debugging
    //---------------------------------------------------
    // Create a point
    function createPoint(x, y, z, color) {
      let geometry = new $window.THREE.SphereGeometry(0.1, 32, 32);
      let material = new $window.THREE.MeshBasicMaterial({
        color: color !== undefined ? color : 0xffffff
      });
      let point = new $window.THREE.Mesh(geometry, material);
      return point;
    }

    // Create a box
    function createBox(dx, dy, dz, color) {
      let geometry = new $window.THREE.BoxGeometry(dx, dy, dz);
      let material = new $window.THREE.MeshBasicMaterial({
        color: color !== undefined ? color : 0xffffff,
        wireframe: true
      });
      let box = new $window.THREE.Mesh(geometry, material);
      var timestamp = new Date().getUTCMilliseconds();
      box.name = 'BOX ' + timestamp;
      return box;
    }
  }
]);

'use strict';

//Tool service used for managing  tools
angular.module('core').service('Tools', ['$log',
  function($log) {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the tools object
    this.tools = {};

    // A private function for rendering decision
    var shouldRender = function(user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }

      return false;
    };

    // Validate tool existance
    this.validateToolExistance = function(toolId) {
      if (toolId && toolId.length) {
        if (!this.tools[toolId]) {
          $log.error('Tree does not exists');
          return false;
        }
      }
      return true;
    };

    // Get the tool object by tool id
    this.getTool = function(toolId) {
      // Validate that the tool exists
      if (!this.validateToolExistance(toolId)) return;

      // Return the tool object
      return this.tools[toolId];
    };

    // Add new tool object by tool id
    this.addTool = function(toolId, isPublic, roles) {
      // Create the new tool
      this.tools[toolId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };

      // Return the tool object
      return this.tools[toolId];
    };

    // Remove existing tool object by tool id
    this.removeTool = function(toolId) {
      // Validate that the tool exists
      if (!this.validateToolExistance(toolId)) return;

      // Return the tool object
      delete this.tools[toolId];
    };

    // Add tool item object
    this.addToolItem = function(toolId, toolItemTitle, toolItemIcon, toolItemURL, toolItemToggle, toolItemAction, toolItemTip, isPublic, roles, position) {
      // Validate that the tool exists
      if (!this.validateToolExistance(toolId)) return;

      // Push new tool item
      this.tools[toolId].items.push({
        title: toolItemTitle,
        icon: toolItemIcon,
        link: toolItemURL || toolItemAction,
        uiRoute: '/' + toolItemURL,
        toggle: toolItemToggle,
        action: toolItemAction,
        tooltip: toolItemTip,
        isPublic: ((isPublic === null || isPublic === undefined) ? this.tools[toolId].isPublic : isPublic),
        roles: ((roles === null || roles === undefined) ? this.tools[toolId].roles : roles),
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Return the tool object
      return this.tools[toolId];
    };

    // Remove existing tool object by tool id
    this.removeToolItem = function(toolId, toolItemURL) {
      // Validate that the tool exists
      if (!this.validateToolExistance(toolId)) return;

      // Search for tool item to remove
      for (var itemIndex in this.tools[toolId].items) {
        if (this.tools[toolId].items[itemIndex].link === toolItemURL) {
          this.tools[toolId].items.splice(itemIndex, 1);
        }
      }

      // Return the tool object
      return this.tools[toolId];
    };
  }
]);

'use strict';

//Tree service used for managing  trees
angular.module('core').service('Trees', ['$log',
  function($log) {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the trees object
    this.trees = {};

    // A private function for rendering decision
    var shouldRender = function(user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }

      return false;
    };

    // Validate tree existance
    this.validateTreeExistance = function(treeId) {
      if (treeId && treeId.length) {
        if (!this.trees[treeId]) {
          $log.error('Tree does not exists');
          return false;
        }
      }
      return true;
    };

    // Get the tree object by tree id
    this.getTree = function(treeId) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Return the tree object
      return this.trees[treeId];
    };

    // Add new tree object by tree id
    this.addTree = function(treeId, isPublic, roles) {
      // Create the new tree
      this.trees[treeId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };

      // Return the tree object
      return this.trees[treeId];
    };

    // Empty existing tree objects
    this.emptyTree = function(treeId) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Search for tree item to remove
      for (var itemIndex in this.trees[treeId].items) {
        this.trees[treeId].items[itemIndex].items = [];
      }
    };

    // Remove existing tree object by tree id
    this.removeTree = function(treeId) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Return the tree object
      delete this.trees[treeId];
    };

    // Validate tree item existance
    this.validateTreeItemExistance = function(treeId, treeItemURL) {
      if (treeItemURL && treeItemURL.length) {
        for (var itemIndex in this.trees[treeId].items) {
          if (this.trees[treeId].items[itemIndex].link === treeItemURL) {
            $log.error('Tree item is already existant');
            return false;
          }
        }
      }
      return true;
    };

    // Add tree item object
    this.addTreeItem = function(treeId, treeItemTitle, treeItemIcon, treeItemURL, isPublic, roles) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Validate that the tree item exists
      if (!this.validateTreeItemExistance(treeId, treeItemURL)) return;

      // Push new tree item
      this.trees[treeId].items.push({
        title: treeItemTitle,
        icon: treeItemIcon,
        link: treeItemURL,
        isPublic: ((isPublic === null || isPublic === undefined) ? this.trees[treeId].isPublic : isPublic),
        roles: ((roles === null || roles === undefined) ? this.trees[treeId].roles : roles),
        items: [],
        checked: false,
        shouldRender: shouldRender
      });

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeTreeItem = function(treeId, treeItemURL) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Search for tree item to remove
      for (var itemIndex in this.trees[treeId].items) {
        if (this.trees[treeId].items[itemIndex].link === treeItemURL) {
          this.trees[treeId].items.splice(itemIndex, 1);
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Validate tree item existance
    this.validateSubTreeItemExistance = function(treeId, rootTreeItemURL, subtreeItemURL) {
      if (subtreeItemURL && subtreeItemURL.length) {
        for (var itemIndex in this.trees[treeId].items) {
          if (this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
            for (var subitemIndex in this.trees[treeId].items[itemIndex].items) {
              if (this.trees[treeId].items[itemIndex].items[subitemIndex].link === subtreeItemURL) {
                $log.error('Sub tree item is already existant');
                return false;
              }
            }
          }
        }
      }
      return true;
    };

    // Add subtree item object
    this.addSubTreeItem = function(treeId, rootTreeItemURL, treeItemTitle, treeItemIcon, treeItemURL, isPublic, roles) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Validate that the tree item exists
      if (!this.validateTreeItemExistance(treeId, treeItemURL)) return;

      // Validate that the tree exists
      if (!this.validateSubTreeItemExistance(treeId, rootTreeItemURL, treeItemURL)) return;

      // Search for tree item
      for (var itemIndex in this.trees[treeId].items) {
        if (this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
          // Push new subtree item
          this.trees[treeId].items[itemIndex].items.push({
            title: treeItemTitle,
            icon: treeItemIcon,
            link: treeItemURL,
            isPublic: ((isPublic === null || isPublic === undefined) ? this.trees[treeId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || roles === undefined) ? this.trees[treeId].items[itemIndex].roles : roles),
            checked: false,
            shouldRender: shouldRender
          });
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeSubTreeItem = function(treeId, subtreeItemURL) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Search for tree item to remove
      for (var itemIndex in this.trees[treeId].items) {
        for (var subitemIndex in this.trees[treeId].items[itemIndex].items) {
          if (this.trees[treeId].items[itemIndex].items[subitemIndex].link === subtreeItemURL) {
            this.trees[treeId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Select subtree items
    this.checkAllSubTreeItems = function(treeId, rootTreeItemURL, checked) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Search for subtree items
      for (var itemIndex in this.trees[treeId].items) {
        if (this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
          var item = this.trees[treeId].items[itemIndex];
          if (item.items !== undefined && item.items.length > 0) {
            for (var subitemIndex in item.items) {
              item.items[subitemIndex].checked = checked;
            }
          }
        }
      }
    };

    // Get checked tree object
    this.getCheckedSubTreeItems = function(treeId) {
      // Validate that the tree exists
      if (!this.validateTreeExistance(treeId)) return;

      // Search for tree item to remove
      var items = [];
      for (var itemIndex in this.trees[treeId].items) {
        for (var subitemIndex in this.trees[treeId].items[itemIndex].items) {
          if (this.trees[treeId].items[itemIndex].items[subitemIndex].checked) {
            items.push(this.trees[treeId].items[itemIndex].items[subitemIndex]);
          }
        }
      }

      // Return the tree object
      return items;
    };
  }
]);

'use strict';

// Configuring the Slides module
angular.module('slides').run(['$rootScope', 'Menus', 'Tools', 'Trees', 'Dialogs', 'Languages',
  function($rootScope, Menus, Tools, Trees, Dialogs, Languages) {
    // Set debug or production mode
    var processEnv = 'debug';

    // Set language for now here
    Languages.code = 'eng';
    $rootScope.language = Languages.localization();
    if($rootScope.language === undefined)
        $rootScope.language = Languages.localization('eng');
    var language = $rootScope.language;

    // Adding tools
    Tools.addTool('sidebar');
    Tools.addTool('files');
    Tools.addTool('scene');
    Tools.addTool('modeling');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'files', 'icon-files', 'slides/edit/files', undefined, undefined, language.sidebar.files);    
    Tools.addToolItem('sidebar', 'scene', 'icon-scenes', 'slides/edit/scene', undefined, undefined, language.sidebar.scene);
    Tools.addToolItem('sidebar', 'modeling', 'icon-tools', 'slides/edit/modeling', undefined, undefined, language.sidebar.modeling);
    

    // Set files tool items
    Tools.addToolItem('files', 'upload', 'icon-upload', undefined, undefined, 'uploadFiles', language.files.upload);
    Tools.addToolItem('files', 'download', 'icon-download', undefined, undefined, 'downloadFiles', language.files.download);
    Tools.addToolItem('files', 'load', 'icon-load', undefined, undefined, 'loadFiles', language.files.load);
    Tools.addToolItem('files', 'delete', 'icon-delete', undefined, undefined, 'deleteFiles', language.files.delete);

    // Set scene tool items
    Tools.addToolItem('scene', 'snapshot', 'icon-snapshot', undefined, undefined, 'takeSnapshot', language.scene.snapshot);
    Tools.addToolItem('scene', 'delete', 'icon-delete', undefined, undefined, 'removeObjects', language.scene.delete);

    // Set modeling tool items
    if(processEnv === 'debug') {
      Tools.addToolItem('modeling', 'createBox', 'icon-box', undefined, undefined, 'createBox', language.modeling.createBox);
      Tools.addToolItem('modeling', 'serialize', 'icon-serialize', undefined, undefined, 'serialize', language.modeling.serialize);
    }    
    Tools.addToolItem('modeling', 'viewFit', 'icon-view-fit', undefined, undefined, 'viewFit', language.modeling.viewFit);
    Tools.addToolItem('modeling', 'viewTop', 'icon-view-top', undefined, undefined, 'viewTop', language.modeling.viewTop);
    Tools.addToolItem('modeling', 'viewBottom', 'icon-view-bottom', undefined, undefined, 'viewBottom', language.modeling.viewBottom);
    Tools.addToolItem('modeling', 'viewLeft', 'icon-view-left', undefined, undefined, 'viewLeft', language.modeling.viewLeft);
    Tools.addToolItem('modeling', 'viewRight', 'icon-view-right', undefined, undefined, 'viewRight', language.modeling.viewRight);
    Tools.addToolItem('modeling', 'viewFront', 'icon-view-front', undefined, undefined, 'viewFront', language.modeling.viewFront);
    Tools.addToolItem('modeling', 'viewBack', 'icon-view-back', undefined, undefined, 'viewBack', language.modeling.viewBack);
    Tools.addToolItem('modeling', 'viewClear', 'icon-pick-nothing', undefined, undefined, 'viewClear', language.modeling.viewClear);
    Tools.addToolItem('modeling', 'pickModel', 'icon-pick-model', undefined, false, 'pickModel', language.modeling.pickModel);
    Tools.addToolItem('modeling', 'pickFace', 'icon-pick-face', undefined, false, 'pickFace', language.modeling.pickFace);
    Tools.addToolItem('modeling', 'pickEdge', 'icon-pick-edge', undefined, false, 'pickEdge', language.modeling.pickEdge);
    Tools.addToolItem('modeling', 'pickCurve', 'icon-pick-curve', undefined, false, 'pickCurve', language.modeling.pickCurve);
    Tools.addToolItem('modeling', 'pickPoint', 'icon-pick-point', undefined, false, 'pickPoint', language.modeling.pickPoint);
    Tools.addToolItem('modeling', 'displayShaded', 'icon-display-shaded', undefined, undefined, 'displayShaded', language.modeling.displayShaded);
    Tools.addToolItem('modeling', 'displayRendered', 'icon-display-rendered', undefined, undefined, 'displayRendered', language.modeling.displayRendered);
    Tools.addToolItem('modeling', 'displayAnalysis', 'icon-display-analysis', undefined, undefined, 'displayAnalysis', language.modeling.displayAnalysis);
    Tools.addToolItem('modeling', 'displayMesh', 'icon-display-mesh', undefined, undefined, 'displayMesh', language.modeling.displayMesh);
    Tools.addToolItem('modeling', 'displayWireframe', 'icon-display-wireframe', undefined, undefined, 'displayWireframe', language.modeling.displayWireframe);
    Tools.addToolItem('modeling', 'translate', 'icon-translate', undefined, undefined, 'translate', language.modeling.translate);

    // Adding trees
    Trees.addTree('scene');
    Trees.addTree('files');

    // Set file tree node items
    Trees.addTreeItem('files', 'Models', 'icon-file', 'models');

    // Set scene tree node items
    Trees.addTreeItem('scene', 'Models', 'icon-file', 'models');
  }
]);

// Configure http interseptor
angular.module('slides').factory('httpResponseInterceptor', ['$q', function($q) {
    return {
      response: function(res) {
        return res || $q.when(res);
      }
    };
  }])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpResponseInterceptor');
  }]);

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
    state('editSlide.Files', {
      url: '/files',
      templateUrl: 'modules/slides/views/edit-slide-files.client.view.html'
    }).
    state('editSlide.Scene', {
      url: '/scene',
      templateUrl: 'modules/slides/views/edit-slide-scene.client.view.html'
    }).
    state('editSlide.Modeling', {
      url: '/modeling',
      templateUrl: 'modules/slides/views/edit-slide-modeling.client.view.html'
    });    
  }
]);

'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$rootScope', '$scope', '$stateParams', '$location', '$window', '$document', '$log', '$controller', '$upload', 'Authentication', 'Scene', 'Files', 'Tools', 'Trees', 'Dialogs', 'FileTypes', 'Slides', function($rootScope, $scope, $stateParams, $location, $window, $document, $log, $controller, $upload, Authentication, Scene, Files, Tools, Trees, Dialogs, FileTypes, Slides) {
  $scope.authentication = Authentication;

  //---------------------------------------------------
  //  Initialization
  //---------------------------------------------------
  // Initialize panel params
  $scope.link = undefined;
  $scope.showPanel = false;

  // Initialize modal and gui instance
  $scope.modal = undefined;
  $scope.dialogUrl = undefined;
  $scope.lock = false;

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
    if ($scope.link === undefined || link !== $scope.link) {
      $scope.showPanel = true;
      $scope.link = link;
      $location.url(link);
    } else {
      $scope.showPanel = !$scope.showPanel;
    }
  };

  // Activate a tool
  $scope.activateTool = function(item) {
    if (item.toggle !== undefined) {
      if (!$scope.lock) {
        item.toggle = !item.toggle;
        if (item.action !== undefined)
          $scope[item.action](item);
      }
    } else {
      if (item.action !== undefined)
        $scope[item.action]();
    }
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
    if ($scope.dialogUrl === undefined)
      $scope.modal = Dialogs.upload();
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
  // Debug callbacks
  $scope.createBox = Scene.createBox;
  $scope.serialize = Scene.serialize;

  // View callbacks
  $scope.viewFit = Scene.viewFit;
  $scope.viewTop = Scene.viewTop;
  $scope.viewBottom = Scene.viewBottom;
  $scope.viewLeft = Scene.viewLeft;
  $scope.viewRight = Scene.viewRight;
  $scope.viewFront = Scene.viewFront;
  $scope.viewBack = Scene.viewBack;

  // Picking callbacks
  $scope.viewClear = Scene.viewClear;
  $scope.pickModel = function(item) {
    setSelectionContext(item.toggle, Scene.GEOMETRY_TYPES.model, Scene.SELECTION_MODES.multiple);
  };
  $scope.pickFace = function(item) {
    setSelectionContext(item.toggle, Scene.GEOMETRY_TYPES.face, Scene.SELECTION_MODES.multiple);
  };
  $scope.pickEdge = function (item) {
    setSelectionContext(item.toggle, Scene.GEOMETRY_TYPES.edge, Scene.SELECTION_MODES.multiple);
  };
  $scope.pickCurve = function (item) {
    setSelectionContext(item.toggle, Scene.GEOMETRY_TYPES.curve, Scene.SELECTION_MODES.multiple);
  };
  $scope.pickPoint = function (item) {
    setSelectionContext(item.toggle, Scene.GEOMETRY_TYPES.point, Scene.SELECTION_MODES.multiple);
  };

  // Display callbacks
  $scope.displayShaded = function () {
    Scene.displayMode = Scene.DISPLAY_MODES.shaded;
    Scene.updateDisplays();
  };
  $scope.displayRendered = function () {
    Scene.displayMode = Scene.DISPLAY_MODES.rendered;
    Scene.updateDisplays();
  };
  $scope.displayAnalysis = function () {
    Scene.displayMode = Scene.DISPLAY_MODES.analysis;
    Scene.updateDisplays();
  };
  $scope.displayMesh = function () {
    Scene.displayMode = Scene.DISPLAY_MODES.mesh;
    Scene.updateDisplays();
  };
  $scope.displayWireframe = function () {
    Scene.displayMode = Scene.DISPLAY_MODES.wireframe;
    Scene.updateDisplays();
  };

  // Transform model
  $scope.translate = function() {
    clearSelectionContex();
    $scope.dialogUrl = Dialogs.translate();
    $scope.lock = true;
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
  // Listener for mode change
  $scope.$on('mode.change', function(event) {
    $scope.showPanel = false;
  });

  // Listener for upload-files.success
  $scope.$on('upload.success', function(event, filename) {
    event.preventDefault();
    addFileItem(filename);
  });

  // Listener for gui-dialog
  $scope.$on('dialog.close', function(event) {
    event.preventDefault();
    $scope.dialogUrl = undefined;
    $scope.lock = false;
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
      return 'icon-file-model';
    } else {
      return 'icon-file-text';
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
    Trees.addSubTreeItem('scene', 'models', modelname, 'icon-file-model', modelname);
  }

  // Set scene selection context
  function setSelectionContext(toggle, type, mode) {
    if (toggle)
      Scene.selectType += type;
    else
      Scene.selectType -= type;
    Scene.selectMode = mode;
  }

  // Clear scene selection context
  function clearSelectionContex(){
    $scope.modelingTools.items.forEach(function(item){
      if(item.toggle !== undefined)
        item.toggle = false;
    });
    Scene.viewClear();
  }
}]);

'use strict';

//Slides service used to communicate Slides REST endpoints
angular.module('slides').factory('Slides', ['$resource',
  function($resource) {
    return $resource('slides/:slideId', {
      slideId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function($q, $location, Authentication) {
        return {
          responseError: function(rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function($stateProvider) {
    // Users state routing
    $stateProvider.
    state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).
    state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).
    state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).
    state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).
    state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).
    state('reset-invalid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).
    state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).
    state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
  function($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) $location.path('/');

    $scope.signup = function() {
      $http.post('/auth/signup', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the index page
        $location.path('/slides/edit');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function() {
      $http.post('/auth/signin', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the index page
        $location.path('/slides/edit');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
  function($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    //If user is signed in then redirect back home
    if ($scope.authentication.user) $location.path('/');

    // Submit forgotten password account id
    $scope.askForPasswordReset = function() {
      $scope.success = $scope.error = null;

      $http.post('/auth/forgot', $scope.credentials).success(function(response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function(response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function() {
      $scope.success = $scope.error = null;

      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // If user is not signed in then redirect back home
    if (!$scope.user) $location.path('/');

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function(provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function(provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function(provider) {
      $scope.success = $scope.error = null;

      $http.delete('/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function(response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function(response) {
        $scope.error = response.message;
      });
    };

    // Update a user profile
    $scope.updateUserProfile = function(isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);

        user.$update(function(response) {
          $scope.success = true;
          Authentication.user = response;
        }, function(response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };

    // Change user password
    $scope.changeUserPassword = function() {
      $scope.success = $scope.error = null;

      $http.post('/users/password', $scope.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', function($window) {
	var auth = {
		user: $window.user
    };

	return auth;
}]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function($resource) {
    return $resource('users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);