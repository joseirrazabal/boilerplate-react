/* global AkaHTML5MediaAnalytics */
/**
 * Dependencies
 */
import Metadata from '../../requests/apa/Metadata';
import getAppConfig from "../../config/appConfig";
import Utils from '../../utils/Utils';
import SimpleGetRequestTask from "../../requests/tasks/SimpleGetRequestTask";
import RequestManager from "../../requests/RequestManager";
import store from "../../store";
import Device from "../../devices/device";
import pkg from '../../../package.json'

const PR = 'HHS';
const HLS  = 'HLS';
const CONFIG_URL = Metadata.get('akamai_config_url', 'http://ma343-r.analytics.edgesuite.net/config/beacon-19716.xml');
const device_config = Device.getDevice().getConfig();
const id = Device.getDevice().getId();
const YEAR = id.getFirmwareYear();
const DEVICE_TYPE = id.getDeviceType();
const DEVICE_ID = (device_config && device_config.akamai_id ? device_config.akamai_id : "unknown") || "unknown2";
const DEVICE_OS= device_config.device_so;

class AkamaiTracker {


  /**
   * Akamai plugin
   * @type {Object}
   */
  static plugin = null;

  /**
   * Akamai callbacks object
   * @type {Object}
   */

  constructor() {
  }

  static async loadScript() {
    if (AkamaiTracker.plugin) {
      return;
    }
    console.log("tracker akamai loadScript...");
    const config = getAppConfig().akamai;
    const url = config.url;

    try {
      await Utils.loadScript(url);
      const configScript = document.createElement('script');
      const targetScript = document.getElementsByTagName('script')[0];

      configScript.innerText = config.xml.replace('{URL}', `${CONFIG_URL}?enableGenericAPI=1`);
      targetScript.parentNode.insertBefore(configScript, targetScript);
      AkamaiTracker.plugin = new AkaHTML5MediaAnalytics();

      AkamaiTracker.plugin.setData('CVDevice', DEVICE_TYPE);
      AkamaiTracker.plugin.setData('playerId', DEVICE_ID);
      AkamaiTracker.plugin.setData('playerVersion', YEAR);
      console.log("tracker AkaHTML5MediaAnalytics ready");

      return Promise.resolve();
    } catch(e) {
      console.error("Error during loadScript for Akamai tracker", e);
      return Promise.resolve();
    }
  }

  async setup(pgm = {}) {
    if (!AkamaiTracker.plugin) {
      console.warn('Akamai AkaHTML5MediaAnalytics unavailable');
      return;
    }

    try {

      console.log("tracker akamai handleSessionInit");
      const state = store.getState();
      const userId = state.user.user_id;
      const stream_type = pgm && pgm.entry ? pgm.entry.stream_type:'';
      if(pgm && pgm.response)
        pgm=pgm.response
      const { media } = pgm;
      const source = media.video_url;
      const analyticsUrl = media.analytics_url;

      const { common } = pgm.group;
      const title = common.title;

      const { extendedcommon } = common;
      const format = extendedcommon.format.name;

      const playerType = source&&source.match(/manifest/i) ? PR : HLS;
      const networkType = getNetworkType();

      const stdFormat = getFormat(stream_type);
      const analyticsUrlObject= new URL(analyticsUrl);
      const analyticsUrlHostname=analyticsUrlObject.hostname;

      AkamaiTracker.plugin.setData('viewerId', userId);
      AkamaiTracker.plugin.setData('title', title);
      AkamaiTracker.plugin.setData('source', source);
      AkamaiTracker.plugin.setData('category', format);
      AkamaiTracker.plugin.setData('playerType', playerType);
      AkamaiTracker.plugin.setData('networkType_CV', networkType);
      AkamaiTracker.plugin.setData('std:format', stdFormat);
      AkamaiTracker.plugin.setData('CVOs',DEVICE_OS);
      AkamaiTracker.plugin.setData('CVUrlServerIp', analyticsUrl);
      AkamaiTracker.plugin.setData('CVHostname', analyticsUrlHostname);
      AkamaiTracker.plugin.setData('CVBuild', pkg.version);

      try {
        console.log("AkamaiTrackerTask init");
        const task = new SimpleGetRequestTask(analyticsUrl, {}, false);
        console.log("AkamaiTrackerTask add request");
        const result = await RequestManager.addRequest(task);
        console.log("AkamaiTrackerTask result", result);
        const parserX = new DOMParser();
        console.log("AkamaiTrackerTask parsed", parserX);
        const xmlDoc = result ? parserX.parseFromString(result, "text/xml") : null;
        console.log("AkamaiTrackerTask xmlDoc", xmlDoc);
        if (xmlDoc) {
          const serverIp = xmlDoc.getElementsByTagName('serverip')[0].textContent;
          console.log("***** tracking serverIp", serverIp);
          AkamaiTracker.plugin.setData('std:serverIp', serverIp);
        } else {
          AkamaiTracker.plugin.setData('std:serverIp', '0.0.0.0');
          throw getAppConfig().api_errors.format;
        }

        AkamaiTracker.plugin.handleSessionInit();
        console.log("tracker akamai plugin handleSessionInit done...");
      } catch (e) {
        console.warn("Error getting serverip for akamai tracker", e);
        AkamaiTracker.plugin.setData('std:serverIp', '0.0.0.0');
        AkamaiTracker.plugin.handleSessionInit();
      }

    } catch (error) {
      console.error('[ERROR OCCURRED] akamaiTracker handleSessionInit' + error, error);
    }
  }

  /**
   * Must be called when the player starts to buffer content
   * @return {[type]} [description]
   */
  bufferStart() {
    console.log('######## tracker Akamai buffer s');

    AkamaiTracker.plugin && AkamaiTracker.plugin.handleBufferStart();
  }

  /**
   * Must be called when the player stops to buffer content
   */
  bufferEnd() {
    console.log('######## tracker Akamai buffer end');

    AkamaiTracker.plugin && AkamaiTracker.plugin.handleBufferEnd();
  }

  /**
   * Must be called when the content starts to play
   */
  playing() {
    console.log('######## tracker Akamai playing');

    AkamaiTracker.plugin && AkamaiTracker.plugin.handlePlaying();
  }

  /**
   * Must be called when the content is paused
   */
  pause() {
    console.log('######## tracker Akamai pause');

    AkamaiTracker.plugin && AkamaiTracker.plugin.handlePause();
  }

  /**
   * Must be called when the content is resumed from a pause state
   */
  resume() {
    console.log('######## tracker Akamai resume');

    AkamaiTracker.plugin && AkamaiTracker.plugin.handleResume();
  }

  /**
   * Must be called if the player switches the content bitrate and when the content starts playugn
   * @param  {string} newBitRate bitrate in bits/sec
   */
  bitRateChange(newBitRate) {
    console.log('######## tracker Akamai rate');


    AkamaiTracker.plugin && AkamaiTracker.plugin.handleBitRateSwitch(newBitRate);
  }

  /**
   * Must be called if the user exists the player
   */
  exit() {
     console.log('######## tracker Akamai exit');

    AkamaiTracker.plugin && AkamaiTracker.plugin.handleApplicationExit();
  }

  /**
   * Must be called if an error occurs
   * @param  {string} msg error reason code. i.e Media.Playback.Error
   */
  error(msg) {
    console.log('######## tracker Akamai error');

    AkamaiTracker.plugin && AkamaiTracker.plugin.handleError(msg);
  }

  /**
   * Must be called when the content reach the end of play
   * @param  {string} msg end reason code. i.e Play.End.Detected
   */
  end(msg) {
    console.log('######## tracker Akamai end');

    AkamaiTracker.plugin && AkamaiTracker.plugin.handlePlayEnd(msg);
  }


  leaveContent(msg){ //cuando hay un stop forzado por cambio de contenido o un back por ejemplo se debe de cerrar la sesion
    console.log("######## tracker Akamai end");

    AkamaiTracker.plugin && AkamaiTracker.plugin.handlePlayEnd(msg);
  }

  episodeChange(msg){ //cuando hay un cambio de episodeo se debe de cerrar la sesion
    console.log("######## tracker Akamai end");

    AkamaiTracker.plugin && AkamaiTracker.plugin.handlePlayEnd(msg);
  }


}


function getFormat(streamType) {
  switch (streamType) {
    case "playready":
    case "smooth_streaming":
    case "smooth_streaming_ma":
      //return 'Smooth Streaming';
      return 'A';
      break;
    case "hls":
    case "hls_kr":
    case "hls_ma":
      //return 'HTTP Live Streaming';
      return 'L';
      break;
    case "widevine_classic":
      return 'Widevine Classic';
      break;
    default:
      return streamType;
  }
}

function getNetworkType() {
  //TODO: change for network abstraction
  let type = 0;
  const networkTypes = {
    NETWORK_UNKNOWN: -1,
    NETWORK_WIRELESS: 0,
    NETWORK_WIRED: 1,
  };

  switch (type) {
    case networkTypes.NETWORK_WIRELESS:
      type ='WiFi';
      break;
    case networkTypes.NETWORK_WIRED:
      type ='Ethernet';
      break;
    case networkTypes.NETWORK_UNKNOWN:
      type ='Unknown';
      break;
  }

  return type;
}

export default AkamaiTracker;
