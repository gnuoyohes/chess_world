// Three.js stuff

if (!Detector.webgl) Detector.addGetWebGLMessage();

var scene;

// init 3D stuff
var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
};


var resetGame = function () {
	scene = getScene();
	motion.position.set(0, 0, 0);
	motion.rotation.set(0, 0, 0);
	motion.spinning.set(0, 0, 0);
}

// game systems code
var resetPlayer = function () {
	if ( motion.position.y < 0 ) {
		motion.position.set( motion.position.x, 0, motion.position.z );
		motion.velocity.multiplyScalar( 0 );
	}
	if (motion.position.x > MAPRADIUS || motion.position.x < -1*MAPRADIUS ||
		motion.position.z > MAPRADIUS || motion.position.z < -1*MAPRADIUS) {
		motion.position.set(0, 0, 0);
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
		console.log(key);
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
	if ( ! motion.airborne ) {
		// look around
		var sx = keysPressed[ keys.UP ] ? 0.03 : ( keysPressed[ keys.DN ] ? - 0.03 : 0 );
		var sy = keysPressed[ keys.LT ] ? 0.03 : ( keysPressed[ keys.RT ] ? - 0.03 : 0 );
		if ( Math.abs( sx ) >= Math.abs( motion.spinning.x ) ) motion.spinning.x = sx;
		if ( Math.abs( sy ) >= Math.abs( motion.spinning.y ) ) motion.spinning.y = sy;
		// move around
		forward.set( Math.sin( motion.rotation.y ), 0, Math.cos( motion.rotation.y ) );
		sideways.set( forward.z, 0, - forward.x );
		if (motion.sprinting) {
			forward.multiplyScalar( keysPressed[ keys.W ] ? - 0.5 : ( keysPressed[ keys.S ] ? 0.5 : 0 ) );
			sideways.multiplyScalar( keysPressed[ keys.A ] ? - 0.5 : ( keysPressed[ keys.D ] ? 0.5 : 0 ) );
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
			forward.multiplyScalar( keysPressed[ keys.W ] ? - 0.2 : ( keysPressed[ keys.S ] ? 0.2 : 0 ) );
			sideways.multiplyScalar( keysPressed[ keys.A ] ? - 0.2 : ( keysPressed[ keys.D ] ? 0.2 : 0 ) );
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
		//jump
			var vy = keysPressed[ keys.SP ] ? 0.7 : 0;
			motion.velocity.y += vy;
	}
	else {
		if (runSound.isPlaying)
			runSound.stop();
		if (walkSound.isPlaying)
			walkSound.stop();
	}
}

var applyPhysics = ( function () {
	var timeStep = 5;
	var timeLeft = timeStep + 1;
	var birdsEye = 100;
	var kneeDeep = 0.4;
	var raycaster = new THREE.Raycaster();
	raycaster.ray.direction.set( 0, - 1, 0 );
	var angles = new THREE.Vector2();
	var displacement = new THREE.Vector3();
	return function ( dt ) {
		if ( platform ) {
			timeLeft += dt;
			// run several fixed-step iterations to approximate varying-step
			dt = 5;
			while ( timeLeft >= dt ) {
				var time = 0.3, damping = 0.93, gravity = 0.01, tau = 2 * Math.PI;
				raycaster.ray.origin.copy( motion.position );
				raycaster.ray.origin.y += birdsEye;
				var hits = raycaster.intersectObject( platform );
				motion.airborne = true;
				// are we above, or at most knee deep in, the platform?
				if ( ( hits.length > 0 ) ) {
					var actualHeight = hits[ 0 ].distance - birdsEye;
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
				timeLeft -= dt;
			}
		}
	};
} )();

var updateCamera = ( function () {
	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
	return function ( dt ) {
		euler.x = motion.rotation.x;
		euler.y = motion.rotation.y;
		camera.quaternion.setFromEuler( euler );
		camera.position.copy( motion.position );
		camera.position.y += 5;
	};
} )();

var updatePosition = function () {
	if (!motion.prev_position.equals(motion.position)) {
		SOCKET.emit('update_position', {
			name: NAME,
			roomKey: ROOMKEY,
			position: [motion.position.x, motion.position.y + 2, motion.position.z]
		});
		motion.prev_position.copy(motion.position);
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
		var timeElapsed = lastTimeStamp ? timeStamp - lastTimeStamp : 0;
		lastTimeStamp = timeStamp;
		// call our game loop with the time elapsed since last rendering, in ms
		gameLoop( timeElapsed );
		renderer.render( scene, camera );
		requestAnimationFrame( render );
	};
	render();
};
var gameLoop = function ( dt ) {
	resetPlayer();
	if (!typing) {
		keyboardControls(); // keyboard controls only when not typing in chat
		applyPhysics( dt );
		updateCamera();
		updatePosition();
	}
};
var gameViewportSize = function () {
	return {
		width: window.innerWidth, height: window.innerHeight
	};
};

//////// main ////////

// called when submit button is clicked
function submitName() {
	const name = document.getElementById("nameInput").value;
	if (name !== '') {
		var xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	      if (this.responseText == "success") {
					NAME = CLEANINPUT(name);
	 		 		document.getElementById("myModal").style.display = "none";
	 		 		document.getElementById("name").innerHTML = NAME;
	 		 		SOCKET.emit('join_room', { name: NAME, roomKey: ROOMKEY });
					SOCKET.emit('users_init', ROOMKEY);

					// start Three.js
					resetGame();
					start( gameLoop, gameViewportSize );
	      }
	      else {
	        document.getElementById("error-text").innerHTML = "Name not valid";
	      }
	    }
	  };
	  xhttp.open("POST", `${window.location.protocol}//${window.location.host}/validate_name?roomKey=${ROOMKEY}&name=${name}`, true);
	  xhttp.send();
	}
}

// set up handler
$(document).ready(function () {
  $('#nameForm').submit(function (e) {
    e.preventDefault();
    submitName();
  });
});

// socket handlers

SOCKET.on('users_init', users => {
	for (var user in users) {
		if (user !== NAME) {
			console.log(user);
			addUser(scene, user);
			const pos = users[user];
			userObjs[user].position.set(pos[0], pos[1], pos[2]);
		}
	}
});

SOCKET.on('users', users => {
  for (var user in users) {
		if (user !== NAME) {
			const newPos = users[user];
			userObjs[user].position.set(newPos[0], newPos[1], newPos[2]);
		}
	}
});

SOCKET.on('user_joined', data => {
	if (data['username'] !== NAME)
		addUser(scene, data['username']);
});

SOCKET.on('user_left', data => {
	removeUser(scene, data['username']);
});
