define(["engine/UA","engine/sound/SoundManager", "engine/sound/SoundLoop"], function(UA, SoundManager, SoundLoop) {
  var maxAudioChannels = 10;
  var soundManager = new SoundManager(maxAudioChannels);
  
  var audioFileExtension = (UA.mozilla) ? 'ogg' : 'mp3';
  
  var getAudioUrl = function(url){
    return url.replace(/{ext}/,audioFileExtension);
  };		

  soundManager.add('9mm',getAudioUrl('sounds/9mm.{ext}'));
  soundManager.add('zombie1',getAudioUrl('sounds/zombie1.{ext}'));
  soundManager.add('zombie2',getAudioUrl('sounds/zombie2.{ext}'));
  soundManager.add('zombie3',getAudioUrl('sounds/zombie3.{ext}'));
  soundManager.add('zombie4',getAudioUrl('sounds/zombie4.{ext}'));
  soundManager.add('zombie5',getAudioUrl('sounds/zombie5.{ext}'));
  soundManager.add('zombie_killed',getAudioUrl('sounds/zombie_dies.{ext}'));
  soundManager.add('nightfall',getAudioUrl('sounds/nightfall.{ext}'));
  soundManager.add('pistol_empty',getAudioUrl('sounds/pistol_empty.{ext}'));
  soundManager.add('pistol_reload',getAudioUrl('sounds/pistol_reload.{ext}'));
  
  var soundLoops = {};
  soundLoops['ambient'] = new SoundLoop('ambient',getAudioUrl('sounds/e.{ext}'));

  return {
    manager: soundManager,
    loops: soundLoops
  }
});