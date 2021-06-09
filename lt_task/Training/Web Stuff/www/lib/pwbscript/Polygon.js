define([
		"Class",
		"pwbscript/Segment2d",
		"pwbscript/Rectangle"
	], function(
		Class,
		Segment2d,
		Rectangle
	) {
	var Polygon = Class.extend({
	
		_points: null,
		_segments: null,
		_boundingRect: null,
		_boundingBuffer: 0,
		
		init: function(params) {
			// params:
			//	{
			//		points: points array,
			//		boundingBuffer: integer value for the buffer area in pixels used to increase the size of the bounding rectangle
			//	}
				
				
			this._points = [];
			this._segments = [];
			if (params.boundingBuffer) {
				this._boundingBuffer = params.boundingBuffer
			}
			if (params.points) {
				this.setPoints(params.points);
			}
		},
		
		setPoints: function(pointsArray) {
			if (!pointsArray || pointsArray.length < 3) {
				throw ("Points do not form a valid polygon.");
			}
			this._points = pointsArray;	
			for (var i = 1; i < pointsArray.length; i++) {
				var point1 = pointsArray[i-1];
				var point2 = pointsArray[i];
				this._segments.push(new Segment2d(point1, point2));
			}
			// Close the shape with a segment from the last point to the first
			this._segments.push(new Segment2d(pointsArray[pointsArray.length-1], pointsArray[0]));
			
			// Now get the bounding rectangle for the polygon
			this._setBoundingRect();
		},
		
		_setBoundingRect: function() {
			var minX = Number.MAX_VALUE,
				minY = Number.MAX_VALUE,
				maxX = Number.MIN_VALUE,
				maxY = Number.MIN_VALUE;
				
			for (var i = 0; i < this._points.length; i++) {
				var point1 = this._points[i];
				minX = Math.min(minX, point1.x);
				minY = Math.min(minY, point1.y);
				maxX = Math.max(maxX, point1.x);
				maxY = Math.max(maxY, point1.y);
			}
			this._boundingRect = new Rectangle(minX-this._boundingBuffer, minY-this._boundingBuffer, maxY-minX+this._boundingBuffer, maxY-minY+this._boundingBuffer);
			return this._boundingRect;
		},
		
		getBoundingRectangle: function() {
			return this._boundingRect;
		},
		
		getPoints: function() {
			return this._points();
		},
		
		getSegments: function() {
			return this._segments;
		}
	});
	
	// Statics
	Polygon.doPolygonsIntersect = function(a, b) {
		// Adapted from http://stackoverflow.com/questions/641219/how-can-i-perform-collision-detection-on-rotated-rectangles
		// a and b are points arrays for convex polygons.
		// Returns true if the polygons intersect.
		// TODO: we can make a specialized version of this for rectangles. It can be faster since we know that opposite sides of the shape are parallel 
		var polygons = [a, b];
		var minA, maxA, projected, i, i1, j, minB, maxB;

		for (i = 0; i < polygons.length; i++) {

			// for each polygon, look at each edge of the polygon, and determine if it separates
			// the two shapes
			var polygon = polygons[i];
			//var points = Rectangle.getPoints(polygons[i]);
			for (i1 = 0; i1 < polygon.length; i1++) {

				// grab 2 vertices to create an edge
				var i2 = (i1 + 1) % polygon.length;
				var p1 = polygon[i1];
				var p2 = polygon[i2];

				// find the line perpendicular to this edge
				var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

				minA = maxA = undefined;
				// for each vertex in the first shape, project it onto the line perpendicular to the edge
				// and keep track of the min and max of these values
				for (j = 0; j < polygons[0].length; j++) {
					projected = normal.x * polygons[0][j].x + normal.y * polygons[0][j].y;
					if (minA === undefined || projected < minA) {
						minA = projected;
					}
					if (maxA === undefined || projected > maxA) {
						maxA = projected;
					}
				}

				// for each vertex in the second shape, project it onto the line perpendicular to the edge
				// and keep track of the min and max of these values
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

				// if there is no overlap between the projects, the edge we are looking at separates the two
				// polygons, and we know there is no overlap
				if (maxA < minB || maxB < minA) {
					return false;
				}
			}
		}
		return true;
	};
	
	return Polygon;
});