import device from './../../devices/device';
import settings from './../../devices/all/settings';
import getAppConfig from "../../config/appConfig";
import * as playerConstants from "../../utils/playerConstants";

import PlayerUtil from './../../devices/all/PlayerUtil';



class NagraPlayerUtil extends PlayerUtil {

    constructor() {
        super();
    }

    resolveStreamType(encodes, provider, isLive) {
        
        // LIVE, at this moment preference is DVBC
        if(isLive) {
            return playerConstants.DVBC;
        }

        if(encodes === null || encodes.length < 1) {
            return null;
        }
        let streamType = null;

        // All devices except nagra can play *SS single* and SS_MA so this is the prefered streamType of the app (TODO, is it safe?)
        let preferedStreamType = playerConstants.SS;
        let preferedStreamType_ma = playerConstants.SS_MA;

        /*
        Nagra is a specific case
        for nagra it its knowed that only plays hlsprm in VOD and DVBC in live
        */
        
        // VOD
        let streamTypeToFind = playerConstants.HLSPRM;
        let i;
        // is desired lang within lang options of the content ?
        // TODO change to find/filter ES6 syntax
        for(i = 0; i < encodes.length; i++) {
            if(encodes[i] === streamTypeToFind) {
                streamType = streamTypeToFind;
            }
        }

        return streamType;    
    }

    replaceSourceMedia(pgm, streamType, provider = null) {
        return pgm;
    }
}

export default NagraPlayerUtil;