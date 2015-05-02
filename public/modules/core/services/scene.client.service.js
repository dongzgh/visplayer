'use strict';

//Scene service used for managing scene
angular.module('core').service('Scene', ['$rootScope', '$window', '$document',

  function($rootScope, $window, $document) {
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
    var mouse = new $window.THREE.Vector2();

    // Transient variables
    var i = 0, j = 0, k = 0;

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
      if (onsuccess) {
        onsuccess(object);
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

    // Enalbe picking
    this.enablePicking = function(enable, type) {
      isPickingEnabled = enable;
      if (angular.isDefined(type)) {
        pickType = type;
      }
      picked = null;
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
      if (name !== null)
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
          if(candidate === null) {
            return;
          }
        }

        // Update picked
        if (picked !== null) {
          enableHighlight(picked, false);
          if (picked === candidate) {
            picked = null;
          } else {
            picked = candidate;
            enableHighlight(picked, true);
          }
        } else {
          picked = candidate;
          enableHighlight(picked, true);
        }
      }

      // Broadcast
      if (picked !== null) {
        $rootScope.$broadcast('scene.picked', picked);
      }
    }

    // Set highlight
    function enableHighlight(object, enable) {
      if(angular.isUndefined(object.material) && angular.isDefined(object.children)) {
        object.children.forEach(function(child){
          enableHighlight(child, enable);
        });
      } else {
        if(angular.isUndefined(object.material.emissive)) {
          object.material.emissive = new $window.THREE.Color(0x000000);
        }
        if(enable) {
          object.material.emissive.setHex(pickedColor);
        } else {
          object.material.emissive.setHex(0x000000);
        }
      }
    }

    // Check model
    function getPickedModel(intersects) {
      // Check input data
      if(intersects.length === 0) {
        return;
      }

      // Find candidate
      var candidate = null;
      for(i = 0; i < intersects.length; i++) {
        if(intersects[i].object instanceof $window.THREE.Mesh) {
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
      activeCamera.target.copy(orbitor.target);
      eyeLight.position.set(activeCamera.position.x, activeCamera.position.y, activeCamera.position.z);
    }
  }
]);
