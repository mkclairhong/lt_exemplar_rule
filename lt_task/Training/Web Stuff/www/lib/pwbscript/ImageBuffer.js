define([
		"Class"
	], function(
		Class
	) {
	var ImageBuffer = Class.extend({
		/**
			Class to pre-render images to a canvas for re-use.
			ex:
			
			var myBuffer = new ImageBuffer(5, 5, function (ctx, width, height) {
				ctx.fillStyle = "#FF0000";
				ctx.fillRect(0, 0, width, height);
			});
			[...]
			context.drawImage(myBuffer.domNode, 0, 0);
		**/
		domNode: null,
		
		init: function(width, height, renderFunction, contextType) {
			if (!this.domNode) {
				this.domNode = document.createElement("canvas");
			}
			this.domNode.width = width;
			this.domNode.height = height;
			renderFunction(this.domNode.getContext(contextType || "2d"), width, height);
			return this.domNode;
		},
		
		createReverse: function() {
			return new ImageBuffer(this.domNode.width, this.domNode.width, function(ctx) {
				ctx.save();
				ctx.translate(this.domNode.width, 0);
				ctx.scale(-1, 1);
				ctx.drawImage(this.domNode, 0, 0);
				ctx.restore();
			}.bind(this));
		},
	});
	
	return ImageBuffer;
});