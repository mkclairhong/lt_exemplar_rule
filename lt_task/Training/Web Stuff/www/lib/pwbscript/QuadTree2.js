/**
	Instead of building the quad tree cells as objects are added, use a pre-built tree
	that is already divided into the smallest-level cells.
	Then we use some bit-shift tricks to determine the cell at which to place the objects in constant time.
**/
define([
		"Class",
		"pwbscript/MathUtils",
		"pwbscript/Rectangle"
	], function(
		Class,
		MathUtils,
		Rectangle
	) {
	var QuadTree2 = Class.extend({
		maxLevel: null,
		w: null,
		h: null,
		
		_size: 512,
		_testLevel: null,
		_nodes: null,
		_maxShiftFactor: null,
		_scaleX: null,
		_scaleY: null,
		
		init: function(w, h, maxLevel) {
			this.w = w;
			this.h = h;
			this.maxLevel = maxLevel;
			this._testLevel = MathUtils.log(this._size, 2);
			this._maxShiftFactor = this._testLevel-this.maxLevel;
			
			this._scaleX = (this._size-1)/this.w;
			this._scaleY = (this._size-1)/this.h;
			this.clear();
		},
		
		
		clear: function() {
			// We will use a flattened 2d-array for the nodes.
			this._nodes = [];
			for (var i = 0; i <= this.maxLevel; i++) {
				this._nodes.push([]);
			}
		},
		
		_toTreeCoordsPoint: function(p) {
			return {x:p.x*this._scaleX, y:p.y*this._scaleY};
		},
		
		_toTreeCoordsBoundingPoints: function(bounds) {
			var p1 = bounds.p1,
				p2 = bounds.p2;
			return {p1:{x:p1.x*this._scaleX, y:p1.y*this._scaleY}, p2:{x:p2.x*this._scaleX, y:p2.y*this._scaleY}};
		},
		
		_toTreeCoordsRect: function(rect) {
			return {x:rect.x*this._scaleX, y:rect.y*this._scaleY, w:rect.w*this._scaleX, h:rect.h*this._scaleY};
		},
		
		_createNode: function(level, xIndex, yIndex) {
			return {
				parent: null,
				objects: [],
				bounds: [],
				level: level,
				xIndex: xIndex,
				yIndex: yIndex
			};
		},
		
		_getMostSignificantBit: function(num) {
			// Return the index (starting at index 1) of the most significant bit that is set
			if (num === 0) {
				return 0;
			}
			return Math.floor(num).toString(2).length;
		},
		
		_getShiftFactorForLevel: function(level) {
			return this._maxShiftFactor+this.maxLevel-level;
		},
		
		_getNodeInfo: function(p1, p2) {
			// Using a bit hack, get the info to find the level, x, and y indexes of the node containing the bounding points
			
			// Perform our bit hack to find the level that the node resides, as well as its index
			var bitIndexX = this._getMostSignificantBit(p1.x ^ p2.x),
				bitIndexY = this._getMostSignificantBit(p1.y ^ p2.y),
				//minBitIndex = Math.min(bitIndexX, bitIndexY),
				//insertLevel = this._testLevel-(Math.max(bitIndexX, bitIndexY)), // This is the fastest, but will yeild a range of -1 to testLevel
				//insertLevel = Math.min(maxLevel, this._testLevel-(Math.max(bitIndexX, bitIndexY))), // slightly slower, but gives results from -1 to maxLevel
				level = Math.min(this.maxLevel, Math.max(0, this._testLevel-(Math.max(bitIndexX, bitIndexY)))); // slightly slower still, but gives results from 0 to maxLevel. Most accurate. // TODO: this is apparently possibel to do faster using the minBitIndex
				return this._getNodeInfo2(level, p1.x, p1.y);
		},
		
		_getNodeInfoFromPoint: function(p1) {
				return this._getNodeInfo2(this.maxLevel, p1.x, p1.y);
		},
		
		_getNodeInfo2: function(level, xPos, yPos) {
			var shiftFactor = this._getShiftFactorForLevel(level),
				xIndex = (xPos >> shiftFactor),
				yIndex = (yPos >> shiftFactor);
			return {level:level, xIndex:xIndex, yIndex:yIndex};
		},
		
		_getBoundsForNode: function(node) {
			var sizeAtLevel = this._size/Math.pow(2, node.level),
				p1 = {x:sizeAtLevel*node.xIndex, y:sizeAtLevel*node.yIndex},
				p2 = {x:p1.x+sizeAtLevel, y:p1.y+sizeAtLevel};
			return {p1:p1, p2:p2};
		},
		
		_getNodeAtLevel: function(level, xIndex, yIndex) {
			var index = this._getNodeIndexAtLevel(level, xIndex, yIndex);
			return this._nodes[index[0]][index[1]];
		},
		
		_getNodeIndexAtLevel: function(level, xIndex, yIndex) {
			return [level, yIndex*(1<<level)+xIndex];
		},
		
		_getOrCreateNode: function(level, xIndex, yIndex) {
			var index = this._getNodeIndexAtLevel(level, xIndex, yIndex),
				node = this._nodes[index[0]][index[1]];	
			if (!node) {
				node = this._nodes[index[0]][index[1]] = this._createNode(level, xIndex, yIndex);
			}
			return node;
		},
		
		_getOrCreateParent: function(node) {
			if (node.level <= 0) {
				return null;
			}
			var parent = node.parent;
			if (parent) {
				return parent;
			}
			parent = this._getOrCreateNode(node.level-1, node.xIndex>>1, node.yIndex>>1);
			node.parent = parent;
			return parent;
		},
		
		_getAscendants: function(node, exclusive) {
			var res = [];
			if (!exclusive) {
				res.push(node);
			}
			node = this._getOrCreateParent(node);
			while (node) {
				res.push(node);
				node = this._getOrCreateParent(node);
			}
			return res;
		},
		
		_getAscendants2: function(level, xIndex, yIndex, exclusive) {
			var node = this._getOrCreateNode(level, xIndex, yIndex);
			return this._getAscendants(node, exclusive);
		},
		
		_getChildren: function(node) {
			if (node.level >= this.maxLevel) {
				return null;
			}
			var childIndexX = node.xIndex<<1,
				childIndexY = node.yIndex<<1,
				level = node.level+1;
			return [
				this._getOrCreateNode(level, childIndexX, childIndexY),
				this._getOrCreateNode(level, childIndexX+1, childIndexY),
				this._getOrCreateNode(level, childIndexX, childIndexY+1),
				this._getOrCreateNode(level, childIndexX+1, childIndexY+1)
			];
		},
		
		getDescendants: function() {
			console.error("NODES", this._nodes);
			return this._nodes;
		},
		
		_getDescendants: function(node, exclusive) {
			var res = [],
				childNodes;
			if (!exclusive) {
				res.push(node);
			}
			if (node.level >= this.maxLevel) {
				return res;
			}
			childNodes = this._getChildren(node);
			for (var i=0, len=childNodes.length; i<len; i++) {
				res = res.concat(this._getDescendants(childNodes[i], true));
			}
			res = res.concat(childNodes);
			return res;
		},
		
		_getDescendants2: function(level, xIndex, yIndex, exclusive) {
			var node = this._getOrCreateNode(level, xIndex, yIndex);
			return desc = this._getDescendants(node);
		},
		
		insertAll: function(o) {
			// TODO: do to the way insert works, we could probably do it asynchornously.
			for (var i=0, len = o.length; i<len; i++) {
				this.insert(o[i]);
			}
		},
		
		insert: function(o) {
			var bounds = this._toTreeCoordsBoundingPoints(Rectangle.getBoundingPoints(o, true)),
				p1 = bounds.p1,
				p2 = bounds.p2;
			
			// Perform our bit hack to find the level that the node resides, as well as its index
			var nodeInfo = this._getNodeInfo(p1, p2);
				node = this._getOrCreateNode(nodeInfo.level, nodeInfo.xIndex, nodeInfo.yIndex);
			node.objects.push(o);
			node.bounds.push(bounds);
		},
		
		retrieveSplit: function(o, skipPruning) {
			// TODO: NOT WORKING YET
			//	get the bounding rect of the object
			//	split it into 2d points based on the size of a box at the max level
			//	retrieve all of the unique nodes that reult from a retrieve on all of the points
			//	track the bounding box of the leaves that we touch.
			//	use that bounding box to prune the results
			
			// TODO: Actually, i think this is working now. I need to verify that.
			
			var bounds = this._toTreeCoordsRect(Rectangle.getBoundingRect(o, true));
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
				var resolution = Math.pow(2, this.maxLevel),
					stepX = stepY = Math.floor(this._size/resolution);
				if (!bounds.h) {
					var curX = bounds.x+stepX,
						endX = bounds.x+bounds.w;
					while (curX < endX) {
						points.push({x:curX, y:bounds.y});
						curX += stepX;
					}
				} else if (!bounds.w) {
					var curY = bounds.y+stepY,
						endY = bounds.y+bounds.h;
					while (curY < endY) {
						points.push({x:bounds.x, y:curY});
						curY += stepY;
					}
				} else {
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
			
			// We have our grid of points. Now start retrieving them
			var leaves = [],
				ancestors = [],
				res = [],
				minX = minY = Number.MAX_VALUE,
				maxX = maxY = Number.MIN_VALUE;
			
			for (var i=0, len=points.length, p, node, leafBounds, ascendants; i<len; i++) {
				p = points[i];
				node = this._getNodeAtPoint(p);
				if (leaves.indexOf(node) === -1) {
					// The leaf has not been added yet.
					// Add all of the objects from the leaf immediately. We know we do not need to prune the results from the leaves.
					leaves.push(node);
					res = res.concat(node.objects);
					leafBounds = this._getBoundsForNode(node);
					minX = Math.min(minX, leafBounds.p1.x);
					minY = Math.min(minY, leafBounds.p1.y);
					maxX = Math.max(maxX, leafBounds.p2.x);
					maxY = Math.max(maxY, leafBounds.p2.y);
				}
				
				// Now, add any ancestor nodes that have not already been added
				node = this._getOrCreateParent(node);
				while (node) {
					if (ancestors.indexOf(node) === -1) {
						ancestors.push(node);
						if (skipPruning) {
							res = res.concat(node.objects);
						}
					} else {
						// Exit the loop, since there is no reason to go higher in the node's hierarchy.
						break;
					}
					node = this._getOrCreateParent(node);
				}
			}
			
			// We have all the objects from the leaves. Now, add the nodes from the ascendants that are within
			//   the bounding rectangle formed by the leaves.
			if (!skipPruning) {
				var boundingRect = {p1:{x:minX, y:minY}, p2:{x:maxX, y:maxY}};
				for (var i=0, len=ancestors.length, node; i<len; i++) {
					node = ancestors[i];
					objects = node.objects;
					bounds = node.bounds;
					for (var j=0, len2=objects.length, object; j<len2; j++) {
						if (Rectangle.intersectsBoundingPoints(boundingRect, bounds[j])) {
							res.push(objects[j]);
						}
					}
				}
			}
			return res;
		},
		
		retrieve: function(o, skipPruning) {
			var bounds = this.__toTreeCoordsBoundingPoints(Rectangle.getBoundingPoints(o, true)),
				nodes = this._retrieve(o, bounds),
				targetNode = nodes[0],
				nodeBounds
				res = [];;
			// Nothing will be prunied if the target node is the root, so always skip pruning in this case.
			skipPruning = skipPruning || !targetNode.level;
			if (!skipPruning) {
				nodeBounds = this._getBoundsForNode(targetNode);
			}
			for (var i=0, len=nodes.length, node, nodeBounds; i<len; i++) {
				node = nodes[i];
				for (var j=0, len2=node.objects.length, object; j<len2; j++) {
					if (skipPruning || Rectangle.intersectsBoundingPoints(nodeBounds, node.bounds[j])) {
						res.push(node.objects[j]);
					}
				}
			}
			return res;
		},
		
		_retrieve: function(o, bounds) {
			var p1 = bounds.p1,
				p2 = bounds.p2;
			
			var nodeInfo = this._getNodeInfo(p1, p2),
				node = this._getOrCreateNode(nodeInfo.level, nodeInfo.xIndex, nodeInfo.yIndex);
			return this._getAscendants(node).concat(this._getDescendants(node, true));
		},
		
		_retrievePoint: function(p1) {		
			var nodeInfo = this._getNodeInfoFromPoint(p1),
				node = this._getOrCreateNode(nodeInfo.level, nodeInfo.xIndex, nodeInfo.yIndex);
			return this._getAscendants(node);
		},
		
		_getNodeAtPoint: function(p1) {
			var nodeInfo = this._getNodeInfoFromPoint(p1);
			return node = this._getOrCreateNode(nodeInfo.level, nodeInfo.xIndex, nodeInfo.yIndex);
		}
	});
	
	return QuadTree2;
});