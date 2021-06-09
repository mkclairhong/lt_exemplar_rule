define([
  "js/RocketGame"
], function(
  RocketGame
) {
  var RocketGameB = RocketGame.extend({
    gameType: "rocketgameB",
    //Stimuli
    trainingPairs: [
      {a: 4, b: 5},
      {a: 4, b: 6},
      {a: 4, b: 7},
      {a: 4, b: 8},
      {a: 8, b: 1},
      {a: 8, b: 2},
      {a: 8, b: 3},
      {a: 8, b: 4},
    ], // pairs of training values

    });
    	return RocketGameB;
  })
