import AbstractHTML5Player from '../all/AbstractHTML5Player';
import * as  playerConstants from '../../utils/playerConstants';
import shaka from 'shaka-player';
import Utils from '../../utils/Utils';
import shakaPlayer from '../all/shakaPlayer/shakaMain';
import shakaAssets from '../all/shakaPlayer/shakaAsset'

class ArrisPlayer extends AbstractHTML5Player {
  constructor() {
    super();

    shaka.polyfill.installAll();

    this.createAssetInfo = this.createAssetInfo.bind(this);
    this.setAudioTrack = this.setAudioTrack.bind(this);

    this.typeFilter = shakaAssets.getTypeFilter();
  }

  getStreamType() {
    switch (this.options.streamType) {
      case playerConstants.HLS:
        return 'application/vnd.apple.mpegurl';
        break;
      case playerConstants.AUDIO:
      case playerConstants.RADIO:
        return 'audio/mp4';
        break;
      case playerConstants.SS:
      case playerConstants.SS_MA:
        return 'application/vnd.ms-playready.initiator+xml';
        break;
      default:
        return null;
        break;
    }
  }

  createPlayer(options) {
    this.prependPip = options.isPip ? '_pip' : '_full';
    this._playerContainer = window.document.createElement("div");
    this._playerContainer.style.backgroundColor = "transparent";
    this._playerContainer.id = 'Html5PlayerContainer' + this.prependPip;
    this._playerContainer.className = "Html5PlayerContainer";

    if (!this.streamIsImage()) {
      this.setPlayerBackground(options.backgroundImage ? options.backgroundImage : null);

      this._playerHTMLTag = window.document.createElement('video');
      this._playerHTMLTag.setAttribute('id', 'Html5Player' + this.prependPip);

      // Muted only apply to pip, at this moment
      if (options.muted) {
        this._playerHTMLTag.setAttribute('muted', 'muted');
      }

      this._playerHTMLTag.className = "Html5Player";
      shakaPlayer.setVideo(this._playerHTMLTag);

      var playerShakaLocal = new shaka.Player(this._playerHTMLTag);
      shakaPlayer.setPlayer(playerShakaLocal);
      window.Player = playerShakaLocal;

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

  createMedia(options) {
    console.log('[GOO] --  createMedia -- options',options);
    // options.src = "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd";
    if (this._isPrepared || !shaka.Player.isBrowserSupported())
      return;

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

  createAssetInfo() {
    console.log('[GOO] -- src/devices/arris/Player.js -- this.typeFilter=',this.typeFilter);
    // HARDCODEO SERVER URL --- POR FERNANDO

    // let server_url_hardco = this.options.drmInfo.server_url;
    // server_url_hardco = "https://proxy.claro03.uat.verspective.net/amco-uat/widevine";
    // console.log('[OPSERVER_URL_HARDCO]', server_url_hardco);
    
    // HARDCODEO SERVER URL --- POR FERNANDO
    
    var typeFilter = this.typeFilter.DEFAULT;

    if (this.options.provider == 'FOX' && !this.options.isLive)
      typeFilter = this.typeFilter.FOXPLAY;
    if (this.options.provider == 'FOX V3' && !this.options.isLive)
      typeFilter = this.typeFilter.FOXV3PLAY;
    if (this.options.provider == 'HBO' && !this.options.isLive)
      typeFilter = this.typeFilter.HBO;
    if (this.options.provider === 'CRACKLE' && !this.options.isLive) {
      typeFilter = this.typeFilter.CRACKLE;
      this.options.drmInfo.resultCert = undefined;
    }
    if (this.options.provider === 'PICARDIA' && !this.options.isLive) {
      typeFilter = this.typeFilter.PICARDIA;
      this.options.drmInfo.resultCert = undefined;
    }

    let token = null
    if (this.options.drmInfo && this.options.drmInfo.challenge ) {
      if(Utils.isJson(this.options.drmInfo.challenge)){
        var challenge = JSON.parse(this.options.drmInfo.challenge);
        token = challenge.token;
      } else {
        token = this.options.drmInfo.challenge; // hardco canal en vivo
      }
    }
    console.log('[GOO] -- src/devices/arris/Player.js -- this.options',this.options);
    var AssetInfo = {
      manifestUri: this.options.src, // hardco canal en vivo
      licenseServers: {
        'com.widevine.alpha': this.options.drmInfo.server_url, // hardco canal en vivo
        'com.microsoft.playready': this.options.drmInfo.server_url, // hardco canal en vivo
        url_server: this.options.drmInfo.server_url // hardco canal en vivo
      },

      drm: {
        advanced: {
          'com.widevine.alpha': {
            serverCertificate: this.options.drmInfo.resultCert // hardco canal en vivo DESPUES SE TIENE QUE DESCOMENTAR
          }
        }
      },
      requestFilter: shakaAssets.DLARequestFilter,
      responseFilter: shakaAssets.DLAResponseFilter,
      customData: {
        token,
        device_id: this.options.drmInfo.device_id // hardco canal en vivo DESPUES SE TIENE QUE DESCOMENTAR
      },
      typeFilter
    };
    console.log('[OP AssetInfo]', AssetInfo)

    if (!this.options.isLive) {
      AssetInfo.bufferBehind = 5;
      AssetInfo.streamBufferSize = 10; //se configurra por ambiante
    }

    console.log('[INDEXOF] -- AssetInfo = ',AssetInfo);
    shakaAssets.setAssetInfo(AssetInfo);
    console.log('[INDEXOF] -- setAssetInfo');
    console.trace();
    return AssetInfo;
  };

  loadMedia() {
    var player = shakaPlayer.getPlayer();

    if (!this._isPrepared) {
      return false;
    }
    if (this.streamIsImage()) {
      return;
    }

    if (this.options.resume && !this.options.isLive) {
      this.seek_resume = this.options.resume;
    }

    this.assetInfo = this.createAssetInfo();
    console.log('[INDEXOF] -- AssetInfoOUT = ',this.assetInfo);

    var asset = shakaPlayer.preparePlayer(this.assetInfo);

    console.log('[INDEXOF] -- preparePlayer = ',asset);

    var initConfig = {
      abr: {
        defaultBandwidthEstimate: 10e5,
        bandwidthUpgradeTarget: 0.7,
        bandwidthDowngradeTarget: 1.3
      },
    };

    player.configure(initConfig);
    this.setTextTrack(player);

    console.log('[INDEXOF] -- loadMedia.setTextTrack = ',player);
    if (this.options.src) {
      this.src = this.options.src;
      this._isOnLoaded = false;
      player.load(this.options.src)
        .then(function () {
          //this.updateQualityOptions(null, shakaPlayer.getTracks('video'));
        }).catch(function (e) {
          console.log("shaka load error", e);  // Error already handled through error event.;
        });

      if (!this.options.isPip) {
        this.setPlayerFull();
      }
    }
    else {
      this.destroy();
    }
    console.log('[INDEXOF] -- loadMedia.END = ');
    console.trace();

  }


  setTextTrack(player){
    let lengOptions = this.options.multipleLangOptions
                    && this.options.multipleLangOptions.subtitles
                    && this.options.multipleLangOptions.subtitles.options
    console.log('[PGM][STATE] setTextTrack 1', lengOptions);
    if(Utils.isObject(lengOptions)){
      for (const o in lengOptions) {
        try{
          console.log('[PGM][STATE] setTextTrack try ', o);
          // player.addTextTrack(lengOptions[o].external, lengOptions[o].internal + '_ext', 'subtitle', 'text/vtt');
          console.log('[PGM][STATE] setTextTrack ok! ', o,lengOptions[o].external, lengOptions[o].internal + '_ext', 'subtitle', 'text/vtt');
        }catch(e){
          console.error('[PGM][STATE] setTextTrack ', e, o);
        }
     }
    }
  }


  setAudioTrack(codeTrack) {
    var player_ = shakaPlayer.getPlayer();

    return new Promise((resolve, reject) => {
      console.log('[Arris] Enter audioTrack');
      if(this.currentAudioTrackIndex === codeTrack)  {
        console.info('[Arris] Same audioTrack, nothing to do', this.currentAudioTrackIndex);
        resolve(true);
      }
      this.currentAudioTrackIndex = codeTrack;
      try {
        console.info('[Arris] change audioTrack', codeTrack);
       if (player_ && player_.selectAudioLanguage) {
            player_.selectAudioLanguage(codeTrack);
        }
      }
      catch(e) {
        console.log('[Arris] error when change lang', codeTrack);
        reject('[Arris] error when change lang');
      }
      resolve(true);
    });
  }



}

export default ArrisPlayer;
