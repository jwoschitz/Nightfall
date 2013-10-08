define(
    [
        "./sound/Sound",
        "./sound/SoundLoop",
        "./sound/SoundManager"
    ], function (Sound, SoundLoop, SoundManager) {

        return {
            Sound: Sound,
            SoundLoop: SoundLoop,
            SoundManager: SoundManager
        }
    });