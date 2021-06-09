// TODO: This may be pretty useful. consider moving it to pwbscript

/* This Class creates a parallax scene using the provided AnimationBuffers
 * 	in the order they are given.
*/
define([
		"Class",
		"pwbscript/CanvasLayer"
	], function(
		Class,
		CanvasLayer
	) {
	var ParallaxStack = Class.extend({
	
		_layerData: null,
		_layer: null,
		
		init: function(width, height) {
			this._layer = new CanvasLayer(width, height);
			this._layerData = [];
			
		},
		
		addLayer: function(animationBuffer) {
			var layerId = this._layerData.length;
			var info = {
				id: layerId,
				buffer: animationBuffer,
				currentFrameX: 0,
				currentFrameY: 0,
			};
			this._layerData.push(info);
		},
		
		addLayers: function(animationBuffers) {
			for (var i = 0; i < animationBuffers.length; i++) {
				this.addLayer(animationBuffers[i]);
			}
		},
		
		getCanvasLayer: function() {
			return this._layer;
		},
		
		draw: function(frameAdvance) {
			frameAdvance = frameAdvance || 1;
			this._layer.setDirty();
			this._layer.clear();
			var ctx = this._layer.getContext();
			for (var i = 0; i < this._layerData.length; i++) {
				var info = this._layerData[i];
				info.buffer.drawFrame(ctx, 0, 0, info.currentFrameX, info.currentFrameY);
				var nextFrames = info.buffer.getNextFrame(info.currentFrameX, frameAdvance, info.currentFrameY, frameAdvance);
				info.currentFrameX = nextFrames.x;
				info.currentFrameY = nextFrames.y;
			}
		}
	});

	return ParallaxStack;
});