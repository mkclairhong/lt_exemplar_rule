define([
		"Class"
	], function(
		Class
	) {
	var Point2d = Class.extend({
		x: null,
		y: null,
		
		init: function(x, y) {
			this.x = x;
			this.y = y;
		},
		
		getDistance: function(p2) {
			return Point2d.getDistance(this, p2);
		}
	});

	// Statics
	Point2d.getDistance = function(p1, p2) {
		var xd = p2.x-p1.x,
			yd = p2.y-p1.y;
		return Math.sqrt(xd*xd + yd*yd);
	};
	
	return Point2d;
});