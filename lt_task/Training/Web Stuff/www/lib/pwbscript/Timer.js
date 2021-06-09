define([
		"Class"
	], function(
		Class
	) {
	var Timer = Class.extend({
		startTime: null,
		paused: false,
		stopped: true,
		
		_diffWhenPaused: null, // Used for pause/resume.
		
		init: function(autoStart) {
			if (autoStart) {
				this.start();
			}
		},
		
		start: function(initialTime) {
			// If provided, initialTime can be used to start the timer at specified position.
			//	For example, setting an initialTime of 500, then immediately calling get() will yield 500.
			this.paused = false;
			this.stopped = false;
			this.startTime = initialTime ? new Date(new Date().getTime() - initialTime) : new Date();
		},
		
		reset: function(initialTime) {
			// TODO: don't call get here. it is a bit of a waste. see if anything is using that value, then get rid of the return.
			var retTime = this.get();
			this.start(initialTime);
			return retTime;
		},
		
		get: function() {
			if (this.stopped) {
				return 0;
			} else if (this.paused) {
				return this._diffWhenPaused;
			}
			return new Date() - this.startTime;
		},
		
		stop: function() {
			this.stopped = true;
			this.paused = false;
		},
		
		/*public String getFormatted() {       
			long elapsed = get();  
			String format = String.format("%%0%dd", 2);  
			String temp = elapsed+"";
			String ms = (temp.length()>2 ? temp.substring(temp.length()-3) : temp);
			ms = String.format("%03d", Integer.parseInt(ms));
			elapsed = elapsed/1000;
			String seconds = String.format(format, elapsed % 60);
			String minutes = String.format(format, (elapsed % 3600) / 60);
			String hours = String.format(format, elapsed / 3600);
			String time =  hours + ":" + minutes + ":" + seconds + "." + ms;
			return time;  
		}*/
		
		isPaused: function() {
			return this.paused;
		},
		
		isStopped: function() {
			return stopped;
		},
		
		pause: function() {
			if (this.stopped) {
				return 0;
			}
			this._diffWhenPaused = this.get();
			this.paused = true;
		},
		
		resume: function() {
			if (!this.stopped && this.paused) {
				this.paused = false;
				this.startTime = new Date().setTime(new Date().getTime() + this._diffWhenPaused);
				this._diffWhenPaused = 0;
			}
		}
	});

	// Statics
	Timer.wait = function(ms) {
		var date = new Date();
		var curDate = null;
		do {curDate = new Date();} 
		while(curDate-date < ms);
	};
	
	return Timer;
});
