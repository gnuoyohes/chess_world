const ROOMKEY = document.getElementById("globals").getAttribute("room-key");
const WORLD = document.getElementById("globals").getAttribute("world");
var NAME = '';

// game
var MAPLENGTHX = 300;
var MAPLENGTHZ = 300;
var YHEIGHT = 5;
var CAMERAYOFFSET = 5;
var FPS = 60;

// chat
const FADE_TIME = 150; // ms
const TYPING_TIMER_LENGTH = 400; // ms

// chess board
const WHITESQUAREGREY = '#a9a9a9';
const BLACKSQUAREGREY = '#696969';
var PIECEMOVESPEED = 0.8; // sec, approximate
var BOARDOFFSET;
var BOARDSCALE;

const SOCKETURL = document.getElementById("globals").getAttribute("socket-url");
const SOCKET = io(SOCKETURL);

// Prevents input from having injected markup
const CLEANINPUT = (input) => {
  return $('<div/>').text(input).html();
}

var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

// converts chess board square coordinate to 3D position
const COORDTOPOS = (coord, offset, scale) => {
  var sqLen = 6; // length of one square
  const letter = coord.charCodeAt(0);
  const number = parseInt(coord.charAt(1));
  var x = sqLen*(letter - "d".charCodeAt()) - sqLen/2.0;
  var z = sqLen*(5 - number) - sqLen/2.0;
  var pos = new THREE.Vector3(x, 0, z);
  pos.multiplyScalar(scale);
  pos.add(offset);
  return pos;
};

// Gets the color of a name through hash function
const GETNAMECOLOR = (name) => {
  // Compute hash code
  var hash = 7;
  for (var i = 0; i < name.length; i++) {
     hash = name.charCodeAt(i) + (hash << 5) - hash;
  }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};
