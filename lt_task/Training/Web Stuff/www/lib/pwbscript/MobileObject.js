define([
		"Class",
		"pwbscript/Vector2d",
	], function(
		Class,
		Vector2d
	) {
		var MobileObject = Class.extend({
		_m: 0,			// mass
		_v: null,			// Velocity vector
		_lastV: null,		// The last updated vector (useful for collision detection
		_a: null,			// Acceleration vector
		//_pos: null,		// Position [x, y]
		x: null,
		y: null,
		lastX: null,
		lastY: null,
		_lastPos: null,	// Position [x, y]. Track the last position
		
		// TODO: accDecomposition
		
		// TODO: this is not realisic at all. It is just a shortcut to use instead of calculating
		//   rubber band force and dampening. Ideally, we should calculate this properly and remove this
		//   nonsense.
		reboundCoefficient: .9,
		
		init: function(x, y, m, v, a) {
			this.setPos(x, y);
			this._m = m;
			this._v = v;
			this._a = a;
		},
		
		getM: function() {
			return this._m;
		},

		setM: function(m) {
			this._m = m;
		},

		getV: function() {
			return this._v;
		},

		setV: function(v) {
			this._v = v;
		},

		getA: function() {
			return this._a;
		},

		setA: function(a) {
			this._a = a;
		},

		setPos: function(x, y) {
			this.lastX = this.x;
			this.lastY = this.y;
			this.x = x;
			this.y = y;
		},
		
		getX: function() {
			return this.x;
		},
		
		getY: function() {
			return this.y;
		},
		
		setX: function(x) {
			this.lastX = this.x;
			this.x = x;
		},
		
		setY: function(y) {
			this.lastY = lastY;
			this.y = y;
		},

		/**
		 * 
		 * @param t difference in time since last advance
		 * @return
		 */
		advance: function(t) {
			return this.update(t, true);
		},
		
		peek: function(t) {
			return this.update(t, false);
		},
		
		update: function(t, commit) {
			
			// TODO: have a version of this method that also accepts list of other MobileObjects,
			//   so we can look at the resultant movement vector and see if it intersects any of the other objects
			
			// Update the position
			var newX = this.calculatePos(this.x, this._v.x, this._a.x, t),
				newY = this.calculatePos(this.y, this._v.y, this._a.y, t),
			// Set the new velocity
				newVX = this.calculateV(this._v.x, this._a.x, t),
				newVY = this. calculateV(this._v.y, this._a.y, t);
			
			if (commit) {
				this.setPos(newX, newY);
				this.setV(new Vector2d(newVX, newVY));
				return this;
			}
			
			// TODO: this is probably really slow.. do we really need to create a new object?
			var copy = new MobileObject(this._x, this._y, this._m, this._v, this._a);
			//var copy = (JSON.parse(JSON.stringify(this)));
			//var copy = new Class.extend({}, this);

			copy.setPos(newX, newY);
			copy.setV(new Vector2d(newVX, newVY));
			return copy;
		},
		
		reboundFromPoints: function(p1, p2) {
			return this.rebound(Vector2d.createFromPoints(p1, p2));
		},
		
		rebound: function(segmentVector) {
			
			// Get the normal vector of the segment (a perpendicular vector to the one given) then normalize it.
			var normal = new Vector2d(-segmentVector.x, -segmentVector.y).asUnit();
			
			var dot = this._v.dot(normal);
			this._v.x = (2*normal.x*dot - this._v.x)*this.reboundCoefficient;
			this._v.y = (2*normal.y*dot - this._v.y)*this.reboundCoefficient;
			
			return this;
		},
		
		calculatePos: function(x0, v0, a, t) {
			// Optimized for when t or a is 0
			if (t === 0) {
				return x0;
			}
			
			if (a === 0) {
				return x0 + v0*t;
			}
			return x0 + v0*t + .5*a*t*t;
		},
		
		calculateV: function(v0, a, t) {
			return v0 + a*t;
		}
	});
	return MobileObject;
});
