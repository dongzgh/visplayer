/*
 * Running this will allow you to create Acs control.
 */

THREE.AcsHelper = function(_camera, _x, _y, _scale) {

  var scope = this;

  var camera = _camera;

  this.origin = new THREE.Vector2(_x, _y);

  this.axisX = new THREE.Vector2(_x, _y);

  this.axisY = new THREE.Vector2(_x, _y);

  this.axisZ = new THREE.Vector2(_x, _y);

  var scale = (_scale !== undefined) ? _scale : 10;

  var ao = new THREE.Vector3();

  var ax = new THREE.Vector3(1, 0, 0);

  var ay = new THREE.Vector3(0, 1, 0);

  var az = new THREE.Vector3(0, 0, 1);

  var lcs = {
    origin: new THREE.Vector3(),
    axisX: new THREE.Vector3(),
    axisY: new THREE.Vector3(),
    axisZ: new THREE.Vector3()
  };

  scope.parent = null;

  update();

  //
  // public methods
  //

  this.update = update;

  this.paint = paint;

  //
  // private methods
  //

  function updateLCS() {

    let v1 = camera.target.clone().sub(camera.position).normalize();

    let v2 = camera.up.clone();

    lcs.origin.copy(camera.position).add(v1.multiplyScalar(camera.near));

    lcs.axisX.crossVectors(v1, v2).normalize();

    lcs.axisY.crossVectors(lcs.axisX, v1).normalize();

    lcs.axisZ.crossVectors(lcs.axisX, lcs.axisY).normalize();

  }

  function worldToLCS(p) {

    let n1 = p.clone().sub(camera.position).normalize();

    let n2 = camera.target.clone().sub(camera.position).normalize();

    let a = Math.acos(n1.dot(n2));

    let n3 = new THREE.Vector3();

    n3.crossVectors(n1, n2).normalize();

    let n4 = new THREE.Vector3();

    n4.crossVectors(n2, n3).normalize();

    let d = camera.near / Math.tan(a);

    n4.multiplyScalar(d);

    let x = n4.dot(lcs.axisX);

    let y = n4.dot(lcs.axisY);

    return new THREE.Vector2(x, y);

  }

  function updateXYZ() {

    let po = worldToLCS(ao);

    let px = worldToLCS(ax);

    let py = worldToLCS(ay);

    let pz = worldToLCS(az);

    let vx = px.clone().sub(po).normalize();

    let vy = py.clone().sub(po).normalize();

    let vz = pz.clone().sub(po).normalize();

    vx.multiplyScalar(scale);

    vx.y *= -1;

    vy.multiplyScalar(scale);

    vy.y *= -1;

    vz.multiplyScalar(scale);

    vz.y *= -1;

    scope.axisX.copy(scope.origin);

    scope.axisX.add(vx);

    scope.axisY.copy(scope.origin);

    scope.axisY.add(vy);

    scope.axisZ.copy(scope.origin);

    scope.axisZ.add(vz);

  }

  function paint(context) {

    context.beginPath();

    context.moveTo(scope.origin.x, scope.origin.y);

    context.lineTo(scope.axisX.x, scope.axisX.y);

    context.strokeStyle = '#ff0000';

    context.stroke();

    context.beginPath();

    context.moveTo(scope.origin.x, scope.origin.y);

    context.lineTo(scope.axisY.x, scope.axisY.y);

    context.strokeStyle = '#00ff00';

    context.stroke();

    context.beginPath();

    context.moveTo(scope.origin.x, scope.origin.y);

    context.lineTo(scope.axisZ.x, scope.axisZ.y);

    context.strokeStyle = '#0000ff';

    context.stroke();
  }

  function update() {

    updateLCS();

    updateXYZ();
  }

};

THREE.AcsHelper.prototype = Object.create(THREE.Object3D.prototype);
THREE.AcsHelper.prototype.constructor = THREE.AcsHelper;