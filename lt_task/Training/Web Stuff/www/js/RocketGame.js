define([
	"Class",
	"Planet",
	"pwbscript/CanvasLayer",
	"pwbscript/CanvasButton",
	"pwbscript/CanvasObjectManager",
	"pwbscript/LayeredCanvas",
	"pwbscript/Rectangle",
	"pwbscript/Sound",
	"pwbscript/Timer",
  "pwbscript/ImageBuffer"
], function(
	Class,
	Planet,
	CanvasLayer,
	CanvasButton,
	CanvasObjectManager,
	LayeredCanvas,
	Rectangle,
	Sound,
	Timer,
  ImageBuffer
) {

	// create game object
	var RocketGame = Class.extend({
    WIDTH: 1500, //canvas width
		HEIGHT: 725, // canvas height
    gameType: "rocketgame", // type of game used when submitting to determine output directory
		hitSubmit: false, // boolean to keep track of if participant has hit the submit button, if they have don't allow any more changes to their guess
    hitAnswer: false, // boolean to keep track of it participant has choosen an answer, if so, activate submit button
		moving: false, // boolean to keep track of if the rocket is moving
		nextTrialTime: 3000, // time until next trial button pops up,
		fbTime: 250, // time between rocket landing and feedback appearing
		TICK_TIME: 16, // time between animations
		ROCKET_VX: 250, // speed of rocket in px/s
		ROCKET_DECELERATION_THRESHOLD: 200, // pixels before endpoint that rocket begins to decelerate
		ROCKET_DECELERATION_TIME: 1, // time in seconds from start of deceleration to final position
		NUMPLANETS: 17, // number of planets/answer choices
		repetitions: 6, // number of times each training pair is presented
		guessAllowed: false, // boolean to determine if planet highlighting and onClick is allowed
		numbers: true, // boolean to determine if values are displayed as numbers rather than letters
		blank: false, // boolean for when planet labels should be blank
		test: false, // boolean indicating if it's the test phase
		extraTrials: false, // boolean indicating if test is in extra trials

    submitButton: null, // button to submit guess
		fillEngine1Button: null, //button to add fuel to engine 2
		fillEngine2Button: null, //button to add fuel to engine 2
    stimuli: null, // array of the to be estimated numbers
		trialIndex: null, // index of where you are in stimuli array
    overallTrial: null, // number of trials total
		instructSlide: null, // the current instruction slide
		com: null, // canvas object manager
		correct: null, // was the subject's answer correct
  	engine: null, // starting location of engines
    cone: null, // starting location of rocket nose
		alien: null, // position of alien
		planetR: null, // radius of planets
		planet1Y: null, // y-value of first planet
		planet1X: null, // x-value of first planet
		planetGap: null, // gap between planets (center to center)
		rocketPos: null,	// current coords of the rocket
		ansChoices: null, // array of answer choices
		ansFont: null, // font size for answer choices
		nameCode: null, // array of the letters used to name planets
		base: null, // the base # for the numeric system
		rocketTargetX: null, // endpoint of rocket animation
		currentTrial: null, // current pair of numbers
		labelA: null, // letter label for first value
		labelB: null, // letter label for second value
		currentGuess: null, // name of planet clicked on
		vPrev: null, // velocity of the rocket at the previous frame
		round: null, // counter for how many times each pair has been repeated
		filledFuel1: null, // amount of fuel in first tank during practice trials
		filledFuel2: null, // amount of fuel in 2nd tank during practice trials
		practiceTarget: null, // target planet during practice trials
		instructionX: null, // x-coordinate of instruction text


		// Sounds
		thrustersSound: new Sound('/sound/thrusters.wav'),
		correctSound: new Sound('/sound/yay.wav'),
		incorrectSound: new Sound('sound/sad.wav'),

    //Timers
    fbTimer: new Timer(),
    trialTimer: new Timer(),
    gameTimer: new Timer(),
		tickTimer: new Timer(),

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
		], // pairs of training values
		shuffledPairs: null, // shuffled array of training values


    init: function() {
      this.trialIndex = 0;
			this.instructSlide = 1;
      this.overallTrial = 1;
			this.round = 1;
      this.answerChoicesY = this.HEIGHT*.75;
			this.planetR = this.WIDTH*.02;
			this.planet1Y = this.HEIGHT*.5;
			this.planet1X = this.WIDTH*.1;
			this.planetGap = this.WIDTH*.053;
			this.ansFont = "20px arial";
			this.fbFont = "20px arial black"
			this.nameCode = ["D", "G", "J", "M", "P", "S", "V", "Y"];
			this.base = this.nameCode.length;
			this.filledFuel1 = 0;
			this.filledFuel2 = 0;
			this.instructionX = this.WIDTH*.1;
			this.planets = [];

			// sound volumes
			this.correctSound.volume = .1;
			this.incorrectSound.volume = .1;

		  // % of width and height that rocket will occupy
      this.rocketScale = {
        x: .1,
        y: .1};

			// generic planet info - needed for radial gradient
			this.planet = {
				x: 50,
				y: 50};
		},

		// setup elements
		setup: function(){
			// description of rocket engines
      this.engine = {
        w: this.WIDTH*this.rocketScale.x*.5,
        h: this.HEIGHT*this.rocketScale.y*.33};
      this.engine.e1 = {
        x: 0,
        y: 0};
      this.engine.e2 = {
        x: 0,
        y: this.HEIGHT*this.rocketScale.y*.66};

			// description of rocket fuselage
      this.fuselage = {
        x: this.engine.e1.x + this.engine.w/3,
        y: this.engine.e1.y + this.engine.h,
        w: this.engine.w,
        h: this.engine.h};

			// description of rocket nose cone
      this.cone = {};
      this.cone.rect = {
        x: this.fuselage.x + this.fuselage.w,
        y: this.fuselage.y - this.fuselage.h/3,
        w: this.fuselage.w*.2,
        h: this.fuselage.h*1.67};
      this.cone.p1 = {
        x: this.cone.rect.x + this.cone.rect.w,
        y: this.cone.rect.y};
      this.cone.p2 = {
        x: this.cone.rect.x + this.cone.rect.w,
        y: this.cone.rect.y + this.cone.rect.h};
      this.cone.p3 = {
        x: this.cone.rect.x + this.cone.rect.w*2.5,
        y: this.cone.rect.y + ((this.cone.rect.y + this.cone.rect.h) - this.cone.rect.y)/2};

			// starting rocket position for animations
			this.rocketStartX = this.planet1X - this.cone.p3.x
			this.rocketPos = {x: this.rocketStartX, y: this.planet1Y};

			// rocket deceleration
			this.rocketDeceleration = -this.ROCKET_VX/this.ROCKET_DECELERATION_TIME;

			// description of rocket flame
			this.flame = {
				w: this.engine.w*.25,
				h: this.engine.h};
			this.flame.f1 = {
				x: 0,
				y: 0};
			this.flame.f2 = {
				x: 0,
				y: this.engine.e2.y};

			// alien location
			this.alien = {
				x: this.WIDTH*.25,
				y: this.HEIGHT*.2,
				w: 100,
				h: 100};

			// create canvas layers
      this._layeredCanvas = new LayeredCanvas();
			document.body.appendChild(this._layeredCanvas.domNode);

      this._layeredCanvas.addLayer("skyLayer", this.WIDTH, this.HEIGHT, 0, 0, 0);
      this._layeredCanvas.addLayer("planetLayer", this.WIDTH, this.HEIGHT, 0, 0, 1);
			this._layeredCanvas.addLayer("alienLayer", this.WIDTH, this.HEIGHT, 0, 0, 2);
      this._layeredCanvas.addLayer("highlightLayer", this.WIDTH, this.HEIGHT, 0, 0, 3);
			this._layeredCanvas.addLayer("planetClickLayer", this.WIDTH, this.HEIGHT, 0, 0, 4);
			this._layeredCanvas.addLayer("rocketLayer", this.WIDTH, this.HEIGHT, 0, 0, 5);
			this._layeredCanvas.addLayer("fuelLayer", this.WIDTH*this.rocketScale.x, this.HEIGHT*this.rocketScale.y, 0, 0, 6);
			this._layeredCanvas.addLayer("feedbackLayer", this.WIDTH, this.HEIGHT, 0, 0, 7);
			this._layeredCanvas.addLayer("interfaceLayer", this.WIDTH, this.HEIGHT, 0, 0, 8);

			// Create submit button, add some text, and give it a function to fire when the button is clicked
			var layer = this._layeredCanvas.getLayer("interfaceLayer");
			var ctx = layer.getContext();
			this.submitButton = new CanvasButton(0,0);
			var submitText = "Fire Rocket"
			this.submitButton.setText(submitText, ctx);
			this.submitButton.addOnClick(function(evt) {
				if(this.instructSlide == 1){
					var layer = this._layeredCanvas.getLayer("interfaceLayer");
					var ctx = layer.getContext();
					this.fillEngine1Button.setDisabled();
					this.fillEngine1Button.draw(ctx);
					this.fillEngine2Button.setDisabled();
					this.fillEngine2Button.draw(ctx);
				}
				this.hitSubmit = true;
				this.trialTimer.pause();

				var layer = this._layeredCanvas.getLayer("alienLayer");
				layer.setDirty();
				layer.clear();

				var layer = this._layeredCanvas.getLayer("rocketLayer");
				var ctx = layer.getContext();
				this.tickTimer.start();
				this.animateRocket();

				var layer = this._layeredCanvas.getLayer("interfaceLayer");
				var ctx = layer.getContext();
				this.submitButton.setDisabled();
				this.submitButton.draw(ctx);
			}.bind(this));
			this.submitButton.x = this.WIDTH*.5 - this.submitButton.w/2;
			this.submitButton.y = this.HEIGHT*.75;

			// Create next trial button, add some text, and give it a function to fire when the button is clicked
			this.nextTrialButton = new CanvasButton(0,0);
			this.nextTrialButton.setText("Next Trial", ctx);
			this.nextTrialButton.addOnClick(function(evt) {
				this.hitSubmit = false;
				this.trialTimer.start();
				this.checkIfEnd();
			}.bind(this));
			this.nextTrialButton.x = this.WIDTH*.85;
			this.nextTrialButton.y = this.HEIGHT*.1;

			// Create fill engine buttons, add some text, and give it a function to fire when the button is clicked
			this.fillEngine1Button = new CanvasButton(0,0);
			this.fillEngine1Button.setText("Fill Engine 1", ctx);
			this.fillEngine1Button.addOnClick(function(evt) {
				if (this.filledFuel1 == 8){
					return;
				}
				this.filledFuel1++;
				var layer = this._layeredCanvas.getLayer("fuelLayer");
				var ctx = layer.getContext();
				layer.setDirty();
				layer.clear();
				this.drawFuel(this.rocketPos.x, this.rocketPos.y);
			}.bind(this));
			this.fillEngine1Button.x = this.WIDTH*.05;
			this.fillEngine1Button.y = this.HEIGHT*.4;

			this.fillEngine2Button = new CanvasButton(0,0);
			this.fillEngine2Button.setText("Fill Engine 2", ctx);
			this.fillEngine2Button.addOnClick(function(evt) {
				if (this.filledFuel2 == 8){
					return;
				}
				this.filledFuel2++;
				var layer = this._layeredCanvas.getLayer("fuelLayer");
				var ctx = layer.getContext();
				layer.setDirty();
				layer.clear();
				this.drawFuel(this.rocketPos.x, this.rocketPos.y);
			}.bind(this));
			this.fillEngine2Button.x = this.WIDTH*.05;
			this.fillEngine2Button.y = this.HEIGHT*.65;

			// create try again button to do anouther trial during practice round
			this.tryAgainButton = new CanvasButton(0,0);
			this.tryAgainButton.setText("Try Again", ctx);
			this.tryAgainButton.addOnClick(function(evt) {
				this.hitSubmit = false;

				var layer = this._layeredCanvas.getLayer("interfaceLayer");
				var ctx = layer.getContext();
				this.tryAgainButton.setDisabled();
				this.tryAgainButton.draw(ctx);
				this.moveOnButton.setDisabled();
				this.moveOnButton.draw(ctx);
				var layer = this._layeredCanvas.getLayer("planetClickLayer");
				var ctx = layer.getContext();
				layer.setDirty();
				layer.clear();

				if (this.instructSlide == 2){
					this.drawInstructions();
				} else {
					this.filledFuel1 = 0;
					this.filledFuel2 = 0;
					this.rocketPos.x = this.rocketStartX;
					this.practiceRocket();
				}
			}.bind(this));
			this.tryAgainButton.x = this.WIDTH*.65;
			this.tryAgainButton.y = this.HEIGHT*.65;

			// create move on button to move on after practice round
			this.moveOnButton = new CanvasButton(0,0);
			this.moveOnButton.setText("Move on", ctx);
			this.moveOnButton.addOnClick(function(evt) {
				this.hitSubmit = false;

				var layer = this._layeredCanvas.getLayer("interfaceLayer");
				var ctx = layer.getContext();
				this.tryAgainButton.setDisabled();
				this.tryAgainButton.draw(ctx);
				this.moveOnButton.setDisabled();
				this.moveOnButton.draw(ctx);

				var layer = this._layeredCanvas.getLayer("planetClickLayer");
				var ctx = layer.getContext();
				layer.setDirty();
				layer.clear();

				this.instructSlide++;
				this.drawInstructions();
			}.bind(this));
			this.moveOnButton.x = this.WIDTH*.75;
			this.moveOnButton.y = this.HEIGHT*.65;


			// add canvas object manager and add planets and submit button to it to track mouse events
			this.com = new CanvasObjectManager(this._layeredCanvas.getLayer("interfaceLayer").domNode);
			this.planets.forEach(planet => {
				this.com.addObject(planet);
			})
			this.com.addObject(this.submitButton);
			this.com.addObject(this.nextTrialButton);
			this.com.addObject(this.fillEngine1Button);
			this.com.addObject(this.fillEngine2Button);
			this.com.addObject(this.tryAgainButton);
			this.com.addObject(this.moveOnButton);

			// create rocket image buffer
			this.rocketBuffer = new ImageBuffer(this.WIDTH*this.rocketScale.x, this.HEIGHT*this.rocketScale.y, function(ctx) {
				//engine1
				ctx.fillStyle = "whitesmoke";
				ctx.fillRect(this.engine.e1.x, this.engine.e1.y, this.engine.w, this.engine.h);

				//engine2
				ctx.fillRect(this.engine.e1.x, this.engine.e2.y, this.engine.w, this.engine.h);

				//fuselage
				var fuselageGradient = ctx.createLinearGradient (0,0, this.fuselage.x + this.fuselage.w, this.fuselage.y + this.fuselage.h);
				fuselageGradient.addColorStop(0, "white");
				fuselageGradient.addColorStop(1, "dimgray");

				ctx.fillStyle = fuselageGradient;
				ctx.fillRect(this.fuselage.x, this.fuselage.y, this.fuselage.w, this.fuselage.h);

				//rocket nose
				var noseGradient = ctx.createRadialGradient(this.cone.rect.x + this.cone.rect.w*.33, this.cone.rect.y + this.cone.rect.w*.33, this.cone.rect.w*.1, this.cone.rect.x + this.cone.rect.w*.33, this.cone.rect.y + this.cone.rect.w*.33, this.cone.rect.w*3);
				noseGradient.addColorStop(0, "red");
				noseGradient.addColorStop(1, "#000");

				ctx.fillStyle = noseGradient;
				ctx.fillRect(this.cone.rect.x, this.cone.rect.y, this.cone.rect.w, this.cone.rect.h);
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(this.cone.p1.x, this.cone.p1.y);
				ctx.lineTo(this.cone.p2.x, this.cone.p2.y);
				ctx.lineTo(this.cone.p3.x, this.cone.p3.y);
				ctx.lineTo(this.cone.p1.x, this.cone.p1.y);
				ctx.fill();
				ctx.closePath();
			}.bind(this));

			// create rocket flame image buffer
			this.flameBuffer = new ImageBuffer(this.WIDTH*this.rocketScale.x, this.HEIGHT*this.rocketScale.y, function(ctx, width, height) {
				ctx.fillStyle = "fireBrick";
				// flame 1
				ctx.beginPath();
				ctx.moveTo(this.flame.f1.x + this.flame.w, this.flame.f1.y);
				ctx.lineTo(this.flame.f1.x, this.flame.f1.y + this.flame.h/2);
				ctx.lineTo(this.flame.f1.x + this.flame.w, this.flame.f1.y + this.flame.h);
				ctx.lineTo(this.flame.f1.x + this.flame.w, this.flame.f1.y);
				ctx.fill();
				ctx.closePath();
				// flame 2
				ctx.beginPath();
				ctx.moveTo(this.flame.f2.x + this.flame.w, this.flame.f2.y);
				ctx.lineTo(this.flame.f2.x, this.flame.f2.y + this.flame.h/2);
				ctx.lineTo(this.flame.f2.x + this.flame.w, this.flame.f2.y + this.flame.h);
				ctx.lineTo(this.flame.f2.x + this.flame.w, this.flame.f2.y);
				ctx.fill();
				ctx.closePath();
			}.bind(this));

			// create planet image buffer
			this.planetBuffer = new ImageBuffer(this.planetR*2, this.planetR*2, function(ctx, width, height) {
				var planetGradient = ctx.createRadialGradient(this.planet.x*.33, this.planet.y*.33, this.planetR*.1, this.planet.x*.33, this.planet.y*.33, this.planetR*2);
				planetGradient.addColorStop(0, "#5cabff");
				planetGradient.addColorStop(1, "#000");

				ctx.fillStyle = planetGradient;
				ctx.beginPath();
				ctx.arc(width/2, height/2, this.planetR, 0, 2*Math.PI); //x and y are center of dot
				ctx.closePath();
				ctx.fill();
			}.bind(this));
		},

		// start the game
    experimentBegin: function() {
			if (this.instructSlide == 1){
				this.createPlanets();
				this.setup();
				this.drawInstructions();
			 } else {
				this.instructSlide = 99;
				this.guessAllowed = true;
				this.numbers = false;
				this.shufflePairs();
				this.getTrial();
				this.drawSky();
	      this.drawPlanets();
				this.drawThinkingAlien();
	      this.drawRocket(this.rocketPos.x, this.rocketPos.y);
				this.drawFuel(this.rocketPos.x, this.rocketPos.y);
				this.gameTimer.start();
				this.trialTimer.start();
			}
    },

		// create array of planets
		createPlanets: function() {
			for (var i = 0; i < this.NUMPLANETS; i++) {
				// Get the name of the planet based upon our nameCode array (will break if go to 3 digits)
				var numCode0 = Math.floor(i/this.base);
				var numCode1 = i%this.base;
				var planetName = this.nameCode[numCode0] + this.nameCode[numCode1];
				// add planets to the array
				this.planets.push(new Planet({
					x: this.planet1X + this.planetGap*i,
					y: this.planet1Y,
					w: this.planetR*2,
					h: this.planetR*2,
					name: planetName,
					gameController: this
				}));
			}
		},

		// practice rocket for beginning of gameTime
		practiceRocket: function() {
			this.drawSky();
			this.drawPlanets();
			this.drawRocket(this.rocketPos.x, this.rocketPos.y);
			this.drawFuel(this.rocketPos.x, this.rocketPos.y);

			var layer = this._layeredCanvas.getLayer("interfaceLayer");
			var ctx = layer.getContext();
			this.fillEngine1Button.setEnabled();
			this.fillEngine1Button.draw(ctx);
			this.fillEngine2Button.setEnabled();
			this.fillEngine2Button.draw(ctx);
			this.submitButton.setEnabled();
			this.submitButton.draw(ctx);
			ctx.font = this.fbFont;
			ctx.fillStyle = "black";
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			ctx.fillText("Here you can practice as much as you want.", this.instructionX, this.HEIGHT*.1);
			ctx.fillText("Try filling up the engines with different amounts of fuel. ", this.instructionX, this.HEIGHT*.15);
			ctx.fillText("Then click “Fire Rocket”", this.instructionX, this.HEIGHT*.2);
			ctx.fillText("See if you can guess where the rocket will go.", this.instructionX, this.HEIGHT*.25);
			ctx.fillText("This is just the practice rocket.", this.instructionX, this.HEIGHT*.35);
		},

		// function to draw the rocket animation
    animateRocket: function() {
			if (this.instructSlide == 99){
				this.drawWorriedAlien();
			}
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
						if (this.instructSlide == 99) {
							this.showFB = true;
							this.drawFeedback();
							this.writeData();
							this.drawNextTrialButton();
							this.trialIndex++;
							this.overallTrial++;
							this.vPrev = null;
						} else {
							var layer = this._layeredCanvas.getLayer("interfaceLayer");
							var ctx = layer.getContext();
							this.tryAgainButton.setEnabled();
							this.tryAgainButton.draw(ctx);
							this.moveOnButton.setEnabled();
							this.moveOnButton.draw(ctx);
						}
						return;
					}
				}
      }
      requestAnimationFrame(this.animateRocket.bind(this));
    },

		// draw starry night background
    drawSky: function() {
      var layer = this._layeredCanvas.getLayer("skyLayer");
      var skyCtx = layer.getContext();
      var sky = new Image();
      sky.src = "/img/starryBg.png";
      sky.onload = function() {
        skyCtx.drawImage(sky, 0, 0, this.WIDTH, this.HEIGHT);
      }.bind(this);
    },

		// draw the planets from the planet arrray
    drawPlanets: function(){
      var layer = this._layeredCanvas.getLayer("planetLayer");
      var ctx = layer.getContext();
			ctx.font = this.ansFont;
			ctx.fillStlye = "black";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			for (var i = 0; i < this.NUMPLANETS; i++){
				var planet = this.planets[i];
				this.planets[i].isHidden = false;
				ctx.drawImage(this.planetBuffer.domNode, planet.x, planet.y);
				if (this.numbers && !this.blank){
					ctx.fillText(i, planet.x + this.planetR, planet.y + this.planetR);
				} else if (!this.blank){
					ctx.fillText(planet.name, planet.x + this.planetR, planet.y + this.planetR);
				}
			}
		},

		// draw the rocket at its starting position
    drawRocket: function(x, y) {
      var layer = this._layeredCanvas.getLayer("rocketLayer");
      var ctx = layer.getContext();
      layer.setDirty();
      layer.clear();
      ctx.drawImage(this.rocketBuffer.domNode, x, y);
    },

		drawFlame: function(x, y) {
			var layer = this._layeredCanvas.getLayer("rocketLayer");
      var ctx = layer.getContext();
			ctx.drawImage(this.flameBuffer.domNode, x, y);
		},

		// draw the engine's fuel levels
		drawFuel: function(x, y) {
			var layer = this._layeredCanvas.getLayer("fuelLayer");
			layer.setPosition(x, y);
			var ctx = layer.getContext();
			layer.setDirty();
			layer.clear();

			// find how far the rocket has left to go
			var distance = this.rocketTargetX;
			var distanceLeft = this.rocketTargetX - x;
			var distancePercent = distanceLeft/distance;

			// fuel tank 1 and 2
			if (this.instructSlide < 99){
				if (this.instructSlide != 1){
					this.filledFuel1 = 7;
					this.filledFuel2 = 3;
				}
				var ans = this.filledFuel1 + this.filledFuel2;
				var numCode0 = Math.floor(ans/this.base);
				var numCode1 = ans%this.base;
				this.practiceTarget = this.nameCode[numCode0] + this.nameCode[numCode1];
				this.rocketTargetX = this.getPlanetByID(this.practiceTarget).x - this.cone.p3.x;

				var distance = this.rocketTargetX;
				var distanceLeft = distance - x;
				var distancePercent = distanceLeft/distance;

				ctx.fillStyle = "green";
				var fuel1 = this.engine.w/(this.NUMPLANETS-1)*this.filledFuel1;
				ctx.fillRect(this.engine.e1.x, this.engine.e1.y, fuel1*distancePercent, this.engine.h);
				var fuel2 = this.engine.w/(this.NUMPLANETS-1)*this.filledFuel2;
				ctx.fillRect(this.engine.e2.x, this.engine.e2.y, fuel2*distancePercent, this.engine.h);
				// fuel tank labels
				ctx.fillStyle = "black";
				ctx.textAlign = "right";
				ctx.textBaseline = "top";
				ctx.font = this.ansFont;
				if (!this.numbers){
					var numCode0 = Math.floor(this.filledFuel1/this.base);
					var numCode1 = this.filledFuel1%this.base;
					var ff1 = this.nameCode[numCode0] + this.nameCode[numCode1];

					var numCode0 = Math.floor(this.filledFuel2/this.base);
					var numCode1 = this.filledFuel2%this.base;
					var ff2 = this.nameCode[numCode0] + this.nameCode[numCode1];

					ctx.fillText(ff1, this.engine.e1.x + this.engine.w, this.engine.e1.y);
					ctx.fillText(ff2, this.engine.e2.x + this.engine.w, this.engine.e2.y);
				} else {
					ctx.fillText(this.filledFuel1, this.engine.e1.x + this.engine.w, this.engine.e1.y);
					ctx.fillText(this.filledFuel2, this.engine.e2.x + this.engine.w, this.engine.e2.y);
				}
			} else {
				ctx.fillStyle = "green";
				var fuel1 = this.engine.w/(this.NUMPLANETS-1)*this.currentTrial.a;
				ctx.fillRect(this.engine.e1.x, this.engine.e1.y, fuel1*distancePercent, this.engine.h);
				var fuel2 = this.engine.w/(this.NUMPLANETS-1)*this.currentTrial.b;
				ctx.fillRect(this.engine.e2.x, this.engine.e2.y, fuel2*distancePercent, this.engine.h);
				// fuel tank labels
				ctx.fillStyle = "black";
				ctx.textAlign = "right";
				ctx.textBaseline = "top";
				ctx.font = this.ansFont;
				ctx.fillText(this.labelA, this.engine.e1.x + this.engine.w, this.engine.e1.y);
				ctx.fillText(this.labelB, this.engine.e2.x + this.engine.w, this.engine.e2.y);
			}
		},

		// draw puzzled alien at start of trial
		drawThinkingAlien: function(){
			var layer = this._layeredCanvas.getLayer("alienLayer");
			var ctx = layer.getContext();
			var thinkingAlien = new Image();
			thinkingAlien.src = "img/Smiley_green_alien_mmm.svg"
			thinkingAlien.onload = function() {
				ctx.drawImage(thinkingAlien, this.alien.x, this.alien.y, this.alien.w, this.alien.h);
			}.bind(this);
		},

		drawWorriedAlien: function(){
			var layer = this._layeredCanvas.getLayer("alienLayer");
			var ctx = layer.getContext();
			var worriedAlien = new Image();
			worriedAlien.src = "img/Smiley_green_alien_worried.svg"
			worriedAlien.onload = function() {
				ctx.drawImage(worriedAlien, this.alien.x, this.alien.y, this.alien.w, this.alien.h);
			}.bind(this);
		},

		// draw highlight around planet when mouse enters
		drawHighlight: function(planet) {
			if (planet.isHidden) {
				return;
			}
			if (this.hitSubmit === false) {
				var layer = this._layeredCanvas.getLayer("highlightLayer");
	      var ctx = layer.getContext();
				ctx.strokeStyle = "orange";
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(planet.x + planet.w/2, planet.y + planet.h/2, this.planetR, 0, 2*Math.PI);
				ctx.stroke();
				ctx.closePath();
			}
		},

		// clear highlight around planet when mouse leaves
		clearHighlight: function() {
			var layer = this._layeredCanvas.getLayer("highlightLayer");
      var ctx = layer.getContext();
      layer.setDirty();
      layer.clear();
		},

		drawClick: function(planet) {
			if (planet.isHidden) {
				return;
			}
			if (this.hitSubmit == false) {
				var layer = this._layeredCanvas.getLayer("planetClickLayer");
	      var ctx = layer.getContext();
				layer.setDirty();
	      layer.clear();
				ctx.strokeStyle = "black";
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(planet.x + planet.w/2, planet.y + planet.h/2, this.planetR, 0, 2*Math.PI);
				ctx.stroke();
				ctx.closePath();

				var layer = this._layeredCanvas.getLayer("interfaceLayer");
				var ctx = layer.getContext();
				this.submitButton.setEnabled();
				this.submitButton.draw(ctx);
			}
		},

		drawFeedback: function() {
			setTimeout(function(){
				var layer = this._layeredCanvas.getLayer("alienLayer");
				layer.setDirty();
				layer.clear();

				var layer = this._layeredCanvas.getLayer("interfaceLayer");
				layer.setDirty();
				layer.clear();

				if (this.correct){
					this.drawCorrect();
				} else {
					this.drawIncorrect();
				}
			}.bind(this), this.fbTime);
		},

		drawCorrect: function() {
			this.correctSound.play();

			var layer = this._layeredCanvas.getLayer("feedbackLayer");
			var ctx = layer.getContext();
			ctx.font = this.fbFont;
			ctx.fillStyle = "darkBlue";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Right!", this.WIDTH*.5, this.HEIGHT*.25);
			ctx.fillText("You guessed "+this.currentGuess+", the correct answer is "+this.labelAns, this.WIDTH*.5, this.HEIGHT*.3);

			var happyAlien = new Image();
			happyAlien.src = "img/Smiley_green_alien_lipbite.svg"
			happyAlien.onload = function() {
				ctx.drawImage(happyAlien, this.alien.x, this.alien.y, this.alien.w, this.alien.h);
			}.bind(this);
		},

		drawIncorrect: function() {
			this.incorrectSound.play();

			var layer = this._layeredCanvas.getLayer("feedbackLayer");
			var ctx = layer.getContext();
			ctx.font = this.fbFont;
			ctx.fillStyle = "red";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Wrong", this.WIDTH*.5, this.HEIGHT*.25);
			ctx.fillText("You guessed "+this.currentGuess+", the correct answer is "+this.labelAns, this.WIDTH*.5, this.HEIGHT*.3);

			var sadAlien = new Image();
			sadAlien.src = "img/Smiley_green_alien_depresive.svg"
			sadAlien.onload = function() {
				ctx.drawImage(sadAlien, this.alien.x, this.alien.y, this.alien.w, this.alien.h);
			}.bind(this);
		},

		drawNextTrialButton: function(){
			setTimeout(function(){
				var layer = this._layeredCanvas.getLayer("interfaceLayer");
				var ctx = layer.getContext();
				this.nextTrialButton.setEnabled();
				this.nextTrialButton.draw(ctx);
			}.bind(this), this.nextTrialTime);
		},

		getTrial: function() {
			if (this.test && this.extraTrials){
				this.currentTrial = this.shuffledExtraPairs[this.trialIndex];
			} else {
				this.currentTrial = this.shuffledPairs[this.trialIndex];
			}
			// get letter label for 1st addend
			var numCode0 = Math.floor(this.currentTrial.a/this.base);
			var numCode1 = this.currentTrial.a%this.base;
			this.labelA = this.nameCode[numCode0] + this.nameCode[numCode1];
			// get letter label for 2nd addend
			var numCode0 = Math.floor(this.currentTrial.b/this.base);
			var numCode1 = this.currentTrial.b%this.base;
			this.labelB = this.nameCode[numCode0] + this.nameCode[numCode1];
			// get answer
			var ans = this.currentTrial.a + this.currentTrial.b;
			var numCode0 = Math.floor(ans/this.base);
			var numCode1 = ans%this.base;
			this.labelAns = this.nameCode[numCode0] + this.nameCode[numCode1];
			// get target
			this.rocketTargetX = this.getPlanetByID(this.labelAns).x - this.cone.p3.x;
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
				layer.setDirty();
	      layer.clear();
				this.nextTrialButton.setDisabled();
				this.nextTrialButton.draw(ctx);

				var layer = this._layeredCanvas.getLayer("feedbackLayer");
				layer.setDirty();
				layer.clear();

				this.getTrial();
				this.rocketPos.x = this.rocketStartX;
				this.drawRocket(this.rocketPos.x, this.rocketPos.y);
				this.drawFuel(this.rocketPos.x, this.rocketPos.y);
				this.drawThinkingAlien();
			}
		},

		experimentEnd: function() {
			var layer = this._layeredCanvas.getLayer("interfaceLayer");
			var ctx = layer.getContext();
			this.nextTrialButton.setDisabled();
			this.nextTrialButton.draw(ctx);
			var layer = this._layeredCanvas.getLayer("rocketLayer");
			layer.setDirty();
			layer.clear();
			var layer = this._layeredCanvas.getLayer("fuelLayer");
			layer.setDirty();
			layer.clear();
			var layer = this._layeredCanvas.getLayer("planetClickLayer");
			layer.setDirty();
			layer.clear();
			var layer = this._layeredCanvas.getLayer("feedbackLayer");
			var ctx = layer.getContext();
			layer.setDirty();
			layer.clear();
			ctx.fillStyle = "darkBlue";
			ctx.textAlign = "center";
			ctx.font = this.fbFont;
			ctx.fillText("Please tell the experimenter that you have finished this part of the experiment.",
					this.WIDTH/2,
					this.HEIGHT/5);
		},

		checkIfCorrect: function(){
			if (this.currentGuess == this.labelAns){
				this.correct = true;
			} else {
				this.correct = false;
			}
		},

		writeData: function(){
			this.checkIfCorrect();
			var trialTime = this.trialTimer.get(); // time from pressing next trial button to clicking "fire Rocket"

			//Get the id from the url params
			var params = getUrlVars();

			var postData = {
				gameType: this.gameType,
				id: params.id,
				guess: this.currentGuess,
				correctAnswer: this.labelAns,
				inputA: this.labelA,
				inputB: this.labelB,
				trialTime: trialTime,
				overallTrial: this.overallTrial,
				correct: this.correct,
				overallTime: this.gameTimer.get(),
			};
			fetch("/write", {
				method: "post",
				headers: {
					"Content-type": "application/json;charset=UTF-8"
				},
				body: JSON.stringify(postData)
			});

			this.trialTimer.stop();
		},

		getPlanetByID: function(id) {
			for (var i = 0; i < this.planets.length; i++){
				var planet = this.planets[i];
				if (planet.name === id) {
					return planet;
				}
			}
			return null;
		},

		shuffle: function(array) {
			var currentIndex = array.length, temporaryValue, randomIndex;

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			return array;
		},

		shufflePairs: function(){
			this.shuffledPairs = this.shuffle(this.trainingPairs);
			return this.shuffledPairs;
		},

		//ALL THE EXTRAPOLATION TESTING PAIRS
		shuffleExtraPairs: function(){
			this.shuffledExtraPairs = this.shuffle(this.extraPairs);
			return this.shuffledExtraPairs;
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

			var layer = this._layeredCanvas.getLayer("interfaceLayer");
			var ctx = layer.getContext();
			layer.setDirty();
			layer.clear();
			if (this.instructSlide == 1){
				this.practiceRocket();
			} else if(this.instructSlide == 2){
				ctx.font = this.fbFont;
				ctx.fillStyle = "black";
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillText("In this part of the game we are going to ask you to guess where the rocket will land.", this.instructionX, this.HEIGHT*.1);
				ctx.fillText("We will show you a rocket that has a certain amount of fuel in each engine.", this.instructionX, this.HEIGHT*.15);
				ctx.fillText("Here is a rocket with 7 levels of fuel in one engine, and 3 in the other.", this.instructionX, this.HEIGHT*.2);
				ctx.fillText("Your job will be to tell us where the rocket will land. You can practice here.", this.instructionX, this.HEIGHT*.25);
				ctx.fillText("Do you have any questions?", this.instructionX, this.HEIGHT*.35);
				ctx.fillText("If not, press 'Move On' to see the rocket game.", this.instructionX, this.HEIGHT*.4);

				this.guessAllowed = true;
				this.rocketPos.x = this.rocketStartX;
				this.drawRocket(this.rocketPos.x, this.rocketPos.y);
				this.drawFuel(this.rocketPos.x, this.rocketPos.y);
				this.hidePlanets();
				this.drawPracticePlanets();
			} else if (this.instructSlide == 3){
				ctx.font = this.fbFont;
				ctx.fillStyle = "black";
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillText("Here is what the real rocket game looks like.", this.instructionX, this.HEIGHT*.1);
				ctx.fillText("Notice that in the real game the numerals have been replaced by letters.", this.instructionX, this.HEIGHT*.15);
				ctx.fillText("The letters map on to numeric quantities but that mapping is not trivial to figure out.", this.instructionX, this.HEIGHT*.2);
				ctx.fillText("Do you have any questions?", this.instructionX, this.HEIGHT*.3);
				ctx.fillText("If not, press 'Move On' to start playing.", this.instructionX, this.HEIGHT*.35);

				this.guessAllowed = false;
				this.numbers = false;
	      this.drawPlanets();
				this.rocketPos.x = this.rocketStartX;
	      this.drawRocket(this.rocketPos.x, this.rocketPos.y);
				this.drawFuel(this.rocketPos.x, this.rocketPos.y);

				var layer = this._layeredCanvas.getLayer("interfaceLayer");
				var ctx = layer.getContext();
				this.moveOnButton.setEnabled();
				this.moveOnButton.draw(ctx);
			} else {
				this.experimentBegin();
			}
		},

		drawPracticePlanets: function(){
			var layer = this._layeredCanvas.getLayer("planetLayer");
			var ctx = layer.getContext();
			ctx.font = this.ansFont;
			ctx.fillStlye = "black";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			for (var i = 10; i < 12; i++){
				var planet = this.planets[i];
				this.planets[i].isHidden = false;
				ctx.drawImage(this.planetBuffer.domNode, planet.x, planet.y);
				ctx.fillText(i, planet.x + this.planetR, planet.y + this.planetR);
			}
		},

		hidePlanets: function(){
			for (var i = 0; i < this.planets.length; i++){
				this.planets[i].isHidden = true;
			}
			var layer = this._layeredCanvas.getLayer("planetLayer");
			var ctx = layer.getContext();
			layer.setDirty();
			layer.clear();
		}
  });

  return RocketGame;
});

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	vars[key] = value;
	});
	return vars;
}
