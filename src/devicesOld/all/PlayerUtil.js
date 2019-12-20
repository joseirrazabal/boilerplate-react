import Device from './../../devices/device';
import store from './../../store';
class PlayerUtil {

    constructor() {
        this.ifMultipleAudio = this.ifMultipleAudio.bind(this);
    }

    // @param streamType is in "single form", i.e. SS and here we compare with "_MA"
    ifMultipleAudio(streamType, isLive) {
        let support = false;
        let multiple_config = Device.getDevice().getConfig().multipleaudio;
        let is_live = isLive ? 'live' : 'vod';

        if(multiple_config) {
            if(multiple_config[streamType]) {
                support = multiple_config[streamType][is_live] ? multiple_config[streamType][is_live] : false;
            }
        }
        return support;
    }

    isFullVideoPlayingLive() {
      let currentStore = store.getState();
      if (currentStore.player
        && currentStore.player.src
        && currentStore.player.isLive === true) return true;
      else return false;

    }
    /**
     * Para contenidos fox v3, se "corta la url del DRM" porque viene "muy larga", params restantes "cortados" se envian por post
     * https://dlatvarg.atlassian.net/wiki/spaces/PLAYER/pages/202743063/Integracion+de+reproduccion+de+contenidos+FOX+V3
     */
    transformUrlLicenserFoxV3(media) {
        var newMedia = media;
        var array = media.server_url.split('&');
        var newUrl = array[0];
        var objParam = {};
        array.map((value, index) => {  
            if(index !== 0) {  
               var item = value.split('=');  
               objParam[item[0]] = item[1]
            }
        });
        newMedia.server_url = newUrl;
        newMedia.challenge = JSON.stringify(objParam);

        return newMedia;
    }

    /**
     * Get coship, kaon, stbhuawei version
     * Si versión es mayor a 512, corta la url DRM de fox v3
     * Si versión es menor o igual a 512, manda url de DRM sin recortar 
     * */     
    getSTBAPKVersion() {
        let ua = navigator.userAgent;
        console.log('APKVERSION UserAgent> ' + ua);
        let apkversion = null;
        if(ua) {
            let re = /(\d{3,})$/g;
            let res = re.exec(ua);
            if(res && res[1]) {
                apkversion = parseInt(res[1]);
            }
        }

        return apkversion;
    }
    
}

export default PlayerUtil;
