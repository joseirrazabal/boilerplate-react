import React, { Component } from 'react';
import Video from './index'
import { connect } from 'react-redux';
import store from './../../store';
import { playFullMedia } from '../../actions/playmedia';
import PropTypes from "prop-types";
import RequestManager from '../../requests/RequestManager';
//import PlayerMiddleware from '../../devices/all/PlayerMiddleware'
import LayersControl from '../../utils/LayersControl';
import * as playerConstant from '../../utils/playerConstants';
import AAFPlayer from '../../AAFPlayer/AAFPlayer';
import { AAFPLAYER_PLAY, AAFPLAYER_STOP } from '../../AAFPlayer/constants';
import Utils from '../../utils/Utils';
import Device from './../../devices/device';
import { bindActionCreators } from 'redux'
import { setResumeData } from "../../actions/resume";
import PlayerHelper from "../../AAFPlayer/helpers/PlayerHelper";
import * as constant from "../../AAFPlayer/constants";
import channelBlockedUtil from "../../utils/ChannelBlockedUtil";
import BlockedChannels from "../../utils/BlockedChannels";
import { MODAL_PIN } from '../../actions/modal';
import PlayerStreamingUtils from "../../utils/PlayerStreamingUtils";


class FullVideo extends Video {

  static contextTypes = {
    router: PropTypes.object
  }

  constructor(props, context) {
    super(props, context);
    this.isPlayerFull = true;
    this.goBack = this.goBack.bind(this);
  }

  enableControls() {
    return this.playeIsOnScreen;
  }

  shouldForceChange(player){
    let itShould = false;
    let playerOptions = AAFPlayer.getCurrentPlayerOptions(false);
    let playerState = AAFPlayer.getCurrentPlayingState(false);
    if(playerState === AAFPLAYER_PLAY &&
      playerOptions.islive &&
      !playerOptions.ispip &&
      !isNaN(playerOptions.source.videoid) &&
      !isNaN(player.source.videoid) &&
      (playerOptions.source.videoid !== player.source.videoid)){
        itShould = true;
    }
    return itShould;
  }

  async updateBlockedChannels(nextProps){
    return new Promise((resolve, reject) => {
      if(!nextProps.islive || this.hasSameVideoIdPlaying(nextProps.source && nextProps.source.videoid)){
        resolve(false);
      }else{
        let blockedChannelsList = new BlockedChannels();
        blockedChannelsList.checkBlockedChannels().then((response) => {
          channelBlockedUtil.set('blockedChannels', response);
          resolve(true);
        }).catch((error) => {
          channelBlockedUtil.set('blockedChannels', []);
          resolve(false);
        });
      }      
    });
  }

  /*
   * Método que consulta los canales bloqueados del storage especial y dice si contiene el groupId dado  
   */
  isLivePinBlocked(groupId) {
    let blockedChannelsArray = channelBlockedUtil.get('blockedChannels');
    return (blockedChannelsArray && blockedChannelsArray.length > 0 && blockedChannelsArray.indexOf(groupId) >= 0);
  }

  /*
   * Método que nos dice si existe la url para reproducción en fastPlay
   */

  isFastPlay(groupId){
    let itIs = false;
    this.platform = Device.getDevice().getPlatform();
    let supported_stream_types = Utils.getApaSupportedStream(this.platform);
    let channel_url_data = PlayerHelper.getLiveURL(groupId, supported_stream_types['live']);
    // Si hay url, se cambia la url de playing
    if(channel_url_data && channel_url_data.live_url) {
      itIs = true;
    }
    return itIs;
  }

  canPlay(groupId){
    let playerStreamingUtils = new PlayerStreamingUtils();
    return playerStreamingUtils.canPlayChannel(groupId) ? true : false;
  }

  hasSameVideoIdPlaying(groupId){
    let itHas = false;
    let playerOptions = AAFPlayer.getCurrentPlayerOptions(false);
    let playerState = AAFPlayer.getCurrentPlayingState(false);
    if(playerState === AAFPLAYER_PLAY &&
      playerOptions.islive &&
      !isNaN(playerOptions.source.videoid) &&
      !isNaN(groupId) &&
      (playerOptions.source.videoid === groupId)){
        itHas = true;
    }
    return itHas;
  }

  componentWillReceiveProps(nextProps) {
    //console.log('[EPGFILTER] BACK, Videocomponent componentWillReceiveProps ', nextProps.player);
    const withFilter = nextProps.player && nextProps.player.showEpg && !isNaN(nextProps.player.filterTV);
    if (nextProps.player && nextProps.player.params) {
      if (nextProps.player.params.epgtype === 'GUIDE' || nextProps.player.params.epgtype === 'MOSAIC') {
        if (!this.hasEpgError()) {
          this.showEPG(nextProps.player.params.epgtype);
        }
      }
      delete nextProps.player.params;
    }
    
    /* 
     * Nueva lógica agregada para detener la reproducción en contenido live y con bloqueo parental solo hasta que el pin
     * sea escrito enviado correctamente por medio del modal.
     * La lógica anterior fue encapsulada en el método "afterWillReceiveProps".
     */
    let playersAreDifferent = (nextProps.player && JSON.stringify(nextProps.player) !== JSON.stringify(this.props.player));
    if( playersAreDifferent || this.shouldForceChange(nextProps.player)) {
      if(withFilter){
        if(nextProps.player.source && this.isLivePinBlocked(nextProps.player.source.videoid) && !this.isFastPlay(nextProps.player.source.videoid)){ //Se revisa si el canal está bloqueado
          nextProps.player.modalHasBeenShown = false;
          if((!this.unblockedContent || !this.isModalActive) && this.canPlay(nextProps.player.source.videoid)){
            let isSourceReplace = true;
            nextProps.player.modalHasBeenShown = true;
            let nextOptions = nextProps.player;
            let modalData = {
              modalType: MODAL_PIN,
              successCallBack: () => {
                this.unblockedContent = true;
                this.isModalActive = false;
                this.afterWillReceiveProps(nextProps);
              },
              nextOptions: nextOptions,
              isSourceReplace: isSourceReplace,
              failedCallBack: () => {
                this.isModalActive = false;
                if(nextOptions.islive){
                  this.unblockedContent = false;
                }
              }
            };
            if(this.hasSameVideoIdPlaying(nextProps.player.source.videoid)){
              this.unblockedContent = true;
              this.isModalActive = false;
              this.afterWillReceiveProps(nextProps);
            }else{
              this.isModalActive = true;
              this.onResolveShowModal(modalData);
  
            }
          }else if(playersAreDifferent){
            this.afterWillReceiveProps(nextProps);
          }// En caso de no ser diferentes (iguales los player de nextProps y this.props) no se hace nada,
           // ya que si se intenta lanzar el "afterWillReceiveProps" se hará un segundo llamado innecesario a getMedia.
  
        }else{  //Continúa con el flujo que existía antes cambiando el estado de la bandera "unblockedContent".
          this.unblockedContent = false;
          if(typeof nextProps.player === 'object')
            nextProps.player.modalHasBeenShown = false;
          this.afterWillReceiveProps(nextProps);
        } 
        return;
      }
      
      
      this.updateBlockedChannels(nextProps.player).finally(() => {
        if(nextProps.player.source && this.isLivePinBlocked(nextProps.player.source.videoid) && !this.isFastPlay(nextProps.player.source.videoid)){ //Se revisa si el canal está bloqueado
          nextProps.player.modalHasBeenShown = false;
          if((!this.unblockedContent || !this.isModalActive) && this.canPlay(nextProps.player.source.videoid)){
            let isSourceReplace = true;
            nextProps.player.modalHasBeenShown = true;
            let nextOptions = nextProps.player;
            let modalData = {
              modalType: MODAL_PIN,
              successCallBack: () => {
                this.unblockedContent = true;
                this.isModalActive = false;
                this.afterWillReceiveProps(nextProps);
              },
              nextOptions: nextOptions,
              isSourceReplace: isSourceReplace,
              failedCallBack: () => {
                this.isModalActive = false;
                if(nextOptions.islive){
                  this.unblockedContent = false;
                }
              }
            };
            if(this.hasSameVideoIdPlaying(nextProps.player.source.videoid)){
              this.unblockedContent = true;
              this.isModalActive = false;
              this.afterWillReceiveProps(nextProps);
            }else{
              this.isModalActive = true;
              this.onResolveShowModal(modalData);

            }
          }else if(playersAreDifferent){
            this.afterWillReceiveProps(nextProps);
          }// En caso de no ser diferentes (iguales los player de nextProps y this.props) no se hace nada,
           // ya que si se intenta lanzar el "afterWillReceiveProps" se hará un segundo llamado innecesario a getMedia.

        }else{  //Continúa con el flujo que existía antes cambiando el estado de la bandera "unblockedContent".
          this.unblockedContent = false;
          if(typeof nextProps.player === 'object')
            nextProps.player.modalHasBeenShown = false;
          this.afterWillReceiveProps(nextProps);
        }

      });
    }
  }

  afterWillReceiveProps(nextProps) {
    this.onChangingChannel(true);
    let propsVideo = {}
    Object.assign(propsVideo, nextProps.player);
    let epgType = (propsVideo.filterTV)
      ? 'GUIDE'
      : null;
    if(nextProps.player.showEpg == true) {
        this.handleEpg(epgType, Utils.isNotNullOrNotUndefined(propsVideo.filterTV) ? propsVideo.filterTV : null);
    }

    //delete propsVideo.filterTV;
    delete propsVideo.showEpg;
    delete propsVideo.tooglePlay;
    this.ResolvegroupId=null;

    // Antes de cambiar estado del player...
    // Si actualmente esta playeando, que muestre sólo la ux para que no aparezca en el inter la barra de controles
    let playerState = AAFPlayer.getCurrentPlayingState(false);
    let playerOptions = AAFPlayer.getCurrentPlayerOptions(false);

    //si viene de pip a full y viceversa
    if(playerState === AAFPLAYER_PLAY && playerOptions.islive){
      propsVideo.isLastPip = AAFPlayer.optionsPlayingAsPip(playerOptions);
      propsVideo.isNextPip = AAFPlayer.optionsPlayingAsPip(nextProps.player);
      propsVideo.sameSource = PlayerHelper.sameMediaContent(playerOptions, nextProps.player);
    }

    // Si actualmente playeando y live, y video
    if(playerState === AAFPLAYER_PLAY && playerOptions.islive && !playerOptions.source.hasOwnProperty("audiosource")) {
      // Y lo que sigue es play...que oculte el player (y se volverá a mostrar en el onResolve)
      if(nextProps.player.playerstate === AAFPLAYER_PLAY && !nextProps.player.islive) {
        LayersControl.showUX();
      }
    }
    const nextOptions= nextProps.player;
    if(nextOptions && playerOptions){
      if(playerState === AAFPLAYER_PLAY && playerOptions.islive && !playerOptions.source.hasOwnProperty("audiosource")) {
        const nextContentType= PlayerHelper.getContentType(nextOptions);
        if(nextContentType){
          const isSameSource=PlayerHelper.sameMediaContent(playerOptions, nextOptions, nextContentType);
          if(isSameSource && AAFPlayer.optionsPlayingAsPip(playerOptions) && !AAFPlayer.optionsPlayingAsPip(nextOptions) && playerOptions.islive && nextOptions.islive){ //si es el mismo source y además viene de pip a full
            console.log('FullVideo componentWillReceiveProps isSameSource && playerOptions is playing as pip && nextOptions will play as full');
            LayersControl.hideUX();
          }
        }
      }
    }
    /*
      Verificar por timeshift time antes de enviar a AAF
    */
   let syncT = this.syncTimeshiftCurrentTime(nextProps);
    AAFPlayer.setPlayerState(propsVideo, this.getAAFPlayerWrapper(), this.getAAFCallbacks());
  }

  /**
   * Calcula si resetea el timeshift current time a cero, sólo es un flag
   */
  syncTimeshiftCurrentTime(nextProps) {
    // Sólo aplica a full
    if(nextProps.player.ispip) {
      return false;
    }

    let currentAAFPlayer = AAFPlayer.getCurrentPlayingState(false);
    if(currentAAFPlayer === AAFPLAYER_PLAY) {
      if(nextProps.player.playerstate === AAFPLAYER_STOP) {
        this.state.currentTimeshiftTime = 0;
      }
      // Está en play y el siguiente estado es play
      else {
        let currentAAFPlayerParams = AAFPlayer.getCurrentPlayerOptions(false);
        // Si es audio lo actual, quiza pasa a live o a lo que sea...se resetea timeshift time
        if(currentAAFPlayerParams.source && currentAAFPlayerParams.source.hasOwnProperty('audiosource')) {
          this.state.currentTimeshiftTime = 0;
        }
        else {

          // Si viene desde ficha epg de evento pasado, y da clic en reiniciar evento
          if(nextProps.player.timeshiftData && nextProps.player.timeshiftData.startprogressbar) {
            this.state.currentTimeshiftTime = nextProps.player.timeshiftData.startprogressbar;
            return;
          }

          // Si el siguiente contenido es vod
          let next_is_live = nextProps.player.source  && (nextProps.player.source.videoid || nextProps.player.source.videosource) && nextProps.player.islive === true && !nextProps.player.starttime && !nextProps.player.endtime;
          // Si el siguiente contenido no es timeshift o no es live se resetea
          let next_is_timeshift = nextProps.player.source && (nextProps.player.source.videoid || nextProps.player.source.videosource) && nextProps.player.islive === true && nextProps.player.starttime && !nextProps.player.endtime;
          let next_is_live_or_timeshift = next_is_live || next_is_timeshift;
          if(!next_is_live_or_timeshift) {
            this.state.currentTimeshiftTime = 0;
          }
          // Si es live o timeshift y es diferente group id, se resetea
          else {
            let currentGid = currentAAFPlayerParams.source.videoid;
            let nextGid = nextProps.player.source.videoid;

            if(Utils.isNullOrUndefined(currentGid)) {
              currentGid = -1; // -1 sólo para que haga diferencia con el -2 de abajo o cualquier otro valor
            }
            if(Utils.isNullOrUndefined(nextGid)) {
              currentGid = -2;
            }
            // Son groups id diferentes? reset a 0 también
            if(currentGid != nextGid) {
              this.state.currentTimeshiftTime = 0;
            }
          }
        }
      }
    }
    // Stop u otro caso, se resetea
    else {
      // Si viene desde ficha epg de evento pasado, y da clic en reiniciar evento
      if(nextProps.player.timeshiftData && nextProps.player.timeshiftData.startprogressbar) {
        this.state.currentTimeshiftTime = nextProps.player.timeshiftData.startprogressbar;
      }
      else {
        // Reset del flag ... no es un setState, la bandera ya existía, "no se necesita un render o algo por el estilo con esto, no es necesario un setState ...sólo es un flag ¿?"
        this.state.currentTimeshiftTime = 0;
      }
    }

    return true;
  }

  goBack(sendTracking) {
    // Música se queda playeando en background
    if(this.props.player.source 
       && typeof this.props.player.source.hasOwnProperty === 'function'
       && this.props.player.source.hasOwnProperty("audiosource")){
       LayersControl.showUX();
    } else {
      // Reset parser subtitles, just in case...
      this.resetSubtitlesParser();

      let propsplayer = null;
      if(this.props.player.islive) {
        propsplayer = AAFPlayer.getCurrentPlayerOptions(false);
        propsplayer.size = {
          top: 100,
          left: 950,
          width: 302,
          height: 170,
        };
        this.props.player.clearLoading = true; // <- ¿?
        propsplayer.clearLoading = true;
      }
      else {
        propsplayer = this.props.player;
        propsplayer.playerstate = 'STOPPING';
      }
      AAFPlayer.setPlayerState(propsplayer, this.getAAFPlayerWrapper(), this.getAAFCallbacks());
      this.props.stopPlaying();
      //LayersControl.showUX();
      if(this.props.player.islive) {
        this.props.setResumeData({isBack: true});
        LayersControl.showUX(false); // se mantiene como pip
      }
      else {
        LayersControl.showUX(); // Se para la reproducción
      }
    }
  }
}

// const mapStateToProps = (state, ownProps) => Object.assign({}, state, ownProps);
const mapStateToProps = state => { return { player: state.player, linealChannels: state.linealChannels } };

const mapDispatchToProps = (dispatch) => bindActionCreators({
  setResumeData
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FullVideo)
