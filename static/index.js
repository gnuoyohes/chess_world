function createRoom() {
  const world = $("#select-world").find(":selected").text();

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const roomKey = this.responseText;
      window.location.href = document.URL + roomKey;
    }
  };
  xhttp.open("POST", `${document.URL}create_room?world=${world}`, true);
  xhttp.send();
}

function joinRoom() {
  const roomKey = $("#room-key").val();

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText == "success") {
        window.location.href = document.URL + roomKey;
      }
      else {
        $("#error-text").fadeIn(fadeInSpeed);
        $("#room-key").addClass("is-invalid");
      }
    }
  };
  xhttp.open("GET", `${document.URL}get_room?roomKey=${roomKey}`, true);
  xhttp.send();
}

var fadeSpeed = 400;

// set up handlers
$(document).ready(function () {
  $('#join-game').submit(function (e) {
    e.preventDefault();
    joinRoom();
  });
  $('#create-game').click(function (e) {
    $("#create-game-modal").fadeIn(fadeSpeed);
  });
  $('#create-game-modal-close').click(function (e) {
    $("#create-game-modal").fadeOut(fadeSpeed);
  });
  $('#create-game-form').submit(function (e) {
    e.preventDefault();
    createRoom();
  });
  $('.logo').click(function (e) {
    $("#credits-modal").fadeIn(fadeSpeed);
  });
  $('#credits-modal').click(function (e) {
    $("#credits-modal").fadeOut(fadeSpeed);
  });
  $('#credits-modal-close').click(function (e) {
    $("#credits-modal").fadeOut(fadeSpeed);
  });
});
