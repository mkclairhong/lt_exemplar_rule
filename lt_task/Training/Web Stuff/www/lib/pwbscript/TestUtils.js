define([
		"Class",
		"pwbscript/MathUtils",
		"pwbscript/Rectangle"
	], function(
		Class,
		MathUtils,
		Rectangle
	) {
	TestUtils = {
		getRandPoint: function(min, max) {
			return {x: MathUtils.randInt(min, max), y: MathUtils.randInt(min, max)};
		},
		
		getRandCircle: function(min, max, minR, maxR) {
			return {x: MathUtils.randInt(min, max), y: MathUtils.randInt(min, max), r: MathUtils.randInt(minR, maxR)};
		},

		getRandSegment: function(min, max, maxD) {
			var p1 = {x: MathUtils.randInt(min, max), y: MathUtils.randInt(min, max)};
			return {
				p1:p1,
				p2:{x: p1.x+MathUtils.randInt(-maxD, maxD), y: p1.y+MathUtils.randInt(-maxD, maxD)}
			};
		},

		getRandRect: function(min, max, minD, maxD) {
			return {x:MathUtils.randInt(min, max),
				y: MathUtils.randInt(min, max),
				w: MathUtils.randInt(minD, maxD),
				h: MathUtils.randInt(minD, maxD)};
		},
		
		getRandRectangleObject: function(min, max, minD, maxD, minR, maxR) {
			minR = minR || 0;
			maxR = maxR || 0;
			return new Rectangle(
				MathUtils.randInt(min, max),
				MathUtils.randInt(min, max),
				MathUtils.randInt(minD, maxD),
				MathUtils.randInt(minD, maxD),
				MathUtils.rand(minR, maxR));
		},
		
		findDuplicates: function(arr) {
			// Returns the duplicates in an array
			var dups = [];
			for (var i = 0, len=arr.length; i<len; i++) {
				if (arr.lastIndexOf(arr[i]) !== i) {
					dups.push(arr[i]);
				}
			}
			return dups;
		}
	};
	
	return TestUtils;
});