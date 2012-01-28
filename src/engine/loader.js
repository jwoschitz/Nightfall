define(["engine/propulsion_1.2"], function(PP) {
	var soundsToLoad = [],
		spritesToLoad = [];
	return {
		queueAudio: function(audObj) {
			soundsToLoad.push(audObj);
		},
		queueSprite: function(sprite) {
			spritesToLoad.push(sprite);
		},
		load: function(callback) {
			PP.load.soundList = soundsToLoad;
			//PP.load.spritesList = spritesToLoad;
			return PP.load(callback);
		}
	}
});