import env from  '../all/env'
import { HLS_KR, HLS, SS, DASHWV, DASHWV_MA } from "../../utils/playerConstants";

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
// DASHWV
multipleaudio.DASHWV = {};
multipleaudio.DASHWV.vod = true;
multipleaudio.DASHWV.live = true;
multipleaudio.DASHWV.timeshift = true;

// Put only SINGLE streams here
let supported_stream_types = {};
// in priority order, first has a major priority
// supported_stream_types.vod = [DASHWV, SS, HLS];
// supported_stream_types.live = [DASHWV, HLS_KR, HLS];
// supported_stream_types.timeshift = [DASHWV, HLS_KR, HLS];

supported_stream_types.vod = [DASHWV, DASHWV_MA];
supported_stream_types.live = [DASHWV, DASHWV_MA];
supported_stream_types.timeshift = [DASHWV, DASHWV_MA];


export default {
    end_point_apa :endpoints[env],
    appKey: "996264de20e74fb01393510961964bd0",  //TODO ESTO ES DE NAGRA
    appSubkey: "sony",
    // Request params
    device_category: "web",
    /*device_id:"nousar",*/
    device_manufacturer: "windows",
    device_model: "html5",
    device_name: "Chrome",
    device_so: "Chrome",
    device_type: "html5",
    stream_type:'dashwv_ma',
    multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
    supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
    akamai_id: "SonySTV",
    useEpgPostals: true,
}