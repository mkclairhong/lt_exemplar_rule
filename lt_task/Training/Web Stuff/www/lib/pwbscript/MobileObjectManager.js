define([
		"Class",
		"pwbscript/Vector2d"
	], function(
		Class,
		Vector2d
	) {
	var MobileObjectManager = Class.extend({
		
		_mobs: null,	// The array of mobile objects
		
		init: function() {
			this._mobs = [];
		}
	});

	// Statics
	MobileObjectManager.doRebound = function(mob, dt, segment) {
		return MobileObjectManager.doReboundFromPoints(mob, dt, segment.p1.x, segment.p1.y, segment.p2.x, segment.p2.y);
	}
		
	MobileObjectManager.doReboundFromPoints = function(mob, dt, segX1, segY1, segX2, segY2) {
		// Find the point at which the vector of the object and the segment intersect.
		// Note that this is why we use peek, because now we can use the original position of the object
		
		var x1 = mob.x,
				y1 = mob.y,
				x2 = mob.x+mob.getV().x,
				y2 = mob.y+mob.getV().y,
				x3 = segX1,
				y3 = segY1,
				x4 = segX2,
				y4 = segY2;
		
		// Account for vertical lines.
		var intersectionX,
			intersectionY,
			dxSeg0 = x2-x1,
			dxSeg1 = x4-x3;
		
		if (dxSeg0 === 0 && dxSeg1 === 0) {
			// TODO: probably an error in collision detection. Both segments are vertical.
			intersectionX = 0;
			intersectionY = 0;
		} else if (dxSeg0 === 0) {
			// If segment0 (the object's path) is vertical, the x-intercept is x1
			intersectionX = x1;
			
			// Get the equation for segment1 so we can get the y-intercept
			var slope = (y4 - y3)/dxSeg1;
			intersectionY = slope*(intersectionX - x3) + y3;
		} else if (dxSeg1 === 0) {
			// If segment1 (the segment the object rebounds against) is vertical, the x-intercept is x3
			intersectionX = x3;
			
			// Get the equation for segment0 so we can get the y-intercept
			var slope = (y2 - y1)/dxSeg0;
			intersectionY = slope*(intersectionX - x1) + y1;
		} else {
			var a1 = (y2-y1)/dxSeg0,
					a2 = (y4-y3)/dxSeg1;
			var b1 = y1 - a1*x1,
					b2 = y3 - a2*x3;
		
			intersectionX = -(b1-b2)/(a1-a2);
			intersectionY = a1*intersectionX + b1;
		}
		
		// Find the magnitude of the distance to the intersection point and the vectors
		var dx = Math.abs(intersectionX - mob.x),
			dy = Math.abs(intersectionY - mob.y);
		
		var distance = (dx+dy)*.5,
			avgA = (Math.abs(mob.getA().x)+Math.abs(mob.getA().y))*.5,
			v0 = (Math.abs(mob.getV().x)+Math.abs(mob.getV().y))*.5;
			
		// Now use our velocities and acceleration to find the time it took to hit the intersection point
		//   and the time left over
		var dtToIntersect;
		if (avgA !== 0) {
			// Get the velocity at the distance
			var v1 = Math.sqrt(Math.abs(v0*v0 + 2*avgA*distance));
			dtToIntersect = (v1 - v0)/avgA;
		} else {
			dtToIntersect = distance/v0;
		}
		var dtAfterIntersect = dt - dtToIntersect;
		
		mob.advance(dtToIntersect);
		mob.reboundFromPoints(new Vector2d(segX1,segY1), new Vector2d(segX2,segY2));
		mob.advance(dtAfterIntersect);
		return mob;
	};
	
	return MobileObjectManager;
});
