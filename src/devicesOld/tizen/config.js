import env from  '../all/env'
import { HLS_KR, HLS, SS } from "../../utils/playerConstants";

var  endpoints={
  // production: "https://apa-api-tv2sony.clarovideo.net/",
  // preprod:  "https://apa-api-tv2sony.clarovideo.net/",
  // test:  "https://apa-api-tv2sony-test.clarovideo.net/",
  // goose -- cambio de endpoints
  production: "http://mfwktvnx1-api.clarovideo.net/",
  preprod: "http://mfwktvnx1-api.clarovideo.net/",
  test: "http://mfwktvnx1-api.clarovideo.net/",
}

let multipleaudio = {};
// HLS_KR
multipleaudio.hls_kr = {};
multipleaudio.hls_kr.vod = false;
multipleaudio.hls_kr.live = false;
multipleaudio.hls_kr.timeshift = false;
// HLS
multipleaudio.hls = {};
multipleaudio.hls.vod = false;
multipleaudio.hls.live = false;
multipleaudio.hls.timeshift = false;
// SS
multipleaudio.smooth_streaming = {};
multipleaudio.smooth_streaming.vod = true;
multipleaudio.smooth_streaming.live = false;
multipleaudio.smooth_streaming.timeshift = false;

// Put only SINGLE streams here
let supported_stream_types = {};
// in priority order, first has a major priority
supported_stream_types.vod = [SS, HLS];
supported_stream_types.live = [SS, HLS_KR, HLS];
supported_stream_types.timeshift = [SS];

export default {
    end_point_apa :endpoints[env],
    /* appKey: "d5f689a81bf63552f2f67c9131d1e71d", */  //TODO ESTO ES DE NAGRA
    appKey: "996264de20e74fb01393510961964bd0",
    appSubkey: "samsung",
    // Request params
    device_category: "tv",
    /*device_id:"nousar",*/    
    device_manufacturer: "samsung",
    device_model: "tizen",
    device_name: "samsung",
    device_so: "tizen",
    device_type: "tv",
    stream_type:'smooth_streaming',
    //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
    //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
    nodetv : "tv",
    akamai_id: "TizenSTV",
    useEpgPostals: true,
}
