'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'visplayer';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

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
  'models': ['vis', 'json', '7z', 'zip', 'gz'],
  'images': ['bmp', 'png', 'jpg', 'gif', 'tif', 'tiff', 'tga', 'eps', 'svg'],
  'texts':  ['txt', 'dat', 'json', 'js', 'sh', 'md', 'cpp', 'h']
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

//Files service used to communicate Files REST endpoints
angular.module('core').service('Files', ['$resource', '$window', '$upload', 'Authentication',
  function($resource, $window, $upload, Authentication) {
    var authentication = Authentication;

    // Define file resouce binding
    var rsc = $resource('files/:filename', {
      filename: '@filename'
    }, {
      update: {
        method: 'PUT'
      }
    });

    // Define upload method
    this.upload = function(files, onprogress, onsuccess, onerror) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          $upload.upload({
            url: '/upload',
            file: file
          }).progress(onprogress).success(onsuccess).error(onerror);
        }
      }
    };

    // Define query method
    this.query = function(cb) {
      rsc.query(cb);
    };

    // Deinfe load method
    this.load = function(filename, onprogress, onsuccess, onerror) {
      // Initialize XMLHttpRequest
      var req = new $window.XMLHttpRequest();

      // Define progress callback
      function cbprogress(evt) {
        var total = req.getResponseHeader('ContentLength');
        onprogress(evt, total);
      }

      // Define success callback
      function cbsuccess(evt) {
        // // Decrypt encrypted data
        // var raw = JSON.parse(req.responseText);
        // var params = $window.CryptoJS.lib.CipherParams.create({
        //   ciphertext: $window.CryptoJS.enc.Hex.parse(raw.ciphertext)
        // });
        // var salt = $window.CryptoJS.enc.Hex.parse(raw.salt);
        // var key = $window.CryptoJS.EvpKDF(authentication.user._id, salt, {
        //   keySize: 128 / 32
        // });
        // var iv = $window.CryptoJS.enc.Hex.parse(raw.iv);
        // var dec = $window.CryptoJS.AES.decrypt(params, key, {iv: iv, mode: $window.CryptoJS.mode.CBC});
        // var res = dec.toString($window.CryptoJS.enc.Utf8);
        
        // Set raw data
        var res = req.response;

        // Post-processing
        onsuccess(evt, res);
      }

      // Define error callback
      function cberror(evt) {
        onerror(evt);
      }

      // Add event listeners
      req.addEventListener('progress', cbprogress, false);
      req.addEventListener('load', cbsuccess, false);
      req.addEventListener('error', cberror, false);

      // Send request
      req.open('get', 'files/' + filename, true);
      req.send();
    };

    // Define delete method
    this.delete = function(filename, cb) {
      rsc.delete({
          filename: filename
        },
        function(res) {
          console.log('%s is deleted successfully.', filename);
          cb(filename);
        },
        function(err) {
          console.log('Failed to delete %s!', filename);
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

//Node service used for managing  nodes
angular.module('core').service('Nodes', [

  function() {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the nodes object
    this.nodes = {};

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

    // Validate node existance
    this.validateNodeExistance = function(nodeId) {
      if (nodeId && nodeId.length) {
        if (this.nodes[nodeId]) {
          return true;
        } else {
          throw new Error('Node does not exists');
        }
      } else {
        throw new Error('NodeId was not provided');
      }

      return false;
    };

    // Get the node object by node id
    this.getNode = function(nodeId) {
      // Validate that the node exists
      this.validateNodeExistance(nodeId);

      // Return the node object
      return this.nodes[nodeId];
    };

    // Add new node object by node id
    this.addNode = function(nodeId, isPublic, roles) {
      // Create the new node
      this.nodes[nodeId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };

      // Return the node object
      return this.nodes[nodeId];
    };

    // Remove existing node object by node id
    this.removeNode = function(nodeId) {
      // Validate that the node exists
      this.validateNodeExistance(nodeId);

      // Return the node object
      delete this.nodes[nodeId];
    };

    // Add node item object
    this.addNodeItem = function(nodeId, nodeItemTitle, nodeItemIcon, nodeItemURL, nodeItemType, isPublic, roles) {
      // Validate that the node exists
      this.validateNodeExistance(nodeId);

      // Push new node item
      this.nodes[nodeId].items.push({
        title: nodeItemTitle,
        icon: nodeItemIcon,
        link: nodeItemURL,
        nodeItemType: nodeItemType || 'item',
        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.nodes[nodeId].isPublic : isPublic),
        roles: ((roles === null || typeof roles === 'undefined') ? this.nodes[nodeId].roles : roles),
        items: [],
        shouldRender: shouldRender
      });

      // Return the node object
      return this.nodes[nodeId];
    };

    // Add subnode item object
    this.addSubNodeItem = function(nodeId, rootNodeItemURL, nodeItemTitle, nodeItemIcon, nodeItemWidgets, nodeItemURL, isPublic, roles) {
      // Validate that the node exists
      this.validateNodeExistance(nodeId);

      // Search for node item
      for (var itemIndex in this.nodes[nodeId].items) {
        if (this.nodes[nodeId].items[itemIndex].link === rootNodeItemURL) {
          // Push new subnode item
          this.nodes[nodeId].items[itemIndex].items.push({
            title: nodeItemTitle,
            icon: nodeItemIcon,
            widgets: nodeItemWidgets,
            link: nodeItemURL,
            isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.nodes[nodeId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || typeof roles === 'undefined') ? this.nodes[nodeId].items[itemIndex].roles : roles),
            shouldRender: shouldRender
          });
        }
      }

      // Return the node object
      return this.nodes[nodeId];
    };

    // Remove existing node object by node id
    this.removeNodeItem = function(nodeId, nodeItemURL) {
      // Validate that the node exists
      this.validateNodeExistance(nodeId);

      // Search for node item to remove
      for (var itemIndex in this.nodes[nodeId].items) {
        if (this.nodes[nodeId].items[itemIndex].link === nodeItemURL) {
          this.nodes[nodeId].items.splice(itemIndex, 1);
        }
      }

      // Return the node object
      return this.nodes[nodeId];
    };

    // Remove existing node object by node id
    this.removeSubNodeItem = function(nodeId, subnodeItemURL) {
      // Validate that the node exists
      this.validateNodeExistance(nodeId);

      // Search for node item to remove
      for (var itemIndex in this.nodes[nodeId].items) {
        for (var subitemIndex in this.nodes[nodeId].items[itemIndex].items) {
          if (this.nodes[nodeId].items[itemIndex].items[subitemIndex].link === subnodeItemURL) {
            this.nodes[nodeId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the node object
      return this.nodes[nodeId];
    };

    // Adding the file tree node
    this.addNode('fileTree');

    // Adding the scene tree node
    this.addNode('sceneTree');
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

      // Create lights.
      createLights();

      // Create orbit control
      orbitor = new $window.THREE.OrbitControls(activeCamera, renderer.domElement);

      // Add listeners
      $window.addEventListener('resize', onWindowResize, false);

      // Animate
      animate();
    };

    // Query models
    this.queryModels = function(cb) {
      var modelnames = [];
      activeScene.children.forEach(function(object) {
        if(object.type === 'model') {
          modelnames.push(object.name);
        }
      });
      cb(modelnames);
    };

    // Load model
    this.loadModel = function(gd, cb) {
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

      // Post-processing
      cb(object);
    };

    // Remove model
    this.removeModel = function(modelname) {
      var index = 0;
      activeScene.children.forEach(function(object) {
        if (object.displayName === modelname) {
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
    var createRenderer = function() {
      container = $document[0].getElementById('canvas');
      renderer = $window.WebGLRenderingContext ?
        new $window.THREE.WebGLRenderer({
          alpha: true,
          antialias: true
        }) :
        new $window.THREE.CanvasRenderer();
      renderer.setSize($window.innerWidth, $window.innerHeight);
      renderer.autoClear = true;
      container.appendChild(renderer.domElement);
    };

    // Create camera
    var createCamera = function() {
      var camera = new $window.THREE.PerspectiveCamera(CAMERA_ANGLE, $window.innerWidth / $window.innerHeight, 1, BOX_SIZE * 10);
      camera.name = 'VIEW #' + cameras.length + 1;
      camera.position.set(BOX_SIZE * 2, BOX_SIZE, BOX_SIZE * 2);
      camera.target = new $window.THREE.Vector3();
      cameras.push(camera);
      activeCamera = camera;
    };

    // Create scene
    var createScene = function() {
      var scene = new $window.THREE.Scene();
      scenes.push(scene);
      activeScene = scene;
    };

    // Create helpers
    var createHelpers = function() {
      // Grid
      var grid = new $window.THREE.GridHelper(BOX_SIZE, GAP_SIZE);
      grid.name = 'GRID';
      activeScene.add(grid);

      // Axis
      var axis = new $window.THREE.AxisHelper(BOX_SIZE);
      axis.name = 'AXIS';
      axis.visible = false;
      activeScene.add(axis);
    };

    // Create lights
    var createLights = function() {
      eyeLight = new $window.THREE.DirectionalLight(0xffffff, 0.5);
      eyeLight.name = 'EYE LIGHT';
      eyeLight.position.set(BOX_SIZE, BOX_SIZE, BOX_SIZE);
      activeScene.add(eyeLight);
    };

    // Count object instances
    var countModelInstances = function (name) {
      var count = 0;
      activeScene.children.forEach(function(object) {
        if(object.type === 'model') {
          if(object.name === name) {
            count++;
          }
        }
      });
      return count;
    };

    /**
     * Event callbacks
     */
    // Resize
    var onWindowResize = function() {
      activeCamera.aspect = $window.innerWidth / $window.innerHeight;
      activeCamera.updateProjectionMatrix();
      renderer.setSize($window.innerWidth, $window.innerHeight);
    };

    /**
     * Rendering utilities
     */
    // Animate
    var animate = function() {
      $window.requestAnimationFrame(animate);
      update();
      render();
    };

    // Render
    var render = function() {
      renderer.render(activeScene, activeCamera);
    };

    // Update
    var update = function() {
      activeCamera.target.copy(orbitor.target);
      eyeLight.position.set(activeCamera.position.x, activeCamera.position.y, activeCamera.position.z);
    };
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
    this.addToolItem = function(toolId, toolItemTitle, toolItemIcon, toolItemURL, toolItemType, isPublic, roles) {
      // Validate that the tool exists
      this.validateToolExistance(toolId);

      // Push new tool item
      this.tools[toolId].items.push({
        title: toolItemTitle,
        icon: toolItemIcon,
        link: toolItemURL,
        toolItemType: toolItemType || 'item',
        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.tools[toolId].isPublic : isPublic),
        roles: ((roles === null || typeof roles === 'undefined') ? this.tools[toolId].roles : roles),
        items: [],
        shouldRender: shouldRender
      });

      // Return the tool object
      return this.tools[toolId];
    };

    // Add subtool item object
    this.addSubToolItem = function(toolId, rootToolItemURL, toolItemTitle, toolItemIcon, toolItemAction, toolItemURL, isPublic, roles) {
      // Validate that the tool exists
      this.validateToolExistance(toolId);

      // Search for tool item
      for (var itemIndex in this.tools[toolId].items) {
        if (this.tools[toolId].items[itemIndex].link === rootToolItemURL) {
          // Push new subtool item
          this.tools[toolId].items[itemIndex].items.push({
            title: toolItemTitle,
            icon: toolItemIcon,
            action: toolItemAction,
            link: toolItemURL,
            isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.tools[toolId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || typeof roles === 'undefined') ? this.tools[toolId].items[itemIndex].roles : roles),
            shouldRender: shouldRender
          });
        }
      }

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

    // Remove existing tool object by tool id
    this.removeSubToolItem = function(toolId, subtoolItemURL) {
      // Validate that the tool exists
      this.validateToolExistance(toolId);

      // Search for tool item to remove
      for (var itemIndex in this.tools[toolId].items) {
        for (var subitemIndex in this.tools[toolId].items[itemIndex].items) {
          if (this.tools[toolId].items[itemIndex].items[subitemIndex].link === subtoolItemURL) {
            this.tools[toolId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the tool object
      return this.tools[toolId];
    };

    //Adding the sidebar tool
    this.addTool('sidebar');
  }
]);

'use strict';

// Configuring the Slides module
angular.module('slides').run(['Menus', 'Tools', 'Nodes',
  function(Menus, Tools, Nodes) {
    // Set topbar menu items
    Menus.addMenuItem('topbar', 'Slides', 'slides', 'dropdown', '/slides(/create)?');
    Menus.addSubMenuItem('topbar', 'slides', 'New Slide', 'slides/create');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'Files', 'glyphicon-file', 'files', 'dropdown');
    Tools.addSubToolItem('sidebar', 'files', 'Upload Files', 'glyphicon-cloud-upload', 'uploadFiles', 'upload/files');
    Tools.addToolItem('sidebar', 'Edits', 'glyphicon-edit', 'edits', 'dropdown');
    Tools.addToolItem('sidebar', 'Materials', 'glyphicon-tint', 'materials', 'dropdown');
    Tools.addToolItem('sidebar', 'Views', 'glyphicon-camera', 'views', 'dropdown');
    Tools.addToolItem('sidebar', 'Markups', 'glyphicon-tags', 'markups', 'dropdown');
    Tools.addToolItem('sidebar', 'Scripts', 'glyphicon-list-alt', 'scripts', 'dropdown');

    // Set file tree node items
    Nodes.addNodeItem('fileTree', 'Resources', 'glyphicon-briefcase', 'resources', 'dropdown');

    // Set scene tree node items 
    Nodes.addNodeItem('sceneTree', 'Models', 'glyphicon-briefcase', 'models', 'dropdown');
  }
]);

// Configuring file widgets
angular.module('slides').constant('fileWidgets', [{
  'name': 'Delete',
  'action': 'deleteFile',
  'icon': 'glyphicon-trash'
}, {
  'name': 'Load',
  'action': 'loadFile',
  'icon': 'glyphicon-download'
}, {
  'name': 'Edit',
  'action': 'editFile',
  'icon': 'glyphicon-edit'
}]);

// Configuring scene widgets
angular.module('slides').constant('sceneWidgets', [{
  'name': 'Remove',
  'action': 'removeModel',
  'icon': 'glyphicon-remove'
}]);

// Configure http interseptor
angular.module('slides').factory('httpResponseInterceptor', ['$q', function($q) {
  return {
    response: function(res) {
      return res || $q.when(res);
    }
  };  
}])
.config(['$httpProvider',function($httpProvider) {
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
angular.module('slides').controller('SlidesController', ['$scope', '$stateParams', '$location', '$window', '$timeout', '$upload', 'Authentication', 'Scene', 'Files', 'Tools', 'Nodes', 'FileTypes', 'fileWidgets', 'sceneWidgets', 'Slides', function($scope, $stateParams, $location, $window, $timeout, $upload, Authentication, Scene, Files, Tools, Nodes, FileTypes, fileWidgets, sceneWidgets, Slides) {
  $scope.authentication = Authentication;

  //---------------------------------------------------
  //  Initialization
  //---------------------------------------------------
  // Initialize ticker
  $scope.ticker = 0.0;
  $scope.showTicker = false;

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
  $scope.showPanel = false;
  $scope.subTools = [];
  $scope.activeIndex = -1;
  $scope.activateToolset = function(index) {
    if ($scope.activeIndex === -1) {
      $scope.activeIndex = index;
      $scope.showPanel = true;
      $scope.subTools = $scope.tools[index].items;
    } else if ($scope.activeIndex === index) {
      $scope.activeIndex = -1;
      $scope.showPanel = false;
      $scope.subTools = [];
    } else if ($scope.activeIndex !== index) {
      $scope.subTools = $scope.tools[index].items;
      $scope.activeIndex = index;
      $scope.showPanel = $scope.subTools.length > 0 ? true : false;
    }
  };

  // Tool callbacks
  // Activate a tool
  $scope.activateTool = function(index) {
    $scope[$scope.subTools[index].action]();
  };

  // Import model
  $scope.uploadFiles = function() {
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
    function onprogress(evt, total) {
      // Set ticker
      $scope.ticker= (evt.loaded / total * 100).toFixed();
      $scope.$apply();

      // Log
      console.log('progress: ' + $scope.ticker + '% ' + filename);
    }

    // Define success callback
    function onsuccess(evt, res) {
      // Log
      console.log('Model is loaded successfully.');

      // Load data to scene
      var data = JSON.parse(res);
      Scene.loadModel(data, function(object) {
        // Add scene node
        addSceneNode(object.displayName.toLowerCase());

        // Reset ticker
        resetTicker();
      });
    }

    // Define error callback
    function onerror(evt) {
      // Log
      console.log('Failed to load model %s!', filename);

      // Reset ticker
      resetTicker();
    }

    // Load file
    $scope.showTicker = true;
    Files.load(filename, onprogress, onsuccess, onerror);
  };

  // Delete a file
  $scope.deleteFile = function(node) {
    var filename = node.title;
    var message = 'Delete ' + filename + ' from server?';
    var res = $window.confirm(message);

    // Define delete callback
    function ondelete(filename) {
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
    // Define progress callback
    function onprogress(evt) {
      // Set ticker
      $scope.ticker = (evt.loaded / evt.total * 100).toFixed();

      // Log
      console.log('progress: ' + $scope.ticker + '% ' + evt.config.file.name);
    }

    // Define success callback
    function onsuccess(data, status, headers, config) {
      // Log
      console.log('%s is uploaded successfully.', config.file.name);

      // Prepare icon and widgets
      var ext = config.file.name.split('.').reverse()[0];
      var icon = getFileIcon(ext);
      var widgets = getFileWidgets(ext);

      // Add file node
      Nodes.addSubNodeItem('fileTree', 'resources', config.file.name, icon, widgets, config.file.name);

      // Reset ticker
      resetTicker();
    }

    // Define error callback
    function onerror(err) {
      // Log
      console.log(err);

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