define([
		"Class",
		"pwbscript/ImageBuffer"
	], function(
		Class,
		ImageBuffer
	) {
	var AnimationBuffer = Class.extend({
		domNode: null,
		img: null,
		frameW: null,
		frameH: null,
		frameOffsetX: null,
		frameOffsetY: null,
		doWrap: true,
		totalFramesX: 0,
		totalFramesY: 0,
		imageBuffer: null,
		isLoaded: false,
		_onLoadFns: null,
		
		init: function(url, frameW, frameH, frameOffsetX, frameOffsetY) {
			this.isLoaded = false;
			this.img = new Image();
			
			this._onLoadFns = [
				function(img) {
					this.isLoaded = true;
					this.totalFramesX = this.frameOffsetX === 0 ? 1 : Math.floor(this.img.width/this.frameOffsetX);
					this.totalFramesY = this.frameOffsetY === 0 ? 1 : Math.floor(this.img.height/this.frameOffsetY);
					
					var renderFn = function(context) {
						context.drawImage(this.img, 0, 0);
					}.bind(this);
					
					if (!this.imageBuffer) {
						this.imageBuffer = new ImageBuffer(this.img.width, this.img.width, renderFn);
					} else {
						this.imageBuffer.init(this.img.width, this.img.width, renderFn);
					}
				}.bind(this)
			];
			
			this.img.onload = function(img) {
				for (var i = 0; i < this._onLoadFns.length; i++) {
					this._onLoadFns[i](img);
				}
			}.bind(this);
			
			this.img.src = url;
			this.frameW = frameW;
			this.frameH = frameH;
			this.frameOffsetX = frameOffsetX || frameW;
			this.frameOffsetY = frameOffsetY || 0;
		},
		
		addOnLoad: function(fn) {
			if (this.isLoaded) {
				fn();
			} else {
				this._onLoadFns.push(fn);
			}
		},
		
		getNextFrame: function(currentFrameX, frameAdvanceX, currentFrameY, frameAdvanceY) {
			// Returns the correct index for the next frame given the parameters.
			//	This method will take an index that is otherwise out of bounds, and
			//	transmute it to the corresponding index as if the frames wrapped.
			currentFrameX = currentFrameX || 0;
			frameAdvanceX = frameAdvanceX || 0;
			currentFrameY = currentFrameY || 0;
			frameAdvanceY = frameAdvanceY || 0;
			
			var nextFrameX = currentFrameX + frameAdvanceX,
				nextFrameY = currentFrameY + frameAdvanceY;
			
			if (nextFrameX >= this.totalFramesX) {
				nextFrameX = nextFrameX % this.totalFramesX;
			} else if (nextFrameX < 0) {
				nextFrameX = this.totalFramesX + (nextFrameX % this.totalFramesX);
			}
			
			if (nextFrameY >= this.totalFramesY) {
				nextFrameY = nextFrameY % this.totalFramesY;
			} else if (nextFrameY < 0) {
				nextFrameY = this.totalFramesY + (nextFrameY % this.totalFramesX);
			}
			
			return {x: nextFrameX, y: nextFrameY};
		},
		
		drawFrame: function(context, x, y, frameIndexX, frameIndexY) {
			frameIndexX = frameIndexX || 0;
			frameIndexY = frameIndexY || 0;
			if (!this.isLoaded) {
				return;
			}
			if (frameIndexX >= this.totalFramesX) {
				frameIndexX = frameIndexX%this.totalFramesX;
			}
			if (frameIndexY >= this.totalFramesY) {
				frameIndexY = frameIndexY%this.totalFramesY;
			}
			var startX = frameIndexX*this.frameOffsetX,
				startY = frameIndexY*this.frameOffsetY;
			var endX = startX + this.frameW,
				endY = startY + this.frameH,
				wrapped = false;
				
			if (this.doWrap && endX > this.img.width) {
				var diffX = endX - this.img.width;
				var alreadyDrawnW = this.frameW - diffX;
				if (this.doWrap && endY > this.img.height) {
					// TODO: We need to wrap in both the x and y directions. Will require 4 draws.
					var diffY = endY - this.img.height;
					var alreadyDrawnH = this.frameH - diffY;

					// Top-left quad
					context.drawImage(this.imageBuffer.domNode, startX, startY, alreadyDrawnW, this.frameH, x, y, alreadyDrawnW, this.frameH);
					
					// Top-right quad
					context.drawImage(this.imageBuffer.domNode, 0, startY, diffX, this.frameH, x+alreadyDrawnW, y, diffX, this.frameH);
					
					// Bottom-left quad
					context.drawImage(this.imageBuffer.domNode, startX, 0, this.frameW, diffY, x, y+alreadyDrawnH, this.frameW, diffY);
					
					// Bottom-right quad
					context.drawImage(this.imageBuffer.domNode, 0, 0, this.frameW-alreadyDrawnW, this.frameH-alreadyDrawnH, x+alreadyDrawnW, y+alreadyDrawnH, this.frameW-alreadyDrawnW, this.frameH-alreadyDrawnH);
				} else {
					// Wrap it. We need to perform 2 draws.
					// Left half
					context.drawImage(this.imageBuffer.domNode, startX, startY, alreadyDrawnW, this.frameH, x, y, alreadyDrawnW, this.frameH);
					
					// Right half
					context.drawImage(this.imageBuffer.domNode, 0, startY, diffX, this.frameH, x+alreadyDrawnW, y, diffX, this.frameH);
				}
				wrapped = true;
			} else if (this.doWrap && endY > this.img.height) {
				// Wrap it. We need to perform 2 draws.
				var diffY = endY - this.img.height;
				var alreadyDrawnH = this.frameH - diffY;
				
				// Top half
				context.drawImage(this.imageBuffer.domNode, startX, startY, this.frameW, alreadyDrawnH, x, y, this.frameW, alreadyDrawnH);
				
				// Bottom half
				context.drawImage(this.imageBuffer.domNode, startX, 0, this.frameW, diffY, x, y+alreadyDrawnH, this.frameW, diffY);
				wrapped = true;
			}
			
			if (!wrapped) {
				context.drawImage(this.imageBuffer.domNode, startX, startY, this.frameW, this.frameH, x, y, this.frameW, this.frameH);
			}
		}
	});
	
	return AnimationBuffer;
});