// https://github.com/jhlywa/chess.js

var chessBoard = null;
var chessGame = new Chess();
var isWhite = false;
var isBlack = false;
var recentMove = '';
var gameOver = false;
var promotionPiece = 'q';


function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '');
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square);

  var background = WHITESQUAREGREY;
  if ($square.hasClass('black-3c85d')) {
    background = BLACKSQUAREGREY;
  }

  $square.css('background', background);
}

function onDragStart (source, piece) {
  // do not pick up pieces if the game is over
  if (gameOver) return false;

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

  var moveCfg = {
    from: source,
    to: target,
    promotion: promotionPiece
  };

  // see if the move is legal
  var move = chessGame.move(moveCfg);

  // illegal move
  if (move === null) {
    return 'snapback';
  }
  else {
    recentMove = `${source}${target}`;
    console.log(move);

    // check for promotion
    if (move.flags.includes('p')) {
         recentMove += promotionPiece;
    }
  }
}

function onMouseoverSquare (square, piece) {
  if (gameOver) return;

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
  console.log(recentMove);
  if (recentMove !== '') {
    SOCKET.emit('update_board', { roomKey: ROOMKEY, move: recentMove });
    recentMove = '';
  }
  else return false;
}

function checkForGameOver () {
  if (chessGame.in_checkmate()) {
    gameOver = true;
    const winner = chessGame.turn() === 'w' ? 'black' : 'white';
    $("#gameOver").html(`Game over: ${winner} wins`);
    $("#gameOver").show();
  }
  else if (chessGame.in_draw()) {
    gameOver = true;
    $("#gameOver").html("Game over: draw");
    $("#gameOver").show();
  }
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

// const promotionTip = $('#promotion-tip');
//
// tippy('#myBoard', {
//   content: promotionTip.html(),
//   allowHTML: true,
//   interactive: true
// });


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
  $("#white").html(info.white);
  $("#black").html(info.black);

  if (isBlack) chessBoard.orientation('black');
  else chessBoard.orientation('white');
});

SOCKET.on('init_board', board_fen => {
  console.log(board_fen);
  chessBoard.position(board_fen);
  chessGame.load(board_fen);
  addChessboard(board_fen);
  checkForGameOver();
});

SOCKET.on('board', board_fen => {
  console.log(board_fen);
  chessBoard.position(board_fen);
  chessGame.load(board_fen);
  checkForGameOver();
});

SOCKET.on('move', move => {
  // move 3D piece
  const source = move.substring(0, 2);
  const target = move.substring(2, 4);
  var promote = '';
  if (move.length > 4) promote = move.charAt(4);
  movePiece(source, target, promote);
});

SOCKET.on('draw', () => {
  gameOver = true;
  $("#gameOver").html("Game over: draw");
});
