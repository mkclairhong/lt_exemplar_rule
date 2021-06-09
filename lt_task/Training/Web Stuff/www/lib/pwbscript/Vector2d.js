define([
		"Class"
	], function(
		Class
	) {
	var Vector2d = Class.extend({
		x: null,
		y: null,
		
		init: function(x, y) {
			this.x = x;
			this.y = y;
		},
		
		dot: function(that) {
			return Vector2d.dot(this, that);
		},
		
		cross: function(that) {
			return Vector2d.cross(this, that);
		},
		
		asUnit: function() {
			return Vector2d.asUnit(this);
		}
	});

	Vector2d.createFromPoints = function(p1, p2) {
		return new Vector2d(p2.x-p1.x, p2.y-p1.y);
	};

	Vector2d.dot = function(v1, v2) {
		// Dot product
		return v1.x*v2.x + v1.y*v2.y;
	};

	Vector2d.cross = function(v1, v2) {
		// Cross product
		return v1.x*v2.y - v1.y*v2.x;
	};

	Vector2d.asUnit = function(v) {
		var length = Math.sqrt(v.x*v.x + v.y*v.y);
		return new Vector2d(v.x/length, v.y/length);
	}

	return Vector2d;
});