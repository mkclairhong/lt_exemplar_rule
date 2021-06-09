define([
		"Class"
	], function(
		Class
	) {

	var Sound = Class.extend({
		url: null,			// The url of the sound
		_audios: null,		// All playing or paused Audio objects for this Sound
		_audio: null, 		// The latest Audio object
		_curId: 0,			// We need to give each Audio element its own id so we can distinguish between them.
		volume: 1,
		init: function(url) {
			this.url = url;
			this._audios = [];
		},

		play: function() {
			this._cleanAudios();
			this._audio = new Audio(this.url);
			this._audio.id = this.url+"_"+this._curId;
			this._audio.volume = this.volume;
			this._curId++;
			this._audios.push(this._audio);
			this._audio.play();
		},

		pause: function() {
			// Pauses the most recent audio object
			if (this._audio) {
				this._audio.pause();
			}
		},

		pauseAll: function() {
			// Pauses all the currently playing Audio objects
			for (var i = 0; i < this._audios.length; i++) {
				this._audios[i].pause();
			}
		},

		resume: function() {
			// Resumes the most recent audio object if it is paused
			this._cleanAudios();
			if (this._audio && this._audio.paused) {
				this._audio.play();
			}
		},

		resumeAll: function() {
			// Resumes all paused Audio objects
			this._cleanAudios();
			for (var i = 0; i < this._audios.length; i++) {
				if (this._audios[i] && this._audios[i].paused) {
					this._audios[i].play();
				}
			}
		},

		stop: function() {
			// Stops the most recent audio object
			if (this._audio) {
				this._audio.pause();
				var index = this._getCurrentIndex();
				this._audio = null;
				this._audios.splice(index, 1);
			}
		},

		stopAll: function() {
			for (var i = 0; i < this._audios.length; i++) {
				this._audios[i].pause();
				this._audios[i] = null;
			}
			this._audio = null;
			this._audios = [];
		},

		_getCurrentIndex: function() {
			// returns the index (from this._audios) of the current Audio element
			if (!this._audio) {
				return -1;
			}
			var id =  this._audio.id;
			for (var i = this._audios.length-1; i >= 0; i--) {
				if (this._audios[i].id === id) {
					return i;
				}
			}
			return -1;
		},

		_cleanAudios: function() {
			// Iterates over the Audio elements in this._audios and removes all of them that have finished playing
			for (var i = 0; i < this._audios.length; i++) {
				if (this._audios[i] && this._audios[i].currentTime+.01 > this._audios[i].duration) {
					if (this._audio && this._audio.id === this._audios[i].id) {
						this.audio = null;
					}
					this._audios[i] = null;
					this._audios.splice(i, 1);
					i--;
				}
			}
		}
	});

	return Sound;
});
