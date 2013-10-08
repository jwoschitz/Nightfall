define(["./sound/Sound"], function(Sound) {

    return function() {
        var sounds = [];

        this.getSoundFromUrl = function(url) {
            var sound = new Sound(url);
            sounds.push(sound);
            return sound;
        };

        this.getSounds = function() {
            return sounds;
        };
    };
});