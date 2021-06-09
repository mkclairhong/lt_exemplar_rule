define([
  "js/SecretCode"
], function(
  SecretCode
) {
  var SecretCodeB = SecretCode.extend({
    gameType: "secretcodeB",
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
    	return SecretCodeB;
  })
