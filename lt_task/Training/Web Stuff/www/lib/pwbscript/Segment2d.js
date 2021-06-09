define([
		"Class",
		"pwbscript/Point2d",
		"pwbscript/Vector2d"
	], function(
		Class,
		Point2d,
		Vector2d
	) {
	var Segment2d = Class.extend({
		p1: null,
		p2: null,
		
		init: function(p1, p2) {
			this.p1 = p1;
			this.p2 = p2;
		},
		
		intersects: function(seg2) {
			return Segment2d.intersects(this, seg2);
		},
		
		intersectionPoint: function(seg2) {
			return Segment2d.intersectionPoint(this, seg2);
		}
	});


	// Statics
	Segment2d.fromPoints = function(p1x, p1y, p2x, p2y) {
		return new Segment2d(new Point2d(p1x, p1y), new Point2d(p2x, p2y));
	};

	Segment2d.direction = function(pi, pj, pk) {
		var d1 = new Vector2d(pk.x-pi.x, pk.y-pi.y),
			d2 = new Vector2d(pj.x-pi.x, pj.y-pi.y);
		return d1.cross(d2);
	};
		
	Segment2d.onSegment = function(pi, pj, pk) {
		if (pk.x >= Math.min(pi.x, pj.x)
				&& pk.x <= Math.max(pi.x, pj.x)
				&& pk.y >= Math.min(pi.y, pj.y)
				&& pk.y <= Math.max(pi.y, pj.y)) {
			return true;
		}
		return false;
	};

	Segment2d.intersects = function(s1, s2) {
		// http://math.stackexchange.com/questions/113331/determine-if-2-line-segments-are-intersecting
		var p1 = s1.p1,
			p2 = s1.p2,
			p3 = s2.p1,
			p4 = s2.p2;
		
		var d1 = Segment2d.direction(p3, p4, p1),
			d2 = Segment2d.direction(p3, p4, p2),
			d3 = Segment2d.direction(p1, p2, p3),
			d4 = Segment2d.direction(p1, p2, p4);
		
		if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0))
				&& ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
			return true;
		}
		
		if (d1 === 0 && Segment2d.onSegment(p3, p4, p1)) {
			return true;
		}
		if (d2 === 0 && Segment2d.onSegment(p3, p4, p1)) {
			return true;
		}
		if (d3 === 0 && Segment2d.onSegment(p1, p2, p3)) {
			return true;
		}
		if (d4 === 0 && Segment2d.onSegment(p1, p2, p4)) {
			return true;
		}
		return false;
	};

	/**
	 * 
	 * @return the intersection point of the lines formed from the segments. Null if the lines do not intersect
	 */
	Segment2d.intersectionPoint = function(s1, s2) {
		var p1 = s1.p1,
			p2 = s1.p2,
			p3 = s2.p1,
			p4 = s2.p2;
		
		// Account for vertical lines.
		var intersectionX,
			intersectionY,
			dxSeg0 = p2.x-p1.x,
			dxSeg1 = p4.x-p3.x;
		
		if (dxSeg0 === 0 && dxSeg1 === 0) {
			//intersectionX = 0;=
			return null;
		} else if (dxSeg0 === 0) {
			// If segment0 is vertical, the x-intercept is x1
			intersectionX = p1.x;
			
			// Get the equation for segment1 so we can get the y-intercept
			var slope = (p4.y - p3.y)/dxSeg1;
			intersectionY = slope*(intersectionX - p3.x) + p3.y;
		} else if (dxSeg1 === 0) {
			// If segment1 (the segment the object rebounds against) is vertical, the x-intercept is x3
			intersectionX = p3.x;
			
			// Get the equation for segment0 so we can get the y-intercept
			var slope = (p2.y - p1.y)/dxSeg0;
			intersectionY = slope*(intersectionX - p1.x) + p1.y;
		} else {
			var a1 = (p2.y-p1.y)/dxSeg0,
					a2 = (p4.y-p3.y)/dxSeg1;
			var b1 = p1.y - a1*p1.x,
					b2 = p3.y - a2*p3.x;
					
			intersectionX = -(b1-b2)/(a1-a2);
			intersectionY = a1*intersectionX + b1;
		}
		
		return new Vector2d(intersectionX, intersectionY);
	};
	
	return Segment2d;
});
