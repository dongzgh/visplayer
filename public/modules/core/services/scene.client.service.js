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
    var CAMERA_NEAR = 1;
    var CAMERA_FAR = BOX_SIZE * 10;
    var EMISSIVE = 0x000000;
    var SPECULAR = 0xffffff;
    var COL_FACE = 0xcecece;
    var COL_EDGE = 0x333333;
    var COL_PICKED = 0xe8373e;

    // Enumerations
    this.TYPE_MODEL = 'model';
    this.TYPE_FACE = 'face';
    this.TYPE_EDGE = 'edge';
    this.PICK_MULTIP = 'multiple';
    this.PICK_SINGLE = 'single';

    // Material definitions
    var faceDefaultMaterial = new $window.THREE.MeshPhongMaterial({
      color: COL_FACE,
      transparent: true,
      opacity: 0.8,
      specular: SPECULAR,
      metal: true,
      shininess: 25,
      emissive: EMISSIVE,
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
        var path = 'modules/core/images/cube/';
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
      color: COL_EDGE,
    });

    // Scene definitions
    var scope = this;
    var container = null;
    var renderer = null;
    var canvas = null;
    var cameras = [];
    var activeCamera = null;
    var scenes = [];
    var activeScene = null;
    var eyeLight = null;
    var trackball = null;
    var raycaster = null;
    var isClickPickEnabled = false;
    var isWindowPickEnabled = false;
    var pickType = null;
    var picked = [];
    var pickMode = scope.PICK_MULTIP;
    var mouse = new $window.THREE.Vector2();
    var wins = new $window.THREE.Vector2();
    var wine = new $window.THREE.Vector2();
    var transformer = null;

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
    this.initialize = function() {
      // Check webgl
      if (!$window.Detector.webgl) {
        $window.Detector.addGetWebGLMessage();
        return;
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

      // Create trackball
      createTrackball();

      // Create raycaster
      raycaster = new $window.THREE.Raycaster();

      // Add listeners
      $window.addEventListener('resize', onWindowResize, false);
      canvas.addEventListener('mousedown', onCanvasMouseDown, false);
      canvas.addEventListener('mousemove', onCanvasMouseMove, false);
      canvas.addEventListener('mouseup', onCanvasMouseUp, false);
      $document[0].addEventListener('keydown', onCanvasKeyDown, false);
      $document[0].addEventListener('keyup', onCanvasKeyUp, false);

      // Animate
      animate();
    };

    // Query models
    this.queryModels = function(onSuccess) {
      var modelNames = [];
      activeScene.traverse(function(object) {
        if (object.type === scope.TYPE_MODEL) modelNames.push(object.name);
      });
      if (onSuccess) onSuccess(modelNames);
    };

    // Load model
    this.loadModel = function(data, onSuccess) {
      // Check input data
      if (typeof data === 'undefined') return;

      // Count instances
      var count = countModels(data.name) + 1;

      // Create scene object
      var model = new $window.THREE.Object3D();
      model.name = data.name;
      model.displayName = model.name + ' #' + count;
      model.type = scope.TYPE_MODEL;
      model.box = new $window.THREE.Box3();
      var faces = new $window.THREE.Object3D();
      model.add(faces);
      var edges = new $window.THREE.Object3D();
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
          var face = new $window.THREE.Mesh(geometry, faceDefaultMaterial.clone());
          face.type = scope.TYPE_FACE;

          // Add to parent
          faces.add(face);
        }
        else if (mesh.type === 'curveMesh' && mesh.cardinal === 3) {
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
          var edge = new $window.THREE.Line(geometry, edgeDefaultMaterial.clone());
          edge.type = scope.TYPE_EDGE;

          // Add to parent
          edges.add(edge);
        }        
      }

      // Update model center
      model.center = new $window.THREE.Vector3();
      model.center.copy(model.box.min).add(model.box.max).multiplyScalar(0.5);

      // Add to scene
      activeScene.add(model);

      // Fit view.
      scope.fitView();

      // Post-processing
      if (onSuccess) onSuccess(model);
    };

    // Remove object
    this.removeObject = function(name) {
      // Check input data
      if (name === null) return;

      // Remove object
      var index = 0;
      activeScene.children.forEach(function(object) {
        if (object.displayName === name) {
          activeScene.children.splice(index, 1);
          return;
        }
        index++;
      });
    };

    // Highlight object
    this.clearView = function() {
      isClickPickEnabled = false;
      lightObject(activeScene, false);
      activeScene.remove(transformer);
      transformer = null;
    };

    /**
     * View
     */
    // Fit view
    this.fitView = function(direction) {
      // Update scene box
      updateSceneBox(activeScene);
      if(activeScene.box.isEmpty()) return;

      // Evaluate direction
      let v = new $window.THREE.Vector3();
      if (typeof direction !== 'undefined')
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

      // Set camera and trackball
      activeCamera.position.copy(p);
      activeCamera.lookAt(activeScene.center);
      trackball.target.copy(activeScene.center);
    };

    // Bottom view
    this.bottomView = function() {
      scope.fitView(new $window.THREE.Vector3(0, 0, -1));
    };

    // Left view
    this.leftView = function() {
      scope.fitView(new $window.THREE.Vector3(-1, 0, 0));
    };

    // Right view
    this.rightView = function() {
      scope.fitView(new $window.THREE.Vector3(1, 0, 0));
    };

    // Front view
    this.frontView = function() {
      scope.fitView(new $window.THREE.Vector3(0, -1, 0));
    };

    // Back view
    this.backView = function() {
      scope.fitView(new $window.THREE.Vector3(0, 1, 0));
    };


    /**
     * Selection
     */
    // Enalbe picking
    this.enablePicking = function(enable, type, mode) {
      isClickPickEnabled = enable;
      if (isClickPickEnabled) {
        picked = [];
        if (typeof type !== 'undefined')
          pickType = type;
        if (typeof mode !== 'undefined')
          pickMode = mode;
      } else {
        lightObject(activeScene, false);
      }
    };

    // Pick model
    this.pickModel = function() {
      if (isClickPickEnabled) {
        if (pickType === scope.TYPE_MODEL)
          isClickPickEnabled = false;
      } else {
        isClickPickEnabled = true;
      }
      scope.enablePicking(isClickPickEnabled, scope.TYPE_MODEL, scope.PICK_MULTIP);
    };

    // Pick face
    this.pickFace = function() {
      if (isClickPickEnabled) {
        if (pickType === scope.TYPE_FACE)
          isClickPickEnabled = false;
      } else {
        isClickPickEnabled = true;
      }
      scope.enablePicking(isClickPickEnabled, scope.TYPE_FACE, scope.PICK_MULTIP);
    };

    // Pick edge
    this.pickEdge = function() {
      if (isClickPickEnabled) {
        if (pickType === scope.TYPE_EDGE)
          isClickPickEnabled = false;
      } else {
        isClickPickEnabled = true;
      }
      scope.enablePicking(isClickPickEnabled, scope.TYPE_EDGE, scope.PICK_MULTIP);
    };

    /**
     * Transformation
     */
    // Move model
    this.moveModel = function(object) {
      // Check input data
      if (picked.length === 0) return;
      if (angular.isUndefined(picked[0].type) || picked[0].type !== scope.TYPE_MODEL) return;

      // Attach transformer
      if (transformer === null) {
        transformer = new $window.THREE.TransformControls(activeCamera, canvas);
        activeScene.add(transformer);
      }
      transformer.attach(picked[0]);
      transformer.setMode('translate');
      transformer.addEventListener('change', render);
    };

    // Rotate model
    this.rotateModel = function(object) {
      // Check input data
      if (picked.length === 0) return;
      if (angular.isUndefined(picked[0].type) || picked[0].type !== scope.TYPE_MODEL) return;

      // Attach transformer
      if (transformer === null) {
        transformer = new $window.THREE.TransformControls(activeCamera, canvas);
        activeScene.add(transformer);
      }
      transformer.attach(picked[0]);
      transformer.setMode('rotate');
      transformer.addEventListener('change', render);
    };

    // Scale model
    this.scaleModel = function(object) {
      // Check input data
      if (picked.length === 0) return;
      if (angular.isUndefined(picked[0].type) || picked[0].type !== scope.TYPE_MODEL) return;

      // Attach transformer
      if (transformer === null) {
        transformer = new $window.THREE.TransformControls(activeCamera, canvas);
        activeScene.add(transformer);
      }
      transformer.attach(picked[0]);
      transformer.setMode('scale');
      transformer.addEventListener('change', render);
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
      wins.copy(mouse);
      if (isClickPickEnabled) clickPickObjects();
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
      wine.copy(mouse);
      if (isWindowPickEnabled) windowPickObjects();
    }

    // Key down
    function onCanvasKeyDown(event) {
      event.preventDefault();

      // Enable selection
      isWindowPickEnabled = true;
    }

    // Key up
    function onCanvasKeyUp(event) {
      event.preventDefault();

      // Disable selection
      isWindowPickEnabled = false;
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
      var scene = new $window.THREE.Scene();
      scenes.push(scene);
      activeScene = scene;
    }

    // Evaluate scene center
    function updateSceneBox(scene) {
      // Check input data
      if (!(scene instanceof $window.THREE.Scene)) return;

      // Update box
      let count = 0;
      scene.box = new $window.THREE.Box3();
      scene.traverse(function(object) {
        if (typeof object.type !== 'undefined' && object.type === scope.TYPE_MODEL) {
          scene.box.union(object.box);
          count++;
        }
      });
      if(count === 0)
        scene.box.makeEmpty();

      // Update center
      scene.center = new $window.THREE.Vector3();
      if(count > 0)
        scene.center.copy(scene.box.min).add(scene.box.max).multiplyScalar(0.5);
    }

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
      canvas = renderer.domElement;
      container.appendChild(canvas);
    }

    // Create camera
    function createCamera() {
      var camera = new $window.THREE.PerspectiveCamera(CAMERA_ANGLE, $window.innerWidth / $window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
      camera.name = 'VIEW #' + cameras.length + 1;
      camera.position.set(- BOX_SIZE * 2, - BOX_SIZE * 2, BOX_SIZE);
      camera.up.copy(new $window.THREE.Vector3(0, 0, 1));
      camera.target = new $window.THREE.Vector3();
      cameras.push(camera);
      activeCamera = camera;
    }

    // Create helpers
    function createHelpers() {
      // Grid
      var grid = new $window.THREE.GridHelper(BOX_SIZE, GAP_SIZE);
      grid.name = 'GRID';
      grid.rotateX(Math.PI / 2.0);
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
      eyeLight.position.set(BOX_SIZE * 2, BOX_SIZE, BOX_SIZE * 2);
      activeScene.add(eyeLight);
    }

    // Create trackball
    function createTrackball() {
      trackball = new $window.THREE.TrackballControls(activeCamera);
      trackball.rotateSpeed = 4.0;
      trackball.zoomSpeed = 2.0;
      trackball.panSpeed = 1.0;
      trackball.noZoom = false;
      trackball.noPan = false;
      trackball.staticMoving = true;
      trackball.dynamicDampingFactor = 0.3;
    }

    // Count object instances
    function countModels(name) {
      // Check input data
      if (name === null) return 0;

      // Count object instances
      var count = 0;
      activeScene.traverse(function(object) {
        if (object.type === scope.TYPE_MODEL) {
          if (object.name === name) count++;
        }
      });
      return count;
    }

    /**
     * Selection
     */
    // Set highlight
    function lightObject(object, enable) {
      if (typeof object.material !== 'undefined' && angular.isDefined(object.children)) {
        object.children.forEach(function(child) {
          lightObject(child, enable);
        });
      } else {
        if (object.material instanceof $window.THREE.MeshPhongMaterial) {
          if (enable) {
            object.material.savedColor = new $window.THREE.Color();
            object.material.savedColor.copy(object.material.emissive);
            object.material.emissive.setHex(COL_PICKED);
          } else {
            if (typeof object.material.savedColor !== 'undefined' && object.material.savedColor !== null)
              object.material.emissive.setHex(object.material.savedColor);
          }
        } else if (object.material instanceof $window.THREE.LineBasicMaterial) {
          if (enable) {
            object.material.savedColor = new $window.THREE.Color();
            object.material.savedColor.copy(object.material.color);
            object.material.color.setHex(COL_PICKED);
          } else {
            if (typeof object.material.savedColor !== 'undefined' && object.material.savedColor !== null)
              object.material.color.copy(object.material.savedColor);
          }
        }
      }
    }

    // Click pick objects
    function clickPickObjects() {
      raycaster.setFromCamera(mouse, activeCamera);
      var intersects = raycaster.intersectObjects(activeScene.children, true);
      if (intersects.length > 0) {
        // Check candidate type
        var candidate = null;
        if (pickType === null) {
          return;
        } else if (pickType === scope.TYPE_MODEL) {
          candidate = getPickedModel(intersects);
          if (candidate === null) return;
        } else if (pickType === scope.TYPE_FACE) {
          candidate = getPickedFace(intersects);
          if (candidate === null) return;
        } else if (pickType === scope.TYPE_EDGE) {
          candidate = getPickedEdge(intersects);
          if (candidate === null) return;
        }

        // Update picked
        if (picked.length !== 0 &&
          picked.indexOf(candidate) !== -1) {
          var index = picked.indexOf(candidate);
          picked.splice(index, 1);
          lightObject(candidate, false);
        } else {
          if (pickMode === scope.PICK_SINGLE) {
            picked.forEach(function(object) {
              lightObject(object, false);
            });
            picked = [];
          }
          picked.push(candidate);
          lightObject(candidate, true);
        }
      }

      // Broadcast
      if (picked !== null)
        $rootScope.$broadcast('scene.picked', picked);
    }

    // Window pick objects
    function windowPickObjects() {
      // Get window points
      var w1 = new $window.THREE.Vector3(wins.x, wins.y, 0);
      w1.unproject(activeCamera);
      var w2 = new $window.THREE.Vector3(wine.x, wins.y, 0);
      w2.unproject(activeCamera);
      var w3 = new $window.THREE.Vector3(wine.x, wine.y, 0);
      w3.unproject(activeCamera);
      var w4 = new $window.THREE.Vector3(wins.x, wine.y, 0);
      w4.unproject(activeCamera);
      var winc = new $window.THREE.Vector2(wins.x, wins.y);
      winc.add(wine).multiplyScalar(0.5);

      // Create plane
      var p1 = new $window.THREE.Vector3();
      p1.copy(w1).add(w2).multiplyScalar(0.5);
      var v1 = new $window.THREE.Vector3(0, 1, 0);
      v1.unproject(activeCamera);
      var plane1 = new $window.THREE.Plane();
      plane1.setFromNormalAndCoplanarPoint(p1, v1);

      // activeScene.traverse(function(object) {
      //   if(typeof object.type !== 'undefined' && object.type === pickType) {
      //     object.boundingBox.isIntersectionBox();
      //   }
      // });
    }

    // Get picked model
    function getPickedModel(intersects) {
      // Check input data
      if (intersects.length === 0) return;

      // Find candidate
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Mesh) {
          var candidate = intersects[i].object.parent.parent;
          if (typeof candidate.type !== 'undefined' && candidate.type === scope.TYPE_MODEL)
            return candidate;
        }
      }

      // Return picked
      return null;
    }

    // Get picked face
    function getPickedFace(intersects) {
      // Check input data
      if (intersects.length === 0) return;

      // Find candidate
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Mesh) {
          var candidate = intersects[i].object;
          if (typeof candidate.type !== 'undefined' && candidate.type === scope.TYPE_FACE)
            return candidate;
        }
      }

      // Return picked
      return null;
    }

    // Get picked edge
    function getPickedEdge(intersects) {
      // Check input data
      if (intersects.length === 0) return;

      // Find candidate
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Line) {
          var candidate = intersects[i].object;
          if (typeof candidate.type !== 'undefined' && candidate.type === scope.TYPE_EDGE)
            return candidate;
        }
      }

      // Return picked
      return null;
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
      // Trackball
      if (trackball !== null) trackball.update();

      // Transformer
      if (transformer !== null) transformer.update();

      // Lights
      var direction = new $window.THREE.Vector3();
      direction.copy(activeCamera.position).sub(activeCamera.target).normalize();
      eyeLight.position.copy(direction);
    }

    //---------------------------------------------------
    //  Debugging
    //---------------------------------------------------
    // Create a point
    function createPoint(x, y, z) {
      var geometry = new $window.THREE.SphereGeometry(0.1, 32, 32);
      var material = new $window.THREE.MeshBasicMaterial({
        color: 0xffff00
      });
      var sphere = new $window.THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      activeScene.add(sphere);
    }

    // Create a box
    function createBox(model) {
      var dx = model.box.max.x - model.box.min.x;
      var dy = model.box.max.y - model.box.min.y;
      var dz = model.box.max.z - model.box.min.z;
      var geometry = new $window.THREE.BoxGeometry(dx, dy, dz);
      var material = new $window.THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
      });
      var cube = new $window.THREE.Mesh(geometry, material);
      cube.position.copy(model.center);
      activeScene.add(cube);
    }
  }
]);
