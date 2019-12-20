import AAFPlayer from '../AAFPlayer/AAFPlayer';
import {AAFPLAYER_PLAY} from '../AAFPlayer/constants';
import Utils from './Utils';
import DeviceStorage from '../components/DeviceStorage/DeviceStorage';
import ChannelSingleton from '../components/Epg/ChannelsSingleton';


class TvChannelUtil {

    static handlePREV() {
        let playerState = AAFPlayer.getCurrentPlayingState(false);
        let response = {
            action: null,
            params: null
        };  
        let isInfull = false;
        // Verifica full
        if(playerState === AAFPLAYER_PLAY) {
            // Si esta en play y está en full
            let playerOptions = AAFPlayer.getCurrentPlayerOptions(false);
            console.log('[TvChannelUtil] current AAFPlayerOptions ', playerOptions);
            if(playerOptions && playerOptions.size  && playerOptions.size.width && playerOptions.size.width == 1280) {
                if(playerOptions.islive) {
                    isInfull = true;
                }
            }
            else {
                if(playerOptions && Utils.isNullOrUndefined(playerOptions.size)) {
                    if(playerOptions.islive) {
                        isInfull = true;
                    }   
                }
            }

            // Si esta playeando en full y hay previousChannel entonces se intenta el cambio de canal
            let previous = DeviceStorage.getItem("previousChannel");
            let last = DeviceStorage.getItem("lastChannel");
            let canPlayPrevious = ChannelSingleton.canPlayChannel(previous);
            if(isInfull && canPlayPrevious && previous !== last) {
                response = {
                    action: 'channelchange',
                    gid: previous
                }; 
            }
        }

        // Si no esta playing se verifica si esta en nodo "node"
        if(!isInfull) {
            if(window.location.href.indexOf('/node/') !== -1 
                || window.location.href.indexOf('/vcard/') !== -1
                || window.location.href.indexOf('/epg/') !== -1) {
                response = {
                    action: 'redirecttv',
                    gid: null
                }; 
            }
        }

        console.log('[TvChannelUtil] current AAFPlayerOptions ', response);
        return response;
    }

    static setLastChannel(gid) {
        let last = DeviceStorage.getItem("lastChannel");
        DeviceStorage.setItem('lastChannel', gid);
        if(!Utils.isNullOrUndefined(last)) {
            DeviceStorage.setItem('previousChannel', last);
        }
    }

}


export default TvChannelUtil;