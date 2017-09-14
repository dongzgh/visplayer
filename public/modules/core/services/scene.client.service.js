'use strict';

//Scene service used for managing scene
angular.module('core').service('Scene', ['$rootScope', '$window', '$document', '$log',
  function($rootScope, $window, $document, $log) {
    //---------------------------------------------------
    //  Initialization
    //---------------------------------------------------
    var scope = this;

    // Static variables
    var SIZE_BOX = 2000;
    var SIZE_GAP = 100;
    var CAMERA_ANGLE = 45;
    var CAMERA_NEAR = 0.1;
    var CAMERA_FAR = SIZE_BOX * 10;
    var CLR_FACE = 0xcecece;
    var CLR_EDGE = 0x333333;
    var CLR_SELECTED = 0xca00f7;

    // Geometry types
    scope.GEOMETRY_TYPES = {
      model: 1,
      face:  1 << 1,
      edge:  1 << 2,
      curve: 1 << 3,
      point: 1 << 4
    };

    // Selection modes
    scope.SELECTION_MODES =  {
      single:   0,
      multiple: 1
    };
    scope.selectType = 0;
    scope.selectMode = scope.SELECTION_MODES.multiple;
    scope.displaySelect = true;

    // Material definitions
    var meshDefaultMaterial = new $window.THREE.MeshStandardMaterial({
      color: CLR_FACE,
      transparent: true,
      opacity: 0.8,
      emissive: 0x000000,
      side: $window.THREE.DoubleSide
    });
    var meshAnalysisMaterial = new $window.THREE.MeshNormalMaterial({
      side: $window.THREE.DoubleSide
    });
    var meshWireframeMaterial = new $window.THREE.MeshBasicMaterial({
      wireframe: true
    });
    var meshShinyGlassMaterial = new $window.THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.8,
      reflectivity: 0.5,
      envMap: (function() {
        return new $window.THREE.CubeTextureLoader()
        .setPath('modules/core/images/cube/')
        .load(['posx.jpg','negx.jpg', 'posy.jpg','negy.jpg', 'posz.jpg', 'negz.jpg']);
      })(),
      combine: $window.THREE.MixOperation,
      side: $window.THREE.DoubleSide
    });
    var lineDefaultMaterial = new $window.THREE.LineBasicMaterial({
      color: CLR_EDGE,
    });
    scope.DISPLAY_MODES = {
      shaded:     1,
      rendered:   2,
      analysis:   3,
      mesh:       4,
      wireframe:  5
    };
    scope.displayMode = scope.DISPLAY_MODES.shaded;

    // Scene definitions
    var container;
    var renderer;
    var canvas3d;
    var canvas2d;
    var context;
    var cameras = [];
    var activeCamera;
    var scenes = [];
    var activeScene;
    var papers = [];
    var activePaper;
    var eyeLight;
    var acs;
    var controller;
    var controllerType = 2; // 1 - trackball; 2 - orbitor
    var raycaster;
    var selects = [];
    var mouse = new $window.THREE.Vector2();
    var transformer;

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
    scope.initialize = function() {
      // Check webgl
      if (!$window.Detector.webgl) {
        $window.Detector.addGetWebGLMessage();
        return;
      }

      // Create render
      createRenderer();

      // Create camera
      createCamera();

      // Create scene
      createScene();

      // Create helpers
      createHelpers();

      // Create lights
      createLights();

      // Create controller
      createController();

      // Create raycaster
      raycaster = new $window.THREE.Raycaster();

      // Add listeners
      $window.addEventListener('resize', onWindowResize, false);
      canvas3d.addEventListener('mousedown', onCanvasMouseDown, false);
      canvas3d.addEventListener('mousemove', onCanvasMouseMove, false);
      canvas3d.addEventListener('mouseup', onCanvasMouseUp, false);

      // Animate
      animate();
    };

    // Query models
    scope.queryModels = function(onSuccess) {
      let modelNames = [];
      activeScene.traverse(function(object) {
        if (object.type === scope.GEOMETRY_TYPES.model) modelNames.push(object.name);
      });
      if (onSuccess) onSuccess(modelNames);
    };

    // Load model
    scope.loadModel = function(data, onSuccess) {
      // Check input data
      if (data === undefined) return;

      // Get display settings
      let displaySettings = getDisplaySettings();

      // Count instances
      let count = countModels(data.name) + 1;

      // Create scene object
      var model = new $window.THREE.Object3D();
      model.data = data;
      model.name = data.name;
      model.displayName = model.name + ' #' + count;
      model.type = scope.GEOMETRY_TYPES.model;
      model.box = new $window.THREE.Box3();
      let faces = new $window.THREE.Object3D();
      faces.name = 'faces';
      model.add(faces);
      let edges = new $window.THREE.Object3D();
      edges.name = 'edges';
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
          let face = new $window.THREE.Mesh(geometry, displaySettings.meshMaterial.clone());
          face.savedMaterial = face.material;
          face.visible = displaySettings.meshVisibility;
          face.type = scope.GEOMETRY_TYPES.face;
          face.selected = false;

          // Add to parent
          faces.add(face);
        } else if (mesh.type === 'curveMesh' && mesh.cardinal === 3) {
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
          let edge = new $window.THREE.Line(geometry, displaySettings.lineMaterial.clone());
          edge.savedMaterial = edge.material;
          edge.visible = displaySettings.lineVisibility;
          edge.type = scope.GEOMETRY_TYPES.edge;
          edge.selected = false;

          // Add to parent
          edges.add(edge);
        }
      }

      // Update model center
      model.center = new $window.THREE.Vector3();
      model.center.copy(model.box.min).add(model.box.max).multiplyScalar(0.5);

      // Update matrix.
      model.children.forEach(function(set){
        set.children.forEach(function(entity){
          let geometry = entity.geometry;
          geometry.translate(-model.center.x, -model.center.y, -model.center.z);
        });
      });
      model.position.copy(model.center);

      // Add to scene
      activeScene.add(model);

      // Fit view.
      scope.viewFit();

      // Post-processing
      if (onSuccess) onSuccess(model);
    };

    // Remove object
    scope.removeObject = function(name) {
      // Check input data
      if (name === undefined) return;

      // Remove object
      let index = 0;
      activeScene.children.forEach(function(object) {
        if (object.displayName === name) {
          activeScene.children.splice(index, 1);
          return;
        }
        index++;
      });
    };

    // Update displays
    scope.updateDisplays = function (object) {
      if (object === undefined) {
        // Default to update scene displays
        scope.updateDisplays(activeScene);
      } else {
         // Ignore helpers
        if (!(object.constructor.name === 'Scene' ||
          object.constructor.name === 'Mesh' ||
          object.constructor.name === 'Line' ||
          object.constructor.name === 'Object3D'))
          return;

        // Update children displays
        if (object.children !== undefined && object.children.length > 0) {
          object.children.forEach(function(child){
            scope.updateDisplays(child);
          });
        }

        // Update displays based on display settings
        if (object.material !== undefined) {
          let displaySettings = getDisplaySettings();
          if (object instanceof $window.THREE.Mesh) {
            object.material = displaySettings.meshMaterial.clone();
            object.savedMaterial = displaySettings.meshMaterial.clone();
            object.visible = displaySettings.meshVisibility;
          } else if (object instanceof $window.THREE.Line) {
            object.material = displaySettings.lineMaterial.clone();
            object.savedMaterial = displaySettings.lineMaterial.clone();
            object.visible = displaySettings.lineVisibility;
          }

          // Update specific displays
          if (object.visible) {
            // Display selected
            if (object.selected) {
              if (object.material.color !== undefined)
                object.material.color.setHex(CLR_SELECTED);
            }
          }
        }        
      }
    };

    // Clear selected objects
    scope.viewClear = function() {
      setSelected(activeScene, false);
      selects = [];
      scope.updateDisplays();
    };

    // Clear selection
    scope.clearSelection = function() {
      scope.selectType = 0;
      scope.selectMode = scope.SELECTION_MODES.multiple;
      scope.displaySelect = true;
    };

    /**
     * View
     */
    // Fit view
    scope.viewFit = function(direction) {
      // Update scene box
      updateSceneBox(activeScene);
      if (activeScene.box.isEmpty()) return;

      // Evaluate direction
      let v = new $window.THREE.Vector3();
      if (direction !== undefined)
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

      // Set camera and controller
      activeCamera.position.copy(p);
      activeCamera.lookAt(activeScene.center);
      controller.target.copy(activeScene.center);
    };

    // Bottom view
    scope.viewTop = function() {
      scope.viewFit(new $window.THREE.Vector3(0, 0, 1));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 1, 0));
    };

    // Bottom view
    scope.viewBottom = function() {
      scope.viewFit(new $window.THREE.Vector3(0, 0, -1));
      activeCamera.up.copy(new $window.THREE.Vector3(0, -1, 0));
    };

    // Left view
    scope.viewLeft = function() {
      scope.viewFit(new $window.THREE.Vector3(-1, 0, 0));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 0, 1));
    };

    // Right view
    scope.viewRight = function() {
      scope.viewFit(new $window.THREE.Vector3(1, 0, 0));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 0, 1));
    };

    // Front view
    scope.viewFront = function() {
      scope.viewFit(new $window.THREE.Vector3(0, -1, 0));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 0, 1));
    };

    // Back view
    scope.viewBack = function() {
      scope.viewFit(new $window.THREE.Vector3(0, 1, 0));
      activeCamera.up.copy(new $window.THREE.Vector3(0, 0, 1));
    };

    /**
     * Transformation
     */
    // Create transformer
    scope.createTransformer = function(mode, object) {
      if (transformer !== undefined) return false;
      transformer = new $window.THREE.TransformControls(activeCamera, canvas3d);
      transformer.setMode(mode);
      transformer.addEventListener('change', render);
      transformer.addEventListener('mouseUp', function(event){
        $rootScope.$broadcast('scene.transformer.update');
      });
      activeScene.add(transformer);
      if (object !== undefined)
        transformer.attach(object);
      return true;
    };

    // Switch transformer
    scope.switchTransformer = function (mode) {
      if (transformer === undefined) return;
      transformer.setMode(mode);
    };

    // Delete transformer
    scope.deleteTransformer = function () {
      if (transformer !== undefined) {
        transformer.detach();
        activeScene.remove(transformer);
        transformer = undefined;
      }
    };

    /**
     * Debug
     */
    // Create a box
    scope.createBox = function () {
      let box = createBox(300, 300, 300, 0xff0000);
      activeScene.add(box);
    };

    // Serialize
    scope.serialize = function () {
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
      if (event.button !== 0) return;
      if (scope.selectType > 0) selectObjects();
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
      let scene = new $window.THREE.Scene();
      scenes.push(scene);
      activeScene = scene;

      let paper = new $window.THREE.Scene();
      papers.push(paper);
      activePaper = paper;
    }

    // Evaluate scene center
    function updateSceneBox(scene) {
      // Check input data
      if (!(scene instanceof $window.THREE.Scene)) return;

      // Update box
      let count = 0;
      scene.box = new $window.THREE.Box3();
      scene.traverse(function(object) {
        if (object.type !== undefined && object.type === scope.GEOMETRY_TYPES.model) {
          let box = new $window.THREE.Box3();
          box.setFromObject(object);
          scene.box.union(box);
          count++;
        }
      });
      if (count === 0)
        scene.box.makeEmpty();

      // Update center
      scene.center = new $window.THREE.Vector3();
      if (count > 0)
        scene.center.copy(scene.box.min).add(scene.box.max).multiplyScalar(0.5);
    }

    // Create renderer
    function createRenderer() {
      container = $document[0].getElementById('canvases');

      // 3d canvas
      renderer = $window.WebGLRenderingContext ?
        new $window.THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true
        }) :
        new $window.THREE.CanvasRenderer();
      canvas3d = renderer.domElement;
      canvas3d.id = 'canvas3d';
      renderer.setSize($window.innerWidth, $window.innerHeight);
      renderer.setPixelRatio($window.devicePixelRatio);
      renderer.autoClear = true;
      container.appendChild(canvas3d);

      // 2d canvas
      canvas2d = $document[0].createElement('canvas');
      canvas2d.id = 'canvas2d';
      canvas2d.width = $window.innerWidth;
      canvas2d.height = $window.innerHeight;
      canvas2d.style.width = $window.innerWidth.toString() + 'px';
      canvas2d.style.height = $window.innerHeight.toString() + 'px';
      canvas2d.style.pointerEvents = 'none';
      container.appendChild(canvas2d);
      context = canvas2d.getContext('2d');
      context.paint = function (paper) {
        context.clearRect(0, 0, $window.innerWidth, $window.innerHeight);
        paper.children.forEach(function(child){
          child.paint(context);
        });
      };
    }

    // Create camera
    function createCamera() {
      let camera = new $window.THREE.PerspectiveCamera(CAMERA_ANGLE, $window.innerWidth / $window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
      camera.name = 'VIEW #' + cameras.length + 1;
      camera.position.set(- SIZE_BOX * 2, - SIZE_BOX * 2, SIZE_BOX);
      camera.up.copy(new $window.THREE.Vector3(0, 0, 1));
      camera.target = new $window.THREE.Vector3();
      cameras.push(camera);
      activeCamera = camera;
    }

    // Create helpers
    function createHelpers() {
      // Grid
      let grid = new $window.THREE.GridHelper(SIZE_BOX, SIZE_GAP);
      grid.name = 'GRID';
      grid.rotateX(Math.PI / 2.0);
      activeScene.add(grid);

      // Axis
      let axis = new $window.THREE.AxisHelper(SIZE_BOX);
      axis.name = 'AXIS';
      activeScene.add(axis);

      // ACS
      acs = new $window.THREE.AcsHelper(activeCamera, 150, $window.innerHeight - 50, 50);
      acs.name = 'ACS';
      activePaper.add(acs);
    }

    function createTextSprite(text, parameters)
    {
      // Set parameters
      if (parameters === undefined) parameters = {};
      let fontFace = parameters.hasOwnProperty('fontFace') ? parameters.fontFace : 'Arial';
      let fontSize = parameters.hasOwnProperty('fontSize') ? parameters.fontSize : 28;
      let borderThickness = parameters.hasOwnProperty('borderThickness') ? parameters.borderThickness : 2;
      let borderColor = parameters.hasOwnProperty('borderColor') ? parameters.borderColor : {r:0, g:0, b:0, a:1.0};
      let backgroundColor = parameters.hasOwnProperty('backgroundColor') ? parameters.backgroundColor : {r:255, g:255, b:255, a:1.0};

      // Create canvas and context
      let canvas = $document[0].createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      let context = canvas.getContext('2d');
      context.font = 'Bold ' + fontSize + 'px ' + fontFace;
      let metrics = context.measureText(text);
      let textWidth = metrics.width;

      // Paint text border
      context.fillStyle   = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';
      context.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';
      context.lineWidth = borderThickness;
      function createTextBorder (x, y, w, h, r) {
        context.beginPath();
        context.moveTo(x+r, y);
        context.lineTo(x+w-r, y);
        context.quadraticCurveTo(x+w, y, x+w, y+r);
        context.lineTo(x+w, y+h-r);
        context.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        context.lineTo(x+r, y+h);
        context.quadraticCurveTo(x, y+h, x, y+h-r);
        context.lineTo(x, y+r);
        context.quadraticCurveTo(x, y, x+r, y);
        context.closePath();
        context.fill();
        context.stroke();
      }
      createTextBorder(borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontSize * 1.4 + borderThickness, 6);

      // Paint text
      context.fillStyle = 'rgba(0, 0, 0, 1.0)';
      context.fillText(text, borderThickness, fontSize + borderThickness);

      // Create sprite
      let texture = new $window.THREE.Texture(canvas);
      texture.needsUpdate = true;
      let spriteMaterial = new $window.THREE.SpriteMaterial({map: texture});
      let sprite = new $window.THREE.Sprite(spriteMaterial);
      sprite.scale.set(100, 50, 1.0);
      return sprite;
    }

    // Create lights
    function createLights() {
      eyeLight = new $window.THREE.DirectionalLight(0xffffff, 0.5);
      eyeLight.name = 'EYE LIGHT';
      eyeLight.position.set(SIZE_BOX * 2, SIZE_BOX, SIZE_BOX * 2);
      activeScene.add(eyeLight);
    }

    // Create controller
    function createController() {
      // Create controller
      if (controller === undefined) {
        if (controllerType === 1) {
          let trackball = new $window.THREE.TrackballControls(activeCamera);
          trackball.rotateSpeed = 4.0;
          trackball.zoomSpeed = 2.0;
          trackball.panSpeed = 1.0;
          trackball.noZoom = false;
          trackball.noPan = false;
          trackball.staticMoving = true;
          trackball.dynamicDampingFactor = 0.3;
          controller = trackball;
        }
        else if (controllerType === 2) {
          let orbitor = new $window.THREE.OrbitControls(activeCamera, canvas3d);
          controller = orbitor;
        }
      }
    }

    // Count object instances
    function countModels(name) {
      // Check input data
      if (name === undefined) return 0;

      // Count object instances
      let count = 0;
      activeScene.traverse(function(object) {
        if (object.type === scope.GEOMETRY_TYPES.model) {
          if (object.name === name) count++;
        }
      });
      return count;
    }

    // Get materials for display mode
    function getDisplaySettings () {
      let meshMaterial = meshDefaultMaterial;
      let lineMaterial = lineDefaultMaterial;
      let meshVisibility = true;
      let lineVisibility = true;
      switch (scope.displayMode) {
        case scope.DISPLAY_MODES.shaded:
          break;
        case scope.DISPLAY_MODES.rendered:
          lineVisibility = false;
          break;
        case scope.DISPLAY_MODES.analysis:
          meshMaterial = meshAnalysisMaterial;
          break;
        case scope.DISPLAY_MODES.mesh:
          meshMaterial = meshWireframeMaterial;
          break;
        case scope.DISPLAY_MODES.wireframe:
          meshVisibility = false;
          break;
      }
      return {
        meshMaterial: meshMaterial,
        meshVisibility: meshVisibility,
        lineMaterial: lineMaterial,
        lineVisibility: lineVisibility
      };
    }

    /**
     * Selection
     */
    // Set selected
    function setSelected (object, selected) {
      if (!(object instanceof $window.THREE.Scene))
        object.selected = selected;
      if (object.children !== undefined && object.children.length > 0) {
        object.children.forEach(function (child){
          setSelected(child, selected);
        });
      }
    }

    // Click pick objects
    function selectObjects() {
      raycaster.setFromCamera(mouse, activeCamera);
      let intersects = raycaster.intersectObjects(activeScene.children, true);
      if (intersects.length > 0) {
        // Get candidates by type
        let candidates = [];
        let candidate;
        if (scope.selectType & scope.GEOMETRY_TYPES.model) {
          candidate = getPickedModel(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidate === undefined && scope.selectType & scope.GEOMETRY_TYPES.face) {
          candidate = getPickedFace(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidate === undefined && scope.selectType & scope.GEOMETRY_TYPES.edge) {
          candidate = getPickedEdge(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidate === undefined && scope.selectType & scope.GEOMETRY_TYPES.curve) {
          candidate = getPickedCurve(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidate === undefined && scope.selectType & scope.GEOMETRY_TYPES.point) {
          candidate = getPickedPoint(intersects);
          if (candidate !== undefined)
            candidates.push(candidate);
        }
        if (candidates.length === 0) return;

        // Update selects
        candidates.forEach(function(candidate) {
          if (scope.selectMode === scope.SELECTION_MODES.single) {
            selects.forEach(function(object) {
              setSelected(object, false);
            });
            selects = [];
          }
          if (selects.length > 0 && selects.indexOf(candidate) !== -1) {
            let index = selects.indexOf(candidate);
            selects.splice(index, 1);
            setSelected(candidate, false);
          } else {
            setSelected(candidate, true);
            selects.push(candidate);
          }
        });
      }

      // Update displays
      if (scope.displaySelect)
        scope.updateDisplays();

      // Broadcast
      if (selects.length > 0)
        $rootScope.$broadcast('scene.selected', selects);
    }

    // Get picked model
    function getPickedModel(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Mesh) {
          let candidate = intersects[i].object.parent.parent;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.model)
            return candidate;
        }
      }
    }

    // Get picked face
    function getPickedFace(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Mesh) {
          let candidate = intersects[i].object;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.face)
            return candidate;
        }
      }
    }

    // Get picked edge
    function getPickedEdge(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Line) {
          let candidate = intersects[i].object;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.edge)
            return candidate;
        }
      }
    }

    // Get picked curve
    function getPickedCurve(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Line) {
          let candidate = intersects[i].object;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.curve)
            return candidate;
        }
      }
    }

    // Get picked point
    function getPickedPoint(intersects) {
      if (intersects.length === 0) return;
      for (i = 0; i < intersects.length; i++) {
        if (intersects[i].object instanceof $window.THREE.Vector3) {
          let candidate = intersects[i].object;
          if (candidate.type !== undefined && candidate.type === scope.GEOMETRY_TYPES.point)
            return candidate;
        }
      }
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
      context.paint(activePaper);
    }

    // Update
    function update() {
      // ACS
      if (acs !== undefined) acs.update();

      // Controller
      if (controller !== undefined) controller.update();

       // Transformer
      if (transformer !== undefined) transformer.update();

      // Lights
      let direction = new $window.THREE.Vector3();
      direction.copy(activeCamera.position).sub(activeCamera.target).normalize();
      eyeLight.position.copy(direction);
    }

    //---------------------------------------------------
    //  Debugging
    //---------------------------------------------------
    // Create a point
    function createPoint(x, y, z, color) {
      let geometry = new $window.THREE.SphereGeometry(0.1, 32, 32);
      let material = new $window.THREE.MeshBasicMaterial({
        color: color !== undefined ? color : 0xffffff
      });
      let point = new $window.THREE.Mesh(geometry, material);
      return point;
    }

    // Create a box
    function createBox(dx, dy, dz, color) {
      let geometry = new $window.THREE.BoxGeometry(dx, dy, dz);
      let material = new $window.THREE.MeshBasicMaterial({
        color: color !== undefined ? color : 0xffffff,
        wireframe: true
      });
      let box = new $window.THREE.Mesh(geometry, material);
      var timestamp = new Date().getUTCMilliseconds();
      box.name = 'BOX ' + timestamp;
      return box;
    }
  }
]);
