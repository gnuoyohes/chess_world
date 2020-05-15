var ROOMKEY = document.getElementById("globals").getAttribute("room-key");
var WORLD = document.getElementById("globals").getAttribute("world");
var NAME = '';

var MAPLENGTHX = 300;
var MAPLENGTHZ = 300;
var YHEIGHT = 5;
var CAMERAYOFFSET = 5;

var SOCKETURL = document.getElementById("globals").getAttribute("socket-url");
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
}
