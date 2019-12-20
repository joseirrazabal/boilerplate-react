var pkg = require('../../../package.json')

var YouboraTracker = window.youbora.Adapter.extend({

  // registerListeners: function () {
  //   // console.log("YouboraEvent registerListeners");
  //   this.monitorPlayhead(true, false);
  // },

  getVersion: function () {
    return "6.4.0-clarovideo-js"
  },

  getPlayhead: function () {
    return this.currentTime
  },

  getDuration: function () {
    return this.duration
  },

  getBitrate: function () {
    return this.bitrate
  },

  getRendition: function () {
    return this.rendition
  },

  getTitle: function () {
    return this.title
  },

  getTitle2: function () {
    return this.title2
  },

  getIsLive: function () {
    return this.isLive
  },

  getResource: function () {
    return this.src
  },

  getPlayerVersion: function () {
    return this.version
  },

  getPlayerName: function () {
    return "AAF Player"
  },

  setPlayhead: function (currentTime) {
    // console.log("YouboraEvent setPlayhead", currentTime);
   
    let youboraParams = {};
    if(window.youboraParams && Array.isArray(window.youboraParams) && window.youboraParams.length>0){
      window.youboraParams.forEach( (param, index) => {
        youboraParams["extraparam."+(index+1)] = param.value || "";
      });

      if(window.youboraTrackingPlugin 
        && window.youboraTrackingPlugin.setOptions 
        && typeof window.youboraTrackingPlugin.setOptions === 'function'){
          window.youboraTrackingPlugin.setOptions(youboraParams);
      }

      this.currentTime = currentTime;
      if(this.fireStart && typeof this.fireStart === "function") {
        if(currentTime < 0.5){
          this.fireStart();
        }
      }
      
      if(currentTime > 0.5){
        if(this.fireJoin && typeof this.fireJoin === "function") this.fireJoin();
      }
    }
  },

  setup: function (e, extravalues) {
    
    // console.log("YouboraEvent setup");
    if(this.monitorPlayhead && typeof this.monitorPlayhead === "function") this.monitorPlayhead(true, true, 2500);

    var metadata = e.response || "";
    var entry = e.entry;
    
    try {
      if(entry){
        window.youboraParams[9].value = entry.preview ? entry.preview : "0";
      }

      if (metadata) {
        // Youbora: Envio de parametros extras
        if(window.youboraTrackingPlugin){
          if(metadata.group 
            && metadata.group.common 
            && metadata.group.common.extendedcommon){
              if(metadata.group.common.extendedcommon.format
                && metadata.group.common.extendedcommon.format.name){
                  window.youboraParams[3].value = metadata.group.common.extendedcommon.format.name;
              }
          }
        }
  
        var media = metadata.media
        if (media) {
          this.duration = media.duration ? media.duration.seconds : null
          this.src = media.video_url
        }
        var common = metadata.group ? metadata.group.common : null
        if (common) {
          // VOD
          this.title = `${common.id}-${common.title}`
          this.title2 = "Undefined"
  
          var extCommon = common.extendedcommon ? common.extendedcommon.media : null
          if (extCommon) {
            if(extCommon.serie && extCommon.serie.title){
              // VOD Serie
              this.title = extCommon.serie.id + '-' + extCommon.serie.title
              this.title2 = extCommon.serieseason.id + '-' + extCommon.serieseason.number + '-' + common.id + '-' + common.title
            }
            this.isLive = extCommon.islive !== "0"
  
            if(this.isLive){
              // LIVE
              let liveMetadata = window.youboraChannelMetadata;
              this.title = `${common.id}-${common.title}`
              this.title2 = liveMetadata ? `${liveMetadata.program_event_id}-${liveMetadata.program_event_name}` : null;
            }
  
            if (extCommon.profile && extCommon.profile.hd) {
              this.rendition = extCommon.profile.hd.detail
            }
          }
        }
      }
      this.version = pkg.version

      let youboraParams = {};
      window.youboraParams.forEach( (param, index) => {
        youboraParams["extraparam."+(index+1)] = param.value;
      });
      window.youboraTrackingPlugin.setOptions(youboraParams);
  
      if(!metadata || !metadata.media || !metadata.media.initial_playback_in_seconds){
        if(this.fireStart && typeof this.fireStart === "function") this.fireStart();
      }
    }catch (e){
      // console.log("YouboraEvent Error in Adapter setup");
    }
  },

  bitRateChange: function (bitrate, bandwidth){
    // console.log("YouboraEvent bitRateChange bitrate:",bitrate,", bandwidth:",bandwidth);
    this.bitrate = bitrate;
  },

  playing: function () {
    // console.log("YouboraEvent playing");
    if(this.fireStart && typeof this.fireStart === "function") this.fireStart();
    if(this.currentTime > 0.5){
      if(this.fireJoin && typeof this.fireJoin === "function") this.fireJoin();
    }
  },              

  start: function () {
    // console.log("YouboraEvent start");
    if(this.fireStart && typeof this.fireStart === "function") this.fireStart();
  },

  play: function () {
    // console.log("YouboraEvent play");
    if(this.fireStart && typeof this.fireStart === "function") this.fireStart();
  },

  pause: function () {
    // console.log("YouboraEvent pause");
    if(this.firePause && typeof this.firePause === "function") this.firePause();
    // this.execFunction(this.firePause);
  },

  resume: function () {
    // console.log("YouboraEvent resume");
    if(this.fireResume && typeof this.fireResume === "function") this.fireResume();
  },

  stop: function () {
    // console.log("YouboraEvent stop");
    if(this.fireStop && typeof this.fireStop === "function") this.fireStop();
    if(this.resetMetadata && typeof this.resetMetadata === "function") this.resetMetadata();
  },

  episodeChange: function () {
    // console.log("YouboraEvent episodeChange");
    if(this.fireStop && typeof this.fireStop === "function") this.fireStop();
    if(this.resetMetadata && typeof this.resetMetadata === "function") this.resetMetadata();
  },

  leaveContent: function () {
    // console.log("YouboraEvent leaveContent");
    if(this.fireStop && typeof this.fireStop === "function") this.fireStop();
    if(this.resetMetadata && typeof this.resetMetadata === "function") this.resetMetadata();
  },

  leaveApp: function () {
    // console.log("YouboraEvent leaveApp");
    if(this.fireStop && typeof this.fireStop === "function") this.fireStop();
    if(this.resetMetadata && typeof this.resetMetadata === "function") this.resetMetadata();
  },

  foward: function () {
    // console.log("YouboraEvent foward");
    if(this.fireSeekBegin && typeof this.fireSeekBegin === "function") this.fireSeekBegin();
  },
  rewind: function () {
    // console.log("YouboraEvent rewind");
    if(this.fireSeekBegin && typeof this.fireSeekBegin === "function") this.fireSeekBegin();
  },
  foward30: function () {
    // console.log("YouboraEvent foward30");
    if(this.fireSeekBegin && typeof this.fireSeekBegin === "function") this.fireSeekBegin();
  },
  rewind30: function () {
    // console.log("YouboraEvent bufferEnd");
    if(this.fireSeekBegin && typeof this.fireSeekBegin === "function") this.fireSeekBegin();
  },
  end: function () {
    // console.log("YouboraEvent rewind30");
    if(this.fireStop && typeof this.fireStop === "function") this.fireStop();
    if(this.resetMetadata && typeof this.resetMetadata === "function") this.resetMetadata();
  },
  error: function (e, time) {
    // console.log("YouboraEvent error");
    if(this.getPlayhead() && this.getPlayhead()!==null){
      if(this.fireError && typeof this.fireError === "function") this.fireError(e.message);
    }
  },
  errorContent: function (e, time) {
    // console.log("YouboraEvent errorContent");
    if(this.getPlayhead() && this.getPlayhead()!==null){
      if(this.fireError && typeof this.fireError === "function") this.fireError(e.message);
    }
  },
  errorLive: function (e, time) {
    // console.log("YouboraEvent errorLive");
    if(this.getPlayhead() && this.getPlayhead()!==null){
      if(this.fireError && typeof this.fireError === "function") this.fireError(e.message);
    }
  },
  apiError: function (e, time) {
    // console.log("YouboraEvent apiError");
    if(this.getPlayhead() && this.getPlayhead()!==null){
      if(this.fireError && typeof this.fireError === "function") this.fireError(e.message);
    }
  },

  resetMetadata: function () {
    // console.log("YouboraEvent resetMetadata");
    this.duration = null
    this.src = null
    this.title = null
    this.title2 = null
    this.isLive = null
    this.rendition = null
    this.currentTime = null
    this.bitrate = null
    if(this.monitor && this.monitor.stop && typeof this.monitor.stop === 'function'){
      this.monitor.stop();
    } 
  }
})

module.exports = YouboraTracker