import env from  '../all/env'
import { HLS, SS, HLS_KR } from "../../utils/playerConstants";


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
// HLS
multipleaudio.hls = {};
multipleaudio.hls.vod = false;
multipleaudio.hls.live = false;
multipleaudio.hls.timeshift = false;

// HLS_KR
multipleaudio.hls_kr = {};
multipleaudio.hls_kr.vod = false;
multipleaudio.hls_kr.live = false;
multipleaudio.hls_kr.timeshift = false;

// SS
multipleaudio.smooth_streaming = {};
multipleaudio.smooth_streaming.vod = true; 
multipleaudio.smooth_streaming.live = false;
multipleaudio.smooth_streaming.timeshift = false;

let supported_stream_types = {};
supported_stream_types.vod = [SS, HLS];
// Live primera prioridad SS, luego HLS_KR
supported_stream_types.live = [SS, HLS_KR];
supported_stream_types.timeshift = [SS]; // Hasta este momento (21-05-18), sólo se ha probado con SS y funciona

export default {
  end_point_apa: endpoints[env],
  /* appKey: "2a6ec299f2f6ea0a821f00ded282f77a", */
  /* appKey: "4098b446376f20c3b732d51a28e6d5d2", */
  appKey:"996264de20e74fb01393510961964bd0",
  appSubkey: "lg",
  // Request params
  device_category: "tv",
  /*device_id:"nousar",*/
  device_manufacturer: "lg",
  device_model: "web0s",
  device_name: "lg",
  device_type: "TV",
  device_so: "webos",
  stream_type:'smooth_streaming',
  //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
  akamai_id: "LGSTV",
  useEpgPostals: true,
}
