import Device from './../../devices/device';
import settings from './../../devices/all/settings';
import getAppConfig from "../../config/appConfig";
import * as playerConstants from "../../utils/playerConstants";
import PlayerUtil from './../../devices/all/PlayerUtil';
import DRMTask from '../../requests/tasks/video/DRMTask';
import RequestManager from '../../requests/RequestManager';
class STBHuaweiPlayerUtil extends PlayerUtil {

    constructor() {
        super();
    }

    resolveStreamType(encodes, provider, isLive) {
      let device_config = Device.getDevice().getConfig();
      let j = 0;
        if(isLive) {
            let live_stream = null;
            for(i = 0; i < device_config.supported_stream_types.live.length; i++) {
                // TODO change to find/filter ES6 syntax
                for(j = 0; j < encodes.length; j++) {
                    if(encodes[j] === device_config.supported_stream_types.live[i]) {
                        // First we found
                        
                        live_stream = device_config.supported_stream_types.live[i];
                        console.log('FOUND STREAM', live_stream);

                        break;
                    }
                }
                if(live_stream) {
                    break;
                }
            }
            // just for secure...    
            if(live_stream === null) {
                live_stream = playerConstants.HLS_KR;
            }

            return live_stream;
        }

        console.log('[PlayerUtil WS] resolveStreamType', encodes, provider, isLive);
        if(encodes === null || encodes.length < 1) {
            return null;
        }

        console.log('[PlayerUtil WS] resolveStreamType 2');

        this.platform = Device.getDevice().getPlatform();

        // All devices except nagra can play *SS single* and SS_MA so this is the prefered streamType of the app (TODO, is it safe?)
        let preferedStreamType = playerConstants.SS;
        let preferedStreamType_ma = playerConstants.SS_MA;

        let streamType = null;

        console.log('[PlayerUtil WS] resolveStreamType 3');
        let i;
        // First priority: test if we can play prefered streamType with MA
        let ifstreamType_ma = this.ifMultipleAudio(preferedStreamType, false);
        console.log('[PlayerUtil WS] resolveStreamType 4', ifstreamType_ma);
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

    async replaceSourceMedia(pgm, streamType, provider = null, providerCode = null, isLive = false) {
        /**
             * TODO se requiere modificar el java para que reciba el challenge y le aplique un base64
             */
        switch (streamType) {
            case playerConstants.SS:
            case playerConstants.SS_MA:
            let versionMayor512 = false;
            let apkVersion = this.getSTBAPKVersion();
            console.info('APKVERSION> ', apkVersion);
            if(apkVersion !== null) {
                versionMayor512 = apkVersion > 512;
            }
            if(providerCode && providerCode === playerConstants.PROVIDER_CODE_FOXV3 && versionMayor512 && isLive === false) {
                pgm.media = this.transformUrlLicenserFoxV3(pgm.media);
            }

            if (providerCode && providerCode === playerConstants.PROVIDER_CODE_HBO && isLive === false) {
                // Recuperar manifest
                if (pgm.media && pgm.media.video_url) {
                    const drmTask = new DRMTask(pgm.media.video_url);
                    let drmurlResult = await RequestManager.addRequest(drmTask);
                    console.log('[HUAWEI SS HBO] getDrmUrl, raw result> ', drmurlResult);
                    if (drmurlResult && drmurlResult.server_url) {
                        pgm.media.server_url = drmurlResult.server_url;
                    }
                }
            }

            return pgm;
            break;
            default:
            return pgm;
        }
        
    }
}

export default STBHuaweiPlayerUtil;
