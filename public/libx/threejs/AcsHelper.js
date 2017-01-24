/*
 * Running this will allow you to create Acs control.
 */

THREE.AcsHelper = function ( _camera, _x, _y, _scale ) {

	var scope = this;

	var ao = new THREE.Vector3();

	var ax = new THREE.Vector3(1, 0, 0);

	var ay = new THREE.Vector3(0, 1, 0);

	var az = new THREE.Vector3(0, 0, 1);

	var camera = _camera;

	this.origin = new THREE.Vector2(_x, _y);

	this.xAxis = new THREE.Vector2(_x, _y);

	this.yAxis = new THREE.Vector2(_x, _y);

	this.zAxis = new THREE.Vector2(_x, _y);

	var scale = (_scale !== undefined) ? _scale : 10;

	var plane;

	update();

	//
	// public methods
	//

	this.update = update;

	//
	// private methods
	//

	function updatePlane () {

		let n = camera.target.clone().sub(camera.position).normalize();

		if ( plane === undefined ) {

			plane = new THREE.Plane(n);

		} else {

			plane.set(n);
		}

	}

	function updateX () {

		let n = ax.clone().sub(camera.position).normalize();

		let ray = new THREE.Ray(ax, n);

		let x = ray.intersectPlane(plane);

		if ( x === null ) return;

		let o = ao.clone();

		let v = x.clone().sub(o).normalize();

		v.multiplyScalar(scale);

		v.z = 0;

		v.y *= -1;

		scope.xAxis.copy(scope.origin);

		scope.xAxis.add(v);

	}

	function updateY () {

		let y = ay.clone().project(camera);

		let o = ao.clone().project(camera);

		let v = y.clone().sub(o).normalize();

		v.multiplyScalar(scale);

		v.z = 0;

		v.y *= -1;

		scope.yAxis.copy(scope.origin);

		scope.yAxis.add(v);

	}

	function updateZ () {

		let z = az.clone().project(camera);

		let o = ao.clone().project(camera);

		let v = z.clone().sub(o).normalize();

		v.multiplyScalar(scale);

		v.z = 0;

		v.y *= -1;

		scope.zAxis.copy(scope.origin);

		scope.zAxis.add(v);

	}


	function update() {

		updatePlane();

		updateX();

		updateY();

		updateZ();

	}

};

THREE.AcsHelper.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.AcsHelper.prototype.constructor = THREE.AcsHelper;
