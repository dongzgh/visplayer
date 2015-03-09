'use strict';

//Scene service used for managing scene
angular.module('core').service('Scene', ['$window', '$document',
	
	function($window, $document) {
		var container;
		var renderer;
		var scene;		
		var cameras = [];
		var activeCamera;
		var gridSize = 1000;
		var gridStep = 100;
		var axisSize = 1500;
    var orbitor;

		// Initialize scene
		this.initialize = function () {
			// Detect webgl
      if (!$window.Detector.webgl) {
      	$window.Detector.addGetWebGLMessage();
      }

      // Create render
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
      
      // Create default camera
      var camera = new $window.THREE.PerspectiveCamera(45, $window.innerWidth / $window.innerHeight, 1, 15000);
      camera.name = 'VIEW #' + cameras.length;
      camera.position.set(984.393167476599, 605.121508138134, 1123.7196015705397);
      camera.rotation.set(-0.5318628888897693, 0.673350831292923, 0.3516904119463236);
      camera.target = new $window.THREE.Vector3();
      cameras.push(camera);
      activeCamera = camera;

      // Create default scene
      scene = new $window.THREE.Scene();

      // Create helpers
      createHelpers();

      // Create orbit control
      orbitor = new $window.THREE.OrbitControls(activeCamera, renderer.domElement); 

      // Animate
      animate();
		};

    // Render
    var render = function () {
      renderer.render(scene, activeCamera);
    };

    // Update
    var update = function () {
      // Save camera target
      activeCamera.target.copy(orbitor.target);
    };

		 // Animate
    var animate = function () { 
      $window.requestAnimationFrame(animate);
      update();
      render();      
    };   

		// Create helpers
    var createHelpers = function () {
      // Grid
      var grid = new $window.THREE.GridHelper(gridSize, gridStep);
      grid.name = 'GRID';
      scene.add(grid);

      // Axis
      var axis = new $window.THREE.AxisHelper(axisSize);
      axis.name = 'AXIS';
      axis.visible = false;
      scene.add(axis);
    };
	}
]);
