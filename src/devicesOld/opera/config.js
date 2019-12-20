import env from  '../all/env'
import { HLS_KR, HLS, SS } from "../../utils/playerConstants";

var  endpoints={
  // production: "https://apa-api-tv2opera.clarovideo.net/",
  // preprod:  "https://apa-api-tv2opera.clarovideo.net/",
  // test:  "https://apa-api-tv2opera-test.clarovideo.net/",
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
supported_stream_types.live = [HLS_KR, HLS];
supported_stream_types.timeshift = [HLS_KR];

export default {
  end_point_apa :endpoints[env],
  /* appKey: "b42c5f4dd5dd0354c2f4a43592ef3089", */
  appKey: "996264de20e74fb01393510961964bd0",
  appSubkey: "generic",
  // Request params
  device_category: "tv",
  /*device_id:"nousar",*/
  device_manufacturer: "opera",
  device_model: "opera",
  device_name: "opera",
  device_so: "opera",
  device_type: "tv",
  stream_type:'smooth_streaming',
  //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //TODO put the correct akamai_id value
  akamai_id: "OperaTV",
  useEpgPostals: true,
}
