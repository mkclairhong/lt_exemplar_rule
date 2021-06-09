define([
		"Class"
	], function(
		Class
	) {
	var Deferred = Class.extend({
	
		promise: null,
		_resolveObj: null,
		_rejectObject: null,
		
		init: function() {
			this.promise = new Promise(function(resolve, reject) {
				this._resolveObj = resolve;
				this._rejectObject = reject;
			}.bind(this));
		},
		
		resolve: function(args) {
			this._resolveObj.apply(null, arguments);
		},
		
		reject: function(args) {
			this._rejectObject.apply(null, arguments);
		},
		
		then: function(fn) {
			this.promise.then(fn);
		}
	});
	
	return Deferred;
});