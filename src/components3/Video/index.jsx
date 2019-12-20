import './video.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PlayerControls from "../PlayerControls/PlayerControls";
import Epg from '../../containers/Epg';
import DeviceDetection from '../../utils/DeviceDetection';
import Npvr from './../../utils/Npvr';
import store from '../../store';
import { showNotification } from './../../actions/notification';
import { navigateFrom } from './../../actions/epg';
import { setResumeData } from './../../actions/resume';
import DeviceStorage from '../DeviceStorage/DeviceStorage';
import PlayerStreamingUtils from "../../utils/PlayerStreamingUtils";
import Translator from "../../requests/apa/Translator";
import * as api from '../../requests/loader';

import { finishPlaying, startPlaying, onPlayingRadio } from '../../actions/musica/player-action-creators';
import { checkFavoriteContent, configSetupPlay, showModalSinglePlay } from '../../actions/musica/player-shared-action-creators';

import {playFullMedia, playPipMedia, replaceFullSourceMedia, resizeFullMedia} from "../../actions/playmedia";
import * as playerConstant from '../../utils/playerConstants';
import Utils from './../../utils/Utils';
import TvChannelUtil from '../../utils/TvChannelUtil';
import LayersControl from './../../utils/LayersControl';
import FrontPanel from './../../devices/nagra/FrontPanel';

import VirtualSubtitles from './VirtualSubtitles';
import PlayerSubtitlesTask from '../../requests/tasks/player/PlayerSubtitlesTask';
import RequestManager from '../../requests/RequestManager';
import settings from '../../devices/all/settings';
import { lang } from 'moment';
import getAppConfig from '../../config/appConfig';
import PPE from './../../devices/nagra/PPE';
import { showModal, MODAL_PPE, HIDE_MODAL, SHOW_MODAL, MODAL_LANGUAGES, MODAL_ERROR, MODAL_GENERIC, MODAL_PIN, MODAL_REINTENTO, MODAL_DESCONEXION } from '../../actions/modal';

import { repeatModeMusicStatus } from '../../actions/musica/player-shared-action-creators';

import Device from "../../devices/device";
import ChannelSingleton from '../Epg/ChannelsSingleton';
import { PONCONNECT, PONSTOP, PONPLAY, PONPAUSE, PONSKIP, PONSPEED, PONBUFFER } from '../../devices/all/settings';
import DeviceNetworkStatus from '../../utils/DeviceNetworkStatus';

import MusicContainer from '../MusicaPlayer';

import AAFPlayer from '../../AAFPlayer/AAFPlayer';
import DummyDataPlay from '../../AAFPlayer/dummy/DummyDataPlay';
import Metadata from '../../requests/apa/Metadata';
import m from 'moment';

import {
  AAFPLAYER_STOP,
  AAFPLAYER_PLAY,
  AAF_CONTENT_IS_VOD,
  AAF_CONTENT_IS_CATCHUP,
  AAF_CONTENT_IS_TIMESHIFT,
  AAF_CONTENT_IS_TV,
  AAF_CONTENT_IS_AUDIO,
  AAF_CONTENT_IS_RADIO,
  retryTimeEvents
} from '../../AAFPlayer/constants';

import TrackerManager from '../../utils/TrackerManager';
import AkamaiTracker from "../../utils/trackers/AkamaiTracker";
import PlayerTracker from "../../utils/trackers/PlayerTracker";

import { isPreviewSong, sendMetricsMusicaStarted} from '../../actions/musica/player-shared-action-creators';

import MusicUtils from "../../actions/musica/music-actions";
import PlayerAudioSubtitleHelper from './../../AAFPlayer/helpers/PlayerAudioSubtitleHelper';
import AnalyticsDimensionSingleton from "../Header/AnalyticsDimensionSingleton";
import {deviceAttach} from "../../requests/loader";

import LoadingComponent from '../../components/Loading/LoadingComponent';

import CoverFlow from '../Epg/CoverFlow';
import EpgLogic from '../Epg/EpgLogic';

/* Control subtitles */
const subs_in_end_player = 'in-end-player';
const subs_in_controls = 'in-controls';


class Video extends EpgLogic {
  constructor(props) {
    super(props);

    //is playing state to replace router with player, maybe a props.state
    this.playeIsOnScreen = true;
    this.changingChannel = false;

    this.record = this.record.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.handleEpgVisibility = this.handleEpgVisibility.bind(this);
    this.handleNetworkDisconnection = this.handleNetworkDisconnection.bind(this);
    this.replayFromNetworkDisconnect = this.replayFromNetworkDisconnect.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.streamIsVideo = this.streamIsVideo.bind(this);
    this.streamIsAudio = this.streamIsAudio.bind(this);

    this.keyPressHandler = this.keyPressHandler.bind(this);

    this.setAudioTrack = this.setAudioTrack.bind(this);
    this.changeChannel =this.changeChannel.bind(this);
    this.showEPG = this.showEPG.bind(this);
    this.resolveAudioSubtitleFromReplace = this.resolveAudioSubtitleFromReplace.bind(this);
    this.resolveAudioSubtitleFromStart = this.resolveAudioSubtitleFromStart.bind(this);
    this.enableColorActions = this.enableColorActions.bind(this);

    this.playWhenStopMiniEpg = this.playWhenStopMiniEpg.bind(this);
    this.intervalPlayMiniEpg = this.intervalPlayMiniEpg.bind(this);
    this.changeCurrentGroupId = this.changeCurrentGroupId.bind(this);
    this.hideOnlyMini = this.hideOnlyMini.bind(this);
    this.setFromProps = this.setFromProps.bind(this);

    /*this.player = new PlayerMiddleware({
      onProgress: this.updateCurrentTime,
      onDurationChange: this.updateDurationTime,
      onFinishSong: this.onFinishSong,
      onPlayingSong: this.onPlayingSong,
      onPlayingRadio: this.onPlayingRadio,
      onCanPlay: this.onCanPlay,
      onEnded: this.onEnded,
      onBufferingStart:this.onBufferStart,
      onBufferingFinish:this.onBufferEnd,
      onPlayerError: this.onPlayerError
    }); */

    this.channelInfo = {};

    this.state = {
      loading: false,
      fullscreen: false,
      extraClass: '',
      showEpg: false,
      epgGroupId: DeviceStorage.getItem('lastChannel'),
      timeshiftAllowed: ChannelSingleton.getTimeshift(DeviceStorage.getItem('lastChannel'), true),
      currentTimeshiftTime: 0,
      subtitleparser: {
        subtitle: null,
        className: null
      },
      enableplayercontrols: true,
      channelInfo: this.channelInfo,
      epgType:'GUIDE',
      hasEpgError: false,
      handleChangeSubtitle:null,
      coverFlow: false,
      receiveOK: false,
      filterEpg: null
    };

    this.isPlayerFull = true;
    this.inPlayerError = false;
    this.serieData = null;
    this.loaded = false;

    this.keys = Device.getDevice().getKeys();

    this.langOptions = null;
    this.multipleLangOptions = null;
    this.localCurrentTime = 0;

    this.currentLanguageOptionID = null;
    this.currentStreamType = null;
    this.playerStreamingUtils = new PlayerStreamingUtils();
    this.guideParams = null;

    this.channelJSON = [];
    this.channelJSONPurchased = [];
    this.linealChannels = this.props.linealChannels;
    this.esteCanal = 0;
    // Guarda el estado actual del player para usarse en caso de networkDisconnect
    this.currentPlayerStoreState = null;

    this.firstTimeCB = true;

    // AAFPlayer Params, binds, variables, y demás
    // Guardar los params que resolvió AAFPlayer cuando resolvió el streaming a playear
    this.timeShift = null;
    this.waitingSeek = null;
    this.isInReplayingFromNetworkDisconnect = false;
    this.AAFResolvedParams = null;
    this.AAFResolvedParamsPip = null;
    this.player = AAFPlayer;
    this.videoCanPlay=false;
    this.deviceAttachAlreadyResponsed=false;

    this.platform = Device.getDevice().getPlatform();
    this.onPlayerControlPause = this.onPlayerControlPause.bind(this);
    this.onPlayerControlPlay = this.onPlayerControlPlay.bind(this);
    this.onPlayerControlResume = this.onPlayerControlResume.bind(this);
    this.onPlayerControlStop = this.onPlayerControlStop.bind(this);
    this.onPlayerControlSeek = this.onPlayerControlSeek.bind(this);
    this.onPlayerSetAudioTrack = this.onPlayerSetAudioTrack.bind(this);
    this.onPlayerEndPlayer = this.onPlayerEndPlayer.bind(this);
    this.onPlayerStopMedia = this.onPlayerStopMedia.bind(this);
    this.doTimeshift = this.doTimeshift.bind(this);
    this.performTimeShift = this.performTimeShift.bind(this);

    this.onPlayerError = this.onPlayerError.bind(this);
    this.onCanPlay = this.onCanPlay.bind(this);
    this.onBufferStart= this.onBufferStart.bind(this);
    this.onBufferEnd= this.onBufferEnd.bind(this);
    this.updateCurrentTime = this.updateCurrentTime.bind(this);
    this.updateDurationTime = this.updateDurationTime.bind(this);
    this.onFinishSong = this.onFinishSong.bind(this);
    this.onPlayingSong = this.onPlayingSong.bind(this);
    this.onPlayingRadio = this.onPlayingRadio.bind(this);
    this.handleEpg = this.handleEpg.bind(this);
    this.hideEpgOutside = this.hideEpgOutside.bind(this);
    this.onChangingChannel = this.onChangingChannel.bind(this);
    this.isChangingChannel = this.isChangingChannel.bind(this);
    this.getEpgType = this.getEpgType.bind(this);
    this.setEpgType = this.setEpgType.bind(this);
    this.hasEpgError = this.hasEpgError.bind(this);
    this.setEpgError = this.setEpgError.bind(this);
    //this.launchCoverFlow = this.launchCoverFlow.bind(this);
    this.goBack = this.goBack.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
    this.changeLang = this.changeLang.bind(this);
    this.onUpdateEpg = this.onUpdateEpg.bind(this);
    this.controlBarIsShowed = this.controlBarIsShowed.bind(this);
    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.handleSubtitlesEndPlayer = this.handleSubtitlesEndPlayer.bind(this);
    this.onUpdateLangOptions = this.onUpdateLangOptions.bind(this);
    this.setSelectedLanguage = this.setSelectedLanguage.bind(this);
    this.setNagraLiveLang = this.setNagraLiveLang.bind(this);
    this.onUpdateCurrentTimeshift = this.onUpdateCurrentTimeshift.bind(this);
    this.tryReplay = this.tryReplay.bind(this);
    this.onBookMark = this.onBookMark.bind(this);
    this.onBitrateChange = this.onBitrateChange.bind(this);
    // Evento "papá"/main event que envía AAFPlaying, si ya esta todo listo para playear, aquí se recibe lo que se va a playear y desde aquí mismo se envía "play" al media content
    this.onResolveParams = this.onResolveParams.bind(this);
    this.onResolveResizePlayer = this.onResolveResizePlayer.bind(this);
    // Este evento es para cachar errores (generales) de pgm principalmente, o cualquier error que suceda al resolver el playing
    // Ojo, no es para cachar errores del player
    this.onResolveError = this.onResolveError.bind(this);
    // Este callback es para mostrar modales
    this.onResolveShowModal = this.onResolveShowModal.bind(this);
    // Bind para manejo de algunos errores y modales desde AAFPlayer
    this.handleModalReintentoError = this.handleModalReintentoError.bind(this);
    this.handleModalBookmark = this.handleModalBookmark.bind(this);
    this.handleModalParental = this.handleModalParental.bind(this);
    this.handleCantPlay = this.handleCantPlay.bind(this);

    this.getAAFCallbacks = this.getAAFCallbacks.bind(this);
    this.getAAFPlayerWrapper = this.getAAFPlayerWrapper.bind(this);

    this.getDuration = this.getDuration.bind(this);

    this.afterGetDataSe=this.afterGetDataSe.bind(this);

    this.changeContentfromSelector=this.changeContentfromSelector.bind(this);
    this.goToCard=this.goToCard.bind(this);
    this.getDeviceAttach=this.getDeviceAttach.bind(this);
    this.setTimeshiftSeek = this.setTimeshiftSeek.bind(this);

    // CoverFlow
    this.handleEpgCover = this.handleEpgCover.bind(this);
    this.channelsPurchased = [];
    this.isKeysBloqued = false;
    this.pressTimer = null;
    this.lastKey = null;
    this.delayKeyTime = 50;
    this.keyActionsEnabled = true;
    this.channelControlsEnabled = true;
    this.hideCoverFlowSec = null;
    this.delayHideCoverFlowTime = 4000;
    this.current = {
      channel: {},
    };
    this.delayCoverFlow = this.delayCoverFlow.bind(this);


    this.lastUpdate=0;
    document.removeEventListener(settings.event_change_network_status, this.handleNetworkDisconnection);
    document.addEventListener(settings.event_change_network_status, this.handleNetworkDisconnection);
    this.successPin=false;
    this.idCheckVideo=null;
    this.AllEpgs = true;
  }

  componentWillUpdate(nextProps) {
    if(this.isPropsChange(nextProps.resume, this.props.resume)) {
     this.resetValues();
    }
  }

  resetValues() {
    this.serieData = null;
  }

  isPropsChange(nextProps, props) {
    return nextProps !== props;
  }

  closeModal() {
    store.dispatch(showModal({
      modalType: HIDE_MODAL,
      modalProps: {}
    }));
  }

  async replayFromNetworkDisconnect() {
    if(this.isInReplayingFromNetworkDisconnect) {
      console.log('[REPLAY FROM NETWORK DISCONNECTED] NetworkStatus se llama a replayFromNetworkDisconnect pero ya se llamó anteriormente');
      //ya esta haciendo el replay? wait...en lo que el player intenta conectarse y playear de nuez
      return;
    }

    let isPip = true;
    let in_stop = AAFPLAYER_STOP;
    let in_play = AAFPLAYER_PLAY;
    let pip_state = AAFPlayer.getCurrentPlayingState(isPip);
    let full_state = AAFPlayer.getCurrentPlayingState(!isPip);

    // Cerrar modal, solo aplica a full
    if(!this.AAFResolvedParams.isPip && full_state === in_play) {
      this.closeModal();
      this.isInReplayingFromNetworkDisconnect = true;
      console.log('[REPLAY FROM NETWORK DISCONNECTED] NetworkStatus se llama a replayFromNetworkDisconnect para intentar reproducir de nuez');
      let isVOD = !this.AAFResolvedParams.isLive;
      let container = this.isPlayerFull ? this.refs.VideoContainer : this.refs.VideoContainerPIP;

      // Las ultimas opciones con que se fue al playing...
      let latestVideoOptions = AAFPlayer.getCurrentPlayerOptions();
      // Si es video
      if(this.streamIsVideo(this.AAFResolvedParams.streamType)) {
        // Trackstop en full (& bookmark ¿? stop genera bookmark o forzó a resume en el currentTime en que se quedó????) antes de replay
        if(isVOD) {
          // TODO meter tracking stop aquí
        }
        latestVideoOptions.resume = this.localCurrentTime;
        // Hay langs? los enviamos para ahorrar una llamada a content/data
        if(Utils.isArray(this.AAFResolvedParams.extendedCommonLangOptions)) {
          latestVideoOptions.languageoptions = this.AAFResolvedParams.extendedCommonLangOptions;
        }
        // Primero stop / para forzar el replay del MISMO contenido
        AAFPlayer.setPlayerState({playerstate: in_stop, ispip: false});
        // Meter un timeout antes de enviar a play de nuevo¿?
        AAFPlayer.setPlayerState(latestVideoOptions);
      }
      // TODO Si es audio ¿? Validar con música, cómo generar nuevo token¿?
      if(this.streamIsAudio(this.AAFResolvedParams.streamType))
      {
        // Primero stop / para forzar el replay del MISMO contenido
        AAFPlayer.setPlayerState({playerstate: in_stop, ispip: false});
        // Meter un timeout antes de enviar a play de nuevo¿?
        AAFPlayer.setPlayerState(latestVideoOptions);
      }
    }
    // TODO replay SPOT ¿?
  }

  async handleNetworkDisconnection(evt) {
    // Si no hay current state de playing, nada que hacer, y si, pasa por aquí dos veces :S
    if(this.AAFResolvedParams === null && this.AAFResolvedParamsPip === null) {
      console.log('[REPLAY FROM NETWORK DISCONNECTED] 1 NetworkStatus recibe evento de red, esta conectado pero seguramente el user le dió clic a reintentar');
      return;
    }
    // Si no esta en player, nada que hacer, deja pasar el evento de desconexión
    let isPip = true;
    let in_stop = AAFPLAYER_STOP;
    let in_play = AAFPLAYER_PLAY;
    let pip_state = AAFPlayer.getCurrentPlayingState(isPip);
    let full_state = AAFPlayer.getCurrentPlayingState(!isPip);

    if(pip_state === in_stop && full_state === in_stop) {
      return;
    }
    // Si es pip y esta por DVBC nada que hacer, va por cable
    if(pip_state === in_play) {
      if(this.AAFResolvedParams.streamType === playerConstant.DVBC || this.AAFResolvedParams.streamType === playerConstant.DVBS) {
        return;
      }
    }
    if(full_state === in_play) {
      if(this.AAFResolvedParams.streamType === playerConstant.DVBC || this.AAFResolvedParams.streamType === playerConstant.DVBS) {
        return;
      }
    }
    // pip sobre internet, destroy & kill <- TODO
    if(pip_state === in_play) {
      AAFPlayer.setPlayerState({playerstate: in_stop, ispip: true});
    }

    // Abajo todo sobre player full
    // Se restaura network
    if(evt.detail) {
      if(this.isInReplayingFromNetworkDisconnect) {
        //ya esta haciendo el replay?
        return;
      }
      this.replayFromNetworkDisconnect();
    }
    // No hay red, player stop ¿?
    else {
      if(this.streamIsVideo(this.AAFResolvedParams.streamType)) {
          console.log('[REPLAY FROM NETWORK DISCONNECTED] NetworkStatus manda a pausa');
          this.player.pause();
          this.isInReplayingFromNetworkDisconnect = false;
          // Lanzar modal
          const defaultTile = 'Tienes un problema con tu conexión';
          const defaultContent = 'Revisa que tu servicio de Internet esté funcionando de forma correcta e intenta nuevamente.';

          // goose -- se saca youbora
          /*
          // Youbora
          if(window.youboraTrackingPlugin){
            if(window.youboraTrackingPlugin.getAdapter && typeof window.youboraTrackingPlugin.getAdapter === "function"){
              const youboraAdapter = window.youboraTrackingPlugin.getAdapter();
              if(youboraAdapter.fireError && typeof youboraAdapter.fireError === "function"){
                youboraAdapter.fireError("Problema de conexión");
                if(youboraAdapter.fireStop && typeof youboraAdapter.fireStop === "function"){
                  youboraAdapter.fireStop();
                }
              }
            }
          }
          */

          const p = {
            title: Translator.get('network_error_ConnectException_title', defaultTile),
            content: Translator.get('network_error_ConnectException_msg', defaultContent),
            buttons: [
              {
                content: Translator.get('btn_modal_retry', 'Reintentar'),
                props: {
                  onClick: (e) => {
                    console.log('[REPLAY FROM NETWORK DISCONNECTED] NetworkStatus n modal clic en reintentar checando si hay red...');
                    new DeviceNetworkStatus().isOnline().then(isOnline => {
                      if (isOnline) {
                        console.log('[REPLAY FROM NETWORK DISCONNECTED] NetworkStatus en modal clic en reintentar SI hay red');
                        this.replayFromNetworkDisconnect();
                      }
                      else {
                        console.log('[REPLAY FROM NETWORK DISCONNECTED] NetworkStatus en modal clic en reintentar NO hay red');
                      }
                    });
                  },
                }
              },
              {
                content: Translator.get('btn_modal_ok', 'Aceptar'),
                props: {
                  onClick: (e) => {
                    this.closeModal();
                  },
                }
              }
            ]
          };

          store.dispatch(showModal({
            modalType: MODAL_DESCONEXION,
            modalProps: p
          }));

          if(!this.AAFResolvedParams || !this.AAFResolvedParams.isLive) {
            if(isNaN(this.localCurrentTime)) {
              this.localCurrentTime = 0;
            }
            // Guardar tiempo de reproducción en VOD, para después hacer el resume
            this.localCurrentTime = Math.floor(this.localCurrentTime);
          }
      }
    }
  }

  /*
    here we have a data object like this:
    {
      group_id: "717019",
      content_id: "684659",
      current_content: "false",
      option_id: "O-ES",
      audio: "ORIGINAL",
      subtitle: null,
      option_name: "original",
      id: "ES",
      desc: "Español",
      label_short: "Id. Español",
      label_large: "Idioma Original Español",
      encodes: [
        "hls",
        "hls_kr",
        "hlsfps",
        "hlsfps_kr",
        "hlsprm",
        "smooth_streaming",
        "smooth_streaming_kr",
        "dashwv",
        "dashwv_kr",
        "dvbc"
      ]
    }
  */

  // TODO AAFPlayer, pasar esta lógica a AAPlayer
  changeLang(data, callbackAction) {
    // For test
    //this.handleSubtitlesParser('https://l3edvwdclmxp01.secure.footprint.net/B18386206HD_11EWVMD10C/B18386206HD_11EWVMD10C_spa.webvtt');
    console.log('[Video component] enter changeLang: ', data);

    // HARDCODED Only for nagra live DVBC, data.id_lang only present when get audiotracks from live/dvbc
    if(this.isPlayerFull && this.platform === 'nagra' && data.id_lang && this.props.player.isLive) {
      this.setAudioTrack(data.id_lang);

      return;
    }

    // Language change only in full
    if(this.isPlayerFull) {
      console.log('[Video component] current FULL props: ', this.props.player);
      // If full and trailer nothing to do ¿?
      if(this.AAFResolvedParams.isTrailer) {
        return;
      }

      // Only VOD for all devices
      if(!this.AAFResolvedParams.isLive) {
        // Same lang, nothing to do
        if(data.option_id === this.currentLanguageOptionID) {
          return;
        }
        // Resolve next streamType
        let nextStreamTypeIsMultiple = PlayerAudioSubtitleHelper.ifMultipleStreamExists(this.AAFResolvedParams.currentContentType, data.encodes);

        // Current playing is multiple?
        console.log('[Video component] currentStreamType: ', this.AAFResolvedParams.streamType);
        if(this.playerStreamingUtils.isMultipleStreamType(this.AAFResolvedParams.streamType)) {
          // multiple to multiple (TODO enable or disable parser)
          if(nextStreamTypeIsMultiple) {
            // TODO switch to desired multiple...calling setAudioTrack and enable or disable subtitle parser
            let nextAudio = null;
            let nextSubtitleURL = null;
            if(data.audio) {
              nextAudio = this.playerStreamingUtils.getAudioForSelectedLang(data.audio, this.multipleLangOptions.audio);
            }
            if(data.subtitle) {
              nextSubtitleURL = this.playerStreamingUtils.getSubtitleForSelectedLang(data.subtitle, this.multipleLangOptions.subtitles);
            }
            // On parser
            if(nextSubtitleURL) {
              console.log('[Video component] Parser ON', nextSubtitleURL);
              this.handleSubtitlesParser(nextSubtitleURL);
            }
            // Off parser
            else {
              console.log('[Video component] Parser OFF');
              this.resetSubtitlesParser();
            }
            if(nextAudio && this.platform !== 'workstation') {
              this.setAudioTrack(nextAudio);
              this.setSelectedLanguage(data.option_id);
              callbackAction.play();
            }
          }
          // multiple to single (TODO enable or disable parser)
          else {
            callbackAction.resetSeekInPause();
            this.handleChangeLang(this.AAFResolvedParams.groupId, data, this.AAFResolvedParams.isTrailer, this.AAFResolvedParams.streamType, this.AAFResolvedParams.isLive);
          }
        }
        // current playing single
        else {
          callbackAction.resetSeekInPause();
          // single to multiple (TODO enable or disable parser)
          if(nextStreamTypeIsMultiple) {
            this.handleChangeLang(this.AAFResolvedParams.groupId, data, this.AAFResolvedParams.isTrailer, this.AAFResolvedParams.streamType, this.AAFResolvedParams.isLive);
          }
          // single to single
          else {
            this.handleChangeLang(this.AAFResolvedParams.groupId, data, this.AAFResolvedParams.isTrailer, this.AAFResolvedParams.streamType, this.AAFResolvedParams.isLive);
          }
        }
      }
    }
  }

  /**
   *
   * @param {*} params los params que resolvío AAFPlayer y que fon enviados al playerz
   */


  handleChangeLang(groupId, selectedDataLang, isTrailer, streamType, isLive) {
    // Settear el sig lang seleccionado para que AAFPlayer lo encuentre antes de resolver
    this.setSelectedLanguage(selectedDataLang.option_id);
    let resume = this.getCurrentTime();
    if(selectedDataLang.resume){
      resume = selectedDataLang.resume;
    }

    let poptions = {
        playerstate: 'PLAYING',
        source: {
            //videoid: 764423
            videoid: groupId,
        },
        // Para diferenciar entre cambios de single
        languageoptionid: selectedDataLang.option_id,
        languageoptions: this.AAFResolvedParams.extendedCommonLangOptions,
        ispreview: isTrailer,
        islive: isLive,
        ispip: false,
        // Si llegué aquí entonces es porque practicamente voy a
        // hacer un reemplazo de source en el player, sobreescribo el resume
        // para ignorar el init playback seconds
        resume: resume,
        ischangelang: true,
    };

    AAFPlayer.setPlayerState(poptions);
  }

  setSelectedLanguage(language) {
    console.log('[Video component] setSelectedLanguage:', language);
    DeviceStorage.setItem('default_lang', language);
    this.currentLanguageOptionID = language;
  }

  setAudioTrack(codeTrack) {
    console.log('@@@@@@@@ setAudioTrack 3');
    return this.player.setAudioTrack(codeTrack);
  }

  showError(message, callback = () => {console.log('Error on player');}) {
    const modalProps = {
      callback,
      content: { message }
    };

    store.dispatch(showModal({
      modalType: MODAL_ERROR,
      modalProps: modalProps
    }));
  }

  onPlayerError(errorMessage, errorCode, params, currentTimeSeconds) {

    new DeviceNetworkStatus().isOnline().then(isOnline => {
      if (isOnline) {
        // Si esta en red quiza sea otro tipo de error
        if(this.isPlayerFull) {
          this.onChangingChannel(false);
          this.inPlayerError = true;
          let stvErrorCode = '';
          let playerState = this.player.getCurrentPlayerState();
          if(playerState === PONPLAY
            || playerState === PONPAUSE
            || playerState === PONSTOP) {
              stvErrorCode = '20027';
            }
          else if(playerState === PONCONNECT) {
            stvErrorCode = '20028';
          }
          else {
            stvErrorCode = '3000';
          }

          if(!errorCode) {
            errorCode = playerConstant.onUnknownError;
          }

          const modalProps = {
            onReject: () => {  this.inPlayerError = false; console.log('Modal player Error> ', errorMessage, errorCode); },
            onRetry: () => this.tryReplay(),
            messageModal: (stvErrorCode !== '' ? stvErrorCode + ' ' : '')  + '[' + errorCode + '] '  + errorMessage
          };

          store.dispatch(showModal({
            modalType: MODAL_REINTENTO,
            modalProps: modalProps
          }));
        }

        // Se manda el error track
        let composeError = errorMessage;
        if (errorCode) {
            composeError = '[' + errorCode + '] ' + errorMessage;
        }

        TrackerManager.error(composeError, currentTimeSeconds, params.streamType);

        if(params.isLive)
          TrackerManager.errorLive(composeError, currentTimeSeconds, params.streamType)
        else
          TrackerManager.errorContent(composeError, currentTimeSeconds, params.streamType);

      }
      // Si no esta en red el player controla su network disconnect
      else {
        console.log('[REPLAY FROM NETWORK DISCONNECTED] cayó un playerError pero seguro fue de red, se ajusta arriba');
      }
    });
  }

  tryReplay() {
    this.inPlayerError = false;
    // Usemos el mismo método para network disconnect
    this.replayFromNetworkDisconnect();
  }

  onBookMark(time){
    const seekObject = {
      seek_start: time,
    };
    TrackerManager.seek(seekObject);
  }

  onBitrateChange(bitrate, bandwidth){
    console.log('Video onBitrateChange bitrate, bandwidth',bitrate, bandwidth);
    if(bitrate !== 0 && bandwidth !== 0){
      TrackerManager.bitRateChange(bitrate, bandwidth);
    }

  }

  async getContentData(gid) {
    let contentData = await api.contentData(gid);
    return contentData;
  }

  async changeChannel(newChannelIndex, isgid = false, channel) {

    if (this.isChangingChannel()) {
      return;
    }
    if(channel){
      this.onSelectCard(channel);
    }

    this.firstTimeCB = true;

    let gid = isgid?newChannelIndex:this.channelJSONPurchased[newChannelIndex];
    //TvChannelUtil.setLastChannel(gid); solo se debe de ejecutar en onResolveParams de components/Video

    let newChannel={
      playerstate: 'PLAYING',
      source: {
        videoid: gid
      },
      // Force full player al cambiar canal
      size: {
        top: 0,
        left: 0,
        width: 1280,
        height: 720,
      },

      ispreview: false,
      islive: true,
      ispip: false,
      cb: ()=>{
        if (this.refs.playerControls && !isgid) {
          //this.refs.playerControls.hide();
          this.firstTimeCB = false;
        }
      }
    };
    console.log('[AAF Quick] before request AAFPlayerChange', new Date()- window.startTime);

    // Ahorita se mantiene el dispatch, para que AAFPlayer este en sync con props de video component
    // Pero sí considerar revisar alguna forma de mantener en sync props y AAF state en sync para que
    // se puedan hacer cosas como AAFPlayer.setPlayerState directamente y mejorar performance

    if (newChannel && newChannel.source && newChannel.source.videoid) {
      DeviceStorage.setItem("lastChannel", newChannel.source.videoid);
    }
    store.dispatch(playFullMedia(newChannel));
    /*
    if (this.props.player.islive) {
      store.dispatch(playFullMedia(newChannel));
      //AAFPlayer.setPlayerState(newChannel, this.getAAFPlayerWrapper(), this.getAAFCallbacks())
    }
    else {
      store.dispatch(playFullMedia(newChannel));
    }
    */


  }


  changeContentfromSelector(groupId){
    // Mandar trackstop/track episode change
    TrackerManager.episodeChange(this.getCurrentTime(), this.AAFResolvedParams.streamType);
      let newChapter={
        playerstate: 'PLAYING',
        source: {
          videoid: groupId
        },
        ispreview: false,
        islive: false,
        ispip: false,
        ischangeepisode:true,
      };

      AAFPlayer.setPlayerState(newChapter, this.getAAFPlayerWrapper(), this.getAAFCallbacks())

      if (this.refs.playerControls) {
        this.refs.playerControls.show();
      }
  }

  getChUpChannel () {
    let lastChannel = DeviceStorage.getItem('lastChannel');
    let lastChannelIndex = lastChannel ? this.channelJSONPurchased.indexOf(lastChannel) : -1;
    let channelIndex =  this.esteCanal;
    channelIndex =  lastChannelIndex !== -1 ? lastChannelIndex : this.esteCanal === -1 ? 0 : this.esteCanal;
    let newChannelIndex = channelIndex === this.channelJSONPurchased.length - 1 ? 0 : channelIndex + 1;
    return newChannelIndex;
  }

  getChDownChannel() {
    let lastChannel = DeviceStorage.getItem('lastChannel');
    let lastChannelIndex = lastChannel ? this.channelJSONPurchased.indexOf(lastChannel) : -1;
    let channelIndex =  lastChannelIndex !== -1 ? lastChannelIndex : this.esteCanal === -1 ? 0 : this.esteCanal;
    let newChannelIndex = channelIndex === 0 ? this.channelJSONPurchased.length - 1 : channelIndex - 1;
    return newChannelIndex;
  }

  changeCurrentGroupId(currentEpg){
    this.currentEpg = currentEpg;
  }

  intervalPlayMiniEpg(){
    if(this.currentEpg && !Utils.isEmpty(this.currentEpg)){
      const { channel } = this.currentEpg;
      let gid = channel.group_id;
      this.hideEpgOutside(gid, channel);
    }
  }

  setFromProps(value){
    this.fromProps = value;
  }

  async playWhenStopMiniEpg(key) {
   if(!Utils.isEmpty(this.props.player) && this.props.player.playerstate === AAFPLAYER_PLAY){
     this.setFromProps(true);
     if(this.props.player.islive && !AAFPlayer.livePlayingAsPip()){
      if(this.playInMini){
         clearTimeout(this.playInMini);
      }
      this.playInMini = setTimeout(this.intervalPlayMiniEpg, 500);
     }else{
      switch (key) {
        case 'CH_UP':
          await this.changeChannel(this.getChUpChannel());
          break;
        case 'CH_DOWN':
          await this.changeChannel(this.getChDownChannel());
          break;
        default:
          break;
      }
     }
   }
  }

  keyPressHandler(e) {
    window.startTime=new Date();
    //console.log('[AAF Quick] press key', new Date()- window.startTime, this.channelJSONPurchased.length);
      if (this.channelJSONPurchased.length === 0) {
          return;
      }

    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    if (!this.keyActionsEnabled) {
      return false;
    }

    switch (currentKey) {
      case 'CH_UP':
      case 'CH_DOWN':
            store.dispatch(navigateFrom('Keys'));
            if(!this.AAFResolvedParams || !this.AAFResolvedParams.isLive){
              break;
            }
            if(Utils.choiceBehaviorChannelChange() && (!Utils.isFullEpgOpen() && !Utils.isFullEpgMosaicOpen())){
              this.playWhenStopMiniEpg(currentKey);
            }else{
              this.handleDelayKey(e, currentKey);
            }
        break;
      case 'PREV':
      let playerOptions = AAFPlayer.getCurrentPlayerOptions(false);
      let act = TvChannelUtil.handlePREV();
        if(playerOptions.islive && act.action == 'channelchange'){
             this.setFromProps(true);
             store.dispatch(playFullMedia(
              {
               playerstate: 'PLAYING',
               source: {
                 videoid: act.gid
               },
               size: {
                top: 0,
                left: 0,
                width: 1280,
                height: 720,
              },
              ispreview: false,
              islive: true,
              ispip: false
            }
           ));
        }
       break;
      default:
       break;
    }
  }

  // CoverFlow functions start
  updateEpg(channel, event, focused) {
    if (typeof this.onUpdateEpg == 'function') {
      this.onUpdateEpg(channel.group_id);
    }
  }

  handleEpgCover() {
    this.hideCoverFlow();
    this.handleEpg(true);
  }

  hideCoverFlow() {
    const selector = '.focusable';
    super.hideCoverFlow(selector);
  }

  delayCoverFlow() {
    clearTimeout(this.timerCoverFlow);
    this.timerCoverFlow = setTimeout(() => this.hideCoverFlow(), this.delayHideCoverFlowTime);
  }

  enableColorActions() {
    this.keyActionsEnabled = true;
  }

  disableColorActions() {
    this.keyActionsEnabled = false;
  }

  channelsCoverFLow(data) {
    this.channelsPurchased = data.filter(channel => this.channelJSONPurchased.indexOf(channel.group_id) > -1);
    let groupId = this.ResolvegroupId || (this.props.player.source && this.props.player.source.videoid);
    // console.log('[dann] canal de reproduccion actual:,', groupId);
    this.current.channel = {
      group_id: groupId,
    };
    // groupid es el canal actual en reproduccion, se usara este id para comparar todos los datos del current data que se envia a CoverFlow components

  }

  async handleDelayKey(e, key) {

    const pathname = window.location.pathname.split('/');
    if(pathname.indexOf(settings.path_suscription) !== -1){
       return;
     }

    this.isKeysBloqued = !!(this.lastKey === key && this.pressTimer);
    this.lastKey = key;

    if (this.lastKey !== key && this.pressTimer) {
      clearTimeout(this.pressTimer);
    }
    if (this.isKeysBloqued) {
      if(Utils.getCoverFlowVisibilityFromMetadata().enable){
        e.stopPropagation();
        e.preventDefault();
        this.launchCoverFlow(true);
      }
      if(this.state.showEpg) this.handleEpg(false);
    } else {
      this.pressTimer = setTimeout(this.resetTimer, this.delayKeyTime);
      switch (key) {
        case 'CH_UP':
          await this.changeChannel(this.getChUpChannel());
          break;
        case 'CH_DOWN':
          await this.changeChannel(this.getChDownChannel());
          break;
        default:
          break;
      }
    }
  }
// CoverFlow functions finish


  replaceVideoSource(PGM, streamType, isLive, selectedDataLang) {
    let pgm = this.playerStreamingUtils.replaceSourceMedia(PGM, streamType, this.props.player.provider);

    // TODO check when nagra or samsung or whatever tv...if device support replace video url
    let newSource = {
      src: this.platform !== "workstation" ? pgm.media.video_url : "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?t=" + Math.random(),
      drmInfo: {device_id: null, server_url: null, content_id: null, challenge: null}, // reset to null, just in case...
      streamType: streamType,
      isLive: isLive,
      resume: null,
      //newPGM: pgm, // <- ¿? TODO ya no se debería de usar, se usa la de ababjo, conservando mismo attr "playerMedia"
      playerMedia: pgm,
      selectedDataLang: selectedDataLang
    }
    const config = getAppConfig();
    newSource.drmInfo.device_id = config.device_id;

    if(pgm.media.server_url) {
      newSource.drmInfo.server_url = pgm.media.server_url;
    }
    if(pgm.media.challenge) {
      newSource.drmInfo.challenge = pgm.media.challenge;
    }
    if(selectedDataLang.content_id) {
      newSource.drmInfo.content_id = selectedDataLang.content_id;
    }
    if(pgm.media.initial_playback_in_seconds) {
      newSource.resume = pgm.media.initial_playback_in_seconds;
    }
    //this.clearLoading();

    let purchasableObject = false;
    if(this.platform === 'nagra' && isLive) {
      console.log('[eventObject.eventId] source', newSource.src);
      let srcArray = newSource.src.split('.');
      let eventObject = PPE.getEventCurrent(srcArray[1]);
      console.log('[eventObject.eventId]', eventObject.eventId);
      purchasableObject = PPE.getPurchasableObject(eventObject);
      console.log('[purchasableObject]', purchasableObject);
    }

    if (!purchasableObject) {
        store.dispatch(replaceFullSourceMedia(newSource));
    } else {
        store.dispatch(showModal({
          modalType: MODAL_PPE,
          modalProps: { callback: (a) => {
                            if(PPE.initiatePPVEventPurchase()) store.dispatch(replaceFullSourceMedia(newSource));
                        }
                      }
        }));
    }

    // resolution of audio and subtitle happen after we replace new source
  }

  resetSubtitlesParser() {
    //return; //only for test
    let subtitlesParser = {
      subtitle: null,
      className: null
    };

    this.setState({subtitleparser: subtitlesParser});
  }

  setCurrentTime(time) {
    if(typeof this.state.handleChangeSubtitle ==='function' && time);
      this.state.handleChangeSubtitle(time); //esta funcion se setea desde VirtualSubtitles
    this.localCurrentTime = time;
  }

  getCurrentTime() {
    return this.localCurrentTime;
  }


  goToCard(path,extradata){
    this.props.changePath(path, extradata)
  }

  handleSubtitlesEndPlayer(e) {

    /* groupId={state.groupId}
     title={state.title}
     previewImg={state.previewImg}
     backgroundImg={state.backgroundImg}
     next={state.next}
     recommendations={state.recommendations}
     serieData={state.serieData}*/

    let next = null;
    if(this.AAFResolvedParams.playerMedia.next_group && this.AAFResolvedParams.playerMedia.next_group.common) {
      next = this.AAFResolvedParams.playerMedia.next_group.common;
    }
    let path = '/endplayer/'+'1111'

    // TODO validar cuando no haya groupid

    let bg = null;
    if(this.AAFResolvedParams.playerMedia.group
      && this.AAFResolvedParams.playerMedia.group.common
      && this.AAFResolvedParams.playerMedia.group.common.image_background
    ) {
      bg = this.AAFResolvedParams.playerMedia.group.common.image_background;
    }

    let title = '';
    if(this.AAFResolvedParams.playerMedia.group
      && this.AAFResolvedParams.playerMedia.group.common
      && this.AAFResolvedParams.playerMedia.group.common.title
    ) {
      title = this.AAFResolvedParams.playerMedia.group.common.title;
    }

    let extradata = {
      groupId: this.AAFResolvedParams.groupId,
      title: title,
      previewImg: '',
      backgroundImg: bg,
      next: next,
      recommendations:this.AAFResolvedParams.recommendations ? this.AAFResolvedParams.recommendations : [],
      serieData: this.serieData
    };
    this.props.changePath(path, extradata)

    console.log('handleSubtitlesEndPlayer FIN PLAYER');
    if(this.state.subtitleparser.subtitle)
    {
      let subtitleparser = {
        className: subs_in_end_player,
        subtitle: this.state.subtitleparser.subtitle // Same subs
      };
      this.setState({subtitleparser: subtitleparser});
    }
    this.refs.playerControls.hide();
  }

  controlBarIsShowed(isShowed) {
    if(this.state.subtitleparser.subtitle) {
      document.dispatchEvent(new CustomEvent('handlesubtitlesscreenposition', { detail: {isShowed: isShowed, className: subs_in_controls} } ));
    }
  }

  async handleSubtitlesParser(url) {
    console.log('[Video component] llegando a handleSubtitlesParser', url);
    let subtitlesParser = {
      subtitle: null,
      className: null
    };
    // On parser
    try {
      if(url) {
        let provider=null;
        if(this.AAFResolvedParams && this.AAFResolvedParams.provider)
        {
          provider=this.AAFResolvedParams.provider;
        }
        let subtitlesTask = new PlayerSubtitlesTask(url,provider) ;
        let vtt = await RequestManager.addRequest(subtitlesTask);
        subtitlesParser.subtitle = vtt;
        // start subs with playerControls in on
        subtitlesParser.className = subs_in_controls;
      }
    }
    catch(e) {
      console.log('[Video component] error catch', e);
    }

    console.log('[Video component] terminando handleSubtitlesParser');
    this.setState({subtitleparser: subtitlesParser});
  }

  componentWillUnmount() {
    this.player.deinit();
    document.removeEventListener(settings.end_vod_fire_event, this.handleSubtitlesEndPlayer);
    document.removeEventListener(settings.show_epg, this.handleEpgVisibility);
    document.removeEventListener('keydown', this.keyPressHandler, false);
    document.removeEventListener(settings.event_change_network_status, this.handleNetworkDisconnection);
  }

  handleEpgVisibility(e) {
    const showEpg = e.detail ? e.detail : e;
    if (this.state.showEpg !== showEpg) {
        if(showEpg == true)
            this.setState({ showEpg });
        else // Si se oculta, se resetea el filtro
            this.setState({ showEpg, filterEpg: null });
    }
  }

  onCanPlay() {
    if(!this.isPlayerFull) return;
    if (this.refs.playerControls && this.refs.playerControls.onCanPlay) {
      this.refs.playerControls.onCanPlay();
    }
    if(this.deviceAttachAlreadyResponsed){ //si respondio deviceAttach aqui enviamos el evento, en caso de VOD estara en true la bandera
      //para LIVE enviamos 0 y para VOD si tiene bookmark lo enviamos

      const time = this.AAFResolvedParams.isLive? 0 : this.AAFResolvedParams.resume? this.AAFResolvedParams.resume: this.getCurrentTime();
      TrackerManager.playing(time);
    }
    else{//seteamos bandera para que el evento sea enviado en onResolveParams si se ejecuta primero onCanPlay
      this.videoCanPlay=true;
    }
  }



  onBufferStart(evt, params) {
    if(!this.isPlayerFull) return;
    if (this.refs.playerControls && this.refs.playerControls.onBufferStart) {
      this.refs.playerControls.onBufferStart();
    }

   // if(params && params.stream_type) // AAFPlayer Quitar esto después cuando se quite el old video component
    TrackerManager.bufferStart();
  }

  onBufferEnd(evt, params) {
    if(!this.isPlayerFull) return;
    if (this.refs.playerControls && this.refs.playerControls.onBufferEnd) {
      this.refs.playerControls.onBufferEnd();
    }
   // if(params && params.stream_type) // AAFPlayer Quitar esto después cuando se quite el old video component
    TrackerManager.bufferEnd();
  }

  updateCurrentTime(currentTime) {
    if(!this.isPlayerFull) return;

    // Modificacion para fastPlay
    // if(!Utils.isModalHide() && this.AAFResolvedParams.isLive && !this.AAFResolvedParams.ispip){
    //   const modalType=Utils.modalType();
      // if(modalType===MODAL_PIN){
      //   AAFPlayer.pause();
      // }
    // }


    // Integracion YOUBORA
    TrackerManager.setPlayhead(currentTime);

    //console.log('[REPLAY FROM NETWORK DISCONNECTED] [Video component] ' + currentTime);
    if (this.refs.playerControls && this.refs.playerControls.updateCurrentTime) {
      this.refs.playerControls.updateCurrentTime(currentTime);
    }
    this.setCurrentTime(currentTime);
    if(this.AAFResolvedParams.resume !== currentTime){//Cuando empieza con bookmark evitamo que se envie primero que track start
      if(currentTime-this.lastUpdate > PlayerTracker.policies.tickInterval)
      {
        this.lastUpdate=currentTime;
        TrackerManager.tick(currentTime);
      }
      else if(currentTime-this.lastUpdate<0)
      {
        this.lastUpdate=currentTime;
      }
    }
  }

  updateDurationTime(duration) {
    if(!this.isPlayerFull) return;
    if (this.refs.playerControls && this.refs.playerControls.updateDurationTime) {
      this.refs.playerControls.updateDurationTime(duration);
    }
  }

  onPlayingSong(){
    if(!this.isPlayerFull) return;
    if (this.refs.playerControls && this.refs.playerControls.onPlayingSong) {
      this.refs.playerControls.onPlayingSong();
    }
  }

  onPlayingRadio(){
    if(!this.isPlayerFull) return;
    if (this.refs.playerControls && this.refs.playerControls.onPlayingRadio) {
      this.refs.playerControls.onPlayingRadio();
    }
  }

  onFinishSong(){
    if(!this.isPlayerFull) return;
    if (this.refs.playerControls && this.refs.playerControls.onFinishSong) {
      this.refs.playerControls.onFinishSong();
    }
  }

  onEnded(params) {
    if(!this.isPlayerFull) return;
    // AAFPlayer on ended
    console.log('[AAFPlayer] player onEnded player', params);
    // Update state of players to 'not playing' when content reached end of the content (or back key)
    if(params.streamType === playerConstant.AUDIO || params.streamType === playerConstant.RADIO) {
      const state = store.getState();
      const user = state.user.musicUser;

      MusicUtils.checkSinglePlay(user).then((singlePlayResponse) => {
        if(!singlePlayResponse.status){
          store.dispatch(showModalSinglePlay());
        } else { this.onFinishSong();}
      }).catch(err => {
        this.onFinishSong();
      });
    } else {
      // TODO check reset en player (onfinish event)
      TrackerManager.end(this.getCurrentTime(), params.streamType);
      TrackerManager.stopTicking(params.streamType);
    }

    console.log("[VideoComponent] component onEnded");
    let sendTracking = true;
    if (this.props.player && this.props.player.ispreview) {
      sendTracking = false;
    }

    if(params.streamType !== playerConstant.AUDIO && params.streamType !== playerConstant.RADIO) {
      this.goBack(sendTracking);
      store.dispatch(playFullMedia({    //dispatch para actualizar el estado del player en el fin player
        ispip: false,
        islive: this.AAFResolvedParams.isLive,
        playerstate: AAFPLAYER_STOP
      }));
    }


  }

  componentWillMount() {
    this.testAAF();
  }

  updateAllEgps = () => {
    console.log('[Video] actualizando epgs');
    this.AllEpgs = false;
    this.forceUpdate();
    setTimeout(()=>{
      console.log('[Video] se actualizaron epgs');
      this.AllEpgs = true;
      this.forceUpdate();
    },5000);
  }

  componentDidMount() {
    if(this.props.updateApp.length===0)
      this.props.updateApp.push(this.updateAllEgps);
    this.initTrackerManager();

    document.addEventListener(settings.end_vod_fire_event, this.handleSubtitlesEndPlayer);
    // TODOAAFPlayer manejar pip y full
    AAFPlayer.setup(this.getAAFPlayerWrapper(),this.getAAFCallbacks());
    document.addEventListener(settings.end_vod_fire_event, this.handleSubtitlesEndPlayer);
    document.addEventListener(settings.show_epg, this.handleEpgVisibility);
  }

  componentDidUpdate (props) {
    if(typeof this.props.player.cb === 'function' && this.firstTimeCB){
      this.props.player.cb();
    }

    if(this.props.player.playerstate && this.props.player.playerstate === 'PLAYING'){
      this.setState({ showMiniEpg: true });
    }
    document.removeEventListener('keydown', this.keyPressHandler, false);
    document.addEventListener('keydown', this.keyPressHandler, false);
    new ChannelSingleton().getChannels().then(this.fillFullChannels.bind(this));
    //console.info('[VideoComponent] componentDidUpdate', props);

    // Youbora: Se setea y se evitan duplicados en el tipo de subscriciones para youboraParams[1] si es VOD o Live
    const dataStore = store.getState();
    const islive = dataStore.player.islive;
    if(typeof islive !== 'undefined'){
      // window.youboraParams[1].value = ""; // goose -- se saca youbora
      if(islive) {
        // Se setea el Tipo de abono para youboraParams[2] cuando el contenido es Live, si el contenido es free no lo manda
        // if(dataStore.player && dataStore.player.source && dataStore.player.source.videoid){
        //   dataStore.linealChannels.filter(item => {
        //     if(item.id === dataStore.player.source.videoid) window.youboraParams[2].value = item.key;
        //   });
        // }
        // goose -- se saca youbora
        /*
        if(dataStore.linealChannels){
          dataStore.linealChannels.forEach(item =>
            {
              if(window.youboraParams[1].value.indexOf(item.key) === -1) window.youboraParams[1].value += window.youboraParams[1].value.length === 0 ? item.key : '-'+item.key;
            }
          );
        }
        */

      } else {
        if(dataStore && dataStore.user && dataStore.user.paywayProfile && dataStore.user.paywayProfile.subscriptions){
          // goose -- se saca youbora
          /*
          dataStore.user.paywayProfile.subscriptions.forEach(item =>
            {
              if(window.youboraParams[1].value.indexOf(item.key) === -1) window.youboraParams[1].value += window.youboraParams[1].value.length === 0 ? item.key : '-'+item.key;
            }
          );
          */
        }
      }
    }

  }

  /*
    TODO revisar en conjunto con los players states
    por el momento solo recupera el "estado" del player full y live
    para controlar si solo se hace resize o se recarga el player
  */
  fullPlayerAsPip(nextPlayerProps, currentPlayerProps) {
    console.log('[VideoComponent] fullPlayerAsPip ',
      '\ncurrentPlayerProps', currentPlayerProps,
      '\ncurrentPlayerProps.size', currentPlayerProps.size,
      '\nnextPlayerProps.isLive', nextPlayerProps.isLive,
      '\nthis.isPlayerFull', this.isPlayerFull,
      '\nnextPlayerProps.size', nextPlayerProps.size);

    if (nextPlayerProps.isLive
      && currentPlayerProps.src // Si ya estaba playeando
      && nextPlayerProps.src // Si va a continuar playeando
      && this.isPlayerFull // Si es full
      && currentPlayerProps.size // Si tiene size
      && currentPlayerProps.size.width < 1280 // Si ese resize fue para hacer full a pip
      && !nextPlayerProps.size // Si el next play no es resize
      && currentPlayerProps.src == nextPlayerProps.src
    ) {

      return true;
    }
    return false;
  }

  streamIsVideo(streamType) {
    return Utils.streamIsVideo(streamType);
  }

  streamIsAudio(streamType) {
    return Utils.streamIsAudio(streamType);
  }

  streamIsSpot(streamType) {
    return Utils.streamIsSpot(streamType);
  }

  handleStopTracking(nextProps) {
    // No es full, nada que hacer
    if(!this.isPlayerFull) {
      return;
    }
    // Props actuales
    let currentProps = this.props.player;

    // Si el source actual es null, nada que hacer
    if(!currentProps.src) {
      return;
    }

    // Si el source actual es musica, nada que hacer
    if(!this.streamIsVideo(currentProps.streamType)) {
      return;
    }

    // Si viene para resize mismo source, nada que hacer
    if(nextProps.size && (currentProps.src === nextProps.src)) {
      return;
    }

    // TODO revisar, testear por casos faltantes, omitidos
    // Inicia nueva reproducción? LIVE o VOD
    // CASOS =============================================
    let stopUrl = null;

    // Cambia url, full a null
    if(
      (currentProps.src !== nextProps.src && currentProps.src) // Url distinto
      && (!currentProps.newSource || !currentProps.newSource.src)
    ) {
      console.log('[VideoComponent] handleStopTracking full a null');

      stopUrl = (currentProps.playerMedia
        && currentProps.playerMedia.tracking
        && currentProps.playerMedia.tracking.urls
        && currentProps.playerMedia.tracking.urls['stop']
      );
    }

    // Cambia de replace a null
    if(
      (currentProps.newSource && currentProps.newSource.src)
      && (!nextProps.src)
    )
    {
      console.log('[VideoComponent] handleStopTracking replace a null');
      stopUrl = (currentProps.newSource.playerMedia
        && currentProps.newSource.playerMedia.tracking
        && currentProps.newSource.playerMedia.tracking.urls
        && currentProps.newSource.playerMedia.tracking.urls['stop']
      );
    }

    // De full a replace
    if(
        (nextProps.newSource && nextProps.newSource.src) // viene replace
        && currentProps.src // y actualmente reproduciendo
        && (!currentProps.newSource || !currentProps.newSource.src) // no había replace antes
      )
      {
        console.log('[VideoComponent] handleStopTracking full a replace');
        stopUrl = (currentProps.playerMedia
          && currentProps.playerMedia.tracking
          && currentProps.playerMedia.tracking.urls
          && currentProps.playerMedia.tracking.urls['stop']
        );
      }

    // De replace a replace
    if (
      (currentProps.newSource && currentProps.newSource.src) // si actualmente playea en replace
      && (nextProps.newSource && nextProps.newSource.src) // y sigue otro replace
      && (currentProps.newSource.src !== nextProps.newSource.src) // y el sig replace es diferente
      && currentProps.src // Estaba playeando desde un full y paso al replace
    )
    {
      console.log('[VideoComponent] handleStopTracking replace a replace');
      stopUrl = (currentProps.playerMedia
        && currentProps.newSource.playerMedia.tracking
        && currentProps.newSource.playerMedia.tracking.urls
        && currentProps.newSource.playerMedia.tracking.urls['stop']
      );
    }

    // De replace a full
    if(
      (currentProps.newSource && currentProps.newSource.src) // Esta playeando en replace
      && nextProps.src
      && (!nextProps.newSource || !nextProps.newSource)
    ) {
      console.log('[VideoComponent] handleStopTracking replace a full');
      stopUrl = (currentProps.playerMedia
        && currentProps.newSource.playerMedia.tracking
        && currentProps.newSource.playerMedia.tracking.urls
        && currentProps.newSource.playerMedia.tracking.urls['stop']
      );
    }

    if(stopUrl) {
      console.log('[VideoComponent] handleStopTracking url: ', stopUrl);
      this.handleTrackStop(stopUrl, currentProps.streamType, currentProps.isLive);
    }
    /*else {
      console.log('[VideoComponent] handleStopTracking ',
        '\nNO url (quiza no trae stopUrl?, por ej en vod-trailer) ');
    }*/
  }

  handleTrackStop(stopUrl, streamType, isLive) {
    let curTime = this.player.getCurrentTime();
    if(isNaN(curTime)) {
      curTime = 0;
    }
    // TODO checar este valor, con 0 la api lo rebota,
    // y si es live y algunos devices no reportan currenttime y ademas pgm de live regresa que sí hay/ stop
    if(curTime < 1) {
      curTime = 1;
    }
    // this.player.trackerManager.stop(curTime, this.props.player.streamType, stopUrl, isLive);
  }

  // resolveAudioSubtitleFromReplace Play en replace, inicia revisando el lang que seleccionó el user
  resolveAudioSubtitleFromReplace(nextPlayerProps) {
    // Select track and subtitle to start, if any when replace
    let currentSubtitleURL = null;
    let currentAudio = null;
    let subtitle_id = null;

    if(this.playerStreamingUtils.isMultipleStreamType(nextPlayerProps.newSource.streamType)) {
      this.currentStreamType = nextPlayerProps.newSource.streamType;
      if(nextPlayerProps.newSource.selectedDataLang.audio) {
        currentAudio = this.playerStreamingUtils.getAudioToPlay(nextPlayerProps.newSource.selectedDataLang.audio, nextPlayerProps.newSource.playerMedia.group.common.extendedcommon.media.language.options.option);
      }

      if(currentAudio && this.platform !== 'workstation') {
        console.log('@@@@@@@@ setAudioTrack from replace url', currentAudio);
        this.setAudioTrack(currentAudio);
      }
      // Subtitle parser multiple?
      if(nextPlayerProps.newSource.selectedDataLang.subtitle) {
        subtitle_id = this.playerStreamingUtils.getSubtitleToPlay(nextPlayerProps.newSource.selectedDataLang.subtitle, nextPlayerProps.newSource.playerMedia.group.common.extendedcommon.media.language.options.option);
      }
      if(subtitle_id) {
        currentSubtitleURL = this.playerStreamingUtils.getSubtitleForSelectedLang(subtitle_id, this.multipleLangOptions.subtitles);
      }
    }
    // If single
    else {
      if(nextPlayerProps.newSource.selectedDataLang.subtitle) {
        subtitle_id = this.playerStreamingUtils.getSingleSubtitleToPlay(nextPlayerProps.newSource.selectedDataLang.content_id, nextPlayerProps.newSource.playerMedia.group.common.extendedcommon.media.language.options.option);
      }
      if(subtitle_id) {
        currentSubtitleURL = this.playerStreamingUtils.getSubtitleForSelectedLang(subtitle_id, this.multipleLangOptions.subtitles);
      }
    }
    console.log('[Video component] replace play subtitle & audio: ', currentSubtitleURL, currentAudio);
    // single Run parser
    if(currentSubtitleURL) {
      console.log('[Video components] Parser ON');
      this.handleSubtitlesParser(currentSubtitleURL);
    }
    else {
      console.log('[Video components] Parser OFF');
      this.resetSubtitlesParser();
    }
  }

  // resolveAudioSubtitleFromStart Play por primera vez, inicia revisando preferencia de idioma desde storage
  resolveAudioSubtitleFromStart(nextPlayerProps) {
    let currentAudio = null;
    let currentSubtitleURL = null;
    // If multiple (content_id must be null)
    if(this.playerStreamingUtils.isMultipleStreamType(nextPlayerProps.streamType)) {
      console.log('[Video component] first play, is multiple', this.multipleLangOptions);
      // Storage first priority
      let option_id_lang = null;
      option_id_lang = DeviceStorage.getItem('default_lang');
      if(option_id_lang) {
        //let lang_id = this.playerStreamingUtils.getLangIDByOptionID(option_id_lang, this.langOptions);
        let subtitle_id = this.playerStreamingUtils.getSubtitleToPlay(option_id_lang, this.langOptions);
        let audio_id = this.playerStreamingUtils.getAudioToPlay(option_id_lang, this.langOptions);
        console.log('[Video component] first play, is multiple, lang for storage', option_id_lang, subtitle_id, audio_id, this.langOptions, this.multipleLangOptions);
        if(audio_id) {
          currentAudio = this.playerStreamingUtils.getAudioForSelectedLang(audio_id, this.multipleLangOptions.audio);
        }
        if(subtitle_id) {
          currentSubtitleURL = this.playerStreamingUtils.getSubtitleForSelectedLang(subtitle_id, this.multipleLangOptions.subtitles);
        }
      }
      else {
        console.log('[Video component] first play, is multiple, lang does not come from storage');
        if(this.multipleLangOptions.audio.selected) {
          currentAudio = this.multipleLangOptions.audio[this.multipleLangOptions.audio.selected];
        }
        if(this.multipleLangOptions.subtitles.selected) {
          currentSubtitleURL = this.multipleLangOptions.subtitles[this.multipleLangOptions.subtitles.selected].external;
        }
      }
      // multiple Run parser
      if(currentSubtitleURL) {
        this.handleSubtitlesParser(currentSubtitleURL);
      }
      // multiple Change audio track
      if(currentAudio && this.platform !== 'workstation') {
        this.setAudioTrack(currentAudio);
      }
    }
    // If single (content_id is not null)
    else {
      let subtitle_id = this.playerStreamingUtils.getSingleSubtitleToPlay(nextPlayerProps.drmInfo.content_id, this.langOptions);
      if(subtitle_id) {
        currentSubtitleURL = this.playerStreamingUtils.getSubtitleForSelectedLang(subtitle_id, this.multipleLangOptions.subtitles);
        // single Run parser
        if(currentSubtitleURL) {
          this.handleSubtitlesParser(currentSubtitleURL);
        }
      }
    }
    console.log('[Video component] first play subtitle & audio: ', currentSubtitleURL, currentAudio);
  }

  // INIT ================================================================================================================================================
  // Para el nuevo AAFPlaying:

  getAAFCallbacks() {
    return {
      onProgress: this.updateCurrentTime,
      onDurationChange: this.updateDurationTime,
      onFinishSong: this.onFinishSong,
      onPlayingSong: this.onPlayingSong,
      onPlayingRadio: this.onPlayingRadio,
      onCanPlay: this.onCanPlay,
      onEnded: this.onEnded,
      onBufferingStart:this.onBufferStart,
      onBufferingFinish:this.onBufferEnd,
      onPlayerError: this.onPlayerError,

      // Player event, para enviar tracker manager por si...
      onLoad: this.onLoad.bind(this),

      setLoading: this.setLoading.bind(this),
      clearLoading: this.clearLoading.bind(this),

      // Custom events
      onResolveParams: this.onResolveParams,
      onResolveResizePlayer: this.onResolveResizePlayer,
      onResolveError: this.onResolveError,
      onResolveShowModal: this.onResolveShowModal,
      //onDoTimeshift: this.onDoTimeshift,

      // Player controls events
      onPlayerControlPlay: this.onPlayerControlPlay,
      onPlayerControlPause: this.onPlayerControlPause,
      onPlayerControlResume: this.onPlayerControlResume,
      onPlayerControlStop: this.onPlayerControlStop,
      onPlayerControlSeek: this.onPlayerControlSeek,
      onPlayerSetAudioTrack: this.onPlayerSetAudioTrack,

      // Fin player event
      onPlayerEndPlayer: this.onPlayerEndPlayer,
      // Cambio de contenido, stop current playing
      onPlayerStopMedia: this.onPlayerStopMedia,
      changePath: this.goToCard,
      // Evento para tizen
      onReplay: this.tryReplay,
      // Evento para seek tracking
      onBookMark: this.onBookMark,
      onBitrateChange: this.onBitrateChange,
    };
  }

  /**
   * TODO
   */
  getAAFPlayerWrapper() {
    return this.refs.VideoContainer;
  }

  testAAF() {
    /*
    TODO QUITAR llamados a este método, only for test***
    */

    // TODO en AAFPlayer, en nuevo video component, bindear los métodos que recibirán los eventos del player (todos los callbacks en getAAFCallbacks)
    let callbacks = this.getAAFCallbacks();
    let container = this.getAAFPlayerWrapper();

    //AAFPlayer.setPlayerState(DummyDataPlay.getDummyDataPlay(0), container, callbacks);

    setTimeout(() => {
        //AAFPlayer.setPlayerState(DummyDataPlay.getDummyDataPlay(1), container, callbacks);
    }, 25000);
  }

  getDuration() {
    if(!this.isPlayerFull) return;
    if(this.AAFResolvedParams && this.AAFResolvedParams.streamType == playerConstant.AUDIO && store.dispatch(isPreviewSong())) {
      return '30';
    }
    else {
      return AAFPlayer.getDuration();
    }
  }

  onPlayerControlPlay(params) {
    if(!this.isPlayerFull) return;
  }

  onPlayerControlPause(params, timeshiftAllowed) {
    if(!this.isPlayerFull) return;
    if(params.streamType !== playerConstant.AUDIO && params.streamType !== playerConstant.RADIO) {
      if (params.isLive && timeshiftAllowed) {
          this.timeShift = m().format("YYYY/MM/DD hh:mm:ss");
      }
      TrackerManager.pause(this.getCurrentTime(), params.streamType);
    }
  }

  onPlayerControlResume(inputPlayerParams, outputPlayerParams) {
    if(!this.isPlayerFull) return;
    TrackerManager.resume(this.getCurrentTime(), outputPlayerParams.streamType);
    // Se necesita hacer timeshift?
    let ofFull = false; // timeshift solo sobre full
    /*
    if (inputPlayerParams.islive && AAFPlayer.getCurrentContentType(ofFull) === AAF_CONTENT_IS_TIMESHIFT) {
      // Hacer un nuevo timeshift, donde se quedó la pausa
      if(this.timeShift) {
        inputPlayerParams.starttime = this.timeShift;
        this.performTimeShift(inputPlayerParams);
      }
    }
    */
  }

  onPlayerControlStop(params) {
    if(!this.isPlayerFull) return;
    TrackerManager.stopTicking(this.getCurrentTime(), params.streamType);
  }

  onPlayerControlSeek(params, seconds) {
    if(!this.isPlayerFull) return;
    const seekObject = {
      seek_start: this.getCurrentTime(),
      seek_end: seconds,
      seek_time: seconds - this.getCurrentTime(),
    };
    TrackerManager.seek(seekObject, params.streamType);
  }

  onPlayerSetAudioTrack(params) {
    if(!this.isPlayerFull) return;
    //TrackerManager.audioChange(this.getCurrentTime(), params.streamType);
  }

  onPlayerEndPlayer(params) {
    if(!this.isPlayerFull) return;
    TrackerManager.credits(this.getCurrentTime(), params.streamType);
  }

  /**
   * Callback enviado cuando el player va a terminar de playear (por ejemplo un stop o un cambia de playear live a música, o vod a live y así)
   *
   * @param {*} inputParams los params inmediatos anteriores que se le enviaron al player, antes de hacer el cambio de vod a live por ejemplo
   * @param {*} outputParams los params inmediatos anteriores que resolvió el player, antes de hacer el cambio de vod a live por ejemplo
   * @param {*} seconds when player stop content (or change video type, for example when pass from live to vod, or from vod to live)
   */
  onPlayerStopMedia(inputParams, outputParams, seconds, isChangeEpisodeOrLang) {
    if(!this.isPlayerFull) return;
    if (this.refs.playerControls && this.refs.playerControls.onStopMediaPlay) {
      this.refs.playerControls.onStopMediaPlay();
    }

    // Estaba playeando?
    if(inputParams.playerstate === AAFPLAYER_PLAY) {
      // Para audio
      if(outputParams && outputParams.streamType === playerConstant.AUDIO && seconds !== 0){
        store.dispatch(sendMetricsMusicaStarted(seconds));
      }
      // Para vod, send stop track
      if(inputParams.source && !inputParams.islive
        && (
            Utils.isNotNullOrNotUndefined(inputParams.source.videoid)
              || Utils.isNotNullOrNotUndefined(inputParams.source.videosource)
          )) {
        TrackerManager.stop(seconds);

        //FIX https://dlatvarg.atlassian.net/browse/STV-6331
        const duration = this.getDuration();
        const progress = parseInt(duration) === 0 ? 0 : Math.ceil((parseFloat(seconds) / parseFloat(duration)) * 100);

        store.dispatch(setResumeData({
          progress
        }));

        setTimeout(() => {
          document.dispatchEvent(new CustomEvent(settings.update_progress, { detail: { progress, videoid: inputParams.source.videoid } }));
        }, 250);

      }
      if(!isChangeEpisodeOrLang){
        TrackerManager.leaveContent(seconds);
      }
    }
  }

  /**
   * TODO optimizar
   *
   * @param {*} seconds
   * @param {*} params
   */

  /*
  onDoTimeshift(seconds, params) {
    if(!this.isPlayerFull) return;
    if (!this.timeShift || !isNaN(this.timeShift)) {
      this.timeShift = m().unix();
    }
    const safeTime = this.getSafeTime();
    this.timeShift += seconds + safeTime;
    const _this = this;
    if (this.waitingSeek) clearTimeout(this.waitingSeek);
    this.waitingSeek = setTimeout(() => {
      const currentTime = m().unix();
      const time = _this.timeShift > currentTime ? currentTime : _this.timeShift;
      _this.timeShift = m.unix(time).format("YYYY/MM/DD hh:mm:ss");
      _this.performTimeShift(params);
    }, 1000);
  }
  */

  /**
   *  @param timeshiftData = {
   *    backward: isBackward,
   *    // Si es negativo o no, se verifica en video/component, quien es quien decide
   *    // si se va o no a pgm o solo hace seek sobre el actual playing
   *    seektime: this.state.channelInfo.timeshiftAllowed - this.state.timeshiftTime ,
   *    maxtimeshiftallowed
   *  };
   */
  setTimeshiftSeek(timeshiftData, firstSeek) {
    AAFPlayer.seekTimeshift(timeshiftData, firstSeek);
  }

  /**
   * Método para hacer timeshift, cuando se manda este request desde playerControls
   * TODO, parece que onDoTimehsift sale sobrando :S, confirmar
   *
   * Si starttime viene nulo es quiza porque ya alcanzaron nuevamente el "tiempo actual" de la aplicación
   *
   */
  doTimeshift(groupId, starttime, timeshiftData) {
    new ChannelSingleton().getTimeshiftToken(groupId).then((timeshifttoken) => {

      let currentPlayerOptions = AAFPlayer.getCurrentPlayerOptions();
      if(currentPlayerOptions.source && !Utils.isNullOrUndefined(currentPlayerOptions.source.videoid)) {

        // En starttime viene el valor que quiere regresar el user
        // Actualmente el player ya está playeando en timeshift?
        if(Utils.isNotNullOrNotUndefined(currentPlayerOptions.starttime) && starttime !== null) {
          // Se hace un seek sobre el actual playing que ya es timeshift
          timeshiftData.starttime = this.timeShift.starttime;
          this.setTimeshiftSeek(timeshiftData, false);
        }
        else {
          // manda pgm con los nuevos params
          currentPlayerOptions.source.videoid = groupId;
          //currentPlayerOptions.starttime = this.timeShift;
          // Get a moment object with starttime:
          let momentStarttime = this.getStarttimeTimeshift(groupId);
          currentPlayerOptions.starttime = starttime !== null ? momentStarttime.format("YYYY/MM/DD hh:mm:ss") : null;
          // Agregar paywayToken
          currentPlayerOptions.timeshifttoken = timeshifttoken;
          // Si no viene null, entonces realmente es un timeshift, si viene null quiza el user "alcanzo de nuevo" el now() sobre la barra/bootones de progreso
          // (se puso en la barra nuevamente hasta la derecha)
          if(starttime !== null) {
            timeshiftData.starttime = momentStarttime.unix();
            currentPlayerOptions.timeshiftData = timeshiftData;
          } else if(timeshiftData && Utils.isNotNullOrNotUndefined(timeshiftData.timeshiftDelay)) {
            currentPlayerOptions.timeshiftData = timeshiftData;
          }

          this.performTimeShift(currentPlayerOptions);
        }
        this.timeShift = timeshiftData;
      }
    });
  }

  getStarttimeTimeshift(groupId) {
    return this.playerStreamingUtils.getStarttimeTimeshift(groupId);
  }

  /**
   *
   *
   * @param {*} seconds
   * @param {*} params
   */
  performTimeShift(params) {
    if(!this.isPlayerFull) return;
    // TODO en caso de pausa, guardar los params de llamada al player¿? para hacer un nuevo timeshift?
    // Sólo necesitamos el groupid para hacer el timeshift
    store.dispatch(playFullMedia(params));
    //AAFPlayer.setPlayerState(params, this.getAAFPlayerWrapper(), this.getAAFCallbacks());
  }

  /**
   *
   * @param {*} evt
   * @param {*} params
   */
  onLoad(evt, params) {
    this.loaded = true;
    this.onChangingChannel(false);
    this.clearLoading();
        if(!this.isPlayerFull) return;
    /*if(params && params.stream_type) {// AAFPlayer Quitar esto después cuando se quite el old video
      TrackerManager.startTicking(params.streamType);
      TrackerManager.playing();
    }*/
  }

  /**
   *
   * @param {*} params
   * Aquí lanzar tracker ¿?
   * Lanzar multiple audio y subtitulo inicial y demás cosas que deban lanzarse
   */
  afterGetDataSe(x) {
    if( this.refs.playerControls &&  this.refs.playerControls.refs &&  this.refs.playerControls.refs.seasons &&  this.refs.playerControls.refs.seasons.style) {

      let localSerieData = {
        seasons: x.seasons,
        seasonNumber: '1',
        episodeNumber:'1'
      };

      if(this.AAFResolvedParams && this.AAFResolvedParams.playerMedia) {
        if(this.AAFResolvedParams.playerMedia
          && this.AAFResolvedParams.playerMedia.group
          && this.AAFResolvedParams.playerMedia.group.common
          && this.AAFResolvedParams.playerMedia.group.common.extendedcommon
          && this.AAFResolvedParams.playerMedia.group.common.extendedcommon.media
          && this.AAFResolvedParams.playerMedia.group.common.extendedcommon.media.episode
        ) {
          localSerieData.episodeNumber = this.AAFResolvedParams.playerMedia.group.common.extendedcommon.media.episode.number;
          localSerieData.seasonNumber = this.AAFResolvedParams.playerMedia.group.common.extendedcommon.media.episode.season;
        }
      }
      this.serieData = localSerieData;
      this.refs.playerControls.serieData = localSerieData;
      this.refs.playerControls.refs.seasons.style.display = '';
    }
  }

  onResolveResizePlayer(inputParams) {
    /**
     * Para controlar e recordatorios, por el momento...agregar aquí demás condiciones
     * o flujos para controlar durante un resize (que implica un "quiero playear o entro
     * a playear el mismo contenido que ya se esta reproduciendo")
     */
    // Si esta en video
    if(inputParams.source) {
      if(Utils.isNotNullOrNotUndefined(inputParams.source.videoid) ||  Utils.isNotNullOrNotUndefined(inputParams.source.videosource)) {
        // Si no es pip y si no es preview
        if(!inputParams.ispip && !inputParams.ispreview) {
          // Si hizo un resize a full?
          if(inputParams.size && inputParams.size.width > 1279) {
            this.props.setAafLiveHistory(inputParams); // set for live player history
            if(!LayersControl.isPlayerVisible()) {
              LayersControl.showPlayer();
            }
          }
        }
      }
    }
  }
  sendDimension = ()=>{
    const payload=new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: 'executor'});
  }

  sendVirtualPage = (virtualPage)=>{
    if(typeof this.props.setMetricsEvent==='function'){
      this.props.setMetricsEvent({
        hitType: 'pageview',
        page: virtualPage,
      });
      this.props.setMetricsEvent({type: 'executor'});
    }
  }

  sendMetric = (pgm,isLive,isTrailer=false)=>{
    if(typeof this.props.setMetricsEvent === 'function' && pgm && pgm.group){
      let action='play',
        label,
        virtualPage='reproductor/',
        provider=pgm.group.common.extendedcommon.media.proveedor.nombre !== 'AMCO'? pgm.group.common.extendedcommon.media.proveedor.nombre : '';;
      if(isLive){
          action+='/screen';
          label=`tv - ${provider} - ${pgm.group.common.title}`;
          virtualPage+=`  tv - ${provider} ${pgm.group.common.title}`;
      }else { //vod
        label=`${pgm.group.common.extendedcommon.format.types}${provider!==''?' - '+provider:''}`;
        virtualPage+=pgm.group.common.extendedcommon.media.proveedor.nombre !== 'AMCO'?`suscripcion ${provider}`: 'suscripcion';
        action+='/play';
        if(isTrailer)
          label+=' - trailer ';
        if(pgm.group.common.extendedcommon.media.serie){
          //es serie
          label+=' - '+pgm.group.common.extendedcommon.media.serie.title+':'+pgm.group.common.title;
          virtualPage+=' - '+pgm.group.common.extendedcommon.media.serie.title+':'+pgm.group.common.title;
        }
        else {
          //es pelicula
          label+=' - '+pgm.group.common.title;
          virtualPage+=' - '+pgm.group.common.title;
        }
      }
      this.sendVirtualPage(virtualPage);
      this.props.setMetricsEvent({
        hitType: 'event',
        eventCategory: 'reproductor',
        eventAction: action,
        eventLabel: label,
      });
      this.props.setMetricsEvent({
        type: 'executor'
      });
      this.sendDimension();
    }
  }

  async getDeviceAttach(outputParams){
    let deviceAttachId;
    const groupId=outputParams.groupId;
    try {
      const deviceAttachResult = await deviceAttach(groupId);
      deviceAttachId = deviceAttachResult.attach.id;

    } catch (err) {
      console.error("Could not set deviceAttachId for tracking tracker",err);
      if(err.code && err.message && err.code=="attach_error" ){
        this.deviceAttachAlreadyResponsed=false; //para que no se mande el track en un error
        let params={};
        params.modalMessage=err.message;
        this.handleCantPlay(params);
        let nullPlayer = {
          ispip: false,
          islive: true,
          playerstate: 'STOPPING',
        };
        store.dispatch(playFullMedia(nullPlayer));
        LayersControl.showUX();
        return;
      }
      deviceAttachId = null;
    }
    const extraTrackerParams = {
      isLive: outputParams.isLive,
      groupId,
      deviceAttachId,
    };
    TrackerManager.setupExtraParams(extraTrackerParams);
    this.deviceAttachAlreadyResponsed=true;
    if(this.videoCanPlay){//si onCanPlay se ejecuto primero aqui enviamos el evento
      TrackerManager.playing(0);
      this.videoCanPlay=false;
    }
  }

  initTrackerManager() {
    const akamaiTracker = new AkamaiTracker();
    const playerTracker = new PlayerTracker();

    // GOOSE -- HACK -- dashboardTracker no se usa
    // const dashboardTracker = new DashboardTracker();
    // const youboraTracker = new YouboraTracker(); // goose -- se saca youbora

    // goose -- se saca youbora
    /*
    // Youbora
    if(window.youboraTrackingPlugin
      && window.youboraTrackingPlugin.setAdapter
      && typeof window.youboraTrackingPlugin.setAdapter === 'function'){
      window.youboraTrackingPlugin.setAdapter(youboraTracker);
    }
    */
    // GOOSE -- HACK -- se saca youbora -- dashboardTracker no se usa
    // new TrackerManager([  akamaiTracker, playerTracker, dashboardTracker, youboraTracker ]);
    new TrackerManager([  akamaiTracker, playerTracker ]);
  }

  checkVideo = (outputParams) => {
    if(!this.loaded && outputParams.isLive){
      let playerOptions = AAFPlayer.getCurrentPlayerOptions();
      store.dispatch(playFullMedia({src: null}));

      playerOptions.deleteLastStream = true;
      store.dispatch(playFullMedia(playerOptions));
    }

    this.loaded = false;
    this.idCheckVideo=null;
  }

  onResolveParams(outputParams, inputParams, isReplace) {
    const isLive = outputParams.isLive;
    this.sendMetric(outputParams.playerMedia,outputParams.isLive,outputParams.isTrailer);

    if(isReplace && !isLive){
      TrackerManager.stop(this.getCurrentTime());
    }

    if(outputParams.isLive && outputParams.groupId && DeviceStorage.getItem('lastChannel')!==outputParams.groupId){
      console.log('setLastChannel',outputParams.groupId)
      TvChannelUtil.setLastChannel(outputParams.groupId);
    }

    if (isLive) {
      this.deviceAttachAlreadyResponsed=false;
      this.getDeviceAttach(outputParams);
    }
    else{
      this.deviceAttachAlreadyResponsed=true;
    }
    console.log('[AAF Quick] onResolveParams', new Date()- window.startTime);
    console.log('[AAFPlayer] onResolveParams params ready', outputParams);
    console.log('[AAFPlayer] onResolveParams input params ready', inputParams);

    // Ya que resolvió, play al content, pip o full
    LayersControl.showPlayer();
    if(this.isPlayerFull && outputParams.groupId && outputParams.isLive) {
      // Si viene desde una ficha EPG, entonces se inicializa la barra de progreso al timeshift que se vaya a hacer
      if(inputParams.starttime !== null && inputParams.timeshiftData && Utils.isNotNullOrNotUndefined(inputParams.timeshiftData.startprogressbar)) {
        this.onUpdateEpg(outputParams.groupId, false, inputParams.timeshiftData);
      }
      else {
        this.onUpdateEpg(outputParams.groupId);
        // Si no timeshift pero es live, verificar si se requiere hacer la llamada de getmedia asíncrona
        if(outputParams.playerMedia && outputParams.playerMedia.media && outputParams.playerMedia.media.epgurlresolved) {
          // Llamar asíncrono a getmedia para el tracker
          // En getMediaTask se hace el setup del tracker y se manda la llamada a tracker.getmedia
          const showErrorModal = true;
          api.playerGetMedia(outputParams.playerMedia.media.groupId, null, false, outputParams.playerMedia.media.streamType,"","","",showErrorModal).then((resp) => {
            // Send start resp.tracking.
            // el TrackerManager.playing se controla en onCanPlay y getDeviceAttach
            TrackerManager.playing(0);
          });
        }
      }

      // Si full, si live, si video, actualizar ruta actual para indicar que aquí se lanzó playing
      this.props.setAafLiveHistory(inputParams);
    }
    else {
      if (this.refs.playerControls) {
        this.refs.playerControls.setChannelInfo({});
      }
    }
    if(outputParams && outputParams.playerMedia && outputParams.playerMedia.group && outputParams.playerMedia.group.common && outputParams.playerMedia.group.common.extendedcommon && outputParams.playerMedia.group.common.extendedcommon.media) {
      if(outputParams.playerMedia.group.common.extendedcommon.media.serie) {
          api.contentSerie(outputParams.groupId).then( this.afterGetDataSe)
    }
    else {
      if(this.refs.playerControls &&  this.refs.playerControls.refs &&  this.refs.playerControls.refs.seasons &&  this.refs.playerControls.refs.seasons.style &&  !Utils.isNullOrUndefined(this.refs.playerControls.refs.seasons.style.display))
        this.refs.playerControls.refs.seasons.style.display='none';
      }
    }
    AAFPlayer.play(outputParams.ispip);
    if(!this.idCheckVideo){
      this.idCheckVideo=setTimeout(this.checkVideo, retryTimeEvents,outputParams);
    }


    if (this.refs.playerControls && !outputParams.isLive) {
      this.refs.playerControls.show();
    }
    if(outputParams.isPip) {
      this.AAFResolvedParamsPip = outputParams;
    }
    else {
      this.AAFResolvedParams = outputParams;
    }

    if(this.isPlayerFull) {
      // En VOD/Live, poner el local time a 0 para que si hay algo en los subtitles,
      // no se muestren antes de tiempo o no se queden "pegados" subs anteriores
      if(Utils.streamIsVideo(outputParams.streamType)) {
        this.setCurrentTime(0);
      }
      // Hay parámetros iniciales de audio y subtitle para reproducir?
      if(outputParams.audiosubtitleinfo) {
        // audio
        if(outputParams.audiosubtitleinfo.audio) {
          if(this.platform !== 'workstation') {
            this.setAudioTrack(outputParams.audiosubtitleinfo.audio)
          }
        }
        // subtitle externo
        if(outputParams.audiosubtitleinfo.subtitle) {
          this.handleSubtitlesParser(outputParams.audiosubtitleinfo.subtitle);
        }
        else {
          // Si hay alguno, kill subtitle anterior
          this.resetSubtitlesParser();
        }
      }

      // TODO AAFPlayer agregar el optionId a nivel de este componente para
      // llevar un control del lang que esta viendo el user y no cambiar lenguaje a menos que
      // realmente quiera otra opción de lenguaje y no la que esta playeando actualmente
      // seguir usando this.currentLanguageOptionID ?
      if(outputParams.audiosubtitleinfo && outputParams.audiosubtitleinfo.optionId) {
        this.currentLanguageOptionID = outputParams.audiosubtitleinfo.optionId;
      }



      // AAFPlayer set multiple y single-combo de opciones de lenguage

      //if(!outputParams.isLive) {
      //if(!params.isLive) {
        // Para single/múltiple (combo de langs)
        this.langOptions = outputParams.extendedCommonLangOptions;
        // Para múltiple

        this.multipleLangOptions = outputParams.multipleLangOptions;
        if (Array.isArray(outputParams.extendedCommonLangOptions)) {
          this.onUpdateLangOptions(outputParams.extendedCommonLangOptions);
        }
      //}

      /*
      TODO AAFPlayer, echar a andar los video live languages, como en el caso de nagra e iwedia
      // HARDCODED Only for nagra live DVBC ****************
      if(this.isPlayerFull && this.platform === 'nagra' && nextPlayerProps.streamType === playerConstant.DVBC && nextPlayerProps.isLive) {
        this.setNagraLiveLang();
      }
      */


      //TODO AAFPlayer para música, checar este dispatch (antes se hacía en el middleware)
      if(outputParams.streamType === "audio") {
        store.dispatch(configSetupPlay())
      }

      // Si es live y haay que hacer el primer seek del timeshift, entons hacerlo aquí
      if(inputParams.starttime !== null && inputParams.timeshiftData) {
        this.setTimeshiftSeek(inputParams.timeshiftData, true);
      }

      this.setState({ enableplayercontrols: true });
    }
  }

  // AAFPlayer pide input del user o muestra error
  onResolveShowModal(params) {
    if(!this.isPlayerFull) return;
    switch(params.modalType) {
      // Parental
      case MODAL_PIN:
        this.handleModalParental(params);
      break;
      // PGM error
      case MODAL_REINTENTO:
        this.handleModalReintentoError(params.modalMessage, params.nextOptions, params);
      break;
      // Bookmark
      case MODAL_GENERIC:
        this.handleModalBookmark(params);
      break;
      // Error,
      case MODAL_ERROR:
        this.handleCantPlay(params);
      break;
    }
    console.log('Resolve onShowModal Resolve params ready', params);
  }

  /**
   * Errores de resolución de qué playear desde AAFPlayer deberían caer aquí
   * Aquí NO caen errores de PGM, porque en este punto ni siquiera pudo resolver pgm
   * @param {*} params es un AAFException:
   *                   name = "AAFResolveException";
   *                   type = constant onResolvePlayingError;
   *                   message = message;
   *                   data = data; en data vienen las nextOptions con las que se intentó playear
   */
  onResolveError(params) {
    if(!this.isPlayerFull) return;
    this.handleModalReintentoError(params.message, params.data, params);
  }

  handleModalReintentoError(message, replayOptions, params) {
    if(!this.isPlayerFull) return;
    const modal = {
      modalType: MODAL_REINTENTO,
      modalProps: {
        onReject: () => { console.log('Modal error'); },
        onRetry: () => {
          AAFPlayer.setPlayerState(replayOptions, this.getAAFPlayerWrapper(), this.getAAFCallbacks());
        },
        messageModal: message
      }
    }
    store.dispatch(showModal(modal));
  }

  /**
  * params es from AAF
  */
  handleModalParentalStep(currentPin, pinIsCreated, params) {
    if(!this.isPlayerFull) return;
    if(pinIsCreated) {
      // Cerrar modal
      store.dispatch({
        type: HIDE_MODAL,
        modalType: MODAL_PIN
      });
    }
    params.successCallBack(params.nextOptions, params.isSourceReplace);
  }

  /*
  *
  */

  restartMiniEPG(){
    let currentPlayerOptions = AAFPlayer.getCurrentPlayerOptions(false);
    let currentChannelPlaying = currentPlayerOptions && currentPlayerOptions.source && currentPlayerOptions.source.videoid ? currentPlayerOptions.source.videoid : false;
    if(currentChannelPlaying && !AAFPlayer.livePlayingAsPip()){
      this.changeChannel(currentChannelPlaying,true,currentPlayerOptions); // Esto se hace para recuperar el estado anterior de la miniEPG
      if(this.state.showMiniEpg !== false) {
        this.setState({ showMiniEpg: false });//Se oculta para evitar que el usuario note el cambio repentino en la mini
      }
    }
  }

  handleModalParental(params) {
    if(!this.isPlayerFull) return;
    this.handleModalParentalStep = this.handleModalParentalStep.bind(this);
    const modal ={
      modalType: MODAL_PIN,
      modalProps: {
        action: 'MP_CHECAR_STATUS',
        pinIsCreated: true,
        successCallBack: (currentPin, contentwithbookmark) => {
          this.handleModalParentalStep(currentPin, contentwithbookmark, params);
        },
        failedCallBack: () => {
          this.onChangingChannel(false);
          if(params.failedCallBack){
            params.failedCallBack();
          }
          if(params.nextOptions.islive){
              this.restartMiniEPG();
          }
        }
      }
    }
    store.dispatch(showModal(modal));
  }

  /**
  * params es from AAF
  */
  handleModalBookmark(params) {
    if(!this.isPlayerFull) return;
    const buttons = [
      {
        content: Translator.get('player_continue_btn', 'Reanudar'),
        props: {
          onClick: (e) => {
            // Desde AAFPlayer, de regreso: resetBookmark, nextOptions, isSourceReplac
            params.successCallBack(false, params.nextOptions, params.isSourceReplace);
          }
        }
      },
      {
        content: Translator.get('player_begin_btn', 'Desde el principio'),
        props: {
          onClick: (e) => {
            // Desde AAFPlayer, de regreso: resetBookmark, nextOptions, isSourceReplac
            params.successCallBack(true, params.nextOptions, params.isSourceReplace);
          },
        }
      }
    ];

    const modal = {
      modalType: MODAL_GENERIC,
      modalProps: {
        buttons,
        buttonsAlign: 'vertical'
      }
    };

    store.dispatch(showModal(modal));
  }

  handleCantPlay(modalParams) {
    if(!this.isPlayerFull) return;
    const modal = {
      modalType: MODAL_ERROR,
      modalProps: {
        callback: modalParams.callback,
        content: { message: modalParams.modalMessage }
      }
    }

    store.dispatch(showModal(modal));
  }

  getSafeTime(){
    const region = DeviceStorage.getItem('region');
    let safeTime = Metadata.get('epg_event_safe_time',null);
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


  // END ================================================================================================================================================


  fillFullChannels(data) {

    let lastCh = DeviceStorage.getItem("lastChannel");
    this.channelsCoverFLow(data);
    this.channelJSON = data.map((x, index)=>{
      return x.group_id
    });

    if (this.linealChannels) {

      let paywayIds = this.props.linealChannels.map(x => x.id);
      this.channelJSONPurchased = this.channelJSON.filter(x => paywayIds.indexOf(x) > -1);


    /*    const linealChannelsPurchased = Utils.getFieldFromJsonToArray(this.linealChannels, 'id');

        let channelJSONPurchased = [];

        this.channelJSON.map(function (id) {

            if (linealChannelsPurchased.indexOf(id) > -1)
            {
                channelJSONPurchased.push(id);
            }
        });


        this.channelJSONPurchased = channelJSONPurchased;*/
    }
  }

  setNagraLiveLang() {
    if(!this.isPlayerFull) return;
    // get live dvbc langs
    this.player.getAudioTracks().then(() => {
      console.log('[Video component] resp getAudioTracks en video component: ', this.player.audioTracks);

      let i;
      let newOptions = [];
      if(Utils.isArray(this.player.audioTracks) && this.player.audioTracks.length > 0)
      {
        for(i = 0; i < this.player.audioTracks.length; i++) {
          let label_lang = 'Unknow';
          let option_lang = '';
          //info.streamsAvailableInfo.streamInfo[i].iaudio.language
          if(this.player.audioTracks[i].iaudio.language === 'spa') {
            label_lang = 'Español';
            option_lang = 'D-ES';
            if(this.player.audioTracks[i].isDefault === true) {
              console.log('[Video component] before setSelectedLanguage spanish');
              this.setSelectedLanguage(option_lang);
            }
          }
          if(this.player.audioTracks[i].iaudio.language === 'eng') {
            label_lang = 'Inglés';
            option_lang = 'D-EN';
            if(this.player.audioTracks[i].isDefault === true) {
              console.log('[Video component] before setSelectedLanguage english');
              this.setSelectedLanguage(option_lang);
            }
          }

          let a_option = {
            label_short: label_lang,
            label_large: label_lang,
            option_lang: option_lang,
            option_name: label_lang,
            encodes: [],
            id: '',
            id_lang: this.player.audioTracks[i].iaudio.language,
            desc: label_lang
          };

          newOptions.push(a_option);
        }
      }
      // Re fill combo for languages
      this.onUpdateLangOptions(newOptions);
    });
  }

  setLoading() {
    if(this.state.loading !== true){
      this.setState({ loading: true });
    }
  }

  clearLoading() {
    this.onChangingChannel(false);
    if(this.state.loading !== false){
      this.setState({ loading: false });
    }
  }

  hide() {
    console.log('[Video component] HIDE VIDEO COMPONENT');
    if (this.state.extraClass.indexOf(' hide') == -1) {
      this.setState({ extraClass: this.state.extraClass + " hide" })
    }

  }

  show() {
    this.setState({ extraClass: this.state.extraClass.replace(" hide", '') })
  }

  /*fullscreen(){
      this.player.resize({type: 'absolute', width: '500', height: '500', top: 0, left: 500, position: 'fixed'})
      this.setState({fullscreen:true})
  }

  pipscreen(){
      this.player.resize({type: 'absolute', width: '200', height: '200', top: 0, left: 0})
      this.setState({fullscreen:false})
  } */



  record(event) {
    new Npvr().add(this.props.user, event.eventId, event.number,event.groupId).then((eventStatus) => {
      //TODO Lógica para cambiar el color de los fuckings iconos
      //this.setState({ eventStatus });
    });
  }

  enableControls() {
    console.log("[Video component] show controls");
  }

    handleEpg(par, filterTV = null) {
        // Se cierra o se abre la full epg?
        // Si esta en true, esta en abierta, se va a cerrar...
//        let goingToHide = this.state.showEpg === true;
        let nextState = { showEpg: !this.state.showEpg };

      if(par) {
          nextState.epgType = par;
      }
      else {
          nextState.receiveOK = false;
      }
      nextState.filterEpg = filterTV;

      this.setState(nextState);
  }

  getEpgType() {
    return this.state.epgType;
  }

  setEpgType(epgType) {
    this.setState({ epgType });
  }

  hasEpgError() {
    return this.state.hasEpgError;
  }

  setEpgError(hasEpgError) {
    this.setState({ hasEpgError});
  }
  /*
  launchCoverFlow(value) {
    console.log('******** GCR setting showCoverFlow:', value)
    //this.setState({ showCoverFlow: value})
  }
  */
  hideEpgOutside(withGPChange = null, channel) {
    console.log('[dann][Video Component] hideEpgOutside',withGPChange);

    let nextState = {};

    if(this.state.receiveOK !== true) {
      //this.setState({ receiveOK: true });
      nextState.receiveOK = true;
    }
    if(this.state.showEpg !== false) {
        // Si ocultamos la full, reset del filter para que restablezca a todos
        //this.setState({ showEpg: false, filterEpg: null });
        nextState.showEpg = false;
    }
    if(this.state.showMiniEpg !== false && !withGPChange) {
      //this.setState({ showMiniEpg: false });
      nextState.showMiniEpg = false;
    }
    if(this.state.coverFlow !== false){
      //this.setState({ coverFlow: false });
      nextState.coverFlow = false;
    }
    // Reset channel filter
    nextState.filterEpg = null;
    this.setState(nextState);

    if(withGPChange && channel) {
     this.changeChannel(withGPChange,true, channel);
    }
  }

  hideOnlyMini(newChannelIndex){
    this.setFromProps(true);
    // this.changeChannel(newChannelIndex);
    store.dispatch(navigateFrom('ChangeWithNumber'));
  }

  onChangingChannel(status) {
    var now = new Date();
    this.changingChannel = status;
  }

  isChangingChannel() {
    return this.changingChannel;
  }

  showEPG(epgType = 'GUIDE') {
    this.setState({
      showEpg: true,
      epgType
    });
  }

  hideEPG() {
    // console.log('[dann][Video Component] hideEPG');
      this.setState({ showEpg: false, filterEpg: false });
  }

  shouldComponentUpdate(newProps, newState) {
    const locationState = newProps.location && newProps.location.state || false;
    if (locationState.isLive !== undefined && newProps.player) {
      newProps.player.isLive = locationState.isLive;
    }
    let su = JSON.stringify(this.state) !== JSON.stringify(newState) || JSON.stringify(this.props) != JSON.stringify(newProps);
    //console.log("[Video component] shouldComponentUpdate", su);
    return su;
  }

  handleRedirect(path = '/', state = {}, isReplace = false) {
    /*if (isReplace) {
      console.log('CHOTO 1', path, state);
      this.props.history.replace(path, state);
    } else {
      this.props.history.push(path, state);
    }*/
  }

  /**
   *
   * @param {*} epgGroupId
   * @param {*} fromCoverFlow
   * @param {*} startprogressbar cuando llega aquí desde un clic en ficha de epg-evento pasado, inicializa el progress bar de player controls
   */

  onUpdateEpg(epgGroupId, fromCoverFlow = false, timeshiftData = null) {
    if(!fromCoverFlow)
      this.ResolvegroupId = epgGroupId;
    const lastChannel = DeviceStorage.getItem('lastChannel');
    const newGroupId = lastChannel ? lastChannel : epgGroupId;
    const timeshiftAllowed = ChannelSingleton.getTimeshift(newGroupId, true);
    const startprogressbar = timeshiftData === null ? null : timeshiftData.startprogressbar;

    if(timeshiftData) {
      this.timeShift = timeshiftData;
    }

    const currentTimeshiftTime = this.state.currentTimeshiftTime;
    if (this.refs.playerControls) {
      // this.channelInfo es sólo para player controls, no aplica (aún) para epg full (if de abajo)
      //this.channelInfo = { id: epgGroupId, timeshiftAllowed, currentTimeshiftTime, fromCoverFlow, startprogressbar };
      this.channelInfo = { id: epgGroupId, timeshiftAllowed, currentTimeshiftTime, fromCoverFlow };
      this.refs.playerControls.setChannelInfo(this.channelInfo);
    }
    if(this.refs['epgControls']) {
      this.refs['epgControls'].getWrappedInstance().setChannelInfo({ id: epgGroupId,fromCoverFlow },this.props.player.filterTV);
    }
  }

  getTitle(){
    if(typeof this.props.player.playerMedia!=='undefined'){
      const title=this.props.player.playerMedia.group.common.title;
      if(this.props.player.serie && this.props.player.serie.data && this.props.player.serie.data.episodeNumber!==null)
        return `${this.props.player.playerMedia.group.common.extendedcommon.media.serie.title} : ${title}`;
      else return title;
    }
    else return "";
  }

  // Only for nagra
  onUpdateLangOptions(newJsonLangs) {
    console.log('[Video component] NEW LANGS>>>> ', newJsonLangs);
    PlayerControls.onUpdateLangOptions(newJsonLangs);
  }

  onUpdateCurrentTimeshift(time){
    console.error('RDGV onUpdateCurrentTimeshift', this.state.currentTimeshiftTime);
    this.state.currentTimeshiftTime = time;
  }

  setHandleChangeSubtitle=(func)=>{
    if(typeof func ==='function')
      this.setState({handleChangeSubtitle:func})
  }

  render() {
    console.log('[Video] render this.AllEpgs',this.AllEpgs);
    let nodeId = null;
    let updateFilter = null;
    let isAudioType = null;
    const isPlaying = (this.props.player &&
      this.props.player.playerstate === AAFPLAYER_PLAY);
    const isPlayingInFull = (isPlaying &&
      this.props.player.size && this.props.player.size.width &&
      this.props.player.size.width >= 1280);
    const isPlayingLiveAsFull= isPlayingInFull && this.props.player && this.props.player.islive;
    let filterEPG = null;
    if(this.props.player.playerstate !== AAFPLAYER_STOP) {
      filterEPG = this.state.filterEpg; //  this.props.player.filterTV;
    }
    //console.log('[EPGFILTER] Video component filterTV ',  this.props.player.filterTV);
    if(this.props.player.showEpg) {
      this.setState({ showEpg: this.props.player.showEpg })
      this.props.player.showEpg = null;
      //delete this.props.player.filterTV;
    }

    if(this.props.player.source){
      if(this.props.player.source.hasOwnProperty("audiosource")){
        if(this.props.player.islive) {
          isAudioType = 'radio';
        } else {
          isAudioType = 'audio';
        }
      }
    }

    if(window.location.search) {
      this.guideParams = Utils.urlParamsToJson(window.location.search);
    }

    if(this.guideParams && this.guideParams.url) {
      const split = this.guideParams.url.split('/');

      nodeId = split[2];
      updateFilter = true;
    }
    let isFavorite, isRepeat = false;
    let isShuffle = 0;

    // Need to position subtitles:
    let vClassName = '';
    if(this.isPlayerFull) {
      vClassName = 'vcontainer';
    }

    let containerMusic = <MusicContainer/>;

    let subtitlesParser = <VirtualSubtitles
        subtitle={this.state.subtitleparser.subtitle}
        className={this.state.subtitleparser.className}
        //getCurrentTime={this.getCurrentTime}
        setHandleChangeSubtitle={this.setHandleChangeSubtitle}/>;

    if((this.playeIsOnScreen) && isAudioType === playerConstant.AUDIO){
      window.SpatialNavigation.focus('.player-main-button');
      const configContent = store.dispatch(checkFavoriteContent());
      isFavorite = configContent.isFavorite;
      isShuffle = configContent.isShuffle;
      isRepeat = configContent.isRepeat;
    }

    console.info('[VideoComponent] render ',
      '\nprops: ', this.props,
      '\nstate ', this.state,
      '\ncurrentTimeshiftTime', this.state.currentTimeshiftTime);
    return (

      <div ref="" className={vClassName} style={{display:'none'}} id={this.props.id}>

        {(isAudioType !== null) ? containerMusic : null }

        <div id="HTML5VideoWrapper" ref="VideoContainer" className={this.props.classVideo + this.state.extraClass} />
        {this.state.loading && <LoadingComponent visible={true} />}
        { Utils.getCoverFlowVisibilityFromMetadata().enable &&
            <CoverFlow
              channels={this.channelsPurchased}
              current={this.current}
              show={this.state.coverFlow}
              onPressYellowButton={this.hideCoverFlow}
              onPressBackButton={this.hideCoverFlow}
              onSelect={this.onSelectCard}
              onChangeChannel={(channel) => {
                this.hideEpgOutside(channel.group_id, channel);
              }}
              channelControls={this.channelControlsEnabled}
              onPressBlueButton={this.handleEpgCover}
              delayCoverFlow={this.delayCoverFlow}
              specialLoading={this.state.specialLoading}
          />
        }
        { !this.state.coverFlow && isPlaying && this.AllEpgs &&
            <PlayerControls
            ref='playerControls'
            seek={this.player.seek}
            play={this.player.resume}
            pause={this.player.pause}
            back={this.goBack}
            record={this.record}
            //enable={this.enableControls()}
            enable={this.state.enableplayercontrols}
            autoPlay={true}
            autoHide={(this.props.player.streamType !== playerConstant.AUDIO) ? true : false}
            type={ (isAudioType !== null) ? isAudioType : this.props.player.islive ? 'live' : 'vod'}
            serieData={this.serieData}
            handleFullEpg={(e) => { this.handleEpg(e) }}
            handleRedirect={this.handleRedirect}
            jsonLangs={this.langOptions}
            changeLang={this.changeLang}
            onUpdateEpg={this.onUpdateEpg}
            epgGroupId={this.ResolvegroupId || (this.props.player.source && this.props.player.source.videoid)}
            timeshiftAllowed={this.state.timeshiftAllowed}
            currentTimeshiftTime={this.state.currentTimeshiftTime}
            onUpdateCurrentTimeshift={this.onUpdateCurrentTimeshift}
            controlBarIsShowed={this.controlBarIsShowed}
            setMetricsEvent={this.props.setMetricsEvent}
            dataMetric={{provider:this.props.player.provider,title:this.getTitle()}}
            opcFavorite={isFavorite}
            opcShuffle={isShuffle}
            opcRepeat={isRepeat}
            changeChannel={this.changeChannel}
            hideOnlyMini= {this.hideOnlyMini}
            linealChannels={this.props.linealChannels}
            changeContentfromSelector={this.changeContentfromSelector}
            goToCard={this.goToCard}
            doTimeshift={this.doTimeshift}
            channelInfo={this.channelInfo}
            hideEpgOutside={this.hideEpgOutside}
            style={{display:!this.state.showEpg?'block':'none'}}
            checkStatusEPG={this.state.showEpg}
            checkStatusCoverFlowCH={this.state.coverFlow}
            checkStatusMiniEPG={this.state.showMiniEpg}
            hasEpgError={this.hasEpgError}
            isChangingChannel={this.isChangingChannel}
            onChangingChannel={this.onChangingChannel}
            changeCurrentGroupId = {this.changeCurrentGroupId}
            fromProps = {this.fromProps}
            setFromProps = {this.setFromProps}
            //launchCoverFlow={this.launchCoverFlow}
          /> }{
          <Epg
              ref='epgControls'
              handleFullEpg={this.handleEpg}
              hideEpgOutside={this.hideEpgOutside}
              onChangingChannel={this.onChangingChannel}
              isChangingChannel={this.isChangingChannel}
              getEpgType={this.getEpgType}
              setEpgType={this.setEpgType}
              hasEpgError={this.hasEpgError}
              setEpgError={this.setEpgError}
              groupId={this.ResolvegroupId || (this.props.player.source && this.props.player.source.videoid)}
              onUpdateEpg={this.onUpdateEpg}
              node_id={nodeId}
              updateFilter={updateFilter}
              goToCard={this.goToCard}
              showEpg={this.state.epgType === 'GUIDE'}
              //showCoverFlow={this.state.showCoverFlow}
              epgFilter={(this.props.player.showEpg) ? this.props.player.showEpg : null }
              filterEpg={(filterEPG) ? filterEPG : null}
              style={{display:this.state.showEpg?'block':'none'}}
              checkStatusEPG={this.state.showEpg}
              checkStatusCoverFlowCH={this.state.coverFlow}
              record={this.record}
              isPlayingLiveAsFull={isPlayingLiveAsFull}
              receiveOK={this.state.receiveOK}
          />
        }

        { subtitlesParser }

      </div>
    )
  }
}

Video.propTypes = {
  src: PropTypes.string,
  controls: PropTypes.bool,
  muted: PropTypes.bool,
  fullscreen: PropTypes.bool,
  classVideo: PropTypes.string
};

Video.defaultProps = {
  classVideo: '',
  controls: false,
  muted: false,
  fullscreen: true
};

export default Video;
