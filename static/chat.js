// borrowed from https://github.com/socketio/socket.io/tree/master/examples/chat

var typing = false;

// Initialize variables
var $window = $(window);
var $messages = $('.messages'); // Messages area
var $inputMessage = $('.input-message'); // Input message input box

const addParticipantsMessage = (data) => {
  var message = '';
  if (data.numUsers === 1) {
    message += "there's 1 participant";
  } else {
    message += "there are " + data.numUsers + " participants";
  }
  log(message);
}

// Sends a chat message
const sendMessage = () => {
  var message = $inputMessage.val();
  // Prevent markup from being injected into the message
  message = CLEANINPUT(message);
  // if there is a non-empty message
  if (message) {
    $inputMessage.val('');
    SOCKET.emit('message_in', { name: NAME, roomKey: ROOMKEY, message: message });
  }
}

// Log a message
  const log = (message, options) => {
  var $el = $('<li>').addClass('log').html(message);
  addMessageElement($el, options);
}

// Adds the visual chat message to the message list
const addChatMessage = (data, options) => {
  options = options || {};

  var $usernameDiv = $('<span class="username"/>')
    .html(data.username)
    .css('color', GETNAMECOLOR(data.username));
  var $messageBodyDiv = $('<span class="messageBody"/>')
    .html(data.message);

  var $messageDiv = $('<li class="message"/>')
    .data('username', data.username)
    .append($usernameDiv, $messageBodyDiv);

  addMessageElement($messageDiv, options);
}

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
//   all other messages (default = false)
const addMessageElement = (el, options) => {
  var $el = $(el);

  // Setup default options
  if (!options) {
    options = {};
  }
  if (typeof options.fade === 'undefined') {
    options.fade = true;
  }
  if (typeof options.prepend === 'undefined') {
    options.prepend = false;
  }

  // Apply options
  if (options.fade) {
    $el.hide().fadeIn(FADE_TIME);
  }
  if (options.prepend) {
    $messages.prepend($el);
  } else {
    $messages.append($el);
  }
  $messages[0].scrollTop = $messages[0].scrollHeight;
}

// Keyboard events

$window.keydown(event => {
  // When the client hits ENTER on their keyboard
  if (event.which === 13 || event.keyCode === 13) {
    sendMessage();
  }
});

// Click events

$inputMessage.focusin(() => {
  typing = true;
});
$inputMessage.focusout(() => {
  typing = false;
});


// Socket events

// Whenever the server emits 'new message', update the chat body
SOCKET.on('message_out', (data) => {
  addChatMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
SOCKET.on('user_joined', (data) => {
  log(data.username + ' joined');
  addParticipantsMessage(data);
});

// Whenever the server emits 'user left', log it in the chat body
SOCKET.on('user_left', (data) => {
  log(data.username + ' left');
  addParticipantsMessage(data);
});
