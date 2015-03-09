'use strict';

//Scene service used for managing scene
angular.module('core').service('Scene', ['$window', '$document',
	
	function($window, $document) {
		this.container = undefined;
		this.renderer = undefined;
		this.scene = undefined;		
		this.cameras = [];
		this.activeCamera = undefined;
		this.gridSize = 1000;
		this.gridStep = 100;
		this.axisSize = 1500;

		// Initialize scene
		this.initialize = function () {
			// Detect webgl
      if (!$window.Detector.webgl) {
      	$window.Detector.addGetWebGLMessage();
      }

      // Create render
      this.container = $document[0].getElementById('canvas');
      this.renderer = $window.WebGLRenderingContext ?
        new $window.THREE.WebGLRenderer({
          alpha: true, 
          antialias: true 
        }) :
        new $window.THREE.CanvasRenderer();
      this.renderer.setSize($window.innerWidth, $window.innerHeight);
      this.renderer.autoClear = true;
      this.container.appendChild(this.renderer.domElement);
      
      // Create default camera
      var camera = new $window.THREE.PerspectiveCamera(45, $window.innerWidth / $window.innerHeight, 1, 15000);
      camera.name = 'VIEW #' + this.cameras.length;
      camera.position.set(984.393167476599, 605.121508138134, 1123.7196015705397);
      camera.rotation.set(-0.5318628888897693, 0.673350831292923, 0.3516904119463236);
      camera.target = new $window.THREE.Vector3();
      this.cameras.push(camera);
      this.activeCamera = camera;

      // Create default scene
      this.scene = new $window.THREE.Scene();

      // Create helpers
      this.createHelpers();

      // Create orbit control
      this.orbitor = new $window.THREE.OrbitControls(this.activeCamera, this.renderer.domElement); 
		};

    // Render
    this.render = function () {
      this.renderer.render(this.scene, this.activeCamera);
    };

    // Update
    this.update = function () {
      // Save camera target
      this.activeCamera.target.copy(this.orbitor.target);
    };

		 // Animate
    this.animate = function () { 
      $window.requestAnimationFrame(this.animate);
      this.render();
      this.update();
    };   

		// Create helpers
    this.createHelpers = function () {
      // Grid
      var grid = new $window.THREE.GridHelper(this.gridSize, this.gridStep);
      grid.name = 'GRID';
      this.scene.add(grid);

      // Axis
      var axis = new $window.THREE.AxisHelper(this.axisSize);
      axis.name = 'AXIS';
      axis.visible = false;
      this.scene.add(axis);
    };
	}
]);