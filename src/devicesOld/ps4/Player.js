import AbstractHTML5Player from '../all/AbstractHTML5Player';
import Utils from "../../utils/Utils";
import settings from "../all/settings";

import { PONCONNECT, PONSTOP, PONPLAY, PONPAUSE, PONSKIP, PONSPEED, PONBUFFER } from '../../devices/all/settings';
import { SS, SS_MA, AUDIO, PLAYERIMAGE, HLS, HLSPRM, RADIO, HLS_KR } from '../../utils/playerConstants';
import { onRenderError } from '../../utils/playerConstants';

import PlaystationWebmaf from './PlaystationWebmaf';

class Ps4Player extends AbstractHTML5Player {
  constructor() {
    super();
    this.options = {};

    this.bitrate = 0;
    this.bandwidth = 0;
    this.currentTime = 0;
    this.onLoaded = false;
    this.screenWidth = 0;
    this.screenHeight = 0;
    this.timeInterval = null;
    this.timeIntervalBitrate = null;
    this.styleBackup = null

    this.retryIntervalFirstPlaying = 0.7;
    this.retryLimitFirstPlaying = 50;
    this.currentAudioTrackId = null;

    this.setBitrate = this.setBitrate.bind(this);
    this.getBitrate = this.getBitrate.bind(this);
    this.setScreenResolution = this.setScreenResolution.bind(this);
    this.getScreenResolution = this.getScreenResolution.bind(this);

    // Eventos
    this.onStatusChange = this.onStatusChange.bind(this); // No pasa directo, se filtran eventos
    this._onLoad = this._onLoad.bind(this); // Pasa directo al evento/callback
    this._onTimeUpdate = this._onTimeUpdate.bind(this); // Pasa directo
    this._onError = this._onError.bind(this);
    this.onApplicationStatusChange = this.onApplicationStatusChange.bind(this);
    this._onBitrateChange = this._onBitrateChange.bind(this);
    this.setFixVideoRepresentations = this.setFixVideoRepresentations.bind(this);
    this.setVideoStartingBandwidth = this.setVideoStartingBandwidth.bind(this);
    // Ventana seekable
    this.seekWindow = null;
  }

  setBitrate(data) {
    console.info('[PS4 PLAYER] PSPlayer callback getBitrate');
    if (data) {
      console.info('[PS4 PLAYER] PSPlayer callback getBitrate> ', data);
      this.bitrate = data.bitrate;
      this.bandwidth = data.bandwidth;
      this._onBitrateChange(data.bitrate, data.bandwidth);
    }
  }

  getScreenResolution() {
    PlaystationWebmaf.sendCommand("getScreenResolution", null, (data) => {
      this.setScreenResolution(data);
    }, true);
  }

  setScreenResolution(data) {
    if (data && data.width && data.height) {
      this.screenWidth = data.width;
      this.screenHeight = data.height;
    }
  }

  getBitrate() {
    PlaystationWebmaf.sendCommand("getBitrate", null, (data) => {
      this.setBitrate(data);
    }, true);
  }

  createMedia(options) {
    if (options.isPip)
      return;
    if (this._isPrepared)
      return;
    if (this.streamIsImage()) {
      return;
    }
    if (!options.src) {
      return;
    }

    console.info('[PS4 PLAYER] enter createMedia');

    this.options = options;
    //No hay pip en ps4
    this.prependPip = '_full';
    // Para el background
    this._playerContainer = document.createElement("div");
    this._playerContainer.style.position = "absolute";
    this._playerContainer.id = 'Html5PlayerContainer' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";
    this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);
    if (!this.streamIsAudio())
      this._playerContainer.className += ' ps4FullContainer';

    if (!options.parentWrapper) {
      throw new Error('PS4 player parentWrapper not found...');
    }

    let vWrapper = document.getElementById(this.options.parentWrapper.id);
    vWrapper.classList.remove("background-clear");
    vWrapper.className += ' background-clear';
    vWrapper.appendChild(this._playerContainer); // Opposite to orsay

    this.getBitrate();
    this.getScreenResolution();
    this._isPrepared = true;
  }

  loadMedia() {
    if (this.options.isPip)
      return;
    if (!this._isPrepared)
      return;
    if (this.streamIsImage())
      return;

    if (!this.options.src) {
      this.destroy();
      return;
    }

    console.info('[PS4 PLAYER] enter loadMedia', this.options);

    if(this.options.resume && !this.options.isLive) {
      console.info('[PS4 PLAYER] enter loadMedia, VOD con SEEK');
      this.seek_resume = this.options.resume;
    }

    this.src = this.options.src;

    this.setPlayerFull();
    this.addEventsListeners();
    this.setFixVideoRepresentations(1,50000000);
    this.setVideoStartingBandwidth(50000000);
  }


  setFixVideoRepresentations(minBitrate, maxBitrate){
    console.log('[PS4 PLAYER] setFixVideoRepresentations minBitrate:'+minBitrate+', maxBitrate:'+maxBitrate);
    const configBitrate = {
      minBitrate: minBitrate,
      maxBitrate: maxBitrate,
    }
    PlaystationWebmaf.sendCommand("setFixVideoRepresentations", configBitrate );
    console.log('[PS4 PLAYER] setFixVideoRepresentations configBitrate',configBitrate)
  }

  setVideoStartingBandwidth(bandwidth){
    console.log('[PS4 PLAYER] setVideoStartingBandwidth bandwidth:'+bandwidth);
    const configBandwidth = {
      bandwidth: bandwidth,
    };
    PlaystationWebmaf.sendCommand("setVideoStartingBandwidth", configBandwidth );
    console.log('[PS4 PLAYER] setVideoStartingBandwidth configBandwidth',configBandwidth);
  }

  /*
  setWindowSize: function(obj) {
            var height = getResolution().height / 2;
            var width = getResolution().width / 2;

            if(!util.isUndefined(obj.fromEndCtrl) && obj.fromEndCtrl == true)
            {
                height = 720/2;
                width = 1280/2;
            }

            var ltx = obj.left / width - 1, // 68 / 960 -1
                lty = -(obj.top / height - 1), // 102 / 540 -1
                rbx = (obj.left + obj.width) / width - 1,
                rby = -((obj.top + obj.height) / height - 1);
            webmaf.command("setVideoPortalSize", {
                ltx: ltx,
                lty: lty,
                rbx: rbx,
                rby: rby
            });

            this._currentWindowSize = obj;

            return;
        },

         * Sets video window size as full screen
         * @method



        setFullscreen: function() {
          this.setWindowSize({
              top: 0,
              left: 0,
              height: getResolution().height,
              width: getResolution().width
          });
      },
  */
  setPlayerFull() {
    let full = {
      ltx: -1.0,
      lty: 1.0,
      rbx: 1.0,
      rby: -1.0
    };
    PlaystationWebmaf.sendCommand("setVideoPortalSize", full);
  }

  setPlayerSize(top, left, nwidth, nheight) {

    if (this._playerContainer) {
      this._playerContainer.style.top = top + 'px';
      this._playerContainer.style.left = left + 'px';
      this._playerContainer.style.width = nwidth + 'px';
      this._playerContainer.style.height = nheight + 'px';
      this._playerContainer.style.position = "relative";
    }


    let height = 720/2;
    let width = 1280/2;

    let ltx = left / width - 1, // 68 / 960 -1
      lty = -(top / height - 1), // 102 / 540 -1
      rbx = (left + nwidth) / width - 1,
      rby = -((top + nheight) / height - 1);

    PlaystationWebmaf.sendCommand("setVideoPortalSize", {
      ltx: ltx,
      lty: lty,
      rbx: rbx,
      rby: rby
    });

    return;
  }

  addEventsListeners() {
    console.info('[PS4 PLAYER] enter addEventsListeners');
    PlaystationWebmaf.addEventListener("playerStatusChange", this.onStatusChange);
    PlaystationWebmaf.addEventListener("contentAvailable", this._onLoad);
    PlaystationWebmaf.addEventListener("getPlaybackTime", this._onTimeUpdate);
    PlaystationWebmaf.addEventListener("playerStreamingError", this._onError);
    PlaystationWebmaf.addEventListener("applicationStatusChange", this.onApplicationStatusChange);
  }

  removeEventsListener() {
    console.info('[PS4 PLAYER] enter removeEventsListener');
    PlaystationWebmaf.removeEventListener("playerStatusChange", this.onStatusChange);
    PlaystationWebmaf.removeEventListener("contentAvailable", this._onLoad);
    PlaystationWebmaf.removeEventListener("getPlaybackTime", this._onTimeUpdate);
    PlaystationWebmaf.removeEventListener("playerStreamingError", this._onError);
    PlaystationWebmaf.removeEventListener("applicationStatusChange", this.onApplicationStatusChange);
  }

  // Based on currentTime
  async tryOnFirstTimeshiftSeek(currentTry, timeshiftData) {
    console.info('[PS4 TSH] enter tryOnFirstTimeshiftSeek');
    if(this.seekWindow === null) {
      console.log('[PS4 TSH] tryOnFirstTimeshiftSeek retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitFirstPlaying) {
        throw new Error('Fail to get playing state');
        console.log('[PS4 PLAYER]> Error, Fail to get playing state');
        return;
      }
      await Utils.sleep(this.retryIntervalFirstPlaying);

      return this.tryOnFirstTimeshiftSeek(++currentTry, timeshiftData);
    }
    else {
      return this.seekTimeshift(timeshiftData, false);
    }
  }

  destroy() {
    console.info('[PS4 PLAYER] enter destroy');
    if (this.options.isPip)
      return;
    if (!this._isPrepared)
      return;
    if (this.streamIsImage())
      return;

    console.info('[PS4 PLAYER] enter destroy 2');
    this.seek_resume = 0;
    this.currentTime = 0;
    this.onLoaded = false;
    this._isPrepared = false;
    this.removeEventsListener();
    this.enableTimeInterval(false);

    if (this._playerContainer) {
      if (!this.streamIsAudio()) {
        this._playerContainer.className = this._playerContainer.className.replace('ps4FullContainer', ' ');
      }
      this._playerContainer.innerHTML = '';
      if (this._playerContainer.parentNode) {
        this._playerContainer.parentNode.removeChild(this._playerContainer);
      }
      this._playerContainer = null;
    }
    this.stop();
    this.restoreBackground();
    this.seekWindow = null;
  }

  removeBackgroundAndStyle() {
    console.log('[PS4 PLAYER] enter removeBackgroundAndStyle');
    this.setPlayerBackground(null);
    let root = document.getElementById("root");
    if (this.styleBackup === null) {
      this.styleBackup = {
        background: root.style.background,
        backgroundColor: root.style.backgroundColor,
        backgroundImage: root.style.backgroundImage
      };
    }
    root.style.background = "transparent";
    root.style.backgroundColor = "transparent";
    root.style.backgroundImage = "none";
  }

  restoreBackground() {
    console.log('[PS4 PLAYER] enter restoreBackground');
    if (this.styleBackup !== null) {
      let root = document.getElementById("root");
      root.style.background = this.styleBackup.background;
      root.style.backgroundColor = this.styleBackup.backgroundColor;
      root.style.backgroundImage = this.styleBackup.backgroundImage;
    }
  }

  replaceMediaSource(newSource) {
    console.info('[PS4 PLAYER] enter replaceMediaSource');
    if (this.options.isPip)
      return;
    if (!this._isPrepared)
      return;
    if (this.streamIsImage())
      return;

    this.stop();

    if(newSource.backgroundImage && !this.streamIsAudio()) {
      this.options.backgroundImage = newSource.backgroundImage;
      this.setPlayerBackground(newSource.backgroundImage);
    }

    this.options.newSource = newSource; // Add the attr to detect error when replace and not reset whole player
    this.options.src = this.src = newSource.src;
    this.options.drmInfo = newSource.drmInfo;
    this.options.isLive = newSource.isLive;
    this.options.streamType = newSource.streamType;

    this.seek_resume = 0;
    this.onLoaded = false;
    this._duration = 0;
    this.currentTime = 0;
    this.seekWindow = null;

    if (newSource.resume && !newSource.isLive) {
      this.seek_resume = newSource.resume;
      this.options.resume = newSource.resume;
    }

    this.audioTracks = [];
    // Current audiotrack: ori, eng, spa, etc.
    this.currentAudioTrackId = null;

    this.setPlayerFull();
    this.hide();
    console.log('[PS4 PLAYER] player replace sending to play...');
  }

  hide() {
    console.info('[PS4 PLAYER] enter hide');
    if (this._playerContainer) {
      this._playerContainer.style.visibility = 'hidden';
    }
  }

  show() {
    console.info('[PS4 PLAYER] enter show');
    if (this._playerContainer && !this.streamIsAudio()) {
      this._playerContainer.style.visibility = 'visible';
    }
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
  seekTimeshift(timeshiftData, firstSeek) {
    console.info('[PS4 PLAYER] seekTimeshift ', timeshiftData, firstSeek);
    if(firstSeek) {
      this.tryOnFirstTimeshiftSeek(1, timeshiftData);
    }
    else {
      // Calcula el seek
      /*
      endTime: 21537516
      seekable: true
      startTime: 0
      status: "ok"
      */
      let seekTime = 0;
      if (this.seekWindow && this.seekWindow.status && this.seekWindow.status === "ok" && this.seekWindow.seekable === true) {
        seekTime = (this.seekWindow.endTime / 1000) - timeshiftData.seektime;
        if (seekTime < 1) {
          seekTime = 8; // 8 seconds, protect player
        }
        seekTime = Math.ceil(seekTime);
        if (seekTime >= Math.floor(this.seekWindow.endTime / 1000)) {
          seekTime = Math.floor(this.seekWindow.endTime / 1000) - 1; // protect player
        }
      }
      console.info('[PS4 PLAYER] intentando seek en seekTimeshift ', seekTime);
      if (seekTime > 0) {
        console.info('[PS4 PLAYER] enviando seek en seekTimeshift ', seekTime);
        this.seek(seekTime);
      }
      else {
        console.info('[PS4 PLAYER] ERROR intentando seek en timeshift <timeshiftData, this.seekWindow> => ', timeshiftData, this.seekWindow);
      }
    }
  }

  seek(seconds) {
    console.log('[PS4 PLAYER] seek de: ' + seconds);
    this.skip(seconds);
  }

  skip(seconds) {
    console.info('[PS4 TSH] enter skip');
    if (seconds === 0) {
      seconds = 1;
    }
    PlaystationWebmaf.sendCommand("setPlayTime", {
      playTime: seconds
    });
  }

  play() {
    console.info("[PS4 PLAYER] Enter play");
    this.show();
    if (!this.onLoaded) {
      let playingCommand = {
        contentUri: this.src
      };
      if (this.options.streamType === SS || this.options.streamType === SS_MA) {
        let server_url = this.options.drmInfo.server_url;
        let challenge = (this.options.drmInfo && this.options.drmInfo.challenge) || '';
        let content_id = (this.options.drmInfo && this.options.drmInfo.content_id) || '';
        let device_id = this.options.drmInfo.device_id || '';
        let customData = '';
        if (challenge && challenge.indexOf('tokenID') !== -1) {
          customData = challenge;
        }
        else {
          if (challenge) {
            customData = btoa('{"customdata":' + challenge + ',"device_id": "' + device_id + '"}');
          }
        }
        if (server_url) {
          playingCommand.licenseUri = server_url;
        }
        if (customData !== '') {
          playingCommand.customData = customData;
        }
      }

      /*
      if(this.streamIsVideo) {
        PlaystationWebmaf.sendCommand("setFixVideoRepresentations", {"minBitrate" : 1200000, "maxBitrate" : 3300000});
      }
      */
      PlaystationWebmaf.sendCommand("load", playingCommand);
      this.onPlayerStateConnect();
      console.info("[PS4 PLAYER] Sending play with options> ", playingCommand);
    }
    this.enableTimeInterval(true);
    PlaystationWebmaf.sendCommand("play");
  }

  enableTimeInterval(enable) {
    console.info('[PS4 PLAYER] enter enableTimeInterval', enable);
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
    if(this.timeIntervalBitrate){
      clearInterval(this.timeIntervalBitrate);
      this.timeIntervalBitrate = null;
    }

    if (enable) {
      this.timeInterval = setInterval(() => {
        PlaystationWebmaf.sendCommand("getPlaybackTime");
      }, 700);
      

      this.timeIntervalBitrate = setInterval(()=>{
        this.getBitrate();
      }, 1000); 
    }
  }

  resume() {
    console.log('[PS4 PLAYER] resume');
    this.enableTimeInterval(true);
    PlaystationWebmaf.sendCommand("play");
    this.onPlayerStatePlay();
  }

  pause() {
    console.log('[PS4 PLAYER] pause');
    this.onPlayerStatePause();
    this.enableTimeInterval(false);
    PlaystationWebmaf.sendCommand("pause");
  }

  stop() {
    console.log('[PS4 PLAYER] enter stop');
    this.onPlayerStateStop();
    this.enableTimeInterval(false);
    PlaystationWebmaf.sendCommand("stop");
  }

  getDuration() {
    console.log('[PS4 PLAYER] Enter getDuration', this._duration);
    return this._duration;
  }

  setDuration(duration) {
    this._duration = duration;
  }

  onStatusChange(data) {
    let nextPlayerStatus = data.playerState;
    console.info("[PS4 PLAYER] receive the status change> ", nextPlayerStatus);
    switch (nextPlayerStatus.toLowerCase()) {
      case "buffering":
        this._onBufferingStart();
        this._onBufferingProgress();
        break;
      case "endofstream":
        this._onFinished();
        break;
      case "notready":
        break;
      case "opening":
        if (this.getCurrentPlayerState() === PONSTOP) {
          this.onPlayerStateConnect();
          this._onWaiting();
        }
        break;
      case "paused":
        break;
      case "playing":
        if (this.getCurrentPlayerState() === PONBUFFER) {
          this._onBufferingFinish();
        }
        this._onPlaying();
        if (this.seek_resume > 0) {
          console.log('[PS4 TSH] haciendo seek de ', this.seek_resume);
          this.seek(this.seek_resume);
          this.seek_resume = 0;
        }
        break;
      case "stopped":
        break;
      case "unknown":
        break;
    }
    console.log("[PS4 PLAYER] update the state>" + nextPlayerStatus);
  }

  /* Events */
  onApplicationStatusChange(resp) {
    if (resp) {
      if (resp.applicationStatus && resp.applicationStatus === 'background') {
        if (this.this.getCurrentPlayerState() !== PONSTOP && this.this.getCurrentPlayerState() !== PONPAUSE) {
          this.pause();
        }
      }
      else if (resp.applicationStatus && resp.applicationStatus === 'foreground') {
        if (this.this.getCurrentPlayerState() === PONPAUSE) {
          this.play();
        }
      }
    }
  }

  _onLoad(data) {
    if (this.onLoaded === true) {
      console.log('[PS4 PLAYER] _onLoad, pero onLoaded ya es true, data> ', data);
      return;
    }

    console.log('[PS4 PLAYER] _onLoad, data> ', data);
    this.removeBackgroundAndStyle();
    this.onLoaded = true;
    if (this.options.events.onLoad) {
      this.options.events.onLoad();
    }
    this.setDuration(data.totalLength);
    this._onCanPlay();
    this._onDurationChange();

    if(this.seek_resume > 0) {
      this.seek(this.seek_resume);
      this.seek_resume = 0;
    }

    this._onBufferingStart();
    this._onBufferingProgress();

    // For debug, get valid seek range in live
    if (this.options.isLive) {
      PlaystationWebmaf.sendCommand("getSeekWindow", {}, (data) => {
        this.seekWindow = data;
        console.info("[PS4 PLAYER] getSeekWindow callback> ", data);
      }, true);
    }
  }

  _onWaiting() {
    console.log('[PS4 PLAYER] _onWaiting');
    if (this.options.events.onWaiting) {
      this.options.events.onWaiting();
    }
  }

  setCurrentTime(time) {
    this.currentTime = time;
  }

  getCurrentTime() {
    return Math.floor(this.currentTime);
  }

  _onTimeUpdate(data) {
    let currTime = data.elapsedTime;
    this.setCurrentTime(currTime);

    console.log('[PS4 PLAYER] onTimeUpdate', currTime, Math.floor(currTime));

    if (this.options.events.onTimeUpdate) {
      this.options.events.onTimeUpdate(Math.floor(currTime));
    }
  }

  _onBitrateChange(bitrate, bandwidth){
    console.log('[PS4 PLAYER] _onBitrateChange',bitrate, bandwidth);
    if (this.options.events.onBitrateChange) {
      console.log('[PS4 PLAYER] this.options.events.onBitrateChange')
      this.options.events.onBitrateChange(bitrate, bandwidth);
    }
  }

  _onPlaying() {
    console.log('[PS4 PLAYER] _onPlaying');
    this.onPlayerStatePlay();
    if (this.options.events.onPlaying) {
      this.options.events.onPlaying();
    }
  }

  _onError(err) {
    console.log('[PS4 PLAYER] _onError', err);
    if (this.getCurrentPlayerState() === PONSTOP) {
      return;
    }
    this.enableTimeInterval(false);
    let errMsg = 'No description';
    if (err.error && err.status_code) {
      errMsg = err.error + ", error Code> " + err.status_code
      console.error("[PS4 PLAYER ERR] " + errMsg);
    }
    else if(err.status) {
      errMsg = "Error with status " + err.status;
      console.error("[PS4 PLAYER ERR] onRenderError: with status " + err.status);
    }
    if (this.options.events.onError) {
      this.options.events.onError(errMsg, onRenderError);
    }
  }

  _onFinished() {
    console.log('[PS4 PLAYER] _onFinished');

    if (this.streamIsVideo() && this.options.isLive === true) {
      return;
    }

    this.stop();
    this.onPlayerStateStop();
    if (this.options.events.onFinished) {
      this.options.events.onFinished();
    }
    // Reinit player
    this.destroy();
  }

  _onCanPlay() {
    console.log('[PS4 PLAYER] _onCanPlay> ');
    if (this.options.events.onCanPlay) {
      this.options.events.onCanPlay();
    }
  }

  _onDurationChange() {
    console.log('[PS4 PLAYER] _onDurationChange');
    if (this.options.events.onDurationChange) {
      this.options.events.onDurationChange();
    }
  }

  _onBufferingStart() {
    this.onPlayerStateBuffer();
    if (this.options.events.onBufferingStart) {
      this.options.events.onBufferingStart();
    }
  }

  _onBufferingProgress() {
    console.log('[PS4 PLAYER] enter _onBufferingProgress');
    if (this.options.events.onBufferingProgress) {
      this.options.events.onBufferingProgress();
    }
  }

  _onBufferingFinish() {
    console.log('[PS4 PLAYER] enter _onBufferingFinish');
    if (this.options.events.onBufferingFinish) {
      this.options.events.onBufferingFinish();
    }

    // If stop and ends buffering, nothing to do
    if (this.getCurrentPlayerState() === PONSTOP) {
      return;
    }

    // If current state is on connecting, then we go to play
    if (this.getCurrentPlayerState() === PONCONNECT) {
      this.onPlayerStatePlay();
    }
    else {
      // Set same state as last
      this.setCurrentPlayerState(this.previousPlayerState);
    }

    if (this.options.events.onBufferingFinish) {
      this.options.events.onBufferingFinish();
    }
  }

  /* END Events */

  /* MULTIPLE AUDIOTRACKS */
  async tryGetAudioTracks(currentTry) {
    if (!this.onLoaded) {
      console.log('[PS4 PLAYER]> tryGetAudioTracks retry number: [' + currentTry + '] - PS4 player audioTracks...');
      if (currentTry >= this.retryLimitAudioTrack) {
        throw new Error('Fail to get audioTracks');
        console.log('[PS4 PLAYER]> Error, player instance could not initialize');
        return;
      }
      // Wait for a while...
      await Utils.sleep(this.retryIntervalAudioTrack);
      // ...Continue recursive...
      return this.tryGetAudioTracks(++currentTry);
    }
    else {
      console.log('[PS4 PLAYER]> tryToGetAudioTracks retry number: [' + currentTry + '] -  PS4 player audioTracks is READY');
      return this.getAudioTracks();
    }
  }

  getAudioTracks() {
    console.info("[PS4 PLAYER] enter getAudioTracks");
    if (!this.onLoaded) {
      console.info("[PS4 PLAYER] not yet");
      return this.tryGetAudioTracks(1);
    }

    return new Promise((resolve, reject) => {
      let i;
      let audioTracksArr = [];
      let audioTracksObjsArr = [];
      PlaystationWebmaf.sendCommand("getAudioTracks", {}, (data) => {
        console.info("[PS4 PLAYER] Audio Tracks> ", data);
        if (data.audioTracks) {
          audioTracksArr = data.audioTracks.split(",");
          for (i = 0; i < audioTracksArr.length; i++) {
            audioTracksObjsArr.push(audioTracksArr[i]);
            console.info("[PS4 PLAYER] One audio track is " + audioTracksArr[i]);
          }
          if (data.currentAudioTrack) {
            this.currentAudioTrackId = data.currentAudioTrack;
          }
        }
        this.audioTracks = audioTracksObjsArr;
        resolve(audioTracksObjsArr);
      }, true);
    });
  }

  /*
  Importante:
  restart VOD => false, Live: true
  */
  setAudioTrack(codeTrack) {
    console.debug('[PS4 PLAYER] enter setAudioTrack,', codeTrack);
    if (!this.onLoaded) {
      console.error('[PS4 PLAYER] enter setAudioTrack, but ERROR!');
    }

    if (this.currentAudioTrackId === codeTrack) {
      console.info('[PS4 PLAYER] Same audioTrack, nothing to do');
      return Promise.resolve(true);
    }

    console.info("[PS4 PLAYER] Set audioTrack to: " + codeTrack);
    PlaystationWebmaf.sendCommand("setAudioTrack", {
      audioTrack: codeTrack,
      restart: this.options.isLive ? true : false
    });
    this.currentAudioTrackId = codeTrack;

    return Promise.resolve(true);
  }

}


export default Ps4Player;
