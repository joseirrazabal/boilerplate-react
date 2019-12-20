import './vcard.css';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import m from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Device from '../../devices/device';
import Button from '../Button';
import Ribbon from '../Ribbon';
import Spinner from './../../components/Spinner';
import { setResumeData } from "../../actions/resume";
import Utils from './../../utils/Utils';
import ModalConductor from '../../containers/Modal';
import {showModal, MODAL_ERROR, MODAL_PIN, MODAL_REINTENTO, MODAL_LANGUAGES, HIDE_MODAL} from '../../actions/modal';
import RequestManager from "../../requests/RequestManager";
import Metadata from '../../requests/apa/Metadata';
import * as api from '../../requests/loader';
import AddFavoriteTask from '../../requests/tasks/user/AddFavoriteTask';
import DeleteFavoriteTask from '../../requests/tasks/user/DeleteFavoriteTask';
import AddBlockedChannelsTask from '../../requests/tasks/user/AddBlockedChannelsTask';
import DeleteBlockedChannelsTask from '../../requests/tasks/user/DeleteBlockedChannelsTask';
import CheckBlockedChannelsTask from '../../requests/tasks/user/CheckBlockedChannelsTask';
import ReminderCreateTask from '../../requests/tasks/user/ReminderCreateTask';
import ReminderDeleteTask from '../../requests/tasks/user/ReminderDeleteTask';
import ReminderListTask from '../../requests/tasks/user/ReminderListTask';
//import GetRememberContentTask from '../../requests/tasks/user/GetRememberContentTask';
import StatusControlPinTask from '../../requests/tasks/user/StatusControlPinTask';
import DeviceStorage from '../DeviceStorage/DeviceStorage';
import { showNotification } from '../../actions/notification';
import ReminderNotifications from '../../utils/RemindersNotifications/ReminderNotifications';
import * as playerConstants from '../../utils/playerConstants';
import { playFullMedia, resizeFullMedia } from "../../actions/playmedia";
import store from './../../store';
import settings from './../../devices/all/settings';
import DeviceDetection from '../../utils/DeviceDetection';
import Npvr from './../../utils/Npvr';
import LevelRibbonTask from "../../requests/tasks/cms/LevelRibbonTask";
import ChannelsSingleton from "../../components/Epg/ChannelsSingleton"

import PlayerStreamingUtils from "../../utils/PlayerStreamingUtils";
import { setMetricsEvent } from "../../actions/metrics";
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import Translator from "../../requests/apa/Translator";
import { deleteFavoritedChannels, updateFavoritedChannels} from "../../reducers/user";
import AAFPlayer from '../../AAFPlayer/AAFPlayer';
import TvChannelUtil from '../../utils/TvChannelUtil';

import  * as userFilters from '../../containers/MyContent/settings';
import LayersControl from "../../utils/LayersControl";
import ChannelSingleton from "../Epg/ChannelsSingleton";
import channelBlockedUtil from "../../utils/ChannelBlockedUtil";

import { setLastTouchData, setLastTouchFavoritesData } from './../../reducers/user';

const config_remote_control = (DeviceStorage.getItem('config_remote_control') !== 'simple') ? true : false ;

const CHANNEL_QUANTITY = 15;

class Tv extends Component {

  constructor(props = {}) {
    super(props);

    this.state = {};
    this.setDefaultState();
    this.setInitialConfig();
    this.NpvrAdd = this.NpvrAdd.bind(this);
    this.handlePlay = this.handlePlay.bind(this);

    this.setStatetHandler(this.ReminderListRequest, 'isReminder');
    this.setStatetHandler(this.CheckchannelsRequest, 'isBlocked');
    this.checkPinrequest(this.statusRequest);

    this.closeFullPlayer = this.closeFullPlayer.bind(this);
    this.resizeFullPlayer = this.resizeFullPlayer.bind(this);
    this.setterHandler = this.setterHandler.bind(this);

    this.playerStreamingUtils = new PlayerStreamingUtils();

    const isAndroid = Device.getDevice().getPlatform() === 'android';
    const isArgentina = DeviceStorage.getItem('region') === 'argentina';
    this.recordingsEnabled = isAndroid && isArgentina ? false : true;

    //TODO Hardcodeo para que exista un lenguaje y se pueda deplegar el modal, el cual se quitará cuando se resuelva la implementacion de los lengujaes en los eventos
    this.languages = [];
    this.languages[0]={};
    this.languages[0].content_id=701157;
    this.languages[0].label_large="Idioma Original";
    this.languages[0].option_id= "O-EN";
    //fin Hardcodeo

    this.wasBack = false;
  }

  setDefaultState() {
    this.state = {
      isFetching: false,
      recommendations: [],
      isReminder: false,
      idReminder: null,
      isBlocked: false,
      isPinChannelActive: false,
      messages: {
        isFavorite: {
          title: '¡Agregado!',
          message: 'Este canal ha sido agregado a tu lista de favoritos.'
        },
        isReminder: {
          title: '¡Agendado!',
          message: 'Te notificaremos cuando comience este programa.'
        },
        isBlocked: {
          title: '¡Bloqueado!',
          message: 'Este canal ha sido agregado a tu lista de canales bloqueados.'
        }
      },
      pinCode: '',
    };
  }

  setInitialConfig(isUpdating = false) {
    const match = this.props.match;
    const queryData = window.location.href.split('eventData=');
    const eventData = Array.isArray(queryData) && queryData.length >= 2
      ? JSON.parse(decodeURI(queryData[1].replace('#', '')))
      : null;
    this.groupId = eventData.event.channel_group_id;
    this.hasNpvrStorage= ChannelSingleton.getNpvrStorage(this.groupId)!=0?true:false;
    this.recommendations = [];
    this.isCurrent = false;

    if (eventData && eventData.event) {
      this.event = eventData.event;
      this.event.eventStatus = new Npvr().getEventStatus(this.event.id);
      //this.eventStatus=event.eventStatus;
      const hasTimeShift = this.event.ext_startover && this.event.ext_startover == '1' ? true : false;
      const timeshift_enable_APA = ChannelsSingleton.getTimeshift(this.event.channel_group_id);
      const canTimeShift = this.canTimeShift(this.event);
      this.hasTimeShift = timeshift_enable_APA && (hasTimeShift ? !!canTimeShift : false);
      this.canPlayChannel = ChannelsSingleton.canPlayChannel(this.event.channel_group_id);
      this.dateBegin = canTimeShift ? canTimeShift : this.event.date_begin;
      this.dateEnd = this.event.date_end;
      this.recordable = this.event.ext_recordable === '1';
      this.fromEPG= this.event.keyOfControl===true;
      this.isCurrent = Utils.isDateBetween(this.dateBegin, this.dateEnd);
      this.isPastEvent = Utils.isDateBetween(this.dateEnd,Utils.now());
      if (this.isCurrent && !this.fromEPG) {
        this.isFetching=true;
        this.handlePlay(true);
      } else {
        this.isFetching=false;
        //
      }

      this.channel_id = this.event.channel_id;
      this.channel_url = Utils.getChannelUrl(this.event.channel_group_id);
      this.event_id = this.event.id;
      this.recording_id=null;

      let evType = null;
      evType = this.event.type;
      if(evType == '0' || !evType) {
        evType = 'epg_serie';
      }
      this.type_event = evType;

      this.keys = Device.getDevice().getKeys();

      this.user_hash = DeviceStorage.getItem("user_hash") || "";
      this.exp_date = this.dateBegin.replace(/\/|\s|:/g, '');
    }

    this.statusRequest = new StatusControlPinTask();
    this.AddFavoriteRequest = new AddFavoriteTask(this.groupId);
    this.DeleteFavoriteRequest = new DeleteFavoriteTask(this.groupId);

    this.ReminderCreateRequest = new ReminderCreateTask(this.event_id, this.exp_date, this.type_event, this.channel_id);
    this.ReminderDeleteRequest = new ReminderDeleteTask(this.groupId);
    this.ReminderListRequest = new ReminderListTask();
    //this.GetRememberRequest = new GetRememberContentTask(this.groupId);

    this.AddchannelsRequest = new AddBlockedChannelsTask(this.groupId);
    this.DeletechannelsRequest = new DeleteBlockedChannelsTask(this.groupId);
    this.CheckchannelsRequest = new CheckBlockedChannelsTask(this.groupId);

    const updateState = {
      isFetching: this.isFetching,
      isFavorite: this.props.user.channels_groups ? this.filterFavorited(this.props.user.channels_groups, this.groupId) : false,
      isRecording: this.event.eventStatus?this.event.eventStatus:false,
    };

    if(isUpdating) {
      this.setState({
        ...updateState,
        pinCode: ""
      });
    } else {
      this.state = {
        ...this.state,
        ...updateState,
      };
    }
  }

  setResume(self, event) {
    let response = false;
    if (event) {
      const start = m(event.date_begin, 'YYYY/MM/DD HH:mm:ss');
      const end = m(event.date_end, 'YYYY/MM/DD HH:mm:ss');
      const durationParsed = `${start.format('HH.mm')}hs. a ${end.format('HH.mm')}hs.`;
      self.props.setResumeData({
        title: event.name,
        description: event.description,
        previewImage: event.ext_eventimage_name && event.ext_eventimage_name.replace('https', 'http'),
        year: event.ext_year,
        schedule: durationParsed,
        rating: event.parental_rating,
        category: event.dvb_content,
        duration: event.duration ? Utils.formatDuration(event.duration) : null,
        purchaseButtonInfo: null,
        showBack: false,
        seasonsText: null,
        image_still: null,
        eventStatus: event.eventStatus,
        recordable: event.ext_recordable == '1',
        showActionBtns: false,
        playButton: null,
        langButton: null,
        favouriteButton: null,
      });
      response = true;
    }
    return response;
  }

  setEventStatus(eventStatus) {
    this.props.setResumeData({ eventStatus });
  }

  setLanguage = (language) => {
    DeviceStorage.setItem('default_lang', language.option_id);
    this.contentId = language.content_id;
    //TODO implementar la funcion cuando se definan los lenguajes this.sendMetric('idioma',language.label_short);
  };

  showLanguages() {
    const modal = {
      modalType: MODAL_LANGUAGES,
      modalProps: {
        languages: this.languages,
        callback: this.setLanguage
      }
    }
    
    if (this.languages.length > 0)
      this.props.showModal(modal);
    else
      this.showError('No languages');
  }

  showError(message, callback = () => { }) {
    const modal = {
      modalType: MODAL_ERROR,
      modalProps: {
        callback,
        content: { message }
      }
    }
    this.props.showModal(modal);
  }

  handleKeyPress = (event) => {
    const playerIsPlayingInPip= AAFPlayer.livePlayingAsPip();
    if(!playerIsPlayingInPip)
      return;
    console.log('event', event);
    const currentKey = this.keys ? this.keys.getPressKey(event.keyCode) : null;
    console.log('Listening Ficha/Tv, currentKey:',currentKey);
    switch (currentKey) {
      case 'BLUE':
        event.preventDefault();
        event.stopPropagation();
        this.handlePlay()
        break;
      case 'YELLOW':
        event.preventDefault();
        event.stopPropagation();
        if (this.state.isFavorite)
          this.deleteFavorite();
        else
          this.addFavorite();

        break;
      case 'GREEN':
        event.preventDefault();
        event.stopPropagation();
        this.showLanguages();
        break;
      case 'BACK':
        event.preventDefault();
        event.stopPropagation();
        this.wasBack = true;
        break;
      default:
        break;
    }
  }

  setResumePromise() {
    let setResumeFunction = this.setResume;
    let self = this;
    let event = this.event;
    let promise = new Promise(function(resolve, reject) {
      if (setResumeFunction(self, event)) {
        resolve(true);
      }
      else {
        reject(false);
      }
    });
    return promise;
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);

    if (!this.isCurrent || this.fromEPG) {
      this.getContentData(this.groupId);
    }
    this.setResumePromise().then(this.resizeFullPlayer());// Resize player when success
  }

  componentDidUpdate(){
    this.setResumePromise().then(this.resizeFullPlayer());
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(nextProps.match) !== JSON.stringify(this.props.match) || JSON.stringify(nextState) !== JSON.stringify(this.state) ;
  }

  componentWillUpdate(nextProps){
    let channelList = channelBlockedUtil.get('blockedChannels');
    if(channelList.indexOf(nextProps.match.params.groupId) !== -1){
      this.setState({ isBlocked: true });
    }else{
      this.setState({ isBlocked: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.location.search !== nextProps.location.search) {
      this.setInitialConfig(true);
      this.getContentData(this.groupId);
    }
  }

  componentWillUnmount() {
    // For the moment, we dont reset player
    //store.dispatch(playFullMedia({src: null}));

    document.removeEventListener('keydown', this.handleKeyPress);
  }

  canTimeShift(event) {
    const timeshiftAllowed = ChannelsSingleton.getTimeshift(event.channel_group_id) * 60;
    const now = m(Utils.now());
    const diffStart = now.diff(m(event.date_begin), 'seconds');
    const startMatch = diffStart <= timeshiftAllowed;
    const diffEnd = now.diff(m(event.date_end), 'seconds');
    const endMatch = diffEnd <= timeshiftAllowed;
    const dateBegin = startMatch ? event.date_begin : now.subtract(timeshiftAllowed, 'seconds').format('YYYY/MM/DD HH:mm:ss');
    return diffStart > 0 && (startMatch || endMatch) ? dateBegin : false;
  }

  async getContentData(groupId = "") {
    if(this.props.user.isLoggedIn === true) {
      //Aqui va una llamada a islogedIn para obtener el valor actualizado de lasttouch
      /*
      const isLoggedIn = await api.isLoggedIn();            
      if (isLoggedIn && isLoggedIn.response && isLoggedIn.response.lasttouch && isLoggedIn.response.lasttouch.favorited) {        
        const lastTouch = isLoggedIn.response.lasttouch.favorited;        
        store.dispatch(setLastTouchFavoritesData(lastTouch));
      }
      */
      //this.setState({ isFetching: false });
      const favs = await api.fetchFavoriteLoader(this.props.user, userFilters.default.myChannels);
      this.recommendations = (favs.response && favs.response.groups);
      //Fix boton favoritos, ahor alo toma de la respuesta de services/user/favorited y no de Redux
      let isFavorite = this.recommendations.some(e => e.id == this.groupId);
      this.setState({ isFavorite, recommendations: favs.response.groups });
    }
    else {
      //this.setState({ isFetching:  });
      var trecommendations = await api.contentRecomendations(this.groupId);
      this.setState({ recommendations: trecommendations });
    }
  }

  getCurrentChannelRange(groupId = '', availableChannels = []) {
    const index = availableChannels.findIndex(ch => ch.group_id == groupId);
    const tolerance = Math.floor(CHANNEL_QUANTITY / 2);
    const from = index >= tolerance ? (index - tolerance) : 0;

    return {
      from,
      quantity: CHANNEL_QUANTITY,
    }
  }

  handlePlay(redirect, isRestart) {
    new ChannelsSingleton().getChannels().then(async (availableChannels) => {
      const channelsRange = this.getCurrentChannelRange(this.groupId, availableChannels);
      this.handlePlayChannel(channelsRange, redirect, isRestart);
    });
  }

  tryHandlePlay(range, redirect, isRestart) {
    this.handlePlayChannel(range, redirect, isRestart);
  }

  async handlePlayChannel(range, redirect, isRestart) {
    const streamType = this.playerStreamingUtils.resolveStreamType(['hls'], null, true);
    const begin = !this.isCurrent || isRestart && this.hasTimeShift ? this.dateBegin : '';
    const end = !isRestart? this.dateEnd : '';

    // Puede ser timeshift o puede ser catchup
    if(this.isPastEvent && this.hasTimeShift) {
      // Timeshift
      if(isRestart && begin) {
        // Esta dentro del rango actual del canal de timeshift?
        // timeshiftByChannel = moment object
        let timeshiftByChannel = this.playerStreamingUtils.getStarttimeTimeshift(this.groupId);
        let diff = (new Date(begin).getTime()/1000) - timeshiftByChannel.unix();
        // Diff en segundos, esta el evento en el seek
        if(diff >= 0) {
          const maxtimeshiftallowed = this.playerStreamingUtils.getMaxTimeshiftAllowed(this.groupId);
          // Si esta dentro del rango, se hace timeshift
          let seektime =  (new Date(begin).getTime()/1000) - timeshiftByChannel.unix();
          if(seektime >= 0)  {
            let timeshiftData = {
              backward: true,
              seektime,
              maxtimeshiftallowed,
              starttime: timeshiftByChannel.unix(),
              // Para actualizar la barra de progreso
              startprogressbar: seektime
            };
            let tparams = {
              playerstate: 'PLAYING',
              source: {
                videoid: this.groupId
              },
              size: {
                top: 0,
                left: 0,
                width: 1280,
                height: 720,
              },
              ispreview: false,
              islive: true,
              ispip: false,
              filterTV: null,
              timeshiftData,
              starttime: timeshiftByChannel.format("YYYY/MM/DD hh:mm:ss")
            };
            store.dispatch(playFullMedia(tparams));
          }

        }
      }
      // Catchup
      else if (end) {
        //
        let cparams = {
          playerstate: 'PLAYING',
          source: {
            videoid: this.groupId
          },
          size: {
            top: 0,
            left: 0,
            width: 1280,
            height: 720,
          },
          ispreview: false,
          islive: false,
          ispip: false,
          starttime: begin,
          endtime: end
        };
        store.dispatch(playFullMedia(cparams));
      }
    }
  }

  checkPinrequest(request) {
    RequestManager.addRequest(request).then((resp) => {
      if (resp.response) {
        if (resp.response.pin_channel.status != 0) {
          this.setState({ isPinChannelActive: true });
        }
      }
    }).catch((err) => {
      console.error(err);
    });
  }

  // pgm can be null if there is no trailer for the selected content
  resizeFullPlayer() {
    let cstate = AAFPlayer.getCurrentPlayerOptions();
    const { playerstate, islive, ispip } = cstate;
    if(playerstate === 'PLAYING' && islive === true && ispip === false && !this.wasBack) {
      let sizepip = { top: settings.live_fullplayer_position_top, left: settings.live_fullplayer_position_left, width: settings.live_fullplayer_position_width, height: settings.live_fullplayer_position_height };
      let nextState = {};
      Object.assign(nextState, cstate);
      nextState.size = sizepip;
      store.dispatch(playFullMedia(nextState));
      LayersControl.showUX(false); // se mantiene como pip
    }
    if(this.wasBack && playerstate === 'PLAYING' && !AAFPlayer.livePlayingAsPip()){
      this.wasBack = false;
    }
  }

  closeFullPlayer() {
    store.dispatch(playFullMedia({ src: null }));
  }

  setStatetHandler(request, state) {
    RequestManager.addRequest(request).then((resp) => {
      if (resp.response) {
        console.log('RESPONSE CHANNEL SERVICES', resp.response);
        if(state === 'isReminder'){
          if(resp && resp.response) {
            let found=resp.response.find(it=> typeof it.data === 'string')
            if(found){
              resp.response=Utils.parseData(resp.response);
            }
            const reminder=resp.response.find( it => it.event_id === this.event_id);
            if(reminder){
              this.setState({ [state]: true, idReminder:reminder.id });
            }
            else{
              this.setState({ [state]: false, idReminder:null });
            }
          }
        } else {
          this.setState({ [state]: true });
        }
      }
    }).catch((err) => {
      console.error(err);
    });
  }


  requestHandler(request, state, value, icon = '') {
      if(state === 'isReminder' && !value){
        request= new ReminderDeleteTask(this.state.idReminder);
        ReminderNotifications.clearTimeoutReminder(this.state.idReminder);
      }
      RequestManager.addRequest(request).then((resp) => {
      if (resp.response) {
          if (value) {
            this.props.showNotification({ show: true, title: this.state.messages[state].title, msg: this.state.messages[state].message, faClass: icon, type:'message' });
          }
          if(state === 'isFavorite') {
            if(resp.lasttouch && resp.lasttouch.favorited) {
              const lastTouchFav = resp.lasttouch.favorited; 
              //this.setState({ isFetching: true });
              let userStore = Object.assign({}, this.props.user);
              userStore.lasttouch.favorited = lastTouchFav;
              userStore.lasttouch.seen = lastTouchFav;

              api.fetchFavoriteLoader(userStore, userFilters.default.myChannels).then((favs) => {
                this.recommendations = (favs.response && favs.response.groups);
                //Fix boton favoritos, ahor alo toma de la respuesta de services/user/favorited y no de Redux
                let isFavorite = this.recommendations.some(e => e.id == this.groupId);

                this.setState({ isFetching: false, isFavorite, recommendations: favs.response.groups });
                store.dispatch(setLastTouchData(lastTouchFav));
                store.dispatch(setLastTouchFavoritesData(lastTouchFav));
                
              });
            }
          }
          if(state === 'isReminder' && value) {
            this.setStatetHandler(this.ReminderListRequest,'isReminder');
          }
          else {
            this.setState({ [state]: value });
          }
          if (state === 'isReminder') {
              ReminderNotifications.setReminders(parseInt(Metadata.get("sentinel_reminders_interval", 30)), false);
          }
      } else {
          console.log('Error', resp.response);
          const modal = {
              modalType: MODAL_ERROR,
              modalProps: {
                  content: resp.errors.error[0]
              }
          };
          this.props.showModal(modal);
      }
      }).catch((err) => {
          console.error('Error:', err);
          if (err.code === 'error_channel_exists') {
              this.setState({ [state]: true });
          } else if (err.code === 'error_channel_not_exists') {
              this.setState({ [state]: false });
          } else {
              const modal = {
                  modalType: MODAL_ERROR,
                  modalProps: {
                      content: err
                  }
              };
              this.props.showModal(modal);
          }
      });
  }

  filterFavorited(favorited, id){
    if(favorited.filter){
      const favorite = favorited.find((it) => it.id == id )

      if(favorite) return true;
      else return null;
    }

  }

  setterHandler(value) {
      this.setState({ pinCode: value });
  }

  setterHandler(value,pinIsCreated) {
    if(pinIsCreated) {
      store.dispatch({
        type: HIDE_MODAL,
        modalType: MODAL_PIN
      });
    }
    this.setState({ pinCode: value });
  }

  addFavorite() {
    this.sendMetric('agregar a favorito');
    this.requestHandler(this.AddFavoriteRequest, 'isFavorite', true, 'fa-plus');
    console.log('>> Aqui se neceita la imagen y nombre del canal', this);

    new ChannelsSingleton().getChannels().then((channels) => {
      console.log('>> informacion de canales ....', channels);
      const channel = channels.find((item) => item.group_id === this.groupId)
      const group = {
        id: channel.group_id,
        title: channel.title,
        image_small: channel.cover,
        live_enabled: '1',
      }

      console.log('>> informacion de canal ....', group);

      this.props.updateFavoritedChannels(group);

    });
  }

  deleteFavorite() {
    this.sendMetric('quitar de favorito');
    this.requestHandler(this.DeleteFavoriteRequest, 'isFavorite', false);
    this.props.deleteFavoritedChannels(this.groupId);
  }

  addReminder() {
    this.sendMetric('agregar recordatorio');
    this.requestHandler(this.ReminderCreateRequest, 'isReminder', true, 'fa-clock-o');
  }

  deleteReminder() {
    this.sendMetric('quitar recordatorio');
    this.requestHandler(this.ReminderDeleteRequest, 'isReminder', false);
  }

  blockChannel() {
    this.requestHandler(this.AddchannelsRequest, 'isBlocked', true, 'fa-block');
    this.updateBlockedChannels(true);
  }

  unblockChannel() {
    this.requestHandler(this.DeletechannelsRequest, 'isBlocked', false);
    this.updateBlockedChannels(false);
  }

  updateBlockedChannels(toBlock) {
    let channelList = channelBlockedUtil.get('blockedChannels');
    if(toBlock){
      channelList.push(this.groupId);
    }else{
      let index = channelList.indexOf(this.groupId);
      channelList.splice(index,1);
    }
    channelBlockedUtil.clear();
    channelBlockedUtil.set('blockedChannels', channelList);
  }

  blockAction(funcion) {
      if (funcion === 'blockChannel') {
          this.sendMetric('bloquear canal');
      } else {
          this.sendMetric('desbloquear canal');
      }
      if (this.state.pinCode === '') {
        const that = this;
          this.props.showModal({
              modalType: MODAL_PIN, modalProps: {
                  pinIsCreated: true,
                  action: 'MP_CHECAR_STATUS',
                  successCallBack: (currentPin, pinIsCreated) => {
                      AAFPlayer.play();
                      this.setterHandler(currentPin,pinIsCreated);
                      pinIsCreated && that[funcion]();
                  },
                  failedCallBack: AAFPlayer.play,
              }
          });
      } else {
          this[funcion]();
      }
  }

  NpvrAdd() {
    this.sendMetric('grabacion');
    const npvr = new Npvr();
    if (!npvr.getEventStatus(this.event_id)) {
      npvr.add(this.props.user, this.event_id, this.channel_id,this.groupId).then(({eventStatus,recording_id}) => {
        this.recording_id=recording_id;
        if(eventStatus==='recording')
          this.setState({isRecording:true})
        this.setEventStatus(eventStatus);
      });
    }
  }

  NpvrDelete(){
    this.sendMetric('cancelar grabacion');
    const npvr = new Npvr();
    npvr.remove(this.props.user.user_token,this.recording_id,this.event_id).then((response) => {
      if(response.success)
        this.setState({isRecording:false})
        this.setEventStatus(null);
    });
  }


  sendDimension() {
    const payload = new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: 'executor' });
  }

  sendMetric(action) {
    if (typeof this.props.setMetricsEvent === 'function') {
      const label = DeviceStorage.getItem('label-channel-analytics');
      this.props.setMetricsEvent({
        hitType: 'event',
        eventCategory: 'TV',
        eventAction: `vcard/${action}`,
        eventLabel: label,
      });
      this.props.setMetricsEvent({ type: 'executor' });
      this.sendDimension();
    }
  }

  render() {
    let funcion;
    console.log("tv render", this.props);
    if (this.state.isFetching) {
      return <Spinner className="FichaTV" />
    }
    const recommendations = this.state.recommendations;
    return (
      <div>
          {this.props.user.isAnonymous && !this.props.user.isLoggedIn ? <div className="vcard-actions" /> :
              <div className="vcard-actions">
                  {
                    this.canPlayChannel && (this.isCurrent || this.hasTimeShift)  ?
                          <Button
                              text={Metadata.get("detail_play", "Ver ahora")}
                              iconClassName={"fa fa-play"}
                              colorCode={ config_remote_control ? "blue" : null }
                              onClick={() => { this.handlePlay(); this.sendMetric('ver ahora'); }}
                          />
                          : null
                  }
                  { this.canPlayChannel && this.isCurrent && this.hasTimeShift ?
                      <Button
                          text={Metadata.get("tv_restart_event", "Reiniciar evento")}
                          iconClassName={"fa fa-step-backward"}
                          onClick={() => { this.handlePlay(false, true); this.sendMetric('reiniciar evento'); }}
                      />
                      : null}

                  {this.user_hash !== 'undefined' &&
                  <Button
                      text={(this.state.isFavorite) ? "Quitar de Favoritos" : "Añadir a favoritos"}
                      iconClassName={(this.state.isFavorite) ? "fa fa-minus" : "fa fa-plus"}
                      colorCode={ config_remote_control ? "yellow" : null}
                      onClick={() => {
                          funcion = (this.state.isFavorite) ? "deleteFavorite" : "addFavorite";
                          this[funcion]();
                      }
                      }
                  />
                  }
                  {!this.isCurrent && this.user_hash !== 'undefined' && !Utils.isDateBetween(this.dateEnd,Utils.now()) &&
                  <Button
                      text={(this.state.isReminder) ? "Cancelar recordatorios" : "Recordatorio"}
                      iconClassName={"fa fa-clock-o"}
                      onClick={() => {
                          funcion = (this.state.isReminder) ? "deleteReminder" : "addReminder";
                          this[funcion]();
                      }
                      }
                  />
                  }
                  { this.canPlayChannel && this.user_hash !== 'undefined' && this.recordable && !this.isPastEvent && this.recordingsEnabled &&  this.hasNpvrStorage &&
                  <Button
                      text={(this.state.isRecording) ? "Cancelar grabación" : "Grabación"}
                      iconClassName={"fa fa-video-camera"}
                      onClick={() => {
                        funcion = (this.state.isRecording) ? "NpvrDelete" : "NpvrAdd";
                        this[funcion]();
                      }
                      }
                  />
                  }
                {this.isCurrent && this.fromEPG &&	<Button
                      text={"Idioma"}
                      iconClassName={"fa fa-comment"}
                      colorCode={"green"}
                      onClick={() => this.showLanguages()}
                  />}
                  {this.user_hash !== 'undefined' && this.state.isPinChannelActive &&
                  <Button
                      text={(this.state.isBlocked) ? "Desbloquear canal" : "Bloquear canal"}
                      iconClassName={(this.state.isBlocked) ? "fa fa-lock" : "fa fa-unlock"}
                      onClick={() => {
                          funcion = (this.state.isBlocked) ? "unblockChannel" : "blockChannel";
                          this.blockAction(funcion);
                      }
                      }
                  />
                  }
              </div>
          }
        <div className="vcard-recommendations">
          {recommendations.length > 0 ? <Ribbon
            title={this.props.user.isLoggedIn ? Translator.get('my_favorite_channels_title', 'Canales Favoritos') : Translator.get('SeeOther', 'Otros usuarios que vieron este contenido tambien vieron:')}
            type="landscape"
            items={
              recommendations.map(recommendation => {
                return {
                  title: recommendation.title,
                  id: recommendation.id,
                  group_id: recommendation.id,
                  cover: recommendation.image_small,
                  proveedor_name: recommendation.proveedor_name,
                  format_types: recommendation.format_types,
                  live_enabled: recommendation.live_enabled,
                  channel_number: recommendation.channel_number
                }
              })
            }
            setMetricsEvent={this.props.setMetricsEvent}
            carruselTitle={`${Translator.get('SeeOther', 'Otros usuarios que vieron este contenido tambien vieron:')}`}
          /> : null}
        </div>
      </div>
    )
  }
}

Tv.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      dateBegin: PropTypes.string.isRequired,
      dateEnd: PropTypes.string.isRequired,
      hasTimeShift: PropTypes.bool.isRequired
    })
  })
};

const mapStateToProps = state => ({ user: state.user });
export default connect(mapStateToProps, { showModal, setResumeData, showNotification, setMetricsEvent, updateFavoritedChannels, deleteFavoritedChannels })(withRouter(Tv));
