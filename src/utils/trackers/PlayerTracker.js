import store from '../../store';
import PlayerTrackerTask from '../../requests/tasks/trackers/PlayerTrackerTask';
import RequestManager from '../../requests/RequestManager';
import Utils from '../../utils/Utils';


const DEFAULT_TICK_INTERVAL = 60;

class PlayerTracker {

  static trackParams = {
    isLive: false,
    deviceAttachId: null,
    offerId: null,
    purchaseId: null,
  };

  static policies = {
    tickInterval: DEFAULT_TICK_INTERVAL,
  };
  
  static urls = {
    completion: null,
    credits: null,
    dubsubchange: null,
    episodechange: null,
    error: null,
    interval: null,
    pause: null,
    resume: null,
    qualitychange: null,
    seek: null,
    stop: null,
    tick: null,
    timecode: null,
    view: null,
  };

  constructor() {
    this.tickIntervalId = null;
    this.lastEvent=null;
    this.tick = this.tick.bind(this);
  }

  setup(pgm = {}, extraParams = {}) {
    try {
      const { tracking } = pgm.response||pgm;
      PlayerTracker.urls = tracking.urls;
      
      PlayerTracker.policies.tickInterval = tracking.policies.tick_interval;
      // PlayerTracker.trackParams =  this.getTrackParams(extraParams);
      this.lastEvent=null;
    } catch(err) {
      console.warn("PlayerTracker could not get tracking urls or tracking policies", err);
      PlayerTracker.policies.tickInterval = DEFAULT_TICK_INTERVAL;
    }
  }


  setupExtraParams( extraParams = {}) {
    PlayerTracker.trackParams =  this.getTrackParams(extraParams);
  }

  getTrackParams(extraParams) {
    try {
      const { isLive, groupId, deviceAttachId } = extraParams;
      if (isLive) {
        const state = store.getState();
        const linealChannels = state.linealChannels;
        const currentChannel = linealChannels.find(ch => ch.id === groupId);
        return {
          isLive,
          deviceAttachId,
          offerId: currentChannel.offerid,
          purchaseId: currentChannel.purchaseid,
        };
      } else {
        return { isLive }
      }
    } catch(e) {
      console.warn("playertracker error getting track params", e);
    }
  }

  startTicking() {
    console.log("playerTracker startTicking");
    if (this.tickIntervalId) {
      console.log("playerTracker clear this.tickInterval");
      clearInterval(this.tickIntervalId);
    }
    const interval = PlayerTracker.policies.tickInterval * 1000;

    this.tickIntervalId = setInterval(this.tick, interval);
  }

  stopTicking() {
    console.log("playerTracker stopTicking");
    clearInterval(this.tickIntervalId);
  }

  tick(time) {
    if(isNaN(time) || time<=0) {
      return;
    }
    console.log("playertracker sending tick as param ", time);
    this.track('tick', time);
  }

  playing(time=0) {
    console.log('######## playertracker playing', PlayerTracker.trackParams);
    this.checkLastEvent('view') && this.track('view',time);
  }

  pause(time = 0) {
    console.log('######## playertracker pause');
    this.track('pause', time);
  }

  resume(time = 0) {
    console.log('######## playertracker resume');
    this.track('resume', time);
  }

  //urrentTime, isLive, urlStop
  stop(time = 0, isLive = false, urlStop = null) {
    console.log('######## playertracker stop');
    this.track('stop', time, isLive,  urlStop);
  }

  bitRateChange(time = 0) {
    console.log('######## playertracker qualitychange');
    this.track('qualitychange', time);
  }

  error(e, time = 0) {
    console.log('######## playertracker error');
    this.track('error', time);
  }

  end(time = 0) {
    console.log('######## playertracker end');
    this.track('completion', time);
  }

  credits(time = 0) {
    console.log('######## playertracker credits');
    this.track('credits', time);
  }

  seek(time = 0) {
    console.log('######## playertracker seek');
    this.track('seek', time);
  }

  languageChange(time = 0) {
    console.log('######## playertracker languageChange');

    this.track('dubsubchange', time);
  }

  audioChange(time = 0) {
    console.log('######## playertracker audioChange');
    this.track('dubsubchange', time);
  }

  episodeChange(time = 0) {
    this.track('episodechange', time);
  }

  checkLastEvent(event){
    if(this.lastEvent === event){
      return false;
    }

    this.lastEvent=event;
    return true;
  }

  async track(method = '', time = 0, isLive = false, trackUrl = null) {
    // Por el momento la url adicional se usa para el trackStop
    let url = trackUrl ? trackUrl : PlayerTracker.urls[method];
    console.warn(`Playertracker request url: ${url}`);
    let params = {};
    params.timecode = (time && time.toFixed(0)) || 0;
    if (url) {
      if (PlayerTracker.trackParams.isLive) {
        // Cuando se manda el stop, Playertracker pierde los trackParams aunque es un static attr
        // De cualquier forma en el stop no se usa alguno de los tres de abajo
        let deviceAttachId = (PlayerTracker && PlayerTracker.trackParams && PlayerTracker.trackParams.deviceAttachId);
        let offerId = (PlayerTracker && PlayerTracker.trackParams && PlayerTracker.trackParams.offerId);
        let purchaseId = (PlayerTracker && PlayerTracker.trackParams && PlayerTracker.trackParams.purchaseId);
        //const { deviceAttachId, offerId, purchaseId } = PlayerTracker.trackParams;
        if(Utils.isNotNullOrNotUndefined(deviceAttachId)) {
          params = { ...params, device_id: deviceAttachId };
        }
        console.warn(`Playertracker request trackParams:`, params);
        if (offerId && purchaseId) {
          params = { ...params, offer_id: offerId, purchase_id: purchaseId };
        }
      }
      try {
        const simpleGetRequestTask = new PlayerTrackerTask(url, params, false);
        await RequestManager.addRequest(simpleGetRequestTask);
      } catch (err) {
        console.warn(`Playertracker request failed, url: ${url}`, err);
      }
    } else {
      console.warn(`No playertracker url found for method: ${method}`);
    }
  }

  
}

export default PlayerTracker;
