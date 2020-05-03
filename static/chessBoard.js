// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var chessBoard = null;
var chessGame = new Chess();
var whiteSquareGrey = '#a9a9a9';
var blackSquareGrey = '#696969';
var isWhite = false;
var isBlack = false;
var updated = false;

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '');
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square);

  var background = whiteSquareGrey;
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey;
  }

  $square.css('background', background);
}

function onDragStart (source, piece) {
  // do not pick up pieces if the game is over
  if (chessGame.game_over()) return false;

  if (isWhite) {
    if (chessGame.turn() === 'b' || piece.search(/^b/) !== -1) return false;
  }
  else if (isBlack) {
    if (chessGame.turn() === 'w' || piece.search(/^w/) !== -1) return false;
  }
  else {
    return false;
  }
}

function onDrop (source, target) {
  removeGreySquares();

  // see if the move is legal
  var move = chessGame.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) {
    updated = false;
    return 'snapback';
  }
  else {
    updated = true;
  }
}

function onMouseoverSquare (square, piece) {
  if (isWhite) {
    if (chessGame.turn() === 'b' || (piece && piece.search(/^b/) !== -1)) return;
  }
  else if (isBlack) {
    if (chessGame.turn() === 'w' || (piece && piece.search(/^w/) !== -1)) return;
  }
  else {
    return;
  }

  // get list of possible moves for this square
  var moves = chessGame.moves({
    square: square,
    verbose: true
  });

  // exit if there are xno moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares();
}

function onSnapEnd () {
  if (updated) {
    SOCKET.emit('update_board', { roomKey: ROOMKEY, board: chessGame.fen() });
    updated = false;
  }
  else return false;
}

var config = {
  pieceTheme: 'static/img/chesspieces/wikipedia/{piece}.png',
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
};
chessBoard = Chessboard('myBoard', config);

// socket handlers
SOCKET.on('info', info => {
  if (info.white == NAME) {
    isWhite = true;
  }
  else if (info.black == NAME) {
    isBlack = true;
  }
  else {
    isWhite = isBlack = false;
  }
  document.getElementById("white").innerHTML = info.white;
  document.getElementById("black").innerHTML = info.black;

  if (isBlack) chessBoard.orientation('black');
  else chessBoard.orientation('white');
});

SOCKET.on('board', board => {
  chessBoard.position(board);
  chessGame.load(board)
  if (chessGame.in_checkmate()) {
    const winner = chessGame.turn() === 'w' ? 'black' : 'white';
    document.getElementById("gameOver").innerHTML = `Game over: ${winner} wins`;
  }
  else if (chessGame.in_draw()) {
    document.getElementById("gameOver").innerHTML = "Game over: draw";
  }
});
