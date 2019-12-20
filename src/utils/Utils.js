import moment from 'moment';
import storage from '../components/DeviceStorage/DeviceStorage';
import channels from './data/channels';
import Device from './../devices/device';
import ActivesSingleton from './../components/Header/ActivesSingleton';
import Metadata from '../requests/apa/Metadata'
import Translator from '../requests/apa/Translator'
import * as playerConstant from './playerConstants';
import store from '../store';
import pkg from '../../package.json'
import ChannelStreamUtil from './ChannelStreamUtil';
import DefaultToggleFunctions from './DefaultToggleFunctions';
import {HIDE_MODAL, MODAL_ERROR} from '../actions/modal';

class Utils {

  static sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  static isHtmlElement(element=null) {
    if(element==null) {
      return false
    }
    return element instanceof Element;
  }

  static isInteger(element = null) {
    if (element == null) {
      return false
    }
    return Number.isInteger(element)
  }

  static isNull(obj) {
    return obj === null;
  }

  static isNullOrUndefined(obj) {
    return Utils.isNull(obj) || Utils.isUndefined(obj);
  }

  static isNotNullOrNotUndefined(obj) {
    return !Utils.isNullOrUndefined(obj);
  }

  static isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  static isUndefined(obj) {
    return typeof obj === "undefined";
  }

  static isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  }

  static isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
  }

  static isObject(obj) {
    return obj === Object(obj);
  }

  static isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

  static urlParamsToJson (string) {
    let newObj = null;
    // Y si la url no trae params?
    if(string.indexOf('?') !== -1) {
      newObj = {};
      let urlParams = string.split('?')[1];
      urlParams = urlParams.split("&").reduce(function(prev, curr, i, arr) {
        var p = curr.split("=");
        prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
        return prev;
      }, {});

      for(let option in urlParams) {
        newObj[option] = urlParams[option];
      }
    }

    return newObj;
  }


  static appendParamToUrl (url, paramName, paramValue) {
    if (Utils.contains(url, "?")) {
      return url + "&" + paramName + "=" + paramValue;
    }
    return url + "?" + paramName + "=" + paramValue;
  }


  static contains (str, str2) {
    return str.indexOf(str2) !== -1;
  }

  static b64EncodeUnicode (str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
  }

  static b64DecodeUnicode (str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    }).join(''));
  }

  static base64_encode (stringToEncode) { // eslint-disable-line camelcase
                                            //  discuss at: http://locutus.io/php/base64_encode/
                                            // original by: Tyler Akins (http://rumkin.com)
                                            // improved by: Bayron Guevara
                                            // improved by: Thunder.m
                                            // improved by: Kevin van Zonneveld (http://kvz.io)
                                            // improved by: Kevin van Zonneveld (http://kvz.io)
                                            // improved by: Rafał Kukawski (http://blog.kukawski.pl)
                                            // bugfixed by: Pellentesque Malesuada
                                            // improved by: Indigo744
                                            //   example 1: base64_encode('Kevin van Zonneveld')
                                            //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
                                            //   example 2: base64_encode('a')
                                            //   returns 2: 'YQ=='
                                            //   example 3: base64_encode('✓ à la mode')
                                            //   returns 3: '4pyTIMOgIGxhIG1vZGU='
                                            // encodeUTF8string()
                                            // Internal function to encode properly UTF8 string
                                            // Adapted from Solution #1 at https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    let encodeUTF8string = function (str) {
      // first we use encodeURIComponent to get percent-encoded UTF-8,
      // then we convert the percent encodings into raw bytes which
      // can be fed into the base64 encoding algorithm.
      return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes (match, p1) {
          return String.fromCharCode('0x' + p1)
        })
    }
    if (typeof window !== 'undefined') {
      if (typeof window.btoa !== 'undefined') {
        return window.btoa(encodeUTF8string(stringToEncode))
      }
    } else {
      return new Buffer(stringToEncode).toString('base64')
    }
    let b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    let o1
    let o2
    let o3
    let h1
    let h2
    let h3
    let h4
    let bits
    let i = 0
    let ac = 0
    let enc = ''
    let tmpArr = []
    if (!stringToEncode) {
      return stringToEncode
    }
    stringToEncode = encodeUTF8string(stringToEncode)
    do {
      // pack three octets into four hexets
      o1 = stringToEncode.charCodeAt(i++)
      o2 = stringToEncode.charCodeAt(i++)
      o3 = stringToEncode.charCodeAt(i++)
      bits = o1 << 16 | o2 << 8 | o3
      h1 = bits >> 18 & 0x3f
      h2 = bits >> 12 & 0x3f
      h3 = bits >> 6 & 0x3f
      h4 = bits & 0x3f
      // use hexets to index into b64, and append result to encoded string
      tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
    } while (i < stringToEncode.length)
    enc = tmpArr.join('')
    let r = stringToEncode.length % 3

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
  }



  static Base64Decode(str) {
    return window.atob(str);
  }

  static setBackgroundImage(image_background) {
      if (image_background && image_background !== '') {
          this.idTimeout = setTimeout(() => {
              document.getElementById("root").classList.add("bgimage");
              document.getElementById("root").style.backgroundImage = "url('" + image_background + "')";
              let header = document.getElementsByClassName("header");
              if (header.length > 0) {
                  header[0].classList.add("black")
              }
          }, 1000);
      }
      else {
          this.idTimeout = setTimeout(() => {
              document.getElementById("root").classList.remove("bgimage");
              document.getElementById("root").style.backgroundImage = "";
          }, 1000);
      }
  }

  static setBackgroundImageWithoutDelay(image_background) {
    if (image_background && image_background !== '') {
      document.getElementById("root").classList.add("bgimage");
      document.getElementById("root").style.backgroundImage = "url('" + image_background + "')";
      let header = document.getElementsByClassName("header");
      if (header.length > 0) {
        header[0].classList.add("black")
      }
    }
    else {
        document.getElementById("root").classList.remove("bgimage");
        document.getElementById("root").style.backgroundImage = "";
    }
  }

  static resetBackground() {
      document.getElementById("root").classList.remove("bgimage");
      document.getElementById("root").style.backgroundImage = "";
  }

  static htmlEncode(value) {
      return '';
  }

  static htmlDecode(str) {
      var element = document.createElement('div');
      if (str && typeof str === 'string') {
          // Escape HTML before decoding for HTML Entities
          str = escape(str).replace(/%26/g, '&').replace(/%23/g, '#').replace(/%3B/g, ';');
          element.innerHTML = str;
          if (element.innerText) {
              str = element.innerText;
              element.innerText = '';
          } else {
              // Firefox support
              str = element.textContent;
              element.textContent = '';
          }
      }
      return unescape(str);
  }

  static getInnerText(strHtml) {
      var div = document.createElement("div");
      div.innerHTML = strHtml;
      var text = div.textContent || div.innerText || "";
      return text
  }
  /**
   * Apartir de una url esta funcion la descompone en uri y un objeto con parametros
   *
   * @param {string} qs
   */
  static getRequest(qs) {

      if (qs === undefined) {
          return {};
      }

      let result = {};
      let qsArray = qs.split('?');

      if (qsArray[0]) {
          result.uri = qsArray[0];
      }

      if (qsArray[1]) {
          result.params = this.getAllParametersFromQs(qsArray[1]);
      }

      return result;
  }

  /**
   * regresa un objeto Json con los parametros de un querystring
   * @param {string} qs
   */
  static getAllParametersFromQs(qs) {
      let res;
      let params = {};

      if (qs) {
          res = qs.split('&');
          res.forEach((item, index) => {
              let par = item.split('=');
              if (par[0] && par[1]) {
                  params[par[0]] = par[1];
              }
          })
      }

      return params;
  }

  static isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
  }

  /*Load external js scripts or specific js scripts by platform*/
  static loadScript(url) {

    if(Utils.isArray(url)) {
      let prom = [];
      url.forEach((item) => {
        prom.push(Utils.loadScript(item));
      });

      return Promise.all(prom);
    }

    return new Promise(function (resolve, reject) {

      console.log("[Utils] loadScript" + url);

      //let r = false;
      let pageScripts = document.getElementsByTagName("script")[0];
      let newScript = document.createElement("script");

      newScript.type = "text/javascript";
      newScript.src = url;
      //newScript.async = true;

      newScript.onload = () => {
          resolve();
      };
      newScript.onerror = newScript.onabort = reject;
      pageScripts.parentNode.insertBefore(newScript, pageScripts);
    });
  }


  /**
   * regresa un string con los parámetros de un objeto en formato queryString
   * @param {object} data
   */
  static buildQueryParams(data = {}) {
    if (typeof data === 'object') {
      return Object.keys(data).reduce((queryParams, k) => {
        if (data[k] !== undefined && data[k] !== null && data[k] !== '') queryParams.push(k + '=' + data[k]);
        return queryParams;
      }, []).join('&');
    }
    return '';
  }

  /**
   * válida un string con el formato correcto de un email
   * @param {string} email
   */
  static isValidEmail(email = '') {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }

  /**
   * Convierte un string con formato YYYY/MM/DD hh:mm:ss en Formato Unix Epoch UTC 64 bits para usar timeshift
   * @param {string} stringDate
   */
  static getClaroUnixEpochTime(stringDate = 'YYYY/MM/DD hh:mm:ss') {
    const date = new Date(stringDate);
    const epoch = date.getTime() / 1000.0;
    const result = `${Math.round(epoch)}`;

    //return '15126610420000000'; // TIMESHIFTTESTING
    return result.length === 10 ? `${result}0000000` : result;
  }

  /**
   * Obtiene el canal más cercano a un canal no existente
   * @param int searchedChannel
   * @param Array channels
   */
  static getClosestChannel(searchedChannel, channels) {
    const channelsBefore = channels.filter(channel => parseInt(channel.id) < searchedChannel);
    const channelAfter = channels.find(channel => parseInt(channel.id) > searchedChannel);
    const channelBefore = channelsBefore.length > 0 ? channelsBefore[channelsBefore.length - 1] : null;

    if (!channelBefore) {
      return channelAfter;
    } else if (!channelAfter) {
      return channelBefore;
    } else {
      const diffBefore = searchedChannel - parseInt(channelBefore.id);
      const diffAfter = parseInt(channelAfter.id) - searchedChannel;
      if (diffBefore < diffAfter) {
        return channelBefore;
      } else {
        return channelAfter;
      }
    }
  }

  /**
   * Formatea una cantidad de segundos en hs mins
   */
  static parseSecondsToHours(totalSeconds) {
    const secondsInHour = 3600;
    const secondsInMinute = 60;

    const hours = totalSeconds / secondsInHour;
    const seconds = totalSeconds % secondsInHour;

    const hoursParsed = (seconds === 0) ? hours : Math.floor(hours);
    const minutesParsed = (seconds === 0) ? 0 : Math.floor(seconds / secondsInMinute);

    return `${hoursParsed}hs ${minutesParsed}mins.`;
  }

  /**
   * Obtiene un Date con la hora correcta actual
   */

  static now(asMoment = false,unit = 'seconds') {
    // const server = parseInt(storage.getItem('server_time').substring(0,10));
    // const init = parseInt(storage.getItem('local_time').substring(0,10));
    const server = storage.getItem('server_time');
    const init = storage.getItem('local_time');
    const regex = RegExp('^[0-9]{10}[0-9]*$','g');
    let momentoServer;
    if(regex.test(server)){
      momentoServer = moment.unix(server.substring(0,10));
    }else{
      momentoServer = moment(server);
    }

    return asMoment ?  momentoServer.add(moment().diff(init, unit), unit):  momentoServer.add(moment().diff(init, unit), unit).toDate();
  }

  /**
   * Evalúa si un Date se encuentra dentro de dos fechas con la hora calculada del servidor
   * @param {string} dateBegin
   * @param {string} dateEnd
   */
  static isDateBetween(dateBegin = 'YYYY/MM/DD hh:mm:ss', dateEnd = 'YYYY/MM/DD hh:mm:ss') {
    const start = new Date(dateBegin);
    const end = new Date(dateEnd);
    const now = this.now();

    return start <= now && now <= end;
  }

  /**
   * formatea la duración de un contenido para mostrar en el resumen
   * @param {string} duration
   */
  static formatDuration(duration = "00:00:00") {
    duration = moment.duration(duration);
    return duration.hours() !== 0 ?
      `${duration.hours()}h ${duration.minutes()}min.`
      : `${duration.minutes()}min.`
  }

  static mock_links_nav_configuration () {
     const mock = {
        mexico: {
           music: 'claromusica',
           ppv: 'nagrappe',
           clarotv: new ActivesSingleton().getTvNode(),
           home: "home", // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
        },
        colombia: {
           music: 'claromusica',
           ppv: 'nagrappe',
           clarotv: 'clarotv',
           home:"home", // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
        },
       argentina: {
         music: 'claromusica',
         ppv: 'nagrappe',
         clarotv: new ActivesSingleton().getTvNode(),
         home:"home", // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
       },
        default: {
          music: 'claromusica',
          ppv: 'nagrappe',
          clarotv: new ActivesSingleton().getTvNode(),
          home: "home", // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
        }
     }

     return JSON.stringify(mock);

  }

  static getChannelUrl(group_id) {
    return (channels[group_id]) ? channels[group_id] : null;
  }

  static isFullEpgOpen(){
    const epgFullElement = this.getClassByClass("full-epg", "epg-main");
    if(epgFullElement.length > 0){
      return true;
    }
    return false;
  }
  static isFullEpgMosaicOpen(){
    const epgFullMosaic = this.getClassByClass("full-epg", "channels-wrapper");
    if(epgFullMosaic.length>0){
      return true;
    }
    return false;
  }

  static getClassByClass(father, child){
    const element = document.getElementsByClassName(father);
     var arr = Array.from(element);
     const children = arr.length > 0 ? arr[0].getElementsByClassName(child) : [];
     return children;
  }

  static getClassById(father, child){
    const element = document.getElementById(father);
    const children = element.getElementsByClassName(child);
    var arr = Array.from(children);
     return arr && arr[0];
  }

  static isMiniEPGOpen(){
    const elemet = document.getElementById("player-ui-container");
    const isOpen = elemet && elemet.className && elemet.className.indexOf('hide-controls') == -1;
    return isOpen;
  }

  static isLineTime(){
    var lineTime = window.document.getElementById("line-time")
    if(lineTime)
      return true;
  return false;
  }

  static isCurrentEventFuture(current){
    const { event } = current;
    let dateBegin = event.date_begin;
    let isFutureEvent = this.isDateBetween(Utils.now(), dateBegin);
    return isFutureEvent;
  }

  static getEpgRange(indexChannel, totalChannels, verticalOffset, visibleRows, fullEpg = false) {
    let from, quantity, infinite_fix, diff = 0;
    quantity = visibleRows + (verticalOffset * 2);
    if (Device.getDevice().getConfig().useEpgPostals ) {
      if (totalChannels <= quantity) {
        from = indexChannel;
        infinite_fix = from + quantity > totalChannels ? from + quantity - totalChannels : '';
      } else {
        diff = indexChannel - verticalOffset;
        if (diff < 0) {
          from = totalChannels - Math.abs(diff);
          infinite_fix = quantity - Math.abs(diff);
        } else {
          from = diff;
          infinite_fix = from + quantity > totalChannels ? from + quantity - totalChannels : '';
        }
      }
    } else {
      const safetyArea = visibleRows + verticalOffset;
      infinite_fix = '';

      if (totalChannels <= safetyArea) {
        from = indexChannel;
        quantity = totalChannels - from;
        diff = totalChannels - quantity;
        infinite_fix = diff;
      } else {
        diff = indexChannel - verticalOffset;
        if (diff < 0) {
          from = totalChannels - Math.abs(diff);
          quantity = totalChannels - from;
          infinite_fix = (safetyArea + verticalOffset) - quantity;
          if (quantity + infinite_fix >= totalChannels) {
            infinite_fix -= Math.abs((quantity + infinite_fix) - totalChannels);
          }
        } else {
          from = diff;
          quantity = safetyArea + verticalOffset;
          if (from + safetyArea + verticalOffset > totalChannels) {
            quantity = (from + safetyArea + verticalOffset >= totalChannels)
              ? totalChannels - from
              : safetyArea + verticalOffset;
            infinite_fix = visibleRows + (verticalOffset * 2) - quantity;
          }
          /*infinite_fix = totalChannels - quantity;*/
        }
      }
    }
    infinite_fix = infinite_fix || 0;
    return {
      from,
      quantity,
      infinite_fix
    }
  }

  static getAbbreviation(country) {
    const abbreviations = {
      chile: 'CL',
      mexico: 'MX',
      colombia: 'CO',
      peru: 'PE',
      brasil: 'BR',
      argentina: 'AR',
      dominicana: 'DO',
      guatemala: 'GT',
      ecuador: 'EC',
      elsalvador: 'SV',
      paraguay: 'PY',
      nicaragua: 'NI',
      costarica: 'CR',
      uruguay: 'UY',
      honduras: 'HN',
      panama: 'PA',
      puertorico: 'PR',
    };
    return abbreviations[country] || null;
  }

  static getFieldFromJsonToArray(data, field) {

      if (!data) {
          return [];
      }

      return data.map((x, index) => {
          return x[field]
      });
  }

  /**
   * Returns a hash code for a string.
   * (Compatible to Java's String.hashCode())
   *
   * The hash code for a string object is computed as
   *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
   * using number arithmetic, where s[i] is the i th character
   * of the given string, n is the length of the string,
   * and ^ indicates exponentiation.
   * (The hash value of the empty string is zero.)
   *
   * @param {string} s a string
   * @return {number} a hash code value for the given string.
   */
  static hashCode (s) {
    let h = 0, l = s.length, i = 0;
    if ( l > 0 )
      while (i < l)
        h = (h << 5) - h + s.charCodeAt(i++) | 0;
    return h;
  };

  /* INIT - ONLY FOR DEBUG */
  static setMarkTime(replace, msg) {
    if(replace) {
      storage.setItem('DEBUG_marktime', (new Date()).getTime());
      console.log('[MARKTIME] ------------------------------------> setting first mark time');
    }
    else {
      let lastMark = storage.getItem('DEBUG_marktime');
      if(lastMark) {
        let currentTime = (new Date()).getTime();
        if(currentTime >= lastMark) {
          let diff = (currentTime - lastMark) / 1000;
          if(msg) {
            console.log('[MARKTIME] ------------------------------------> time between: ' + diff + ' seconds' + ' [' + msg + ']');
          }
          else {
            console.log('[MARKTIME] ------------------------------------> time between: ' + diff);
          }
          // Update local storage
          storage.setItem('DEBUG_marktime', currentTime);
        }
      }
    }
  }
  /* END - ONLY FOR DEBUG */

  static streamIsVideo(streamType) {
    const videoStreams = [
      playerConstant.SS,
      playerConstant.SS_MA,
      playerConstant.HLS,
      playerConstant.HLS_KR,
      playerConstant.HLSPRM,
      playerConstant.DVBC,
      playerConstant.DVBS,
      playerConstant.IP_MULTICAST,
      playerConstant.IP_MULTICAST_UDP
    ]

    return videoStreams.find((availableStreamType) => {
      return availableStreamType === streamType;
    });
  }

  static streamIsAudio(streamType) {
    const audioStreams = [
      playerConstant.AUDIO,
      playerConstant.RADIO
    ]

    return audioStreams.find((availableStreamType) => {
      return availableStreamType === streamType;
    });
  }

  static parseData(response){
    return response.map((it)=>{
      it.data=JSON.parse(it.data);
      return it;
    });
  }

  static streamIsSpot(streamType) {
    const spotStreams = [
      playerConstant.SPOT
    ]

    return spotStreams.find((availableStreamType) => {
      return availableStreamType === streamType;
    });
  }

  static getRegionaliazedMetadata(key,defaultValue="{}"){ //Country is not required because comes from localstorage
    let region= storage.getItem('region')||'default';
    let procesando=Metadata.get(key,defaultValue);

    if(!procesando || procesando=="{}")
      return {}
    try {
      procesando = JSON.parse(procesando);
    }
    catch(e)
    {
      console.log('Unable to process Regionaliazed Metadata'+key,e);
      return {}
    }
    if(procesando[region]||procesando['default'])
    {
      return procesando[region]||procesando['default'];
    }
    return {}
  }

  static getExternalProviderOffers(provider, paywayData) {
    const lowerProvider = provider.toLowerCase();
    return paywayData
      .filter(d => d.producttype.toLowerCase() == lowerProvider)
      .map(d => d.offer_id);
  }

  static deviceCanPlayProvider(provider, config = {}) {
    let deviceConfig=Device.getDevice().getConfig();
    if(deviceConfig.supported_stream_types && deviceConfig.supported_stream_types.vod)
    {
      if(deviceConfig.supported_stream_types.vod && deviceConfig.supported_stream_types.live)
      {
        deviceConfig=deviceConfig.supported_stream_types.vod.concat(deviceConfig.supported_stream_types.live)
      }
      else{
        deviceConfig=deviceConfig.supported_stream_types.vod
      }

    }
    else{
      deviceConfig=null
    }

    const { encodes } = config.subscrition[provider] || { encodes: [] };

    if (!encodes || !encodes.length) return true;

    if( deviceConfig==null)
    {
      return true
    }

    const posibles = deviceConfig

    return posibles.some(p => encodes.indexOf(p) > -1);
  }


  static isModalHide() {

    const state = store.getState();
    console.log('==>state.modal.modalType', state.modal.modalType);
    return (state.modal.modalType === null || state.modal.modalType===HIDE_MODAL);

  }

  static modalType() {
    const state = store.getState();
    console.log('[dann] modaltype', state.modal);
    return state.modal.modalType;
  }
  static modalFrom() {
    const state = store.getState();
    if(state &&  state.modal && state.modal.modalProps && state.modal.modalProps.from)
      return state.modal.modalProps.from;
    else
      return null;
  }

  static isSonyBravia() {
    const agent = navigator.userAgent.toLowerCase();
    const platf = Device.getDevice().getPlatform();
    if(agent.indexOf('presto') != -1 && platf == 'sony') {
      return true;
    }
    else {
      return false;
    }
  }

  static deviceSupportHttps() {

    if (this.isSonyBravia() || this.isSamsungOrsay() || this.isNetcast()) {
      return false;
    }
    else {
      return true;
    }
  }

  static isSamsungOrsay () {
    return Device.getDevice().getPlatform() === 'samsung';
  }

  static isNetcast() {
    return Device.getDevice().getPlatform() === 'lg';
  }

  static isHisense() {
    return Device.getDevice().getPlatform() === 'hisense';
  }

  static deviceIsNotHisense() {
    const agent = navigator.userAgent.toLowerCase();
    return Device.getDevice().getPlatform() === 'hisense' ? (agent.indexOf("hisense/2014") !== -1 || agent.indexOf("5651") !== -1) ? true : false : true;
  }

  static getAPAFilterList() {

    let filters = Metadata.get("byr_filterlist_configuration");
    let region = storage.getItem("region");

    try {

      filters = JSON.parse(filters);

      if (filters) {
        filters = filters[region] || filters["default"];
      }

      if (filters && filters.filterlist) {
        return filters.filterlist;

      }

    }
    catch (e) {
      return null
    }

    return null
  }

  static combineLiveStreamType(ApaStreams, groupIdStreams) {
    let streamOptions = [];
    for(let i = 0; i < ApaStreams.length; i++) {
      if(groupIdStreams.indexOf(ApaStreams[i]) !== -1) {
        streamOptions.push(ApaStreams[i]);
      }
    }

    return streamOptions;
  }

  static setLiveURLFromFastPlay(gid, streams) {
    let channelInfo = ChannelStreamUtil.get(gid);
    // Si ya esta cacheado, no hace nada
    if(channelInfo && channelInfo.updated_live_url) {
      return;
    }
    if(channelInfo && channelInfo.fast_play) {
      for(let i = 0; i < streams.length; i++) {
        if(Object.keys(channelInfo.fast_play).indexOf(streams[i]) !== -1) {
           channelInfo.live_url = channelInfo.fast_play[streams[i]];
           channelInfo.updated_live_url = true; // <- Marca/flag para optimizar siguientes playings de este canal, por fast playing
           break;
        }
      }
      ChannelStreamUtil.set(channelInfo);
    }
  }

  static changeLiveURL(Streams, fastPlayStreams, gid) {
    let channelInfo = ChannelStreamUtil.get(gid);
    for(let i = 0; i < Streams.length; i++) {
      console.log("have",Object.keys(fastPlayStreams), Streams[i]);
      if(Object.keys(fastPlayStreams).indexOf(Streams[i]) !== -1) {
         channelInfo.live_url = fastPlayStreams[Streams[i]];
         break;
      }
    }
    ChannelStreamUtil.set(channelInfo);
    console.log("channelInfo",ChannelStreamUtil.get(gid));
  }

  static getLiveStreamURL(gid) {
    let channelInfo = ChannelStreamUtil.get(gid);
    if(channelInfo) {
      return channelInfo;
    }

    return null;
  }

  static getImageFrame(image, time){
      let frameImage = null;
      let time_progress = time;
      time_progress = time_progress.replace(':', 'h-').replace(':', 'm-');
      frameImage = image.replace('00h-00m-00', time_progress);
      return frameImage;
  }

  static getApaSupportedStream(device, isTv = null, groupId = null) {
    console.log('[PGM] -- getApaSupportedStream',device, isTv, groupId)
    if (Utils.isFunction(Device.getDevice().getSubplatform)) {

      let subplatform = Device.getDevice().getSubplatform();

      if (subplatform != undefined) {
        device = subplatform;
      }

    }
    // Usar UDP?, sólo aplica a live TV*

    let useUdp = false;
    // udp support a true por defecto
    let udp_support_config = Metadata.get("udp_support_config", '{ "enable": true }');
    udp_support_config = JSON.parse(udp_support_config);
    useUdp = (udp_support_config && udp_support_config.enable) ? true : false;

    // Termina resolve si se usa o no UDP, abajo se filtran los streamTypes

    // Llegado de MX
    // let streams = Metadata.get("supported_stream", '{ "default": { "arris": { "vod": ["dashwv_ma", "dashwv", "smooth_streaming_ma", "smooth_streaming"], "live": ["dashwv_ma", "dashwv", "ip_multicast","hls_kr"], "timeshift": ["dashwv"] }, "android": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["ip_multicast","hls_kr"], "timeshift": ["hls_kr"] }, "hisense": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["smooth_streaming"], "timeshift": ["smooth_streaming"] }, "lg": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["hls_kr"], "timeshift": ["hls_kr"] }, "nagra": { "vod": ["hlsprm_ma", "hlsprm"], "live": ["dvbc_ma", "dvbc"], "timeshift": ["hlsprm"] }, "opera": { "vod": ["smooth_streaming", "hls"], "live": ["hls_kr", "hls"], "timeshift": ["hls_kr"] }, "polaroid": { "vod": ["dashwv"], "live": ["hls_kr"], "timeshift": ["hls_kr"] }, "ps4": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["smooth_streaming"], "timeshift": ["smooth_streaming"] }, "samsung": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls", "widevine_classic"], "live": ["smooth_streaming", "hls_kr", "hls"], "timeshift": ["smooth_streaming"] }, "sony": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["hls_kr", "hls"], "timeshift": ["hls_kr", "hls"] }, "stbcoship": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["hls_kr"], "timeshift": ["hls_kr"] }, "stbhuawei": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["ip_multicast_lms","ip_multicast_udp", "ip_multicast", "hls_kr"], "timeshift": ["hls_kr"] }, "stbkaon": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["ip_multicast_lms","ip_multicast", "hls_kr"], "timeshift": ["hls_kr"] }, "tizen": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["smooth_streaming", "hls_kr", "hls"], "timeshift": ["smooth_streaming"] }, "web0s": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["hls_kr"], "timeshift": ["smooth_streaming"] }, "workstation": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["hls_kr", "hls"], "timeshift": ["hls_kr", "hls"] }, "workstationChafari": { "vod": ["hls_ma", "hls"], "live": ["hls_kr", "hls"], "timeshift": ["hls_kr", "hls"] } } }');

    let streams = Metadata.get("supported_stream", '{ "default": { "arris": { "vod": ["dashwv_ma", "dashwv"], "live": ["dashwv_ma", "dashwv", "ip_multicast","hls_kr"], "timeshift": ["dashwv"] }, "android": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["ip_multicast","hls_kr"], "timeshift": ["hls_kr"] }, "hisense": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["smooth_streaming"], "timeshift": ["smooth_streaming"] }, "lg": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["hls_kr"], "timeshift": ["hls_kr"] }, "nagra": { "vod": ["hlsprm_ma", "hlsprm"], "live": ["dvbc_ma", "dvbc"], "timeshift": ["hlsprm"] }, "opera": { "vod": ["smooth_streaming", "hls"], "live": ["hls_kr", "hls"], "timeshift": ["hls_kr"] }, "polaroid": { "vod": ["dashwv"], "live": ["hls_kr"], "timeshift": ["hls_kr"] }, "ps4": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["smooth_streaming"], "timeshift": ["smooth_streaming"] }, "samsung": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls", "widevine_classic"], "live": ["smooth_streaming", "hls_kr", "hls"], "timeshift": ["smooth_streaming"] }, "sony": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["hls_kr", "hls"], "timeshift": ["hls_kr", "hls"] }, "stbcoship": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["hls_kr"], "timeshift": ["hls_kr"] }, "stbhuawei": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["ip_multicast_lms","ip_multicast_udp", "ip_multicast", "hls_kr"], "timeshift": ["hls_kr"] }, "stbkaon": { "vod": ["smooth_streaming_ma", "smooth_streaming"], "live": ["ip_multicast_lms","ip_multicast", "hls_kr"], "timeshift": ["hls_kr"] }, "tizen": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["smooth_streaming", "hls_kr", "hls"], "timeshift": ["smooth_streaming"] }, "web0s": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["hls_kr"], "timeshift": ["smooth_streaming"] }, "workstation": { "vod": ["smooth_streaming_ma", "smooth_streaming", "hls"], "live": ["hls_kr", "hls"], "timeshift": ["hls_kr", "hls"] }, "workstationChafari": { "vod": ["hls_ma", "hls"], "live": ["hls_kr", "hls"], "timeshift": ["hls_kr", "hls"] } } }');


    let region = storage.getItem("region");
    try {
      streams = JSON.parse(streams);
      if (streams) {
        streams = streams[region] || streams["default"];
      }

      if (streams && streams[device]) {
        let combineStreams = null;
        if(isTv === true && !isNaN(groupId)) {
          // Streams disponibles para el groupid de acuerdo al common largo, si es que existen
          let _groupIdStreams = ChannelStreamUtil.get(groupId);
          if(_groupIdStreams && _groupIdStreams.encodes && Utils.isArray(_groupIdStreams.encodes)) {
            let groupIdStreams = _groupIdStreams.encodes;
            // streams[device]['live'] es una estructura definida desde metadata
            combineStreams = Utils.combineLiveStreamType(streams[device]['live'], groupIdStreams);
            // Si se usa udp ok, se deja pasar el array de strems combinados...pero
            // si no, entonces se quita udp de los soportados, no importando
            // que venga o udp por APA o udp por epg/channel
            if(!useUdp) {
              let newCombineStreams = combineStreams.filter(streamType => streamType !== playerConstant.IP_MULTICAST_UDP);
              combineStreams = newCombineStreams;
            }
          }
          // Si no vienen stream types desde epg/channel, se filtra metadata supported_streams
          else {
            if(!useUdp) {
              let newCombineStreams = streams[device]['live'].filter(streamType => streamType !== playerConstant.IP_MULTICAST_UDP);
              streams[device]['live'] = newCombineStreams;
            }
          }

          if(Utils.isArray(combineStreams) && combineStreams.length > 0) {
            // Reemplazar live de metadata con los nuevos streamTypes
            // sólo aplica live
            streams[device]['live'] = combineStreams;
          }
           console.log("_groupIdStreams",_groupIdStreams);
          if(_groupIdStreams && _groupIdStreams.fast_play) {
            console.log("fast_play",_groupIdStreams.fast_play);
             Utils.changeLiveURL(streams[device]['live'],_groupIdStreams.fast_play, groupId);
          }
        }
        return streams[device];
      }
    }
    catch (e) {
      console.error('*** Error al obtener llave supported_stream de Metadata.', e)
      return null
    }

    return null
  }

  static getAPARegionalized(Apakey, param, defaultValue) {

    let apaValue = Metadata.get(Apakey, '{}');
    let region = storage.getItem("region");

    try {

      apaValue = JSON.parse(apaValue);

      if (apaValue) {
        apaValue = apaValue[region] || apaValue["default"];
      }

      if (apaValue && apaValue[param]) {
        return apaValue[param] || defaultValue;
      }

    }
    catch (e) {
      console.log('>>> Error', e);
      return defaultValue || null;
    }
    return defaultValue || null;
  }

  static findNode(node, index, array, code, extra2) {
    console.log('+>+ findNode, node:', node );
    console.log('+>+ findNode, index:', index );
    console.log('+>+ findNode, array: ' , array);
    console.log('+>+ findNode, extra1:' , code );
    console.log('+>+ findNode, extra2:', extra2);

    if (node.code === code) {
      this.currentNode = node;
    } else if (node.childs && node.childs.forEach) {
      node.childs.forEach(this.findNode);
    }
  }

  /**
   * Para DEBUG, remueve las propiedades del tipo "function" en js objetos (sólo js objetos planos, se verifica functions sólo en el "primer nivel")
   */
  static removeFunctionProperty(plainObject) {
    if(!Utils.isObject(plainObject))
      return null;
    let tempObject = Object.assign({}, plainObject);

    for(var i in tempObject) {
      if(Utils.isFunction(tempObject[i])) {
        delete tempObject[i];
      }
    }

    return tempObject;
  }

  static getUpdateType(){
    const region= storage.getItem('region');
    let updateType=Metadata.get('update_type', '{"default":"optional"}');
    updateType = JSON.parse(updateType);
    return updateType[region] || updateType['default'];
  }

  static getIntervalTimeCheckVersion(){
    const region= storage.getItem('region');
    let updateType=Metadata.get('interval_time_check_version', '{"default":"120"}');
    updateType = JSON.parse(updateType);
    return updateType[region] || updateType['default'];
  }

  static getIntervalTimeCheckEpgVersion(){
    const region= storage.getItem('region');
    let updateType=Metadata.get('interval_time_check_epg_version', '{"default":"5"}');
    updateType = JSON.parse(updateType);
    return updateType[region] || updateType['default'];
  }

  static getIntervalTimeCheckLinealChannels(){
    const region= storage.getItem('region');
    let updateType=Metadata.get('interval_time_check_lineal_channels', '{"default":"60"}');
    updateType = JSON.parse(updateType);
    return updateType[region] || updateType['default'];
  }

  static appVersionToNumber(version){
    let arrayVersion=version.split('.');
    if(arrayVersion.length>0)
      return parseInt(arrayVersion.reduce((previous,current)=>previous.concat(current)));
    else
      return null;
  }

  static getMinimumVersionRequired(){
    const region= storage.getItem('region');
    const defaultVersion = `{"default":{"version":"0.2.0"}}`
    let minimunVersion=Metadata.get('minium_version_required', defaultVersion);
    minimunVersion = JSON.parse(minimunVersion);
    return minimunVersion.region && minimunVersion.region.version ? minimunVersion[region]['version'] : minimunVersion.default && minimunVersion.default.version ? minimunVersion['default']['version'] : pkg.version;

  }

  // a app_version from API, b app_version from localStorage
  static compareVersions(a, b) {
    console.log('[Utils] [EpgVersionStatus] compareVersions a(app_version from API), b(app_version from localStorage)',a, b);
    if ( (a === b) || (!a || !b) ) {
      return false;
    }
    const a_components = a.split(".");
    const b_components = b.split(".");
    const length_a_components = a_components.length;
    const length_b_components = b_components.length;
    if(length_a_components===length_b_components){
      for (let i = 0; i < length_a_components; i++) {
        if (parseInt(a_components[i]) > parseInt(b_components[i])) {
          return true;
        }
        if (parseInt(a_components[i]) < parseInt(b_components[i])) {
          return false;
        }
      }
    }
    return false;
  }

  static getLastVersionRequired(){
    const region= storage.getItem('region');
    const defaultVersion = `{"default":{"version":"0.2.0"}}`
    let lastVersion=Metadata.get('last_version_required', defaultVersion);
    lastVersion = JSON.parse(lastVersion);
    return lastVersion.region && lastVersion.region.version ? lastVersion[region]['version'] :
      lastVersion.default && lastVersion.default.version ? lastVersion['default']['version'] : pkg.version;
  }

  //metadata key to toggle function in order to show the talent ribbon in vcard
  static getToggleFunctionsFromMetadata(){
    const region= storage.getItem('region');
    let toggleFunctions = Metadata.get('toggle_functions_',DefaultToggleFunctions);
    toggleFunctions=JSON.parse(toggleFunctions);
    return toggleFunctions[region] || toggleFunctions['default'];
  }

  static getCoverFlowVisibilityFromMetadata(){
    const region= storage.getItem('region');
    const defaultCoverFlowVisibility = '{"default":{"enable":false}}';
    let coverFlowVisibility = Metadata.get('cover_flow_visibility',defaultCoverFlowVisibility);
    coverFlowVisibility = JSON.parse(coverFlowVisibility);
    return coverFlowVisibility[region] || coverFlowVisibility['default'];

  }

  static seekInPause(callback, seek){
    let platf = Device.getDevice().getSubplatform();
    if(platf !== 'stbcoship'){
      callback(seek);
    }else{
      setTimeout(() => {
        callback(seek);
      }, 1000);
     }
  }

  static keyBloquedInPTV(pathname,key){
    let keyBloked = {
      RED: 118, // F7
      GREEN: 119, // F8
      YELLOW: 120, // F9
      BLUE: 121, // F10
      BACK: 8,
      MOSAIC: 77, // m
      GUIDE: 78, // n
      FAV: 70, // f
      PREV: 69, // e
      HD: 72, //h,
      VOD: 88, //x
      INFO: 457,
      PPV: 133,
    };

    if(pathname.includes('ptv') && keyBloked[key]){
      return true;
    }
    return false;
  }

  static scriptCyberSource(){
    const region= storage.getItem('region');
    const defaultCyberConfig = '{ "default":{ "org_id":"1snn5n9w", "merchant_id":"decompras_clarovideomx", "custom_profiling_domain":"https://h.online-metrix.net/fp/tags.js"}}';
    let cyberConfig = Metadata.get('cybersource_configuration',defaultCyberConfig);
    cyberConfig =  JSON.parse(cyberConfig);
    let hks = storage.getItem('HKS','');
    let time = new Date().toTimeString().split(' ')[0];
    if(!this.isEmpty(cyberConfig)){
      let cyberConfigByRegion = cyberConfig[region] ? cyberConfig[region] : cyberConfig['default'];
      let sessionId = cyberConfigByRegion.merchant_id + hks + time;
      let url = cyberConfigByRegion.custom_profiling_domain + '?org_id='+ cyberConfigByRegion.org_id + '&session_id='+sessionId;
      this.loadScript(url);
    }
  }

  static choiceBehaviorChannelChange(){
    var enableChannelDownUp = false;
    const region= storage.getItem('region');
    let choice = Metadata.get('channel_down_up','{"default":{"enable":true}}');
    choice = JSON.parse(choice);
    if(!Utils.isEmpty(choice)){
       enableChannelDownUp = choice[region] ? choice[region].enable : choice['default'].enable;
    }
    return enableChannelDownUp;
  }

  static checkIfEmailInString(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
  }

  static extractEmails (text){
      return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  }

  static isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
 }


  static getMaxLengthMovil() {
    switch (storage.getItem('region')) {
      case 'argentina':
        return 11;
      case 'mexico':
        return 10;
      default:
        return 15;
    }
  }

  static getLengthMovilAndProvider() {
    let defaultLenght = "{\"default\": {\"minlength_phone_number\": \"10\", \"maxlength_phone_number\": \"15\",  \"minlength_otp\": \"1\",  \"maxlength_otp\": \"10\"}}";
    let lengthMovilAndProvider = JSON.parse(Metadata.get("mobile_phone_provider_configuration", defaultLenght));
    const region = storage.getItem('region');
    lengthMovilAndProvider = lengthMovilAndProvider[region] ? lengthMovilAndProvider[region] : lengthMovilAndProvider['default'];
    return lengthMovilAndProvider;
  }

  static getCloseTime(){
    let defaultTimeClose = "{\"default\":{ \"time\" : \"3000\" }}";
    let closeTime = JSON.parse(Metadata.get("modal_otp_msgsend_last", defaultTimeClose));
    const region = storage.getItem('region');
    closeTime = closeTime[region] ? closeTime[region].time : closeTime["default"].time;
    return closeTime;
  }

  static getErrorToInput(code){
    let objWithError = {};
    let defaulErrorInput = "{\"default\":{\"otp\":[\"WRONG_OTP\",\"INVALID_OTP\"],\"msisdn\":[\"NO_AMX_MSISDN\"],\"email\":[\"user_email_invalido\",\"userexist\"],\"password\":[\"user_login_invalido\"]}}";
    let errorsInput = JSON.parse(Metadata.get("sso_placeholder_errors", defaulErrorInput));
    const region = storage.getItem('region');
    errorsInput = errorsInput[region] ? errorsInput[region] : errorsInput["default"];
    !this.isEmpty(errorsInput) && code && Object.keys(errorsInput).map((typeError) =>{
       this.isArray(errorsInput[typeError]) && errorsInput[typeError].map((error) => {
        if(error.trim() === code){
          console.log("getErrorToInput", error, code, typeError);
          objWithError[typeError]= error;
        }
       })
      })
    return objWithError;
  }

  static behaviorOfError(error, callbackExist, callbackModal, propsModal){
    console.error("behaviorOfError", error);
    let errorToInput = this.getErrorToInput(error.code);

    let errorsTohandle = [];

    if(errorToInput && !Utils.isEmpty(errorToInput)){
       let key = Object.keys(errorToInput)[0];
        errorsTohandle[key] = Translator.get(errorToInput[key], error.message);

       if (Object.keys(errorsTohandle).length && this.isFunction(callbackExist)) {
           return callbackExist(errorsTohandle);
       }
    }
    return this.isFunction(callbackModal) ? callbackModal(MODAL_ERROR,error,propsModal) : false;
  }

  static isPTV(user){
    let isPTVPayment = false;
    if (user.subscriptions && user.paymentMethods
                           && (user.paymentMethods.hubcorporativofijogate
                            || user.paymentMethods.hubfijovirtualgate
                            || user.paymentMethods.hubfacturafijagate
                            || user.paymentMethods.clarocolombiagate)) {
       isPTVPayment = true
    }
    return isPTVPayment;
  }

  static eventFire (el, etype){
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
  }

  static encodeParams(data){
    let parameters = {};
    const keys = Object.keys(data);
    keys.map((key) => {
      parameters[key]= encodeURIComponent(data[key]);
    });
    return parameters;
  }

  static moveSpatial(currentKey){
    let direcction = {
      CH_UP: 'down',
      CH_DOWN: 'up'
    }
    window.SpatialNavigation.move(direcction[currentKey]);
  }

  static canMoveFocus(key){
    let move = true;
    let keysNotMove = ["CH_UP","CH_DOWN"];
    const listKeys = Device.getDevice().getKeys();
    keysNotMove.map((value)=>{
      if(listKeys && listKeys.valueKeyMap 
          && value == listKeys.valueKeyMap[key] 
          && !this.isMiniEPGOpen()){
        move = false;
      }
    })
    console.log("canMoveFocus", key, move);
   return move;
  }

  static isCurrent(event){
    let dateBegin = event.date_begin;
    let dateEnd = event.date_end;
    let isCurrentEvent = this.isDateBetween(dateBegin, dateEnd);
    return isCurrentEvent;
  }

  static idEventCurrent(epg, index){
    let elements = document.getElementsByClassName("epg-event-item-container");
    elements = Array.from(elements);

    let currentEventId = false;
    elements.length > 0 && elements.map((eventDiv) => {

      const channelId = eventDiv.getAttribute('data-channel-id');
      const eventId = eventDiv.getAttribute('data-event-id');

      let channel = epg.data && epg.data.find((channel) => {
        channel=channel.reduce(channel=>channel);
        return channel.id === channelId
      });

      const event = channel 
                  && channel[0] 
                  && channel[0].events[index] 
                  && channel[0].events[index].find((event) => event.id === eventId);

      if(event && this.isCurrent(event)){
        currentEventId = eventId
      }
    })
    return currentEventId ? `#event-${currentEventId}-${0}` : currentEventId;
  }

}

export default Utils;
