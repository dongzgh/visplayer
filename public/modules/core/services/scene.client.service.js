'use strict';

//Scene service used for managing scene
angular.module('core').service('Scene', ['$window', '$document',

  function($window, $document) {
    // Static variables
    var BOX_SIZE = 1500;
    var GAP_SIZE = 100;
    var CAMERA_POSITION = new $window.THREE.Vector3(984.393167476599, 605.121508138134, 1123.7196015705397);
    var CAMERA_ROTATION = new $window.THREE.Vector3(-0.5318628888897693, 0.673350831292923, 0.3516904119463236);
    var CAMERA_ANGLE = 45;

    // Local variables
    var container;
    var renderer;
    var scenes = [];
    var activeScene;
    var cameras = [];
    var activeCamera;
    var orbitor;
    var reflectionCube;
    var skyBox;

    // Initialize scene
    this.initialize = function() {
      // Check webgl
      if (!$window.Detector.webgl) {
        $window.Detector.addGetWebGLMessage();
      }

      // Create render
      createRenderer();

      // Create sky box
      createRelectionCube();

      // Create camera
      createCamera();

      // Create scene
      createScene();      

      // Create helpers
      createHelpers();

      // Create orbit control
      orbitor = new $window.THREE.OrbitControls(activeCamera, renderer.domElement);

      // Animate
      animate();
    };

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
      camera.name = 'VIEW #' + cameras.length;
      camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
      camera.rotation.set(CAMERA_ROTATION.x, CAMERA_ROTATION.y, CAMERA_ROTATION.z);
      camera.target = new $window.THREE.Vector3();
      cameras.push(camera);
      activeCamera = camera;
    };

    // Create scene
    var createScene = function () {
      var scene = new $window.THREE.Scene();
      scenes.push(scene);
      activeScene = scene;
    };

    // Create environment map
    var createRelectionCube = function() {
      var path = 'modules/core/img/cube/';
      var format = '.jpg';
      var urls = [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
      ];
      reflectionCube = $window.THREE.ImageUtils.loadTextureCube(urls);
      reflectionCube.format = $window.THREE.RGBFormat;
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

      // Box
      var geometry = new $window.THREE.BoxGeometry(100, 100, 100);
      //var solidMaterial = new $window.THREE.MeshNormalMaterial();
      var solidMaterial = new $window.THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.85,
        ambient: 0x000000,
        reflectivity: 0.3,
        envMap: reflectionCube,
        combine: $window.THREE.MixOperation      
      });
      var wireframeMaterial = new $window.THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
      });
      var materials = [solidMaterial, wireframeMaterial];
      var object = $window.THREE.SceneUtils.createMultiMaterialObject(
        geometry, materials);
      activeScene.add(object);
    };

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
    };
  }
]);
