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
database.ref("/chat").remove();

// global variables
var localPlayer = 0;
var playing = 1;
var waiting = 2;

$(document).ready(function() {
  
  var input = $("<input>").attr("placeholder", "Enter your name");
  var button = $("<button>").text("Submit");
  $("#status").append(input).append(button);

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
        $("#status").text(name + ", you are player " + localPlayer);
      }
    });
  });

  database.ref("/players").on("value", function(snapshot) {

    // check turn
    if (snapshot.child(1).exists() && snapshot.child(2).exists()) {
      if (snapshot.val()[1].turn) {
        playing = 1;
        waiting = 2;
      } else {
        playing = 2;
        waiting = 1;
      }
      if (localPlayer === playing) {
        $("#status").text(snapshot.val()[playing].name + ", it's your turn");
      } else {
        $("#status").text("Waiting for " + snapshot.val()[playing].name);
      }
    }

    var statsPlayer1;
    var statsPlayer2;
    var gameOver = false;

    // if both players have played, check who won
    if (snapshot.child(1).exists() && snapshot.child(2).exists() && snapshot.val()[1].implement !== "" && snapshot.val()[2].implement !== "") {
      gameOver = true;
      var message;
      database.ref("/players").once("value", function(snapshot) {
        var player1 = snapshot.val()[1].implement;
        var player2 = snapshot.val()[2].implement;
        statsPlayer1 = [snapshot.val()[1].wins, snapshot.val()[1].losses, snapshot.val()[1].ties];
        statsPlayer2 = [snapshot.val()[2].wins, snapshot.val()[2].losses, snapshot.val()[2].ties];
        if (player1 === "ROCK" && player2 === "SCISSORS" || player1 === "PAPER" && player2 === "ROCK" || player1 === "SCISSORS" && player2 === "PAPER") {
          message = snapshot.val()[1].name + " wins!";
          statsPlayer1[0]++;
          statsPlayer2[1]++;
        } else if (player1 === "SCISSORS" && player2 === "ROCK" || player1 === "ROCK" && player2 === "PAPER" || player1 === "PAPER" && player2 === "SCISSORS") {
          message = snapshot.val()[2].name + " wins!";
          statsPlayer1[1]++;
          statsPlayer2[0]++;
        } else {
          message = "tie!";
          statsPlayer1[2]++;
          statsPlayer2[2]++;
        }
      });
      $("#status").text("");
      $("#info").text(message);
    }

    // build the page
    for (var i = 1; i <= 2; i++) {
      $("#implement" + i).text("");
      if (snapshot.child(i).exists()) {

        // common to both players
        $("#name" + i).text(snapshot.val()[i].name);
        $("#stats" + i).text(snapshot.val()[i].wins + "-" + snapshot.val()[i].losses + "-" + snapshot.val()[i].ties);
        var implement = snapshot.val()[i].implement;

        // show buttons or implement on local player
        if (i === localPlayer) {
          if (implement !== "") {
            $("#implement" + i).text(implement);
          } else {
            if (i === playing) {
              var button1 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "ROCK").text("ROCK");
              var button2 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "PAPER").text("PAPER");
              var button3 = $("<button>").addClass("btn btn-primary implementButton").attr("id", "SCISSORS").text("SCISSORS");
              $("#implement" + i).html(button1).append(button2).append(button3);
            }
          }
        }

        // remove remote player on disconnect
        if (i !== localPlayer && !snapshot.val()[i].connected) {
          if (snapshot.child(localPlayer).exists()) {
            $("#status").text("The remote player has disconnected.");
          }
          database.ref("/players/" + i).remove();
          database.ref("/chat").remove();
        }
      }
    }

    if (gameOver) {
      $("#implement1").text(snapshot.val()[1].implement);
      $("#implement2").text(snapshot.val()[2].implement);
      console.log("snapshot 2 is " + snapshot.val()[2].implement);
      setTimeout(function() {
        $("#info").text("");
        // clear implements, update scores and turn
        database.ref("/players/1").update({
          implement: "",
          wins: statsPlayer1[0],
          losses: statsPlayer1[1],
          ties: statsPlayer1[2],
          turn: true
        });
        database.ref("/players/2").update({
          implement: "",
          wins: statsPlayer2[0],
          losses: statsPlayer2[1],
          ties: statsPlayer2[2],
          turn: false
        });
      }, 5000);
    }

    // indicate turn
    $("#player" + playing).css("border-color", "yellow");
    $("#player" + waiting).css("border-color", "gray");

  });

  // listen for implement click
  $(document).on("click", ".implementButton", function() {
    database.ref("/players/" + localPlayer).update({
      implement: this.id,
      turn: false
    });
    database.ref("players/" + playing).update({
      turn: true
    });
  });

  // listen for chat button click
  $(document).on("click", "#chatButton", function() {
    var chatMessage = $("#name" + localPlayer).text() + ": " + $("#chatInput").val();
    database.ref("/chat").push({
      chat: chatMessage
    });
    $("#chatInput").text("");
  });

  // listen for chat update
  database.ref("/chat").on("child_added", function(snapshot) {
    $("#chatInput").val("");
    $("#chatOutput").append(snapshot.val().chat + "\n");
    $("#chatOutput").scrollTop($("#chatOutput")[0].scrollHeight);
  });

});