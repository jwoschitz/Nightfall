define(["engine/UA", "engine/loader"], function(UA, loader) {

	var Sound = function(url) {
      var audObj = new Audio('');
      
      // The actual audio object won't get a src until load is called
      audObj.url = url;
      
      // Queue it to be loaded
      loader.queueAudio(audObj);
      
      return audObj;
    };
	
	var MockSound = function() {
		return {
			play: function() {},
			pause: function() {},
			load: function() {}
		}
	};
	
	return (UA.safari) ? MockSound : Sound;
});