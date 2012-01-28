define(["engine/sound/Sound"], function(Sound) {
	
	var SoundLoop = function(name, url){
		var audioObj = new Sound(url);
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
  
	return SoundLoop;
});