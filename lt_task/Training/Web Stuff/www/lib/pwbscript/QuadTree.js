//ClassUtils.require(ClassUtils.root+"Rectangle.js", true);
define([
		"Class",
		"pwbscript/Rectangle"
	], function(
		Class,
		Rectangle
	) {
	var QuadTree = Class.extend({
		// TODO: the insert is the worst performance, and this is probably because of splitting. See what the performance is with a pre-made empty tree
		maxObjects: 10,
		maxLevel: 5,
		
		_level: null,
		_objects: null,
		_bounds: null,
		_nodes: null,
		_parent: null,
		_root: null,
		_levels: 0, // The total number of levels currently in the tree. This is only updated in the root.
		
		init: function(level, bounds, maxObjects, maxLevel, parent, root) {
			this._level = level;
			this._objects = [];
			this._bounds = bounds;
			this._nodes = null;
			this._parent = parent;
			this._root = root || this;
			this._root._levels = Math.max(this._root._levels, level);
			this.maxObjects = maxObjects || this.maxObjects;
			this.maxLevel = maxLevel || this.maxLevel;
		},
		
		clear: function() {
			this._objects = []
			this._nodes = null;
		},
		
		getRoot: function() {
			return this._root;
		},
		
		getParent: function() {
			return this._parent;
		},
		
		getMidPoint: function() {
			// Useful for deciding if you want to split your query shape when retrieving.
			//  Splitting adds extra overhead when retrieving, but can result in better results.
			//  For example, a query quad that the dividing segments of the QuadTree will return
			//  all of the descendant objects unless we split the query quad into smaller pieces.
			var bounds = this._bounds;
			return {x: bounds.x+bounds.w/2, y: bounds.y+bounds.h/2};
		},
		
		_split: function() {
			var bounds = this._bounds;
			var subWidth = Math.floor(bounds.w / 2),
				subHeight = Math.floor(bounds.h / 2),
				x = Math.floor(bounds.x),
				y = Math.floor(bounds.y);
			
			var nextLvl = this._level+1;
			this._nodes = [
				new QuadTree(nextLvl, new Rectangle(x + subWidth, y, subWidth, subHeight), this.maxObjects, this.maxLevel, this, this._root),
				new QuadTree(nextLvl, new Rectangle(x, y, subWidth, subHeight), this.maxObjects, this.maxLevel, this, this._root),
				new QuadTree(nextLvl, new Rectangle(x, y + subHeight, subWidth, subHeight), this.maxObjects, this.maxLevel, this, this._root),
				new QuadTree(nextLvl, new Rectangle(x + subWidth, y + subHeight, subWidth, subHeight), this.maxObjects, this.maxLevel, this, this._root)
			];
		},
		
		insertAll: function(o) {
			for (var i = 0, len = o.length; i < len; i++) {
				this.insert(o[i]);
			}
		},
		
		/*insert: function(o, bounds) {
			bounds = bounds || Rectangle.getBoundingRect(o, true);
			if (this._nodes) {
				var index = this._getIndex(bounds);

				if (index !== -1) {
					this._nodes[index].insert(o, bounds);
					return;
				}
			}
	 
			var objects = this._objects,
				nodes = this._nodes;
			objects.push({object:o, bounds:bounds});
		 
			if (objects.length > this.maxObjects && this._level < this.maxLevel) {
				if (!nodes) { 
					this._split(); 
				}

				var i = 0,
					object;
				for (var i = objects.length, len = objects.length; i < len; i++) {
					var index = this._getIndex(objects[i].bounds);
					if (index !== -1) {
						object = objects.splice(i--, 1)[0];
						nodes[index].insert(object.object, object.bounds);
					}
				}
			}
		},*/
		/*insert: function(o, bounds) {
			// ORIGINAL
			bounds = bounds || Rectangle.getBoundingRect(o, true);
			if (this._nodes) {
				var index = this._getIndex(bounds);

				if (index !== -1) {
					this._nodes[index].insert(o, bounds);
					return;
				}
			}
	 
			this._objects.push({object:o, bounds:bounds});
		 
			if (this._objects.length > this.maxObjects && this._level < this.maxLevel) {
				if (!this._nodes) { 
					this._split(); 
				}

				var i = 0,
					object;
				while (i < this._objects.length) {
					var index = this._getIndex(this._objects[i].bounds);
					if (index !== -1) {
						object = this._objects.splice(i, 1)[0];
						this._nodes[index].insert(object.object, object.bounds);
					} else {
						i++;
					}
				}
			}
		},*/
		insert: function(o, bounds) {
			bounds = bounds || Rectangle.getBoundingRect(o, true);
			if (this._nodes) {
				var index = this._getIndex(bounds);

				if (index !== -1) {
					this._nodes[index].insert(o, bounds);
					return;
				}
			}
	 
			this._objects.push({object:o, bounds:bounds});
		 
			if (this._objects.length > this.maxObjects && this._level < this.maxLevel) {
				if (!this._nodes) { 
					this._split(); 
				}

				for (var i = 0, len = this._objects.length, object, index; i < len; i++) {
					object = this._objects[i];
					index = this._getIndex(object.bounds);
					if (index !== -1) {
						--len;
						this._objects.splice(i--, 1);
						this._nodes[index].insert(object.object, object.bounds);
					}
				}
			}
		},

		getDescendants: function() {
			var arr = [],
				nodes = this._nodes;
			if  (nodes) {
				for (var i = 0, len = nodes.length; i < len; i++) {
					arr = arr.concat(nodes[i].getDescendants());
				}
			}
			arr.push(this);
			return arr;
		},
		
		getDescendantObjects: function(includeBounds) {
			var arr = [],
				nodes = this._nodes;
			if (nodes) {
				for (var i = 0, len = nodes.length; i < len; i++) {
					arr = arr.concat(nodes[i].getDescendantObjects());
				}
			}
			if (includeBounds) {
				return arr.concat(this._objects);
			} else {
				for (var i = 0, len = this._objects.length; i < len; i++) {
					arr.push(this._objects[i].object);
				}
				return arr;
			}
		},
		
		retrieveSplit: function(o, skipPruning) {
			// Alternate of retrieve(). This will split the query quad into the smallest rectangles possible,
			//  which results in fewer results.
			var bounds = Rectangle.getBoundingRect(o, true);
			var points = [{x:bounds.x, y:bounds.y}];
				
			// Split the rectangle (or line) into pointif applicable to catch all of the boxes it touches
			var p2x,
				p2y,
				isPoint = true;
			if (bounds.w) {
				isPoint = false;
				p2x = bounds.x+bounds.w;
				points.push({x:p2x, y:bounds.y});
			}
			if (bounds.h) {
				isPoint = false;
				p2y = bounds.y+bounds.h;
				points.push({x:bounds.x, y:p2y});
			}
			if (bounds.w && bounds.h) {
				isPoint = false;
				points.push({x:p2x, y:p2y});
			}
			
			if (!isPoint) {
				var resolution = Math.pow(2, this._root._levels),
					nodeBounds = this._bounds;
				if (!bounds.h) {
					var stepX = Math.floor(nodeBounds.w/resolution)
					var curX = bounds.x+stepX,
						endX = bounds.x+bounds.w;
					while (curX < endX) {
						points.push({x:curX, y:bounds.y});
						curX += stepX;
					}
				} else if (!bounds.w) {
					var stepY = Math.floor(nodeBounds.h/resolution);
					var curY = bounds.y+stepY,
						endY = bounds.y+bounds.h;
					while (curY < endY) {
						points.push({x:bounds.x, y:curY});
						curY += stepY;
					}
				} else {
					var stepX = Math.floor(nodeBounds.w/resolution),
						stepY = Math.floor(nodeBounds.h/resolution);
					var curX = bounds.x,
						curY = bounds.y+stepY,
						endX = bounds.x+bounds.w,
						endY = bounds.y+bounds.h;
					while (curX < endX) {
						while (curY < endY) {
							points.push({x:curX, y:curY});
							curY += stepY;
						}
						curY = bounds.y
						curX += stepX;
					}
				}
			}
			
			var leaves = [],
				results = [],
				ancestors = [],
				node,
				parent,
				// Get a bounding box for the leaves. We can use this to check the parent node objects to return
				minX = Number.MAX_VALUE,
				minY = Number.MAX_VALUE,
				maxX = 0,
				maxY = 0;
			
			for (var i = 0, len = points.length; i < len; i++) {
				var p = points[i];						
				
				node = this._retrieve(p);
				if (leaves.indexOf(node) === -1) {
					if (skipPruning) {
						leaves.push(this._retrieve(p));
					} else {
						var leaf = this._retrieve(p);
						if (!leaf._nodes) {
							var nodeBounds =  node._bounds;
							minX = Math.min(minX, nodeBounds.x);
							minY = Math.min(minY, nodeBounds.y);
							maxX = Math.max(maxX, nodeBounds.x+nodeBounds.w);
							maxY = Math.max(maxY, nodeBounds.y+nodeBounds.h);
							leaves.push(leaf);
						} else {
							// It is not a leaf. Split the point.
							var midPoint = leaf.getMidPoint();
							var splitX = p.x === midPoint.x,
								splitY = p.y === midPoint.y,
								newPoints;
							if (splitX && splitY) {
								newPoints = [
									{x:p.x-1, y:p.y-1},
									{x:p.x+1, y:p.y+1},
									{x:p.x+1, y:p.y-1},
									{x:p.x-1, y:p.y+1}
								];
							} else if (splitX) {
								newPoints = [
									{x:p.x-1, y:p.y},
									{x:p.x+1, y:p.y}
								];
							} else {
								newPoints = [
									{x:p.x, y:p.y-1},
									{x:p.x, y:p.y+1},
								];
							}
							points = points.concat(newPoints);
							len = points.length;
							continue;
						}
					}
					results = results.concat(node.getDescendantObjects());
				}
			};
			
			// We have all the hits from the leaves. Now test to see if the parent objects are contained in the bounding box formed by the leaves.
			var boundingRect = {x:minX, y:minY, w:maxX-minX, h:maxY-minY};
			for (var i = 0, len = leaves.length; i < len; i++) {
				parent = leaves[i].getParent();
				while (parent) {
					if (ancestors.indexOf(parent) > -1) {
						break;
					}
					ancestors.push(parent);
					if (parent._objects) {
						for (var j = 0, obj, len2 = parent._objects.length; j < len2; j++) {
							obj = parent._objects[j];
							if (skipPruning || this.shouldAdd(boundingRect, obj)) {
								results.push(obj.object);
							}
						}
					}
					parent = parent.getParent();
				}
			}
			return results;
		},
		
		shouldAdd: function(rect, object) {
			return Rectangle.intersects(rect, object.bounds);
		},
		
		_getIndex: function(bounds) {
			// Returns the index of the quadrant that completely contains the rect, or -1 if it cannot be contianed in a quadrant
			var midPoint = this.getMidPoint();

			var topQuadrant = (bounds.y < midPoint.y && bounds.y + bounds.h < midPoint.y),
				bottomQuadrant = (bounds.y > midPoint.y);

			// Object can completely fit within the left quadrants
			if (bounds.x < midPoint.x && bounds.x + bounds.w < midPoint.x) {
				if (topQuadrant) {
					return 1;
				} else if (bottomQuadrant) {
					return 2;
				}
			} else if (bounds.x > midPoint.x) {
				if (topQuadrant) {
					return 0;
				} else if (bottomQuadrant) {
					return 3;
				}
			}
			return -1;
		},
		
		retrieve: function(o, skipPruning) {
			// Find the targeted node. Then return all of its descendants plus all of
			//   the objects that are objects in its descendants that touch the target node.
			//	skipPruning: boolean. If set, we will not exclude parent objects that do not touch the target node
			var bounds = Rectangle.getBoundingRect(o, true);
			var targetNode = this._retrieve(bounds);
			var results = targetNode.getDescendantObjects(),
				targetBounds = targetNode._bounds,
				parent = targetNode.getParent();
			while (parent) {
				var i = 0,
					obj;
				if (parent._objects) {
					for (var i = 0, obj, len = parent._objects.length; i < len; i++) {
						obj = parent._objects[i];
						if (skipPruning || this.shouldAdd(targetBounds, obj)) {
							results.push(obj.object);
						}
					}
				}
				parent = parent.getParent();
			}
			return results;
		},
		
		_retrieve: function(bounds) {
			var index = this._getIndex(Rectangle.getBoundingRect(bounds)),
				nodes = this._nodes;
			if (index !== -1 && nodes) {
				// Add any objects that belong only to this parent
				return nodes[index]._retrieve(bounds);
			}
			return this;
		}
	});
	
	return QuadTree;
});