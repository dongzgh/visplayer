'use strict';

//Scene service used for managing scene
angular.module('core').service('Scene', ['$rootScope', '$window', '$document', '$log',

  function($rootScope, $window, $document, $log) {
    //---------------------------------------------------
    //  Initialization
    //---------------------------------------------------
    // Static variables
    var BOX_SIZE = 1500;
    var GAP_SIZE = 100;
    var CAMERA_ANGLE = 45;
    var CAMERA_POSITION = new $window.THREE.Vector3(1122.6119550523206, 832.1930544185049, 2077.2549403849953);

    // Material definitions
    var faceDefaultMaterial = new $window.THREE.MeshPhongMaterial({
      color: 0xcecece,
      specular: 0xffffff,
      metal: true,
      shininess: 25,
      emissive: 0x000000,
      side: $window.THREE.DoubleSide
    });
    var faceAnalysisMaterial = new $window.THREE.MeshNormalMaterial({
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
      color: 0x333333,
    });

    // Scene definitions
    var container = null;
    var renderer = null;
    var cameras = [];
    var activeCamera = null;
    var scenes = [];
    var activeScene = null;
    var eyeLight = null;
    var orbitor = null;
    var raycaster = null;
    var isPickingEnabled = false;
    var pickType = null;
    var picked = null;
    var pickedColor = 0xe8373e;
    var transformer = null;
    var mouse = new $window.THREE.Vector2();

    // Transient variables
    var i = 0,
      j = 0,
      k = 0;

    //---------------------------------------------------
    //  Callbacks
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

      // Create raycaster
      raycaster = new $window.THREE.Raycaster();

      // Add listeners
      $window.addEventListener('resize', onWindowResize, false);
      $document[0].addEventListener('mousemove', onDocumentMouseMove, false);
      $document[0].addEventListener('mousedown', onDocumentMouseDown, false);

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
      if (onsuccess) {
        onsuccess(modelnames);
      }
    };

    // Load model
    this.loadModel = function(gd, onsuccess) {
      // Check input data
      if (gd === null) {
        return;
      }

      // Count instances
      var count = countModelInstances(gd.name) + 1;

      // Create scene object
      var model = new $window.THREE.Object3D();
      model.name = gd.name;
      model.displayName = model.name + ' #' + count;
      model.type = 'model';
      model.box = new $window.THREE.Box3();
      var faces = new $window.THREE.Object3D();
      model.add(faces);
      var edges = new $window.THREE.Object3D();
      model.add(edges);

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
        model.box.union(faceGeometry.boundingBox);

        // Create mesh
        var faceMesh = new $window.THREE.Mesh(faceGeometry, faceDefaultMaterial.clone());

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
        var edgeMesh = new $window.THREE.Line(edgeGeometry, edgeDefaultMaterial.clone());

        // Add to parent
        edges.add(edgeMesh);
      }

      // Update model center
      model.origin = new $window.THREE.Vector3();
      model.origin.copy(model.box.min).add(model.box.max).multiplyScalar(0.5);

      // Add to scene
      activeScene.add(model);

      // Fit view.
      fitCamera();

      // Post-processing
      if (onsuccess) {
        onsuccess(model);
      }
    };

    // Remove object
    this.removeObject = function(objname) {
      // Check input data
      if (objname === null) {
        return;
      }

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

    // Attach transformer
    this.attachTransformer = function(object, mode) {
      // Check input data
      if (angular.isUndefined(object.type) || object.type !== 'model') {
        return;
      }

      // Create transformer
      transformer = new $window.THREE.TransformControls(activeCamera, renderer.domElement);
      transformer.attach(object);
      transformer.setMode(mode);
      transformer.addEventListener('change', render);
      activeScene.add(transformer);
    };

    // Enalbe picking
    this.enablePicking = function(enable, type) {
      isPickingEnabled = enable;
      if (angular.isDefined(type)) {
        pickType = type;
      }
      picked = null;
    };

    // Highlight object
    this.clear = function() {
      highlightObject(activeScene, false);
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

    // Mouse move
    function onDocumentMouseMove(event) {
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Mouse down
    function onDocumentMouseDown(event) {
      if (isPickingEnabled) {
        pickObject();
      }
    }

    //---------------------------------------------------
    //  Utilities
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

    // Fit camera
    function fitCamera() {
      // Evaluate box of models
      var box = new $window.THREE.Box3();
      activeScene.children.forEach(function(object) {
        if (angular.isDefined(object.type) && object.type === 'model') {
          var model = object;
          box.union(model.box);
        }
      });

      // Evalute camera position
      var center = new $window.THREE.Vector3();
      center.copy(box.min).add(box.max).multiplyScalar(0.5);
      var v1 = new $window.THREE.Vector3();
      var radius = v1.copy(box.max).sub(box.min).length();
      var v2 = new $window.THREE.Vector3();
      v2.x = 1.0;
      v2.y = 1.0;
      v2.z = 1.0;
      v2.normalize();
      v2.multiplyScalar(radius * 2.0);
      var p = new $window.THREE.Vector3();
      p.copy(center).add(v2);
      activeCamera.position.copy(p);

      // Update camera target
      activeCamera.lookAt(center);
      orbitor.target.copy(center);
      orbitor.update();
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
      if (name === null) {
        return 0;
      }

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
     * Selection
     */
    // Pick object
    function pickObject() {
      raycaster.setFromCamera(mouse, activeCamera);
      var intersects = raycaster.intersectObjects(activeScene.children, true);
      if (intersects.length > 0) {
        // Check object type
        var candidate = null;
        if (pickType === null) {
          return;
        } else if (pickType === 'model' || pickType === 'face') {
          candidate = getPickedModel(intersects);
          if (candidate === null) {
            return;
          }
        }

        // Update picked
        if (picked !== null) {
          highlightObject(picked, false);
          if (picked === candidate) {
            picked = null;
          } else {
            picked = candidate;
            highlightObject(picked, true);
          }
        } else {
          picked = candidate;
          highlightObject(picked, true);
        }
      }

      // Broadcast
      if (picked !== null) {
        $rootScope.$broadcast('scene.picked', picked);
      }
    }

    // Set highlight
    function highlightObject(object, enable) {
      if (angular.isUndefined(object.material) && angular.isDefined(object.children)) {
        object.children.forEach(function(child) {
          highlightObject(child, enable);
        });
      } else {
        if (angular.isUndefined(object.material.emissive)) {
          object.material.emissive = new $window.THREE.Color(0x000000);
        }
        if (enable) {
          object.material.emissive.setHex(pickedColor);
        } else {
          object.material.emissive.setHex(0x000000);
        }
      }
    }

    // Check model
    function getPickedModel(intersects) {
      // Check input data
      if (intersects.length === 0) {
        return;
      }

      // Find candidate
      var candidate = null;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Mesh) {
          candidate = intersects[i].object.parent.parent;
          break;
        }
      }

      // Return picked
      return candidate;
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
    }

    // Update
    function update() {
      // Orbitor
      if (orbitor !== null) {
        orbitor.update();
      }

      // Transformer
      if (transformer !== null) {
        transformer.update();
      }

      // Lights
      var direction = new $window.THREE.Vector3();
      direction.copy(activeCamera.position).sub(activeCamera.target).normalize();
      eyeLight.position.copy(direction);
    }
  }
]);
