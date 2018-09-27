// initialize Firebase
var config = {
  apiKey: "AIzaSyB4tq1kGzhERV2pDV4s_yBdsc3_Ir8Uh24",
  authDomain: "rockpaperscissors-9fef3.firebaseapp.com",
  databaseURL: "https://rockpaperscissors-9fef3.firebaseio.com",
  projectId: "rockpaperscissors-9fef3",
  storageBucket: "rockpaperscissors-9fef3.appspot.com",
  messagingSenderId: "334586570997"
};
firebase.initializeApp(config);
var database = firebase.database();
var currentUser;
var playing;
var waiting;
var localPlayer;
resetGame();

function resetGame() {
  database.ref("/turn").set({
    player: 1
  });
  playing = 1;
  waiting = 2;
}

function addUser(name) {
  var playerToAdd;
  // will it be player 1 or player 2?
  database.ref("/players").once("value", function(snapshot) {
    if (!snapshot.child("1").exists()) {
      playerToAdd = 1;
      localPlayer = 1;
    } else if (!snapshot.child("2").exists()) {
      playerToAdd = 2;
      localPlayer = 2;
    } else {
      playerToAdd = 0;
    }
  });
  // add the player to Firebase
  if (playerToAdd != 0) {
    database.ref("/players/" + playerToAdd).set({
      name: name,
      wins: 0,
      losses: 0,
      ties: 0,
      implement: "",
      connected: true
    });
    var ref = database.ref("/players/" + playerToAdd + "/connected");
    ref.onDisconnect().set(false);
    $("#localPlayer").text(currentUser + ", you are player " + playerToAdd);
  }
}

function buttons() {
  var button1 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "ROCK").text("ROCK");
  var button2 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "PAPER").text("PAPER");
  var button3 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "SCISSORS").text("SCISSORS");
  var implementsDiv = $("#implements" + localPlayer).append(button1).append(button2).append(button3);
  $("#player" + localPlayer).append(implementsDiv);
}

function switchTurn() {
  database.ref("/turn").set({
    player: waiting
  });
}

function updatePlayer(snapshot) {
  for (var i = 1; i <= 2; i++) {
      if (snapshot.child(i).exists()) {
      // common to both players
      var displayName = $("<h1>").text(snapshot.val()[i].name);
      var displayStats = $("<h2>").text(snapshot.val()[i].wins + "-" + snapshot.val()[i].losses + "-" + snapshot.val()[i].ties);
      $("#player" + i).html(displayName).append(displayStats);
      // add RPS buttons
      var implementsDiv = $("<div>").attr("id", "implements" + i);
      var implement = snapshot.val()[i].implement;
      if (implement === "") {
        if (i === localPlayer && i === playing) {
          buttons();
        }
      } else {
        $(implementsDiv).text(implement);
      }
      if (i !== localPlayer && !snapshot.val()[i].connected) {
        $("#turnStatus").text("The remote player disconnected.");
        $("#player" + i).html("Waiting for Player " + i);
        database.ref("/players/" + i).remove();
        resetGame();
      }
      $("#player" + i).append(implementsDiv);
    }
  }
}

$(document).ready(function() {
  var input = $("<input>").attr("placeholder", "Enter your name");
  var button = $("<button>").text("Submit");
  $("#localPlayer").append(input).append(button);
  $(button).on("click", function() {
    currentUser = $(input).val().trim();
    $(button).off();
    $("#turnStatus").text("Waiting for player 2");
    addUser(currentUser);
  });

  $(document).on("click", ".implementButton", function() {
    database.ref("/players/" + localPlayer).update({
      implement: this.id
    });
    console.log("#implements" + playing);
    $("#implements" + playing).text(this.innerText);


    if (playing === 1) {
      //
    } else {
      // waiting for #1
      // compare implements -- who won?
      // update scores
      // write message and delay
      //

    }
    switchTurn();

    console.log(this.id);
  })

  database.ref("/players").on("value", function(snapshot) {
    // update player info
    updatePlayer(snapshot);
  });

  database.ref("/turn").on("value", function(snapshot) {
    // switch turn
    playing = snapshot.val().player;
    waiting = (playing === 1) ? 2 : 1;
    $("#player" + waiting).css("border-color", "gray");
    $("#player" + playing).css("border-color", "yellow");
    buttons();
  })

});