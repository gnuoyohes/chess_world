const MAPRADIUS = 200;

var platform;
var flashlight;
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

  scene.background = new THREE.Color( 0xcce0ff );
  scene.fog = new THREE.FogExp2( 0xcce0ff, 0.012 );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( directionalLight );

  $("#loading").hide();
}

function addWorld(scene) {
  var loader = new THREE.FBXLoader();

  switch (WORLD) {
    case 'Camp':
      loader.load(models_folder + 'worlds/camp.fbx', function ( object ) {
        object.scale.set(0.04, 0.04, 0.04);
        object.position.set(0, -30, 0);

        for (var child of object.children) {
          if (child.name === "Plane") {
            platform = child;
            break;
          }
        }

        scene.add(object);
        scene.background = new THREE.Color( 0xcce0ff );
        scene.fog = new THREE.FogExp2( 0xcce0ff, 0.005 );

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add( ambientLight );

        MAPLENGTHX = 300;
        MAPLENGTHZ = 300;

        $("#loading").hide();
      }, function ( xhr ) { // called while object is loading
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      }, function ( error ) { // called on error
        console.error(error);
      } );
      break;
    case 'Desert':
      loader.load(models_folder + 'worlds/desert.fbx', function ( object ) {
        object.scale.set(0.03, 0.03, 0.03);
        object.position.set(0, -30, 0);

        for (var child of object.children) {
          if (child.name === "Grid") {
            platform = child;
            break;
          }
        }

        scene.add(object);
        scene.background = new THREE.Color( 0xb8554c );
        scene.fog = new THREE.FogExp2( 0xb8554c, 0.005 );

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add( ambientLight );

        MAPLENGTHX = 500;
        MAPLENGTHZ = 500;

        $("#loading").hide();
      }, function ( xhr ) { // called while object is loading
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      }, function ( error ) { // called on error
        console.error(error);
      } );
      break;
    case 'Forest':
      loader.load(models_folder + 'worlds/forest.fbx', function ( object ) {
        object.scale.set(0.1, 0.1, 0.1);
        object.position.set(0, -30, 0);

        for (var child of object.children) {
          if (child.name === "Plane") {
            platform = child;
            break;
          }
        }

        scene.add(object);
        scene.background = new THREE.Color( 0x111111 );
        // scene.fog = new THREE.FogExp2( 0xffffff, 0.01 );

        // flashlight (homage to Blenderman)
        flashlight = new THREE.SpotLight(0xffffff, 2);
        flashlight.angle = Math.PI/4;
        flashlight.penumbra = 0.1;
        flashlight.distance = 100;
        flashlight.decay = 2;
        scene.add(flashlight);
        scene.add(flashlight.target);

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.001);
        scene.add( ambientLight );

        MAPLENGTHX = 50;
        MAPLENGTHZ = 50;

        $("#loading").hide();
      }, function ( xhr ) { // called while object is loading
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      }, function ( error ) { // called on error
        console.error(error);
      } );
      break;
    case 'Island':
      loader.load(models_folder + 'worlds/island.fbx', function ( object ) {
        object.scale.set(0.1, 0.1, 0.1);
        object.position.set(0, -30, 0);

        for (var child of object.children) {
          if (child.name === "Plane") {
            platform = child;
            break;
          }
        }

        scene.add(object);
        scene.background = new THREE.Color( 0xcce0ff );
        scene.fog = new THREE.FogExp2( 0xcce0ff, 0.005 );

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add( ambientLight );

        MAPLENGTHX = 100;
        MAPLENGTHZ = 100;

        $("#loading").hide();
      }, function ( xhr ) { // called while object is loading
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      }, function ( error ) { // called on error
        console.error(error);
      } );
      break;
    case 'Planet':
      loader.load(models_folder + 'worlds/planet.fbx', function ( object ) {
        object.scale.set(0.15, 0.15, 0.15);
        object.position.set(0, -40, 0);

        for (var child of object.children) {
          if (child.name === "Plane") {
            platform = child;
            break;
          }
        }

        scene.add(object);
        scene.background = new THREE.Color( 0x000000 );
        // scene.fog = new THREE.FogExp2( 0xcce0ff, 0.005 );

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add( ambientLight );

        MAPLENGTHX = 300;
        MAPLENGTHZ = 300;
        CAMERAYOFFSET = 10;

        $("#loading").hide();
      }, function ( xhr ) { // called while object is loading
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      }, function ( error ) { // called on error
        console.error(error);
      } );
      break;
    default:
      addGround(scene);
  }
  console.log(scene);
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

  addWorld(scene);

  scene.onAfterRender = () =>  {

  }

  return scene;
}
