import TrackerManager from '../../utils/TrackerManager';

import AkamaiTracker from "../../utils/trackers/AkamaiTracker";
import PlayerTracker from "../../utils/trackers/PlayerTracker";
import settings from '../../devices/all/settings';
import m from 'moment';
import { playerGetMedia } from '../../requests/loader';

import { NOT_PLAYING } from '../../utils/playerConstants';
import PlayerStates from '../../utils/PlayerStates';

import { playFullMedia, playPipMedia } from '../../actions/playmedia';
import store from './../../store';
import * as playerConstant from '../../utils/playerConstants';
import { configSetupPlay, showModalSinglePlay } from '../../actions/musica/player-shared-action-creators';
import MusicUtils from "../../actions/musica/music-actions";
import Device from "../device";
import { isPreviewSong, sendMetricsMusicaStarted} from '../../actions/musica/player-shared-action-creators';
import storage from "../../components/DeviceStorage/DeviceStorage";
import Metadata from '../../requests/apa/Metadata';

class PlayerMiddleware {

  constructor(callbacks) {
    this.player = null;
    this.device = Device.getDevice().getPlatform();
    this.player = Device.getDevice().getPlayer();
    this.audioTracks = [];
    this.audioTracksLoaded = false;
    this.playerOptions = null;
    this.creditsTime = null;
    this.isEndPlayer = false;
    this.timeShift = null;

    this.events = {};
    this.bindEvents();

    this.pause = this.pause.bind(this);
    this.play = this.play.bind(this);
    this.resume = this.resume.bind(this);
    this.skip = this.skip.bind(this);
    this.seek = this.seek.bind(this);
    this.getDuration = this.getDuration.bind(this);
    this.getCurrentTime = this.getCurrentTime.bind(this);

    this.resetPlayerReplace = this.resetPlayerReplace.bind(this);
    this.setAudioTrack = this.setAudioTrack.bind(this);


    this.callbacks = callbacks;
     this.getTrackerManager();
    this.trackerManager =TrackerManager;
  }

  getTrackerManager() {
    const akamaiTrackerCallbacks = {
      streamUrl: () => this.playerOptions.src,
      streamLength: this.getDuration,
      streamHeadPosition: this.getCurrentTime,
    };

    const playerTrackerCallbacks = {
      curtime: this.getCurrentTime,
    };

    const akamaiTracker = new AkamaiTracker(akamaiTrackerCallbacks);
    const playerTracker = new PlayerTracker(playerTrackerCallbacks);

    // GOOSE -- HACK -- dashboardTracker no se usa
    // const dashboardTracker = new DashboardTracker();

    // return new TrackerManager([  akamaiTracker, playerTracker, dashboardTracker ]);
    return new TrackerManager([  akamaiTracker, playerTracker ]);
  }

  resetPlayerReplace() {
    return;
    console.log('[PlayerMiddleware] resetPlayerReplace');
    if(this.playerOptions && this.playerOptions.newSource) {
      this.playerOptions.newSource = null;
    }
    if(this.player.options && this.player.options.newSource) {
      this.player.options.newSource = null;
    }
  }

  deinit() {
    return;
    console.log("[PlayerMiddleware] deinit");
    if(this.playerOptions && this.playerOptions.newSource && this.playerOptions.newSource.src) {
      console.log('[PlayerMiddleware] resetPlayerReplace destroy');
      this.player.destroy(); // When a replace only destroy what player need to destroy (only timeudpate from nagra for example)
      return;
    }

    try{
      if(this.playerOptions){
        if(this.playerOptions.streamType === playerConstant.AUDIO && this.getCurrentTime() != 0){
            store.dispatch(sendMetricsMusicaStarted(this.getCurrentTime()));
        }
      }
    } catch(e) { /****/ }

    // If comes from first-time play...follwo normal path
    this.audioTracksLoaded = false;
    this.audioTracks = [];
    this.playerOptions = null;
    this.creditsTime = null;
    this.isEndPlayer = false;

    console.log('[PlayerMiddleware] resetPlayerReplace destroy');
    this.player.destroy();
  }

  createMedia(options) {
    return;
    // player get media access
    console.log('[PlayerMiddleware] createMedia');
    console.log(options);

    // Set events to pass to device
    options.events = this.events;
    //this.deinit();

    // newSource only from replace
    if(options.newSource && options.newSource.src) {
      options.newSource = null;
    }

    this.playerOptions = options;
    this.player.createMedia(options);
    if(options.streamType === "audio") {
      store.dispatch(configSetupPlay())
    }
    console.log('[PlayerMiddleware] createMedia end');
  }

  setPlayerFull() {
    this.player.setPlayerFull();
  }

  setPlayerSize(top, left, width, height) {
    console.info('[PlayerMiddleware] setPlayerSize');
    this.player.setPlayerSize(top, left, width, height);
  }

  loadMedia() {
    return;
    console.log('[PlayerMiddleware] loadMedia');
    this.player.loadMedia();
  }

  bindEvents() {
    this.events.onLoad = this.onLoadeddata.bind(this);
    this.events.onError = this.onError.bind(this);
    this.events.onWaiting = this.onWaiting.bind(this);
    this.events.onTimeUpdate = this.onProgress.bind(this);
    this.events.onPlaying = this.onPlaying.bind(this);
    this.events.onFinished = this.onEnded.bind(this);
    this.events.onCanPlay = this.onCanplay.bind(this);
    this.events.onDurationChange =  this.onDurationchange.bind(this);
    this.events.onBufferingStart = this.onBufferingStart.bind(this);
    this.events.onBufferingProgress = this.onBufferingProgress.bind(this);
    this.events.onBufferingFinish = this.onBufferingFinish.bind(this);

    /*
      this.events.onBindedError = this.onError.bind(this)
      this.events.onBindedCanplay = this.onCanplay.bind(this)
      this.events.onBindedLoadedmetadata = this.onLoadedmetadata.bind(this)
      this.events.onBindedTimeupdate = this.onTimeupdate.bind(this)
      this.events.onBindedPause = this.onPause.bind(this)
      this.events.onBindedPlaying = this.onPlaying.bind(this)
      this.events.onBindedVolumechange = this.onVolumechange.bind(this)
      this.events.onBindedLoadstart = this.onLoadstart.bind(this)
      this.events.onBindedLoadeddata = this.onLoadeddata.bind(this)
      this.events.onBindedEnded = this.onEnded.bind(this)
      this.events.onBindedEmptied = this.onEmptied.bind(this)
      this.events.onBindedStalled = this.onStalled.bind(this)
      this.events.onBindedWaiting = this.onWaiting.bind(this)
      this.events.onBindedProgress = this.onProgress.bind(this)
      this.events.onBindedDurationchange = this.onDurationchange.bind(this)
      this.events.onBindedCanplaythrough = this.onCanplaythrough.bind(this)
      */
  }

  /*

  */
  onError(errorMessage = null, errorCode = null) {

    let composeError = errorMessage;
    if(errorCode) {
      composeError = '[' + errorCode + '] ' + errorMessage;
    }

    TrackerManager.error(composeError, this.getCurrentTime(), this.playerOptions.streamType);
    console.log(' PlayerMiddleware player onError> t', errorMessage, errorCode);

    //Check error for check if isPurchasable
    //TODO se comenta por tener comportamiento inesperado en cajas sin escanear.
    /*if ( this.device === 'nagra' && evt.indexOf('CONTENT_ERROR_REASON_CA_ACCESS_DENIED') ) {
      this.ppeErrorEvent = new Event('PPE_Event', { detail: '' });
      this.ppeErrorEvent.detail = evt;
      document.dispatchEvent(this.ppeErrorEvent);
    }*/
    // evt es un string, con la desc del error
    if(this.callbacks.onPlayerError) {
      this.callbacks.onPlayerError(errorMessage, errorCode);
    }
  }

  onCanplay(evt = null) {
      console.log('Playercontrols PlayerMiddleware onCanplay');
      if (this.callbacks.onCanPlay && typeof this.callbacks.onCanPlay === 'function') {
        this.callbacks.onCanPlay(evt);
      }

      if(this.playerOptions.streamType === playerConstant.AUDIO) {
        this.callbacks.onPlayingSong();
      } else if(this.playerOptions.streamType === playerConstant.RADIO){
        this.callbacks.onPlayingRadio();
      }

      console.log('PlayerMiddleware player onCanplay', evt);
  }

  onLoadedmetadata(evt = null) {
      console.log('PlayerMiddleware player onLoadedmetadata', evt);
  }

  onPause(evt = null) {
    console.log('PlayerMiddleware player onPause', evt);
  }

  onPlaying(evt = null) {
    console.log('>>>PlayerMiddleware player onPlaying', evt);
    //this.callbacks.clearLoading();
  }

  onVolumechange(evt = null) {
      console.log('PlayerMiddleware player onVolumechange', evt);
  }

  onLoadstart(evt = null) {
      this.callbacks.setLoading();
      console.log('PlayerMiddleware player onLoadstart', evt);
      console.log('Sea live sea vod SIEMPRE PASARA POR AQUI');
  }

  onLoadeddata(evt = null) {
    console.log('PlayerMiddleware player onLoadeddata', evt);

    if (this.callbacks.onLoad && typeof this.callbacks.onLoad === 'function') {
      console.log('PlayerMiddleware player onLoadeddata SENT', evt);
      this.callbacks.onLoad(evt);
    }

    TrackerManager.startTicking(this.playerOptions.streamType);

    // INICIO DASHBOARD
    // Falta la secuencia de los buffers y sigue el start.
    TrackerManager.playing();
    console.log('Sea live sea vod SIEMPRE PASARA POR AQUI');
  }

  onEnded(evt = null) {
    console.log('PlayerMiddleware player onEnded', evt);
    // Update state of players to 'not playing' when content reached end of the content (or back key)
    if(this.playerOptions.streamType === playerConstant.AUDIO) {
      const state = store.getState();
      console.log(state); // check single play from music utils
      const user = state.user.musicUser;

      /*MusicUtils.checkSinglePlay(user).then((singlePlayResponse) => {
        if(!singlePlayResponse.status){
          store.dispatch(showModalSinglePlay());
          return false;
        } else { this.callbacks.onFinishSong();}
      }).catch(err => {
        this.callbacks.onFinishSong();
      });*/


    } else {
      // TODO check reset en player (onfinish event)
      TrackerManager.end(null, this.playerOptions.streamType);
      TrackerManager.stopTicking(this.playerOptions.streamType);
      this.callbacks.onEnded();
    }
  }

  onEmptied(evt = null) {
      console.log('PlayerMiddleware player onEmptied', evt);
  }

  onStalled(evt = null) {
      console.log('PlayerMiddleware player onStalled', evt);
  }

  onWaiting(evt = null) {
    console.log('PlayerMiddleware player onWaiting', evt);
  }

  onProgress(currentTime) {
    if(this.playerOptions.isPip)
      console.log('[TIMEUPDATE] creditsTime: ' + this.creditsTime + ', currentTime: ' + currentTime + ', totalDuration: ' + this.getDuration());
    this.isEndScreen(currentTime);
    if (this.callbacks.onProgress && typeof this.callbacks.onProgress === 'function') {
      this.callbacks.onProgress(currentTime);
    }
  }

  onDurationchange(evt = null) {
    // If VOD, calculate finplayer
    this.creditsTime = this.getRollingCreditsTime();
    if (this.callbacks.onDurationChange && typeof this.callbacks.onDurationChange === 'function') {
      this.callbacks.onDurationChange(this.getDuration());
    }
    console.log('PlayerMiddleware onDurationchange creditsTime: ' + this.creditsTime);
    console.log('PlayerMiddleware player onDurationchange', evt);
  }

  onCanplaythrough(evt = null) {
      //console.log('External player onCanplaythrough', evt);
  }

  onBufferingStart(evt = null) {

    if (this.callbacks.onBufferingStart) {
      this.callbacks.onBufferingStart(evt);
    }
    //console.log('PlayerMiddleware player onBufferingStart', evt);
    this.trackerManager.bufferStart(this.getCurrentTime(), this.playerOptions.streamType);
  }

  onBufferingProgress(evt = null) {
    console.log('PlayerMiddleware player onBufferingProgress', evt);
  }

  onBufferingFinish(evt = null) {
    //(this.playerOptions.streamType);
    console.log('PlayerMiddleware player onBufferingFinish', evt);
    this.trackerManager.bufferEnd(this.getCurrentTime(), this.playerOptions.streamType);
  }

  setListenners() {
    if(this.player.setExternalListener) {
      this.player.setExternalListener(this.events);
    }
     // this.player.setListenners();
  }

  unSetlisteners() {
    this.player.unSetlisteners();
  }

  async performTimeShift() {
    try {
      const { streamType, groupId } = this.playerOptions;
      const pgm = await playerGetMedia(
        groupId,
        null, //contentId
        false, //isTrailer
        streamType,
        this.timeShift,
      );
      const { video_url, server_url, challenge } = pgm.media;
      const options = Object.assign({}, this.playerOptions);
      options.src = video_url;
      options.server_url = server_url;
      options.challenge = challenge;
      this.createMedia(options);
      this.loadMedia();
      this.play();
    } catch (error) {
      console.log('[PlayerMiddleware] ERROR ON TIMESHIFT', error);
    }
  }

  replaceMediaSource(newSource) {
    // Replace current properties ?
    if(this.playerOptions) {
      this.playerOptions.newSource = newSource;
      this.playerOptions.src = newSource.src;
      this.playerOptions.drmInfo = newSource.drmInfo;
      this.playerOptions.isLive = newSource.isLive;
      this.playerOptions.streamType = newSource.streamType;
      this.playerOptions.resume = newSource.resume;
    }
    // Reset tracks
    this.audioTracks = [];
    this.audioTracksLoaded = false;

    this.player.replaceMediaSource(newSource);
  }

  pause(timeshiftAllowed) {
    this.player.pause();
    if(this.playerOptions.streamType !== playerConstant.AUDIO && this.playerOptions.streamType !== playerConstant.RADIO) {
      if (this.playerOptions.isLive && timeshiftAllowed) {
        this.timeShift = m().format("YYYY/MM/DD hh:mm:ss");
      }
      TrackerManager.pause(this.getCurrentTime(),this.playerOptions.streamType);
    }
  }

  play() {
    console.log('[PlayerMiddleware] play start ');
    try {
      this.player.play();
      //this.trackerManager.playing();
      /*
      // Only for test:
      setTimeout( () => {
        this.setAudioTrack('spa');
      }, 10000);

      setTimeout( () => {
        this.setAudioTrack('por');
      }, 20000);
      */
    }
    catch(e) {
      console.error('[PlayerMiddleware] play failed: ' + e);
    }
  }

  stop() {
      this.player.stop();
      // this.trackerManager.stop(this.getCurrentTime(), this.playerOptions.streamType);
    TrackerManager.stopTicking(this.getCurrentTime(), this.playerOptions.streamType);
  }

  playerGetMedia(time){
     // this.trackerManager.playerGetMedia(time)
  }

  resume() {
    console.log('player middleware handleNetworkDisconnection resume');
    if (this.playerOptions.isLive && this.timeShift) {
      this.performTimeShift();
    } else {
      this.player.resume();
    }
    // I've removed the play from here with the main purpose to get the correct secuence... I really do NOT  understand all the code & We're on the clock.
    TrackerManager.resume(this.getCurrentTime(), this.playerOptions.streamType);
  }

  skip(seconds) {
    this.player.seek(seconds);
  }

  handleTimeShiftOnSeek(seconds) {
    if (!this.timeShift || !isNaN(this.timeShift)) {
      this.timeShift = m().unix();
    }
    const safeTime=this.getSafeTime();
    this.timeShift += seconds + safeTime;
    const _this = this;
    if (this.waitingSeek) clearTimeout(this.waitingSeek);
    this.waitingSeek = setTimeout(() => {
      const currentTime = m().unix();
      const time = _this.timeShift > currentTime ? currentTime : _this.timeShift;
      _this.timeShift = m.unix(time).format("YYYY/MM/DD hh:mm:ss");
      _this.performTimeShift();
    }, 1000);
  }

  seek(seconds) {

    const seekObject = {
      seek_start: this.getCurrentTime(),
      seek_end: seconds,
      seek_time: seconds - this.getCurrentTime(),
    };


    TrackerManager.seek(seekObject, this.playerOptions.streamType);
    TrackerManager.resume(this.getCurrentTime(), this.playerOptions.streamType);
    let isAudio = this.playerOptions.streamType === playerConstant.AUDIO || this.playerOptions.streamType === playerConstant.RADIO;

    if (this.playerOptions.isLive && !isAudio) {
      this.handleTimeShiftOnSeek(seconds);
    } else {
      this.player.seek(seconds);
    }
    // TODO check for creditsTime (finplayer), maybe when user do a skip, creditstime will be reach...
  }

  getSafeTime(){
    const region= storage.getItem('region');
    let safeTime=Metadata.get('epg_event_safe_time',null);
    if(typeof safeTime !== 'Object') {
      if (safeTime !== 'epg_event_safe_time')
        safeTime = JSON.parse(safeTime);
      else return 0;
    }
    const safeTimeRegionExists = (safeTime[region] && safeTime[region].timeshift);
    if (safeTimeRegionExists)
      return safeTime[region].timeshift.start;
    else {
      const safeTimeDefaultExists = (safeTime['default'] && safeTime['default'].timeshift);
      if (safeTimeDefaultExists)
        return safeTime['default'].timeshift.start;
      else return 0;
    }
  }

  getCurrentTime() {
    if(this.player) {
      return this.player.getCurrentTime();
    }
    return 0;
  }

  getDuration() {
     if(this.playerOptions.streamType == playerConstant.AUDIO && store.dispatch(isPreviewSong())){
       return '30';
     }
      return this.player.getDuration();
  }

  show () {
     this.player.show();
  }

  hide () {
      this.player.hide();
  }

  load(source) {
     this.player.load(source);
  }

  resize(newsize={type:'percent',width:'100',height:'100',top:0,left:0, class:''}) {
     this.player.resize(newsize)
  }

  onNewTime() {
      console.log('new Time', this.currentTime);
  }

  /*
  MULTIPLE AUDIOS
   */

  // No mandar a llamar este método desde aquí, se manda llamar "en automático cuando se intenta settear el audioTrack por primera vez
  getAudioTracks() {
    return this.player.getAudioTracks().then((resp) => {
      console.log('PlayerMiddleware, getAudioTracks: ');
      console.log(resp);
      this.audioTracks = resp;
    }).catch((e) => {
      this.audioTracks = [];
      console.log('PlayerMiddleware Error getAudioTracks: ');
      console.error(e);
    });
  }

  /*
  * @codeTrack i.e.: eng, spa, por, ori, etc... code with three letters...
  */
  setAudioTrack(codeTrack) {
    console.log('@@@@@@@@ setAudioTrack EN MIDDLEWARE 1');
    TrackerManager.audioChange(this.getCurrentTime(), this.playerOptions.streamType);
    if(!this.audioTracksLoaded) {
      this.getAudioTracks().then((resp) => {
        console.log('PlayerMiddleware, firstTime setAudioTrack: ', codeTrack);
        this.audioTracks = resp;
        this.audioTracksLoaded = true;

        return this.player.setAudioTrack(codeTrack);
      }).catch((e) => {
        console.log('[PlayerMiddleware] Error when setAudioTrack: ' + e);
        return new Promise((reject) => {
          reject('[PlayerMiddleware] Cant get audioTracks');
        });
      });
    }
    else {
      console.log('PlayerMiddleware, second or more setAudioTrack');
      return this.player.setAudioTrack(codeTrack);
    }
  }

  /*
  END MULTIPLE AUDIOS
   */

  getRollingCreditsTime() {
    if(this.playerOptions.isLive || this.playerOptions.isTrailer)
      return null;

    // if audio (stream or live ) or image...nothing to do
    if(this.playerOptions.streamType === playerConstant.AUDIO
      || this.playerOptions.streamType === playerConstant.RADIO
      || this.playerOptions.streamType === playerConstant.PLAYERIMAGE ) {
        return null;
      }


    let creditsTime = this.playerOptions.creditsTime;

    console.log('[Playermiddleware] creditsTime from api: ' + this.playerOptions.creditsTime + ', duration: ' + this.getDuration());
    if(!creditsTime)
      creditsTime = settings.rolling_credits_time;

    // resume in seconds or minutes?
    creditsTime = this.getEndTimeToSeconds(creditsTime);

    if(creditsTime && creditsTime < 0) {
      creditsTime = creditsTime + this.getDuration();
    }

     return creditsTime;
   // return 15;
  }

  getEndTimeToSeconds(ctime) {
    console.log('[Playermiddleware] creditsTime @@@@@@@@@@@ from api: ', ctime);

    let creditsTime = ctime.toString();

    if(creditsTime.indexOf(':') !== -1) {
      let ctime2 = creditsTime.split(':');
      ctime = (Number(ctime2[0]) * 60 + Number(ctime2[1])) * 60 + Number(ctime2[2]);
    }
    else {
      ctime = Number(ctime);
    }

    return ctime;
  }

  isEndScreen(currentTime) {
    if(this.playerOptions.isTrailer || this.playerOptions.isLive || this.playerOptions.isPip || this.player.streamIsImage()) {
      this.isEndPlayer = false;
      this.creditsTime = null;
    }
    else {
      if(this.creditsTime === null) {
        this.isEndPlayer = false;
        return;
      }
      else {
        if(this.creditsTime > 0 && currentTime >= this.creditsTime) {
          if(!this.isEndPlayer) {
            TrackerManager.credits(this.getCurrentTime(), this.playerOptions.streamType);
            this.isEndPlayer = true;
            console.log('[PlayerMiddleware] dispatch/fire event finplayer');
            // Remove player background
            this.setPlayerBackground(null);
            document.dispatchEvent(new CustomEvent(settings.end_vod_fire_event, { detail: this.playerOptions }));
            // top, left, width, height
            // this.setPlayerSize(10, 10, 640, 360);
            this.setPlayerSize(
              settings.end_player_position_top,
              settings.end_player_position_left,
              settings.end_player_position_width,
              settings.end_player_position_height,
            );
          }
        }
        else {
          this.isEndPlayer = false;
        }
      }
    }
  }

  setPlayerBackground(src) {
    this.player.setPlayerBackground(src);
  }

  getCurrentPlayerState() {
    return this.player.getCurrentPlayerState();
  }

  setCurrentPlayerState(state) {
    return this.player.setCurrentPlayerState(state);
  }

  /*
  To be called when we reach end of VOD content or when we do a back from videobar controls or back from 'back button' from endPlayer
  To reset player and set state to not playing
  */
  setOnEndPlayerStates() {
    // If we come from a replace, we dont need to send a reset player
    if(this.playerOptions && this.playerOptions.newSource && this.playerOptions.newSource.src) {
      return;
    }

    // ResetPlayer url and state
    let nullPlayer = {src: null, audioSrc: null, imageSrc: null, newSource: null};
    if(this.playerOptions.isPip)
      store.dispatch(playPipMedia(nullPlayer));
    else
      store.dispatch(playFullMedia(nullPlayer));

    /*
    let nextPlayerInfo = {
     isFull: this.playerOptions.isPip ? false : true,
     internalState: NOT_PLAYING // This is the default, but it is not the next state, next state is resolved when we call PlayerStates.resolveNextPlayerState
    }
    // To stop player, src/audioSrc, imageSrc to null
    let nextPlayerState = PlayerStates.resolveNextPlayerState(, store.getState().playerstates, nextPlayerInfo);
    // TODO Check for force stop players ?¿??¿?¿?
    if(nextPlayerState.forcefullstop) {

    }
    if(nextPlayerState.forcepipstop) {

    }

    delete nextPlayerState.forcefullstop;
    delete nextPlayerState.forcepipstop;
    store.dispatch(setPlayerState(nextPlayerState));
    */
  }
}
export default PlayerMiddleware;
