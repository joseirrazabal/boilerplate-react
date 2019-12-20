import Utils from "../../utils/Utils";
import AbstractPlayer from "./AbstractPlayer";
import { PONCONNECT, PONSTOP, PONPLAY, PONPAUSE, PONSKIP, PONSPEED, PONBUFFER } from '../../devices/all/settings';
import * as playerConstant from '../../utils/playerConstants';

class AbstractHTML5Player extends AbstractPlayer {

  constructor() {
    super();
    this.options = {};
    this._playerContainer = null;
    this._playerHTMLTag = null;
    this._isPrepared = false;
    this._duration = 0;
    this._isOnLoaded = false;
    this.seek_resume = 0;
    this.src = null;

    /* MULTIAUDIO TRACK VARS */
    this.audioTracks = [];
    this.currentAudioTrackIndex = null;
    this.retryLimitAudioTrack = 20;
    this.retryIntervalAudioTrack = 1; //
    /* END MULTIAUDIO TRACK VARS */

    // Player states, por default onconnect
    this.previousPlayerState = 0;
    this.currentPlayerState = 0;

    this.prependPip = '';

    this.retryIntervalFirstPlaying = 0.9;
    this.retryLimitFirstPlaying = 60;
    this.seekWindow = null;
    this.currentTime = 0;

    this.isSeek = false;
    this.firstLoad = false;
  }

  getStateName(state) {

    let nameState = '';

    switch(state) {
      case PONCONNECT:
        nameState = 'PONCONNECT';
        break;
      case PONSTOP:
        nameState = 'PONSTOP';
        break;
      case PONPLAY:
        nameState = 'PONPLAY';
        break;
      case PONPAUSE:
        nameState = 'PONPAUSE';
        break;
      case PONSKIP:
        nameState = 'PONSKIP';
        break;
      case PONSPEED:
        nameState = 'PONSPEED';
        break;
      case PONBUFFER:
        nameState = 'PONBUFFER';
        break;
      default:
        nameState = 'Unknown [' + state + ']';
        break;
    }

    return nameState;
  }

  setCurrentPlayerState(state) {
    this.previousPlayerState = this.currentPlayerState;
    this.currentPlayerState = state;
    console.log('[PLAYER STATE] handleNetworkDisconnection previous state: ' + this.getStateName(this.previousPlayerState) + ', next state: ' + this.getStateName(state));
  }

  getCurrentPlayerState() {
    return this.currentPlayerState;
  }

  setPlayerBackground(urlBackgroundImage) {
    if(!this._playerContainer)
      return;

    if(urlBackgroundImage) {
      let urlString = "url('" + urlBackgroundImage + "')";
      this._playerContainer.style.backgroundImage = urlString;
      this._playerContainer.style.backgroundRepeat = 'no-repeat';
    }
    else {
      this._playerContainer.style.backgroundImage = 'none';
    }
  }

  createPlayer(options) {
    this.prependPip = options.isPip ? '_pip' : '_full';
    this._playerContainer = window.document.createElement("div");
    this._playerContainer.style.backgroundColor = "transparent";
    this._playerContainer.id = 'Html5PlayerContainer' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";

    if(!this.streamIsImage()) {
      this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);

      this._playerHTMLTag = window.document.createElement('video');
      this._playerHTMLTag.setAttribute('id', 'Html5Player' + this.prependPip);

      // Muted only apply to pip, at this moment
      if(options.muted) {
        this._playerHTMLTag.setAttribute('muted', 'muted');
      }

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

    // Add listeners...if apply
    if(!this.streamIsImage()) {
      this.addEventsListeners();
    }
  }

  createMedia(options) {
    console.log('[AbstractHTML5Player] createMedia'
    //  , options
    );
    //if(typeof options.src === 'undefined' && typeof options.streamType === 'undefined')
      //return;

    if(this._isPrepared)
      return;

    // Just in case...newSource attr only arrive here when it is a replaceMediaSource (enter in replace method below),
    // so in this path we dont have to have this attr, reset it
    if(options.newSource && options.newSource.src) {
      options.newSource = null;
    }

    this.options = options;
    if(this.options.isPip) {
      // Pip would only exist when this is a video or audio
      this._playerHTMLTag = document.getElementById('Html5Player_pip');
      if(!this._playerHTMLTag) {
        this.createPlayer(options);
      }
      else {
        this.addEventsListeners();
        this._playerContainer = document.getElementById('Html5PlayerContainer_pip');
        if(!this.streamIsImage()) {
          this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);
        }
        if(options.muted) {
          this._playerHTMLTag.setAttribute('muted', 'muted');
        }
        else {
          this._playerHTMLTag.removeAttribute("muted");
        }
        if(options.controls) {
          this._playerHTMLTag.setAttribute('controls', 'controls');
        }
        else {
          this._playerHTMLTag.removeAttribute("controls");
        }
      }
    }
    else {
      this.createPlayer(options);
    }

    this.hide();
    this._isPrepared = true;
  }

  loadMedia() {
    //if(typeof this.options.src === 'undefined' && typeof this.options.streamType === 'undefined')
      //return;

    console.log('[AbstractHTML5Player] loadMedia '
      , this.options
    );
    if(!this._isPrepared) {
      return false;
    }
    console.log('[AbstractHTML5Player] loadMedia isPrepared');
    if(this.streamIsImage()) {
      return;
    }

    if(this.streamIsVideo() && this.options.resume && !this.options.isLive) {
      this.seek_resume = this.options.resume;
    }

    if(this.options.src) {
      this.src = this.options.src;
      this._isOnLoaded = false;
      let type = null; // TODO Per device
      this.setVideoSource(this.options.src, type);
      this._playerHTMLTag.load();
      if(!this.options.isPip) {
       this.setPlayerFull();
      }
    }
    else {
      this.destroy();
    }
    console.log('[AbstractHTML5Player] loadMedia end');
  }

  setPlayerFull() {
    this.setPlayerSize(0, 0, 1280, 720);
    // TODO check if we need a pause on player, and object ¿?
    // this.sefPlugin.style.position = "relative or fixed ¿?";
  }

  setPlayerSize(top, left, width, height) {
    if(this.options.parentWrapper) {
      let vWrapper = document.getElementById(this.options.parentWrapper.id);
      if(vWrapper && vWrapper.parentNode) {
        vWrapper.parentNode.style.top = top + 'px';
        vWrapper.parentNode.style.left = left + 'px';
        vWrapper.parentNode.style.width = width + 'px';
        vWrapper.parentNode.style.height = height + 'px';
      }
    }

    if(this._playerContainer) {
      this._playerContainer.style.top = '0px';
      this._playerContainer.style.left = '0px';
      this._playerContainer.style.width = width + 'px';
      this._playerContainer.style.height = height + 'px';
      this._playerContainer.style.position = "relative";
      this._playerContainer.className = "AbstractPlayerObject"; // We dont use this css...at this moment
    }


    if(this.streamIsAudio()) {
      width = 0;
      height = 0;
      if (this._playerHTMLTag) {
        this._playerHTMLTag.style.top = '0px';
        this._playerHTMLTag.style.left = '0px';
        this._playerHTMLTag.style.width = width + 'px';
        this._playerHTMLTag.style.height = height + 'px';
        this._playerHTMLTag.style.position = "absolute";
        this._playerHTMLTag.className = "AbstractPlayerObject"; // We dont use this css...at this moment
      }
    }
  }

  setVideoSource(url, type) {
    console.log('******* <<<<<<<<<<< INIT AbstractHTML5Player setVideoSource: ' + url);
    let source = document.createElement("source");
    source.src = url;
    if (type)
      source.type = type;

    source.id = "Html5PlayerSource" + (this.options.isPip ? '_pip' : '_full');
    this._playerHTMLTag.appendChild(source);

    console.log('******* <<<<<<<<<<< END AbstractHTML5Player setVideoSource');
  }

  play() {

    if(this.streamIsImage()) {
      return;
    }

    console.log('******* <<<<<<<<<<< INIT AbstractHTML5Player play');
    this.show();

    this._playerHTMLTag.play();
    console.log('******* <<<<<<<<<<< END AbstractHTML5Player play');
  }

  resume() {
    console.log('******* <<<<<<<<<<< END AbstractHTML5Player resume');
    this._playerHTMLTag.play();
  }

  pause() {
    this._playerHTMLTag.pause();
    this.onPlayerStatePause();
    // Send event onStop????
  }

  stop() {
    this._playerHTMLTag.pause();
    this.onPlayerStateStop();
    // Send event onStop????
  }

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

    // Stop already take care of send stop to player internal state
    // so below, play change to playingstate
    this.stop();

    let currentSource = document.getElementById("Html5PlayerSource" + (this.options.isPip ? '_pip' : '_full'));
    if(currentSource) {
      currentSource.parentNode.removeChild(currentSource);
    }
    this._isOnLoaded = false;
    this.currentAudioTrackIndex=null;
    this.audioTracks=[];
    this.setVideoSource(newSource.src, null);
    this._playerHTMLTag.load();
    // Play ahora se controla desde onresolve AAFPlayer
    //this.play();
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
      console.info('[TEST PLAYER] intentando seek en seekTimeshift ', seekTime);
      if(seekTime > 0) {
        console.info('[TEST PLAYER] enviando seek en seekTimeshift ', seekTime);
        this.seek(seekTime);
      }
      else {
        console.info('[TEST PLAYER] ERROR intentando seek en timeshift <timeshiftData, this.seekWindow> => ', timeshiftData, this.seekWindow);
      }
    }
  }

  async tryOnFirstTimeshiftSeek(currentTry, timeshiftData) {
    let curTime = this.getCurrentTime();
    console.log('[TEST PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + '], curTime: ' + curTime);

    if(isNaN(curTime)) {
      curTime = 0;
    }
    if(curTime <= 0) {
      console.log('[TEST PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitFirstPlaying) {
        throw new Error('Fail to get playing state');
        console.log('[TEST PLAYER]> Error, Fail to get playing state');
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

  // sec in seconds
  seek(seconds) {
    this.isSeek = true;
    console.log('Playerinterval abstractPlayer seek de: ' + seconds);
    return this.skip(seconds);
  }

  skip(seconds) {
    this._playerHTMLTag.currentTime = seconds;
  }

  hide() {
    if (this._playerHTMLTag) {
      this._playerHTMLTag.style.visibility = "hidden";
    }

    //if (this._playerContainer) {
      //this._playerContainer.style.visibility = "hidden";
    //}
  }

  show() {
    console.log('AbstractHTML5Player show 1');
    if (this._playerHTMLTag) {
      console.log('AbstractHTML5Player show 2');
      this._playerHTMLTag.style.visibility = "visible";

    }
  }

  destroy() {
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

    // Both, pip and full, audio and video, stop and remove listeners
    if(!this.streamIsImage()) {
      this.stop();
      this.removeEventsListener();
    }

    if(this.options.isPip) {
      this.destroyPip();
      if(this.streamIsImage()) {
        this.destroyPlayerContainer();
      }
    }
    else {
      this.destroyPlayerContainer();
    }

    // Remove background both pip and full
    this.setPlayerBackground(null);

    this.previousPlayerState = PONCONNECT;
    this.currentPlayerState = PONCONNECT;

    this._isPrepared = false;

    return;
  }

  // For optimize pip playing, we dont destroy pip, we only change source
  destroyPip() {
    if (!this._isPrepared) {
      return;
    }

    // Only remove source and hide player when audio or video
    if(!this.streamIsImage()) {
      let source_dom = document.getElementById('Html5PlayerSource_pip');
      if(source_dom) {
        source_dom.parentNode.removeChild(source_dom);
      }
      this.hide();
    }
  }

  destroyPlayerContainer() {
    if (this._playerContainer) {
        if(this._playerHTMLTag && this._playerHTMLTag.parentNode) {
          this._playerHTMLTag.parentNode.removeChild(this._playerHTMLTag);
        }
        let vWrapper = document.getElementById(this.options.parentWrapper.id);
        vWrapper.removeChild(this._playerContainer);
        this._playerContainer = null;
        this._playerHTMLTag = null;
      }

      this.audioTracks = [];
      this.currentAudioTrackIndex = null;
  }

  addEventsListeners() {
    // Bind first
    this._toBindOnLoad = this._onLoad.bind(this);
    this._toBindOnWaiting = this._onWaiting.bind(this);
    this._toBindOnTimeUpdate = this._onTimeUpdate.bind(this);
    //this._toBindOnWaiting = this._onWaiting.bind(this);
    this._toBindOnPlaying = this._onPlaying.bind(this);
    //this._toBindOnPlaying = this._onPlaying.bind(this);
    this._toBindOnError = this._onError.bind(this);
    this._toBindOnFinished = this._onFinished.bind(this);
    this._toBindOnCanPlay = this._onCanPlay.bind(this);
    this._toBindOnDurationChange = this._onDurationChange.bind(this);

    // Add listeners
    this._playerHTMLTag.addEventListener("loadedmetadata", this._toBindOnLoad);
    this._playerHTMLTag.addEventListener("waiting", this._toBindOnWaiting);
    this._playerHTMLTag.addEventListener("timeupdate", this._toBindOnTimeUpdate);
    this._playerHTMLTag.addEventListener("seeking", this._toBindOnWaiting);
    this._playerHTMLTag.addEventListener("seeked", this._toBindOnPlaying);
    this._playerHTMLTag.addEventListener("playing", this._toBindOnPlaying);
    this._playerHTMLTag.addEventListener("error", this._toBindOnError);
    this._playerHTMLTag.addEventListener("ended", this._toBindOnFinished);
    this._playerHTMLTag.addEventListener("canplay", this._toBindOnCanPlay);
    this._playerHTMLTag.addEventListener("durationchange", this._toBindOnDurationChange);
  }

  removeEventsListener() {
    // Remove listeners
    this._playerHTMLTag.removeEventListener("loadedmetadata", this._toBindOnLoad);
    this._playerHTMLTag.removeEventListener("waiting", this._toBindOnWaiting);
    this._playerHTMLTag.removeEventListener("timeupdate", this._toBindOnTimeUpdate);
    this._playerHTMLTag.removeEventListener("seeking", this._toBindOnWaiting);
    this._playerHTMLTag.removeEventListener("seeked", this._toBindOnPlaying);
    this._playerHTMLTag.removeEventListener("playing", this._toBindOnPlaying);
    this._playerHTMLTag.removeEventListener("error", this._toBindOnError);
    this._playerHTMLTag.removeEventListener("ended", this._toBindOnFinished);
    this._playerHTMLTag.removeEventListener("canplay", this._toBindOnCanPlay);
    this._playerHTMLTag.removeEventListener("durationchange", this._toBindOnDurationChange);
  }

  getCurrentTime() {
    if(this._playerHTMLTag) {
      return this._playerHTMLTag.currentTime;
    }

    return 0;
  }

  getDuration() {
    return this._duration;
  }

  setDuration() {
    //Para eventos pasados el player de Sony envía Infinity en lugar de valores numericos, se pone un default.
    if(this._playerHTMLTag.duration===Infinity){
      //Valor equivalente en string a --:--:--
      this._duration = 0;
    }else{
      this._duration = this._playerHTMLTag.duration;
    }
  }

  doVideoResume() {
    console.log('[Player HTML5] onTimeUpdate >>>>>>>>>>>>>>> doVideoResume seek_resume: ', this.seek_resume);
    if (this.seek_resume <= 0) {
      return;
    }
    console.log('[Player HTML5] onTimeUpdate >>>>>>>>>>>>>>> doVideoResume seek_resume, current time before: ', this.getCurrentTime());
    this._playerHTMLTag.currentTime = this.seek_resume;
    // Check on devices if we will require a delay here...
    this.seek_resume = 0;
    console.log('[Player HTML5] onTimeUpdate >>>>>>>>>>>>>>> doVideoResume seek_resume, current time after: ', this.getCurrentTime());
  }

  /* Events */

  _onLoad() {
    console.log('[PLAYR EVENT] _onLoad ', this.getCurrentPlayerState());

    if (this.getCurrentPlayerState() === PONBUFFER) {
      console.log('[PLAYR EVENT] _onLoad ---- end buffering');
      this._onBufferingFinish();
    }

    if(this.options.events.onLoad) {
      this.options.events.onLoad();
    }
  }

  _onWaiting() {
    console.log('[PLAYR EVENT] _onWaiting');
    if(this.options.events.onWaiting) {
      this.options.events.onWaiting();
    }

    if(!this.streamIsAudio) {
      if(!this.firstLoad
        || this.options.audiosubtitleinfo.optionId !== this.previousAudio
        || this.isSeek
        || this.options.groupId !== this.previousGroupId
      ) {
        this._onBufferingStart();
      }

      this.previousAudio = this.options.audiosubtitleinfo.optionId;
      this.previousGroupId = this.options.groupId;
      this.isSeek = false;
      this.firstLoad = true;
    }
      // this.flag++;
  }

  _onTimeUpdate() {
    //console.log('[Player HTML5] onTimeUpdate: ', this.getCurrentTime());
    if(this.options.events.onTimeUpdate && this.getCurrentPlayerState() !== PONPAUSE) {
      this.options.events.onTimeUpdate(this.getCurrentTime());
    }
  }

  _onPlaying() {
    console.log('[PLAYR EVENT] _onPlaying', this.getCurrentPlayerState());
    if (this.getCurrentPlayerState() === PONBUFFER && this._isOnLoaded) {
      console.log('[PLAYR EVENT] _onPlaying.....previo: buffering');
      this._onBufferingFinish();
    }
    else {
      this.onPlayerStatePlay();
      console.log('[PLAYR EVENT] _onPlaying.....pasa a play');
    }
    if(this.options.events.onPlaying) {
      this.options.events.onPlaying();
    }
  }

  _onError(e) {
    console.log('[PLAYR EVENT] _onError');
    console.log(e);
    // From https://dev.w3.org/html5/spec-author-view/video.html
    let msg = "";
    switch (e.target.error.code) {
      case e.target.error.MEDIA_ERR_ABORTED:
        msg = "User aborted the video playback.";
        break;
      case e.target.error.MEDIA_ERR_NETWORK:
        msg = "A network error caused the video download to fail part-way.";
        break;
      case e.target.error.MEDIA_ERR_DECODE:
        msg = "The video playback was aborted due to a corruption problem or because the video used features your browser did not support.";
        break;
      case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        msg = "The media resource indicated by the src attribute or assigned media provider object was not suitable.";
        break;
      default:
        msg = "An unknown error occurred.";
        break;
    }
    this.stop();

    if(this.options.events.onError) {
      this.options.events.onError(msg, playerConstant.onRenderError);
    }
  }

  _onFinished() {
    console.log('[PLAYR EVENT] _onFinished');
    this.onPlayerStateStop();
    // Reinit player
    this.destroy();
    if(this.options.events.onFinished) {
      this.options.events.onFinished();
    }
  }

  _onCanPlay(e) {
    console.log('[Playercontrols] _onCanPlay> ');
    if(this.options.events.onCanPlay) {
      this.options.events.onCanPlay(e);
    }
    this._playerHTMLTag.play();
  }

  _onDurationChange() {
    console.log('[PLAYR EVENT] _onDurationChange');
    this._isOnLoaded = true;
    this.setDuration();
    this.doVideoResume();
    if(this.options.events.onDurationChange) {
      this.options.events.onDurationChange();
    }
  }

  _onBufferingStart() {
    this.onPlayerStateBuffer();

    if(this.options.events.onBufferingStart) {
      this.options.events.onBufferingStart();
    }
  }

  _onBufferingProgress() {
    if(this.options.events.onBufferingProgress) {
      this.options.events.onBufferingProgress();
    }
  }

  _onBufferingFinish() {
    if(this.options.events.onBufferingFinish) {
      this.options.events.onBufferingFinish();
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
  }

  /* END Events */

  /* PLAYER STATE EVENTS */
  onPlayerStateConnect() {
    this.setCurrentPlayerState(PONCONNECT);
  }

  onPlayerStatePlay() {
    this.setCurrentPlayerState(PONPLAY);
  }

  onPlayerStatePause() {
    this.setCurrentPlayerState(PONPAUSE);
  }

  onPlayerStateStop() {
    this.setCurrentPlayerState(PONSTOP);
  }

  onPlayerStateSkip() {
    this.setCurrentPlayerState(PONSKIP);
  }

  onPlayerStateSpeed() {
    this.setCurrentPlayerState(PONSPEED);
  }

  onPlayerStateBuffer() {
    this.setCurrentPlayerState(PONBUFFER);
  }
  /* END PLAYER STATE EVENTS */


  /* MULTIPLE AUDIOTRACKS */
  async tryGetAudioTracks(currentTry) {

    if(!this._isOnLoaded) {
      console.log('[ABSTRACTPLAYER AUDIOTRACK]> tryGetAudioTracks retry number: [' +  currentTry + '] - ABSTRACTPLAYER player audioTracks...');
      if(currentTry >= this.retryLimitAudioTrack) {
        throw new Error('Fail to get audioTracks');
        console.log('[ABSTRACTPLAYER]> Error, player instance could not initialize');
        return;
      }

      // Wait for a while...
      await Utils.sleep(this.retryIntervalAudioTrack);

      // ...Continue recursive...
      return this.tryGetAudioTracks(++currentTry);
    }
    else {
      console.log('[ABSTRACTPLAYER AUDIOTRACK]> tryToGetAudioTracks retry number: [' +  currentTry + '] -  ABSTRACTPLAYER player audiioTracks is READY');

      return this.getAudioTracks();
    }

  }

  getAudioTracks() {
    console.info("[ABSTRACTPLAYER AUDIOTRACK]");
    if(!this._isOnLoaded) {
      console.info("[ABSTRACTPLAYER AUDIOTRACK] Delay 1s to get the audio track info again");
      // ...Start recursive...
      return this.tryGetAudioTracks(1);
    }

    return this.getAudioTrackById();
  }

  getAudioTrackById() {
    console.log('[ABSTRACTPLAYER] html5plauyerstgy getAudioTrackById>');

    return new Promise((resolve, reject) => {
      let audioTracks = this._playerHTMLTag.audioTracks;
      let i = 0;
      console.log('[ABSTRACTPLAYER] audioTracks recuperados:');
      console.log(audioTracks);

      if (audioTracks) {
        for (i = 0; i < audioTracks.length; i++) {
          let oneTrack = audioTracks[i];
          console.log('[ABSTRACTPLAYER] HTML5PlayerMultiAudioTrack track id> ' + oneTrack.id);
          console.log('[ABSTRACTPLAYER] > ' + oneTrack + ', label: ' + oneTrack.label + ', language: ' + oneTrack.language);

          if (oneTrack.enabled) {
            this.currentAudioTrackIndex = i;
          }

          this.audioTracks.push(oneTrack);
          resolve(this.audioTracks);
        }
      }
      else {
        reject('Dont have audio tracks!');
      }
      console.log(this.audioTracks);
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
      if(internalAudioIndex < 0) {
        reject('Dont have audioTracks information, index lang does not exist');
      }
      else {

        if(this.currentAudioTrackIndex === internalAudioIndex)  {
          console.info('[ABSTRACTPLAYER AUDIOTRACK] Same audioTrack, nothing to do');
          resolve(true);
        }

        let currentTime = Math.floor(this.getCurrentTime());

        if(this.currentAudioTrackIndex) {
          this.audioTracks[this.currentAudioTrackIndex].enabled = false;
        }
        else {
          for (let t = 0; t < this.audioTracks.length; t++)
            this.audioTracks[t].enabled = false;
        }

        console.info("[ABSTRACTPLAYER AUDIOTRACK] Set audioTrack to index: " + internalAudioIndex + ', lang code: ' + codeTrack);
        this.currentAudioTrackIndex = internalAudioIndex;
        // TODO check if thos works or do we have to use player.audioTracks instead?
        this.audioTracks[internalAudioIndex].enabled = true;
       // this.seek(currentTime);

        resolve(true);
      }
    });

  }

  getAudioIndexOfCode(codeTrack) {
    return this.audioTracks.findIndex(track => track.language === codeTrack);
  }

  getLanguageCodeByISO3(codeTrack) {
    let ret = null;
    switch(codeTrack)
    {
      case 'ori':
        ret = 'or';
        break;
      case 'eng':
        ret = 'en';
        break;
      case 'spa':
        ret = 'es';
        break;
      case 'por':
        ret = 'pt';
        break;
      default:
        break;
    }
    console.log(`[PLAYER MIDDLEWARE] ${codeTrack} replaced to ${ret}`);
    return ret;
  }

  // Para samsung híbridas...hasta este momento...
  getLanguageCodeByISO2(codeTrack) {
    let ret = null;
    switch(codeTrack)
    {
      case 'or':
        ret = 'ori';
        break;
      case 'en':
        ret = 'eng';
        break;
      case 'sp':
      case 'es':
        ret = 'spa';
        break;
      case 'po':
      case 'pt':
        ret = 'por';
        break;
      default:
        break;
    }
    console.log(`[AbstractPlayer] ${codeTrack} replaced to ${ret}`);
    return ret;
  }


  /* END MULTIPLE AUDIOTRACKS */

  /* UTILS FOR PLAYER */
  streamIsVideo() {
    if(this.options.streamType === playerConstant.SS
            || this.options.streamType === playerConstant.SS_MA
            || this.options.streamType === playerConstant.HLS
            || this.options.streamType === playerConstant.HLSPRM
            || this.options.streamType === playerConstant.HLS_KR
            || this.options.streamType === playerConstant.DVBC
            || this.options.streamType === playerConstant.IP_MULTICAST
            || this.options.streamType === playerConstant.IP_MULTICAST_UDP
            || this.options.streamType === playerConstant.DVBS
            || this.options.streamType === playerConstant.WVC

      )
    {
      return true;
    }
    else
      return false;
  }

  streamIsAudio() {
    if(this.options.streamType === playerConstant.AUDIO
            || this.options.streamType === playerConstant.RADIO
    )
      return true;
    else
      return false;
  }

  streamIsImage() {
    return this.options.streamType === playerConstant.PLAYERIMAGE;
  }

  streamIsSpot() {
    return this.options.streamType === playerConstant.SPOT;
  }
  /* END UTILS FOR PLAYER */


}

export default AbstractHTML5Player;
