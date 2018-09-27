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
var whoseTurn = 1;
var localPlayer;

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
  var turn = false;
  if (playerToAdd === 1) {
    turn = true;
  }
  if (playerToAdd != 0) {
    database.ref("/players/" + playerToAdd).set({
      name: name,
      wins: 0,
      losses: 0,
      ties: 0,
      implement: "",
      turn: turn,
      connected: true
    });
    var ref = database.ref("/players/" + playerToAdd + "/connected");
    ref.onDisconnect().set(false);
    $("#localPlayer").text(currentUser + ", you are player " + playerToAdd);
  }
}

function updatePlayer(snapshot) {
  for (var i = 1; i <= 2; i++) {
    if (snapshot.child(i).exists()) {
      // common to both players
      var displayName = $("<h1>").text(snapshot.val()[i].name);
      var displayStats = $("<h2>").text(snapshot.val()[i].wins + "-" + snapshot.val()[i].losses + "-" + snapshot.val()[i].ties);
      $("#player" + i).html(displayName).append(displayStats);

      // local player only
      if (i === localPlayer && snapshot.val()[i].turn) {
        var button1 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "rock").text("ROCK");
        var button2 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "paper").text("PAPER");
        var button3 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "scissors").text("SCISSORS");
        $("#player" + i).append(button1).append(button2).append(button3);
        // if (snapshot.val()[i].turn) {
        //   $("#turnStatus").text("It's your turn!");
        // } else {
        //   $("#turnStatus").text("Waiting for your opponent.");
        // }
      } else {
        // remote player disconnected
        if (!snapshot.val()[i].connected) {
          $("#turnStatus").text("The remote player disconnected.");
          $("#player" + i).html("Waiting for Player " + i);
          database.ref("/players/" + i).remove();

        }
      }
    }
  }
}

function switchTurn() {
  if (whoseTurn === 1) {
    database.ref("/players/1").update({
      turn: false
    });
    database.ref("/players/2").update({
      turn: true
    });
    $("#player1").css("border-color", "gray");
    $("#player2").css("border-color", "yellow");
  } else {
    database.ref("/players/1").update({
      turn: true
    });
    database.ref("/players/2").update({
      turn: false
    });
    $("#player1").css("border-color", "yellow");
    $("#player2").css("border-color", "gray");
  }
  if (whoseTurn === 1) {
    whoseTurn = 2;
  } else {
    whoseTurn = 1;
  }
}

$(document).ready(function() {
  var input = $("<input>").attr("placeholder", "Enter your name");
  var button = $("<button>").text("Submit");
  $("#localPlayer").append(input).append(button);
  $(button).on("click", function() {
    currentUser = $(input).val().trim();
    $(button).off();
    console.log("current user is " + currentUser);
    $("#turnStatus").text("Waiting for player 2");
    addUser(currentUser);
  });

  $(document).on("click", ".implementButton", function() {
    database.ref("/players/" + localPlayer).update({
      implement: this.id
    });
    if (whoseTurn === 1) {
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

});