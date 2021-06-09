define([
		"Class"
	], function(
		Class
	) {
	var CanvasLayer = Class.extend({

		domNode: null,
		ctx: null, // We will store the context
		isDirty: false,
		_clearAll: false,	// If set, the next clear will clear the entire canvas
		_dirtyRectangles: null,
		_w: 0,
		_h: 0,
		_top: 0,
		_left: 0,

		init: function(width, height, left, top, zIndex, defaultContext) {

			this.domNode = document.createElement("canvas");
			this.setSize(width, height);
			this.domNode.style.position = "absolute";
			this.setPosition(left, top);
			this.setZIndex(zIndex);
			this.ctx = this.domNode.getContext(defaultContext || "2d");
			this._dirtyRectangles = [];
		},

		setSize: function(w, h) {
			this.domNode.width = this._w = w;
			this.domNode.height = this._h = h;
		},

		setPosition: function(left, top) {
			this._left = left || 0;
			this._top = top || 0;
			this.domNode.style.left = this._left;
			this.domNode.style.top = this._top;
		},

		setZIndex: function(zIndex) {
			this.domNode.style.zIndex = zIndex || 0;
		},

		getW: function() {
			return this._w;
		},

		getH: function() {
			return this._h;
		},

		getLeft: function() {
			return this._left;
		},

		getTop: function() {
			return this._top;
		},

		getContext: function(type) {
			// Note that the domNode should be added to the document before grabbing the context.
			if (!this.ctx) {
				this.ctx = this.domNode.getContext(type || "2d");
			}
			return this.ctx;
		},

		setDirty: function(rectangle) {
			// Rectangle is an optional paramer defining the rectangle (or array of rectangles) to be cleared.
			//   If not provided, the entire canvas will be cleared
			this.isDirty = true;
			if (!rectangle) {
				this._clearAll = true;
			} else {
				if (Array.isArray(rectangle)) {
					this._dirtyRectangles = this._dirtyRectangles.concat(rectangle);
				} else {
					this._dirtyRectangles.push(rectangle);
				}
			}
		},

		clear: function() {
			if (this.isDirty) {
				var ctx = this.getContext();
				if (this._clearAll) {
					ctx.clearRect(0, 0, this.getW(), this.getH());
				} else {
					var i = 0,
						rect;
					for (; i < this._dirtyRectangles.length; i++) {
						rect = this._dirtyRectangles[i];
						ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
					}
				}
			}
			this._clearAll = false;
			this._dirtyRectangles = [];
			this.isDirty = false;
		}
	});

	// Statics
	CanvasLayer.getRealRect = function(rect) {
		// Translates a rectangle into its real bounds on the canvas.
		// This is sometimes necessary when the canvas coordinates are decimals, and so
		// pixels are not mapped 1:1. This returns the full bounding rectangle.
		return {x:Math.floor(rect.x), y:Math.floor(rect.y), w:rect.w+1, h:rect.h+1};
	};

	return CanvasLayer;
});
