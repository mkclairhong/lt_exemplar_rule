define([
  "js/RocketGame"
], function(
  RocketGame
) {
  var RocketTest = RocketGame.extend({
    gameType: "rockettest", // type of game used when submitting to determine output directory
    repetitions: 1,
    test: true, //boolean indicating that this is the test

    //Stimuli
    trainingPairs: [
      {a: 3, b: 6},
      {a: 3, b: 7},
      {a: 3, b: 8},
      {a: 3, b: 9},
      {a: 7, b: 2},
      {a: 7, b: 3},
      {a: 7, b: 4},
      {a: 7, b: 5},
      {a: 4, b: 5},
      {a: 4, b: 6},
      {a: 4, b: 7},
      {a: 4, b: 8},
      {a: 8, b: 1},
      {a: 8, b: 2},
      {a: 8, b: 3},
      {a: 8, b: 4},
    ], // pairs of training values

    extraPairs: [
      {a: 2, b: 3},
      {a: 2, b: 4},
      {a: 2, b: 5},
      {a: 2, b: 6},
      {a: 6, b: 7},
      {a: 6, b: 8},
      {a: 6, b: 9},
      {a: 6, b: 10},
      ], // pairs of extra values

    drawInstructions(){
      if (this.instructSlide == 1){
        this.drawSky();
        var layer = this._layeredCanvas.getLayer("interfaceLayer");
        var ctx = layer.getContext();
        ctx.font = this.fbFont;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("Good job learning about the rocket.", this.instructionX, this.HEIGHT*.1);
        ctx.fillText("Now we want to see how well you learned.", this.instructionX, this.HEIGHT*.15);
        ctx.fillText("In this part of the game we will ask you some more questions about the rocket.", this.instructionX, this.HEIGHT*.2);
        ctx.fillText("This time, though, we won’t tell you whether you got the answers right or wrong. OK?", this.instructionX, this.HEIGHT*.25);
        ctx.fillText("Try to use what you just learned about the rocket to answer these next questions.", this.instructionX, this.HEIGHT*.35);
        this.moveOnButton.setEnabled();
        this.moveOnButton.draw(ctx);
      } else {
        var layer = this._layeredCanvas.getLayer("interfaceLayer");
        var ctx = layer.getContext();
        this.moveOnButton.setDisabled();
        this.moveOnButton.draw(ctx);
        layer.setDirty();
        layer.clear();
        this.experimentBegin();
      }
    },

    drawFeedback: function(){
		},

    animateRocket: function(){
      this.drawFeedback();
      this.writeData();
      this.drawNextTrialButton();
      this.trialIndex++;
    },

    drawNextTrialButton: function(){
			var layer = this._layeredCanvas.getLayer("interfaceLayer");
			var ctx = layer.getContext();
			this.nextTrialButton.setEnabled();
			this.nextTrialButton.draw(ctx);
		},
});
	return RocketTest;
})