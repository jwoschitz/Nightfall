define(function () {

    return function (maxChannels) {
        var audioChannels = [],
            sounds = {};

        for (var i = 0; i < maxChannels; i++) {
            audioChannels[i] = {
                audioObj: new Audio(),
                finished: -1
            };
        }

        /**
         * @param name string
         * @param sound Sound
         */
        this.add = function (name, sound) {
            sounds[name] = sound;
        };

        /**
         *
         * @param name string
         * @param volume float
         * @returns Sound
         */
        this.play = function (name, volume) {
            var audioObj = sounds[name],
                now = new Date().getTime(),
                channel;

            for (var i = 0; i < maxChannels; i++) {
                channel = audioChannels[i];
                if (channel.finished < now) { // is this channel finished?
                    channel.finished = now + audioObj.duration * 1000;
                    channel.audioObj.src = audioObj.src;
                    channel.audioObj.load();
                    channel.audioObj.volume = volume || 1.0;
                    channel.audioObj.play();
                    return channel;
                }
            }

            return channel;
        };
    };
});