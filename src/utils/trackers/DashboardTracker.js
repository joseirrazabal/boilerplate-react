/**
 * Dependencies
 */
import Launcher from '../../requests/apa/Launcher';
import Metadata from '../../requests/apa/Metadata';
import getAppConfig from '../../config/appConfig';
import RequestManager from '../../requests/RequestManager';
import SimplePostRequestTask from "../../requests/tasks/SimplePostRequestTask";
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import store from "../../store";
import Device from "../../devices/device";
import pkg from '../../../package.json';

const DEVICE = Device.getDevice().getPlatform();
const id = Device.getDevice().getId();
const DEVICE_CATEGORY = id.getDeviceCategory();
const DEVICE_MODEL = id.getDeviceModel();

const LOGS_DASHBOARD_URL = Metadata.get('logs_dashboard_url'); // 'http://dashboard-producer.clarovideo.net/send'

/**
 * Se usa para el logging de las actividades del usuario (SumoLogic):
 *
    - Reproducción VOD:
        Llamada de PGM (pgm)
        inicio (start)
        fin (end)
        pausa (pause)
        stop (stop)
        error (error)
        buffering (buffering)
        seek (seek)
        Cambio de calidad (quality_up, quality_down)
        Cambio de idioma (language)
        Cambio de capítulo (episode)

    - Reproducción Live:
        Llamada de PGM(live_pgm)
        inicio (live_start)
        pausa (live_pause)
        error (live_error)
        stop (live_stop)
        buffering (live_buffering)
        Cambio de calidad (live_quality_up, live_quality_down)
 *
 */

const PGM = 'pgm';
const START = 'buffering_start';
const PLAY = 'start';
const END = 'End';
const BUFFERINGEND = 'buffering_end'
const PAUSE = 'Pause';
const STOP = 'Stop';
const ERROR = 'error';
const BUFFERING = 'buffering_start';
const SEEK = 'seek';
const QUALITY_UP = 'quality_up';
const QUALITY_DOWN = 'quality_down';
const LANGUAGE = 'Language';
const EPISODE = 'episode';
const RESUME = 'Resume';
const LEAVE = 'leave';
const LEAVE_APP = 'leave';
const FOWARD = 'Foward'; // NOT included on de documentation  there is more than a lager live
const REWIND = 'Rewind'; //
const FOWARD30 = 'Forward30';
const REWIND30 = 'Rewind30';

const LIVE_START = 'live_start';
const LIVE_PAUSE = 'live_pause';
const LIVE_STOP = 'live_stop';
const LIVE_ERROR = 'live_error';
const VOD_ERROR = 'vod_error';
const LIVE_BUFFERING = 'live_buffering';
const LIVE_QUALITY_UP = 'live_quality_up';
const LIVE_QUALITY_DOWN = 'live_quality_down';
const API_ERROR = 'api_error';
const APPLICATION_PARAMS = {
  platform: 'aaf',
  version: pkg.version,
};

const config = getAppConfig();
const ip = Launcher.get('ipNetworkPublicAddress');
const DEVICE_PARAMS = {
  ip,
  kind: config.device_category,
  brand: config.device_manufacturer,
  model: config.device_model,
  os: config.device_so,
  deviceid: config.device_id,
  device_type: config.device_type,
  device_name: config.device_name,
};

class DashboardTracker {

  static groupId = null;

  constructor() {
    this.flag = false;
    this.getmediaCounter = 0;
    this.state = store.getState();
    this.lastEvent = null;
    this.name = 'dashboard';
    this.headers = {
      'Pragma': `akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-nonces, akamai-x-get-ssl-client-session-id, akamai-x-get-true-cache-key, akamai-x-serial-no, akamai-x-get-request-id`
    };
  }

  setup(pgm = {}, extraParams = {}) {
    console.log("setup DashboardTracker");
    if(pgm && pgm.response && pgm.response.group && pgm.response.group.common )
    {
      DashboardTracker.groupId = pgm.response.group.common.id;
      DashboardTracker.content_id = pgm['entry']['content_id'] ? pgm.entry.content_id : '';
      DashboardTracker.video_url = pgm['response']['media']['video_url'] ? pgm.response.media.video_url: '';
      DashboardTracker.stream_type = pgm['entry']['stream_type'] ? pgm.entry.stream_type : '';
      DashboardTracker.pgmResponse = pgm.response;
      DashboardTracker.language = this.getLanguage(pgm['response']['language']['options'])


      if (pgm.response.group.common.extendedcommon && pgm.response.group.common.extendedcommon.media) {
        DashboardTracker.isLive = pgm.response.group.common.extendedcommon.media.islive == '1';
      }

    }
    if (pgm && pgm.response && pgm.response.media && pgm.response.media.analytics_url) {
      DashboardTracker.servername = pgm.response.media.analytics_url || 'default';
    }
  }

  pgm(data=null) {
    console.log("[DashboardTracker] pgm");
    if(data){


      let content={}
      content['msg']=JSON.stringify(data.errors[0]);
      content.stackTrace=JSON.stringify(data.errors[0]);
      content.url=data.url;
      this.checkLastEvent(PGM) && this.track(PGM,0,content);
    }
    else {
      this.checkLastEvent(PGM) && this.track(PGM);
    }


  }

  playing() {
    console.log("DashboardTracker playing");
    this.checkLastEvent(PLAY) && this.track(PLAY);
  }

  play() {
    //Se da click en play
    //Se comenta para evitar duplicidad

    //console.log("01DashboardTracker play");
    //this.track(PLAY);
  }


  credits() { //El evento END de dashboard se debe de enviar en el finPlayer por eso se pude en credist
    console.log("[DashboardTracker] end");
    this.checkLastEvent(END) && this.track(END);
  }

  pause() {
    console.log("[DashboardTracker] pause");
    this.checkLastEvent(PAUSE) && this.track(PAUSE);
  }

  stop() {
    console.log("[DashboardTracker] stop");
    this.checkLastEvent(STOP) && this.track(STOP);
  }

  error(content) {
    console.log("[DashboardTracker] error");
    this.track(ERROR, 0,content);
  }

  errorContent(content){
    console.log("DashboardTracker vod_error");
    this.track(VOD_ERROR, 0,content);
  }

  errorLive(content){
    console.log("DashboardTracker live_error");
    this.track(LIVE_ERROR, 0,content);
  }

  apiError(content){
    console.log("DashboardTracker api_error",content.stackTrace);
    this.track(API_ERROR, 0, content);
  }

  foward(){
    console.log("DashboardTracker foward with the player's bar controls");
    this.track(FOWARD);
  }

  rewind(){
    console.log("DashboardTracker rewind with the player back control");
    this.track(REWIND);
  }

  foward30(){
    console.log("DashboardTracker foward 30 seconds");
    this.track(FOWARD30);
  }

  rewind30(){
    console.log("DashboardTracker rewind 30 seconds");
    this.track(REWIND30);
  }

  bufferStart() {
    console.log("[DashboardTracker] buffer start");
    this.track(BUFFERING);
  }

  bufferEnd(){
    console.log("DashboardTracker buffer end")
    this.track(BUFFERINGEND)
  }

  seek(seek) {
    console.log("[DashboardTracker] seek: ", seek);
    this.track(SEEK, null, null, seek);
  }

  // bitRateChange(currentTime, diff) {
  //   // TODO: saber que parametro usar para saber si es quiality up o quality down
  //   this.track(QUALITY_UP);

  //   this.track(QUALITY_DOWN);
  // }

  audioChange() {
    console.log("[DashboardTracker] audioChange");
    this.track(LANGUAGE);
  }

  episodeChange() {
    console.log("[DashboardTracker] episode");
    this.track(EPISODE);
  }

  getTime () {
    console.log("[DashboardTracker] getTime");
    return new Date();
  }

  qualityUp(){
    console.log("DashboardTracker get quality Up");
    this.checkLastEvent(QUALITY_UP) && this.track(QUALITY_UP)
  }

  getUser () {
    console.log("[DashboardTracker] getUser");
    const { user } = this.state;
    if(user.isLoggedIn) {
      return {
        username: user.username,
        userid: user.user_id,
        hks: user.session_stringvalue,
        userhash: user.session_userhash,
        email: user.email,
        suscription: user.isSusc ? 1 : 0,
        region: user.region,
      }
    }

    return this.getAnonymousUser();
  }

  getAnonymousUser() {
    console.log("[DashboardTracker] getAnonymusUser");
    return {
      username: `anonymous`,
      userid: '0',
      hks: DeviceStorage.getItem('HKS'),
      userhash: DeviceStorage.getItem('user_hash'),
      email: 'anonymous',
      suscription: 0,
      region: DeviceStorage.getItem('region'),
    }
  }

  getServerName () {
    console.log("[DashboardTracker] getServerName");
    const { user } = this.state;
    return user.session_servername
  }

  getCdn() {
    console.log("[DashboardTracker] getCdn");
    const headers = window.headersPGM;
    return {
      node: headers && headers['node'] ? headers['node'] : '',
      'X-Cache': headers && headers['X-Cache'] ? headers['X-Cache'] : '',
      'X-Cache-Remote': headers && headers['X-Cache-Remote'] ? headers['X-Cache-Remote'] : '',
      'X-Cache-Key': headers && headers['X-Cache-Key'] ? headers['X-Cache-Key'] : '',
      'X-Cache-ID': headers && headers['X-Cache-ID'] ? headers['X-Cache-ID'] : '',
      URL: headers && headers['URL'] ? headers['URL'] : '',
    }
  }

  leaveContent(){
    console.log("DashboardTracker leave");
    this.track(LEAVE);
  }

  leaveApp(){
    console.log("DashboardTracker leave app");
    this.track(LEAVE_APP);
  }

  resume(){
    console.log("DashboardTracker resume");
    this.track(RESUME);
  }

  start(){
    console.log("DashboardTracker start");
    this.track(START);
  }

  // Revisa si este evento ya ha sido enviado,
  // de ser asi regresa false
  checkLastEvent(event) {

    if (this.lastEvent === event) {
      return false;
    }

    this.lastEvent = event;
    return true;
  }

  getOperator = (operatorKey, status, content = null, seek) => {

    let operator = {
      groupid: DashboardTracker.groupId,
      contentid: DashboardTracker.content_id ? DashboardTracker.content_id : '',
      video_url: DashboardTracker.video_url ? DashboardTracker.video_url : '',
      stream_type: DashboardTracker.stream_type ? DashboardTracker.stream_type : '',
      operatorKey,
      status,         // 1 exito, 0 fallo
      //faildata: {
      msg: content ? content.msg : "",        // Mensaje de error. Si PGM no response por un error de red aquí se indica el mensaje correspondiente, p.j "DNS exception", "Timeout exception", etc
      stacktrace: content ? content.stackTrace : "", // stacktrace en caso de haberse generado en el device,
      response: operatorKey === API_ERROR ? (this.pgmResponse ? this.pgmResponse : '') : "",   // Únicamente para PGM. Si PGM no responde por un error de red el valor no se envía. Para los demás eventos no se envía este valor.
      request: content ? content.url : "",  // Únicamente para PGM. Para los demás eventos no se envía este valor.
      //},
      //materialid: null,
      //rebuffering_start: null,
      //rebuffering_end: null,
      ///bitrate: null,
      language: DashboardTracker.language ? DashboardTracker.language : '',
      //seek_start: null,
      //seek_end: null,
      //seek_time: null,
    };

    if (seek) {
      operator = Object.assign({}, operator, seek);
    }

    return operator;

  };

  getLanguage(options) {

    if (!options) {
      return '';
    }

    for (var i = 0; i < options.length; i++) {
      if (options[i].is_current) {
        return options[i]['label_short'];
      }
    }
    return '';
  }

  getDashboardInfo(operatorKey, status = 1, content=null, seek = null) {
    return {
      time: this.getTime(),
      user: this.getUser(),
      application: APPLICATION_PARAMS,
      device: DEVICE_PARAMS,
      servername: this.getServerName(),
      cdn: this.getCdn(),
      operator: this.getOperator(operatorKey, status, content, seek),
    };
  }

  async track(operatorKey, status = 1, content=null, seek = null) {
    try {
      console.log("[DashboardTracker] track init");
      const log = this.getDashboardInfo(operatorKey, status, content, seek);
      const url = LOGS_DASHBOARD_URL === 'logs_dashboard_url'
        ? Metadata.get('logs_dashboard_url', null)
        : LOGS_DASHBOARD_URL;
      console.info("[DashboardTracker] track url", url);
      if (!url) { return; } // must not send the request on empty url
      const headers = this.headers;
      const body = { logs: [ log ] };
      //console.info("DashboardTracker dashboardTask", dashboardTask);
      const dashboardTask = new SimplePostRequestTask({ url,headers:{} , params: body, showErrorModal: false });
      await RequestManager.addRequest(dashboardTask);
      console.log("[DashboardTracker] track end");
    } catch (e) {
      console.error('[DashboardTracker] err', e);
    }
  }

}

export default DashboardTracker;
