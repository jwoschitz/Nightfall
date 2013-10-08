define(
    [
        "engine/propulsion_1.2",
        "engine/ResourceManager",
        "engine/sound"
    ], function(
        PP,
        ResourceManager,
        sound
    ) {

    var rm = new ResourceManager();

	return {

		propulsion: PP,

        /**
         * @returns ResourceManager
         */
        getResourceManager: function() {
            return rm;
        },

        sound: sound,

		load: function(callback) {
            PP.load.soundList = rm.getSounds();
            return PP.load(callback);
		}
	}
});