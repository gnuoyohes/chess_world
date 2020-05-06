const MAPRADIUS = 200;

var platform;
var moon;
var userObjs = {};

const textures_folder = "/static/textures/";
const models_folder = "/static/models/";


function addGround(scene) {
  var groundTexture = new THREE.TextureLoader().load(textures_folder + "terrain/grasslight-big.jpg");
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(25, 25);
  var ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 1000),
    new THREE.MeshLambertMaterial({map: groundTexture})
  );

  ground.position.y = 0;
  ground.rotation.x = -0.5 * Math.PI;
  ground.name = "ground";
  ground.receiveShadow = true;
  scene.add(ground);
  platform = ground;
}

// https://sketchfab.com/3d-models/hera-1ba36839519041a0b66e246e36263493
function addWorldFBX(scene) {
  var loader = new THREE.FBXLoader();

  loader.load(models_folder + 'Hera_Island_Test.fbx', function ( object ) {
    object.scale.set(0.03, 0.03, 0.03);
    object.position.set(0, -30, 0);
  	scene.add(object);
    platform = object;
  }, undefined, function ( error ) {
  	console.error(error);
  } );
}

// borrowed from https://github.com/CoryG89/MoonDemo
function addMoon(scene) {
  var radius = 80;
  var xSegments = 50;
  var ySegments = 50;
  var geo = new THREE.SphereGeometry(radius, xSegments, ySegments);
  var moonTexture = new THREE.TextureLoader().load(textures_folder + "moon/moon.jpg");
  var mat = new THREE.MeshBasicMaterial({map: moonTexture})
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(-1000, 500, -1000);
  mesh.rotation.set(0, 180, 0);
  scene.add(mesh);
  moon = mesh;
}

// borrowed from https://github.com/CoryG89/MoonDemo
function addSky(scene) {
  var envMap = new THREE.CubeTextureLoader().load( [
			textures_folder + 'starfield/right.png', // right
			textures_folder + 'starfield/left.png', // left
			textures_folder + 'starfield/top.png', // top
			textures_folder + 'starfield/bottom.png', // bottom
			textures_folder + 'starfield/back.png', // back
			textures_folder + 'starfield/front.png' // front
		] );
	scene.background = envMap;
}

function addUser(scene, name) {
  var geo = new THREE.SphereBufferGeometry(2, 16, 16);
  var mat = new THREE.MeshBasicMaterial( {color: new THREE.Color(GETNAMECOLOR(name))} );
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 2, 0);
  mesh.rotation.set(0, 0, 0);
  scene.add(mesh);
  userObjs[name] = mesh;
}

function removeUser(scene, name) {
  scene.remove( userObjs[name] );
  delete userObjs[name];
}

function getScene() {
  var scene = new THREE.Scene();
  // addSky(scene);
  // addMoon(scene);
  // addGround(scene);
  addWorldFBX(scene);

  scene.background = new THREE.Color( 0xcce0ff );
  scene.fog = new THREE.FogExp2( 0xcce0ff, 0.01 );

  // var moonlight = new THREE.DirectionalLight(0xe0d2c5, 0.07);
  // moonlight.position.set(-1000, 500, -1000); // Sun on the sky texture
  // scene.add(moonlight);

  var ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add( ambientLight );

  return scene;
}
