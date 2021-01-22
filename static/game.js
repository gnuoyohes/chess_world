//////// three.js stuff ////////

if (!Detector.webgl) Detector.addGetWebGLMessage();

// init 3D stuff
var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );
var camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );

var motion = {
	sprinting: false,
	airborne: false,
	prev_position: new THREE.Vector3(),
	position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
	rotation: new THREE.Vector2(),
	spinning: new THREE.Vector2(),
	quaternion: new THREE.Quaternion()
};

var resetGame = function () {
	initScene();
	motion.position.set(Math.random()*MAPLENGTHX-MAPLENGTHX/2, YHEIGHT, Math.random()*MAPLENGTHZ-MAPLENGTHZ/2);
	motion.rotation.set(0, 0, 0);
	motion.spinning.set(0, 0, 0);
};

// game systems code
var resetPlayer = function () {
	if ( motion.position.y < -50 ) {
		motion.position.set(Math.random()*MAPLENGTHX-MAPLENGTHX/2, YHEIGHT, Math.random()*MAPLENGTHZ-MAPLENGTHZ/2);
		motion.velocity.multiplyScalar( 0 );
		motion.rotation.multiplyScalar( 0 );
		motion.spinning.multiplyScalar( 0 );
	}
};

// init key press listeners
var keys = { SP: 32, W: 87, A: 65, S: 83, D: 68, UP: 38, LT: 37, DN: 40, RT: 39, T: 84, G: 71 };
var keysPressed = {};
var watchedKeyCodes = [keys.SP, keys.W, keys.A, keys.S, keys.D, keys.UP, keys.LT, keys.DN, keys.RT, keys.T, keys.G];
var handler = function ( down ) {
	return function ( e ) {
		if (e.metaKey) return;
		var key = e.which || e.keyCode || 0;
		var index = watchedKeyCodes.indexOf( key );
		if ( e.shiftKey )
			motion.sprinting = true;
		else {
			motion.sprinting = false;
		}
		// if (key === 13) sendMessage(); // method in chat.js
		if ( index >= 0 ) {
			keysPressed[ watchedKeyCodes[ index ] ] = down;
			// e.preventDefault();
		}
	};
};
window.addEventListener( "keydown", handler( true ), false );
window.addEventListener( "keyup", handler( false ), false );


var keyboardControls = function () {
	var forward = new THREE.Vector3();
	var sideways = new THREE.Vector3();

	const look = 0.025, walk = 0.4, run = 0.8

	if ( ! motion.airborne ) {
		// look around
		var sx = keysPressed[ keys.UP ] ? look : ( keysPressed[ keys.DN ] ? -1*look : 0 );
		var sy = keysPressed[ keys.LT ] ? look : ( keysPressed[ keys.RT ] ? -1*look : 0 );
		if ( Math.abs( sx ) >= Math.abs( motion.spinning.x ) ) motion.spinning.x = sx;
		if ( Math.abs( sy ) >= Math.abs( motion.spinning.y ) ) motion.spinning.y = sy;
		// move around
		forward.set( Math.sin( motion.rotation.y ), 0, Math.cos( motion.rotation.y ) );
		sideways.set( forward.z, 0, - forward.x );
		if (motion.sprinting) {
			forward.multiplyScalar( keysPressed[ keys.W ] ? -1*run : ( keysPressed[ keys.S ] ? run : 0 ) );
			sideways.multiplyScalar( keysPressed[ keys.A ] ? -1*run : ( keysPressed[ keys.D ] ? run : 0 ) );
			if (keysPressed[ keys.W ] || keysPressed[ keys.A ] || keysPressed[ keys.S ] || keysPressed[ keys.D ]) {
				if (!runSound.isPlaying)
					runSound.play();
				if (walkSound.isPlaying)
					walkSound.stop();
			}
			else {
				if (runSound.isPlaying)
					runSound.stop();
				if (walkSound.isPlaying)
					walkSound.stop();
			}
		}
		else {
			forward.multiplyScalar( keysPressed[ keys.W ] ? -1*walk : ( keysPressed[ keys.S ] ? walk : 0 ) );
			sideways.multiplyScalar( keysPressed[ keys.A ] ? -1*walk : ( keysPressed[ keys.D ] ? walk : 0 ) );
			if (keysPressed[ keys.W ] || keysPressed[ keys.A ] || keysPressed[ keys.S ] || keysPressed[ keys.D ]) {
				if (!walkSound.isPlaying)
					walkSound.play();
				if (runSound.isPlaying)
					runSound.stop();
			}
			else {
				if (runSound.isPlaying)
					runSound.stop();
				if (walkSound.isPlaying)
					walkSound.stop();
			}
		}
		var combined = forward.add( sideways );
		if ( Math.abs( combined.x ) >= Math.abs( motion.velocity.x ) ) motion.velocity.x = combined.x;
		if ( Math.abs( combined.y ) >= Math.abs( motion.velocity.y ) ) motion.velocity.y = combined.y;
		if ( Math.abs( combined.z ) >= Math.abs( motion.velocity.z ) ) motion.velocity.z = combined.z;

		// jump
		var vy = keysPressed[ keys.SP ] ? 0.7 : 0;
		motion.velocity.y += vy;
	}
	else {
		if (runSound.isPlaying)
			runSound.stop();
		if (walkSound.isPlaying)
			walkSound.stop();
	}
};

var applyPhysics = function () {
	if ( platform ) {
		const time = 1,
					damping = 0.8,
					gravity = 0.03,
					tau = 2 * Math.PI,
					birdsEye = 100,
					kneeDeep = 1.7;

		var rayDown = new THREE.Raycaster();
		rayDown.ray.direction.set( 0, - 1, 0 );
		rayDown.ray.origin.copy( motion.position );
		rayDown.ray.origin.y += birdsEye;
		var hitsDown = rayDown.intersectObject(platform);

		var euler = new THREE.Euler( motion.rotation.x, motion.rotation.y, 0, 'YXZ' );
		motion.quaternion.setFromEuler( euler );

		// var forwardDirection = new THREE.Vector3();
		// forwardDirection.copy(motion.velocity).applyQuaternion(motion.quaternion).normalize();
		// var rayForward = new THREE.Raycaster();
		// rayForward.ray.direction.copy(forwardDirection);
		// rayForward.ray.origin.copy(motion.position);
		// rayForward.ray.origin.y += CAMERAYOFFSET;
		// var hitsForward = rayForward.intersectObjects(world);

		var angles = new THREE.Vector2();
		var displacement = new THREE.Vector3();
		motion.airborne = true;
		// are we above, or at most knee deep in, the platform?
		if ( ( hitsDown.length > 0 ) ) {
			var actualHeight = hitsDown[ 0 ].distance - birdsEye;
			// collision: stick to the surface if landing on it
			if ( ( motion.velocity.y <= 0 ) && ( Math.abs( actualHeight ) < kneeDeep ) ) {
				motion.position.y -= actualHeight;
				motion.velocity.y = 0;
				motion.airborne = false;
			}
		}
		if ( motion.airborne ) motion.velocity.y -= gravity;
		angles.copy( motion.spinning ).multiplyScalar( time );
		if ( ! motion.airborne ) motion.spinning.multiplyScalar( damping );
		displacement.copy( motion.velocity ).multiplyScalar( time );
		if ( ! motion.airborne ) motion.velocity.multiplyScalar( damping );
		motion.rotation.add( angles );
		motion.position.add( displacement );
		// limit the tilt at ±0.4 radians
		motion.rotation.x = Math.max( - 0.6, Math.min( + 0.6, motion.rotation.x ) );
		// wrap horizontal rotation to 0...2π
		motion.rotation.y += tau;
		motion.rotation.y %= tau;
	}
};

var updateCamera = function () {
	camera.quaternion.copy( motion.quaternion );
	camera.position.copy( motion.position );
	camera.position.y += CAMERAYOFFSET;
	if (flashlight) {
		var direction = new THREE.Vector3();
		camera.getWorldDirection(direction);
		flashlight.position.copy(camera.position);
		flashlight.target.position.addVectors(flashlight.position, direction);
	}
};

var emitPosition = function () {
	if (!motion.prev_position.equals(motion.position)) {
		// console.log(motion.position);
		SOCKET.emit('update_position', {
			name: NAME,
			roomKey: ROOMKEY,
			position: [motion.position.x, motion.position.y + 2, motion.position.z]
		});
		motion.prev_position.copy(motion.position);
	}
};

var movePieces = function () {
	if (movingPieces.length > 0) {
		for (i=movingPieces.length-1; i>=0; i--) {
			o = movingPieces[i];
			if (o.iterations < 1) {
				o.object.position.copy(o.finalPos);
				movingPieces.splice(i, 1);
				capturedObj = o.captured;
				if (capturedObj) removeObj(capturedObj);
				if (o.promote !== '') {
					promote(o.to, o.promote);
				}
			}
			else {
				o.object.position.add(o.motion);
				if (o.captured) o.captured.children[0].material.opacity -= o.opacityDiff;
				o.iterations--;
			}
		}
	}
};

// start the game
var start = function ( gameLoop, gameViewportSize ) {

	// add sounds
	initSounds();
	camera.add( listener );

	var resize = function () {
		var viewport = gameViewportSize();
		renderer.setSize( viewport.width, viewport.height );
		camera.aspect = viewport.width / viewport.height;
		camera.updateProjectionMatrix();
	};
	window.addEventListener( 'resize', resize, false );
	resize();
	var lastTimeStamp;
	var render = function ( timeStamp ) {
		gameLoop();
		renderer.render( scene, camera );
		setTimeout(
			function() {
				requestAnimationFrame( render );
			}, 1000 / FPS // 60 fps, approximate
		);

	};
	render();
};
var gameLoop = function () {
	resetPlayer();
	if (!typing)
		keyboardControls(); // keyboard controls only when not typing in chat
	applyPhysics();
	updateCamera();
	emitPosition();
	movePieces();
};
var gameViewportSize = function () {
	return {
		width: window.innerWidth, height: window.innerHeight
	};
};

//////// main ////////

// called when submit button is clicked
function submitName() {
	const name = $("#name-input").val();
	if (name !== '') {
		var xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	      if (this.responseText == "success") {
					NAME = CLEANINPUT(name);
	 		 		$("#name-page").hide();
					$("#loading").show();
	 		 		$("#name").html(NAME);

					// start Three.js
					resetGame();
					start( gameLoop, gameViewportSize );

					SOCKET.emit('join_room', { name: NAME, roomKey: ROOMKEY });
					SOCKET.emit('users_init', ROOMKEY);
	      }
	      else {
	        $("#error-text").fadeIn(400);
	      }
	    }
	  };
	  xhttp.open("POST", `${window.location.protocol}//${window.location.host}/validate_name?roomKey=${ROOMKEY}&name=${name}`, true);
	  xhttp.send();
	}
}

// set up handler
$(document).ready(function () {
  $('#name-form').submit(function (e) {
    e.preventDefault();
    submitName();
  });
});

// socket handlers

SOCKET.on('users_init', users => {
	for (var user in users) {
		if (user !== NAME) {
			console.log(user);
			addUser(user);
			const pos = users[user];
			userObjs[user].position.set(pos[0], pos[1], pos[2]);
		}
	}
});

SOCKET.on('users', users => {
  for (var user in users) {
		if (user !== NAME) {
			const newPos = users[user];
			if (userObjs[user]) {
				userObjs[user].position.set(newPos[0], newPos[1], newPos[2]);
			}
		}
	}
});

SOCKET.on('user_joined', data => {
	if (data['username'] !== NAME)
		addUser(data['username']);
});

SOCKET.on('user_left', data => {
	removeUser(data['username']);
});
