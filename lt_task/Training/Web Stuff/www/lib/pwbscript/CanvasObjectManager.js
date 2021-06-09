/** A class that can be used to add event listeners to objects on a canvas.
	To be tested against a point, the objects added to the manager must have a
	'pointIntersects' method which take a point {x: <x-pos>, y: <y-pos>} as an argument
	which returns true if the point is contained within the object.

	The manager will then automatically track and call certain events for those objects if
	the objects have any of the following methods defined:
		onClick
		onMouseEnter
		onMouseLeave
		onMouseDown
		onMouseUp
**/

define([
		"Class"
	], function(
		Class
	) {
	var CanvasObjectManager = Class.extend({
		container: null,
		scaleX: 1,
		scaleY: 1,

		// TODO: in addition to the objects object, consider maintaining an ordered array of the handles.
		//	then we could respect z-index, and optionally exit the testing loop when we find the first hit.
		_objects: null,


		init: function(containerNode) {
			if (containerNode) {
				this.container = containerNode;
			}
			this._objects = {};

			this.container.addEventListener("click", function(evt) {
				this.testPoint({x: evt.offsetX * this.scaleX, y: evt.offsetY * this.scaleY}, "click", evt);
			}.bind(this));
			this.container.addEventListener("mousedown", function(evt) {
				this.testPoint({x: evt.offsetX * this.scaleX, y: evt.offsetY * this.scaleY}, "mousedown", evt);
			}.bind(this));
			this.container.addEventListener("mouseup", function(evt) {
				this.testPoint({x: evt.offsetX * this.scaleX, y: evt.offsetY * this.scaleY}, "mouseup", evt);
			}.bind(this));
			this.container.addEventListener("mousemove", function(evt) {
				this.testPoint({x: evt.offsetX * this.scaleX, y: evt.offsetY * this.scaleY}, "mousemove", evt);
			}.bind(this));
			this.container.addEventListener("mouseout", function(evt) {
				this.resetObjects();
			}.bind(this));
		},

		addObject: function(object) {
			// Add an object to the manager.
			// Returns a handle that can be used to remove the object from the manager.
			var handle = this.generateUUID();
			this._objects[handle] = {
				object: object,
				mouseOver: false,
				mouseDownOccuredInObject: false // Track if the last mousedown event occurred inside the object. We can use that info to do better onClick calls.
			};
			return handle;
		},

		resetObjects: function() {
			// Reset all the variables on the object entries. Useful when mousing out of the main container.
			for (var handle in this._objects) {
				var entry = this._objects[handle];
				entry.mouseOver = false;
				entry.mouseDownOccuredInObject = false;
			}
		},

		removeObject: function(handle) {
			if (this._objects[handle]) {
				delete this._objects[handle];
			}
		},

		testPoint: function(point, eventType, event) {
			eventType = eventType || "";
			for (var handle in this._objects) {
				var entry = this._objects[handle];
				var obj = entry.object;
				if (!obj.pointIntersects) {
					console.warn("Object does not have a 'pointIntersects' method. Skipping...", obj);
					continue;
				}

				if (obj.pointIntersects(point)) {
					// The object contains the provided point. Now determine what events should be fired.
					switch(eventType) {
						case "mousemove":
							if (!entry.mouseOver && obj.onMouseEnter) {
								// The mouse cursor has just entered the object
								obj.onMouseEnter(event, entry);
							}
							entry.mouseOver = true;
							break;
						case "click":
							if (entry.mouseDownOccuredInObject && obj.onClick) {
								obj.onClick(event, entry);
							}
							// Clear any current mousedown tracking
							entry.mouseDownOccuredInObject = false;
							break;
						case "mousedown":
							if (obj.onMouseDown) {
								obj.onMouseDown(event, entry);
							}
							entry.mouseDownOccuredInObject = true;
							break;
						case "mouseup":
							if (obj.onMouseUp) {
								obj.onMouseUp(event, entry);
							}
							break;
						default:
							break;
					}
				} else {
					// The point is not inside this object.
					switch(eventType) {
						case "mousemove":
							if (entry.mouseOver && obj.onMouseEnter) {
								// The mouse cursor has just exited the object
								obj.onMouseLeave(event, entry);
							}
							entry.mouseOver = false;
							break;
						case "mouseup":
							// Clear any current mousedown tracking
							entry.mouseDownOccuredInObject = false;
							break;
						default:
							break;
					}
				}
			}
		},

		generateUUID: function() {
			// Generates a unique id.
			// TODO: consider moving this to some other utility class. it could be useful elsewhere
			var d = new Date().getTime();
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c=='x' ? r : (r&0x3|0x8)).toString(16);
			});
			return uuid;
		}
	});
	return CanvasObjectManager;
});
