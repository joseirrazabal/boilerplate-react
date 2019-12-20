import Utils from './Utils';

class SamsungTizen {

  constructor() {
    this.isScreenSaverActive = null;

    this.escript = '$WEBAPIS/webapis/webapis.js';
    //this.escriptkey = '/TizenCommonTVKeyValue.js';
    this.loadTizenLibs = this.loadTizenLibs.bind(this);
    this.webapisLoaded = this.webapisLoaded.bind(this);

    if(!this.webapisLoaded()) {
      this.loadTizenLibs();
    }
  }

  webapisLoaded() {
    var scripts = document.getElementsByTagName('script');
    //let cont = 0;

    for (var i = scripts.length; i--;) {
        if (scripts[i].src.indexOf('webapis') !== -1) {
          return true;
        }
        /*
        if (scripts[i].src.indexOf('TizenCommonTVKeyValue') !== -1) {
          cont++;
        }
        */
    }
    /*
    if(cont === 2 ) {
      return true;
    }
    else {
      */
    return false;
    //}
  }

  loadTizenLibs() { 
    Utils.loadScript(this.escript).then((responses) => {
      this.tizenSetup();
    }).catch((e) => {console.log(e);console.log('ERRRR init tizen');});
  }

  tizenSetup() {

    //http://developer.samsung.com/tv/develop/guides/user-interaction/remote-control
    console.log('[TIZEN] SamsungTizen tizenSetup....');

    let tvkeys = [
        "ColorF0Red", 
        "ColorF1Green", 
        "ColorF2Yellow", 
        "ColorF3Blue",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "ChannelUp",
        "ChannelDown",
        "MediaPlayPause",
        "MediaRewind",
        "MediaFastForward",
        "MediaPlay",
        "MediaPause",
        "MediaStop",
        "MediaRecord",
        "MediaTrackPrevious",
        "MediaTrackNext",
        "PreviousChannel",
    ];

    let i;
    for(i = 0; i < tvkeys.length; i++) {
      try {
          console.log('[TIZEN] SamsungTizen tizenSetup....register key: ' + tvkeys[i]); 
          window.tizen.tvinputdevice.registerKey(tvkeys[i]);
      } catch(error) {
          console.log("failed to register " + tvkeys[i] + ": " + error);
      }
    }
  }

  setScreenSaver(onOff) {
    if (this.isScreenSaverActive !== onOff) {
        if (onOff) {
          //webapis.appcommon.setScreenSaver("SCREEN_SAVER_OFF", onsuccess, onerror);
            window.webapis.appcommon.setScreenSaver(1); 
        } 
        else {
            window.webapis.appcommon.setScreenSaver(0); 
        }
        this.isScreenSaverActive = onOff;
    }
  }

}

export default SamsungTizen;
