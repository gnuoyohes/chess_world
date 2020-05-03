function createRoom() {

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const roomKey = this.responseText;
      window.location.href = document.URL + roomKey;
    }
  };
  xhttp.open("POST", `${document.URL}create_room`, true);
  xhttp.send();
}

function joinRoom() {
  const roomKey = document.getElementById("roomKey").value;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText == "success") {
        window.location.href = document.URL + roomKey;
      }
      else {
        document.getElementById("error-text").innerHTML = "Room not found";
      }
    }
  };
  xhttp.open("GET", `${document.URL}get_room?roomKey=${roomKey}`, true);
  xhttp.send();
}

// set up handlers
$(document).ready(function () {
  $('#join-game').submit(function (e) {
    e.preventDefault();
    joinRoom();
  });
  $('#create-room').click(function (e) {
    createRoom();
  });
});
