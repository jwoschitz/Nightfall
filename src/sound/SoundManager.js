define(["utils/browserDetection","propulsion_1.2"], function(browser, engine) {
  var SoundManager = function(maxChannels){
		this.audiochannels = [];    
		this.sounds = {};
		for (var i=0;i<maxChannels;i++) {									
			this.audiochannels[i] = {
				audioObj: new Audio(),
				finished: -1
			};
		}
    /* @TODO getAudioObj is it needed somewhere? */
		this.getAudioObj = function(name){
			return this.sounds[name];
		};
		this.add = function(name, url){
			this.sounds[name] = new engine.Sound(url);
		};
		this.play = function(name, volume){		
			var audioObj = this.sounds[name];
			for (var i=0;i<this.audiochannels.length;i++) {
				thistime = new Date();
				var channel = this.audiochannels[i];
				if (channel.finished < thistime.getTime()) { // is this channel finished?
					channel.finished = thistime.getTime() + audioObj.duration * 1000;
					channel.audioObj.src = audioObj.src;
					channel.audioObj.load();
					channel.audioObj.volume = volume || 1.0;
					channel.audioObj.play();
					return channel;
				}
			}
		};
		return this;
	};
  
  var MockSoundManager = function(){
		this.add = function(){};
		this.play = function(){};
	}
  
  return (browser.safari) ? MockSoundManager : SoundManager;
});