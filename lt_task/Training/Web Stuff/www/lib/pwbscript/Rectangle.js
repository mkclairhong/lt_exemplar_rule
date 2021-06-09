define([
		"Class",
		"pwbscript/MathUtils"
	], function(
		Class,
		MathUtils
	) {
	var Rectangle = Class.extend({
		x: null,
		y: null,
		w: null,
		h: null,
		
		init: function(x, y, w, h, rot) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.rot = rot;
		}
	});

	// Statics
	Rectangle.intersects = function (r1, r2) {
		// r2 can be a rectangle or point
		if (r2.w || r2.h) {
			return (r1.x < r2.x+r2.w && r1.x+r1.w > r2.x && r1.y < r2.y+r2.h && r1.y+r1.h > r2.y);
		} else {
			return r2.x >= r1.x && r2.x <= r1.x+r1.w && r2.y >= r1.y && r2.y <= r1.y+r1.h
		}
	};

	Rectangle.intersectsBoundingPoints = function (r1, r2) {
		var p1 = r1.p1,
			p2 = r1.p2;
		if (r2.p2) {
			p3 = r2.p1,
			p4 = r2.p2;
			return (p1.x < p4.x && p2.x > p3.x && p1.y < p4.y && p2.y > p3.y);
		} else {
			return r2.x >= p1.x && r2.x <= p2.x && r2.y >= p1.y && r2.y <= p2.y;
		}
	};
				
	Rectangle.normalize = function(rect) {
		
		if (rect.w < 0) {
			rect.x = rect.x + rect.w;
			rect.w = Math.abs(rect.w);
		}
		if (rect.h < 0) {
			rect.y = rect.y + rect.h;
			rect.h = Math.abs(rect.h);
		}
		rect.normalized = true;
		return rect;
	};

	Rectangle.getBoundingRect = function(o, normalize) {
		// o can be a point, rectangle, segment, or circle. For example
		// 	o = {x:100, y:100};
		//  o = {x:100, y:100, w:10, h:20};
		//  o = {p1:{x:100, y:100}, p2:{x:200, y:200}};
		//  o = {x:100, y:100, r: 10};
		//	Additionally, if o has a "bounds" attribute that describes its bounding rectangle, we can skip the step
		//	  where we calculate the bounds
		
		if (o.bounds && (o.bounds.w || o.bounds.h)) {
			if (normalize && !o.bounds.normalized) {
				return Rectangle.normalize(o.bounds);
			}
			return o.bounds;
		}
		
		var bounds;
		if (o.p2) {
			// Segment
			bounds = {
				x: o.p1.x,
				y: o.p1.y,
				w: o.p2.x-o.p1.x,
				h: o.p2.y-o.p1.y,
				p1: o.p1,
				p2: o.p2
			};
		} else if (o.r) {
			// Circle
			var d = o.r*2;
			bounds = {
				x: o.x-o.r,
				y: o.y-o.r,
				w: d,
				h: d,
				r: o.r,
				cx: o.x,
				cy: o.y
			};
		} else {
			// Point or rect. Common case
			bounds = {
				x: o.x,
				y: o.y,
				w: o.w || 0,
				h: o.h || 0
			};
		}
		
		if (normalize && !o.normalized) {
			return Rectangle.normalize(bounds);
		}
		return bounds;
	};

	Rectangle.getBoundingRectFromArray = function(oArr) {
		// oArr is an array of objects
		// This method will provide the bounding rectangle given all of the objects
		
		var minX = Number.MAX_VALUE,
			maxX = Number.MIN_VALUE,
			minY = Number.MAX_VALUE,
			maxY = Number.MIN_VALUE;
		var o,
			p1,
			p2;
		for (var i = 0; i < oArr.length; i++) {
			o = oArr[i];
			if (o.p2) {
				// Already a segment
				p1 = o.p1;
				p2 = o.p2;
			} else if (o.w || o.h) {
				// Rect
				p1 = {x:o.x, y:o.y};
				p2 = {x:o.x+o.w, y:o.y+o.h};
			} else if (o.r) {
				// Circle
				var d = o.r*2;
				p1 = {x:o.x, y:o.y};
				p2 = {x:o.x+d, y:o.y+d};
			} else {
				// Point
				p1 = p2 = {x:o.x, y:o.y};
			}
			
			minX = Math.min(minX, p1.x, p2.x);
			maxX = Math.max(maxX, p1.x, p2.x);
			minY = Math.min(minY, p1.y, p2.y);
			maxY = Math.max(maxY, p1.y, p2.y);
		}
		return {p1: {x: minX, y: minY}, p2: {x: maxX, y: maxY}};
	};

	Rectangle.normalizeBoundingPoints = function(p1, p2) {
		var minX = Math.min(p1.x, p2.x),
			maxX = Math.max(p1.x, p2.x),
			minY = Math.min(p1.y, p2.y),
			maxY = Math.max(p1.y, p2.y);
		return {p1:{x:minX, y:minY}, p2:{x:maxX, y:maxY}, normalized:true};
	};

	Rectangle.getBoundingPoints = function(o, normalize) {
		// o can be a point, rectangle, segment, or circle. For example
		// 	o = {x:100, y:100};
		//  o = {x:100, y:100, w:10, h:20};
		//  o = {p1:{x:100, y:100}, p2:{x:200, y:200}};
		//  o = {x:100, y:100, r: 10};
		//	Additionally, if o has a "bounds" attribute that describes its bounding points, we can skip the step
		//	  where we calculate the points
		
		if (o.bounds && o.bounds.p2) {
			if (normalize && !o.bounds.normalized) {
				return Rectangle.normalizeBoundingPoints(o.bounds.p1, o.bounds.p2);
			}
		}
		
		var p1,
			p2;
		if (o.p2) {
			// Already a segment
			p1 = o.p1;
			p2 = o.p2;
		} else if (o.w || o.h) {
			// Rect
			p1 = {x:o.x, y:o.y};
			p2 = {x:o.x+o.w, y:o.y+o.h};
		} else if (o.r) {
			// Circle
			var d = o.r*2;
			p1 = {x:o.x, y:o.y};
			p2 = {x:o.x+d, y:o.y+d};
		} else {
			// Point
			p1 = p2 = {x:o.x, y:o.y};
		}
		
		if (normalize && !o.normalized) {
			return Rectangle.normalizeBoundingPoints(p1, p2);
		}
		return {p1:p1, p2:p2};
	};

	Rectangle.getPoints = function(r) {
		// Assumes rectangle is normalized
		
		// Get the axis-aligned points
		var farX = r.x+r.w,
			farY = r.y+r.h,
			rot = r.rot;
		
		if (!r.rot) {
			 return [
				{x: r.x, y: r.y},
				{x: farX, y: r.y},
				{x: farX, y: farY},
				{x: r.x, y: farY}
			];
		}
		
		// Translate to the origin, and rotate about that
		var points = [
			{x: 0, y: 0},
			{x: r.w, y: 0},
			{x: r.w, y: r.h},
			{x: 0, y: r.h}
		];
		
		return MathUtils.translatePoints(points, r.x, r.y, rot);
	};
	
	Rectangle.doRectanglesIntersect = function(a, b) {
		// Simplified version of Polygon.doPolygonsIntersect specifically for rectangles.
		//It can be faster since we know that opposite sides of the shape are parallel 
		var polygons = [a, b];
		var minA, maxA, projected, i, i1, j, minB, maxB;

		for (i = 0; i < polygons.length; i++) {
			var polygon = polygons[i];
			
			// Since we are comparing rectangles, we know that the polygons are both rectangles,
			//	that means we can reduce the number of calculations, since we know that the opposite sides should
			//	always be parallel for each polygon
			for (i1 = 0; i1 < 2; i1++) {
				var i2 = (i1 + 1) % polygon.length;
				var p1 = polygon[i1];
				var p2 = polygon[i2];
				var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

				minA = maxA = undefined;
				for (j = 0; j < polygons[0].length; j++) {
					projected = normal.x * polygons[0][j].x + normal.y * polygons[0][j].y;
					if (minA === undefined || projected < minA) {
						minA = projected;
					}
					if (maxA === undefined || projected > maxA) {
						maxA = projected;
					}
				}

				minB = maxB = undefined;
				for (j = 0; j < polygons[1].length; j++) {
					projected = normal.x * polygons[1][j].x + normal.y * polygons[1][j].y;
					if (minB === undefined || projected < minB) {
						minB = projected;
					}
					if (maxB === undefined || projected > maxB) {
						maxB = projected;
					}
				}

				if (maxA < minB || maxB < minA) {
					return false;
				}
			}
		}
		return true;
	};
		
	return Rectangle;
});