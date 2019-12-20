import AbstractHTML5Player from '../all/AbstractHTML5Player'
import Device from "../../devices/device";
import Utils from "../../utils/Utils";
import RequestManager from "./../../requests/RequestManager";
import NagraDRMTask from './../../requests/tasks/video/NagraDRMTask';
import { SS, SS_MA, AUDIO, PLAYERIMAGE, HLS, HLSPRM, RADIO, HLS_KR, DVBC } from '../../utils/playerConstants';
import * as playerConstant from '../../utils/playerConstants';

import { PONCONNECT, PONSTOP, PONPAUSE } from '../../devices/all/settings';
import TracksUtil from './TracksUtil';

class NagraPlayer extends AbstractHTML5Player {

  constructor() {
    super();

    this.nagra_drm_url = null; // URL to play VOD, with additional params
    this._CCOM = window.parent.CCOM || window.CCOM;
    this.attr_id_instance = null; // Pip or full
    this.nagraPlayerInst = null; // Player instance
    this.currentContentTime = null; // real time second playing
    this.nagraPlayInterval = 1; // Seconds between attemps to play (delay/sleep)
    this.nagraPlayRetries = 20; // Max number of retries before send error
    this.retryLimitAudioTrack = 10; // Max number of retries to get audioTracks

    this.nagraPlayerReady = false; //
    this.fireOnDurationChange = false;

    this.timeUpdateTimeoutID = null;
    this.prependPip = '';
    this.currentContentTimeOnPause = null;

    this.tracks = new TracksUtil(this);

    this._audioTracksLoaded = false;

    this._inError = false;
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
      if(this.getCurrentPlayerState() === PONPAUSE) {
        this._onTimeUpdate(this.currentContentTimeOnPause);
      }
      else {
        this.currentContentTime = this.nagraPlayerInst.realTimePosition.currentPosition;
        this._onTimeUpdate(this.currentContentTime);
      }
    }, 800);
  }

  createPlayer(options) {

    this.prependPip = options.isPip ? '_pip' : '_full';
    this._playerContainer = window.document.createElement("div");
    this._playerContainer.style.backgroundColor = "transparent";
    this._playerContainer.id = 'Html5PlayerContainer' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";

    let vIndex = options.isPip ? 1 : 0;

    if(!this.streamIsImage()) {
      this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);

      this._playerHTMLTag = window.document.createElement('video');
      this._playerHTMLTag.setAttribute('id', 'Html5Player' + this.prependPip);
      this._playerHTMLTag.className = "Html5Player";
      this._playerContainer.appendChild(this._playerHTMLTag);
    }
    else {
      this.setPlayerBackground(options.src ? options.src : null);
    }

    if(!this.options.parentWrapper) {
      console.error('parentWrapper not found');
      return;
    }

    let vWrapper = document.getElementById(this.options.parentWrapper.id);
    // vWrapper.appendChild(this._playerContainer);
    vWrapper.insertBefore(this._playerContainer, vWrapper.firstChild);

    if(!this.streamIsImage()) {
      this.attr_id_instance = 'display://' + vIndex;
      //console.log('******* <<<<<<<<<<< NagraPlayer createMedia 7');
      this._playerHTMLTag.setAttribute('otv-video-destination', this.attr_id_instance); // otv-video-destination=""
      this._playerHTMLTag.setAttribute('src', this.attr_id_instance); // otv-video-destination=""
      this._playerHTMLTag.setAttribute('height','720px');
      this._playerHTMLTag.setAttribute('width','1280px');
    }
  }

  createMedia(options) {
    console.log('******* <<<<<<<<<<< NagraPlayer createMedia');
    if(this._isPrepared)
      return;

    // Just in case...newSource attr only arrive here when it is a replaceMediaSource (enter in replace method below),
    // so in this path we dont have to have this attr, reset it
    if(options.newSource && options.newSource.src) {
      options.newSource = null;
    }
    this.options = options;

    /*
    if(this.options.isPip) {
      // Pip would only exist when this is a video or audio
      this._playerHTMLTag = document.getElementById('Html5Player_pip');
      if(!this._playerHTMLTag) {
        this.createPlayer(options);
      }
      else {
        let vIndex = options.isPip ? 1 : 0;
        this.attr_id_instance = 'display://' + vIndex;
        this._playerContainer = document.getElementById('Html5PlayerContainer_pip');
        if(!this.streamIsImage()) {
          this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);
        }
      }
    }
    else {
      this.createPlayer(options);
    }
    */

    this.createPlayer(options);

    this.hide();
    this._isPrepared = true;

    return;
  }

  setPlayerAudio(instance) {
    // Muted only apply to pip, at this moment
    /*
    if(!this.options.isPip) {
        console.log('setPlayerAudio full');
        //this._CCOM.PlayerManager.PlayerManager.setAudioStatus(instance, instance.AUD_OUT_VAL_FALSE);
    }
    */
  }

  loadMedia() {

    console.log('******* <<<<<<<<<<< INIT NagraPlayer loadMedia');

    if(!this._isPrepared) {
      return false;
    }

    if(this.streamIsImage()) {
      return;
    }

    if(this.options.resume && !this.options.isLive) {
      this.seek_resume = this.options.resume;
    }

    // Override VOD seek if live&timeshift, above
    if(this.options.timeshift
      && this.options.isLive
      && !this.options.isPip
      && this.options.streamType === playerConstant.HLSPRM) {
        this.seek_resume = 1; // force seek to init of timeshift content
    }

    this._inError = false;

    if(this.options.src) {
      this.nagra_drm_url = this.options.src;
      this.src = this.options.src;

      if(this.streamIsAudio() && this.options.drmInfo) { // Sure it is music
        this.options.drmInfo.server_url = null;
        this.options.drmInfo.challenge = null;
        this.options.drmInfo.content_id = null;
      }

      let server_url = this.options.drmInfo && this.options.drmInfo.server_url ? this.options.drmInfo.server_url : null;
      let challenge = this.options.drmInfo && this.options.drmInfo.challenge ? this.options.drmInfo.challenge : null;
      let content_id = this.options.drmInfo && this.options.drmInfo.content_id ? this.options.drmInfo.content_id : null;

      console.log("[NAGRA VIDEO URL]:", this.nagra_drm_url);
      // "1" si es trailer, "0" si es VOD
      let nagra_content_id = this.options.isTrailer ? '1' : '0';
      if(content_id) {
        nagra_content_id = content_id + nagra_content_id;
      }
      let mdrm_content_id = nagra_content_id;

      let encodedChallenge = '';
      if(challenge) {
        encodedChallenge = Utils.base64_encode(challenge);
      }
      let nagraData = '{\\"com.nagra.portalKey\\" : \\"DLA\\", \\"com.nagra.applicationData\\" : \\"'+ encodedChallenge +'\\"}';
      let mdrm_application_data = Utils.base64_encode(nagraData);

      let smartcardId =  Device.getDevice().getConfig().smartcardId;




      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ' + smartcardId);
      if(this.streamIsVideo() && server_url && challenge) {
        this.nagra_drm_url = Utils.appendParamToUrl(this.nagra_drm_url, "mdrm_application_data", mdrm_application_data)
        this.nagra_drm_url = Utils.appendParamToUrl(this.nagra_drm_url, "mdrm_device_id", smartcardId);
        if(!this.options.isLive)
          this.nagra_drm_url = Utils.appendParamToUrl(this.nagra_drm_url, "mdrm_content_id", mdrm_content_id)
      }

      console.log('URL: ' + this.src);
      console.log('DRM URL: ' + server_url);
      console.log('NAGRA DRM URL: ' + this.nagra_drm_url);

      if(this.options.streamType === DVBC) {
        let playerManager = this._CCOM.PlayerManager;
        let playerInstance = playerManager.getInstance({destUri: this.attr_id_instance});
        this.nagraPlayerInst = playerInstance.instance;

        console.log('---------------------------------------------> loadMedia 1: ', this.nagraPlayerInst);

        this.setPlayerAudio(this.nagraPlayerInst);

        this.addEventsListeners();
        this._isOnLoaded = false;
        this.nagraPlayerReady = true;
        this.hide();
      }
      else if(server_url && challenge) {

        this.requestDRM(server_url, challenge).then(
          (drm_response) => {

            console.log('[se: ');
            console.log(drm_response);

            let playerManager = this._CCOM.PlayerManager;

            playerManager.addEventListener('onPlayerInstanceCreated', () => {
              console.log('[PLAYER MANAGER] playerInstance : successfully created');
            });
            playerManager.addEventListener('onPlayerInstanceCreateFailure', () => {
              console.log('[PLAYER MANAGER] playerInstance : ERROR when created playerInstance');
            });

            let playerInstance = playerManager.getInstance({destUri: this.attr_id_instance});

            if (playerInstance.error) {
              // throw error...
              console.log('Failed playerManager.getInstance display://0');
              console.log("res.error.domain: " + playerInstance.error.domain);
              console.log("res.error.name: " + playerInstance.error.name);
              console.log("res.error.message: " + playerInstance.error.message);

              console.log('[NAGRA PLAYER] error when recovery instance: ' + playerInstance.error);
            }
            else {

              this.nagraPlayerInst = playerInstance.instance;
              console.log('---------------------------------------------> loadMedia 2: ', this.nagraPlayerInst);

              this.setPlayerAudio(this.nagraPlayerInst);
              console.log('[NAGRA PLAYER] success when recovery instance');
              // Add listeners...
              this.addEventsListeners();
              this._isOnLoaded = false;
              this.nagraPlayerReady = true;
              this.hide();
            }
          }
        ).catch((e) => {
          console.log('EERRRRR en NagraPlayer');
          console.log(JSON.stringify(e));
        });
      }
      else {
        let playerManager = this._CCOM.PlayerManager;
        let playerInstance = playerManager.getInstance({destUri: this.attr_id_instance});
        this.nagraPlayerInst = playerInstance.instance;
        this.setPlayerAudio(this.nagraPlayerInst);
        this.addEventsListeners();
        this._isOnLoaded = false;
        this.nagraPlayerReady = true;
        this.hide();

        if(this.streamIsAudio()) {
          console.log('NAGRAMP3> setting resize when audio');
          this.setPlayerSize(0,0,0,0);
        }
      }
    }
    else {
      this.destroy();
    }
    console.log('******* <<<<<<<<<<< END NagraPlayer loadMedia');
  }

  async requestDRM(server_url, challenge) {
    //return new Promise((resolve) => { resolve(true); });

    console.log('[NAGRA DRM] server url: ' + server_url + ', challenge: ' + challenge);
    let ngrTask = new NagraDRMTask({url: server_url, challenge: challenge});
    const drm_request = await RequestManager.addRequest(ngrTask);

    return drm_request;
  }

  async tryToPlay(currentTry) {
    if (!this.nagraPlayerReady) {
      console.log('[NAGRAPLAYER]> tryToPlay retry number: [' +  currentTry + '] - nagra player is not ready yet...');
      if (currentTry >= this.nagraPlayRetries)
      {
        console.log('[NAGRAPLAYER]> Error, player instance could not initialize');
        return;
      }
      await Utils.sleep(this.nagraPlayInterval);

      return this.tryToPlay(++currentTry);
    }
    else {
      console.log('[NAGRAPLAYER]> tryToPlay retry number: [' +  currentTry + '] -  nagra player is READY');

      return this.play();
    }
  }

  play() {

    if(this.streamIsImage()) {
      return;
    }

    console.log('---------------------------------------------> play 1: ', this.nagraPlayerInst);
    if(!this.nagraPlayerInst) {
      console.log('---------------------------------------------> play 1.5: ', this.nagraPlayerInst);
      let playerManager = this._CCOM.PlayerManager;
      let playerInstance = playerManager.getInstance({destUri: this.attr_id_instance});
      this.nagraPlayerInst = playerInstance.instance;
    }

    if(!this.nagraPlayerReady) {
      return this.tryToPlay(1);
    }

    console.log('******* <<<<<<<<<<< INIT Nagra play');
    this.show();

    let playCommands = [];

    if(this.seek_resume > 0) {
      console.log('******* <<<<<<<<<<< INIT Nagra play with resume');

      let offsetSeek = Math.floor(this.seek_resume * 1000);
      if(offsetSeek < 0)
        offsetSeek = 0;

      let playResumeControlCommand = {
        commandType: this.nagraPlayerInst.PLAY_CONTROL_CMD_POSITION,
        positionCommandData: {
          whence: this.nagraPlayerInst.SEEK_SET,
          type: this.nagraPlayerInst.POSITION_TYPE_TIME_BASED,
          timePosition: offsetSeek
        }
      };
      playCommands.push(playResumeControlCommand);
    }

    if(this.streamIsAudio()) {
      // For test,
      let sub_url = this.nagra_drm_url.replace('typeId=10', 'typeId=6');
      console.log('Playing SOURCE AUDIO URI: ' + sub_url);
      this.nagraPlayerInst.play(sub_url, []);
    }
    else {
      console.log('Playing SOURCE VIDEO URI: ' + this.nagra_drm_url);
      // Only for test! this.nagra_drm_url = this.getTestHLS();
      try {
        console.log('---------------------------------------------> play 2: ', this.nagraPlayerInst, this.nagra_drm_url, playCommands);
        this.nagraPlayerInst.play(this.nagra_drm_url, playCommands);
      }
      catch(e) {
        console.log('---------------------------------------------> play 3: ', this.nagraPlayerInst, this.nagra_drm_url);
      }
    }

    this.onPlayerStatePlay();
  }

  // Only for test
  getTestHLS() {
    let test = '';
    let test_options =  [
      'https://mnmedias.api.telequebec.tv/m3u8/29880.m3u8',
      'http://184.72.239.149/vod/smil:BigBuckBunny.smil/playlist.m3u8',
      'http://www.streambox.fr/playlists/test_001/stream.m3u8'
    ];

    let next = Math.floor(Math.random() * 3);
    console.log('[NAGRA] Test url: ' + next);

    return test_options[next];
  }

  resume() {
    console.log('******* <<<<<<<<<<< INIT Nagra resume');
    if(this.nagraPlayerInst) {
      this.currentContentTimeOnPause = null;
      this.nagraPlayerInst.setSpeed(100);
      this.onPlayerStatePlay();
    }
  }

  pause() {
    console.log('******* <<<<<<<<<<< INIT Nagra pause');
    if(this.nagraPlayerInst) {
      // Save current time (for duration)...
      this.currentContentTimeOnPause = this.getCurrentTime();
      this.nagraPlayerInst.setSpeed(0);
      this.onPlayerStatePause();
    }
  }

  stop() {
    if(this.nagraPlayerInst) {
      this.nagraPlayerInst.stop();
      this.onPlayerStateStop();
    }
  }

  hide() {
    if (this._playerHTMLTag) {
      this._playerHTMLTag.style.visibility = "hidden";
    }
    let vWrapper = document.getElementById(this.options.parentWrapper.id);
    if(vWrapper && this.options.isPip) {
      vWrapper.style.zIndex = '-1';
      vWrapper.style.display = 'none';
    }
  }

  // It is suppossed to be new live, content and DVBC
  replaceMediaSource(newSource) {
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
    this._inError = false;
    this._audioTracksLoaded = false;

    // If DRM apply..
    if(newSource.drmInfo.server_url && newSource.drmInfo.challenge) {
      console.log('[NAGRA PLAYER] REPLACE, we have DRM');
      this.nagraPlayerReady = false;
      this.nagra_drm_url = newSource.src;

      this.requestDRM(newSource.drmInfo.server_url, newSource.drmInfo.challenge).then(
        (drm_response) => {
          console.log('[NAGRA PLAYER] REPLACE, return from DRM request');
          let encodedChallenge = '';
          if(newSource.drmInfo.challenge) {
            encodedChallenge = Utils.base64_encode(newSource.drmInfo.challenge);
          }
          let nagraData = '{\\"com.nagra.portalKey\\" : \\"DLA\\", \\"com.nagra.applicationData\\" : \\"'+ encodedChallenge +'\\"}';
          let mdrm_application_data = Utils.base64_encode(nagraData);
          let smartcardId =  Device.getDevice().getConfig().smartcardId;
          this.nagra_drm_url = Utils.appendParamToUrl(this.nagra_drm_url, "mdrm_application_data", mdrm_application_data)
          this.nagra_drm_url = Utils.appendParamToUrl(this.nagra_drm_url, "mdrm_device_id", smartcardId);

          // "1" si es trailer, "0" si es VOD
          let nagra_content_id = this.options.isTrailer ? '1' : '0';
          if(newSource.drmInfo.content_id) {
            nagra_content_id = newSource.drmInfo.content_id + nagra_content_id;
          }
          let mdrm_content_id = nagra_content_id;

          if(newSource.drmInfo.content_id)
            this.nagra_drm_url = Utils.appendParamToUrl(this.nagra_drm_url, "mdrm_content_id", mdrm_content_id)

          // Do a seek when timeshift & live (only starttime)
          if(newSource.timeshift
              && newSource.isLive
              && !newSource.isPip
              && newSource.streamType === playerConstant.HLSPRM) {
                this.seek_resume = 1; // force seek to init of timeshift content
              }
          console.log('[NAGRA PLAYER] REPLACE, DRM URL: ', this.nagra_drm_url);
          this.nagraPlayerReady = true;
        }
      );
    }
    else {
      // play without DRM
      this.nagra_drm_url = newSource.src;
      this.nagraPlayerReady = true;
    }
    console.log('[NAGRA] Replace url, new url: ' + this.nagra_drm_url);
    this.onPlayerStateStop();
    // Let nagra player take care itself to stop and playing again with a new source
    // Play ahora se controla desde onresolve AAFPlayer
    //this.play();
  }

  show() {
    console.log('NAGRAPLAYER show');
    if (this._playerHTMLTag) {
      this._playerHTMLTag.style.visibility = "visible";
    }
    let vWrapper = document.getElementById(this.options.parentWrapper.id);
    if(vWrapper && this.options.isPip) {
      vWrapper.style.zIndex = '100';
      vWrapper.style.display = 'block';
    }

    if(this.options.src && this.options.streamType)
    {
      let playerManager = this._CCOM.PlayerManager;
      let playerInstance = playerManager.getInstance({destUri: this.attr_id_instance}).instance;
      if(playerInstance) {
        playerInstance.setVideoLayerDetails(
          {
            opacity: 1,
            zorder: playerInstance.VIDEO_LAYER_ZORDER_TOP
          }
        );
      }
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
    /*
    console.info('[PLAYER] seekTimeshift ', timeshiftData, firstSeek);
    if(firstSeek) {
      this.tryOnFirstTimeshiftSeek(1, timeshiftData);    
    }
    else {
      console.log('[WEB0S PLAYER] trying to do timeshift seek to: <secondTo/seekWindow>  ', secondTo, this.seekWindow);
    }
    */
  }

  async tryOnFirstTimeshiftSeek(currentTry, timeshiftData) {
    
  }
  
  seek(seconds) {
    this.skip(seconds);
  }

  skip(seconds) {
    let boundaryTime = 1;
    let positionCommandData = {};

    positionCommandData = {
      whence: this.nagraPlayerInst.SEEK_SET,
      type: this.nagraPlayerInst.POSITION_TYPE_TIME_BASED,
      timePosition: Math.floor(seconds * 1000)
    };

    this.nagraPlayerInst.setPosition(positionCommandData);
  }

  destroy() {
    if (!this._isPrepared) {
      return;
    }

    this.resetTimeUpdate();
    this._inError = false;

    console.log('---------------------------------------------> DESTROY: ', this.options);

    this._audioTracksLoaded = false;
    /*
    // if we are un epg and did a replace, we dont need to destroy player
    // we come from a replace
    if(this.options.newSource && this.options.newSource.src) {
      this.currentContentTime = 0;

      return;
    }
    */

    // Both, pip and full, audio and video, stop and remove listeners
    if(!this.streamIsImage()) {
      this.removeEventsListener();
    }

    this.destroyPlayerContainer();

    if(!this.streamIsImage()) {
      this.stop()
    }

    /*
    if(this.options.isPip) {
      this.destroyPip();
      if(this.streamIsImage()) {
        this.destroyPlayerContainer();
      }
    }
    else {
      this.destroyPlayerContainer();
    }
    */
    this.nagraPlayerReady = false;

    this.nagraPlayerInst = null;

    console.log('---------------------------------------------> destroy: ', this.nagraPlayerInst);

    this.nagra_drm_url = null;

    this._duration = 0;
    this.currentContentTime = 0;
    this.seek_resume = 0;
    this.src = null;
    //-----

    this._isPrepared = false;

    this.fireOnDurationChange = false;

    // Call to the parent...
    this.setPlayerBackground(null);

    this.previousPlayerState = PONCONNECT;
    this.currentPlayerState = PONCONNECT;

    return;
  }

  // For optimize pip playing, we dont destroy pip, we only change source
  destroyPip() {
    console.log('NAGRA PLAYER DESTROY PIP');
    if (!this._isPrepared) {
      return;
    }
    // Only hide pip
    if(!this.streamIsImage()) {
      this.hide();
    }
  }

  destroyPlayerContainer() {
    let vWrapper = document.getElementById(this.options.parentWrapper.id);

    if(this.options.isPip) {
      vWrapper.style.zIndex = '-1';
      vWrapper.style.display = 'none';
    }

    if (this._playerContainer) {
      if(this._playerHTMLTag && this._playerHTMLTag.parentNode) {
        this._playerHTMLTag.parentNode.removeChild(this._playerHTMLTag);
      }
      vWrapper.removeChild(this._playerContainer);
      this._playerContainer = null;
      this._playerHTMLTag = null;
    }

    this.audioTracks = [];
    this.currentAudioTrackIndex = null;
  }

  setPlayerFull() {
    this.setPlayerSize(0, 0, 1280, 720);
  }

  setPlayerSize(top, left, width, height) {
    console.log('NAGRAMP3> setting resize');
    if(this._playerContainer) {
      console.log('NAGRAMP3> setting resize 2');
      this._playerContainer.style.top = top + 'px';
      this._playerContainer.style.left = left + 'px';
      this._playerContainer.style.width = width + 'px';
      this._playerContainer.style.height = height + 'px';
      this._playerContainer.style.position = "relative";

      this._playerContainer.className = "nagraPlayerContainer"; // We dont use this css...at this moment
    }

    return this.setPlayerResolution(top, left, width, height);
  }

  setPlayerResolution(top, left, width, height) {
    return;
  }

  addEventsListeners() {
    console.log('[NAGRAPLAYER] add listeners');
    console.log(this.nagraPlayerInst);
    // Bind first
    this._toBindOnLoad = this._onLoad.bind(this);
    this._toBindOnWaiting = this._onWaiting.bind(this);
    //this._toBindOnTimeUpdate = this._onTimeUpdate.bind(this);
    this._toBindOnWaiting = this._onWaiting.bind(this);
    this._toBindOnPlaying = this._onPlaying.bind(this);
    this._toBindOnError = this._onError.bind(this);
    this._toBindOnFinished = this._onFinished.bind(this);
    this._toBindOnCanPlay = this._onCanPlay.bind(this);
    this._toBindOnStreamStarted = this._onStreamStarted.bind(this);
    this._toBindOnBuffering = this._onBuffering.bind(this);
    this._onVideoDetailsChanged = this._onVideoDetailsChanged.bind(this);
    this._toBindOnStreamAvailable = this._onStreamAvailable.bind(this);

    this._toBindOnStreamStopped = this._onStreamStopped.bind(this);


    //this._toBindOnDurationChange = this._onDurationChange.bind(this);

    /*
    HTML5 Listener
    // Add listeners
    this.nagraPlayerInst.addEventListener("loadedmetadata", this._toBindOnLoad);
    this.nagraPlayerInst.addEventListener("waiting", this._toBindOnWaiting);
    this.nagraPlayerInst.addEventListener("timeupdate", this._toBindOnTimeUpdate);
    this.nagraPlayerInst.addEventListener("seeking", this._toBindOnWaiting);
    this.nagraPlayerInst.addEventListener("seeked", this._toBindOnPlaying);
    this.nagraPlayerInst.addEventListener("playing", this._toBindOnPlaying);
    //YA this.nagraPlayerInst.addEventListener("error", this._toBindOnError);
    this.nagraPlayerInst.addEventListener("ended", this._toBindOnFinished);
    this.nagraPlayerInst.addEventListener("canplay", this._toBindOnCanPlay);
    this.nagraPlayerInst.addEventListener("durationchange", this._toBindOnDurationChange);
    */

    /*
    nagra associated events when play command is sended
        playOK
        playFailed
        onPlayError
        onPlayStarted
        onPlayStartFailed
    */
    if(this.nagraPlayerInst) {
      // ERROR events
      this.nagraPlayerInst.addEventListener("onPlayError", this._toBindOnError);
      this.nagraPlayerInst.addEventListener("onPlayStartFailed", this._toBindOnError);
      this.nagraPlayerInst.addEventListener("playFailed", this._toBindOnError);
      this.nagraPlayerInst.addEventListener("onStreamStarted", this._toBindOnStreamStarted);

      if(!this.streamIsAudio()) {
        this.nagraPlayerInst.addEventListener("onStreamError", this._toBindOnError);
        //this.nagraPlayerInst.addEventListener("onStreamStartFailed", this._toBindOnError);
        this.nagraPlayerInst.addEventListener("onStreamStopFailed", this._toBindOnError);
        this.nagraPlayerInst.addEventListener("onStreamAvailable", this._toBindOnStreamAvailable);
      }
      this.nagraPlayerInst.addEventListener("onPlayStopFailed", this._toBindOnError);
      this.nagraPlayerInst.addEventListener("onPositionChangeFailed", this._toBindOnError);
      this.nagraPlayerInst.addEventListener("stopFailed", this._toBindOnError);
      this.nagraPlayerInst.addEventListener("onPlayStartFailed", this._toBindOnError);

      this.nagraPlayerInst.addEventListener("onBuffering", this._toBindOnBuffering);


      this.nagraPlayerInst.addEventListener("onStreamStopped", this._toBindOnStreamStopped);


      // PLAY SUCCESS
      // NAGRA: onLoad method must be call only one time!
      this.nagraPlayerInst.addEventListener("playOK", this._toBindOnLoad);
      this.nagraPlayerInst.addEventListener("onPlayStarted", this._toBindOnCanPlay);

      // Content ends
      this.nagraPlayerInst.addEventListener("onEoc", this._toBindOnFinished);

      // this event is just por test, it is not fired to playerMiddleware
      this.nagraPlayerInst.addEventListener("onVideoDetailsChanged", this._onVideoDetailsChanged);
    }

    // Time Update
    //this.nagraPlayerInst.addEventListener("onPositionChanged", this._toBindOnTimeUpdate);

    /* NAGRA events available
		this.nagraPlayerInst.addEventListener("onStreamAvailable", onStreamAvailable);
		this.nagraPlayerInst.addEventListener("PlayerConnected", PlayerConnected);
		this.nagraPlayerInst.addEventListener("onPlayStopped", onPlayStopped);
		this.nagraPlayerInst.addEventListener("onBuffering", onBuffering);
		this.nagraPlayerInst.addEventListener("onBoc", onBoc);
		this.nagraPlayerInst.addEventListener("onEoc", onEoc);
		this.nagraPlayerInst.addEventListener("onSpeedChanged", onSpeedChanged);
		this.nagraPlayerInst.addEventListener("onSpeedChangeFailed", onSpeedChangeFailed);

		this.nagraPlayerInst.addEventListener("onStreamStopped", onStreamStopped);
		this.nagraPlayerInst.addEventListener("onLockerStatusUpdate", onLockerStatusUpdate);
		this.nagraPlayerInst.addEventListener("onLockerUnlock", onLockerUnlock);
		this.nagraPlayerInst.addEventListener(
			"onParentalRatingChanged",
			onParentalRatingChanged
		);
		this.nagraPlayerInst.addEventListener("onSignalLoss", onSignalLoss);
		this.nagraPlayerInst.addEventListener("onSignalGain", onSignalGain);
		this.nagraPlayerInst.addEventListener("onStreamEnabled", onStreamEnabled);
		this.nagraPlayerInst.addEventListener("onStreamDisabled", onStreamDisabled);

     */
  }

  removeEventsListener() {
    // Remove listeners
    /*
    this.nagraPlayerInst.removeEventListener("loadedmetadata", this._toBindOnLoad);
    this.nagraPlayerInst.removeEventListener("waiting", this._toBindOnWaiting);
    this.nagraPlayerInst.removeEventListener("timeupdate", this._toBindOnTimeUpdate);
    this.nagraPlayerInst.removeEventListener("seeking", this._toBindOnWaiting);
    this.nagraPlayerInst.removeEventListener("seeked", this._toBindOnPlaying);
    this.nagraPlayerInst.removeEventListener("playing", this._toBindOnPlaying);
    this.nagraPlayerInst.removeEventListener("error", this._toBindOnError);
    this.nagraPlayerInst.removeEventListener("ended", this._toBindOnFinished);
    this.nagraPlayerInst.removeEventListener("canplay", this._toBindOnCanPlay);
    this.nagraPlayerInst.removeEventListener("durationchange", this._toBindOnDurationChange);
    */
    if(this.nagraPlayerInst) {

      /*
      if(!this.streamIsAudio) {
        this.nagraPlayerInst.addEventListener("onStreamError", this._toBindOnError);
        this.nagraPlayerInst.addEventListener("onStreamStartFailed", this._toBindOnError);
        this.nagraPlayerInst.addEventListener("onStreamStarted", this._toBindOnStreamStarted);
        this.nagraPlayerInst.addEventListener("onStreamStopFailed", this._toBindOnError);
      }
      */
      this.nagraPlayerInst.removeEventListener("onPlayError", this._toBindOnError);
      this.nagraPlayerInst.removeEventListener("onPlayStartFailed", this._toBindOnError);
      this.nagraPlayerInst.removeEventListener("onStreamFailed", this._toBindOnError);

      if(!this.streamIsAudio()) {
        this.nagraPlayerInst.removeEventListener("onStreamError", this._toBindOnError);
        //this.nagraPlayerInst.removeEventListener("onStreamStartFailed", this._toBindOnError);
        this.nagraPlayerInst.removeEventListener("onStreamStopFailed", this._toBindOnError);
        this.nagraPlayerInst.removeEventListener("onStreamAvailable", this._toBindOnStreamAvailable);
      }
      this.nagraPlayerInst.removeEventListener("onPlayStopFailed", this._toBindOnError);
      this.nagraPlayerInst.removeEventListener("onPositionChangeFailed", this._toBindOnError);
      this.nagraPlayerInst.removeEventListener("stopFailed", this._toBindOnError);

      this.nagraPlayerInst.removeEventListener("playOK", this._toBindOnLoad);
      this.nagraPlayerInst.removeEventListener("onPlayStarted", this._toBindOnLoad);

      this.nagraPlayerInst.removeEventListener("onEoc", this._toBindOnFinished);

      this.nagraPlayerInst.removeEventListener("onBuffering", this._toBindOnBuffering);


      this.nagraPlayerInst.removeEventListener("onVideoDetailsChanged", this._onVideoDetailsChanged);
      this.nagraPlayerInst.removeEventListener("onStreamStopped", this._onStreamStopped);
    }

    //this.nagraPlayerInst.removeEventListener("onPositionChanged", this._toBindOnTimeUpdate);
  }

  /*
      this.nagraPlayerInst.addEventListener("stopFailed", this._toBindOnError);
   */
  _onError(e) {
    console.log('[NAGRAPLAYER] _onError');
    console.log(e);

    let msg = '?';
    let error_code = '?';
    let srcUri = '';

    // onPlayError
    if(e.contentErrorInfo) {
      if(e.contentErrorInfo.errorData) {
        error_code = e.contentErrorInfo.errorData;
      }
      if(e.contentErrorInfo.errorStr) {
        msg = e.contentErrorInfo.errorStr;
      }
      if(e.contentErrorInfo.reason) {
        msg += msg + ' - reason number: ' + e.contentErrorInfo.reason;
      }
      if(e.contentErrorInfo.sourceUri) {
        srcUri = 'sourceUri: ' + e.contentErrorInfo.sourceUri;
        msg += msg !== '' ? msg + ' - ' + srcUri : srcUri;
      }
    }

    // onPlayStartFailed
    if(e.contentStartFailedInfo) {
      if(e.contentStartFailedInfo.sourceUri) {
        srcUri = 'sourceUri: ' + e.contentStartFailedInfo.sourceUri;
      }

      if(e.contentStartFailedInfo.reason) {
        msg = this.getErrorReason(e.contentStartFailedInfo.reason);
      }

      msg += msg + ' - ' + srcUri;
    }

    // playFailed / stopFailed
    if(e.error) {
      if(e.error.message) {
        msg = e.error.message;
      }
    }

    // onStreamError
    if(e.streamErrorInfo) {
      if(e.streamErrorInfo.errorData) {
        error_code = e.streamErrorInfo.errorData;
      }
      if(e.streamErrorInfo.reason) {
        msg = this.getErrorReason(e.streamErrorInfo.reason);
      }
    }

    // onStreamStartFailedInfo
    if(e.streamStartFailedInfo) {
      if(e.streamStartFailedInfo.errorData) {
        error_code = e.streamStartFailedInfo.errorData;
      }
      if(e.streamStartFailedInfo.reason) {
        msg = this.getErrorReason(e.streamStartFailedInfo.reason);
      }
    }

    // onPlayStopFailed
    if(e.contentStopFailedInfo) {
      if(e.contentStopFailedInfo.reason) {
        msg = this.getErrorReason(e.contentStopFailedInfo.reason);
      }
      if(e.contentStopFailedInfo.sourceUri) {
        srcUri = 'sourceUri: ' + e.contentStopFailedInfo.sourceUri;
      }
      msg += msg + ' - ' + srcUri;
    }

    // onStreamStopFailed
    if(e.streamStopFailedInfo) {
      if(e.streamStopFailedInfo.reason) {
        msg = this.getErrorReason(e.streamStopFailedInfo.reason);
      }
    }

    // onStreamStopFailed
    if(e.positionChangeFailedInfo) {
      if(e.positionChangeFailedInfo.reason) {
        msg = this.getErrorReason(e.positionChangeFailedInfo.reason);
      }
      if(e.positionChangeFailedInfo.requestedPosition) {
        msg += msg + ' - requestedPosition: ' + e.positionChangeFailedInfo.requestedPosition;
      }
    }

    this.resetTimeUpdate();
    this._inError = true;
    console.log('[NAGRAPLAYER] _onError 2', this._inError);

    if(this.options.events.onError) {
      this.options.events.onError(msg, error_code);
    }
  }

  getCurrentTime() {

    return this.currentContentTime;
  }

  getDuration() {
    return this._duration;
  }

  setDuration(duration = null) {
    if(duration != null){
      this._duration = Math.floor(duration);
    } else{
      this._duration = Math.floor(this.nagraPlayerInst.duration) / 1000; // If it is live content, duration will be 0
    }
    console.log('[NAGRAPLAYER] content duration: ' + this._duration);
  }

  doVideoResume() {
    console.log('[NAGRAPLAYER] sending resume to: ' + (this.seek_resume * 1000));
    if (this.seek_resume <= 0) {
      return;
    }

    let positionCommandData = {
      whence: this.nagraPlayerInst.SEEK_SET,
        type: this.nagraPlayerInst.POSITION_TYPE_TIME_BASED,
        timePosition: this.seek_resume * 1000
    }

    this.nagraPlayerInst.addEventListener('OnPositionChanged', (e)  => {
      console.log('@@@@@@@@@@@ OnPositionChanged');
      console.log(JSON.stringify(e));
    });
    this.nagraPlayerInst.addEventListener('OnPositionChangedFailed', (e)  => {
      console.log('@@@@@@@@@@@ OnPositionChangedFailed');
      console.log(JSON.stringify(e));
    });

    console.log('[NAGRAPLAYER] sending resume to: ' + (this.seek_resume * 1000));
    let rpos = this.nagraPlayerInst.setPosition(positionCommandData);
    console.log(rpos);

    // Check on devices if we will require a delay here...
    this.seek_resume = 0;
  }

  /* MULTIPLE AUDIO*/

  setAudioTrack(codeTrack) {
    this.tracks.setAudioTrack(codeTrack, this.nagraPlayerInst);
  }

  getAudioIndexOfCode(codeTrack) {
    return this.tracks.getAudioTrackIndex(codeTrack);
  }

  getAvailableTracks(info) {
    console.log('[NAGRAPLAYER] getAvailableTracks ------------------------> ');
    this.tracks.getAvailableTracks(info, this.nagraPlayerInst.STREAM_TYPE_VIDEO, this.nagraPlayerInst.STREAM_TYPE_AUDIO, this.nagraPlayerInst.STREAM_TYPE_SUBTITLE);
    this._audioTracksLoaded = true;
    console.log('------------------------------> Nagra Player audioTracks: ', this.tracks.getAudioTracks());
    console.log('------------------------------> Nagra Player textTracks: ', this.tracks.getTextTracks());
  }

  async tryGetAudioTracks(currentTry) {

    if(!this._audioTracksLoaded) {
      console.log('[NAGRA AUDIOTRACK]> tryGetAudioTracks retry number: [' +  currentTry + '] - ABSTRACTPLAYER player audioTracks...');
      if(currentTry >= this.retryLimitAudioTrack || this._inError) {
        //throw new Error('Fail to get audioTracks');
        console.log('[NAGRA]> Error, player instance could not initialize', this._inError);
        return new Promise((reject) => {
          reject([]);
        });
      }

      // Wait for a while...
      await Utils.sleep(this.retryIntervalAudioTrack);

      // ...Continue recursive...
      return this.tryGetAudioTracks(++currentTry);
    }
    else {
      console.log('[ABSTRACTPLAYER AUDIOTRACK]> tryToGetAudioTracks retry number: [' +  currentTry + '] -  ABSTRACTPLAYER player audioTracks is READY');

      return this.getAudioTracks();
    }

  }

  getAudioTracks() {
    console.info("[NAGRA AUDIOTRACK]");
    if(!this._audioTracksLoaded) {
      console.info("[NAGRA AUDIOTRACK] Delay 1s to get the audio track info again");
      // ...Start recursive...
      return this.tryGetAudioTracks(1);
    }

    return new Promise((resolve) => {
      resolve(this.tracks.getAudioTracks());
    });
  }

  /* END MULTIPLE AUDIO */

  /* Events */

  _onStreamStopped(e) {
    console.log('onStreamStopped', e);
  }


  _onStreamAvailable(e) {
    console.log('[NAGRAPLAYER] _onStreamAvailable ------------------------> ', e);
    this.getAvailableTracks(e);
  }

  _onVideoDetailsChanged(e) {
    console.log('[NAGRAPLAYER] _onVideoDetailsChanged *******************************');
    console.log(e);
  }

  _onLoad(e) {
    // Please sure this method in NAGRA must be call once time!

    console.log('[NAGRAPLAYER] _onLoad');
    console.log(e);
    this._isOnLoaded = true;

    if(this.options.streamType === playerConstant.AUDIO || this.options.streamType === playerConstant.RADIO) {
      this.setDuration(this.options.duration);
      this.options.events.onDurationChange(e);
      this.fireOnDurationChange = !this.fireOnDurationChange; // only send event once
    }

    // TODO disabled for the moment...time update
    this.createTimeUpdate();

    if(this.options.events.onLoad) {
      this.options.events.onLoad(e);
    }
  }

  _onCanPlay(e) {
    console.log('[NAGRAPLAYER] _onCanPlay');
    console.log(e);
    console.log(this.nagraPlayerInst);


    if(this.options.events.onCanPlay) {
      this.options.events.onCanPlay(e);
    }
  }

  _onStreamStarted(e) {

    let itype =  null;
    if(e.streamStartedInfo && e.streamStartedInfo.type ===  this.nagraPlayerInst.STREAM_TYPE_VIDEO) {
      itype = 'STREAM_TYPE_VIDEO';
    }
    if(e.streamStartedInfo && e.streamStartedInfo.type ===  this.nagraPlayerInst.STREAM_TYPE_AUDIO) {
      itype = 'STREAM_TYPE_AUDIO';
    }
    if(e.streamStartedInfo && e.streamStartedInfo.type ===  this.nagraPlayerInst.STREAM_TYPE_SUBTITLE) {
      itype = 'STREAM_TYPE_SUBTITLE';
    }

    console.log('[NAGRAPLAYER] _onStreamStarted of type : ' + itype);
    console.log(e);

    // In video escape change of audio or text tracks
    if(this.streamIsVideo()) {
      // Content duration is available at this point...only send event when we have a content started of video, callback once
      // this callback is fired when we change audioTrack or subtitle too, so we dont need to send callbacks again
      if(e.streamStartedInfo && e.streamStartedInfo.type ===  this.nagraPlayerInst.STREAM_TYPE_VIDEO)
      {
        this.setDuration();

        // Fire on duration change ... and then calculate rolling credits time
        if(this.options.events.onDurationChange && !this.fireOnDurationChange) {
          this.options.events.onDurationChange(e);
          this.fireOnDurationChange = !this.fireOnDurationChange; // only send event once
        }
        this.createTimeUpdate();
      }
    }
    // Audio follows "normal path"
    else {
      this.setDuration();

        // Fire on duration change ... and then calculate rolling credits time
        if(this.options.events.onDurationChange && !this.fireOnDurationChange) {
          this.options.events.onDurationChange(e);
          this.fireOnDurationChange = !this.fireOnDurationChange; // only send event once
        }
        this.createTimeUpdate();
    }
  }

  _onWaiting(e) {
    console.log('[NAGRAPLAYER] _onWaiting');
    console.log(e);
    if(this.options.events.onWaiting) {
      this.options.events.onWaiting();
    }
  }

  _onTimeUpdate(currentTime) {
    //console.log('[NAGRAPLAYER] _onTimeUpdate');
    //console.log(currentTime);
    //this.currentContentTime = e.positionChangedInfo.newPosition;
    if(this.options.events.onTimeUpdate) {
      this.options.events.onTimeUpdate(currentTime);
    }
  }

  _onPlaying(e) {
    console.log('[NAGRAPLAYER] _onPlaying');
    console.log(e);
    if(this.options.events.onPlaying) {
      this.options.events.onPlaying();
    }
  }

  _onBuffering(e) {

    let percentBuf = e.bufferingInfo.percentBuffered;

    console.log('[NAGRAPLAYER] _onBuffering');
    console.log(JSON.stringify(e));
    console.log('==================> ' + percentBuf);

    if(percentBuf === 0) {
      this.onPlayerStateBuffer();
      if(this.options.events.onBufferingStart) {
        console.log('Dispatch onBufferingStart ==================> ');
        this.options.events.onBufferingStart(e);
      }
    }

    if(percentBuf === 100) {

      // Prevents nagra to resume when finish buffering
      if(this.getCurrentPlayerState() === PONPAUSE && this.currentContentTimeOnPause !== null) {
        this.nagraPlayerInst.stop();
      }

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
        console.log('Dispatch onBufferingFinish ==================> ');
        this.options.events.onBufferingFinish(e);
      }
    }
  }

  _onFinished(e) {
    // Do destroy to reinit player next play
    this.destroy();

    console.log('[NAGRAPLAYER] _onFinished');
    console.log(e);
    if(this.options.events.onFinished) {
      this.options.events.onFinished(e);
    }
  }

  _onDurationChange(e) {

    console.log('[NAGRAPLAYER] _onDurationChange');
    console.log(e);

    console.log('[PLAYR EVENT] _onDurationChange');
    if(this.options.events.onDurationChange) {
      this.options.events.onDurationChange();
    }
  }

  getErrorReason(reason_code) {

    let reason = 'Unknow reason';
    switch(reason_code)
    {
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_BAD_LOCATION:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_LOCATION';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_BAD_PARAM:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_PARAM';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_BAD_PARTITION:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_PARTITION';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_BAD_URI:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_URI';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_BLACKED_OUT:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_BLACKED_OUT';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_COPY_PROTECTED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_COPY_PROTECTED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DIALOG_REQUIRED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DIALOG_REQUIRED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_OTHER:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_OTHER';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_PAIRING_REQUIRED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_PAIRING_REQUIRED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CA_NO_VALID_SECURE_DEVICE:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_NO_VALID_SECURE_DEVICE';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_CONFLICT:
        reason = 'CONTENT_PLAY_FAILED_REASON_CONFLICT';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_DUPLICATE_URI:
        reason = 'CONTENT_PLAY_FAILED_REASON_DUPLICATE_URI';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_GENERIC:
        reason = 'CONTENT_PLAY_FAILED_REASON_GENERIC';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_INTERNAL_ERROR:
        reason = 'CONTENT_PLAY_FAILED_REASON_INTERNAL_ERROR';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE:
        reason = 'CONTENT_PLAY_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_LACK_OF_RESOURCES:
        reason = 'CONTENT_PLAY_FAILED_REASON_LACK_OF_RESOURCES';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_NOT_SUPPORTED:
        reason = 'CONTENT_PLAY_FAILED_REASON_NOT_SUPPORTED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_NO_LNB:
        reason = 'CONTENT_PLAY_FAILED_REASON_NO_LNB';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_NO_LOCK:
        reason = 'CONTENT_PLAY_FAILED_REASON_NO_LOCK';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_OUT_OF_MEMORY:
        reason = 'CONTENT_PLAY_FAILED_REASON_OUT_OF_MEMORY';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_OVERRIDDEN_BY_NEW_REQUEST:
        reason = 'CONTENT_PLAY_FAILED_REASON_OVERRIDDEN_BY_NEW_REQUEST';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_PERMISSION_DENIED:
        reason = 'CONTENT_PLAY_FAILED_REASON_PERMISSION_DENIED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_PLAYER_BUSY:
        reason = 'CONTENT_PLAY_FAILED_REASON_PLAYER_BUSY';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_PMT_UPDATED:
        reason = 'CONTENT_PLAY_FAILED_REASON_PMT_UPDATED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_REQUESTED:
        reason = 'CONTENT_PLAY_FAILED_REASON_REQUESTED';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_RESOURCE_LOST:
        reason = 'CONTENT_PLAY_FAILED_REASON_RESOURCE_LOST';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_BAD_LOCATION:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_LOCATION';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_RESOURCE_TRANSITION:
        reason = 'CONTENT_PLAY_FAILED_REASON_RESOURCE_TRANSITION';
        break;
      case this.nagraPlayerInst.CONTENT_PLAY_FAILED_REASON_TUNER_ERROR:
        reason = 'CONTENT_PLAY_FAILED_REASON_TUNER_ERROR';
        break;

      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_BLACKED_OUT:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_BLACKED_OUT';
      break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_DENIED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DENIED';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_DENIED_COPY_PROTECTED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DENIED_COPY_PROTECTED';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_DIALOG_REQUIRED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DIALOG_REQUIRED';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_OTHER:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_OTHER';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_ACCESS_PAIRING_REQUIRED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_PAIRING_REQUIRED';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_CA_NO_VALID_SECURE_DEVICE:
        reason = 'STREAM_ERROR_REASON_CA_NO_VALID_SECURE_DEVICE';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_DISK_ERROR:
        reason = 'STREAM_ERROR_REASON_DISK_ERROR';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_DISK_REMOVED:
        reason = 'STREAM_ERROR_REASON_DISK_REMOVED';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_GENERIC:
        reason = 'STREAM_ERROR_REASON_GENERIC';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_INVALID_PLAY_SESSION_HANDLE:
        reason = 'STREAM_ERROR_REASON_INVALID_PLAY_SESSION_HANDLE';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_OVERRIDDEN_BY_NEW_REQUEST:
        reason = 'STREAM_ERROR_REASON_OVERRIDDEN_BY_NEW_REQUEST';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_RESOURCES_LOST:
        reason = 'STREAM_ERROR_REASON_RESOURCES_LOST';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_SIGNAL_LOSS:
        reason = 'STREAM_ERROR_REASON_SIGNAL_LOSS';
        break;
      case this.nagraPlayerInst.STREAM_ERROR_REASON_STREAM_LIST_CHANGED:
        reason = 'STREAM_ERROR_REASON_STREAM_LIST_CHANGED';
        break;
      case this.nagraPlayerInst.CONTENT_STOP_FAILED_REASON_ALREADY_STOPPED:
        reason = 'CONTENT_STOP_FAILED_REASON_ALREADY_STOPPED';
        break;
      case this.nagraPlayerInst.CONTENT_STOP_FAILED_REASON_GENERIC:
        reason = 'CONTENT_STOP_FAILED_REASON_GENERIC';
        break;
      case this.nagraPlayerInst.CONTENT_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE:
        reason = 'CONTENT_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE';
        break;
      case this.nagraPlayerInst.CONTENT_STOP_FAILED_REASON_PERMISSION_DENIED:
        reason = 'CONTENT_STOP_FAILED_REASON_PERMISSION_DENIED';
        break;
      case this.nagraPlayerInst.STREAM_STOP_FAILED_REASON_ALREADY_STOPPED:
        reason = 'STREAM_STOP_FAILED_REASON_ALREADY_STOPPED';
        break;
      case this.nagraPlayerInst.STREAM_STOP_FAILED_REASON_BAD_PARAM:
        reason = 'STREAM_STOP_FAILED_REASON_BAD_PARAM';
        break;
      case this.nagraPlayerInst.STREAM_STOP_FAILED_REASON_BAD_REQUEST:
        reason = 'STREAM_STOP_FAILED_REASON_BAD_REQUEST';
        break;
      case this.nagraPlayerInst.STREAM_STOP_FAILED_REASON_BUSY:
        reason = 'STREAM_STOP_FAILED_REASON_BUSY';
        break;
      case this.nagraPlayerInst.STREAM_STOP_FAILED_REASON_INACTIVE:
        reason = 'STREAM_STOP_FAILED_REASON_INACTIVE';
        break;
      case this.nagraPlayerInst.STREAM_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE:
        reason = 'STREAM_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE';
        break;
      case this.nagraPlayerInst.STREAM_STOP_FAILED_REASON_PERMISSION_DENIED:
        reason = 'STREAM_STOP_FAILED_REASON_PERMISSION_DENIED';
        break;


      default:
      break;

      }
      console.log('player instance reason error: ' + reason);

    return reason;
  }

  /* END Events */
}

export default NagraPlayer;
