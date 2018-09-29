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

// global variables
var localPlayer = 0;
var playing = 1;
var waiting = 2;

$(document).ready(function() {

  var input = $("<input>").attr("placeholder", "Enter your name");
  var button = $("<button>").text("Submit");
  $("#localPlayer").append(input).append(button);

  // listen for player name submit
  $(button).on("click", function() {
    $(button).off();
    var name = $(input).val().trim();
    var turn;

    // will it be player 1 or player 2?
    database.ref("/players").once("value", function(snapshot) {
      if (!snapshot.child("1").exists()) {
        localPlayer = 1;
        turn = true;
      } else if (!snapshot.child("2").exists()) {
        localPlayer = 2;
        turn = false;
      }

      // add the player to Firebase
      if (localPlayer !== 0) {
        database.ref("/players/" + localPlayer).set({
          name: name,
          wins: 0,
          losses: 0,
          ties: 0,
          implement: "",
          turn: turn,
          connected: true
        });

        // handle disconnect
        var ref = database.ref("/players/" + localPlayer + "/connected");
        ref.onDisconnect().set(false);

        // update UI
        $("#localPlayer").text(name + ", you are player " + localPlayer);
      }
    });
  });

  database.ref("/players").on("value", function(snapshot) {

    console.log("local player is " + localPlayer + " and playing is " + playing);

    // if both players have played, check who won
    if (snapshot.child(1).exists() && snapshot.child(2).exists() && snapshot.val()[1].implement !== "" && snapshot.val()[2].implement !== "") {
      var message;
      var statsPlayer1;
      var statsPlayer2;
      database.ref("/players").once("value", function(snapshot) {
        var player1 = snapshot.val()[1].implement;
        var player2 = snapshot.val()[2].implement;
        statsPlayer1 = [snapshot.val()[1].wins, snapshot.val()[1].losses, snapshot.val()[1].ties];
        statsPlayer2 = [snapshot.val()[2].wins, snapshot.val()[2].losses, snapshot.val()[2].ties];
        if (player1 === "ROCK" && player2 === "SCISSORS" || player1 === "PAPER" && player2 === "ROCK" || player1 === "SCISSORS" && player2 === "PAPER") {
          message = "player 1 wins!";
          statsPlayer1[0]++;
          statsPlayer2[1]++;
        } else if (player1 === "SCISSORS" && player2 === "ROCK" || player1 === "ROCK" && player2 === "PAPER" || player1 === "PAPER" && player2 === "SCISSORS") {
          message = "player 2 wins!";
          statsPlayer1[1]++;
          statsPlayer2[0]++;
        } else {
          message = "tie game!";
          statsPlayer1[2]++;
          statsPlayer2[2]++;
        }
      });
      $("#info").text(message);
      setTimeout(function() {
        $("#info").text("");
        // then clear implements
        database.ref("/players/1").update({
          implement: "",
          wins: statsPlayer1[0],
          losses: statsPlayer1[1],
          ties: statsPlayer1[2]
        });
        database.ref("/players/2").update({
          implement: "",
          wins: statsPlayer2[0],
          losses: statsPlayer2[1],
          ties: statsPlayer2[2]
        });
      }, 5000);
    }

    // build the page
    for (var i = 1; i <= 2; i++) {
      if (snapshot.child(i).exists()) {
        // common to both players

        // calculate turn
        if (snapshot.val()[i].turn) {
          playing = i;
        } else {
          waiting = i;
        }

        var displayName = $("<h1>").text(snapshot.val()[i].name);
        var displayStats = $("<h2>").text(snapshot.val()[i].wins + "-" + snapshot.val()[i].losses + "-" + snapshot.val()[i].ties);
        $("#player" + i).html(displayName).append(displayStats);
        var implementsDiv = $("<div>").attr("id", "implements" + i);
        var implement = snapshot.val()[i].implement;

        // show buttons or implement on local player
        if (i === localPlayer) {
          if (i === playing) {
            // if no implement, show buttons
            if (implement === "") {
              var button1 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "ROCK").text("ROCK");
              var button2 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "PAPER").text("PAPER");
              var button3 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "SCISSORS").text("SCISSORS");
              $(implementsDiv).append(button1).append(button2).append(button3);
            } else {
              // else show implement
              $(implementsDiv).text(implement);
            }
            
          } else {
            // what to show in opponent (non localPlayer) box?
          }
        }
        $("#player" + i).append(implementsDiv);

        // remove remote player on disconnect
        if (i !== localPlayer && !snapshot.val()[i].connected) {
          $("#turnStatus").text("The remote player disconnected.");
          $("#player" + i).html("Waiting for Player " + i);
          database.ref("/players/" + i).remove();
        }
      }
    }

    // indicate turn
    $("#player" + playing).css("border-color", "yellow");
    $("#player" + waiting).css("border-color", "gray");

  });

  // listen for implement click
  $(document).on("click", ".implementButton", function() {
    playing = [waiting, waiting = playing][0];

    database.ref("/players/" + localPlayer).update({
      implement: this.id,
      turn: false
    });
    database.ref("players/" + playing).update({
      turn: true
    });
  });

});