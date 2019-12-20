import AbstractHTML5Player from '../all/AbstractHTML5Player';
import Utils from "../../utils/Utils";
import { PONCONNECT, PONSTOP, PONPLAY, PONPAUSE, PONSKIP, PONSPEED, PONBUFFER } from '../../devices/all/settings';


import DRMTask from '../../requests/tasks/video/DRMTask';
import ManifestLanguagesTask from '../../requests/tasks/video/ManifestLanguagesTask';
import { SS, SS_MA, AUDIO, PLAYERIMAGE, HLS, HLSPRM, RADIO, HLS_KR } from '../../utils/playerConstants';
import RequestManager from '../../requests/RequestManager';
import { onStreamNotFound, onConnectionTimeout, onConnectionFailed, onNetworkDisconnected, onAuthenticationFailed, onUnknownError, onRenderError } from '../../utils/playerConstants';

const APP_ID = 'com.clarovideo';
const DRM_TYPE = 'playready';
const DRM_SYSTEM_ID = "urn:dvb:casystemid:19219";

class Web0sPlayer extends AbstractHTML5Player {

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

    this.prependPip = '';

    this.audioTracksReady = false;
    this.web0sClientId = null;
    this.web0sReady = false;
    this.web0sInitiatorMsg = null;
    this.web0sMsgId = null;

    this.retryLimitPlay = 30;
    this.retryIntervalPlay = 1;

    console.log('[Web0sPlayer] constructor');

    this.retryIntervalFirstPlaying = 0.9;
    this.retryLimitFirstPlaying = 40;   
    this.seekWindow = null;

    this.webOS = window.webOS;

    // binds
    this.unloadWebosDrmClient = this.unloadWebosDrmClient.bind(this);
    this.loadWebosDrmClient = this.loadWebosDrmClient.bind(this);
    this.setInitiatorInformation = this.setInitiatorInformation.bind(this);
    this.loadDrmClient = this.loadDrmClient.bind(this);
    this.sendDRMInformation = this.sendDRMInformation.bind(this);
    this.subscribeLicensingError = this.subscribeLicensingError.bind(this);
    this.getWebosMediaId = this.getWebosMediaId.bind(this);
    this.onSuccessChangeAudio = this.onSuccessChangeAudio.bind(this);
    this.seekTimeshift = this.seekTimeshift.bind(this);
    this.tryOnFirstTimeshiftSeek = this.tryOnFirstTimeshiftSeek.bind(this);
  }

  createPlayer(options) {
    this.prependPip = options.isPip ? '_pip' : '_full';
    this._playerContainer = window.document.createElement("div");
    this._playerContainer.style.backgroundColor = "transparent";
    this._playerContainer.id = 'Html5PlayerContainer' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";

    if (!this.streamIsImage()) {
      this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);

      this._playerHTMLTag = window.document.createElement(this.streamIsAudio() ? 'audio' : 'video');
      this._playerHTMLTag.setAttribute('id', 'Html5Player' + this.prependPip);

      // Muted only apply to pip, at this moment
      if (options.muted) {
        this._playerHTMLTag.setAttribute('muted', 'muted');
      }

      this._playerHTMLTag.className = "Html5Player";
      this._playerContainer.appendChild(this._playerHTMLTag);
    }
    else {
      this.setPlayerBackground(options.src ? options.src : null);
    }

    if (!this.options.parentWrapper) {
      console.error('parentWrapper not found');
      return;
    }

    let vWrapper = document.getElementById(this.options.parentWrapper.id);
    // vWrapper.appendChild(this._playerContainer);
    vWrapper.insertBefore(this._playerContainer, vWrapper.firstChild);

    // Add listeners...if apply
    if (!this.streamIsImage()) {
      this.addEventsListeners();
    }
  }

  loadWebOSAPI() {
    if(!this.webOS) {
      this.webOS = window.webOS;
    }
  }

  createMedia(options) {
    console.log('[WEB0S PLAYER] Web0s player createMedia');
    console.log(options);

    // Load webOS if not
    this.loadWebOSAPI();

    if (this._isPrepared)
      return;

    this.audioTracksReady = false;
    this.web0sClientId = null;
    this.web0sInitiatorMsg = null;
    this.web0sMsgId = null;
    this.web0sReady = false;

    // Just in case...newSource attr only arrive here when it is a replaceMediaSource (enter in replace method below),
    // so in this path we dont have to have this attr, reset it
    if (options.newSource && options.newSource.src) {
      options.newSource = null;
    }

    this.options = options;
    if (this.options.isPip) {
      // Pip would only exist when this is a video or audio
      this._playerHTMLTag = document.getElementById('Html5Player_pip');
      if (!this._playerHTMLTag) {
        this.createPlayer(options);
      }
      else {
        this.addEventsListeners();
        this._playerContainer = document.getElementById('Html5PlayerContainer_pip');
        if (!this.streamIsImage()) {
          this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);
        }
        if (options.muted) {
          this._playerHTMLTag.setAttribute('muted', 'muted');
        }
        else {
          this._playerHTMLTag.removeAttribute("muted");
        }
        if (options.controls) {
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

  async setLanguagesFromManifest(manifest) {
    let langsResult = [];
    if(manifest) {
      const manifestLanguagesTask = new ManifestLanguagesTask(manifest);
      langsResult = await RequestManager.addRequest(manifestLanguagesTask);

      console.log('[WEB0S PLAYER] setLanguagesFromManifest, raw result> ', langsResult);

      if(langsResult && langsResult.languages) {
        this.audioTracks = langsResult.languages;
      }
    }
    this.audioTracksReady = true;
    console.log('[WEB0S PLAYER] setLanguagesFromManifest, langs> ', this.audioTracks);

    return this.audioTracks;
  }

  async getDrmUrl(manifest) {
    let drmurl = null;
    if(manifest) {
      const drmTask = new DRMTask(manifest);
      let drmurlResult = await RequestManager.addRequest(drmTask);

      console.log('[WEB0S PLAYER] getDrmUrl, raw result> ', drmurlResult);

      if(drmurlResult && drmurlResult.server_url) {
        drmurl = drmurlResult.server_url;
      }
    }

    console.log('[WEB0S PLAYER] getDrmUrl, DRM url> ', drmurl);

    return drmurl;
  }

  getXMLInitiator(drmUrl, customData) {
    let xml_replace  =  '<?xml version="1.0" encoding="utf-8"?>';
    xml_replace +=        '<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">';
    xml_replace +=          '<LicenseServerUriOverride>';
    xml_replace +=            '<LA_URL>{{drm_url}}</LA_URL>';
    xml_replace +=          '</LicenseServerUriOverride>';
    xml_replace +=          '<SetCustomData>';
    xml_replace +=            '<CustomData>{{customData}}</CustomData>';
    xml_replace +=          '</SetCustomData>';
    xml_replace +=        '</PlayReadyInitiator>';

    xml_replace = xml_replace.replace('{{drm_url}}', drmUrl);
    xml_replace = xml_replace.replace('{{customData}}', customData);

    return xml_replace;
  }

  async loadMedia() {
    console.log('[WEB0S PLAYER] INIT AbstractHTML5Player loadMedia');
    if (!this._isPrepared) {
      return false;
    }
    console.log('[WEB0S PLAYER] INIT AbstractHTML5Player loadMedia 2');
    if (this.streamIsImage()) {
      return;
    }

    if (this.streamIsVideo() && this.options.resume && !this.options.isLive) {
      this.seek_resume = this.options.resume;
    }

    // Default videoType
    let mediaType = "video/mp4";
    if (this.options.src) {
      this.src = this.options.src;
      this._isOnLoaded = false;

      if (this.options.streamType === SS || this.options.streamType === SS_MA) {
        mediaType = "application/vnd.ms-playready.initiator+xml";
        // application/vnd.ms-sstr+xml

        // check if we have drm server
        // Se delimita a proveedor HBO para no obtener server_url desde manifest y dejar la misma lógica en demas proveedores.
        if(!this.options.drmInfo.server_url && this.options.provider.toUpperCase() !== 'HBO') {
          this.options.drmInfo.server_url = await this.getDrmUrl(this.options.src);
        }

        let server_url = this.options.drmInfo.server_url;
        let challenge = (this.options.drmInfo && this.options.drmInfo.challenge) || '';
        let content_id = (this.options.drmInfo && this.options.drmInfo.content_id) || '';
        let device_id = this.options.drmInfo.device_id || '';

        let customData = '';
        if(challenge && challenge.indexOf('tokenID') !== -1) {
          customData = challenge;
        } 
        else {
          if(challenge) {
            customData = btoa('{"customdata":' + challenge + ',"device_id": "' + device_id + '"}');
          }
        }

        this.mediaType = mediaType;

        if(this.options.drmInfo.server_url) {
          this.web0sInitiatorMsg = this.getXMLInitiator(this.options.drmInfo.server_url, customData);

          console.log('[WEB0S PLAYER] XML to send> ', this.web0sInitiatorMsg);

          this.loadWebosDrmClient();
        }
        else {
          this.web0sReady = true;
          // for SS => application/vnd.ms-sstr+xml
          this.setVideoSource(this.options.src, 'application/vnd.ms-sstr+xml');
        }
      }
      if (this.options.streamType === HLS || this.options.streamType === HLS_KR) {
        this.web0sReady = true;
        mediaType = "application/vnd.apple.mpegurl";
        this.mediaType = mediaType;
        this.setVideoSource(this.options.src, mediaType);
      }
      if (this.options.streamType === AUDIO || this.options.streamType === RADIO) {
        this.web0sReady = true;
        mediaType = "audio/mp4";
        this.mediaType = mediaType;
        this.setVideoSource(this.options.src, mediaType);
      }

      if (!this.options.isPip) {
        this.setPlayerFull();
      }
    }
    else {
      this.destroy();
    }
    console.log('[WEB0S PLAYER] END WEB0S player loadMedia');
  }

  setPlayerFull() {
    this.setPlayerSize(0, 0, 1280, 720);
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
      this._playerContainer.className = "AbstractPlayerObject"; 
    }
    
    if(this.streamIsAudio()) { 
      width = 0;
      height = 0;
      if(this._playerHTMLTag) {
        this._playerHTMLTag.style.top = '0px';
        this._playerHTMLTag.style.left = '0px';
        this._playerHTMLTag.style.width = width + 'px';
        this._playerHTMLTag.style.height = height + 'px';
        this._playerHTMLTag.style.position = "relative";
        this._playerHTMLTag.className = "web0s-html5-player"; 
      }
    }
  }

  setVideoSource(url, type) {
    console.log('[WEB0S PLAYER] INIT WEB0S Player setVideoSource');
    let source = document.createElement("source");

    if(this.options.streamType === SS || this.options.streamType === SS_MA) {
      let options = {};
      options.option = {};
      let mediaOption = '';

      if(this.options.drmInfo.server_url) {
        options.option.drm = {};
        options.option.drm.type = DRM_TYPE;
        options.option.drm.clientId = this.web0sClientId;
      }

      if(this.seek_resume > 0)
      {
        console.log("[WEB0S PLAYER] hay starttime> ", this.seek_resume);
        options.option.transmission = {};
        options.option.transmission.playTime = {};
        options.option.transmission.playTime.start = this.seek_resume * 1000;
      }
      else
      {
        console.log("[WEB0S PLAYER] NO hay starttime> setting default 500");
        options.option.transmission = {};
        options.option.transmission.playTime = {};
        options.option.transmission.playTime.start = 500;
      }

      mediaOption = escape(JSON.stringify(options));
      //source.setAttribute('type', 'application/vnd.ms-sstr+xml;mediaOption=' + mediaOption);
      source.setAttribute('type', type + ';mediaOption=' + mediaOption);


      console.log("[WEB0S] HTML5 player __addSourceToVideoPlayready: " + mediaOption);
      console.log("[WEB0S] HTML5 player __addSourceToVideoPlayready: " + this.WEBOSClientId);
      console.log("[WEB0S] HTML5 player __addSourceToVideoPlayready: " + this.WEBOSReady);
      console.log("[WEB0S] HTML5 player __addSourceToVideoPlayready: " + type);
      console.log("[WEB0S] HTML5 player startTime play: " + this._playTimeStart);

      this.seek_resume = 0;
    }
    else {
      source.setAttribute('type', type);
    }

    source.setAttribute('src', this.options.src);
    source.id = "Html5PlayerSource" + (this.options.isPip ? '_pip' : '_full');

    this._playerHTMLTag.innerText = '';
    this._playerHTMLTag.appendChild(source);
    this._playerHTMLTag.load();

    console.log('******* <<<<<<<<<<< END WEB0S PLAYER setVideoSource');
  }

  async tryPlay(currentTry) {
    if(this.web0sReady === false) {
      console.log('[WEB0S PLAYER]> trying play, retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitPlay) {
        console.log('[WEB0S PLAYER]> Error, player instance could not initialize');
        return;
      }
      await Utils.sleep(this.retryIntervalPlay);

      return this.tryPlay(++currentTry);
    }
    else {
      console.log('[WEB0S PLAYER]> player is READY to play, returns from sendDRM');
      return this.play();
    }
  }

  play() {
    if (this.streamIsImage()) {
      return;
    }

    if(this.web0sReady === false) {
      this.tryPlay(1);
    }

    console.log('[WEB0S PLAYER] INIT play');
    //this.show();

    this._playerHTMLTag.play();
    console.log('[WEB0S PLAYER] END play');
  }

  resume() {
    console.log('[WEB0S PLAYER] END resume');
    this._playerHTMLTag.play();
  }

  pause() {
    this._playerHTMLTag.pause();
    this.onPlayerStatePause();
  }

  stop() {
    this._playerHTMLTag.pause();
    this.onPlayerStateStop();
  }

  async replaceMediaSource(newSource) {

    console.debug('[WEB0S PLAYER] enter replaceMediaSource> ', newSource);
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
    if (newSource.resume && !newSource.isLive) {
      this.seek_resume = newSource.resume;
      this.options.resume = newSource.resume;
    }

    // Stop already take care of send stop to player internal state
    // so below, play change to playingstate
    this.pause();

    let currentSource = document.getElementById("Html5PlayerSource" + (this.options.isPip ? '_pip' : '_full'));
    if (currentSource) {
      currentSource.parentNode.removeChild(currentSource);
    }

    this.audioTracksReady = false;
    this.seekWindow = null;

    let mediaType = '';
    if (this.options.streamType === SS || this.options.streamType === SS_MA) {
      console.debug('[WEB0S PLAYER] enter replaceMediaSource es SS ');
      mediaType = "application/vnd.ms-playready.initiator+xml";

      // check if we have drm server
      // Se delimita a proveedor HBO para no obtener server_url desde manifest y dejar la misma lógica en demas proveedores.
      if(!this.options.drmInfo.server_url && this.options.provider.toUpperCase() !== 'HBO') {
        this.options.drmInfo.server_url = await this.getDrmUrl(this.options.src);
      }

      let server_url = this.options.drmInfo.server_url;
      let challenge = (this.options.drmInfo && this.options.drmInfo.challenge) || '';
      let content_id = (this.options.drmInfo && this.options.drmInfo.content_id) || '';
      let device_id = this.options.drmInfo.device_id || '';

      let customData = '';
      if(challenge && challenge.indexOf('tokenID') !== -1) {
        customData = challenge;
      }
      else {
        if(challenge) {
          customData = btoa('{"customdata":' + challenge + ',"device_id": "' + device_id + '"}');
        }
      }

      this.mediaType = mediaType;

      if(this.options.drmInfo.server_url) {
        this.web0sInitiatorMsg = this.getXMLInitiator(this.options.drmInfo.server_url, customData);
        if(this.web0sClientId) {
          // keep temp webOs, and await playing until get new drm response
          this.web0sReady = false;
          this.sendDRMInformation().then(() => {
            // for SS  => application/vnd.ms-sstr+xml
            this.setVideoSource(this.options.src, 'application/vnd.ms-sstr+xml');
            this.web0sReady = true;
          }).catch((msg) => {
            this._onError(onRenderError, msg);
          });
        }
        else {
          this.web0sReady = false;
          this.loadWebosDrmClient();
        }
      }
      else {
        this.web0sReady = true;
        this.setVideoSource(this.options.src, this.mediaType);
      }
    }
    if (this.options.streamType === HLS || this.options.streamType === HLS_KR) {
      console.debug('[WEB0S PLAYER] enter replaceMediaSource es HLS ');
      this.web0sReady = true;
      mediaType = "application/vnd.apple.mpegurl";
      this.mediaType = mediaType;
      this.setVideoSource(this.options.src, mediaType);

    }
    if (this.options.streamType === AUDIO || this.options.streamType === RADIO) {
      console.debug('[WEB0S PLAYER] enter replaceMediaSource es AUDIO ');
      this.web0sReady = true;
      mediaType = "audio/mp4";
      this.mediaType = mediaType;
      this.setVideoSource(this.options.src, mediaType);
    }
    this.hide();
    console.debug('[WEB0S PLAYER] enter replaceMediaSource going to play method ');
    // Play ahora se controla desde onresolve AAFPlayer
    //this.play();
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
    console.info('[WEB0S PLAYER] seekTimeshift ', timeshiftData, firstSeek);
    if(firstSeek) {
      this.tryOnFirstTimeshiftSeek(1, timeshiftData);    
    }
    else {
      let secondTo = Math.floor(timeshiftData.maxtimeshiftallowed - timeshiftData.seektime);
      if(secondTo < this.seekWindow.timeshiftstart) {
        secondTo = this.seekWindow.timeshiftstart;
      }
      if(secondTo >= this.seekWindow.maxtimeshiftallowed) {
        secondTo = this.seekWindow.maxtimeshiftallowed - 5; // To protect player, does it work?
      }
      console.log('[WEB0S PLAYER] trying to do timeshift seek to: <secondTo/seekWindow>  ', secondTo, this.seekWindow);
      this.seek(secondTo);
    }
  }

  async tryOnFirstTimeshiftSeek(currentTry, timeshiftData) {
    console.log('[WEB0S PLAYER]> tryOnFirstTimeshiftSeek getCurrentTime: [' +  this.getCurrentTime() + ']');
    console.info('[WEB0S PLAYER] tryOnFirstTimeshiftSeek duration ', this.getDuration());
    if(this.getCurrentTime() === 0) {
      console.log('[WEB0S PLAYER]> tryOnFirstTimeshiftSeek retry number: [' +  currentTry + ']');
      if(currentTry >= this.retryLimitFirstPlaying) {
        throw new Error('Fail to get playing state');
        console.log('[WEB0S PLAYER]> Error, Fail to get playing state');
        return;
      }
      await Utils.sleep(this.retryIntervalFirstPlaying);

      return this.tryOnFirstTimeshiftSeek(++currentTry, timeshiftData);
    }
    else {
      console.log('[TIZEN PLAYER]> player is ready and playing');
      this.seekWindow = {
        timeshiftstart: Math.ceil(this.getCurrentTime())
      };
      return this.seekTimeshift(timeshiftData, false);
    }
  }

  // sec in seconds
  seek(seconds) {
    console.log('[WEB0S PLAYER] seek de: ' + seconds);
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
    console.log('[WEB0S PLAYER] enter show');
    if (this._playerHTMLTag) {
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
    if (this.options.newSource && this.options.newSource.src) {
      this.audioTracksReady = false;
      return;
    }
    */

    // Both, pip and full, audio and video, stop and remove listeners
    if (!this.streamIsImage()) {
      this.stop();
      this.removeEventsListener();
    }

    this.unloadWebosDrmClient();

    this.audioTracksReady = false;
    this.web0sClientId = null;
    this.web0sInitiatorMsg = null;
    this.web0sMsgId = null;
    this.web0sReady = false;
    this.seekWindow = null;

    if (this.options.isPip) {
      this.destroyPip();
      if (this.streamIsImage()) {
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
    this.seek_resume = 0;

    return;
  }

  // For optimize pip playing, we dont destroy pip, we only change source
  destroyPip() {
    if (!this._isPrepared) {
      return;
    }

    // Only remove source and hide player when audio or video
    if (!this.streamIsImage()) {
      let source_dom = document.getElementById('Html5PlayerSource_pip');
      if (source_dom) {
        source_dom.parentNode.removeChild(source_dom);
      }
      this.hide();
    }
  }

  destroyPlayerContainer() {
    if (this._playerContainer) {
      if (this._playerHTMLTag && this._playerHTMLTag.parentNode) {
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

  unloadWebosDrmClient()
  {
      console.log('[WEB0S PLAYER] unloadWebosDrmClient init');
      if(this.web0sClientId)
      {
        console.log('[WEB0S PLAYER] unloadWebosDrmClient init 1');
        let requestt = this.webOS.service.request("luna://com.webos.service.drm", {
            method:"unload",
            parameters: { "clientId": this.web0sClientId },
            onSuccess: (result) => {
                console.log("[WEB0S PLAYER] DRM Client is unloaded successfully.");
            },
            onFailure: (result) => {
                console.log('[WEB0S PLAYER] Fail to unload LG DRM client');
            }
        });
      }
  }

  loadWebosDrmClient() {
    console.log('[WEB0S PLAYER] iniciando loadWebosDrmClient...');

    this.setInitiatorInformation().then((resp) => {
      console.log('[WEB0S PLAYER] success loadWebosDrmClient...', resp[0]);

      this.web0sClientId = resp[0];

      this.sendDRMInformation().then(
        () => {
          this.web0sReady = true;
          this.setVideoSource(this.options.src, 'application/vnd.ms-sstr+xml');
        }
      ).catch((msg) => {
        console.log('[WEB0S PLAYER] error en las promesas en sendDRMInformation', msg);
        this._onError(onRenderError, 'Error when sending DRM information');
      });
    }).catch((msg) => {
      console.log('[WEB0S PLAYER] error en las promesas en loadWebosDrmClient', msg);
      this._onError(onRenderError, 'Error when set DRM initiator information');
    });
  }

  setInitiatorInformation()
  {
    return new Promise((resolve, reject) => {
      this.loadDrmClient().then((clientId) => {
        console.log('[WEB0S PLAYER] resueltas todas las promesas en setInitiatorInformation');
        let resp_alt = [];
        resp_alt.push(clientId);
        resolve(resp_alt);
      }).catch((msg) => {
        console.log('[WEB0S PLAYER] error en las promesas en setInitiatorInformation');
        reject(msg);
      });
    });
  }

  loadDrmClient()
  {
    console.log("[WEB0S PLAYER] init loadDRMClient");
    return new Promise((resolve, reject) => {
      let requestt = this.webOS.service.request("luna://com.webos.service.drm", {
        method:"load",
        parameters: {
            "drmType": DRM_TYPE,
            "appId": APP_ID
        },
        onSuccess: (result) => {
            let clientId = result.clientId;
            console.log("[WEB0S PLAYER] DRM Client is loaded successfully.");
            resolve(clientId);
        },
        onFailure: (result) => {
            console.log("[WEB0S PLAYER] loadDrmClient [" + result.errorCode + "] " + result.errorText);
            var err = result.errorCode + "<>" + result.errorText;
            // Do something for error handling
            reject(err);
        }
      });
    });
  }

  sendDRMInformation() {
    console.log('[WEB0S PLAYER] Entrando a sendDRMInformation method');
    return new Promise((resolve, reject) => {
      let msgId = '';

      let requestt = this.webOS.service.request("luna://com.webos.service.drm", {
        method:"sendDrmMessage",
        parameters: {
            "clientId": this.web0sClientId,
            "msgType": this.mediaType,
            "msg": this.web0sInitiatorMsg,
            "drmSystemId": DRM_SYSTEM_ID
        },
        onSuccess: (result) => {
          this.web0sMsgId = msgId = result.msgId;
          let resultCode = result.resultCode;
          let resultMsg = result.resultMsg;
          console.log("[WEB0S PLAYER] Message ID: " + this.web0sMsgId);
          console.log("[WEB0S PLAYER]  [" + resultCode + "] " + resultMsg);
          if (resultCode != 0) {
            this.subscribeLicensingError(this.web0sClientId, result.msgId);
            reject(resultMsg);
          }
          else {
            resolve(result);
          }
        },
        onFailure: (result)  => {
          console.log("[WEB0S PLAYER] ERROR en sendDRMINFORMATION");
          console.log(result);
          this.subscribeLicensingError(this.web0sClientId, msgId);
          var resultCode = 'Error';
          reject(resultCode);
        }
      });
    });
  }

  subscribeLicensingError(clientId, msgId)  {
    let requestt = this.webOS.service.request("luna://com.webos.service.drm", {
      method:"getRightsError",
      parameters: {
          "clientId": this.web0sClientId,
          "subscribe": true
      },
      onSuccess: (result) => { // Subscription Callback
          console.log('[WEB0S PLAYER] ingresando a subscribeLicensingError success:');
          console.log(result);
      },
      onFailure: (result) => {
        console.log('[WEB0S PLAYER] subscribeLicensing Error ERROR:');
        console.log(result);
        this._onError(onRenderError, JSON.stringify(result));
      }
    });
  }

  addEventsListeners() {
    // Bind first
    this._toBindOnLoad = this._onLoad.bind(this);
    this._toBindOnWaiting = this._onWaiting.bind(this);
    this._toBindOnTimeUpdate = this._onTimeUpdate.bind(this);
    this._toBindOnWaiting = this._onWaiting.bind(this);
    this._toBindOnPlaying = this._onPlaying.bind(this);
    this._toBindOnPlaying = this._onPlaying.bind(this);
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
      if (this._playerHTMLTag && this._playerHTMLTag.currentTime) {
          return this._playerHTMLTag.currentTime;
      }
      else {
          return 0;
      }    
  }

  getDuration() {
    return this._duration;
  }

  setDuration() {
    this._duration = this._playerHTMLTag.duration;
  }
  
  /* Events */

  _onLoad() {
    console.log('[WEB0S PLAYER EVENT] _onLoad');
    // If multiple audio, we get languages
    this.show(); // TODO check here
    if(this.options.streamType === SS_MA) {
      this.disableHTML5AudioTracks();
      console.log('[WEB0S PLAYER EVENT] _onLoad audiotracks');
      this.setLanguagesFromManifest(this.options.src);
    }

    if (this.options.events.onLoad) {
      this.options.events.onLoad();
    }
  }

  _onWaiting() {
    console.log('[WEB0S PLAYER EVENT] _onWaiting');
    if (this.options.events.onWaiting) {
      this.options.events.onWaiting();
    }
  }

  _onTimeUpdate() {
    console.log('[WEB0S PLAYER] onTimeUpdate > ',this.getCurrentTime());

    if (this.options.events.onTimeUpdate) {
      this.options.events.onTimeUpdate(Math.floor(this.getCurrentTime()));
    }
  }

  _onPlaying() {
    console.log('[WEB0S PLAYER EVENT] _onPlaying');
    if (this.getCurrentPlayerState() === PONBUFFER) {
      this._onBufferingFinish();
    }
    else {
      this.onPlayerStatePlay();
    }

    if (this.options.events.onPlaying) {
      this.options.events.onPlaying();
    }
  }

  _onError(e, errorMessage) {
    console.log('[WEB0S PLAYER EVENT] _onError');
    console.log(e);
    // From https://dev.w3.org/html5/spec-author-view/video.html
    let msg = "";
    let errorCode = onRenderError;
    if(e.target) {
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
    }
    else {
      msg = errorMessage;
      errorCode = e;
    }

    this.stop();

    if (this.options.events.onError) {
      this.options.events.onError(msg, errorCode);
    }
  }

  _onFinished() {
    console.log('[WEB0S PLAYER EVENT] _onFinished');
    this.onPlayerStateStop();
    // Reinit player
    this.destroy();
    if (this.options.events.onFinished) {
      this.options.events.onFinished();
    }
  }

  _onCanPlay(e) {
    console.log('[WEB0S PLAYER EVENT] _onCanPlay> ');
    if (this.options.events.onCanPlay) {
      this.options.events.onCanPlay(e);
    }
    this._playerHTMLTag.play();
  }

  _onDurationChange() {
    console.log('[WEB0S PLAYER EVENT] _onDurationChange');
    this._isOnLoaded = true;
    this.setDuration();
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
    if (this.options.events.onBufferingProgress) {
      this.options.events.onBufferingProgress();
    }
  }

  _onBufferingFinish() {
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
  disableHTML5AudioTracks()
  {
    console.log('[WEB0S PLAYER] disableHTML5AudioTracks');
    if(this.options.streamType === SS_MA && this.audioTracks && this._playerHTMLTag)
    {
      try {
        console.log('[WEB0S PLAYER] disableHTML5AudioTracks, es multiple, audioTracks> ', this._playerHTMLTag.audioTracks);
        for(let tt = 0; tt < this._playerHTMLTag.audioTracks.length; tt++) {
            this._playerHTMLTag.audioTracks[tt].enabled = false;
        }
        console.log('[WEB0S PLAYER] Terminando disableHTML5AudioTracks');
      }
      catch(e) {
        console.log('[WEB0S PLAYER] disableHTML5AudioTracks catch error (it does not matter, maybe this is LG webos <= 2014)> ', e);
      }
    }
  }

  async tryGetAudioTracks(currentTry) {

    if (!this.audioTracksReady) {
      console.log('[WEB0S PLAYER]> tryGetAudioTracks retry number: [' + currentTry + ']');
      if (currentTry >= this.retryLimitAudioTrack) {
        throw new Error('Fail to get audioTracks');
        console.log('[WEB0S PLAYER]> Error, player instance could not initialize');
        return;
      }

      // Wait for a while...
      await Utils.sleep(this.retryIntervalAudioTrack);

      // ...Continue recursive...
      return this.tryGetAudioTracks(++currentTry);
    }
    else {
      console.log('[WEB0S PLAYER]> tryToGetAudioTracks retry number: [' + currentTry + '] - player audioTracks is READY');

      return this.getAudioTracks();
    }

  }

  getAudioTracks() {
    console.info("[WEB0S PLAYER]");
    if (!this.audioTracksReady) {
      console.info("[WEB0S PLAYER] Delay 1s to get the audio track info again");
      // ...Start recursive...
      return this.tryGetAudioTracks(1);
    }

    return this.getAudioTrackById();
  }

  getAudioTrackById() {
    console.log('[WEB0S PLAYER] enter getAudioTrackById');
    return new Promise((resolve, reject) => {
      console.log('[WEB0S PLAYER] recuperados > ' + JSON.stringify(this.audioTracks), this.audioTracks);
      console.log(this.audioTracks.length);
      resolve(this.audioTracks);
    });
  }

  // @codeTrack iso id i.e.: esp, eng, por, ori
  setAudioTrack(codeTrack) {

    console.log('[WEB0S PLAYER] enter setAudioTrack> ', codeTrack);

    return new Promise((resolve, reject) => {
      if (!this.audioTracksReady) {
        reject('Dont have audioTracks information');
      }

      let id = parseInt(codeTrack, 10);
      let internalAudioIndex = this.getAudioIndexOfCode(codeTrack);
      if (internalAudioIndex === null) {
        reject('Dont have audioTracks information, index lang does not exist');
      }
      else {
        if (this.currentAudioTrackIndex === internalAudioIndex) {
          console.info('[WEB0S PLAYER] Same audioTrack, nothing to do');
          resolve(true);
        }
        else {
          // Little hack to avoid LG WebOS freeze 1/2
          let currentTime = Math.floor(this.getCurrentTime());

          console.log('[WEB0S PLAYER] setAudioTrack saving currentTime> ', this.seek_resume , currentTime, this.currentAudioTrackIndex, this.audioTracks);
          if(this.seek_resume > 0) {
            if(currentTime === 0) {
              currentTime = this.seek_resume;
            }
          }

          if (this.currentAudioTrackIndex !== null) {
            this.audioTracks[this.currentAudioTrackIndex].enabled = false;
          }

          // Little hack for LG 2017 and 2016 (and maybe 2015) :S
          // video tag html catch audioTracks like above, there is no unique id,
          // there is no kind and iso languange id, there is no label :S :s
          // when user switch lang, disable html5 tracks at the same time, before
          // send request to LG luna js
          // IMPORTANT: It does not apply for LG webos <= 2014
          this.disableHTML5AudioTracks();
          console.log('[WEB0S PLAYER] setAudioTrack after disable audioTracks');

          console.info("[WEB0S PLAYER] Set audioTrack to index: " + internalAudioIndex + ', lang code: ' + codeTrack);
          let pid = this.getWebosMediaId();
          console.log('[WEB0S] Mandando a luna js index> ', internalAudioIndex, pid);
          console.log('[WEB0S] current time before change audio> ', currentTime);
          this.webOS.service.request('luna://com.webos.media', {
              method: 'selectTrack',
              parameters: {
                  'type': 'audio',
                  'index': internalAudioIndex, //  index of desired audio track
                  'mediaId': pid
              },
              onSuccess: () => {
                console.log('[WEB0S PLAYER] success when selectAudioTrack, calling callbackonSuccessChangeAudio, params codeTrack & seekTime> ', codeTrack, currentTime);
                this.onSuccessChangeAudio(internalAudioIndex, currentTime);
                resolve(true);
              },
              onFailure: (err) => {
                  console.log("[WEB0S PLAYER] An error occured when changing audio track... :(");
                  console.log("[WEB0S PLAYER] error: " + JSON.stringify(err));
                  reject('An error occured when changing audio track...');
              }
          });
        }
      }
    });
  }

  getAudioIndexOfCode(codeTrack) {
    let ret = null;

    for (let j = 0; j < this.audioTracks.length; j++) {
      if (this.audioTracks[j].id === codeTrack) {
        ret = j;
        break;
      }
    }

    return ret;
  }

  onSuccessChangeAudio(codeTrack, seekTime) {
    console.log('[WEB0S PLAYER] enter onSuccessChangeAudio, codeTrack & seekTime> ', codeTrack, seekTime);
    // Esperar dos segundos al player para forzar el rebuffering al cambiar idioma
    setTimeout(
      () => {
        if (this.getCurrentPlayerState() === PONPLAY) {
          this.seek(seekTime);
        }
        this.currentAudioTrackIndex = codeTrack;
      }
    , 500);
  }

  getWebosMediaId() {
    if(this._playerHTMLTag) {
      return this._playerHTMLTag.mediaId;
    }

    return '';
  }

  /* END MULTIPLE AUDIOTRACKS */
}

export default Web0sPlayer;
