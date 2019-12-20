import AbstractHTML5Player from '../all/AbstractHTML5Player'

import { PONCONNECT, PONSTOP, PONPAUSE } from '../../devices/all/settings';
import PlayerGetMediaTask from '../../requests/tasks/player/PlayerGetMediaTask';
import RequestManager from '../../requests/RequestManager';
import {SS_MA} from "../../utils/playerConstants";
import Utils from '../../utils/Utils';

/* TODO this must not inherit from HTML5 */
class AndroidPlayer extends AbstractHTML5Player {

  constructor() {
    super();

    this.android_media_src = null; // URL to play VOD, with additional params
    this.attr_id_instance = null; // Pip or full
    this.androidPlayInterval = 1; // Seconds between attemps to play (delay/sleep)
    this.androidPlayRetries = 20; // Max number of retries before send error
    this.androidPlayerReady = false; // Android STB behave
    this.androidOnReady = false;
    this.fireOnDurationChange = false;

    this.timeUpdateTimeoutID = null;

    this.prependPip = '';

    this.currentContentTimeOnPause = null;
    this.currentPlayerMedia = null;
    this.styleBackup = null;
    this.isMediaLoaded = false;
    this.canStopPlayer = false;
    this.isNewSource = false;
    this.playerStopped = false;
    this.isVodMedia = false;
    this.currentTime = 0;
    this.seekWindow = null;

    this.retryIntervalFirstPlaying = 0.8;
    this.retryLimitFirstPlaying = 40;

    this.OCTOLINK1 = "octoshape://opsqa.octoshape.org/amx/live/flv/ch1/4000k?ts=true";
    this.OCTOLINK2 = "https://secure-streams.akamaized.net/rt-doc/index1600.m3u8";
    this.OCTOLINK3 = "http://tvemsnbc-lh.akamaihd.net/i/nbcmsnbc_1@122532/master.m3u8";
    this.OCTOLINK4 = "octoshape://opsqa.octoshape.org/amx/live/flv/ch2/4000k?ts=true";
    this.OCTOLINK5 = "https://secure-streams.akamaized.net/rt-usa/index2500.m3u8";
    this.OCTOLINK6 = "http://nmxlive.akamaized.net/hls/live/529965/Live_1/index.m3u8";
    this.OCTOLINK7 = "http://v3plusinfo247hls-i.akamaihd.net/hls/live/218877/v3plusinfo247hls/v3plusinfo247hls_1_1.m3u8";

    this.seekTimeshift = this.seekTimeshift.bind(this);
    this.tryOnFirstTimeshiftSeek = this.tryOnFirstTimeshiftSeek.bind(this);
    this.seekWindow = null;

    this.isSeek = false;
    this.firstLoad = false;
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
        this.currentContentTime = Math.floor(window.AndroidPlayerInterface.getCurrentStreamPosition() / 1000);
        this._onTimeUpdate(this.currentContentTime);
      }
    }, 800);
  }

  // TODO this is not a fucking HTML5 player
  createMedia(options) {
    console.log('[AndroidPlayer] createMedia', options);

    if(this._isPrepared)
      return;

    /*if(options.newSource && options.newSource.src) {
      options.newSource = null;
    }*/

    this.options = options;
    this.currentPlayerMedia = options;


    this.prependPip = options.isPip ? '_pip' : '_full';
    let vIndex = options.isPip ? 1 : 0;

    this._playerContainer = window.document.createElement("div");
    this._playerContainer.style.backgroundColor = "transparent";
    this._playerContainer.id = 'Html5PlayerContainer' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";

    this.rootElement = window.document.getElementById("HTML5VideoWrapper");

    // TODO player background - Call to the parent, set background
    //this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);

    if(!this.streamIsImage()) {
      /*  TODO player background
      * this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);
      */

      this._playerHTMLTag = window.document.createElement('video');
      this._playerHTMLTag.setAttribute('id', 'Html5Player' + this.prependPip);
      this._playerHTMLTag.className = "Html5Player";

      this._playerContainer.appendChild(this._playerHTMLTag);
      this.addEventsListeners();
    }
    else {
      /*  TODO player background
      * this.setPlayerBackground(options.src ? options.src : null);
      */
    }

    if(!this.options.parentWrapper) {
      console.error('[AndroidPlayer] parentWrapper not found');
      return;
    }

    //console.log('[AndroidPlayer] WrapperID: ' + this.options.parentWrapper.id);

    let vWrapper = document.getElementById(this.options.parentWrapper.id);
    vWrapper.appendChild(this._playerContainer);

    //console.log('******* <<<<<<<<<<< androidPlayer createMedia 8');
    this.hide();

    /*
    if(this.options.src === 'undefined' || this.options.src === null){
      console.log('>>>>>>>>@@@@@@@ onCreateMedia src is null so will Destroy()', this.options);
      console.log('>>>>>>>>@@@@@@@ onCreateMedia src is null so will Destroy()', this.options);
      this.destroy();
    }
    */

    this.createMediaPlayer(options);

    this._isPrepared = true;

    this.removeBackgroundAndStyle();

    return;
  }

  loadMedia() {
    console.info('[AndroidPlayer] loadMedia',
      //'\nthis.options', this.options,
      '\nthis.currentPlayerMedia', this.currentPlayerMedia
    );

    if(!this._isPrepared) {
      return false;
    }

    if(this.streamIsImage()) {
      return;
    }

    if(this.options.resume && !this.options.isLive) {
      this.seek_resume = this.options.resume;
    }

    if(this.options.src){
      this.src = this.options.src; //
    }

    if(this.options.isLive && !this.streamIsAudio()){
      console.info('[AndroidPlayer] loadMedia isLive');

      let isMini = this.options.isPip;
      try {
        if(isMini){
          window.AndroidPlayerInterface.setMiniPlayer(true);
        }
        else{
          window.AndroidPlayerInterface.setMiniPlayer(false);
          // Indicar para hacer timeshift
          if(this.options.timeshift) {
            this.timeshift = this.options.timeshift;
          }
        }

        //Hardcoded channel
        switch (this.android_media_src)
        {
          case this.OCTOLINK1:
            this.android_media_src = this.OCTOLINK2;
            break;
          case this.OCTOLINK2:
            this.android_media_src = this.OCTOLINK3;
            break;
          case this.OCTOLINK3:
            this.android_media_src = this.OCTOLINK4;
            break;
          case this.OCTOLINK4:
            this.android_media_src = this.OCTOLINK5;
            break;
          case this.OCTOLINK5:
            this.android_media_src = this.OCTOLINK6;
            break;
          case this.OCTOLINK6:
            this.android_media_src = this.OCTOLINK7;
            break;
          case this.OCTOLINK7:
            this.android_media_src = this.OCTOLINK1;
            break;

          default:
            this.android_media_src = this.OCTOLINK1;
        }
        this.android_media_src = this.src;


        window.AndroidPlayerInterface.loadMediaUrl(this.android_media_src);
        console.log('[AndroidPlayer] loadMedia URL live', this.options.src);

        if(!isMini){
          this.isMediaLoaded = true;
          this.removeBackgroundAndStyle();
          this.isTvRunning = true;
          this.canStopPlayer = true;
          this.setPlayerFull();
        }
        else{
          this.isMediaLoaded = true;
          this.removeBackgroundAndStyle();
          this.isTvRunning = true;
          this.canStopPlayer = true;
        }

      }
      catch (error){

      }

    }
    else if(this.streamIsAudio()){
      try {
        console.info("[AndroidPlayer] MUSIC", this.currentPlayerMedia.src);
        window.AndroidPlayerInterface.setMiniPlayer(false);
        window.AndroidPlayerInterface.loadMediaUrl(this.currentPlayerMedia.src);
        this.isMediaLoaded = true;
      }
      catch (error){

      }
    }
    else{
      console.log('[AndroidPlayer] VOD');
      this.processPlayerMedia();
      this.canStopPlayer = true;
    }

    //console.log('[AndroidPlayer] loadMedia end');
  }

  createMediaPlayer(options){
    if(options.isLive && options.src && !this.streamIsAudio()){
      //console.log('[AndroidPlayer] createMediaPlayer LIVE');

      let isMini = options.isPip;

      if(isMini){
        window.AndroidPlayerInterface.setMiniPlayer(true);
      }
      else{
        window.AndroidPlayerInterface.setMiniPlayer(false);
      }

      if(!isMini){
        try{
          /*
          * This function must not exist. The player must receive just the media and maybe the size also.
          */
          window.AndroidPlayerInterface.startTvPlayerFull();
          console.log('[AndroidPlayer] createMediaPlayer full LIVE');
        }
        catch (error){}
      }
      else{
        try{
          /*
          * This function must not exist. The player must receive just the media and maybe the size also.
          */
          window.AndroidPlayerInterface.startTvPlayerMini();
          console.log('[AndroidPlayer] createMediaPlayer pip LIVE');
        }
        catch (error){}
      }
    }
    else if(this.streamIsAudio()){
      try{
        /*
        * This function must not exist. The player must receive just the media and maybe the size also
        */
        window.AndroidPlayerInterface.startMusicPlayer();
        console.log('[AndroidPlayer] createMediaPlayer Music Player OK');
      }
      catch (error){}
    }
  }

  processPlayerMedia(){
    if(this.currentPlayerMedia && !this.streamIsAudio()) {
      try {
        let videoOptions = this.currentPlayerMedia;
        console.log("[AndroidPlayer] processPlayerMedia ", videoOptions.playerMedia);

        let isMini = videoOptions.isPip;
        let groupId = Number.parseInt(videoOptions.groupId);
        //var contentId = Number.parseInt(videoOptions.drmInfo.content_id);
        let playerMedia = JSON.stringify(videoOptions.playerMedia);
        let isTrailer = videoOptions.isTrailer;
        let isLive = videoOptions.isLive;
        let isMA = videoOptions.streamType ? videoOptions.streamType === SS_MA : false;

        if(isMini){
          window.AndroidPlayerInterface.setMiniPlayer(true);
        }
        else{
          window.AndroidPlayerInterface.setMiniPlayer(false);
        }

        window.AndroidPlayerInterface.setPlayerMedia(groupId, 0, isLive, isTrailer, isMA, playerMedia);
      }
      catch (error){

      }

      this.isMediaLoaded = true;
    }
  }

  isCurrentMedia(){
    if(this.currentPlayerMedia !== null
      && this.currentPlayerMedia.src === this.options.src){
      console.log('[AndroidPlayer] isCurrentMedia same source');
      return true;
    }
    else{
      return false;
    }
  }

  async tryToPlay(currentTry) {

    if (!this.androidPlayerReady) {
      console.log('[AndroidPlayer] tryToPlay retry number: [' +  currentTry + '] not ready yet...');
      if (currentTry >= this.androidPlayRetries)
      {
        console.error('[AndroidPlayer] err player instance could not initialize');
        return;
      }
      await Utils.sleep(this.androidPlayInterval);

      return this.tryToPlay(++currentTry);
    }
    else {
      console.info('[AndroidPlayer] tryToPlay retry number: [' +  currentTry + '] READY');
      return this.play();
    }
  }

  play() {

    console.log('[AndroidPlayer] play');

    if(this.streamIsImage()) {
      return;
    }

    /*
    if(this.streamIsAudio()) {
      return super.play();
    }
    */

    if(!this.androidPlayerReady) {
      return this.tryToPlay(1);
    }

    this.hide();

    if(this.currentPlayerMedia.isLive || this.options.isLive){

      var isMini = this.options.isPip;

      if (isMini) {
        console.log('[AndroidPlayer] CALL MINI LIVE play');
        try{
          window.AndroidPlayerInterface.setMiniPlayer(true);
          window.AndroidPlayerInterface.play();
        }
        catch (error){
          console.error('[AndroidPlayer] LIVE play err', error);
        }
      }
      else {
        console.log('[AndroidPlayer] CALL FULL LIVE play');
        try{
          window.AndroidPlayerInterface.setMiniPlayer(false);
          window.AndroidPlayerInterface.play();
        }
        catch (error){
          console.error('[AndroidPlayer] LIVE play err', error);
        }
      }
    }
    else if(this.streamIsAudio()){
      try{
        console.log('[AndroidPlayer] MUSIC play');
        //window.AndroidPlayerInterface.startMusicPlayer();
        window.AndroidPlayerInterface.play();
      }
      catch (error){
        console.error('[AndroidPlayer] MUSIC play err', error);
      }
    }
    else{
      try {
        window.AndroidPlayerInterface.play();
        console.log('[AndroidPlayer] VOD play OK');
      }
      catch (error){
        console.error('[AndroidPlayer] VOD play err', error);
      }
    }

    this.removeBackgroundAndStyle();

    this.onPlayerStatePlay();
  }

  replaceMediaSource(newSource) {
    console.log('[AndroidPlayer] replaceMediaSource'
    //  , newSource
    );
    var isNewSourceMA = newSource.streamType ? newSource.streamType === SS_MA : false;
    var isThisSourceMA = this.options.streamType ? this.options.streamType === SS_MA : false;
    this.options.newSource = newSource; // Add the attr to detect error when replace and not reset whole player
    this.options.src = newSource.src;
    this.options.drmInfo = newSource.drmInfo;
    this.options.isLive = newSource.isLive;
    this.options.streamType = newSource.streamType;
    this.options.isPip = newSource.isPip;
    this.options.groupId = newSource.groupId;
    this.options.contentId = (newSource.drmInfo && newSource.drmInfo.content_id) ? newSource.drmInfo.content_id : null;
    var playerMedia = JSON.stringify(newSource.playerMedia);

    this.audioTracks = [];
    this.currentAudioTrackIndex = null;

    this.currentTime = 0;
    this.seekWindow = null;

    // If there is a resume when vod...
    if(newSource.resume && !newSource.isLive) {
      this.seek_resume = newSource.resume;
      this.options.resume = newSource.resume;
    }

    if(this.options.isLive && !this.streamIsAudio()) {
      if(newSource.timeshift) {
        this.timeshift = newSource.timeshift;
      }

      try {
        if(this.options.isPip){
          window.AndroidPlayerInterface.setMiniPlayer(true);
          console.log('[AndroidPlayer] replaceMediaSource LIVE - MINI ');
        }
        else{
          window.AndroidPlayerInterface.setMiniPlayer(false);
          this.setPlayerFull();
          console.log('[AndroidPlayer] replaceMediaSource LIVE - FULL ');
        }
        this.isVodMedia = false;
        //Hardcoded channel
        switch (this.android_media_src)
        {
          case this.OCTOLINK1:
            this.android_media_src = this.OCTOLINK2;
            break;
          case this.OCTOLINK2:
            this.android_media_src = this.OCTOLINK3;
            break;
          case this.OCTOLINK3:
            this.android_media_src = this.OCTOLINK4;
            break;
          case this.OCTOLINK4:
            this.android_media_src = this.OCTOLINK5;
            break;
          case this.OCTOLINK5:
            this.android_media_src = this.OCTOLINK6;
            break;
          case this.OCTOLINK6:
            this.android_media_src = this.OCTOLINK7;
            break;
          case this.OCTOLINK7:
            this.android_media_src = this.OCTOLINK1;
            break;

          default:
            this.android_media_src = this.OCTOLINK1;
        }

        this.android_media_src = this.options.src;
        window.AndroidPlayerInterface.loadMediaUrl(this.android_media_src);

        this.isNewSource = true;
        this.isMediaLoaded = true;

        this.androidPlayerReady = false;

        this.removeBackgroundAndStyle();

        this.onPlayerStateStop();
      }
      catch (error){
        console.log('[AndroidPlayer] replaceMediaSource err', error);
      }
    }
    else if(!this.streamIsAudio()) {
      try {
        if (this.options.isPip) {
          window.AndroidPlayerInterface.setMiniPlayer(true);
          console.log('[AndroidPlayer] replaceMediaSource VOD - PIP ');
        }
        else {
          window.AndroidPlayerInterface.setMiniPlayer(false);
          console.log('>>>>>>>>>>@@@@@@@@ replaceMediaSource VOD - FULL ');
        }

        this.isVodMedia = true;

        if(isNewSourceMA && isThisSourceMA){ // de multiple audio a multiple no recargamos el player

          this.play();
        }
        else{
          // de multiple audio a single audio o vicervesa o de single a single, recargamos el player
          window.AndroidPlayerInterface.setPlayerMedia(this.options.groupId, 0, this.options.isLive, this.options.isTrailer, isNewSourceMA, playerMedia);
        }

        this.isNewSource = true;
        this.isMediaLoaded = true;
        this.androidPlayerReady = false;
        this.removeBackgroundAndStyle();
        this.onPlayerStateStop();
      }
      catch (error){
        console.log('[AndroidPlayer] replaceMediaSource ERROR', error);
      }
    }
    else if(this.streamIsAudio()){
      console.info("[AndroidPlayer] replaceMediaSource MUSIC", this.currentPlayerMedia.src);
      window.AndroidPlayerInterface.setMiniPlayer(false);
      window.AndroidPlayerInterface.loadMediaUrl(this.options.src);
      this.isNewSource = true;
      this.isMediaLoaded = true;
      this.isVodMedia = true;

      this.androidPlayerReady = false;

      this.removeBackgroundAndStyle();

    }

  }

  playNewSource(){
    console.log('[AndroidPlayer] playNewSource', this.currentPlayerMedia);
    var isMini = this.options.isPip;
    if (isMini) {
      window.AndroidPlayerInterface.setMiniPlayer(true);
    }
    else {
      window.AndroidPlayerInterface.setMiniPlayer(false);
    }

    if(this.options.isLive || this.streamIsAudio() && !this.isVodMedia){
      try{

        if(isMini){
          window.AndroidPlayerInterface.play();
          console.log('[AndroidPlayer] playNewSource MINI play Started');
        }
        else{
          window.AndroidPlayerInterface.play();
          console.log('[AndroidPlayer] playNewSource FULL play Started');
        }

        this.androidPlayerReady = true;

        this.removeBackgroundAndStyle();
      }
      catch (error){
        console.log('[AndroidPlayer] playNewSource - Play err', error);
      }
    }
    else{
      try{
        window.AndroidPlayerInterface.play();
        console.log('[AndroidPlayer] playNewSource FULL VOD play Started');

        this.androidPlayerReady = true;

        this.removeBackgroundAndStyle();
      }
      catch (error){
        console.log('[AndroidPlayer] playNewSource VOD Play err', error);
      }
    }
  }

  async requestPlayerGetMedia(groupId = "", contentId = "", isTrailer = false, streamType = "", startTime = "", endTime = "" ) {
    let result;
    try {
      const playerGetMediaTask = new PlayerGetMediaTask(groupId, contentId, isTrailer, streamType, startTime, endTime);
      result = await RequestManager.addRequest(playerGetMediaTask);
    } catch(err) {
      console.error("[AndroidPlayer] Error calling playerGetMedia: ", err);
      result = err;
    }
    return new Promise((resolve, reject) => {
      if(result.status == "200") {
        resolve(result.response);
      } else {
        reject(result);
      }
    });
  }

  removeBackgroundAndStyle(){
    this.setPlayerBackground(null);
    let root = document.getElementById("root");
    if(this.styleBackup === null){
      this.styleBackup = {
        background: root.style.background,
        backgroundColor: root.style.backgroundColor,
        backgroundImage: root.style.backgroundImage
      };
    }
    //this.styleBackup = root.style;
    //console.log('******* <<<<<<<<<<< INIT COSHIP Web Root Style');
    //console.log(this.styleBackup);
    //console.log(root.style);
    root.style.background = "transparent";
    root.style.backgroundColor = "transparent";
    root.style.backgroundImage = "none";
  }

  resume() {
    console.log('[AndroidPlayer] resume');
    if(this.isMediaLoaded && !this.streamIsAudio()) {
      this.currentContentTimeOnPause = null;
      window.AndroidPlayerInterface.play();
      this.onPlayerStatePlay();
    } else if(this.streamIsAudio()){
      window.AndroidPlayerInterface.play();
      this.onPlayerStatePlay();
    }
  }

  pause() {
    console.log('[AndroidPlayer] pause');
    if(this.isMediaLoaded) {
      // Save current time (for duration)...
      this.currentContentTimeOnPause = this.getCurrentTime();
      window.AndroidPlayerInterface.pause();
      this.onPlayerStatePause();
    }
  }

  stop() {
    console.log('[AndroidPlayer] stop CALLED');

    if(this.streamIsAudio()){
      console.log('[AndroidPlayer] stop CALLED but is Music dont stop');
      return;
    }
    else{
      if(this.options.isPip){
        try{
          window.AndroidPlayerInterface.stop();
          this.playerStopped = true;
        }
        catch (error){
          console.error(error);
        }
        this.onPlayerStateStop();
        this.androidPlayerReady = false;
      }
      else{
        try{
          window.AndroidPlayerInterface.stop();
          this.playerStopped = true;
        }
        catch (error){
          console.error("[AndroidPlayer] stop err", error);
        }
        this.onPlayerStateStop();
        this.androidPlayerReady = false;
      }
    }
  }

  hide() {
    if (this._playerHTMLTag) {
      this._playerHTMLTag.style.visibility = "hidden";
    }
  }

  show() {
    console.log('[AndroidPlayer] show');
    if (this._playerHTMLTag) {
      this._playerHTMLTag.style.visibility = "visible";
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
    console.info('[ANDROID PLAYER] seekTimeshift <timeshiftData, firstSeek, seekWindow> ', timeshiftData, firstSeek, this.seekWindow);
    if(firstSeek) {
      this.tryOnFirstTimeshiftSeek(1, timeshiftData);
    }
    else {
      // Calc seek
      let seekTime = timeshiftData.seektime;

     const now = Utils.now(true).unix();
      if(this.seekWindow.lastseek !== null) {
        const diff = Math.ceil(now - this.seekWindow.lastseek);
        console.log('[ANDROID PLAYER] function timeshift diff calculado, segundos: ', diff)
        seekTime = seekTime - diff;
      }

      // starttime viene siempre en 1 :/
      if(this.seekWindow && this.seekWindow.startTime >= 0) {
        if(seekTime <= 1) {
          seekTime = 1; // 1 seconds, protect player, contents start second 6 aprox? average
        }
      }

      if(this.seekWindow && !this.seekWindow.lastseek)
        this.seekWindow.lastseek = now;

      setTimeout(() => {
        console.log('[ANDROID PLAYER] doing seekTime to 3', seekTime);
        this.seek(seekTime);
      }, 1000);
    }
  }

  async tryOnFirstTimeshiftSeek(currentTry, timeshiftData) {
    let curTime = this.getCurrentTime();
    console.log('[ANDROID PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + '], curTime: ' + curTime);
    if(isNaN(curTime)) {
      curTime = 0;
    }
    if(curTime <= 0) {
      console.log('[ANDROID PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitFirstPlaying) {
        throw new Error('Fail to get playing state');
        console.log('[ANDROID PLAYER]> Error, Fail to get playing state');
        return;
      }
      await Utils.sleep(this.retryIntervalFirstPlaying);

      return this.tryOnFirstTimeshiftSeek(++currentTry, timeshiftData);
    }
    else {
      this.seekWindow = {
        startTime: 1, // & seconds, its enough to protect player ¿?
        // 1.- Parece que Kaon y huawei regresan duration = maxtimeshiftallowed
        // 2.- coship, creo regresa el dato en currenttime
        // Validar 1 y 2
        endTime: this.getDuration() > 0 ? this.getDuration() : 0,
        duration: this.getDuration(),
        lastseek: null
      };
      console.log('[ANDROID PLAYER]> yendo a seekTimeshift, getDuration, currentTime ', this.getDuration(), this.getCurrentTime(), this.seekWindow);

      return this.seekTimeshift(timeshiftData, false);
    }
  }

  seek(seconds) {
    this.isSeek = true;
    this.skip(seconds);
  }

  skip(seconds) {
    let boundaryTime = 1;
    let positionCommandData = {};

    /*
    positionCommandData = {
      whence: window.AndroidPlayerInterface.SEEK_SET,
      type: window.AndroidPlayerInterface.POSITION_TYPE_TIME_BASED,
      timePosition: Math.floor(seconds * 1000)
    };
    */
    const timePosition = Math.floor(seconds * 1000)

    console.log("[AndroidPlayer] seekTo> " + seconds);
    window.AndroidPlayerInterface.seekTo(timePosition);
  }

  destroy() {
    console.log('[AndroidPlayer] Destroy called',
      '\nisPrepared', this._isPrepared,
      '\ncanStop: ', this.canStopPlayer,
      '\noptions: ', this.options,
      '\ncurrentPlayerMedia: ', this.currentPlayerMedia);

    if (!this._isPrepared){
      console.log('[AndroidPlayer] NOT PREPARED so WAIT');
      return;
    }

    /*
    if(this.streamIsAudio())
      return super.destroy();
    */

    this.stopAndQuit();

    // remove listeners before destroy instance player
    this.removeEventsListener();

    this.isMediaLoaded = false;

    //window.AndroidPlayerInterface = null;
    this.android_media_src = null;

    this._duration = 0;
    this.currentContentTime = 0;
    this.seek_resume = 0;
    this.src = null;

    this.currentTime = 0;
    this.seekWindow = null;

    if(this.styleBackup !== null){
      let root = document.getElementById("root");
      root.style.background = this.styleBackup.background;
      root.style.backgroundColor = this.styleBackup.backgroundColor;
      root.style.backgroundImage = this.styleBackup.backgroundImage;
    }

    this.resetTimeUpdate();

    //Destroy Playback Container
    if (this._playerContainer) {
      if(this._playerHTMLTag && this._playerHTMLTag.parentNode) {
        this._playerHTMLTag.parentNode.removeChild(this._playerHTMLTag);
      }
      let vWrapper = document.getElementById(this.options.parentWrapper.id);
      vWrapper.removeChild(this._playerContainer);
      this._playerContainer = null;
      this._playerHTMLTag = null;
    }

    this._isPrepared = false;

    this.fireOnDurationChange = false;

    // Call to the parent...
    this.setPlayerBackground(null);

    this.previousPlayerState = PONCONNECT;
    this.currentPlayerState = PONCONNECT;
    this.timeshift = null;

    return;
  }

  itsSameMedia(){
    if(this.currentPlayerMedia !== null
      && this.currentPlayerMedia.src === this.options.src && this.currentPlayerMedia.streamType === this.options.streamType){
      return true;
    }
    else{
      return false;
    }
  }

  stopAndQuit(){
    console.log('[AndroidPlayer] StopAndQuit CALLED');

    if(this.options.isPip){
      try{
        window.AndroidPlayerInterface.stopMiniPlayer();
        console.log('[AndroidPlayer] StopAndQuit PIP OK');
      }
      catch (error){
        console.log('[AndroidPlayer] StopAndQuit PIP ERROR');
      }
    }
    else{

      try{
        window.AndroidPlayerInterface.stopFullPlayer();
        console.log('[AndroidPlayer] StopAndQuit FULL OK');
      }
      catch (error){
        console.log('[AndroidPlayer] StopAndQuit FULL ERROR');
      }
    }
  }

  setPlayerFull() {
    this.setPlayerSize(0, 0, 1280, 720);
    // TODO check if we need a pause on player, and object ¿?
    // this.sefPlugin.style.position = "relative or fixed ¿?";
  }

  setPlayerSize(top, left, width, height) {
    console.log('[AndroidPlayer.setPlayerSize] ',
      "\ntop", top,
      "\nleft", left,
      "\nwidth", width,
      "\nheight", height);

    if(this._playerContainer) {
      this._playerContainer.style.top = top + 'px';
      this._playerContainer.style.left = left + 'px';
      this._playerContainer.style.width = width + 'px';
      this._playerContainer.style.height = height + 'px';
      this._playerContainer.style.position = "relative";

      this._playerContainer.className = "androidPlayerContainer"; // We dont use this css...at this moment
    }

    try{
      window.AndroidPlayerInterface.setPlayerSize(width, height, top, left);
    }
    catch (error){

    }

    return this.setPlayerResolution(top, left, width, height);
  }

  setPlayerResolution(top, left, width, height) {
    return;
  }

  addEventsListeners() {
    console.log('[AndroidPlayer] addEventsListeners');

    //console.log(window.AndroidPlayerInterface);
    // Bind first
    this._toBindOnLoad = this._onLoad.bind(this);
    this._toBindOnWaiting = this._onWaiting.bind(this);
    this._toBindOnWaiting = this._onWaiting.bind(this);
    this._toBindOnPlaying = this._onPlaying.bind(this);
    this._toBindOnError = this._onError.bind(this);
    this._toBindOnFinished = this._onFinished.bind(this);
    this._toBindOnCanPlay = this._onCanPlay.bind(this);
    this._toBindOnStreamStarted = this._onStreamStarted.bind(this);
    this._toBindOnBuffering = this._onBuffering.bind(this);
    this._toBindOnLoad = this._onPlayReady.bind(this);
    this._toBindAndroidEvent = this.onAndroidEvent.bind(this);

    // Add Android listeners
    this.rootElement.addEventListener("AndroidEvent", this._toBindAndroidEvent);


  }

  removeEventsListener() {
    console.log('[AndroidPlayer] removeEventsListener');

    if(this.rootElement){
      // Remove Android listeners
      this.rootElement.removeEventListener("AndroidEvent", this._toBindAndroidEvent);
    }

  }

  onAndroidEvent(e) {

    console.log('[AndroidPlayer.onAndroidEvent]', e);

    const event_data = e.detail;
    const event = event_data.event;
    const param = event_data.param;
    switch (event) {
      case 'onLoad':
        if(this.isNewSource){
          this.playNewSource();
        }
        else{
          this.play();
        }
        this._onLoad(param);
        break;
      case 'onError':
        if(param === "Request playlist fail"){
          this._onStreamError(param);
        }
        else{
          this._onError(param);
        }
        break;
      case 'onWaiting':
        this._onWaiting(param);
        break;
      case 'onProgress':
        const value1 = Number.parseInt(param);
        if(value1 >= 0){
          this._onTimeUpdate(param);
        }
        break;
      case 'onBuffering':
        console.log('[AndroidPlayer] onAndroidEvent onBuffering', param);
        this._onBuffering(param);
        break;
      case 'onPlaying':
        this._onPlaying(param);
        break;
      case 'onEnded':
        this._onFinished(param);
        break;
      case 'onReady':
        this.androidPlayerReady = true;
        this.androidOnReady = true;
        break;
      case 'onDurationchange':
        const value2 = Number.parseInt(param);
        if(value2 >= 0){
          this._onDurationChange(param);
        }
        break;
      case 'onSeek':
        this._onSeek(param);
        break;
      default:
        break;
    }

  }

  _onBufferingStart () {
    this.onPlayerStateBuffer();
    if(this.options.events.onBufferingStart) {
      console.log('Dispatch onBufferingStart ==================> ');
      this.options.events.onBufferingStart();
    }
  }

  _onBufferingFinish () {
    // Prevents android to resume when finish buffering
    if(this.getCurrentPlayerState() === PONPAUSE && this.currentContentTimeOnPause !== null) {
      //window.AndroidPlayerInterface.pause();
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
      console.log('[AndroidPlayer] onBufferingFinish');
      this.options.events.onBufferingFinish();
    }
  }

  _onStreamError(param){
    console.log('[AndroidPlayer] _onStreamError', param);
    let videoOptions = this.options;
    const isMini = videoOptions.isPip;
    const groupId = Number.parseInt(videoOptions.groupId);
    const isTrailer = videoOptions.isTrailer;
    const isLive = videoOptions.isLive;

    let streamType = isLive ? "hls" : "smooth_streaming";

    this.requestPlayerGetMedia(groupId, null, isTrailer, streamType).then(
      (response) => {
        console.log('[AndroidPlayer] onLoadRequestMedia-RELOAD', response);
        if(response !== null) {

          if(isLive){
            this.android_media_src = response.media.video_url;
            window.AndroidPlayerInterface.loadMediaUrl(this.android_media_src);
            console.log('[AndroidPlayer] load URL @ FULL LIVE TV OK');
          }
          else{
            var playerMediaRes = JSON.stringify(response);
            window.AndroidPlayerInterface.setPlayerMedia(groupId, 0, isLive, isTrailer, false, playerMediaRes);
            console.log('[AndroidPlayer] load URL @ FULL VOD OK');
          }

          if(!isMini){
            this.isMediaLoaded = true;
            this.removeBackgroundAndStyle();
            this.isTvRunning = true;
            this.canStopPlayer = true;
          }
          else{
            this.isMediaLoaded = true;
            this.removeBackgroundAndStyle();
            this.isTvRunning = true;
            this.canStopPlayer = true;
          }
        }
        else {
          this.destroy();
        }
      });
  }

  /*
   *   ALL EVENTS;
   */
  _onError(e) {
    console.log('[AndroidPlayer] _onError', e);

    let params = JSON.parse(e);
    let evtType = params.type;
    let error_code = params.description;

    if(this.options.events.onError) {
      this.options.events.onError('[' + error_code + ']' + evtType);
    }
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getDuration() {
    return this._duration;
  }

  setDuration() {
    this._duration = Math.floor(window.AndroidPlayerInterface.getDuration()) / 1000; // If it is live content, duration will be 0
    console.log('[AndroidPlayer] content duration: ' + this._duration);
  }

  doVideoResume() {

    console.log('[AndroidPlayer] sending resume to: ' + (this.seek_resume * 1000));
    if (this.seek_resume <= 0) {
      return;
    }

    console.log('[AndroidPlayer] sending resume to: ' + (this.seek_resume * 1000));
    let rpos = window.AndroidPlayerInterface.setPosition( this.seek_resume * 1000 );
    console.log(rpos);

    // Check on devices if we will require a delay here...
    this.seek_resume = 0;
  }

  /* Events */
  _onPlayReady() {
    console.log('[AndroidPlayer] _onPlayReady');
    this.androidPlayerReady = true;
  }

  _onVideoDetailsChanged(e) {
    console.log('[AndroidPlayer] _onVideoDetailsChanged', e);
  }

  _onLoad(e) {
    // Please sure this method in android must be call once time!
    console.log('[AndroidPlayer] _onLoad', e);
    this._isOnLoaded = true;
    this.androidPlayerReady = true;
    this.canStopPlayer = true;
    //this.options = this.currentPlayerMedia;

    if(this.options.events.onLoad) {
      this.options.events.onLoad(e);
    }
  }

  _onCanPlay(e) {
    console.log('[AndroidPlayer] _onCanPlay', e);
    //console.log(window.AndroidPlayerInterface);
    //this.options = this.currentPlayerMedia;
    this.canStopPlayer = true;

    if(this.options.events.onCanPlay) {
      this.options.events.onCanPlay(e);
    }
    this.timeshift && setTimeout(() => {
      this.skip(0);
    }, 500);
  }

  _onStreamStarted(e) {
    console.log('[AndroidPlayer] _onStreamStarted', e);

    // Content duration is available at this point...
    this.setDuration();

    // Fire on duration change ... and then calculate rolling credits time
    if(this.options.events.onDurationChange && !this.fireOnDurationChange) {
      this.options.events.onDurationChange(e);
      this.fireOnDurationChange = !this.fireOnDurationChange; // only send event once
    }

    // TODO disabled for the moment...time update
    this.createTimeUpdate();
  }

  _onWaiting(e) {
    console.log('[AndroidPlayer] _onWaiting');
    console.log(e);
    if(this.options.events.onWaiting) {
      this.options.events.onWaiting();
    }
  }

  _onTimeUpdate(currentTime) {
    console.log('[androidPLAYER] antes', currentTime);
    this.currentTime = Math.floor(currentTime / 1000);
    if(this.options.events.onTimeUpdate && this.getCurrentPlayerState() !== PONPAUSE) {
      console.log('[androidPLAYER] _onTimeUpdate', currentTime);
      this.options.events.onTimeUpdate(this.currentTime);
    }

    this.canStopPlayer = true;
  }

  _onPlaying(e) {
    console.log('[AndroidPlayer] _onPlaying', e);
    if(this.options.events.onPlaying) {
      this.options.events.onPlaying();
    }
  }

  _onBuffering(evt) {

    console.log('[AndroidPlayer] _onBuffering ==>> description:', evt);

    if(evt === "start") {
      this.onPlayerStateBuffer();
      if(this.options.events.onBufferingStart) {
        if(!this.firstLoad
          || this.options.audiosubtitleinfo.optionId !== this.previousAudio
          || this.isSeek
          || this.options.groupId !== this.previousGroupId
        ) {
          this.isBufferingStart = true;
          console.log('Dispatch onBufferingStart ==================> ');
          this.options.events.onBufferingStart(evt);
        }
      }
    }

    if(evt === "end") {

      // Prevents android to resume when finish buffering
      if(this.getCurrentPlayerState() === PONPAUSE && this.currentContentTimeOnPause !== null) {
        //window.AndroidPlayerInterface.pause();
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
        if(!this.firstLoad
          || this.options.audiosubtitleinfo.optionId !== this.previousAudio
          || this.isSeek
          || this.options.groupId !== this.previousGroupId
          || this.isBufferingStart
        ) {
          this.options.events.onBufferingFinish(evt);
          this.isBufferingStart = false;
        }
      }

      if(this.androidOnReady){
        this.androidOnReady=false;
        this._onCanPlay(true);
      }
    }

    this.previousAudio = this.options.audiosubtitleinfo.optionId;
    this.previousGroupId = this.options.groupId;
    this.isSeek = false;
    this.firstLoad = true;
  }

  _onFinished(e) {
    // Do destroy to reinit player next play
    this.destroy();

    console.log('[AndroidPlayer] _onFinished');
    console.log(e);
    if(this.options.events.onFinished) {
      this.options.events.onFinished(e);
    }
  }

  _onDurationChange(time) {

    console.log('[AndroidPlayer] _onDurationChange', time);
    this._duration = Math.floor(time / 1000);
    if(this.options.events.onDurationChange) {
      this.options.events.onDurationChange();
    }
  }

  _onSeek(time){
    if(this.options.events.onBookMark) {
      console.log('Dispatch onBookMark ==================> ');
      this.options.events.onBookMark(time);
    }

  }

  getErrorReason(reason_code) {

    let reason = 'Unknow reason';
    switch(reason_code)
    {
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_BAD_LOCATION:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_LOCATION';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_BAD_PARAM:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_PARAM';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_BAD_PARTITION:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_PARTITION';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_BAD_URI:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_URI';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_BLACKED_OUT:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_BLACKED_OUT';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_COPY_PROTECTED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_COPY_PROTECTED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DIALOG_REQUIRED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DIALOG_REQUIRED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_OTHER:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_OTHER';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_ACCESS_PAIRING_REQUIRED:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_ACCESS_PAIRING_REQUIRED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CA_NO_VALID_SECURE_DEVICE:
        reason = 'CONTENT_PLAY_FAILED_REASON_CA_NO_VALID_SECURE_DEVICE';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_CONFLICT:
        reason = 'CONTENT_PLAY_FAILED_REASON_CONFLICT';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_DUPLICATE_URI:
        reason = 'CONTENT_PLAY_FAILED_REASON_DUPLICATE_URI';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_GENERIC:
        reason = 'CONTENT_PLAY_FAILED_REASON_GENERIC';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_INTERNAL_ERROR:
        reason = 'CONTENT_PLAY_FAILED_REASON_INTERNAL_ERROR';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE:
        reason = 'CONTENT_PLAY_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_LACK_OF_RESOURCES:
        reason = 'CONTENT_PLAY_FAILED_REASON_LACK_OF_RESOURCES';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_NOT_SUPPORTED:
        reason = 'CONTENT_PLAY_FAILED_REASON_NOT_SUPPORTED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_NO_LNB:
        reason = 'CONTENT_PLAY_FAILED_REASON_NO_LNB';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_NO_LOCK:
        reason = 'CONTENT_PLAY_FAILED_REASON_NO_LOCK';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_OUT_OF_MEMORY:
        reason = 'CONTENT_PLAY_FAILED_REASON_OUT_OF_MEMORY';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_OVERRIDDEN_BY_NEW_REQUEST:
        reason = 'CONTENT_PLAY_FAILED_REASON_OVERRIDDEN_BY_NEW_REQUEST';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_PERMISSION_DENIED:
        reason = 'CONTENT_PLAY_FAILED_REASON_PERMISSION_DENIED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_PLAYER_BUSY:
        reason = 'CONTENT_PLAY_FAILED_REASON_PLAYER_BUSY';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_PMT_UPDATED:
        reason = 'CONTENT_PLAY_FAILED_REASON_PMT_UPDATED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_REQUESTED:
        reason = 'CONTENT_PLAY_FAILED_REASON_REQUESTED';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_RESOURCE_LOST:
        reason = 'CONTENT_PLAY_FAILED_REASON_RESOURCE_LOST';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_BAD_LOCATION:
        reason = 'CONTENT_PLAY_FAILED_REASON_BAD_LOCATION';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_RESOURCE_TRANSITION:
        reason = 'CONTENT_PLAY_FAILED_REASON_RESOURCE_TRANSITION';
        break;
      case window.AndroidPlayerInterface.CONTENT_PLAY_FAILED_REASON_TUNER_ERROR:
        reason = 'CONTENT_PLAY_FAILED_REASON_TUNER_ERROR';
        break;

      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_BLACKED_OUT:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_BLACKED_OUT';
      break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_DENIED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DENIED';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_DENIED_COPY_PROTECTED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DENIED_COPY_PROTECTED';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_DIALOG_REQUIRED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_DIALOG_REQUIRED';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_OTHER:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_OTHER';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_ACCESS_PAIRING_REQUIRED:
        reason = 'STREAM_ERROR_REASON_CA_ACCESS_PAIRING_REQUIRED';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_CA_NO_VALID_SECURE_DEVICE:
        reason = 'STREAM_ERROR_REASON_CA_NO_VALID_SECURE_DEVICE';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_DISK_ERROR:
        reason = 'STREAM_ERROR_REASON_DISK_ERROR';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_DISK_REMOVED:
        reason = 'STREAM_ERROR_REASON_DISK_REMOVED';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_GENERIC:
        reason = 'STREAM_ERROR_REASON_GENERIC';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_INVALID_PLAY_SESSION_HANDLE:
        reason = 'STREAM_ERROR_REASON_INVALID_PLAY_SESSION_HANDLE';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_OVERRIDDEN_BY_NEW_REQUEST:
        reason = 'STREAM_ERROR_REASON_OVERRIDDEN_BY_NEW_REQUEST';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_RESOURCES_LOST:
        reason = 'STREAM_ERROR_REASON_RESOURCES_LOST';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_SIGNAL_LOSS:
        reason = 'STREAM_ERROR_REASON_SIGNAL_LOSS';
        break;
      case window.AndroidPlayerInterface.STREAM_ERROR_REASON_STREAM_LIST_CHANGED:
        reason = 'STREAM_ERROR_REASON_STREAM_LIST_CHANGED';
        break;
      case window.AndroidPlayerInterface.CONTENT_STOP_FAILED_REASON_ALREADY_STOPPED:
        reason = 'CONTENT_STOP_FAILED_REASON_ALREADY_STOPPED';
        break;
      case window.AndroidPlayerInterface.CONTENT_STOP_FAILED_REASON_GENERIC:
        reason = 'CONTENT_STOP_FAILED_REASON_GENERIC';
        break;
      case window.AndroidPlayerInterface.CONTENT_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE:
        reason = 'CONTENT_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE';
        break;
      case window.AndroidPlayerInterface.CONTENT_STOP_FAILED_REASON_PERMISSION_DENIED:
        reason = 'CONTENT_STOP_FAILED_REASON_PERMISSION_DENIED';
        break;
      case window.AndroidPlayerInterface.STREAM_STOP_FAILED_REASON_ALREADY_STOPPED:
        reason = 'STREAM_STOP_FAILED_REASON_ALREADY_STOPPED';
        break;
      case window.AndroidPlayerInterface.STREAM_STOP_FAILED_REASON_BAD_PARAM:
        reason = 'STREAM_STOP_FAILED_REASON_BAD_PARAM';
        break;
      case window.AndroidPlayerInterface.STREAM_STOP_FAILED_REASON_BAD_REQUEST:
        reason = 'STREAM_STOP_FAILED_REASON_BAD_REQUEST';
        break;
      case window.AndroidPlayerInterface.STREAM_STOP_FAILED_REASON_BUSY:
        reason = 'STREAM_STOP_FAILED_REASON_BUSY';
        break;
      case window.AndroidPlayerInterface.STREAM_STOP_FAILED_REASON_INACTIVE:
        reason = 'STREAM_STOP_FAILED_REASON_INACTIVE';
        break;
      case window.AndroidPlayerInterface.STREAM_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE:
        reason = 'STREAM_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE';
        break;
      case window.AndroidPlayerInterface.STREAM_STOP_FAILED_REASON_PERMISSION_DENIED:
        reason = 'STREAM_STOP_FAILED_REASON_PERMISSION_DENIED';
        break;


      default:
      break;

      }
      console.log('[AndroidPlayer] error reason', reason);

    return reason;
  }

  /* END Events */

  /* MULTIPLE AUDIOTRACKS */
  async tryGetAudioTracks(currentTry) {
    console.log('[AndroidPlayer] tryToGetAudioTracks');
    let curTime = this.getCurrentTime();
    if(isNaN(curTime)) {
      curTime = 0;
    }

    if(curTime < 1) {
      console.log('[AndroidPlayer] tryGetAudioTracks retry ', currentTry);
      if(currentTry >= this.retryLimitAudioTrack) {
        throw new Error('Fail to get audioTracks');
        console.log('[AndroidPlayer] tryGetAudioTracks err');
        return;
      }
      await Utils.sleep(this.retryIntervalAudioTrack);

      return this.tryGetAudioTracks(++currentTry);
    }
    else {
      console.log('[AndroidPlayer] tryToGetAudioTracks retry number: [' +  currentTry + '] audioTracks READY');

      return this.getAudioTracks();
    }
  }

  getAudioTracks() {
    let curTime = this.getCurrentTime();
    if(isNaN(curTime)) {
      curTime = 0;
    }

    console.info("[AndroidPlayer] ", curTime);
    //if(!this._isOnLoaded) {
    if(curTime < 1) {
      console.info("[AndroidPlayer] Delay 1s to get the audio track info again");
      // ...Start recursive...
      return this.tryGetAudioTracks(1);
    }

    return new Promise((resolve) => {
      this.audioTracks = []; // ANDROID does not return info of audioTracks
      resolve(this.audioTracks);
    });
  }

  // @codeTrack iso id i.e.: esp, eng, por, ori
  setAudioTrack(codeTrack) {

    return new Promise((resolve, reject) => {
      console.log('[AndroidPlayer] Enter audioTrack');
      if(this.currentAudioTrackIndex === codeTrack)  {
        console.info('[AndroidPlayer] Same audioTrack, nothing to do');
        resolve(true);
      }
      this.currentAudioTrackIndex = codeTrack;
      try {
        console.info('[AndroidPlayer] change audioTrack', codeTrack);
        window.AndroidPlayerInterface.changeSubs(codeTrack, "0");
      }
      catch(e) {
        console.log('[AndroidPlayer] error when change lang', codeTrack);
        reject('[AndroidPlayer] error when change lang');
      }
      resolve(true);
    });
  }
  /* END MULTIPLE AUDIOTRACKS */
}

export default AndroidPlayer;
