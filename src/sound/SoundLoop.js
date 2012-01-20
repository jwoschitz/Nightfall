define(["utils/browserDetection","propulsion_1.2"], function(browser, engine) {
	var SoundLoop = function(name, url){
		var audioObj = new engine.Sound(url);
		this.channel = {};		
		this.channel.audioObj = audioObj;
		this.channel.finished = (new Date()).getTime() + audioObj.duration * 1000;
		var repeat = function(){
			this.channel.audioObj.currentTime = 0;
			this.channel.audioObj.play();	
		};
		this.play = function(volume){
			var audioObj = this.channel.audioObj;
			audioObj.volume = volume || 1.0;
			audioObj.play();
			audioObj.addEventListener('ended', function(){
				this.currentTime = 0;
				this.play();	
			}, false);
			return this.channel;
		};
		this.stop = function(){
			var audioObj = this.channel.audioObj			
			audioObj.currentTime = 0;
			audioObj.pause();
		}
		return this;
	}
  
  var MockSoundLoop = function(){
		this.play = function(){};
		this.stop = function(){};
	}
  
  return (browser.safari) ? MockSoundLoop : SoundLoop;
});