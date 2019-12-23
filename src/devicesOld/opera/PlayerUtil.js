import Device from './../../devices/device';
import settings from './../../devices/all/settings';
import getAppConfig from "../../config/appConfig";
import * as playerConstants from "../../utils/playerConstants";

import PlayerUtil from './../../devices/all/PlayerUtil';


class OperaPlayerUtil extends PlayerUtil {

  constructor() {
    super();
  }

  resolveStreamType(encodes, provider, isLive) {

    // LIVE, at this moment preference is DVBC
    if(isLive) {
        return playerConstants.HLS_KR;
    }

    console.log('[PlayerUtil Opera] resolveStreamType', encodes, provider, isLive);
    if(encodes === null || encodes.length < 1) {
      return null;
    }

    console.log('[PlayerUtil Opera] resolveStreamType 2');

    // All devices except nagra can play *SS single* and SS_MA so this is the prefered streamType of the app (TODO, is it safe?)
    let preferedStreamType = playerConstants.SS;
    let preferedStreamType_ma = playerConstants.SS_MA;

    let streamType = null;

    if(isLive) {
      streamType = playerConstants.HLS_KR;
    }
    else {
      console.log('[PlayerUtil Opera] resolveStreamType 3');
      let i;
      // First priority: test if we can play prefered streamType with MA
      let ifstreamType_ma = this.ifMultipleAudio(preferedStreamType, false);
      console.log('[PlayerUtil Opera] resolveStreamType 4', ifstreamType_ma);
      if(ifstreamType_ma) {
        // TODO change to find/filter ES6 syntax
        for(i = 0; i < encodes.length; i++) {
          if(preferedStreamType_ma === encodes[i]) {
            streamType = preferedStreamType_ma; // We found a stream type multipleaudio, we play it
            break;
          }
        }
      }
      // Second priority: single, if content dont have multiple audio, search for the prefered single
      if(!streamType) {
        // TODO change to find/filter ES6 syntax
        for(i = 0; i < encodes.length; i++) {
          if(preferedStreamType === encodes[i]) {
            streamType = encodes[i]; // We found a stream type multipleaudio, we play it
          }
        }
      }
      // Third priority: if content dont have the pefered in single, search for another single device supports
      if(!streamType) {
        let device_config = Device.getDevice().getConfig();
        let supported_stream_types_vod = device_config.supported_stream_types.vod;
        let j;
        // TODO change to find/filter ES6 syntax
        for(i = 0; i < device_config.supported_stream_types.vod.length; i++) {
          // skip prefered stream type, we check this one above (single and multiple and wasnt founded)
          if(supported_stream_types_vod[i] === preferedStreamType) {
            continue;
          }
          // TODO change to find/filter ES6 syntax
          for(j = 0; j < encodes.length; j++) {
            if(encodes[j] === supported_stream_types_vod[i]) {
              // First we found
              streamType = encodes[j];
              break;
            }
          }
        }
      }
    }

    return streamType;
  }

  replaceSourceMedia(pgm, streamType, provider = null) {
    switch (streamType) {
      case playerConstants.SS:
      case playerConstants.SS_MA:
        const endpoint =  `${getAppConfig().end_point_middleware}web-initiator`;
        const params = {
          manifest  : encodeURIComponent(pgm.media.video_url),
          laurl     : pgm.media.server_url ? encodeURIComponent(pgm.media.server_url) : '',
          challenge : pgm.media.challenge ? encodeURIComponent(pgm.media.challenge): '',
          deviceid  : encodeURIComponent(getAppConfig().device_id),
        };
        if (provider) {
          params.provider = provider;
        }
        const query = Object.entries(params).map(param => param.join('=')).join('&');
        pgm.media.video_url = `${endpoint}?${query}`;
        console.log('ESV: [OPERA replacing endpoint ', pgm.media.video_url);
        return pgm;
        break;
      default:
        return pgm;
    }

    return pgm;
  }
}

export default OperaPlayerUtil;