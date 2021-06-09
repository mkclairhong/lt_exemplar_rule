define([
		"Class",
		"pwbscript/Rectangle"
	], function(
		Class,
		Rectangle
	) {
	var DragDropManager = Class.extend({
		
		container: null,
		containerBounds: null,
		dragDiffx: null,
		dragDiffY: null,
		dragObjects: null,
		mouseX: null,
		mouseY: null,
		isDragging: false,
		
		init: function(containerNode) {
			if (containerNode) {
				this.container = containerNode;
			}
			this.dragObjects = [];
			this.containerBounds = this.container.getBoundingClientRect();
		},
		
		onStartDrag: function() {
			// Overrideable method that is called immediately before a drag starts.
		},
		
		onStopDrag: function() {
			// Overrideable method that is called immediately before a drag stops.
		},
		
		getDragObjects: function() {
			return this.dragObjects();
		},
		
		testObjects: function(objects, rect, firstOnly) {
			// Given an array of objects, test to see if any of them collide with the provided rect (or point).
			var res = []
			for (var i=objects.length-1, o; i>=0; i--) {
				o = objects[i];
				if (Rectangle.intersects({x:o.x, y:o.y, w:o.w, h:o.h}, rect)) {
					if (firstOnly) {
						return [o];
					}
					res.push(o);
				}
			}
			return res;
		},
		
		getRelativePos: function(clientX, clientY) {
			return {x:clientX-this.containerBounds.left, y:clientY-this.containerBounds.top};
		},
		
		clear: function() {
			this.dragObjects = [];
		},
		
		addDragObjects: function(o) {
			if (Array.isArray(o)) {
				this.dragObjects = this.dragObjects.concat(o);
			} else {
				this.dragObjects.push(o);
			}
		},
		
		dragEvent: function(evt) {
			this.mouseX = evt.clientX;
			this.mouseY = evt.clientY;
			var relativePos = this.getRelativePos(evt.clientX, evt.clientY);
			for (var i=0, len=this.dragObjects.length, obj; i<len; i++) {
				obj = this.dragObjects[i];
				obj.x = relativePos.x-this.dragDiffX;
				obj.y = relativePos.y-this.dragDiffY;
			}
		},
		
		startDrag: function(clientX, clientY) {
			this.onStartDrag(); // Call to overrideable method
			
			var relativePos = this.getRelativePos(clientX, clientY),
				minX = minY = Number.MAX_VALUE;
			
			for (var i=0, len=this.dragObjects.length, obj; i<len; i++) {
				obj = this.dragObjects[i];
				minX = Math.min(minX, obj.x);
				minY = Math.min(minY, obj.y);
			}
			this.dragDiffX = relativePos.x-minX;
			this.dragDiffY = relativePos.y-minY;
			this.mouseX = clientX;
			this.mouseY = clientY;
			this.container.onmousemove = this.dragEvent.bind(this);
			document.onmouseup = this.stopDrag.bind(this);
			this.isDragging = true;
		},
		
		stopDrag: function() {
			this.onStopDrag(); // Call to overrideable method
			
			document.onmouseup = null;
			this.container.onmousemove = null;
			this.isDragging = false;
			this.clear();
		}
	});
	
	return DragDropManager;
});