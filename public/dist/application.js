'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  // Init module configuration options
  var applicationModuleName = 'visplayer';
  var applicationModuleVendorDependencies = ['ngResource', 'ngCookies', 'ngAnimate', 'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

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

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('slides');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');

'use strict';

// Configuring file type constants
angular.module('core').constant('FileTypes', {
  'models': ['vis', 'json'],
  'images': ['png', 'jpg', 'gif'],
  'texts': ['txt', 'js', 'md']
});

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

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
  function($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');

    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

'use strict';

angular.module('slides').controller('UploadFilesController', ['$rootScope', '$scope', '$log', '$modalInstance', 'Files',

  function($rootScope, $scope, $log, $modalInstance, Files) {
    // Initialize file name list
    $scope.files = [];
    $scope.names = [];

    // Collect files
    $scope.collect = function(files) {
      // Check input data
      if (!angular.isDefined(files) || files.length <= 0)
        return;

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
        $modalInstance.dismiss('success');
        $rootScope.$broadcast('upload-files.success', config.file.name);
      }

      // Define error callback
      function onerror(err) {
        $modalInstance.dismiss('failed');
        $rootScope.$broadcast('upload-files.failed');
      }

      if ($scope.files.length > 0) {
        Files.upload($scope.files, null, onsuccess, onerror);
      }
    };
  }
]);

'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Dialogs', ['$modal',

  function($modal) {
    this.uploadFiles = function() {
      return $modal.open({
        templateUrl: 'modules/core/views/upload-files.client.view.html',
        controller: 'UploadFilesController',
        size: 'sm'
      });
    };
  }
]);

'use strict';

//Files service used to communicate Files REST endpoints
angular.module('core').service('Files', ['$resource', '$http', '$window', '$log', '$upload', 'Authentication',
  function($resource, $http, $window, $log, $upload, Authentication) {
    var authentication = Authentication;

    // Define file resouce binding
    var rc = $resource('files/:filename', {
      filename: '@filename'
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
    this.upload = function(files, onprogress, onsuccess, onerror) {
      // Check input data
      if (!angular.isDefined(files) || files.length <= 0)
        return;

      // Upload each file
      files.forEach(function(file) {
        // Define progress callback
        function cbprogress(evt) {
          var perc = (evt.loaded / evt.total * 100).toFixed();
          $log.log('progress: ' + perc + '% ' + evt.config.file.name);
        }

        // Define success callback
        function cbsuccess(data, status, getHeaders, config) {
          $log.info('%s is uploaded successfully.', config.file.name);
          if (onsuccess) {
            onsuccess(config);
          }
        }

        // Define error callback
        function cberror(err) {
          $log.error(err);
          if (onerror) {
            onerror(err);
          }
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
      function cbsuccess(data, getHeader) {
        if (onsuccess) {
          onsuccess(data);
        }
      }

      // Send request
      rc.query(cbsuccess);
    };

    // Define download method
    this.download = function(filenames, onsuccess, onerror) {
      // Check input data
      if (!angular.isDefined(filenames) || filenames.length <= 0)
        return;

      // Download each file
      filenames.forEach(function(filename) {
        // Define success callback
        function cbsuccess(data, status, getHeaders, config) {
          if (data && onsuccess) {
            onsuccess(data, filename);
          }
        }

        // Define error callback
        function cberror(data, status, getHeaders, config) {
          if (onerror) {
            onerror(status);
          }
        }

        // Send request
        var url = 'files/' + filename;
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
    this.load = function(filenames, onprogress, onsuccess, onerror) {
      // Check input data
      if (!angular.isDefined(filenames) || filenames.length <= 0)
        return;

      // Load each file
      filenames.forEach(function(filename) {
        // Define progress callback
        function cbprogress(evt) {
          var total = req.getResponseHeader('ContentLength');
          var perc = (evt.loaded / total * 100).toFixed();
          $log.log('progress: ' + perc + '% ' + filename);
          if (onprogress) {
            onprogress(perc);
          }
        }

        // Define success callback
        function cbsuccess(evt) {
          // // Decrypt encrypted data
          //decryptData(req.responseText, authentication.user._id);
          $log.info('%s is loaded successfully.', filename);
          if (onsuccess) {
            onsuccess(req.response);
          }
        }

        // Define error callback
        function cberror(evt) {
          $log.error('Failed to load %s.', filenames);
          if (onerror) {
            onerror(evt);
          }
        }

        // Initialize XMLHttpRequest
        var req = new $window.XMLHttpRequest();

        // Add event listeners
        req.addEventListener('progress', cbprogress, false);
        req.addEventListener('load', cbsuccess, false);
        req.addEventListener('error', cberror, false);

        // Send request
        req.open('get', 'files/' + filename + '?level=display', true);
        req.send();
      });
    };

    // Define delete method
    this.delete = function(filenames, onsuccess, onerror) {
      var passed = [];
      var failed = [];

      // Delete each file
      filenames.forEach(function(filename) {
        // Define success callback
        function cbsuccess(data, getHeader) {
          passed.push(filename);
          $log.info('%s is deleted successfully.', filename);
          if (onsuccess) {
            onsuccess(passed);
          }
        }

        // Define error callback
        function cberror(data) {
          failed.push(filename);
          $log.error('Failed to delete %s!', filename);
          if (onerror) {
            onerror(failed);
          }
        }

        // Send request
        rc.delete({
          filename: filename
        }, cbsuccess, cberror);
      });
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
        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
        roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
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
            isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
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
angular.module('core').service('Scene', ['$window', '$document',

  function($window, $document) {
    //---------------------------------------------------
    //  Variables
    //---------------------------------------------------
    // Static variables
    var BOX_SIZE = 1500;
    var GAP_SIZE = 100;
    var CAMERA_ANGLE = 45;
    var CAMERA_POSITION = new $window.THREE.Vector3(1122.6119550523206, 832.1930544185049, 2077.2549403849953);

    // Material definitions
    var faceAnalysisMaterial = new $window.THREE.MeshNormalMaterial({
      side: $window.THREE.DoubleSide
    });
    var faceDefaultMaterial = new $window.THREE.MeshPhongMaterial({
      color: 0xcecece,
      specular: 0xffffff,
      metal: true,
      shininess: 25,
      side: $window.THREE.DoubleSide
    });
    var faceShinyGlassMaterial = new $window.THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.5,
      reflectivity: 0.5,
      envMap: (function() {
        var path = 'modules/core/img/cube/';
        var format = '.jpg';
        var urls = [
          path + 'posx' + format, path + 'negx' + format,
          path + 'posy' + format, path + 'negy' + format,
          path + 'posz' + format, path + 'negz' + format
        ];
        var reflectionCube = $window.THREE.ImageUtils.loadTextureCube(urls);
        reflectionCube.format = $window.THREE.RGBFormat;
        return reflectionCube;
      })(),
      combine: $window.THREE.MixOperation,
      side: $window.THREE.DoubleSide
    });
    var edgeDefaultMaterial = new $window.THREE.LineBasicMaterial({
      color: 0x333333
    });

    // Scene definitions
    var container;
    var renderer;
    var cameras = [];
    var activeCamera;
    var scenes = [];
    var activeScene;
    var eyeLight;
    var orbitor;

    // Transient variables
    var i, j, k;

    //---------------------------------------------------
    //  Exports
    //---------------------------------------------------
    // Initialize scene
    this.initialize = function() {
      // Check webgl
      if (!$window.Detector.webgl) {
        $window.Detector.addGetWebGLMessage();
      }

      // Create camera
      createCamera();

      // Create render
      createRenderer();

      // Create scene
      createScene();

      // Create helpers
      createHelpers();

      // Create lights
      createLights();

      // Create orbitor
      orbitor = new $window.THREE.OrbitControls(activeCamera, renderer.domElement);

      // Add listeners
      $window.addEventListener('resize', onWindowResize, false);

      // Animate
      animate();
    };

    // Query models
    this.queryModels = function(onsuccess) {
      var modelnames = [];
      activeScene.children.forEach(function(object) {
        if (object.type === 'model') {
          modelnames.push(object.name);
        }
      });
      if(onsuccess) {
        onsuccess(modelnames);
      }
    };

    // Load model
    this.loadModel = function(gd, onsuccess) {
      // Check input data
      if(!angular.isDefined(gd))
        return;

      // Count instances
      var count = countModelInstances(gd.name) + 1;

      // Create scene object
      var object = new $window.THREE.Object3D();
      object.name = gd.name;
      object.displayName = object.name + ' #' + count;
      object.type = 'model';
      var faces = new $window.THREE.Object3D();
      object.add(faces);
      var edges = new $window.THREE.Object3D();
      object.add(edges);

      // Create faces
      for (i = 0; i < gd.faces.length; i++) {
        // Create geometry
        var faceGeometry = new $window.THREE.Geometry();
        var fd = gd.faces[i].tessellation.facets[0];
        for (j = 0; j < fd.vertexCount; j++) {
          faceGeometry.vertices.push(
            new $window.THREE.Vector3(
              fd.vertexCoordinates[j * 3],
              fd.vertexCoordinates[j * 3 + 1],
              fd.vertexCoordinates[j * 3 + 2]
            ));
        }
        for (j = 0; j < fd.facetCount; j++) {
          faceGeometry.faces.push(
            new $window.THREE.Face3(
              fd.vertexIndices[j * 3] - 1,
              fd.vertexIndices[j * 3 + 1] - 1,
              fd.vertexIndices[j * 3 + 2] - 1
            ));
        }

        // Evaluate faceGeometry addtional gd
        faceGeometry.key = gd.faces[i].id;
        faceGeometry.computeFaceNormals();
        faceGeometry.computeVertexNormals();
        faceGeometry.computeBoundingBox();
        if (i === 0) {
          object.box = faceGeometry.boundingBox;
        } else {
          object.box.union(faceGeometry.boundingBox);
        }

        // Create mesh
        var faceMesh = new $window.THREE.Mesh(faceGeometry, faceDefaultMaterial);

        // Add to parent
        faces.add(faceMesh);
      }

      // Create gd.edges
      for (i = 0; i < gd.edges.length; i++) {
        // Create geometry
        var edgeGeometry = new $window.THREE.Geometry();
        var ed = gd.edges[i].tessellation;
        for (j = 0; j < ed.vertexCount; j++) {
          edgeGeometry.vertices.push(
            new $window.THREE.Vector3(
              ed.points[j * 3],
              ed.points[j * 3 + 1],
              ed.points[j * 3 + 2]
            ));
        }

        // Compute geometry addtional gd
        edgeGeometry.key = ed.id;
        edgeGeometry.computeBoundingBox();

        // Create line
        var edgeMesh = new $window.THREE.Line(edgeGeometry, edgeDefaultMaterial);

        // Add to parent
        edges.add(edgeMesh);
      }

      // Set object position and scale
      var v = new $window.THREE.Vector3();
      var radius = v.copy(object.box.max).sub(object.box.min).length() / 2.0;
      var scale = BOX_SIZE / radius / 2.0;
      var origin = new $window.THREE.Vector3();
      origin.copy(object.box.min).add(object.box.max).multiplyScalar(0.5 * scale);
      var halfy = (object.box.max.y - object.box.min.y) * scale / 2.0;
      faces.children.forEach(function(face) {
        face.scale.set(scale, scale, scale);
        face.updateMatrix();
        face.translateX(-origin.x);
        face.translateY(-origin.y + halfy);
        face.translateZ(-origin.z);
      });
      edges.children.forEach(function(edge) {
        edge.scale.set(scale, scale, scale);
        edge.updateMatrix();
        edge.translateX(-origin.x);
        edge.translateY(-origin.y + halfy);
        edge.translateZ(-origin.z);
      });

      // Add to scene
      activeScene.add(object);

      // Create transformer
      var transformer = new $window.THREE.TransformControls(activeCamera, renderer.domElement);
      transformer.attach(object);
      transformer.translateY(halfy);
      transformer.setMode('rotate');
      transformer.addEventListener('change', render);

      // Add to scene
      activeScene.add(transformer);

      // Post-processing
      if(onsuccess) {
        onsuccess(object);
      }
    };

    // Remove object
    this.removeObject = function(objname) {
      // Check input data
      if(!angular.isDefined(objname))
        return;

      // Remove object
      var index = 0;
      activeScene.children.forEach(function(object) {
        if (object.displayName === objname) {
          activeScene.children.splice(index, 1);
          return;
        }
        index++;
      });
    };

    //---------------------------------------------------
    //  Internals
    //---------------------------------------------------
    /**
     * Scene management
     */
    // Create renderer
    function createRenderer() {
      container = $document[0].getElementById('canvas');
      renderer = $window.WebGLRenderingContext ?
        new $window.THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true
        }) :
        new $window.THREE.CanvasRenderer();
      renderer.setSize($window.innerWidth, $window.innerHeight);
      renderer.setPixelRatio($window.devicePixelRatio);
      renderer.autoClear = true;
      container.appendChild(renderer.domElement);
    }

    // Create camera
    function createCamera() {
      var camera = new $window.THREE.PerspectiveCamera(CAMERA_ANGLE, $window.innerWidth / $window.innerHeight, 1, BOX_SIZE * 10);
      camera.name = 'VIEW #' + cameras.length + 1;
      camera.position.set(BOX_SIZE * 2, BOX_SIZE, BOX_SIZE * 2);
      camera.target = new $window.THREE.Vector3();
      cameras.push(camera);
      activeCamera = camera;
    }

    // Create scene
    function createScene() {
      var scene = new $window.THREE.Scene();
      scenes.push(scene);
      activeScene = scene;
    }

    // Create helpers
    function createHelpers() {
      // Grid
      var grid = new $window.THREE.GridHelper(BOX_SIZE, GAP_SIZE);
      grid.name = 'GRID';
      activeScene.add(grid);

      // Axis
      var axis = new $window.THREE.AxisHelper(BOX_SIZE);
      axis.name = 'AXIS';
      axis.visible = false;
      activeScene.add(axis);
    }

    // Create lights
    function createLights() {
      eyeLight = new $window.THREE.DirectionalLight(0xffffff, 0.5);
      eyeLight.name = 'EYE LIGHT';
      eyeLight.position.set(BOX_SIZE, BOX_SIZE, BOX_SIZE);
      activeScene.add(eyeLight);
    }

    // Count object instances
    function countModelInstances(name) {
      // Check input data
      if(!angular.isDefined(name))
        return 0;

      // Count object instances
      var count = 0;
      activeScene.children.forEach(function(object) {
        if (object.type === 'model') {
          if (object.name === name) {
            count++;
          }
        }
      });
      return count;
    }

    /**
     * Event callbacks
     */
    // Resize
    function onWindowResize() {
      activeCamera.aspect = $window.innerWidth / $window.innerHeight;
      activeCamera.updateProjectionMatrix();
      renderer.setSize($window.innerWidth, $window.innerHeight);
    }

    /**
     * Rendering utilities
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
    }

    // Update
    function update() {
      activeCamera.target.copy(orbitor.target);
      eyeLight.position.set(activeCamera.position.x, activeCamera.position.y, activeCamera.position.z);
    }
  }
]);

'use strict';

//Tool service used for managing  tools
angular.module('core').service('Tools', [

  function() {
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
        if (this.tools[toolId]) {
          return true;
        } else {
          throw new Error('Tool does not exists');
        }
      } else {
        throw new Error('ToolId was not provided');
      }

      return false;
    };

    // Get the tool object by tool id
    this.getTool = function(toolId) {
      // Validate that the tool exists
      this.validateToolExistance(toolId);

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
      this.validateToolExistance(toolId);

      // Return the tool object
      delete this.tools[toolId];
    };

    // Add tool item object
    this.addToolItem = function(toolId, toolItemTitle, toolItemIcon, toolItemURL, toolItemAction, toolItemTip, isPublic, roles, position) {
      // Validate that the tool exists
      this.validateToolExistance(toolId);

      // Push new tool item
      this.tools[toolId].items.push({
        title: toolItemTitle,
        icon: toolItemIcon,
        link: toolItemURL || toolItemAction,
        uiRoute: '/' + toolItemURL,
        action: toolItemAction,
        tooltip: toolItemTip,
        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.tools[toolId].isPublic : isPublic),
        roles: ((roles === null || typeof roles === 'undefined') ? this.tools[toolId].roles : roles),
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
      this.validateToolExistance(toolId);

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
angular.module('core').service('Trees', [

  function() {
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
        if (this.trees[treeId]) {
          return true;
        } else {
          throw new Error('Tree does not exists');
        }
      } else {
        throw new Error('TreeId was not provided');
      }

      return false;
    };

    // Get the tree object by tree id
    this.getTree = function(treeId) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

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

    // Remove existing tree object by tree id
    this.removeTree = function(treeId) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Return the tree object
      delete this.trees[treeId];
    };

    // Add tree item object
    this.addTreeItem = function(treeId, treeItemTitle, treeItemIcon, treeItemURL, isPublic, roles) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Push new tree item
      this.trees[treeId].items.push({
        title: treeItemTitle,
        icon: treeItemIcon,
        link: treeItemURL,
        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.trees[treeId].isPublic : isPublic),
        roles: ((roles === null || typeof roles === 'undefined') ? this.trees[treeId].roles : roles),
        items: [],
        checked: false,
        shouldRender: shouldRender
      });

      // Return the tree object
      return this.trees[treeId];
    };

    // Add subtree item object
    this.addSubTreeItem = function(treeId, rootTreeItemURL, treeItemTitle, treeItemIcon, treeItemURL, isPublic, roles) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Search for tree item
      for (var itemIndex in this.trees[treeId].items) {
        if (this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
          // Push new subtree item
          this.trees[treeId].items[itemIndex].items.push({
            title: treeItemTitle,
            icon: treeItemIcon,
            link: treeItemURL,
            isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.trees[treeId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || typeof roles === 'undefined') ? this.trees[treeId].items[itemIndex].roles : roles),
            checked: false,
            shouldRender: shouldRender
          });
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeTreeItem = function(treeId, treeItemURL) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Search for tree item to remove
      for (var itemIndex in this.trees[treeId].items) {
        if (this.trees[treeId].items[itemIndex].link === treeItemURL) {
          this.trees[treeId].items.splice(itemIndex, 1);
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeSubTreeItem = function(treeId, subtreeItemURL) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

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
      this.validateTreeExistance(treeId);

      // Search for subtree items
      for (var itemIndex in this.trees[treeId].items) {
        if (this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
          var item = this.trees[treeId].items[itemIndex];
          if (angular.isDefined(item.items) && item.items.length > 0) {
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
      this.validateTreeExistance(treeId);

      // Search for tree item to remove
      var items = [];
      for (var itemIndex in this.trees[treeId].items) {
        for (var subitemIndex in this.trees[treeId].items[itemIndex].items) {
          if (this.trees[treeId].items[itemIndex].items[subitemIndex].checked === true) {
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
angular.module('slides').run(['Menus', 'Tools', 'Trees', 'Dialogs',
  function(Menus, Tools, Trees, Dialogs) {
    // Set topbar menu items
    Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown');
    Menus.addSubMenuItem('topbar', 'slides', 'New Project', 'slides/create');

    // Adding tools
    Tools.addTool('sidebar');
    Tools.addTool('views');
    Tools.addTool('scene');
    Tools.addTool('files');
    Tools.addTool('modeling');
    Tools.addTool('materials');
    Tools.addTool('markups');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'Views', 'glyphicon-blackboard', 'slides/create/views', null, 'List of views');
    Tools.addToolItem('sidebar', 'Scene', 'glyphicon-camera', 'slides/create/scene', null, 'List of scene objects');
    Tools.addToolItem('sidebar', 'Files', 'glyphicon-file', 'slides/create/files', null, 'List of files');
    Tools.addToolItem('sidebar', 'Modeling', 'glyphicon-wrench', 'slides/create/modeling', null, 'List of modeling tools');
    Tools.addToolItem('sidebar', 'Materials', 'glyphicon-tint', 'slides/create/materials', null, 'List of materials');
    Tools.addToolItem('sidebar', 'Markups', 'glyphicon-tags', 'slides/create/markups', null, 'List of markups');

    // Set views tool items

    // Set scene tool items
    Tools.addToolItem('scene', 'Take Snapshot', 'glyphicon-picture', null, 'takeSnapshot', 'Take a snapshot for the scene');
    Tools.addToolItem('scene', 'Remove Objects', 'glyphicon-remove', null, 'removeObjects', 'Remove objects from scene');

    // Set files tool items
    Tools.addToolItem('files', 'Upload Files', 'glyphicon-cloud-upload', null, 'uploadFiles', 'Upload files to server');
    Tools.addToolItem('files', 'Download Files', 'glyphicon-cloud-download', null, 'downloadFiles', 'Download files from server');
    Tools.addToolItem('files', 'Load Files', 'glyphicon-download', null, 'loadFiles', 'Load files into scene');
    Tools.addToolItem('files', 'Delete Files', 'glyphicon-remove', null, 'deleteFiles', 'Delete files from server');

    // Set modeling tool items

    // Set marterials tool items

    // Set markups tool items

    // Adding trees
    Trees.addTree('files');
    Trees.addTree('scene');

    // Set file tree node items
    Trees.addTreeItem('files', 'Models', 'glyphicon-briefcase', 'models');
    Trees.addTreeItem('files', 'Images', 'glyphicon-briefcase', 'images');
    Trees.addTreeItem('files', 'Texts', 'glyphicon-briefcase', 'texts');
    Trees.addTreeItem('files', 'Others', 'glyphicon-briefcase', 'others');

    // Set scene tree node items
    Trees.addTreeItem('scene', 'Models', 'glyphicon-briefcase', 'models');
    Trees.addTreeItem('scene', 'Lights', 'glyphicon-briefcase', 'lights');
    Trees.addTreeItem('scene', 'Markups', 'glyphicon-briefcase', 'markups');
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
    state('createSlide.Scene', {
      url: '/scene',
      templateUrl: 'modules/slides/views/create-slide-scene.client.view.html'
    }).
    state('createSlide.Files', {
      url: '/files',
      templateUrl: 'modules/slides/views/create-slide-files.client.view.html'
    }).
    state('createSlide.Modeling', {
      url: '/modeling',
      templateUrl: 'modules/slides/views/create-slide-modeling.client.view.html'
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

'use strict';

// Slides controller
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$window', '$document', '$timeout', '$log', '$upload', 'Authentication', 'Scene', 'Files', 'Tools', 'Trees', 'Dialogs', 'FileTypes', 'Slides', function($scope, $stateParams, $location, $window, $document, $timeout, $log, $upload, Authentication, Scene, Files, Tools, Trees, Dialogs, FileTypes, Slides) {
  $scope.authentication = Authentication;

  //---------------------------------------------------
  //  Initialization
  //---------------------------------------------------
  // Initialize panel params
  $scope.link = null;
  $scope.showPanel = false;

  // Initialize modal instance
  $scope.modalInstance = null;

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
    if (angular.isDefined(action)) {
      $scope[action]();
    }
  };

  // Select all files
  $scope.checkAllFiles = function(item) {
    item.checked = !item.checked;
    Trees.checkAllSubTreeItems('files', item.link, item.checked);
  };

  // Select all objects
  $scope.checkAllObjects = function(item) {
    item.checked = !item.checked;
    Trees.checkAllSubTreeItems('scene', item.link, item.checked);
  };

  // Disable all files
  $scope.disableCheckAll = function(item) {
    if (item.items.length === 0) {
      item.checked = false;
      return true;
    } else {
      return false;
    }
  };

  // Import files
  $scope.uploadFiles = function() {
    $scope.modalInstance = Dialogs.uploadFiles();
  };

  // Download files
  $scope.downloadFiles = function() {
    // Get selected filenames
    var filenames = getCheckedSubTreeItems('files');

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
    var filenames = getCheckedSubTreeItems('files');

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
    var filenames = getCheckedSubTreeItems('files');

    // Define success callback
    function onsuccess(passed) {
      if (angular.isDefined(passed) && passed.length > 0) {
        passed.forEach(function(filename) {
          Trees.removeSubTreeItem('files', filename);
        });
      }
    }

    // Define error callback
    function onerror(failed) {
      if (angular.isDefined(failed) && failed.length > 0) {
        var msg = 'Failed to delete:\n';
        failed.forEach(function(filename) {
          msg += filename + '\n';
        });
        $window.alert(msg);
      }
    }

    // Delete files
    Files.delete(filenames, onsuccess, onerror);
  };

  // Take snapshot
  $scope.takeSnapshot = function() {
    var el = $document[0].getElementById('canvas').children[0];
    var url = el.toDataURL('image/png');
    downloadData(url, 'screenshot.png');
  };

  // Remove objects
  $scope.removeObjects = function() {
    // Get checked objects
    var objnames = getCheckedSubTreeItems('scene');

    // Remove objects
    objnames.forEach(function(objname) {
      Scene.removeObject(objname);
      Trees.removeSubTreeItem('scene', objname);
    });
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
  // Get checked subtree items
  function getCheckedSubTreeItems(treeId) {
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
    state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
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
        $location.path('/');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function() {
      $http.post('/auth/signin', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the index page
        $location.path('/');
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
angular.module('users').factory('Authentication', [
  function() {
    var _this = this;

    _this._data = {
      user: window.user
    };

    return _this._data;
  }
]);

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
