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
    var faceNormalMaterial = new $window.THREE.MeshNormalMaterial({
      side: $window.THREE.DoubleSide
    });
    var faceBasicMaterial = new $window.THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.85,
      ambient: 0x000000,
      reflectivity: 0.3,
      combine: $window.THREE.MixOperation,
      side: $window.THREE.DoubleSide
    });
    var lineBasicMaterial = new $window.THREE.LineBasicMaterial({
      color: 0x333333
    });

    // Transient variables
    var i, j, k;
    var object, geometry, mesh, line;

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
      faceBasicMaterial.envMap = reflectionCube;

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

    // Load model
    this.loadModel = function(data) {
      // Create scene object
      object = new $window.THREE.Object3D();
      object.name = data.name;
      var faces = new $window.THREE.Object3D();
      object.add(faces);
      var edges = new $window.THREE.Object3D();
      object.add(edges);

      // Initialize position and scale params
      var box;
      var scale = 1.0;
      var origin = new $window.THREE.Vector3();

      // Get faces and edges data
      var facesData = data.faces;
      var edgesData = data.edges;

      // Create faces
      for (i = 0; i < facesData.length; i++) {
        // Create geometry
        geometry = new $window.THREE.Geometry();
        var face = facesData[i].tessellation.facets[0];
        for (j = 0; j < face.vertexCount; j++) {
          geometry.vertices.push(
            new $window.THREE.Vector3(
              face.vertexCoordinates[j * 3],
              face.vertexCoordinates[j * 3 + 1],
              face.vertexCoordinates[j * 3 + 2]
            ));
        }
        for (j = 0; j < face.facetCount; j++) {
          geometry.faces.push(
            new $window.THREE.Face3(
              face.vertexIndices[j * 3] - 1,
              face.vertexIndices[j * 3 + 1] - 1,
              face.vertexIndices[j * 3 + 2] - 1
            ));
        }

        // Evaluate geometry addtional data
        geometry.key = facesData[i].id;
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        if (i === 0) {
          box = geometry.boundingBox;
        } else {
          box.union(geometry.boundingBox);
        }

        // Create mesh        
        mesh = new $window.THREE.Mesh(geometry, faceBasicMaterial);

        // Add to parent
        faces.add(mesh);
      }

      // Create edgesData
      for (i = 0; i < edgesData.length; i++) {
        // Create geometry
        geometry = new $window.THREE.Geometry();
        var edge = edgesData[i].tessellation;
        for (j = 0; j < edge.vertexCount; j++) {
          geometry.vertices.push(
            new $window.THREE.Vector3(
              edge.points[j * 3],
              edge.points[j * 3 + 1],
              edge.points[j * 3 + 2]
            ));
        }

        // Compute geometry addtional data
        geometry.key = edge.id;
        geometry.computeBoundingBox();

        // Create line
        line = new $window.THREE.Line(geometry, lineBasicMaterial);

        // Add to parent
        edges.add(line);
      }

      // Set object position and scale
      var v = new $window.THREE.Vector3();
      var radius = v.copy(box.max).sub(box.min).length() / 2.0;
      scale = BOX_SIZE / radius / 2.0;      
      origin.copy(box.min).add(box.max).multiplyScalar(0.5 * scale);
      var halfy = (box.max.y - box.min.y) * scale / 2.0;
      faces.children.forEach(function(mesh) {
        mesh.scale.set(scale, scale, scale);
        mesh.updateMatrix();
        mesh.translateX(-origin.x);
        mesh.translateY(-origin.y + halfy);
        mesh.translateZ(-origin.z);
      });
      edges.children.forEach(function(line) {
        line.scale.set(scale, scale, scale);
        line.updateMatrix();
        line.translateX(-origin.x);
        line.translateY(-origin.y + halfy);
        line.translateZ(-origin.z);
      });

      // Add to scene
      activeScene.add(object);
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
    var createScene = function() {
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

      // // Box
      // var geometry = new $window.THREE.BoxGeometry(100, 100, 100);
      // //var solidMaterial = new $window.THREE.MeshNormalMaterial();
      // var solidMaterial = new $window.THREE.MeshBasicMaterial({
      //   transparent: true,
      //   opacity: 0.85,
      //   ambient: 0x000000,
      //   reflectivity: 0.3,
      //   envMap: reflectionCube,
      //   combine: $window.THREE.MixOperation
      // });
      // var wireframeMaterial = new $window.THREE.MeshBasicMaterial({
      //   color: 0xffffff,
      //   wireframe: true,
      // });
      // var materials = [solidMaterial, wireframeMaterial];
      // var object = $window.THREE.SceneUtils.createMultiMaterialObject(
      //   geometry, materials);
      // activeScene.add(object);
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