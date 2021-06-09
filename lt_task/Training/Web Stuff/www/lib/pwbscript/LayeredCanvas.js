define([
		"Class",
		"pwbscript/CanvasLayer"
	], function(
		Class,
		CanvasLayer
	) {
	var LayeredCanvas = Class.extend({
	/**
		A tool for creating layered HTML5 canvases.
	**/
		_layers: null,
		_contexts: null,
		domNode: null,
		
		init: function() {
			this._layers = {};
			this.domNode = document.createElement("div");
			this.domNode.style.position = "relative";
		},
		
		addLayer: function(name, width, height, left, top, zIndex) {
			// Creates a new CanvasLayer using the given arguments, then adds it to the LayeredCanvas
			var newLayer = new CanvasLayer(width, height, left, top, zIndex);
			this.domNode.appendChild(newLayer.domNode);
			this._layers[name] = newLayer;
			return newLayer;
		},
		
		addExistingLayer: function(name, canvasLayer) {
			// Adds an existing CanvasLayer to the LayeredCanvas
			this.domNode.appendChild(canvasLayer.domNode);
			this._layers[name] = canvasLayer;
			return canvasLayer;
		},
		
		resize: function() {
			// Resizes the LayeredCanvas domNode based on the size of all of its child layers
			// 	This allows the container DOM node to be sized properly for placement.
			//	Since the canvas elements that are the children of a LayeredCanvas must be
			//	positioned absolutely, the LayeredCanvas domNode would otherwise have no width and height,
			//	which can make positioning it on a page problematic.
			
			var keys = Object.keys(this._layers),
				width = 0,
				height = 0,
				layer;
				
			keys.forEach(function(key) {
				layer = this._layers[key];
				width = Math.max(width, layer.getW() + layer.getLeft());
				height = Math.max(height, layer.getH() + layer.getTop());
			}.bind(this));
			
			this.domNode.style.width = width + "px";
			this.domNode.style.height = height + "px";
		},
		
		getLayer: function(name) {
			return this._layers[name];
		},
		
		getContext: function(name, type) {
			return this._layers[name].getContext(type);
		},
		
		clear: function(clearAll) {
			for (var key in this._layers) {
				if (clearAll) {
					this._layers[key].setDirty();
				}
				this._layers[key].clear();
			}
		},
		
		sizeAll: function(width, height) {
			for (var key in this._layers) {
				this._layers[key].setSize(width, height);
			}
		}
	});
	
	return LayeredCanvas;
});