/* global tizen */
/**
* Dependencies
*/


import AbstractHTML5Player from '../all/AbstractHTML5Player'
import SamsungTizen from "../../utils/SamsungTizen";
import Utils from "../../utils/Utils";

import { PONCONNECT, PONSTOP } from '../../devices/all/settings';
import { SS, SS_MA, AUDIO, PLAYERIMAGE, HLS, HLSPRM, RADIO, HLS_KR } from '../../utils/playerConstants';
import { onRenderError } from '../../utils/playerConstants';

/* TODO should this inherit from HTML5? */
class TizenPlayer extends AbstractHTML5Player {

  constructor() {
    super();
    console.log('[TIZEN PLAYER] AVPlayer constructor init..');
    // Create tizen samsung objects if not
    this.SamsungTizen = new SamsungTizen();
    console.log('[TIZEN PLAYER] AVPlayer constructor init 2');
    this.prependPip = '';
    this.avplayerObject = null;

    this.webapis = window.webapis || null;

    console.log('[TIZEN PLAYER] AVPlayer constructor');
    console.log(this.webapis);

    /* MULTIAUDIO TRACK VARS */
    // Multiaudio vars are defined in parent
    /* END MULTIAUDIO TRACK VARS */

    this.retryIntervalFirstPlaying = 0.7;
    this.retryLimitFirstPlaying = 20;   
    this.visibilitychangeListener = this.visibilitychangeListener.bind(this);
    
    this.seekWindow = null;
    this.getTizenState = this.getTizenState.bind(this);
  }

  createMedia(options) {
    console.log('[TIZEN PLAYER] <<<<<<<<<<< TizenPlayer createMedia');
    console.log(options);

    if(options.isPip)
    return;

    if(this._isPrepared)
      return;

    if(!this.webapis) {
        throw new Error('Tizen webapis is nos available...');
    }

    this.options = options;
    this.prependPip = options.isPip ? '_pip' : '_full';
    this._playerContainer = document.createElement("div");
    this._playerContainer.style.position = "absolute";

    this._playerContainer.id = 'Html5PlayerContainer' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";

    // Call to the parent, set background
    this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);

    if(!this.streamIsAudio())
      this._playerContainer.className += ' tizenFullContainer';
    let idAVPlayer = 'av_player' + this.prependPip
    let playObject = "<OBJECT id='"+ idAVPlayer +"' class='playerObject' type='application/avplayer' style='position: absolute; width: 100%; height: 100%; left: 0px; top: 0px;'></OBJECT>";

    if(!this.options.parentWrapper) {
      throw new Error('Tizen player parentWrapper not found...');
    }

    try {
      this._playerContainer.innerHTML = playObject;
    }
    catch(e){
      console.log('[TIZEN PLAYER] ERRRR>>>>');
      console.log(e);
    }
    this.avplayerObject = document.getElementById(idAVPlayer);

    let vWrapper = document.getElementById(this.options.parentWrapper.id);
    vWrapper.classList.remove("background-clear");
    vWrapper.className += ' background-clear';
    vWrapper.appendChild(this._playerContainer); // Opposite to orsay
    this._isPrepared = true;
  }

  loadMedia() {
    console.log('[TIZEN PLAYER] <<<<<<<<<<< INIT TizenPlayer loadMedia 1');
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
      this.src = this.options.src;
      this._isOnLoaded = false;

      // TODO add bufferOptions to player
      let bufferOptions = {};
      let drmParams = {};

      if(this.options.streamType == SS || this.options.streamType == SS_MA) {
        //adaptative.type = '';
        //videoOptions.adaptive = adaptative;
        //videoOptions.drm = {};
        //videoOptions.drm.type = 'playready';

        // Add customData and DRM
        let server_url = this.options.drmInfo.server_url ? this.options.drmInfo.server_url : null;
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

        let drmParams = {};
        drmParams.CustomData = customData;

        console.log('[TIZEN PLAYER] CUSTOM: ' + customData);
        console.log('[TIZEN PLAYER] URL: ' + this.src);
        console.log('[TIZEN PLAYER] DRM URL: ' + server_url);
        console.log('[TIZEN PLAYER] DRM PARAMS: ' + JSON.stringify(drmParams));
        console.log('[TIZEN PLAYER] DEVICE_ID: ' + device_id);
        console.log('[TIZEN PLAYER] CONTENT_ID: ' + content_id);
        console.log('[TIZEN PLAYER] CHALLENGE: ' + challenge);

        if (server_url) {
          drmParams.LicenseServer = server_url;
        }

        try {          
          let initPlayer =  this.webapis.avplay.open(this.options.src);          
        }
        catch (e) {
          this._onError(onRenderError, 'Error open URL to play: ' + JSON.stringify(e));
          return;
        }

        if(customData) {
          let playerState = this.webapis.avplay.getState();
          console.log('[TIZEN PLAYER] setPlayerSize, playerState: ' + playerState);
          console.log('[TIZEN PLAYER] customData drmParams:');
          console.log(drmParams);
          console.log(JSON.stringify(drmParams));
          try {
            this.webapis.avplay.setDrm('PLAYREADY', "SetProperties", JSON.stringify(drmParams));
          }
          catch(e) {
            console.log('[TIZEN PLAYER] customData drmParams:');
            console.log(JSON.stringify(e));
          }
        }
        console.log('[TIZEN PLAYER] <<<<<<<<<<< INIT TizenPlayer loadMedia 6');
      }
      if(this.options.streamType === HLS || this.options.streamType === HLS_KR)
      {
        //setAdaptive = true;
        //adaptive.type = "HLS";
        //videoOptions.adaptive = adaptative;
        let initPlayer =  this.webapis.avplay.open(this.options.src);
      }

      if(this.options.streamType === AUDIO || this.options.streamType === RADIO) {
        try {
          let initPlayer =  this.webapis.avplay.open(this.options.src);
        }
        catch (e) {
          this._onError(onRenderError, 'Error open URL to play mp3: ' + JSON.stringify(e));
          return;
        }
      }
      this.hide();
    }
    else {
      this.destroy();
    }
    console.log('[TIZEN PLAYER] <<<<<<<<<<< END SefPlayer loadMedia');
    document.addEventListener('visibilitychange', this.visibilitychangeListener);
  }

  setPlayerFull() {
    // It works but we have a resolution 1280x720
    //this.setPlayerSize(0, 0, 1920, 1080);
    this.setPlayerSize(0, 0, 1280, 720);
    // TODO check 4k this.setPlayerSize(0, 0, 1920, 1080);
    // this._HTML5Player.style.position = "relative or fixed ¿?";
  }

  setPlayerSize(top, left, width, height) {
    let playerState = this.webapis.avplay.getState();
    console.log('[TIZEN PLAYER] setPlayerSize, playerState: ' + playerState);

    this._playerContainer.style.top = top + 'px';
    this._playerContainer.style.left = left + 'px';
    this._playerContainer.style.width = width + 'px';
    this._playerContainer.style.height = height + 'px';
    this._playerContainer.style.position = "relative";

    let screenResFactor = 1;
    // DOC http://developer.samsung.com/tv/develop/guides/multimedia/4k-uhd-video/
  

    

      let that = this;
      
      tizen.systeminfo.getPropertyValue("DISPLAY", function (e) {
       
        let resolutionWidth = e.resolutionWidth;
        let defaultResolutionWidth = 1280;
        screenResFactor = resolutionWidth / defaultResolutionWidth;        

        /*
    To be called in these states - "IDLE", "PAUSE", "PLAYING"
    setDisplayRect should be called before prepare (in IDLE state)
    */
        if(playerState === 'IDLE' || playerState === 'PAUSE' || playerState === 'PLAYING')
        {
          let nSize = {
            x: left,
            y: top,
            width: width,
            height: height
          };

          // Force to large resolution
          if(nSize.width === 1920) {
            nSize.x = 0;
            nSize.y = 0;
            nSize.height = 1080;
          }
          else {
            nSize.x = nSize.x * screenResFactor;
            nSize.y = nSize.y * screenResFactor;
            nSize.width = nSize.width * screenResFactor;
            nSize.height = nSize.height * screenResFactor;
          }

          that.webapis.avplay.setDisplayRect(nSize.x, nSize.y, nSize.width, nSize.height);
          if(parseInt(width) >= 1280)
            that.webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO');
        }

        // Prevent that when we want to resize and avplayer is paused, avplayer dont start playing automatically
        if (playerState === 'PAUSE') {
          that.webapis.avplay.pause();
        }

      });
     
      //if (this.webapis.productinfo.isUdPanelSupported()) {
      //  console.log("[TIZEN PLAYER] 4K UHD is supported");
      //  //UHD app resolution is 1920x1080
      //  screenResFactor = 1.5
      //}   

    return true;
  }

  async tryOnFirstPlaying(currentTry) {
    let playerState = this.webapis.avplay.getState();
    if(playerState !== 'PLAYING') {
      console.log('[TIZEN PLAYER]>  retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitFirstPlaying) {
        throw new Error('Fail to get playing state');
        console.log('[TIZEN PLAYER]> Error, Fail to get playing state');

        return;
      }
      await Utils.sleep(this.retryIntervalFirstPlaying);

      return this.tryOnFirstPlaying(++currentTry);
    }
    else {
      console.log('[TIZEN PLAYER]> player is ready and playing');
      return this.onFirstPlaying();
    }
  }

  setTimeshift() {
    if(this.options.isLive && this.timeshift !== null) {
      console.log('[TIZEN PLAYER] Playing live and with timeshift ==========================================');
      try {
        let startTime = this.webapis.avplay.getStreamingProperty("GET_LIVE_DURATION").split('|')[0];
        let endTime = this.webapis.avplay.getStreamingProperty("GET_LIVE_DURATION").split('|')[1];
        console.log('[TIZEN PLAYER] playing live, startTime ' + startTime + ' ==========================================');
        console.log('[TIZEN PLAYER] playing live, endTime ' + endTime + ' ==========================================');
        if(isNaN(startTime)) {
          startTime = 0;
          console.log('[TIZEN PLAYER] playing live, startTime is NaN, setting to 0  ==========================================');
        }
        let toseek = (Math.floor(startTime) + 1000);
        console.log('[TIZEN PLAYER] sending seek ' + toseek + ' ==========================================');

        /**
         * In order to do seek> need to send pause, next seek, next play again
         * To do a seekto> "To be called in these states - "IDLE", "PAUSE" (Buffered Data gets Flushed and the Buffering starts again from the beginning.)"
         *
         * Rererence seekTo method> http://developer.samsung.com/tv/develop/api-references/samsung-product-api-references/avplay-api/
         */
        this.webapis.avplay.pause();
        this.onPlayerStatePause();
        this.webapis.avplay.seekTo(toseek, () => {
            console.log('[TIZEN PLAYER] SUCCESS when SEEK LIVE & TIMESHIFT ==========================================');
          },
          (e) => {
            console.log('[TIZEN PLAYER] ERROR when SEEK LIVE & TIMESHIFT ==========================================');
            console.log(e);
          });
        this.webapis.avplay.play();
        this.onPlayerStatePlay();
        // Need to restore timeshift to null, if we did or not the seekTo
        this.timeshift = null;
      }
      catch(e) {
        console.error('[TIZEN PLAYER] Catch error al hacer el seek sobre live ==========================================');
        console.log(e);
      }
    }
  }

  /**
   * Notify when enter playing first time (after playing firs time or after replace source)
   */
  onFirstPlaying() {
    // Send notification
    this._onCanPlay();
    this._onPlaying();
    // set player state
    this.onPlayerStatePlay();

    if(this.options.isLive && !this.streamIsAudio()) {
      let startTime = this.webapis.avplay.getStreamingProperty("GET_LIVE_DURATION").split('|')[0];
      let endTime = this.webapis.avplay.getStreamingProperty("GET_LIVE_DURATION").split('|')[1];
      this.seekWindow = {
        startTime,
        endTime
      };
      console.log('[TIZEN PLAYER] playing live, startTime ' + startTime + ' ==========================================');
      console.log('[TIZEN PLAYER] playing live, endTime ' + endTime + ' ==========================================');
    }
  }

  play() {
    console.log('[TIZEN PLAYER] ENTER PLAY...');
    this.setPlayerFull();
    // Create events after open url
    this.addEventsListeners();
    let that = this;
    this.webapis.avplay.prepareAsync(
      /**
       * Success callback
       * "When the AVPlay instance starts preparing the media, the onbufferingstart() event handler is invoked, and the AVPlay instance enters the READY state."
       * "When playback starts, the oncurrentplaytime() event handler is invoked, and the AVPlay instance enters the PLAYING state."
       * "When avplayer.stop => The AVPlay instance enters the IDLE state."
       * Reference: http://developer.samsung.com/tv/develop/guides/multimedia/media-playback/using-avplay/
       */
      function() {
        try {
          console.log('[TIZEN PLAYER] method PLAY, webapis play');          
          that.webapis.avplay.play();
          // Resume if needed
          // TODO does it work? seekTo must be called at PAUSE/IDLE state :/
          if(that.seek_resume > 0) {
            that.webapis.avplay.seekTo(that.seek_resume * 1000);
            that.seek_resume = 0;
          }
          that._isOnLoaded = true;
          // Set duration
          that.setDuration();
          that._onLoad();
          that._onDurationChange();
          // Await for "playing" state...
          that.tryOnFirstPlaying(1);
        }
        catch(e) {
          that._onError(onRenderError, 'Error on play: ' + JSON.stringify(e));          
        }
      },
      // Error callback
      function (e) {
        that._onError(onRenderError, JSON.stringify(e));
        console.log('Error on prepareAsync: ');
        console.log(e);
        that.stop();
        that.webapis.avplay.close();        
        // TODO set screensaver OFF when playing.... set screensaver ON (restore) when dont
        //that.samsungTizen.setScreenSaver(true);
      });
      console.log('[TIZEN PLAYER] termina method PLAY');
  }

  resume() {
    this.webapis.avplay.play();
    this.onPlayerStatePlay();
    console.log('[TIZEN PLAYER] ENTER PLAY DO EXECUTE RESUME');
  }

  pause() {
    this.webapis.avplay.pause();
    this.onPlayerStatePause();
  }

  stop() {
    this.webapis.avplay.stop();
    this.onPlayerStateStop();
  }

  /* PLAYER CONTROL */
  /**
   *  @param timeshiftData = {
   *    backward: isBackward,
   *    // Si es negativo o no, se verifica en video/component, quien es quien decide 
   *    // si se va o no a pgm o solo hace seek sobre el actual playing
   *    seektime: this.state.channelInfo.timeshiftAllowed - this.state.timeshiftTime ,
   *    maxtimeshiftallowed,
   *    starttime: tiempo inicial en que se pidió el request a getmedia
   *  };
   * 
   * @param firstSeek true => se tiene que esperar hasta que el player inicie el playing y luego de esto, se manda el seek.
   *                  false => el player ya esta playeando, sobre el playing se manda el seek (no se espera por el playing).
   */
  // Based on currentTime
  seekTimeshift(timeshiftData, firstSeek) {
    console.info('[TIZEN PLAYER] seekTimeshift ', timeshiftData, firstSeek);
    if(firstSeek) {
      this.tryOnFirstTimeshiftSeek(1, timeshiftData);    
    }
    else {
      // Calcula el seek
      console.info('[TIZEN PLAYER] intentando seek en seekTimeshift < this.getCurrentTime | this.seeWindow >', this.getCurrentTime(), this.seekWindow);
      // Calcula el seek
      /*
      startTime: 0
      endTime
      */
     let seekTime = 0;
     if(this.seekWindow) {
       seekTime = (this.seekWindow.endTime/1000) - timeshiftData.seektime;
       if(seekTime < 1) {
         seekTime = 5; // 5 seconds, protect player
       }
       seekTime = Math.ceil(seekTime);
       if(seekTime >= Math.floor(this.seekWindow.endTime/1000)) {
         seekTime = Math.floor(this.seekWindow.endTime/1000) - 1; // protect player
       }
     }
     console.info('[TIZEN PLAYER] intentando seek en seekTimeshift ', seekTime);
     if(seekTime > 0) {
       console.info('[TIZEN PLAYER] enviando seek en seekTimeshift ', seekTime);
       
       this.webapis.avplay.pause();
       this.onPlayerStatePause();
       this.webapis.avplay.seekTo((seekTime * 1000), () => {
           console.log('[TIZEN PLAYER] SUCCESS when SEEK LIVE & TIMESHIFT ==========================================');
         },
         (e) => {
           console.log('[TIZEN PLAYER] ERROR when SEEK LIVE & TIMESHIFT ==========================================');
           console.log(e);
         });
       this.webapis.avplay.play();
       this.onPlayerStatePlay();
     }
     else {
       console.info('[TIZEN PLAYER] ERROR intentando seek en timeshift <timeshiftData, this.seekWindow> => ', timeshiftData, this.seekWindow);
     }
    }
  }

  async tryOnFirstTimeshiftSeek(currentTry, timeshiftData) {
    if(this.seekWindow === null) {
      console.log('[TIZEN PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitFirstPlaying) {
        throw new Error('Fail to get playing state');
        console.log('[TIZEN PLAYER]> Error, Fail to get playing state');
        return;
      }
      await Utils.sleep(this.retryIntervalFirstPlaying);

      return this.tryOnFirstTimeshiftSeek(++currentTry, timeshiftData);
    }
    else {
      console.log('[TIZEN PLAYER]> player is ready and playing');
      return this.seekTimeshift(timeshiftData, false);
    }
  }

  seek(seconds) {
    let curTime = this.getCurrentTime();
    this.skip(seconds - curTime);
  }

  skip(seconds) {
    let curTime = this.getCurrentTime();
    let contentDuration = this.getDuration();

    if (!seconds) {
      return;
    }
    let sBoundary = 10;

    if ((curTime + seconds) >= (contentDuration - sBoundary)) {
      // make sure do not skip outside of boundary
      seconds = contentDuration - curTime;
    }
    else if (curTime + seconds < 0) {
      seconds = -curTime;
    }

    console.log("[TIZEN PLAYER] skip the player with " + seconds);

    if (seconds < 0) {
        this.webapis.avplay.jumpBackward(seconds * 1000 * (-1));
    }
    else {
        this.webapis.avplay.jumpForward(seconds * 1000);
    }
  }

  replaceMediaSource(newSource) {
     // no replace for pip
     if(this.options.isPip) {
      return;
    }

    console.log('[TIZEN PLAYER] player enter replace', newSource);
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

    this.stop();

    this.audioTracks = [];
    this.currentAudioTrackIndex = null;
    this.seekWindow = null;

    if(this.options.streamType === SS || this.options.streamType === SS_MA) {

      let server_url = this.options.drmInfo.server_url ? this.options.drmInfo.server_url : null;
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

      //videoOptions.drm.userData = customData;
      let drmParams = {};
      drmParams.CustomData = customData;

      console.log('[TIZEN PLAYER] REPLACE CUSTOM: ' + customData);
      console.log('[TIZEN PLAYER] REPLACE URL: ' + this.options.src);
      console.log('[TIZEN PLAYER] REPLACE DRM URL: ' + server_url);
      console.log('[TIZEN PLAYER] REPLACE DRM PARAMS: ' + JSON.stringify(drmParams));
      console.log('[TIZEN PLAYER] REPLACE DEVICE_ID: ' + device_id);
      console.log('[TIZEN PLAYER] REPLACE CONTENT_ID: ' + content_id);
      console.log('[TIZEN PLAYER] REPLACE CHALLENGE: ' + challenge);

      if (server_url) {
        drmParams.LicenseServer = server_url;
      }

      try {
        // enter IDLE state after open
        let initPlayer =  this.webapis.avplay.open(this.options.src);
      }
      catch (e) {
        this._onError(onRenderError, 'Error open URL to play: ' + JSON.stringify(e));
        return;
      }

      if(customData) {
        let playerState = this.webapis.avplay.getState();
        console.log('[TIZEN PLAYER] replace setPlayerSize, playerState: ' + playerState);
        console.log('[TIZEN PLAYER] replace customData drmParams:');
        console.log(drmParams);
        console.log(JSON.stringify(drmParams));

        try {
          this.webapis.avplay.setDrm('PLAYREADY', "SetProperties", JSON.stringify(drmParams));
        }
        catch(e) {
          console.log('[TIZEN PLAYER] ERRR replace customData drmParams:');
          console.log(JSON.stringify(e));
        }
      }
    }

    if(this.options.streamType == HLS || this.options.streamType == HLS_KR) {
      try {
        let initPlayer =  this.webapis.avplay.open(this.options.src);
      }
      catch (e) {
        this._onError(onRenderError, 'Error open URL to play: ' + JSON.stringify(e));
        return;
      }
    }

    if(this.options.streamType == AUDIO || this.options.streamType == RADIO) {
      try {
        let initPlayer =  this.webapis.avplay.open(this.options.src);
      }
      catch (e) {
        this._onError(onRenderError, 'Error open URL to play: ' + JSON.stringify(e));
        return;
      }
    }

    this.setPlayerFull();
    this.hide();
  }

  hide() {
    if(this._playerContainer) {
      console.log('[TIZEN PLAYER] hide tizen object, to see background in screen while we await for play');
      this._playerContainer.childNodes[0].style.visibility = 'hidden';
    }
  }

  show() {
    if(this._playerContainer && !this.streamIsAudio()) {
      console.log('[TIZEN PLAYER] show tizen object, will not see background in screen we are playing');
      this._playerContainer.childNodes[0].style.visibility = 'visible';
    }
  }

  destroy() {
    if(this.options.isPip) {
      return;
    }

    if (!this._isPrepared) {
      return;
    }

    /*
    // if we are un epg and did a replace, we dont need to destroy player
    // we come from a replace
    if(this.options.newSource && this.options.newSource.src) {
      this.currentContentTime = 0;
      return;
    }
    */

    this.stop();
    this.removeEventsListener();
    // Destroy avplayer, wait for next playing...
    this.webapis.avplay.close();

    if (this._playerContainer) {

      if(!this.streamIsAudio()) {
        this._playerContainer.className = this._playerContainer.className.replace('tizenFullContainer', ' ');
      }

      this._playerContainer.innerHTML = '';

      if(this._playerContainer.parentNode) {
        this._playerContainer.parentNode.removeChild(this._playerContainer);
      }

      this._playerContainer = null;
      this.avplayerObject = null;
    }

    this._isPrepared = false;

    this.audioTracks = [];
    this.currentAudioTrackIndex = null;
    this.seekWindow = null;

    // Call to the parent...
    this.setPlayerBackground(null);

    this.previousPlayerState = PONCONNECT;
    this.currentPlayerState = PONCONNECT;
        
    document.removeEventListener("visibilitychange", this.visibilitychangeListener);
    return;
  }

  /* DONT use for the moment...maybe it will be used in ps4 player
  removeBackgroundAndStyle() {
    return;
    let html_style = document.getElementsByTagName("html")[0].style;
    let body_style = document.getElementsByTagName("body")[0].style;
    let root_style = document.getElementById("root").style;

    if(this.styleBackup === null) {
      this.styleBackup = {
        html: html_style,
        html_style: html_style.cssText,

        body: body_style,
        body_style: body_style.cssText,

        root: root_style,
        root_style: root_style.cssText
      };
    }
    console.log('******* <<<<<<<<<<< INIT TIZEN Web Root Style');
    html_style.cssText += ";background:transparent;";
    body_style.cssText += ";background:transparent;";
    root_style.cssText += ";background:transparent;";
  }

  restoreBackgroundAndStyle() {
    return;
    if(this.styleBackup !== null) {
      let html_style = document.getElementsByTagName("html")[0].style;
      let body_style = document.getElementsByTagName("body")[0].style;
      let root_style = document.getElementById("root").style;

      html_style.cssText = this.styleBackup.html_style;
      body_style.cssText = this.styleBackup.body_style;
      root_style.cssText = this.styleBackup.html_style;
    }
  }
  */

  addEventsListeners() {    
    let listeners = {
        onbufferingstart: () => {
            this._onBufferingStart();
        },
        onbufferingprogress: (percent) => {
            this._onBufferingProgress(percent);
        },
        onbufferingcomplete: () => {
            this._onBufferingComplete();
        },
        oncurrentplaytime: (currentTime) => {
            this._onTimeUpdate(currentTime);
        },
        onevent: (eventType, eventData) => {
            console.log("[TIZEN PLAYER] onevent: " + eventType + ", data: " + eventData);
        },
        onerror: (eventId) => {
          let errMsg = 'Unknown error';
          if(eventId && eventId.name) {
            if(eventId.name === 'PLAYER_ERROR_NONE') {
              return;
            }
            switch(eventId.name) {
              case "PLAYER_ERROR_INVALID_PARAMETER": errMsg = 'Unable to find parameters'; break;
              case "PLAYER_ERROR_NO_SUCH_FILE": errMsg = 'Unable to find the specified media content'; break;
              case "PLAYER_ERROR_INVALID_OPERATION": errMsg = 'Failed to create the player'; break;
              case "PLAYER_ERROR_SEEK_FAILED": errMsg = 'Failed to perform seek operation, or seek operation called during an invalid state'; break;
              case "PLAYER_ERROR_INVALID_STATE": errMsg = 'AVPlay API method was called during an invalid state'; break;
              case "PLAYER_ERROR_NOT_SUPPORTED_FILE": errMsg = 'Multimedia file format not supported'; break;
              case "PLAYER_ERROR_INVALID_URI": errMsg = 'Input URI is in an invalid format'; break;
              case "PLAYER_ERROR_CONNECTION_FAILED": errMsg = 'Failed multiple attempts to connect to the specified content server'; break;
              case "PLAYER_ERROR_GENEREIC": errMsg = 'Failed to create the display window'; break;
              default: errMsg = 'Unknown error';
            }
          }
          this._onError(onRenderError, errMsg);
        },
        onsubtitlechange: (duration, text, data3, data4) => {
            console.log("Subtitle Changed.");
        },
        ondrmevent: (drmEvent, drmData) => {
            console.log("DRM callback: " + drmEvent + ", data: " + drmData);
        },
        onstreamcompleted: () => {
            this.stop();
            this._onFinished();
        },
        ondrmcallback: (e) => {
          console.log('[TIZEN PLAYER] DRM Event error');
          console.log(JSON.stringify(e));
          this._onDRMError(e);
        }
    }

    this.webapis.avplay.setListener(listeners);
  }
  
  visibilitychangeListener() {
    let playerState = this.webapis.avplay.getState();
    try {
      if (document.hidden) {
        //this.webapis.avplay.suspend();
        if (playerState === 'PLAYING') {
          this.pause();
        }
      } else {
        if (playerState === 'PAUSED') {
          //this.webapis.avplay.restore();
          this.resume();
        }
        else
          if (this.options.events && this.options.events.onReplay
            && typeof this.options.events.onReplay === "function") {            
            this.options.events.onReplay();
          }
      }
    }
    catch (e) {
      console.error("avplay restore: " + e);
      if (this.options.events && this.options.events.onReplay && typeof this.options.events.onReplay === "function") {
        this.options.events.onReplay();
      }
    }
  }

  _onDRMError(e) {
    console.log('[TIZEN PLAYER] DRM ERROR ' + e);
  }

  removeEventsListener() {
  }

  getCurrentTime() {
    return Math.floor(this.currentTime / 1000);
  }

  getDuration() {
    return Math.floor(this._duration / 1000);
  }

  setDuration() {
    this._duration = this.webapis.avplay.getDuration();
    console.log("[TIZEN PLAYER] get the duration " + this._duration);
  }

  getTizenState() {
    var BRet = this.webapis.avplay.getState();    
    return BRet;
  }
  /* Events */

  _onLoad() {
    console.log('[TIZEN PLAYER] _onLoad');
    if(this.options.events.onLoad) {
      this.options.events.onLoad();
    }
  }

  _onUnknownEvent(eventType, param1, param2) {
    console.info("[TIZEN PLAYER] A TIZEN AVPlayer Unknown event: " + eventType + ", parameters: " + param1 + ", " + param2);
  }

  _onBufferingStart() {
    console.log('[TIZEN PLAYER] _onBufferingStart');
    this.onPlayerStateBuffer();
    if(this.options.events.onBufferingStart) {
      this.options.events.onBufferingStart();
    }
  }

  _onBufferingComplete() {
    console.log('[TIZEN PLAYER] _onBufferingComplete');

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

  _onBufferingProgress(percent) {
    console.log('[TIZEN PLAYER] _onBufferingProgress');
    if(this.options.events.onBufferingProgress) {
      this.options.events.onBufferingProgress(percent);
    }
  }

  _onWaiting() {
    console.log('[TIZEN PLAYER] _onWaiting');
    if(this.options.events.onWaiting) {
      this.options.events.onWaiting();
    }
  }

  _onTimeUpdate(currentTime) {
    //console.log('CurentTime: ' + currentTime);
    this.currentTime = currentTime;
    if(this.options.events.onTimeUpdate) {
      this.options.events.onTimeUpdate(this.getCurrentTime());
    }

    //console.log('CurrentTime: ' + this.getCurrentTime());
  }

  _onPlaying() {
    console.log('[TIZEN PLAYER] _onPlaying');
    if(this.options.events.onPlaying) {
      this.options.events.onPlaying();
    }
  }

  _onError(errorCode, errorMessage) {
    console.log('[TIZEN PLAYER] _onError');
    console.log(errorMessage);
    if (this.getTizenState() != 'PLAYING') {      
      this.stop();

      if(this.options.events.onError) {
        this.options.events.onError(errorMessage, errorCode);
      }
    }    
  }

  _onFinished() {
    console.log('[TIZEN PLAYER] _onFinished');
    this.destroy();
    // We dont need to send the stop state to the player here, it was sending in stop method that executes before this onfinish
    if(this.options.events.onFinished) {
      this.options.events.onFinished();
    }
  }

  _onCanPlay() {
    // We already could play...so show the player...
    this.show();
    console.log('[TIZEN PLAYER] _onCanPlay> ');
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
      console.log('[TIZEN PLAYER]> tryGetAudioTracks retry number: [' +  currentTry + '] - Tizen AVPlayer audioTracks...');
      if(currentTry >= this.retryLimitAudioTrack) {
        throw new Error('Fail to get audioTracks');
        console.log('[TIZEN PLAYER]> Error, player instance could not initialize');
        return;
      }
      await Utils.sleep(this.retryIntervalAudioTrack);

      return this.tryGetAudioTracks(++currentTry);
    }
    else {
      console.log('[TIZEN PLAYER]> tryToGetAudioTracks retry number: [' +  currentTry + '] -  Tizen AVPlayer audiioTracks is READY');

      return this.getAudioTracks();
    }

  }

  getAudioTracks() {
    console.info("[TIZEN PLAYER] getAudioTracks init");    

    if (this.webapis.avplay.getState() !== "PLAYING") {
      console.info("[TIZEN PLAYER] getAudioTracks delay 1s to get the audio track info again");
      return this.tryGetAudioTracks(1);
    }

    return new Promise((resolve) => {
      console.info("[TIZEN PLAYER] Recuperado info de tracks...");
      let audioTracks = this.webapis.avplay.getTotalTrackInfo();
      let i = 0;
      for (i = 0; i < audioTracks.length; i++) {
        let oneTrack = audioTracks[i];        
        if (oneTrack.type === "AUDIO") {
          let extraInfo = JSON.parse(oneTrack.extra_info);
          //FIX si viene un audio mismo idioma repetido no lo agrega
          const audioTrack = this.audioTracks.filter(audio => (audio.lang === extraInfo.language));          
          if (audioTrack.length===0) {
            this.audioTracks.push({ index: oneTrack.index, lang: extraInfo.language });
          }          
        }
      }

      console.info("[TIZEN PLAYER] AVPlayer Audio Tracks: " + JSON.stringify(this.audioTracks));
      resolve(this.audioTracks);
    });
  }

  /**
   *
   * @param {*} currentTry
   * @param {*} lang
   * Need to await for the player to can change the audio track
   */
  async trySetAudioTrack(currentTry, lang) {    
    let CT = this.getCurrentTime();
    if(isNaN(CT)) {
      CT = 0;
    }
    if(CT <= 0) {
      if(currentTry >= this.retryLimitAudioTrack) {
        throw new Error('Fail to set audioTrack');
        return;
      }
      await Utils.sleep(this.retryIntervalAudioTrack);

      return this.trySetAudioTrack(++currentTry, lang);
    }
    else {
      return this.setAudioTrack(lang);
    }
  }

  // @codeTrack iso id i.e.: esp, eng, por, ori
  setAudioTrack(codeTrack) {    
    let CT = this.getCurrentTime();
    if(isNaN(CT)) {
      CT = 0;
    }

    // If player is not playing yet, we need to await...when the current playing-time will be > 0
    if (CT <= 0) {
      console.info("[TIZEN PLAYER] Delay 1s to SET the audio track info again");
      return this.trySetAudioTrack(1, codeTrack);
    }

    console.log('audiotrack setting to ', codeTrack);
    if (!this.webapis.avplay.getState() === "PLAYING") {
      return new Promise((reject) => {
          reject('[TIZEN PLAYER] error when changing audioTracks, player is not playing content');
      });
    }

    return new Promise((resolve, reject) => {
      if(!this._isOnLoaded) {        
        reject('Dont have audioTracks information');
      }

      let internalAudioIndex = this.getAudioIndexOfCode(codeTrack);
      if(internalAudioIndex === null) {        
        reject('Dont have audioTracks information, index lang does not exist');
      }
      else {
        internalAudioIndex = parseInt(internalAudioIndex, 10);        
        if(this.currentAudioTrackIndex === internalAudioIndex)  {
          console.info('[TIZEN AVPlayer TIZEN] Same audioTrack, nothing to do');
          resolve(true);
        }
        let audioType = "AUDIO"        
        
        const totalRetries = 25;
        const intervalRetries = 500;
        let retry = 1;
        var that = this;

        var timerId = setInterval(() => {
          try {
            if (retry == totalRetries) {
              clearInterval(timerId)
              resolve(false);
            }

            that.webapis.avplay.setSelectTrack(audioType, internalAudioIndex);
            
            clearInterval(timerId);
            that.currentAudioTrackIndex = internalAudioIndex;
            
            resolve(true);
           
          } catch (e) {
            console.error('webapis.avplay.setSelectTrack error', e);            
          }

          retry++;

        }, intervalRetries);
      }
    });
  }

  getAudioIndexOfCode(codeTrack) {
    let ret = null;
    for(let j = 0; j < this.audioTracks.length; j++) {
      if(this.audioTracks[j].lang === codeTrack) {
        ret = this.audioTracks[j].index;
        break;
      }
    }
    
    return ret;
  }

  /* END MULTIPLE AUDIOTRACKS */
}

export default TizenPlayer;
