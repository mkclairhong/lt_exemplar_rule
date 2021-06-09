define([
		"Class"
	], function(
		Class
	) {
	var Fraction = Class.extend({
	
		num: null,
		den: null,
		
		init: function(num, den) {
			this.num = num;
			this.den = den;
		}
	});
	return Fraction;
});