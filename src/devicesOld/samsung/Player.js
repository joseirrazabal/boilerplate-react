import AbstractHTML5Player from '../all/AbstractHTML5Player'
import SamsungOrsay from "../../utils/SamsungOrsay";
import Utils from "../../utils/Utils";
import Device from './../../devices/device';

import { PONCONNECT, PONSTOP } from '../../devices/all/settings';
import { SS, SS_MA, AUDIO, PLAYERIMAGE, HLS, HLSPRM, RADIO, HLS_KR, WVC } from '../../utils/playerConstants';
import { onStreamNotFound, onConnectionTimeout, onConnectionFailed, onNetworkDisconnected, onAuthenticationFailed, onUnknownError } from '../../utils/playerConstants';

const WVC_deviceId = "60";
const WVC_iSeek = "TIME";
const WVC_drmCurTime = "PTS";

// DOC: http://developer.samsung.com/tv/develop/legacy-platform-library/API00005/Player_172
/* TODO should this inherit from HTML5? */
class SamsungPlayer extends AbstractHTML5Player {

  constructor() {
    super();

    this.bitrate = 0;
    this.bandwidth = 0;
    // Create samsung objects if not
    this.samsungOrsay = new SamsungOrsay();
    this.doFirstPlay = true;
    this.prependPip = '';

    /* MULTIAUDIO TRACK VARS */
    // Multiaudio vars are defined in parent
    /* END MULTIAUDIO TRACK VARS */

    this.samsungDeviceObject = document.getElementById('samsungDeviceObject');
    this.sefPlayerContainer = document.getElementById('SefPlayerContainer');

    this.retryIntervalFirstPlaying = 0.7;
    this.retryLimitFirstPlaying = 30;

    this.resumeTime = false;

    // Un poco más de tiempo para los audiotracks, que la híbrida es poco más lenta (2015)
    this.retryLimitAudioTrack = 30;

    this.seekTimeshift = this.seekTimeshift.bind(this);
    this.tryOnFirstTimeshiftSeek = this.tryOnFirstTimeshiftSeek.bind(this);

    this.setBitrate = this.setBitrate.bind(this);
    this.getBitrate = this.getBitrate.bind(this);
    // this._onBitrateChange = this._onBitrateChange.bind(this);

    this.seekWindow = null;
    this.currentTime = 0;
  }

  createSefEvents() {

    console.log("SAMSUNGplayer CASE createSefEvents");

    window.sefPluginCallbacks = (eventType, param1, param2) => {
      console.log("SAMSUNGplayer CASE IN createSefEvents");

      //console.info("[Samsung SEF] OnEvent() - eventType: " + eventType + ", param1: " + param1 + ", param2: " + param2);

      switch (eventType) {
        case 1:
          //console.info("[Samsung SEF] OnEvent() - eventType: " + eventType + ", param1: " + param1 + ", param2: " + param2);
          this._onError(onConnectionFailed, "Connection failed!");
          break;
        case 2:
          //console.info("[Samsung SEF] OnEvent() - eventType: " + eventType + ", param1: " + param1 + ", param2: " + param2);
          this._onError(onAuthenticationFailed, "Authentication failed!");
          break;
        case 3:
          //console.info("[Samsung SEF] OnEvent() - eventType: " + eventType + ", param1: " + param1 + ", param2: " + param2);
          this._onError(onStreamNotFound, 'Stream not found');
          break;
        case 4:
          //console.info("[Samsung SEF] OnEvent() - eventType: " + eventType + ", param1: " + param1 + ", param2: " + param2);
          this._onError(onNetworkDisconnected, 'Network disconnected');
          break;
        case 6:
          console.info("[Samsung SEF] OnEvent() - eventType: " + eventType + ", param1: " + param1 + ", param2: " + param2);
          this._onError(onUnknownError, '[Render error] param: ' + param1);
          break;
        case 8:
          this.stop();
          this._onFinished();
          // Do destroy to reinit player next play
          this.destroy();
          break;
        case 9:
          // Sef notifies us that stream info is ready
          this._isOnLoaded = true;
          this._onLoad();
          this._onCanPlay();
          this.setDuration();
          this._onDurationChange();

          console.log("SAMSUNGplayer CASE 9 _onDurationChange");
          console.info("[Samsung SEF] OnEvent() - eventType: " + eventType + ", param1: " + param1 + ", param2: " + param2);

          break;
        case 11:
          this._onBufferingStart();
          break;
        case 12:
        this._onBufferingComplete();
          break;
        case 13:
          this._onBufferingProgress();
          break;
        case 14:
          // current playback time
          this._onTimeUpdate(param1);
          this.getBitrate();
          console.log("SAMSUNGplayer CASE 14 _onTimeUpdate");

          break;
        case 19:
          // subtitle received
          console.info("[SAMSUNG PLAYER] dispatch the subtitle event en param1");
          break;
        default:
          this._onUnknownEvent(eventType, param1, param2);
          break;
      }
    };
  }

  deleteSefEvents() {
    if(this.sefPlugin)
      delete this.sefPlugin.OnEvent;

    delete window.sefPluginCallbacks;
  }

  // turnOnOff = 1
  turnOnVolume(turnOnOff) {
    let currentMute = this.samsungOrsay.device.audioPlugin.GetSystemMute();
    console.log('[SAMSUNG PLAYER] VOLUME; ' + currentMute);
    if(currentMute === turnOnOff)
      return;

    if(turnOnOff) {
      this.samsungOrsay.device.audioPlugin.SetSystemMute(0);
    }
    else {
      this.samsungOrsay.device.audioPlugin.SetSystemMute(1);
    }
    currentMute = this.samsungOrsay.device.audioPlugin.GetSystemMute();
    console.log('[SAMSUNG PLAYER] VOLUME; ' + currentMute);
  }

  setBitrate(data) {

    console.log("SAMSUNGplayer setBitrate:: " + data);

    console.info('[PS4 PLAYER] PSPlayer callback getBitrate');

    if (data) {
      this.bitrate = data.bitrate;
      this.bandwidth = data.bandwidth;
      this._onBitrateChange(data.bitrate, data.bandwidth);
    }
    // if (data) {
    //   console.info('[PS4 PLAYER] PSPlayer callback getBitrate> ', data);
    //   this.bitrate = data.bitrate;
    //   this.bandwidth = data.bandwidth;
    //   this._onBitrateChange(data.bitrate, data.bandwidth);
    // }
  }

extractEls(children){
  var toReturn = '';
  for(var i = 0; i<children.length; i++){
       toReturn += children[i].outerHTML; //changed
  }
  return toReturn;
}

  getBitrate() {

    // PlaystationWebmaf.sendCommand("getBitrate", null, (data) => {
    //   this.setBitrate(data);
    // }, true);

    // if (webapis && webapis.avplay && webapis.avplay.getCurrentStreamInfo && webapis.avplay.getCurrentStreamInfo() && webapis.avplay.getCurrentStreamInfo()[0]) {
    //   var j = JSON.parse(webapis.avplay.getCurrentStreamInfo()[0].extra_info)
    //   var bitrate = (j.Bit_rate && j.Bit_rate != "0") ? j.Bit_rate : -1;
    //   if (bitrate < 1e4) { bitrate *= 100 }//lower than 10k, for example: 9,999 -> 9,999,000 (it wont be less than 10kbps)
    //   else if (bitrate > 1e7) { bitrate /= 100 }//higher than 10M, for example: 15,000,000 -> 15,000 (it wont be more than 10Mbps)
    //   return bitrate
    // }
    // return null;
    if(this.sefPlayerContainer){

      setTimeout(()=> {
        let bitrate = this.sefPlugin.Execute("GetCurrentBitrates");
        console.log("SAMSUNGplayer getBitrate step 3:: prev " + this.bitrate + " neww :: " + bitrate);

        this.setBitrate({
          bitrate: bitrate,
          bandwidth: this.bandwidth
        });
      }, 500);
    }
    else if(this.samsungDeviceObject){
        setTimeout(()=> {
          let bitrate = this.samsungDeviceObject.GetCurrentBitrates();
          console.log("SAMSUNGplayer getBitrate step 4:: prev " + this.bitrate + " neww :: " + bitrate);

          this.setBitrate({
            bitrate: bitrate,
            bandwidth: this.bandwidth
          });
        }, 500);
    }



    // if(this.sefPlayerContainer){
    //   // this.setBitrate(this.sefPlugin.Execute("GetCurrentBitrates"));
    //   console.log("SAMSUNGplayer" + this.sefPlayerContainer);

    //   this.setBitrate(6732828286);

    //   setTimeout(()=>{
    //     // this.sefPlugin.Execute("Pause");
    //     // console.log("SAMSUNGplayer eventExecuted: Pause");
    //     console.log("SAMSUNGplayer init eventExecuted: GetCurrentBitrates " + this.sefPlugin.Execute("GetCurrentBitrates"));

    //     // setInterval(()=>{
    //     //   console.log("SAMSUNGplayer eventExecuted: GetCurrentBitrates " + this.sefPlugin.Execute("GetCurrentBitrates"));
    //     // },1000);

    //   }, 10000);



    // }

    // else if(this.samsungDeviceObject){
    //   document.getElementById("debugBody").innerHTML = "samsungDeviceObject --- " + this.samsungDeviceObject;
    //   this.setBitrate(this.samsungDeviceObject.GetCurrentBitrates());
    // }

    // if (this.playerType == "INFOLINK-SEF") {
    //   return this.player.Execute("GetCurrentBitrates")
    // } else if (this.playerType == "INFOLINK-PLAYER") {
    //   return this.player.GetCurrentBitrates()
    // }
    // return null



    /** Override to return current bitrate */
  }

  createMedia(options) {

    if(options.isPip)
      return;

    console.log('[SAMSUNG PLAYER] ******* <<<<<<<<<<< SamsungPlayer createMedia');
    console.log(options);
    if(this._isPrepared)
    {
      console.log('[SAMSUNG PLAYER] samsung player ES PREPARED createMEdia');
      return;
    }

    // Just in case...newSource attr only arrive here when it is a replaceMediaSource (enter in replace method below),
    // so in this path we dont have to have this attr, reset it
    if(options.newSource && options.newSource.src) {
      options.newSource = null;
    }

    this.options = options;
    this.prependPip = options.isPip ? '_pip' : '_full';

    this._playerContainer = document.createElement("div");
    this._playerContainer.style.backgroundColor = "transparent";
    this._playerContainer.style.position = "absolute";

    // Only for test:
    //this._playerContainer.style.backgroundColor = "green";

    this._playerContainer.id = 'Html5PlayerContainer' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";

    // Call to the parent, set background
    this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);

    if(!this.streamIsAudio())
      this._playerContainer.className += ' orsayFullContainer';

    if(!this.options.parentWrapper) {
      console.error('parentWrapper not found');
      return;
    }



    // Move player to parent
    //this._playerContainer.appendChild(this.sefPlayerContainer);
    //this.samsungDeviceObject = document.getElementById('samsungDeviceObject');
    //this.sefPlayerContainer = document.getElementById('SefPlayerContainer');
    //  this.sefPlugin = document.getElementById('pluginSef')



  let vWrapper = document.getElementById(this.options.parentWrapper.id);
  console.log('[SAMSUNG PLAYER] samsung player vWrapper id: ' + vWrapper.id);

  let reactRoot = document.getElementById('root');
  reactRoot.parentNode.insertBefore(this._playerContainer, reactRoot);

  /*
  vWrapper.appendChild(this._playerContainer);
  reactRoot.parentNode.insertBefore(vWrapper.parentNode.childNodes[0]);
  */


    /*
    if(!options.isPip) {
      // Same id player as in SamsungOrsay.js file!!
      let idSef = 'pluginSef';
      //this.sefPlugin = document.getElementById(idSef);
      this.sefPlugin = this.samsungOrsay.device.sefPlugin;
      if(this.sefPlugin) {
        console.log('createMedia Existe player en globals');
        console.log(this.sefPlugin);
        try {
          this.sefPlugin.Open("Player", "0001", "InitPlayer");
        }
        catch(e) {
          console.log('createMedia existe player en globals ERRR: ');
          console.log(e);
        }
      }
      else{
        console.log('createMedia NO Existe player en globals');
      }
    }
    */

    this.getBitrate();
    this._isPrepared = true;

  }


  loadMedia() {
    console.log('[SAMSUNG PLAYER] Setting load media en samsung:', this.options);
    // At this moment, there is no pip player in orsay (maybe pip with html5 video tag is possible
    if(this.options.isPip) {
      return;
    }

    if(!this._isPrepared) {
      return false;
    }

    if(this.options.resume && !this.options.isLive) {
      this.seek_resume = this.options.resume;
    }

    if(this.options.src) {
      let idSef = 'pluginSef' + this.prependPip;
      this._playerContainer.innerHTML = "<object id='" + idSef + "' border=0 classid='clsid:SAMSUNG-INFOLINK-SEF' style='position:relative;'></object>";
      this.sefPlugin = document.getElementById(idSef);

      try {
        this.sefPlugin.Open("Player", "0001", "InitPlayer");
      }
      // Hide sef player (only sef)
      catch(e) {
        console.log('[SAMSUNG PLAYER] SEF Player Error when open player');
        console.log(e);
      }

      this.hide();
      // Update volume
      this.turnOnVolume(0);

      // Create events
      this.addEventsListeners(); // create window.sefPluginCallbacks then add to plugin below
      this.sefPlugin.OnEvent = window.sefPluginCallbacks;
      this.samsungOrsay.device.sefPlugin = this.sefPlugin;
      this.src = this.options.src;
      this._isOnLoaded = false;
      this.doFirstPlay = true;

      if(this.options.streamType == SS || this.options.streamType == SS_MA) {
        // Add customData
        let server_url = this.options.drmInfo.server_url;
        let challenge = (this.options.drmInfo && this.options.drmInfo.challenge) || '';
        let content_id = (this.options.drmInfo && this.options.drmInfo.content_id) || '';
        let device_id = this.options.drmInfo.device_id || '';

        let customData = null;
        if(challenge && challenge.indexOf('tokenID') !== -1) {
          customData = challenge;
        }
        else {
          customData = btoa('{"customdata":' + challenge + ',"device_id": "' + device_id + '"}');
        }

        let initPlayer = this.sefPlugin.Execute("InitPlayer", this.options.src);
        // Providers like FOX does not have explicit challenge
        if(challenge) {
          this.sefPlugin.Execute("SetPlayerProperty", 3, customData, customData.length);
        }
        if (server_url) {
          this.sefPlugin.Execute("SetPlayerProperty", 4, server_url, server_url.length);
        }
        // TODO add pip? does it works? two players ¿?
        this.sefPlugin.Execute("SetPlaybackSpeed", 2);

        // Resize player to full
        this.setPlayerFull();

        this.hide();
      }
      if(this.options.streamType === HLS || this.options.streamType == HLS_KR)
      {
        let initPlayer = this.sefPlugin.Execute("InitPlayer", this.options.src + '|COMPONENT=HLS');
        // Resize player
        this.setPlayerFull();
      }
      if(this.options.streamType === WVC)
      {
        let server_url = this.options.drmInfo.server_url;
        let device_id = this.samsungOrsay.getESN();
        if(device_id === null) {
          device_id = this.options.drmInfo.device_id || '';
        }
        if(server_url) {
          this.options.src = this.options.src + '|DRM_URL=' + server_url;
        }
        this.options.src = this.options.src + '|DEVICE_ID=' + device_id;
        this.options.src = this.options.src + '|DEVICE_TYPE_ID=' + 60;
        this.options.src = this.options.src + '|I_SEEK=' + WVC_iSeek;
        this.options.src = this.options.src + '|CUR_TIME=' + WVC_drmCurTime;
        this.options.src = this.options.src + '|COMPONENT=WV';
        let initPlayer = this.sefPlugin.Execute("InitPlayer", this.options.src);
        console.log('[SAMSUNG PLAYER] SEF Player WVC: ' + this.options.src);
        // Resize player
        this.setPlayerFull();
      }

      if(this.options.streamType == AUDIO || this.options.streamType == RADIO) {
        let initPlayer = this.sefPlugin.Execute("InitPlayer", this.options.src);
        // Resize player
        this.setPlayerFull();
      }
      this.samsungOrsay.setScreenSaver(false);
    }
    else {
      this.destroy();
    }

    console.log('[SAMSUNG PLAYER] <<<<<<<<<<< END SefPlayer loadMedia');
  }

  setPlayerFull() {
    this.setPlayerSize(0, 0, 1280, 720);
    // TODO check if we need a pause on player, and object ¿?
    // this.sefPlugin.style.position = "relative or fixed ¿?";
  }

  setPlayerSize(top, left, width, height) {

    if(this.sefPlugin) {
      let al_top = 0;
      let alt_left = 0;

      this.sefPlugin.style.top = al_top + 'px';
      this.sefPlugin.style.left = alt_left + 'px';
      this.sefPlugin.style.width = width + 'px';
      this.sefPlugin.style.height = height + 'px';
      this.sefPlugin.style.position = "relative";

      this.sefPlugin.className = "orsayPlayerObject"; // We dont use this css...at this moment
    }
    if(this._playerContainer) {
      this._playerContainer.style.top = top + 'px';
      this._playerContainer.style.left = left + 'px';
      this._playerContainer.style.width = width + 'px';
      this._playerContainer.style.height = height + 'px';
      this._playerContainer.style.position = "absolute";
    }

    return this.setPlayerResolution(top, left, width, height);
  }

  setPlayerResolution(top, left, width, height) {
    let pos;
    let intv;
    let x, y, w, h;
    let maxResolution = { width: 1280, height: 720 };

    let screenPos = {
      x: left,
      y: top
    };

    if (this.sefPlugin !== null) {
      intv = 1;
      x = screenPos.x;
      y = screenPos.y;
      w = width;
      h = height;
      /*
      if (FirmwareYear() !== 2010) { // 2010 device should only use 1
        intv = (resolution.width === 960 ? 1 : 960 / 1280);
      }
      */
      intv = 960 / 1280;

      console.log('[SAMSUNG PLAYER] SetDisplayArea X: ' + Math.round(x * intv));
      console.log('[SAMSUNG PLAYER] SetDisplayArea Y: ' + Math.round(y * intv));
      console.log('[SAMSUNG PLAYER] SetDisplayArea W: ' + Math.round(w * intv));
      console.log('[SAMSUNG PLAYER] SetDisplayArea H: ' + Math.round(h * intv));

      this.sefPlugin.Execute("SetDisplayArea", Math.round(x * intv), Math.round(y * intv), Math.round(w * intv), Math.round(h * intv));
      //this.sefPlugin.Execute("SetDisplayArea", 100,100, 640, 360);
    }
  }

  play() {
    console.log('[SAMSUNG PLAYER] ENTER PLAY...');
    let ret = '';

    try {
      if(this.sefPlugin) {
        if (this.doFirstPlay) {
          this.sefPlugin("SetInitialBufferSize", 400*1024); //400KB
          if (this.seek_resume && this.seek_resume > 0) {
            console.log('[SAMSUNG PLAYER] ENTER PLAY CON RESUME: ' + this.seek_resume);
            ret = this.sefPlugin.Execute("StartPlayback", this.seek_resume);
            this.onPlayerStatePlay();
            this.seek_resume = 0;
          }
          else {
            console.log('[SAMSUNG PLAYER] ENTER PLAY SIN RESUME');
            ret = this.sefPlugin.Execute("StartPlayback");
            this.onPlayerStatePlay();
          }
          this.doFirstPlay = false;
        }
        else {
          console.log('[SAMSUNG PLAYER] ENTER PLAY DO EXECUTE RESUME (play method)');
          ret = this.sefPlugin.Execute("Resume");
          this.onPlayerStatePlay();
        }
      }
    }
    catch(e) {
      console.log('[SAMSUNG PLAYER] sefplayer error when play, see below: ');
      console.error("[SAMSUNG PLAYER] Error: " + e.message);
      this._onError(onStreamNotFound, 'playback failed');
    }
  }

  onFirstPlaying() {
    // Do a timeshift ¿?
    console.log('[SAMSUNG PLAYER]> enter onFirstPlaying ===================================');
    this.setTimeshift();
  }

  resume() {
    console.log('[SAMSUNG PLAYER] ENTER PLAY DO EXECUTE RESUME (resume method)');
    let ret = this.sefPlugin.Execute("Resume");
    this.onPlayerStatePlay();
  }

  pause() {
    if(this.sefPlugin) {
      this.sefPlugin.Execute("Pause");
      this.onPlayerStatePause();
    }
  }

  stop() {
    if(this.sefPlugin) {
      console.log('Samsung player stopping playing')
      this.sefPlugin.Execute("Stop");
      this.onPlayerStateStop();
    }
  }

  /* PLAYER CONTROL */
  /**
   *  @param timeshiftData = {
   *    backward: isBackward,
   *    // Si es negativo o no, se verifica en video/component, quien es quien decide
   *    // si se va o no a pgm o solo hace seek sobre el actual playing
   *    seektime: el seg al que quiero ir> this.state.channelInfo.timeshiftAllowed - this.state.timeshiftTime
   *    maxtimeshiftallowed,
   *    starttime: tiempo inicial en que se pidió el request a getmedia
   *  };
   *
   * @param firstSeek true => se tiene que esperar hasta que el player inicie el playing y luego de esto, se manda el seek.
   *                  false => el player ya esta playeando, sobre el playing se manda el seek (no se espera por el playing).
   *
   *
   * Orsay log: seekTimeshift retVal  6006/21559538 (start/endtime)
   */
  seekTimeshift(timeshiftData, firstSeek) {
    console.info('[ORSAY PLAYER] seekTimeshift <timeshiftData, firstSeek, seekWindow> ', timeshiftData, firstSeek, this.seekWindow);
    if(firstSeek) {
      this.tryOnFirstTimeshiftSeek(1, timeshiftData);
    }
    else {
      // Calc seek
      let seekTime = 0;
      if(this.seekWindow && this.seekWindow.endTime) {
        seekTime = (this.seekWindow.endTime) - timeshiftData.seektime;
        if(seekTime < 1) {
          seekTime = 7; // 7 seconds, protect player, contents start second 6 aprox? average
        }
        let ct = this.getCurrentTime();
        console.info('[ORSAY PLAYER] seekTimeshift <seekTime, ct> ', seekTime, ct, (ct - seekTime));
        seekTime = ct - seekTime;
        if(seekTime === 0) {
          seekTime = 1;
        }
        if(seekTime > 0) {
          let resb = this.sefPlugin.Execute("JumpBackward", seekTime);
          console.log('[ORSAY PLAYER] seekTimeshift backward a seektime result: ', seekTime, resb);
          if(resb < 0) {
            // Al primer seek de timeshift, a veces no lo hace :/
            setTimeout(() => {
              resb = this.sefPlugin.Execute("JumpBackward", seekTime);
              console.log('[ORSAY PLAYER] intento 2 - seekTimeshift backward a seektime result: ', seekTime, resb);
            }, 1000);
          }
        }
        else {
          let resf = this.sefPlugin.Execute("JumpForward", (seekTime * -1));
          console.log('[ORSAY PLAYER] seekTimeshift forward a seektimem result: ', (seekTime * -1), resf);
        }
      }
    }
  }

  // Based on currentTime
  async tryOnFirstTimeshiftSeek(currentTry, timeshiftData) {
    let curTime = this.getCurrentTime();
    console.log('[ORSAY PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + '], curTime: ' + curTime);

    if(isNaN(curTime)) {
      curTime = 0;
    }
    if(curTime <= 0) {
      console.log('[ORSAY PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitFirstPlaying) {
        throw new Error('Fail to get playing state');
        console.log('[ORSAY PLAYER]> Error, Fail to get playing state');
        return;
      }
      await Utils.sleep(this.retryIntervalFirstPlaying);

      return this.tryOnFirstTimeshiftSeek(++currentTry, timeshiftData);
    }
    else {
      console.log('[ORSAY PLAYER]> player is ready and playing');
      let start_end_time = this.sefPlugin.Execute("GetLiveDuration");
      console.log('[ORSAY PLAYER]> player is ready and playing ', start_end_time);


      if(start_end_time) {
        let setime = start_end_time.split('/');
        if(!isNaN(setime[0]) && !isNaN(setime[1])) {
          this.seekWindow = {
            startTime: Math.ceil(setime[0]/1000),
            endTime: Math.floor(setime[1]/1000)
          };
        }
      }

      return this.seekTimeshift(timeshiftData, false);
    }
  }

  seek(seconds) {
    let curTime = this.getCurrentTime();
    console.log('[ORSAY PLAYER] samsung seek curTime: ' + curTime);
    console.log('[ORSAY PLAYER] samsung seek 2, resta: ' + (seconds - curTime));
    this.skip(seconds - curTime);
  }

  skip(seconds, isBack) {
    let boundaryTime = 1;
    let curTime = this.getCurrentTime();
    let duration = this.getDuration();

    if (!seconds) {
      return;
    }

    console.log('[SAMSUNG PLAYER] samsung skip duration: ' + duration);

    /*
    ** Playerinterval haciendo seek de 37
      @@@@@@@@@@ samsung seek curTime: 9
      @@@@@@@@@@ samsung seek 2, resta: 28
      @@@@@@@@@@ samsung skip duration: 2822
    */
    /*
        9 + 28 > 2822 - 1
        38 > 2821
    */
    if (curTime + seconds > duration - boundaryTime) {
      seconds = duration - boundaryTime - curTime;
    }
    // 9 + 28 < 0
    else if (curTime + seconds < 0) {
      seconds = -curTime;
    }

    if (!seconds) { // request a 0 second jump to device does work well!
        return;
    }
    if (seconds < 0) {
        this.sefPlugin.Execute("JumpBackward", Math.round(seconds) * -1);
    }
    else {
        this.sefPlugin.Execute("JumpForward", Math.round(seconds));
    }
  }

  replaceMediaSource(newSource) {
    // no replace for pip
    if(this.options.isPip) {
      return;
    }

    console.log('[SAMSUNG PLAYER] player enter replace', newSource);

    this.options.newSource = newSource; // Add the attr to detect error when replace and not reset whole player
    this.options.src = newSource.src;
    this.options.drmInfo = newSource.drmInfo;
    this.options.isLive = newSource.isLive;
    this.options.streamType = newSource.streamType;

    if(newSource.backgroundImage && !this.streamIsAudio()) {
      this.options.backgroundImage = newSource.backgroundImage;
      this.setPlayerBackground(newSource.backgroundImage);
    }

    // If there is a resume when vod...
    if(newSource.resume && !newSource.isLive) {
      this.seek_resume = newSource.resume;
      this.options.resume = newSource.resume;
    }

    console.log('[SAMSUNG PLAYER] player enter replace antes de stop');
    if(!this.streamIsAudio()) {
      console.log('[SAMSUNG PLAYER] player next replace deleting licence');
      this.sefPlugin.Execute("SetPlayerProperty", 6, null, 1);
    }
    this.stop();

    // Do a new play, play new content...
    this.doFirstPlay = true;
    this._isOnLoaded = false;
    this.audioTracks = [];
    this.currentAudioTrackIndex = null;
    this.currentTime = 0;
    this.seekWindow = null;

    if(this.options.streamType === SS || this.options.streamType === SS_MA) {
      console.log('[SAMSUNG PLAYER] player enter replace  es SS, se elmina licencia previa ', this.options.streamType);
      // Works? deleting licence
      console.log('[SAMSUNG PLAYER] player next replace is SS');
      let initPlayer = this.sefPlugin.Execute("InitPlayer", this.options.src);
      // Add new customData
      let server_url = this.options.drmInfo.server_url;
      let challenge = (this.options.drmInfo && this.options.drmInfo.challenge) || '';
      let content_id = (this.options.drmInfo && this.options.drmInfo.content_id) || '';
      let device_id = this.options.drmInfo.device_id || '';
      console.log('[SAMSUNG PLAYER] player next replace is SS, server_url: ', server_url);
      console.log('[SAMSUNG PLAYER] player next replace is SS, challenge: ', challenge);
      console.log('[SAMSUNG PLAYER] player next replace is SS, content_id: ', content_id);
      console.log('[SAMSUNG PLAYER] player next replace is SS, device_id: ', device_id);

      let customData = null;
      if(challenge && challenge.indexOf('tokenID') !== -1) {
        customData = challenge;
      }
      else {
        customData = btoa('{"customdata":' + challenge + ',"device_id": "' + device_id + '"}');
      }

      // Providers like FOX does not have explicit challenge
      if(challenge) {
        this.sefPlugin.Execute("SetPlayerProperty", 3, customData, customData.length);
      }
      if (server_url) {
        this.sefPlugin.Execute("SetPlayerProperty", 4, server_url, server_url.length);
      }
    }

    if(this.options.streamType === WVC)
    {
      let server_url = this.options.drmInfo.server_url;
      if(server_url) {
        this.options.src = this.options.src + '|DRM_URL=' + server_url;
      }
      let device_id = this.samsungOrsay.getESN();
      if(device_id === null) {
        device_id = this.options.drmInfo.device_id || '';
      }
      this.options.src = this.options.src + '|DEVICE_ID=' + device_id;
      this.options.src = this.options.src + '|DEVICE_TYPE_ID=' + 60;
      this.options.src = this.options.src + '|I_SEEK=' + WVC_iSeek;
      this.options.src = this.options.src + '|CUR_TIME=' + WVC_drmCurTime;
      this.options.src = this.options.src + '|COMPONENT=WV';
      let initPlayer = this.sefPlugin.Execute("InitPlayer", this.options.src);
      console.log('[SAMSUNG PLAYER] SEF Player replace WVC: ' + this.options.src);
    }

    if(this.options.streamType == HLS || this.options.streamType == HLS_KR) {
      let initPlayer = this.sefPlugin.Execute("InitPlayer", this.options.src + '|COMPONENT=HLS');
    }

    if(this.options.streamType == AUDIO || this.options.streamType == RADIO) {
      let initPlayer = this.sefPlugin.Execute("InitPlayer", this.options.src);
    }

    this.setPlayerFull();
    this.hide();
    console.log('[SAMSUNG PLAYER] player replace sending to play...');
    // Play ahora se controla desde onresolve AAFPlayer
    //this.play();
  }

  hide() {
    if(this.sefPlugin) {
      this.sefPlugin.style.visibility = 'hidden';
    }
  }

  show() {
    console.log('[SAMSUNG PLAYER] show 1');
    if(this.sefPlugin) {
      this.sefPlugin.style.visibility = 'visible';
    }
  }

  destroy() {

    if(this.options.isPip) {
      return;
    }

    if (!this._isPrepared) {
      return;
    }

    // if we are un epg and did a replace, we dont need to destroy player
    // we come from a replace
    /*
    if(this.options.newSource && this.options.newSource.src) {
      this.currentContentTime = 0;

      return;
    }
    */
    this.stop();
    this.removeEventsListener();

    if (this._playerContainer) {
/*
let this.samsungDeviceObject = document.getElementById('samsungDeviceObject');
    let this.sefPlayerContainer = document.getElementById('SefPlayerContainer');
    this.sefPlugin = document.getElementById('pluginSef')
    this.samsungDeviceObject.appendChild(this.sefPlayerContainer);
  */
      // Move object to parent samsung
      //this.samsungDeviceObject.appendChild(this.sefPlayerContainer);
      if(!this.streamIsAudio())
        this._playerContainer.className = this._playerContainer.className.replace('orsayFullContainer', ' ');

      this._playerContainer.innerHTML = '';

      //let vWrapper = document.getElementById(this.options.parentWrapper.id);
      //vWrapper.removeChild(this._playerContainer);

      if(this._playerContainer.parentNode) {
        this._playerContainer.parentNode.removeChild(this._playerContainer);
      }

      this._playerContainer = null;
    }

    this.doFirstPlay = false;
    this._isPrepared = false;
    this._isOnLoaded = false;
    this.seekWindow = null;
    this.currentTime = 0;

    this.audioTracks = [];
    this.currentAudioTrackIndex = null;

    // Call to the parent...
    this.setPlayerBackground(null);

    //this.sefPlugin = null;

    // Add sefplayer again, prepare for next playing...
    //let globalSefContainer = document.getElementById('SefPlayerContainer');

    console.log('[SAMSUNG PLAYER] BEFORE Destroy player...');
    //console.log(globalSefContainer.innerHTML);

    /*
    if(globalSefContainer && !this.options.isPip) {
      console.log('Destroy player...');
      console.log(globalSefContainer.innerHTML);
      console.log(globalSefContainer.childNodes.length);
      if(globalSefContainer.childNodes.length === 0) {
        globalSefContainer.innerHTML = "<object id='pluginSef' border=0 classid='clsid:SAMSUNG-INFOLINK-SEF' style='position:absolute;width:0px;height:0px'></object>";
      }

      console.log('AFTER Destroy player...');
      console.log(globalSefContainer.innerHTML);
    }
    */
    //this.samsungOrsay.device.sefPlugin = null;

    this.previousPlayerState = PONCONNECT;
    this.currentPlayerState = PONCONNECT;
    this.seek_resume = 0;
    this.samsungOrsay.setScreenSaver(true);

    return;
  }

  addEventsListeners() {
    return this.createSefEvents();
  }

  removeEventsListener() {
    return this.deleteSefEvents();
  }

  getCurrentTime() {
    return Math.floor(this.currentTime / 1000);
  }

  getDuration() {
    return Math.floor(this._duration / 1000);
  }

  setDuration() {
    this._duration = this.sefPlugin.Execute("GetDuration");
  }

  /* Events */

  _onLoad() {
    console.log('[SAMSUNG PLAYER] _onLoad');
    if(this.options.events.onLoad) {
      this.options.events.onLoad();
    }
  }

  _onUnknownEvent(eventType, param1, param2) {
    console.info("[SAMSUNG PLAYER] A SefPlayer Unknown event: " + eventType + ", parameters: " + param1 + ", " + param2);
  }

  _onBufferingStart() {
    console.log('[SAMSUNG PLAYER] _onBufferingStart');
    this.onPlayerStateBuffer();
    if(this.options.events.onBufferingStart) {
      this.options.events.onBufferingStart();
    }
  }

  _onBufferingComplete() {

    console.log('[SAMSUNG PLAYER] _onBufferingComplete');

    // If stop and ends buffering, nothing to do
    if(this.getCurrentPlayerState() === PONSTOP) {
      return;
    }

    // If current state is on connecting, then we go to play
    if(this.getCurrentPlayerState() === PONCONNECT) {
      this.onPlayerStatePlay();
    }
    else {
      // Set same state as last
      this.setCurrentPlayerState(this.previousPlayerState);
    }

    if(this.options.events.onBufferingFinish) {
      this.options.events.onBufferingFinish();
    }
  }

  _onBufferingProgress() {
    console.log('[SAMSUNG PLAYER] _onBufferingProgress');
    if(this.options.events.onBufferingProgress) {
      this.options.events.onBufferingProgress();
    }
  }

  _onBitrateChange(bitrate, bandwidth){
    console.log('[PS4 PLAYER] _onBitrateChange',bitrate, bandwidth);
    if (this.options.events.onBitrateChange) {
      console.log('[PS4 PLAYER] this.options.events.onBitrateChange')
      this.options.events.onBitrateChange(bitrate, bandwidth);
    }
  }

  _onWaiting() {
    console.log('[SAMSUNG PLAYER] _onWaiting');
    if(this.options.events.onWaiting) {
      this.options.events.onWaiting();
    }
  }

  _onTimeUpdate(currentTime) {
    console.log('[SAMSUNG PLAYER] CurrentTime: ' + currentTime/1000);

    if (this.resumeTime && currentTime == '0' && this.getModelYear() === 2013) {

      const resumeTime = this.resumeTime;

      setTimeout(() => {
        this.skip(resumeTime);
      }, 500);

      this.resumeTime = false;
    }

    this.currentTime = currentTime;
    if(this.options.events.onTimeUpdate) {
      this.options.events.onTimeUpdate(this.getCurrentTime());

      // this.options.events.onTimeUpdate(this.getBitrate());
    }
  }

  _onPlaying() {
    console.log('[SAMSUNG PLAYER] _onPlaying');
    if(this.options.events.onPlaying) {
      this.options.events.onPlaying();
    }
  }

  _onError(code, msg) {
    console.log('[SAMSUNG PLAYER] _onError');
    console.log(msg);
    this.stop();
    if(this.options.events.onError) {
      this.options.events.onError(msg, code);
    }
  }

  _onFinished() {
    console.log('[SAMSUNG PLAYER] _onFinished');
    // We dont need to send the stop state to the player here, it was sending in stop method that executes before this onfinish
    if(this.options.events.onFinished) {
      this.options.events.onFinished();
    }
  }

  _onCanPlay() {
    // We already could play...so show the player...
    this.show();

    console.log('[SAMSUNG PLAYER] _onCanPlay> ');
    if(this.options.events.onCanPlay) {
      this.options.events.onCanPlay();
    }
  }

  _onDurationChange() {
    if(this.options.events.onDurationChange) {
      this.options.events.onDurationChange();
    }
  }

  /* END Events */


  /* MULTIPLE AUDIOTRACKS */
  async tryGetAudioTracks(currentTry) {

    if(!this._isOnLoaded) {
      console.log('[SAMSUNG PLAYER]> tryGetAudioTracks retry number: [' +  currentTry + '] - samsung player audioTracks...');
      if(currentTry >= this.retryLimitAudioTrack) {
        throw new Error('Fail to get audioTracks');
        console.log('[SAMSUNG PLAYER]> Error, player instance could not initialize');
        return;
      }
      await Utils.sleep(this.retryIntervalAudioTrack);

      return this.tryGetAudioTracks(++currentTry);
    }
    else {
      console.log('[SAMSUNG PLAYER]> tryToGetAudioTracks retry number: [' +  currentTry + '] -  samsung player audiioTracks is READY');

      return this.getAudioTracks();
    }
  }

  getAudioTracks() {

    console.info("[SAMSUNG PLAYER]");

    if(!this._isOnLoaded) {
      console.info("[SAMSUNG PLAYER] Delay 1s to get the audio track info again");
      return this.tryGetAudioTracks(1);
    }

    //var noOfAudioStream, audioTracksArr, i;

    return new Promise((resolve) => {
      console.info("[SAMSUNG PLAYER] Recuperado info de tracks...");
      let noOfAudioStream = this.sefPlugin.Execute("GetTotalNumOfStreamID", 1);
      console.info("[SAMSUNG PLAYER] recuperados: " + noOfAudioStream + " audioTracks");
      let i = 0;
      for (i = 0; i < noOfAudioStream; i++) {
        console.info("[SAMSUNG PLAYER] Recuperando audioTrack> " + i);
        let langParams = this.sefPlugin.Execute("GetStreamLanguageCode", "1", i);
        let langCode = langParams.split('|')[0];

        //.split("|")[0]);
        console.log('[SAMSUNG PLAYER] langCode: ' + langCode);
        // Para híbrida 2015 :/
        if(langCode.length < 3) {
          langCode = this.getLanguageCodeByISO2(langCode);
        }
        this.audioTracks[i] = langCode;
      }
      console.info("[SAMSUNG PLAYER] array de audio tracks: " + this.audioTracks);

      resolve(this.audioTracks);
    });
  }

  // @codeTrack iso id i.e.: esp, eng, por, ori
  setAudioTrack(codeTrack) {
    return new Promise((resolve, reject) => {
      if(!this._isOnLoaded) {
        reject('Dont have audioTracks information');
      }

      let id = parseInt(codeTrack, 10);
      let internalAudioIndex = this.getAudioIndexOfCode(codeTrack);
      if(internalAudioIndex === null) {
        reject('Dont have audioTracks information, index lang does not exist');
      }
      else {
        if(this.currentAudioTrackIndex === internalAudioIndex)  {
          console.info('[SAMSUNG PLAYER] Same audioTrack, nothing to do');
          resolve(true);
        }
        console.info("[SAMSUNG PLAYER] Set audioTrack to index: " + internalAudioIndex + ', lang code: ' + codeTrack);
        this.currentAudioTrackIndex = internalAudioIndex;
        this.sefPlugin.Execute("SetStreamID", 1, internalAudioIndex);

        if (this.getModelYear() === 2013) {
          this.resumeTime = Number.isNaN(this.getCurrentTime()) ? this.options.resume : this.getCurrentTime();
        }

        resolve(true);
      }
    });
  }

  getAudioIndexOfCode(codeTrack) {
    let ret = null;

    for(let j = 0; j < this.audioTracks.length; j++) {
      if(this.audioTracks[j] == codeTrack) {
        ret = j;
        break;
      }
    }

    return ret;
  }


  getModelYear() {
    let ID = Device.getDevice().getId();
    let modelYear = ID.getFirmwareYear();

    console.log('ORSAY II -> model year > ', modelYear);

    if (isNaN(modelYear)) {
      modelYear = -1;
    }

    return modelYear;
  }

  /* END MULTIPLE AUDIOTRACKS */
}

export default SamsungPlayer;
