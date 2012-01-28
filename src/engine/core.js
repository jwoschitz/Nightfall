define(["engine/propulsion_1.2", "engine/loader"], function(PP, loader) {
	
	return {
		propulsion: PP,
		load: function(callback) {
			return loader.load(callback);
		}
	}
});