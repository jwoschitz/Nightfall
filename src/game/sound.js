define(["engine/UA", "engine/core"], function (UA, engine) {

    var maxAudioChannels = 10,

        audioFileExtension = (UA.mozilla) ? '.ogg' : '.mp3',

        soundManager = new engine.sound.SoundManager(maxAudioChannels),

        getSound = function (url) {
            return engine.getResourceManager().getSoundFromUrl(url + audioFileExtension);
        };

    soundManager.add('9mm', getSound('sounds/9mm'));
    soundManager.add('zombie1', getSound('sounds/zombie1'));
    soundManager.add('zombie2', getSound('sounds/zombie2'));
    soundManager.add('zombie3', getSound('sounds/zombie3'));
    soundManager.add('zombie4', getSound('sounds/zombie4'));
    soundManager.add('zombie5', getSound('sounds/zombie5'));
    soundManager.add('zombie_killed', getSound('sounds/zombie_dies'));
    soundManager.add('nightfall', getSound('sounds/nightfall'));
    soundManager.add('pistol_empty', getSound('sounds/pistol_empty'));
    soundManager.add('pistol_reload', getSound('sounds/pistol_reload'));

    var soundLoops = {};
    soundLoops['ambient'] = new engine.sound.SoundLoop(getSound('sounds/e'));

    return {
        manager: soundManager,
        loops: soundLoops
    }
});