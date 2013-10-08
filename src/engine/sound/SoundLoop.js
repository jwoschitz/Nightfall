define(function() {

    /**
     * @param name string
     * @param sound Sound
     * @constructor
     */
	return function(sound){

        /**
         * @param volume float
         */
		this.play = function(volume){
            sound.volume = volume || 1.0;
            sound.play();
            sound.addEventListener('ended', function(){
				this.currentTime = 0;
				this.play();	
			}, false);
		};

		this.stop = function(){
            sound.currentTime = 0;
            sound.pause();
		};
	};
});