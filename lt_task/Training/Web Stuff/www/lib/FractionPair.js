define([
		"Class"
	], function(
		Class
	) {
	var FractionPair = Class.extend({
	
		num1: null,
		den1: null,
		num2: null,
		den2: null,
		
		init: function(num1, den1, num2, den2) {
			this.num1 = num1;
			this.den1 = den1;
			this.num2 = num2;
			this.den2 = den2;
		}
	});
	return FractionPair;
});