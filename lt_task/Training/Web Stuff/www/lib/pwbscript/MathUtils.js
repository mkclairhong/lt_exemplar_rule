define([], function() {
	var MathUtils = {
		rand: function(min, max) {
			return Math.random()*(max-min)+min;
		},
		
		randInt: function(min, max) {
			return Math.floor(Math.random()*(max-min+1)+min);
		},
		
		/**
		 * 
		 * @param arr
		 * @return the greatest number in the Array
		 */
		getExtremeHigh: function(arr) {
			var i = 1,
				newHigh = arr[0];
			for (; i < arr.length; i++) {
				newHigh = Math.max(newHigh, arr[i]);
			}
			return newHigh;
		},
		
		/**
		 * 
		 * @param arr
		 * @return the smallest number in the Array
		 */
		getExtremeHigh: function(arr) {
			var i = 1,
				newLow = arr[0];
			for (; i < arr.length; i++) {
				newLow = Math.min(newLow, arr[i]);
			}
			return newLow;
		},
		
		getExtremes: function(arr) {
			var i = 1,
				newHigh = arr[0],
				newLow = arr[0];
			for (; i < arr.length; i++) {
				newHigh = Math.max(newHigh, arr[i]);
				newLow = Math.min(newLow, arr[i]);
			}
			return {
				high: newHigh,
				low: newLow
			};
		},
		
		/**
		 * normalizes the entries ArrayList based upon the min and max
		 * The lowest number in the array will map to the min, and the highest will be mapped to the max.
		 * @param min
		 * @param max
		 * @param arr
		 */
		normalizeAll: function(arr, min, max) {
			var extremes = this.getExtremes(arr);
			
			var extremeHigh = extremes.high,
				extremeLow = extremes.low,
				diff = extremes.high-extremes.low,
				scaleDiff = max-min;
			
			var i = 0,
				scale = scaleDiff/diff,
				normalized = [];
				
			for (; i < arr.length; i++) {
				normalized.push((((arr[i]-extremeLow)*scale)+min));
			}
		},
		
		/**
		 * @param number
		 * @param actualMin
		 * @param actualMax
		 * @param scaledMin
		 * @param scaledMax
		 * @return a normalized translation of the number given the parameters. For example, normalize(50, 0, 100, -1, 1); would return 0.
		 */
		normalize: function(number, actualMin, actualMax, scaledMin, scaledMax) {
			var diff = actualMax-actualMin,
				scaleDiff = scaledMax-scaledMin;
			var scale = scaleDiff/diff;
			return ((number-actualMin)*scale)+scaledMin;
		},
		
		log: function(num, base) {
			return Math.log(num)/Math.log(base);
		},
		
		/**
		 * @param pArr an array of 2d points
		 * @param x the x-translation
		 * @param y the y-translation
		 * @param rot the rotation translation in radians
		**/
		
		translatePoints: function(pArr, x, y, rot) {
		
			var cosT = Math.cos(rot),
				sinT = Math.sin(rot),
				len = pArr.length,
				translated = [];
			
			for (var i = 0, p; i < len; i++) {
				p = pArr[i];
				translated.push({
					x: x + p.x*cosT - p.y*sinT,
					y: y + p.x*sinT + p.y*cosT
				});
			}
			return translated;
		}
	};
	
	return MathUtils;
});