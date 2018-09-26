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

function addUser(name) {
  var playerToAdd;
  // will it be player 1 or player 2?
  database.ref("/players").once("value", function(snapshot) {
    if (!snapshot.child("1").exists()) {
      playerToAdd = 1;
    } else if (!snapshot.child("2").exists()) {
      playerToAdd = 2;
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
      ties: 0
    });
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
    $("#localPlayer").text(currentUser + ", you are player 1");
    $("#turnStatus").text("Waiting for player 2");
    addUser(currentUser);
  });

  database.ref("/players").on("value", function(snapshot) {
    // update player info
    console.log("player 1 is " + snapshot.val()[1].name);
    console.log("player 2 is " + snapshot.val()[2].name);
  });

});