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
    this.queryModels = function(onsuccess) {
      var modelnames = [];
      activeScene.children.forEach(function(object) {
        if(object.type === 'model') {
          modelnames.push(object.name);
        }
      });
      onsuccess(modelnames);
    };

    // Load model
    this.loadModel = function(gd, onsuccess) {
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
      onsuccess(object);
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
