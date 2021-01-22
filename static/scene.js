const MAPRADIUS = 200;

var scene;
var platform;
var flashlight;
var userObjs = {};
var chessObjs = {};
var movingPieces = [];

const textures_folder = "/static/textures/";
const models_folder = "/static/models/";


function addGround() {
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
  scene.fog = new THREE.FogExp2( 0xcce0ff, 0.008 );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( directionalLight );

  $("#loading").hide();
}

function addWorld() {
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
        object.scale.set(0.2, 0.2, 0.2);
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

        MAPLENGTHX = 100;
        MAPLENGTHZ = 100;

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
      addGround();
  }
  console.log(scene);
}

function addChessboard(board_fen) {
  const whiteMat = new THREE.MeshLambertMaterial( {
    color: new THREE.Color(0xffffff),
    emissive: new THREE.Color(0x696969),
    transparent: true,
    opacity: 1.0,
    name: 'white',
  } );
  const blackMat = new THREE.MeshLambertMaterial( {
    color: new THREE.Color(0x262626),
    emissive: new THREE.Color(0x000000),
    transparent: true,
    opacity: 1.0,
    name: 'black',
  } );

  switch (WORLD) {
    case 'Camp':
      BOARDOFFSET = new THREE.Vector3(-35, -16.1, 5);
      BOARDSCALE = 1;
      break;
    case 'Desert':
      BOARDOFFSET = new THREE.Vector3(-92, -34.4, -303.5);
      BOARDSCALE = 1;
      break;
    case 'Forest':
      BOARDOFFSET = new THREE.Vector3(6, -25.4, -2);
      BOARDSCALE = 0.4;
      break;
    case 'Island':
      BOARDOFFSET = new THREE.Vector3(283, -13.1, -49);
      BOARDSCALE = 1;
      break;
    case 'Planet':
      BOARDOFFSET = new THREE.Vector3(0, -1.9, 35);
      BOARDSCALE = 2;
      break;
    case 'Grass':
      BOARDOFFSET = new THREE.Vector3(0, 0.01, 0);
      BOARDSCALE = 6;
      break;
    default:
      BOARDOFFSET = new THREE.Vector3(0, 0, 0);
  }
  var loader = new THREE.FBXLoader();
  loader.load(models_folder + 'chess/board.fbx', function ( object ) {
    object.scale.multiplyScalar(BOARDSCALE);
    object.position.copy(BOARDOFFSET);
    scene.add(object);
  }, function ( error ) {
    console.error(error);
  } );

  var coords = {
    king: [],
    queen: [],
    bishop: [],
    knight: [],
    rook: [],
    pawn: []
  };
  var fen_split = board_fen.split(' ')[0].split('/');
  var files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  var rank = 8;
  for (let line of fen_split) {
    var file = 0;
    for (let i=0; i<line.length; i++) {
      var c = line.charAt(i);
      var n = parseInt(c);
      var color;
      if (isNaN(n)) {
        var c_lower = c.toLowerCase();
        if (c === c_lower) color = 'b';
        else color = 'w';
        switch (c_lower) {
          case 'r':
            coords.rook.push(`${files[file]}${rank}${color}`);
            break;
          case 'n':
            coords.knight.push(`${files[file]}${rank}${color}`);
            break;
          case 'b':
            coords.bishop.push(`${files[file]}${rank}${color}`);
            break;
          case 'q':
            coords.queen.push(`${files[file]}${rank}${color}`);
            break;
          case 'k':
            coords.king.push(`${files[file]}${rank}${color}`);
            break;
          case 'p':
            coords.pawn.push(`${files[file]}${rank}${color}`);
            break;
        }
        file += 1;
      }
      else {
        file += n;
      }
    }
    rank--;
  }
  console.log(coords);

  for (let piece in coords) {
    if (!coords.hasOwnProperty(piece)) continue;
    if (coords[piece].length == 0) continue;

    loader.load(models_folder + `chess/${piece}.fbx`, function ( object ) {
      object.scale.multiplyScalar(BOARDSCALE);
      for (let c of coords[piece]) {
        var coord = c.substring(0, 2);
        var color = c.charAt(2);
        var o = object.clone();
        o.name = piece;
        o.position.copy(COORDTOPOS(coord, BOARDOFFSET, BOARDSCALE));
        var rotation;
        if (color === 'w') {
          o.children[0].material = whiteMat.clone();
          rotation = new THREE.Euler(0, Math.PI/2, 0, 'XYZ');
        }
        else {
          o.children[0].material = blackMat.clone();
          rotation = new THREE.Euler(0, -1*Math.PI/2, 0, 'XYZ');
        }
        o.rotation.copy(rotation);
        scene.add(o);
        chessObjs[coord] = o;
      }
    }, function ( error ) {
      console.error(error);
    } );
  }
}

function movePiece(from, to, promote) {
  const iterations = Math.round(FPS*PIECEMOVESPEED);
  var obj = chessObjs[from];
  var initialPos = obj.position;
  var finalPos = COORDTOPOS(to, BOARDOFFSET, BOARDSCALE);
  var capturedObj = null;
  if (to in chessObjs) {
    capturedObj = chessObjs[to];
  }
  // check for en passant
  if (obj.name === 'pawn' && from.charAt(0) !== to.charAt(0) && !capturedObj) {
    var epCoord = `${to.charAt(0)}${from.charAt(1)}`;
    capturedObj = chessObjs[epCoord];
    delete chessObjs[epCoord];
  }
  movingPieces.push(
    {
      object: obj,
      captured: capturedObj,
      to: to,
      finalPos: finalPos,
      iterations: iterations,
      motion: finalPos.clone().sub(initialPos).divideScalar(iterations),
      opacityDiff: 1.0 / iterations,
      promote: promote,
    }
  );
  chessObjs[to] = obj;
  delete chessObjs[from];
}

function promote(square, piece) {
  var p;
  switch (piece) {
    case 'q':
      p = 'queen';
      break;
    case 'r':
      p = 'rook';
      break;
    case 'b':
      p = 'bishop';
      break;
    case 'n':
      p = 'knight';
      break;
    default:
      p = 'queen';
  }
  var pawnObj = chessObjs[square];

  var loader = new THREE.FBXLoader();
  loader.load(models_folder + `chess/${p}.fbx`, function ( o ) {
    o.scale.multiplyScalar(BOARDSCALE);
    o.name = p;
    o.position.copy(COORDTOPOS(square, BOARDOFFSET, BOARDSCALE));
    o.children[0].material = pawnObj.children[0].material.clone();
    o.rotation.copy(pawnObj.rotation);
    scene.add(o);
    chessObjs[square] = o;
  }, function ( error ) {
    console.error(error);
  } );

  removeObj(pawnObj);
}

function removeObj(obj) {
  if (obj.children.length > 0) {
    for (let c of obj.children) {
      c.geometry.dispose();
      c.material.dispose();
    }
  }
  else {
    obj.geometry.dispose();
    obj.material.dispose();
  }
  scene.remove( obj );
}

function addUser(name) {
  var geo = new THREE.SphereBufferGeometry(2, 16, 16);
  var mat = new THREE.MeshBasicMaterial( {color: new THREE.Color(GETNAMECOLOR(name))} );
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 2, 0);
  mesh.rotation.set(0, 0, 0);
  scene.add(mesh);
  userObjs[name] = mesh;
}

function removeUser(name) {
  var o = userObjs[name];
  removeObj(o);
  delete userObjs[name];
}

function initScene() {
  scene = new THREE.Scene();

  addWorld();
  // scene.onAfterRender = () =>  {
  //
  // }
}
