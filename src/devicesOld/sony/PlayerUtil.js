import Device from './../../devices/device';
import settings from './../../devices/all/settings';
import getAppConfig from "../../config/appConfig";
import * as playerConstants from "../../utils/playerConstants";

import PlayerUtil from './../../devices/all/PlayerUtil';


class SonyPlayerUtil extends PlayerUtil {

    constructor() {
        super();
    }

    resolveStreamType(encodes, provider, isLive) {

        if(isLive) {
            return playerConstants.HLS_KR;
        }

        if(encodes === null || encodes.length < 1) {
            return null;
        }

        // All devices except nagra can play *SS single* and SS_MA so this is the prefered streamType of the app (TODO, is it safe?)
        let preferedStreamType = playerConstants.SS;
        let preferedStreamType_ma = playerConstants.SS_MA;

        let streamType = null;


        let i;
        // First priority: test if we can play prefered streamType with MA
        let ifstreamType_ma = this.ifMultipleAudio(preferedStreamType, false);
        if(ifstreamType_ma) {
            // TODO change to find/filter ES6 syntax
            for(i = 0; i < encodes.length; i++) {
                if(preferedStreamType_ma === encodes[i]) {
                    streamType = preferedStreamType_ma; // We found a stream type multipleaudio, we play it
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


        return streamType;
    }

    replaceSourceMedia(pgm, streamType, provider = null, providerCode = null, isLive = false) {
        switch (streamType) {
            case playerConstants.SS:
            case playerConstants.SS_MA:
              const endpoint =  `${getAppConfig().end_point_middleware}web-initiator`;
                if(providerCode && providerCode === playerConstants.PROVIDER_CODE_FOXV3 && isLive === false) {
                    pgm.media = this.transformUrlLicenserFoxV3(pgm.media);
                    pgm.media.video_url = pgm.media.video_url.replace('https', 'http');
                }
              const params = {
                manifest  : encodeURIComponent(pgm.media.video_url),
                laurl     : pgm.media.server_url ? encodeURIComponent(pgm.media.server_url) : '',
                challenge : pgm.media.challenge ? encodeURIComponent(pgm.media.challenge): '',
                deviceid  : encodeURIComponent(getAppConfig().device_id),
                islive: isLive === true ? 1 : 0
              };
              if (provider) {
                params.provider = provider;
              }
              const query = Object.entries(params).map(param => param.join('=')).join('&');
              pgm.media.video_url = `${endpoint}?${query}`;
              console.log('ESV: replacing endpoint ', pgm.media.video_url);
              return pgm;
              break;
            default:
              return pgm;
        }

        return pgm;
    }
}

export default SonyPlayerUtil;
