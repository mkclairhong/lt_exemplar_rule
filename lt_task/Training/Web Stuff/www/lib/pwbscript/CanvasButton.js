/** A button for placement within a canvas **/
// TODO: We should use an image buffer rather than performing a full draw every time
define([
		"Class",
		"pwbscript/Rectangle"
	], function(
		Class,
		Rectangle
	) {
	var CanvasButton = Class.extend({
		x: null,
		y: null,
		w: null,
		h: null,
		
		fontSize: 12,	// Font size in pixels
		font: "Arial",
		padding: 10,	// padding (in pixels) around the text of button
		borderLineW: 2, // The line width (in pixels) of the border
		
		// Colors to use when the button is enabled
		bgColorEnabled: "gray",
		borderColorEnabled: "#333333",
		fontColorEnabled: "#333333",
		
		// Colors to use when the button is active (for example when the button is being clicked)
		bgColorActive: "gray",
		borderColorActive: "#aaaaaa",
		fontColorActive: "#333333",
		
		// Colors to use when the button is disabled
		bgColorDisabled: "#aaaaaa",
		borderColorDisabled: "gray",
		fontColorDisabled: "gray",
		
		// keep track of what the current colors should be based on out event methods
		_currentBorderColor: null,
		_currentTextColor: null,
		_currentBgColor: null,
		
		_text: "", // The text of the button
		_ctx: null,	// Keep track of the last drawing context, to simplify drawing from our event methods
		_disabled: false,
		
		_onClickEvents: null,	// Maintain an array of onClick events that will fire when the button is clicked
		
		init: function(x, y, disabled) {
			this.x = x;
			this.y = y;
			
			this._onClickEvents = [];
			
			if (disabled) {
				this.setDisabled();
			} else {
				this.setEnabled();
			}
		},
		
		addOnClick: function(fn) {
			// Add a method that will be called when the button is clicked.
			// The onClick event methods are stored in an array that will be called in order.
			this._onClickEvents.push(fn);
		},
		
		setEnabled: function() {
			this._disabled = false;
			this._currentBorderColor = this.borderColorEnabled;
			this._currentBgColor = this.bgColorEnabled;
			this._currentFontColor = this.fontColorEnabled;
		},
		
		setDisabled: function() {
			this._disabled = true;
			this._currentBorderColor = this.borderColorDisabled;
			this._currentBgColor = this.bgColorDisabled;
			this._currentFontColor = this.fontColorDisabled;
		},
		
		setActive: function() {
			this._currentBorderColor = this.borderColorActive;
			this._currentBgColor = this.bgColorActive;
			this._currentFontColor = this.fontColorActive;
		},
		
		setText: function(text, ctx) {
			// Set the text for the button and perform the necessary measurements.
			// Note that the context is required in order to get accurate measurements of the text as it will be displayed
			this._text = text;
			
			ctx.save();
			ctx.font = this.fontSize + "px " + this.font;
			var measurements = ctx.measureText(text);
			ctx.restore();
			
			var bufferAreaSize = (this.padding + this.borderLineW) * 2;
			this.w = measurements.width + bufferAreaSize;
			this.h = this.fontSize + bufferAreaSize;
		},
		
		getText: function() {
			return this._text;
		},
		
		pointIntersects: function(point) {
			// Returns true if point intersects the button
			return Rectangle.intersects(this, point);
		},
		
		// Set up all our CanvasObjectManager events to act approximately like a HTML button.
		// These can all be overridden, however since this is a button, it is recommended that
		//	you simply add onClick events via the 'addOnClick' method.
		onClick: function(evt, entry) {
			if (this._disabled) {
				return;
			}
			this.setEnabled();
			this.draw();
			for (var index in this._onClickEvents) {
				var fn = this._onClickEvents[index];
				fn(evt, entry);
			}
		},
		
		onMouseEnter: function(evt, entry) {
			if (this._disabled) {
				return;
			}
			if (entry.mouseDownOccuredInObject) {
				this.setActive();
				this.draw();
			}
		},
		
		onMouseLeave: function(evt, entry) {
			if (this._disabled) {
				return;
			}
			this.setEnabled();
			this.draw();
		},
		
		onMouseDown: function() {
			if (this._disabled) {
				return;
			}
			this.setActive();
			this.draw();
		},
		
		onMouseUp: function() {
			if (this._disabled) {
				return;
			}
			this.setEnabled();
			this.draw();
		},
		
		draw: function(ctx) {
			ctx = this._ctx = ctx || this._ctx;
			if (!ctx) {
				return;
			}
			ctx.save();
						
			// Draw the background of the button
			ctx.fillStyle = this._currentBgColor;
			ctx.fillRect(this.x, this.y, this.w, this.h);
			
			// Draw the button border
			ctx.strokeStyle = this._currentBorderColor;
			ctx.lineWidth = this.borderLineW;
			ctx.strokeRect(this.x, this.y, this.w, this.h);
			
			// Draw the button text
			ctx.font = this.fontSize + "px " + this.font;
			ctx.fillStyle = this._currentFontColor;
			ctx.textBaseline = "top";
			ctx.textAlign = "left";
			ctx.fillText(this._text, this.x + this.padding, this.y + this.padding);
			
			
			ctx.restore();
		}
	});
	
	return CanvasButton;
});