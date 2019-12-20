import Device from './../../devices/device';
import settings from './../../devices/all/settings';
import getAppConfig from "../../config/appConfig";
import * as playerConstants from "../../utils/playerConstants";
import PlayerUtil from './../../devices/all/PlayerUtil';

class LgPlayerUtil extends PlayerUtil {

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

    replaceSourceMedia(pgm, streamType, provider = null) {
        return pgm;
    }

    /**
     * Para revisar si hay casos particulares en donde no se pueda playear aunque el stream_type es soportado
     * @param {*} pgm
     * @param {*} streamType
     * 
     * fox v3 no playea en netcast
     */
    canPlayPGM(pgm, streamType) {
        let ret = true;
        switch(streamType) {
            case playerConstants.SS:
            case playerConstants.SS_MA:
            // si vod, si foxv3
            let proveedor = null;
            if(pgm.group && pgm.group.common && pgm.group.common.extendedcommon && pgm.group.common.extendedcommon.media && pgm.group.common.extendedcommon.media.proveedor) {
                proveedor = pgm.group.common.extendedcommon.media.proveedor.codigo;
            }
            let isLive = false;
            if(pgm.group && pgm.group.common && pgm.group.common.extendedcommon && pgm.group.common.extendedcommon.media && pgm.group.common.extendedcommon.media.islive && pgm.group.common.extendedcommon.media.islive == '1') {
                isLive = true;
            }
            if (proveedor === playerConstants.PROVIDER_CODE_FOXV3 && !isLive) {
            //    ret = false;
            }
            break;
            default:
            break;
        }

        return ret;
    }
}

export default LgPlayerUtil;
