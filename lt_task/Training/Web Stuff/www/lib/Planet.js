//create Planet class
define([
  "pwbscript/Rectangle"
], function(
  Rectangle
) {
  return class Planet {
    constructor(args) {
      // args is an object with the following props
      //	x:
      //	y:
      //	w:
      //	h:
      //	name:
      //	gameController:
      Object.assign(this, args);
    }

    pointIntersects(point) {
      // Returns true if point intersects the button
      return Rectangle.intersects(this, point);
    }

    onClick(evt) {
      console.log("clicked");
      if(this.gameController.guessAllowed){
        this.gameController.drawClick(this);
        this.gameController.currentGuess = this.name;
      }
    }

    onMouseEnter(evt) {
      console.log("enter");
      if(this.gameController.guessAllowed){
        this.gameController.drawHighlight(this);
      }
    }

    onMouseLeave(evt) {
      console.log("leave");
      this.gameController.clearHighlight(this);
    }
  };
});
