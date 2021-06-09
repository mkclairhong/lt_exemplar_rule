define([
  "js/RocketGame",
  "Planet"
], function(
  RocketGame,
  Planet
) {
  var SecretCode = RocketGame.extend({
    gameType: "secretcode", // type of game used when submitting to determine output directory
    numberFont: "40px arial", // font for problem values
    fbTime: 0, // time between rocket landing and feedback appearing

    init: function() {
      this._super();
      this.planet1X = this.WIDTH*.33;
      this.planet1Y = this.HEIGHT*.4;
    },

    setup: function() {
      this._super();
      this.submitButton.x = this.WIDTH*.8;
      this.submitButton.y = this.HEIGHT*.6;
      this.moveOnButton.x = this.WIDTH*.75;
			this.moveOnButton.y = this.HEIGHT*.8;
      this.tryAgainButton.x = this.WIDTH*.65;
			this.tryAgainButton.y = this.HEIGHT*.8;
      this.rocketStartX = this.WIDTH*.1;
			this.rocketPos = {x: this.rocketStartX, y: this.planet1Y + this.planetGap*3};
    },

    experimentBegin: function() {
      if (this.instructSlide == 1){
        this.createPlanets();
        this.setup();
				this.drawInstructions();
        console.log("instruct");
			} else {
        this.instructSlide = 99;
				this.guessAllowed = true;
				this.numbers = false;
        this.shufflePairs();
  			this.getTrial();
  			this.drawSky();
        this.drawPlanets();
        this.drawThinkingAlien();
        this.drawProblem();
  			this.gameTimer.start();
  			this.trialTimer.start();
      }
    },

    // create array of planets
		createPlanets: function() {
      // Create array for planet locations - full rectangle array
      let rows = 5,
          cols = 7;
          rowY = 0;
      let planetFullArray = [];

      let getFilledArray = (length, val) => {
        let newArr = [];
        val = val || null;
        for (let i = 0; i < length; i++) {
          newArr.push({x: this.planet1X + this.planetGap*i, y: this.planet1Y + rowY});
        }
        return newArr;
      };

      for (let i = 0; i < rows; i++) {
        planetFullArray.push(getFilledArray(cols));
        rowY = rowY + this.planetGap;
      }

      // Create array for planet locations - tree formation
      let planetTreeArray = [
        planetFullArray[0][3],
        planetFullArray[1][2],
        planetFullArray[1][3],
        planetFullArray[1][4],
        planetFullArray[2][1],
        planetFullArray[2][2],
        planetFullArray[2][3],
        planetFullArray[2][4],
        planetFullArray[2][5],
        planetFullArray[3][0],
        planetFullArray[3][1],
        planetFullArray[3][2],
        planetFullArray[3][3],
        planetFullArray[3][4],
        planetFullArray[3][5],
        planetFullArray[3][6],
        planetFullArray[4][3],
      ]

			for (var i = 0; i < this.NUMPLANETS; i++) {
				// Get the name of the planet based upon our nameCode array (will break if go to 3 digits)
				var numCode0 = Math.floor(i/this.base);
				var numCode1 = i%this.base;
				var planetName = this.nameCode[numCode0] + this.nameCode[numCode1];
				// add planets to the array
				this.planets.push(new Planet({
					x: planetTreeArray[i].x,
					y: planetTreeArray[i].y,
					w: this.planetR*2,
					h: this.planetR*2,
					name: planetName,
					gameController: this
				}));
        //planetLocations[2][1] = "some value";
			}
		},

    animateRocket: function(){
      if (this.instructSlide == 99) {
        this.drawFeedback();
        this.writeData();
        this.drawNextTrialButton();
        this.trialIndex++;
        this.overallTrial++;
      } else {
        var d = this.tickTimer.get();
        if (d >= this.TICK_TIME) {
          this.tickTimer.start();

  				if (this.rocketPos.x < this.rocketTargetX) {
  					if (!this.moving){
  						this.thrustersSound.play();
  						this.moving = true;
  					}
  					var distanceLeft = this.rocketTargetX - this.rocketPos.x,
  							v;
  					if (distanceLeft <= this.ROCKET_DECELERATION_THRESHOLD) {
  						// Decelerate the rocket when close to the planet
  						v = this.ROCKET_VX*(distanceLeft/this.ROCKET_DECELERATION_THRESHOLD);
  					} else {
  						v = this.ROCKET_VX;
  					}
  					var dx = Math.ceil((d/1000)*v);
  					this.rocketPos.x = Math.min(this.rocketPos.x + dx, this.rocketTargetX);
  	      	this.drawRocket(this.rocketPos.x, this.rocketPos.y);
  					this.drawFuel(this.rocketPos.x, this.rocketPos.y);
  					this.drawFlame(this.rocketPos.x - this.flame.w, this.rocketPos.y);
  					if (this.rocketPos.x >= this.rocketTargetX) {
  						this.thrustersSound.stop();
  						this.moving = false;
              return;
            }
          }
        }
        requestAnimationFrame(this.animateRocket.bind(this));
        var layer = this._layeredCanvas.getLayer("interfaceLayer");
        var ctx = layer.getContext();
        this.tryAgainButton.setEnabled();
        this.tryAgainButton.draw(ctx);
        this.moveOnButton.setEnabled();
        this.moveOnButton.draw(ctx);
      }
    },

    drawCorrect: function() {
      this.correctSound.play();

			var layer = this._layeredCanvas.getLayer("feedbackLayer");
			var ctx = layer.getContext();
			ctx.font = this.fbFont;
			ctx.fillStyle = "darkBlue";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Right!", this.WIDTH*.5, this.HEIGHT*.15);
      ctx.fillText("You guessed "+this.currentGuess+", the correct answer is "+this.labelAns, this.WIDTH*.5, this.HEIGHT*.2);

			var happyAlien = new Image();
			happyAlien.src = "img/Smiley_green_alien_lipbite.svg"
			happyAlien.onload = function() {
				ctx.drawImage(happyAlien, this.alien.x, this.alien.y, this.alien.w, this.alien.h);
			}.bind(this);

      this.drawAnswer();
		},

		drawIncorrect: function() {
      this.incorrectSound.play();

			var layer = this._layeredCanvas.getLayer("feedbackLayer");
			var ctx = layer.getContext();
			ctx.font = this.fbFont;
			ctx.fillStyle = "red";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Wrong", this.WIDTH*.5, this.HEIGHT*.15);
      ctx.fillText("You guessed "+this.currentGuess+", the correct answer is "+this.labelAns, this.WIDTH*.5, this.HEIGHT*.2);

			var sadAlien = new Image();
			sadAlien.src = "img/Smiley_green_alien_depresive.svg"
			sadAlien.onload = function() {
				ctx.drawImage(sadAlien, this.alien.x, this.alien.y, this.alien.w, this.alien.h);
			}.bind(this);

      this.drawAnswer();
		},

  checkIfEnd: function() {
      if (this.test && this.extraTrials){
				if (this.trialIndex == this.extraPairs.length) {
					this.experimentEnd();
					return;
				}
			}
      if (this.trialIndex == this.trainingPairs.length && this.round == this.repetitions && !this.test) { // end game if each training pair has been repeated "repetition" number of times
        this.experimentEnd();
        return;
				} else {
					if (this.trialIndex == this.trainingPairs.length) { // increase round counter and shuffle pairs if each has been shown this round
            if (this.test){
  						this.shuffleExtraPairs();
  						this.extraTrials = true;
  					} else {
  						this.shufflePairs();
  					}
  					this.round++;
  					this.trialIndex = 0;
  				}
					var layer = this._layeredCanvas.getLayer("planetClickLayer");
					layer.setDirty();
		      layer.clear();

					var layer = this._layeredCanvas.getLayer("interfaceLayer");
					var ctx = layer.getContext();
					this.nextTrialButton.setDisabled();
					this.nextTrialButton.draw(ctx);

					var layer = this._layeredCanvas.getLayer("feedbackLayer");
					layer.setDirty();
					layer.clear();

					this.getTrial();
					this.drawProblem();
          this.drawThinkingAlien();
				}
		},
    drawProblem: function(){
      if (this.instructSlide < 4){
        this.labelA = 7;
        this.labelB = 3;
      } else if (this.instructSlide ==4){
        this.labelA = "DS";
        this.labelB = "DY";
      }
      var layer = this._layeredCanvas.getLayer("interfaceLayer");
      var ctx = layer.getContext();
      layer.setDirty();
      layer.clear();
      ctx.font = this.numberFont;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(this.labelA + " + " + this.labelB + " = ?", this.WIDTH*.5, this.HEIGHT*.33);
    },

    drawAnswer: function(){
      var layer = this._layeredCanvas.getLayer("interfaceLayer");
      var ctx = layer.getContext();
      layer.setDirty();
      layer.clear();
      ctx.font = this.numberFont;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(this.labelA + " + " + this.labelB + " = " + this.labelAns, this.WIDTH*.5, this.HEIGHT*.33);
    },

    drawInstructions: function(){
			var layer = this._layeredCanvas.getLayer("planetLayer");
      var ctx = layer.getContext();
			layer.setDirty();
			layer.clear();

			var layer = this._layeredCanvas.getLayer("fuelLayer");
			var ctx = layer.getContext();
			layer.setDirty();
			layer.clear();

      var layer = this._layeredCanvas.getLayer("rocketLayer");
			var ctx = layer.getContext();
			layer.setDirty();
			layer.clear();

			var layer = this._layeredCanvas.getLayer("interfaceLayer");
			var ctx = layer.getContext();
			layer.setDirty();
			layer.clear();
      if (this.instructSlide == 1){ // included to skip the practice phase from rocket game
        this.instructSlide++;
        this.drawInstructions();
      } else if (this.instructSlide == 2){
        var layer = this._layeredCanvas.getLayer("interfaceLayer");
  			var ctx = layer.getContext();
        ctx.font = this.fbFont;
				ctx.fillStyle = "black";
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillText("In this game we are going to ask you to learn about a rocket.", this.instructionX, this.HEIGHT*.1);
				ctx.fillText("For example, we may show you a rocket that has a certain amount of fuel in each engine.", this.instructionX, this.HEIGHT*.15);
				ctx.fillText("Here is a rocket with 7 levels of fuel in one engine, and 3 in the other.", this.instructionX, this.HEIGHT*.2);
				ctx.fillText("Your job will be to tell us where the rocket will land. You can practice here.", this.instructionX, this.HEIGHT*.25);
				ctx.fillText("Do you have any questions?", this.instructionX, this.HEIGHT*.35);
				ctx.fillText("If not, press 'Move On' to see the rocket game.", this.instructionX, this.HEIGHT*.4);

				this.rocketPos.x = this.rocketStartX;
        this.guessAllowed = true;
        this.drawSky();
				this.drawRocket(this.rocketPos.x, this.rocketPos.y);
				this.drawFuel(this.rocketPos.x, this.rocketPos.y);
        this.hidePlanets();
				this.drawPracticePlanets();
			} else if (this.instructSlide == 3){
        this.guessAllowed = false;
        this.blank = true;
        this.drawProblem();

				var layer = this._layeredCanvas.getLayer("interfaceLayer");
				var ctx = layer.getContext();
				this.moveOnButton.setEnabled();
				this.moveOnButton.draw(ctx);
        ctx.font = this.fbFont;
				ctx.fillStyle = "black";
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillText("In this part of the game you will learn about the rocket in terms of encoded guidance equations (math problems). ", this.instructionX, this.HEIGHT*.1);
				ctx.fillText("In this unencoded example, we know that there are 7 levels of fuel in one engine and 3 levels of fuel in the other engine.", this.instructionX, this.HEIGHT*.15);
				ctx.fillText("Your job is to tell us where the rocket will land (in this case, 10).", this.instructionX, this.HEIGHT*.2);
				ctx.fillText("Do you have any questions?", this.instructionX, this.HEIGHT*.3);
				ctx.fillText("If not, press 'Move On' to start playing.", this.instructionX, this.HEIGHT*.35);
      } else if (this.instructSlide == 4){
        this.blank = false;
        this.numbers = false;
        this.drawProblem();
        this.drawPlanets();
        var layer = this._layeredCanvas.getLayer("interfaceLayer");
				var ctx = layer.getContext();
        ctx.font = this.fbFont;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("Here is what the real rocket game looks like.", this.instructionX, this.HEIGHT*.1);
				ctx.fillText("Notice that in the real game the numerals have been replaced by letters.", this.instructionX, this.HEIGHT*.15);
				ctx.fillText("The letters map on to numeric quantities but that mapping is not trivial to figure out.", this.instructionX, this.HEIGHT*.2);
			  ctx.fillText("Do you have any questions?", this.instructionX, this.HEIGHT*.3);
        ctx.fillText("If not, press 'Move On' to start playing.", this.instructionX, this.HEIGHT*.35);
        this.moveOnButton.setEnabled();
				this.moveOnButton.draw(ctx);
			} else {
				this.experimentBegin();
			}
		},
});
	return SecretCode;
})
