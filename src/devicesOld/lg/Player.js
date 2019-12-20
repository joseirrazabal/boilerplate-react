import AbstractHTML5Player from '../all/AbstractHTML5Player';
import Utils from "../../utils/Utils";
import DRMLicenseAcquisitor from './DRMLicenseAcquisitor';

import { PONCONNECT, PONSTOP, PONPAUSE } from '../../devices/all/settings';
import { SS, SS_MA, AUDIO, PLAYERIMAGE, HLS, HLSPRM, RADIO, HLS_KR } from '../../utils/playerConstants';

//For PlayReady, need to use DRMSystemID, value is "urn:dvb:casystemid:19219"
const DRMSystemID = "urn:dvb:casystemid:19219";
const LG_STATE_STOPPED = 0;
const LG_STATE_PLAYING = 1;
const LG_STATE_CONNECTING = 3;
const LG_STATE_BUFFERING = 4;
const LG_STATE_FINISHED = 5;

const drmDOMHTMLObject = 'NetcastDrmAgent';

class LgPlayer extends AbstractHTML5Player {

  constructor() {
    super();

    // Create samsung objects if not

    //this.doFirstPlay = true;
    this.prependPip = '';

    this.LGPlayer = null;
    this.playReadyAgent = null;
    this.playReadyDRMModule = null;
    this.server_url = null;
    this.customData = null;
    this.licenseReady = false

    this.timeUpdateTimeoutID = null;
    this.currentContentTimeOnPause = null;

    this.retryLimitPlay = 30;
    this.retryIntervalPlay = 1; //
    this.isOnCanPlay=false;

    this.retryIntervalFirstPlaying = 0.7;
    this.retryLimitFirstPlaying = 30;
    this.seekWindow = null;
    this.currentTime = 0;

    /* MULTIAUDIO TRACK VARS */
    // Multiaudio vars are defined in parent
    /* END MULTIAUDIO TRACK VARS */

    this.onLGPlayStateChange = this.onLGPlayStateChange.bind(this);
    this.onLGReadyStateChange = this.onLGReadyStateChange.bind(this);
    this.onLGBuffering = this.onLGBuffering.bind(this);
    this.onLGError = this.onLGError.bind(this);
    this.onDRMSucess = this.onDRMSucess.bind(this);
    this.onDRMFail = this.onDRMFail.bind(this);

    // Bind callbacks
    this._onBufferingFinish = this._onBufferingFinish.bind(this);
    this._onBufferingProgress = this._onBufferingProgress.bind(this);
    this._onBufferingStart = this._onBufferingStart.bind(this);
    this._onCanPlay = this._onCanPlay.bind(this);
    this._onDurationChange = this._onDurationChange.bind(this);
    this._onError = this._onError.bind(this);
    this._onFinished = this._onFinished.bind(this);
    this._onLoad = this._onLoad.bind(this);
    this._onPlaying = this._onPlaying.bind(this);
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onWaiting = this._onWaiting.bind(this);
  }

  resetTimeUpdate() {
    if(this.timeUpdateTimeoutID) {
      clearTimeout(this.timeUpdateTimeoutID)
    }
  }

  createTimeUpdate() {
    this.resetTimeUpdate();
    this.timeUpdateTimeoutID = setInterval(() => {
      // If on pause, return time when user paused content
      if(this.getCurrentPlayerState() !== PONPAUSE) {
        this.currentContentTime = Math.floor(this.LGPlayer.mediaPlayInfo().currentPosition / 1000);
        this._onTimeUpdate(this.currentContentTime);
      }
    }, 800);
  }

  createMedia(options) {

    if(options.isPip)
      return;

    console.log('******* <<<<<<<<<<< LGPlayer createMedia');
    if(this._isPrepared) {
      return;
    }

    // Just in case...newSource attr only arrive here when it is a replaceMediaSource (enter in replace method below),
    // so in this code path-flow we dont have to have this attr, reset it
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

    this._playerContainer.id = 'Html5PlayerContainer_LG' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";

    // Call to the parent, set background
    this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);

    if(!this.streamIsAudio())
      this._playerContainer.className += ' LGFullContainer';
    if(!this.options.parentWrapper) {
      console.error('parentWrapper not found');
      return;
    }

    let vWrapper = document.getElementById(this.options.parentWrapper.id);
    vWrapper.appendChild(this._playerContainer);

    //let reactRoot = document.getElementById('root');
    //reactRoot.parentNode.insertBefore(this._playerContainer, reactRoot);
    //reactRoot.parentNode.insertBefore(vWrapper.parentNode.childNodes[0]);

    this._isPrepared = true;
  }

  loadMedia() {
    //console.log('Setting load media en LG netcast:', this.options);
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

      let idLGPlayerObject = 'LGPLayer' + this.prependPip;
      this.hide();
      this.src = this.options.src;
      this._isOnLoaded = false;
      if(this.options.streamType === SS || this.options.streamType === SS_MA) {
        let LGObject = "<object type='application/vnd.ms-sstr+xml' id='" + idLGPlayerObject  + "' class='playerObject'></object>";
        this._playerContainer.innerHTML = LGObject;

        // CustomData
        let server_url = this.options.drmInfo.server_url;
        let challenge = (this.options.drmInfo && this.options.drmInfo.challenge) || '';
        let content_id = (this.options.drmInfo && this.options.drmInfo.content_id) || '';
        let device_id = this.options.drmInfo.device_id || '';

        this.server_url = server_url;

        let customData = null;
        if(challenge && challenge.indexOf('tokenID') !== -1) {
          customData = challenge;
        }
        else {
          if(challenge !== '') {
            customData = btoa('{"customdata":' + challenge + ',"device_id": "' + device_id + '"}');
          }
        }
        this.customData = customData;
        let playReadyAgent = null;
        if (!document.getElementById(drmDOMHTMLObject)) {
          playReadyAgent = document.createElement("object");
          playReadyAgent.id = drmDOMHTMLObject;
          playReadyAgent.type = "application/oipfDrmAgent";
          playReadyAgent.style.width = '0px';
          playReadyAgent.style.height = '0px';

          //let reactRoot = document.getElementById('root');
          //reactRoot.parentNode.insertBefore(playReadyAgent, reactRoot);
          document.body.appendChild(playReadyAgent);
        }

        if (!this.playReadyAgent) {
            this.playReadyAgent = document.getElementById(drmDOMHTMLObject);
            console.log('LgPLayer setting drmAgent', this.playReadyAgent);
            this.playReadyDRMModule = new DRMLicenseAcquisitor(this.playReadyAgent, DRMSystemID, this.onDRMSucess, this.onDRMFail);
        }
      }
      if(this.options.streamType === HLS || this.options.streamType == HLS_KR)
      {
        let defaultLGObject = "<object type='application/x-netcast-av' id='" + idLGPlayerObject + "' class='playerObject' preBufferingTime='" + 10 + "'></object>";
        this._playerContainer.innerHTML = defaultLGObject;
      }

      if(this.options.streamType === AUDIO || this.options.streamType === RADIO)
      {
        let defaultLGObject = "<object type='application/x-netcast-av' id='" + idLGPlayerObject + "' class='playerObject' preBufferingTime='" + 10 + "'></object>";
        this._playerContainer.innerHTML = defaultLGObject;
      }

      this.LGPlayer = this._playerContainer.firstChild;
      console.debug('LGplayer this.LGPlayer 1 ', this.LGPlayer);
      this.LGPlayer.data = this.options.src;
      this.LGPlayer.autoStart = true;
      console.debug('LGplayer this.LGPlayer 2 ', this.LGPlayer);
      this.addEventsListeners();

      // Resize player to full
      if(!this.streamIsAudio()){
        this.setPlayerFull();
      }
      
      this.hide();
    }
    else {
      this.destroy();
    }
    console.log('******* <<<<<<<<<<< END LGPlayer loadMedia');
  }

  /**
   *
    0 Stopped
    1 Playing
    2 Paused
    3 Connecting
    4 Buffering
    5 Finished
    6 Error
   */

  onLGPlayStateChange() {
    let playState = this.LGPlayer.playState;
    console.debug('LgPlayer onLGPlayStateChange, playState ', playState);
    if(this._duration < 1) {
      this.setDuration();
    }

    this.onLGStatusChange(playState);
  }

  onLGReadyStateChange() {

    let readyStateValue = this.LGPlayer.readyState;
    let playState = this.LGPlayer.playState;
    console.debug('LgPlayer onLGReadyStateChange, playState ', playState);
    this.setDuration();

    if(readyStateValue===3 && !this.isOnCanPlay){
      this._onCanPlay();
      this.isOnCanPlay = true;
    }

    this._onDurationChange();
    if (readyStateValue === 1) {
      this._onLoad();
    }
    this._isOnLoaded = true;
  }

  onLGBuffering(starting) {
    let buffering = this._playerObject.playState;


    console.debug('LgPlayer onLGBuffering, playState ', buffering, starting);


    if(starting) {
      this._onBufferingStart();
      this._onBufferingProgress();
    }
    else {
      this._onBufferingFinish();
    }
  }

  onLGError() {
    /*
    0 A/V format not supported
    1 Cannot connect to server or connection lost
    2 Unidentified error
    3/1000 File is not found
    4/1001 Invalid protocol
    5/1002 DRM failure
    6/1003 Play list is empty
    7/1004 Unrecognized play list
    8/1005 Invalid ASX format
    9/1006 Error in downloading play list
    10/1007 Out of memory
    11/1008 Invalid URL list format
    12/1009 Not playable in play list
    1100 Unidentified WM-DRM error
    1101 Incorrect license in local license store
    1102 Fail in receiving correct license from server
    1103 Stored license is expired
    */
   let errorCode = this.LGPlayer.error;
   let explain;

    switch (errorCode) {
      case 0:
          explain = "A/V format not supported";
          break;
      case 1:
          explain = "Cannot connect to server or connection lost";
          break;
      case 2:
          explain = "Unidentified error";
          break;
      case 3:
      case 1000:
          explain = "File is not found";
          break;
      case 4:
      case 1001:
          explain = "Invalid protocol";
          break;
      case 5:
      case 1002:
          explain = "DRM failure";
          break;
      case 6:
      case 1003:
          explain = "Play list is empty";
          break;
      case 7:
      case 1004:
          explain = "Unrecognized play list";
          break;
      case 8:
      case 1005:
          explain = "Invalid ASX format";
          break;
      case 9:
      case 1006:
          explain = "Error in downloading play list";
          break;
      case 10:
      case 1007:
          explain = "Out of memory";
          break;
      case 11:
      case 1008:
          explain = "Invalid URL list format";
          break;
      case 12:
      case 1009:
          explain = "Not playable in play list";
          break;
      case 1100:
          explain = "Unidentified WM-DRM error";
          break;
      case 1101:
          explain = "Incorrect license in local license store";
          break;
      case 1102:
          explain = "Fail in receiving correct license from server";
          break;
      case 1103:
          explain = "Stored license is expired";
          break;
    }

    this._onError(errorCode, explain);
  }

  onDRMSucess(msg) {
    this.licenseReady = true;
  }

  onDRMFail(msg) {
    this.licenseReady = false;
    this._onError('000', msg);
  }

  onLGStatusChange(playState) {
    /*case 0 : STOPPED;
     case 1 : PLAYING;
     case 2 : PAUSED;
     case 3:  CONNECTING;
     case 4:  BUFFERING;
     case 5:  FINISHED;
     case 6:  ERROR;*/
    switch (playState) {
      case LG_STATE_STOPPED:
        break;
    case LG_STATE_PLAYING:
        //Playing
        this._onPlaying();
        break;
    case LG_STATE_CONNECTING:
        break;
    case LG_STATE_BUFFERING:
        //Buffering
        break;
    case LG_STATE_FINISHED:
        //Finished
        this.stop();
        this._onFinished();
        break;
    }
  }

  setPlayerFull() {
    this.setPlayerSize(0, 0, 1280, 720);
  }

  setPlayerSize(top, left, width, height) {
    console.log('LG player setPlayerSize ', this._playerContainer, this.LGPlayer, top, left, width, height);
    if(this.LGPlayer) {
      let al_top = 0;
      let alt_left = 0;

      this.LGPlayer.style.top = al_top + 'px';
      this.LGPlayer.style.left = alt_left + 'px';
      this.LGPlayer.style.width = width + 'px';
      this.LGPlayer.style.height = height + 'px';
      this.LGPlayer.style.position = "relative";
    }
    if(this._playerContainer) {
      this._playerContainer.style.top = top + 'px';
      this._playerContainer.style.left = left + 'px';
      this._playerContainer.style.width = width + 'px';
      this._playerContainer.style.height = height + 'px';
      this._playerContainer.style.position = "absolute";
    }

    //return this.setPlayerResolution(top, left, width, height);
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

      console.log('SetDisplayArea X: ' + Math.round(x * intv));
      console.log('SetDisplayArea Y: ' + Math.round(y * intv));
      console.log('SetDisplayArea W: ' + Math.round(w * intv));
      console.log('SetDisplayArea H: ' + Math.round(h * intv));

      this.sefPlugin.Execute("SetDisplayArea", Math.round(x * intv), Math.round(y * intv), Math.round(w * intv), Math.round(h * intv));
      //this.sefPlugin.Execute("SetDisplayArea", 100,100, 640, 360);
    }
  }

  async tryPlay(currentTry) {
    if(!this.licenseReady) {
      console.log('[LG PLAY]> trying play, retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitPlay) {
        throw new Error('Fail to get playing');
        console.log('[LG]> Error, player instance could not initialize');
        return;
      }
      await Utils.sleep(this.retryIntervalPlay);

      return this.tryPlay(++currentTry);
    }
    else {
      console.log('[LGPlayer]> player is READY to play, returns from requestForLicense');

      return this.netcastPlay();
    }
  }

  netcastPlay() {
    console.log('LgPlayer enter netcastPlay, resume ', this.seek_resume, this.LGPlayer);

    // We already could play...so show the player...
    this.show();

    if(this.seek_resume > 0) {
      this.LGPlayer.play(1);
      this.LGPlayer.seek(this.seek_resume * 1000);
      this.seek_resume = 0;
    }
    else {
      this.LGPlayer.play(1);
    }
    this.onPlayerStatePlay();
    this.createTimeUpdate();
  }

  play() {
    console.log('[LGPLAYER] ENTER PLAY...');
    let ret = '';

    if(this.options.streamType === SS || this.options.streamType === SS_MA) {
      try {
        this.playReadyDRMModule.requestForLicense(this.server_url, this.customData);
        // wait for license response
        this.tryPlay(1);
      }
      catch(e) {
        console.log('[LGPLAYER] sefplayer error when play, see below: ');
        console.error("[LGPLAYER] Error: " + e.message);
      }
    }
    // audio, hls, here, dont need to wait for license
    else {
      this.netcastPlay();
    }
  }

  resume() {
    if(this.LGPlayer) {
      this.LGPlayer.play(1);
      this.currentContentTimeOnPause = null;
    }
    this.onPlayerStatePlay();
  }

  pause() {
    if(this.LGPlayer) {
      this.currentContentTimeOnPause = this.getCurrentTime();
      console.log('Poniendo en pausa: ', this.getCurrentTime());
      this.LGPlayer.play(0);
      console.log('Poniendo en pausa: ', this.getCurrentTime());
      this.onPlayerStatePause();
    }
  }

  stop() {
    if(this.LGPlayer) {
      console.log('LG player stopping playing')
      this.LGPlayer.stop();
      this.onPlayerStateStop();
    }
  }

  /**
   *  @param timeshiftData = {
   *    backward: isBackward,
   *    // Si es negativo o no, se verifica en video/component, quien es quien decide 
   *    // si se va o no a pgm o solo hace seek sobre el actual playing
   *    seektime: second to go to,
   *    maxtimeshiftallowed,
   *    starttime: tiempo inicial en que se pidió el request a getmedia
   *  };
   * 
   * @param firstSeek true => se tiene que esperar hasta que el player inicie el playing y luego de esto, se manda el seek.
   *                  false => el player ya esta playeando, sobre el playing se manda el seek (no se espera por el playing).
   */
  // Based on currentTime
  seekTimeshift(timeshiftData, firstSeek) {
    console.info('[NETCAST] seekTimeshift, timeshiftData> ', JSON.stringify(timeshiftData));
    if(firstSeek) {
      this.tryOnFirstTimeshiftSeek(1, timeshiftData);    
    }
    else {
      let seekTime = 0;
      seekTime = (this.seekWindow.endTime) - timeshiftData.seektime;
      if(seekTime < 1) {
        seekTime = this.seekWindow.startTime + 1; // protect player
      }
      if(seekTime >= this.seekWindow.endTime) {
        seekTime = this.seekWindow.endTime - 1; // protect player
      }
      console.info('[NETCAST PLAYER] intentando seek en seekTimeshift ', seekTime);
      if(seekTime > 0) {
        console.info('[NETCAST PLAYER] enviando seek en seekTimeshift ', seekTime);
        this.seek(seekTime);    
      }
      else {
        console.info('[NETCAST PLAYER] ERROR intentando seek en timeshift <timeshiftData, this.seekWindow> => ', timeshiftData, this.seekWindow);
      }
    }
  }

  async tryOnFirstTimeshiftSeek(currentTry, timeshiftData) {
    let curTime = this.getCurrentTime();
    console.log('[NETCAST PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + '], curTime: ' + curTime);
    
    if(isNaN(curTime)) {
      curTime = 0;
    }
    if(curTime <= 0) {
      console.log('[NETCAST PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitFirstPlaying) {
        throw new Error('Fail to get playing state');
        console.log('[NETCAST PLAYER]> Error, Fail to get playing state');
        return;
      }
      await Utils.sleep(this.retryIntervalFirstPlaying);

      return this.tryOnFirstTimeshiftSeek(++currentTry, timeshiftData);
    }
    else {
      this.seekWindow = {
        startTime: 6, // START IN SECOND 6
        endTime: Math.floor(curTime)
      };
      return this.seekTimeshift(timeshiftData, false);
    }
  }
  
  seek(seconds) {
    this.skip(seconds);
  }

  skip(seconds) {
    if(this.LGPlayer) {
      this.LGPlayer.seek(seconds * 1000);
    }
  }

  replaceMediaSource(newSource) {
    this.isOnCanPlay=false;
    // no replace for pip
    if(this.options.isPip) {
      return;
    }
    console.debug('LG player enter replace', newSource, this.LGPlayer) ;
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

    if(this.options.isLive) {
      this.stop();
      this.hide();
    }
    else {
      this.pause();
      this.hide();
    }
    // Do a new play, play new content...
    this.audioTracks = [];
    this.currentAudioTrackIndex = null;
    this.licenseReady = false;
    this.currentTime = 0;
    this.seekWindow = null;

    console.debug('Replace url before', this.LGPlayer.data);

    this.LGPlayer.data = this.options.src;
    console.debug('Replace url after', this.LGPlayer.data);
    if(this.options.streamType === SS || this.options.streamType === SS_MA) {
      console.log('LG player next replace is SS');

      // Add new customData
      let server_url = this.options.drmInfo.server_url;
      let challenge = (this.options.drmInfo && this.options.drmInfo.challenge) || '';
      let content_id = (this.options.drmInfo && this.options.drmInfo.content_id) || '';
      let device_id = this.options.drmInfo.device_id || '';

      this.server_url = server_url;

      let customData = null;
      if(challenge && challenge.indexOf('tokenID') !== -1) {
        customData = challenge;
      }
      else {
        if(challenge !== '') {
          customData = btoa('{"customdata":' + challenge + ',"device_id": "' + device_id + '"}');
        }
      }
      this.customData = customData;

      // play and wait for license response...
      // Play ahora se controla desde onresolve AAFPlayer
      //this.play();
    }

    // Play ahora se controla desde onresolve AAFPlayer
    /*
    if(this.options.streamType === HLS || this.options.streamType === HLS_KR) {
      this.netcastPlay();
    }

    if(this.options.streamType === AUDIO || this.options.streamType === RADIO) {
      this.netcastPlay();
    }
    */
  }

  hide() {
    if(this.LGPlayer) {
      this.LGPlayer.style.visibility = 'hidden';
    }
  }

  show() {
    console.log('LGPlayer show 1');
    if(this.LGPlayer) {
      this.LGPlayer.style.visibility = 'visible';
    }
  }

  destroy() {
    if(this.options.isPip) {
      return;
    }
    if (!this._isPrepared) {
      return;
    }
    this.isOnCanPlay=false;

    /*
    // if we are un epg and did a replace, we dont need to destroy player
    // we come from a replace
    if(this.options.newSource && this.options.newSource.src) {
      this.currentContentTime = 0;

      return;
    }
    */

    this.resetTimeUpdate();
    this.stop();
    this.removeEventsListener();

    if (this._playerContainer) {
      if(!this.streamIsAudio()) {
        this._playerContainer.className = this._playerContainer.className.replace('LGFullContainer', ' ');
      }

      if(this.LGPlayer) {
        this.LGPlayer.parentNode.removeChild(this.LGPlayer);
      }
      this._playerContainer.innerHTML = '';

      if(this._playerContainer.parentNode) {
        this._playerContainer.parentNode.removeChild(this._playerContainer);
      }
      this._playerContainer = null;
    }

    this._isPrepared = false;
    this._isOnLoaded = false;
    this.customData = null;
    this.server_url = null;
    this.licenseReady = false;
    this.currentTime = 0;
    this.seekWindow = null;

    this.audioTracks = [];
    this.currentAudioTrackIndex = null;

    // Call to the parent...
    this.setPlayerBackground(null);

    console.log('[LG PLAYER] BEFORE Destroy player 1...');

    this.previousPlayerState = PONCONNECT;
    this.currentPlayerState = PONCONNECT;

    console.log('[LG PLAYER] BEFORE Destroy player 2...');
    return;
  }

  addEventsListeners() {
    if(this.LGPlayer) {
      this.LGPlayer.onPlayStateChange = this.onLGPlayStateChange;
      this.LGPlayer.onReadyStateChange = this.onLGReadyStateChange;
      this.LGPlayer.onBuffering = this.onLGBuffering;
      this.LGPlayer.onError = this.onLGError;
    }
  }

  removeEventsListener() {
    if(this.LGPlayer) {
      this.LGPlayer.onPlayStateChange = null;
      this.LGPlayer.onReadyStateChange = null;
      this.LGPlayer.onBuffering = null;
      this.LGPlayer.onError = null;
    }
  }

  getCurrentTime() {
    return this.currentTime;
    //return Math.floor(this.currentTime / 1000);
  }

  getDuration() {
    return Math.floor(this._duration / 1000);
  }

  setDuration() {
    if(this.LGPlayer) {
      let mediaInfo = this.LGPlayer.mediaPlayInfo();
      if (mediaInfo && mediaInfo.duration) {
          this._duration = mediaInfo.duration;
      }
    }
  }

  /* Events */

  _onLoad() {
    console.log('[LGPLAYER ] _onLoad');
    if(this.options.events.onLoad) {
      this.options.events.onLoad();
    }
  }

  _onBufferingStart() {
    console.log('[LGPLAYER] _onBufferingStart');
    this.onPlayerStateBuffer();
    if(this.options.events.onBufferingStart) {
      this.options.events.onBufferingStart();
    }
  }

  _onBufferingComplete() {

    console.log('[LGPLAYER] _onBufferingComplete');

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
    console.log('[LGPLAYER] _onBufferingProgress');
    if(this.options.events.onBufferingProgress) {
      this.options.events.onBufferingProgress();
    }
  }

  _onWaiting() {
    console.log('[LGPLAYER EVENT] _onWaiting');
    if(this.options.events.onWaiting) {
      this.options.events.onWaiting();
    }
  }

  _onTimeUpdate(currentTime) {
    this.currentTime = currentTime;

    console.log('NETCAST CT > ', currentTime);
    console.log('NETCAST DURATION: > ', this.LGPlayer.mediaPlayInfo().duration);

    if(this.options.events.onTimeUpdate) {
      this.options.events.onTimeUpdate(currentTime);
    }
  }

  _onPlaying() {
    console.log('[PLAYER EVENT] _onPlaying');
    if(this.options.events.onPlaying) {
      this.options.events.onPlaying();
    }
  }

  _onError(errorCode, errorMessage) {
    console.log('[PLAYER EVENT] _onError', errorCode, errorMessage);
    console.log(errorMessage);
    this.stop();

    this.resetTimeUpdate();

    if(this.options.events.onError) {
      this.options.events.onError(errorMessage, errorCode);
    }
  }

  _onFinished() {
    console.log('[PLAYER EVENT] _onFinished');
    // We dont need to send the stop state to the player here, it was sending in stop method that executes before this onfinish
    if(this.options.events.onFinished) {
      this.options.events.onFinished();
    }
  }

  _onCanPlay() {
    console.log('[PLAYER EVENT] _onCanPlay> ');
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
    console.log('[LG AUDIOTRACK]> tryToGetAudioTracks init....');
    //if(!this._isOnLoaded) {
      let curTime = this.getCurrentTime();
      if(isNaN(curTime)) {
        curTime = 0;
      }

      if(curTime < 1) {
      console.log('[LG AUDIOTRACK]> tryGetAudioTracks retry number: [' +  currentTry + '] - samsung player audioTracks...');
      if(currentTry >= this.retryLimitAudioTrack) {
        throw new Error('Fail to get audioTracks');
        console.log('[LG]> Error, player instance could not initialize');
        return;
      }
      await Utils.sleep(this.retryIntervalAudioTrack);

      return this.tryGetAudioTracks(++currentTry);
    }
    else {
      console.log('[LG AUDIOTRACK]> tryToGetAudioTracks retry number: [' +  currentTry + '] -  samsung player audiioTracks is READY');

      return this.getAudioTracks();
    }
  }

  getAudioTracks() {
    let curTime = this.getCurrentTime();
    if(isNaN(curTime)) {
      curTime = 0;
    }

    console.info("[LG GET AUDIOTRACK] ", curTime);
    //if(!this._isOnLoaded) {
    if(curTime < 1) {
      console.info("[LG AUDIOTRACK] Delay 1s to get the audio track info again");
      // ...Start recursive...
      return this.tryGetAudioTracks(1);
    }

    return new Promise((resolve) => {
      this.audioTracks = []; // LG does not return info of audioTracks
      resolve(this.audioTracks);
    });
  }

  // @codeTrack iso id i.e.: esp, eng, por, ori
  setAudioTrack(codeTrack) {

    return new Promise((resolve, reject) => {
      console.log('Enter audioTrack in LGPlayer');
      if(this.currentAudioTrackIndex === codeTrack)  {
        console.info('[LG AUDIOTRACK] Same audioTrack, nothing to do');
        resolve(true);
      }
      this.currentAudioTrackIndex = codeTrack;
      try {
        console.info('[LG PLAYER AUDIOTRACK] change audioTrack', codeTrack);
        this.LGPlayer.audioLanguage = codeTrack;
      }
      catch(e) {
        console.log('[LGPLAYER] error when change lang', codeTrack);
        reject('[LGPLAYER] error when change lang');
      }
      resolve(true);
    });
  }
  /* END MULTIPLE AUDIOTRACKS */
}

export default LgPlayer;
