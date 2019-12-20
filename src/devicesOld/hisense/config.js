import env from  '../all/env'
import { HLS_KR, HLS, SS } from "../../utils/playerConstants";

/**
 * User agent de una H5:
 * Opera/9.80 (Linux armv7l) Presto/2.12.407 Version/12.50 Hisense/2014 LHD32K220WUS_1 V00.01.148a.F0306
 * 
 * User agent de otra o_O, no H5:
 * Opera/9.80 (Linux armv7l; Opera TV Store/6176) Presto/2.12.407 Version/12.51 Model/Hisense-MTK5655 /EM
 */
const isHisenseH5 = () => {
    const agent = navigator.userAgent.toLowerCase();
    const supportMin = 5651;
    let match = agent.match(/ms?tk?\d{4}/);

    if(match && match[0]) {
        let serie = match[0];
        match = serie.match(/ms?tk?/);
        if (match && match[0]) {
            let currentVersion = parseInt(serie.substr(match[0].length, serie.length));
            if (currentVersion <= supportMin) {
                return true;
            }
        }
    }
    else {
        return true;
    }

  return false;
}

var endpoints={
    // production: "https://apa-api-tv2hisense.clarovideo.net/",
    // preprod:  "https://apa-api-tv2hisense.clarovideo.net/",
    // test:  "https://apa-api-tv2hisense-test.clarovideo.net/",
    // goose -- cambio de endpoints
    production: "http://mfwktvnx1-api.clarovideo.net/",
    preprod: "http://mfwktvnx1-api.clarovideo.net/",
    test: "http://mfwktvnx1-api.clarovideo.net/",
}

let multipleaudio = {};
// SS
multipleaudio.smooth_streaming = {};
// Hisense H5 no tiene soporte de múltiples audios en SS
multipleaudio.smooth_streaming.vod = isHisenseH5() ? false : true;
multipleaudio.smooth_streaming.live = false;
multipleaudio.smooth_streaming.timeshift = false;

// Put only SINGLE streams here
let supported_stream_types = {};
// in priority order, first has a major priority
supported_stream_types.vod = [SS];
supported_stream_types.live = [SS];
supported_stream_types.timeshift = [SS];


export default {
    end_point_apa :endpoints[env],
    /* appKey: "a9028c58f218a7afd2d32ad11d0058e0", */
    appKey: "996264de20e74fb01393510961964bd0",
    appSubkey: "sharp",
    // Request params
    device_category: "tv",
    /*device_id:"nousar",*/
    device_manufacturer: "hisense",
    device_model: "hisense",
    device_name: "hisense",
    device_so: "hisense",
    device_type: "tv",
    stream_type:'smooth_streaming',
    //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
    //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
    akamai_id: "HisenseSTV",
    useEpgPostals: true,
}


