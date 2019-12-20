import env from  '../all/env'
import { SS, HLS_KR, DASHWV } from "../../utils/playerConstants";


var  endpoints={
  // production: "http://apa-api-coship.clarovideo.net/",
  // preprod:  "http://apa-api-coship.clarovideo.net/",
  // test:  "http://apa-api-coship-test.clarovideo.net/",
  // goose -- cambio de endpoints
  production: "http://mfwktvnx1-api.clarovideo.net/",
  preprod: "http://mfwktvnx1-api.clarovideo.net/",
  test: "http://mfwktvnx1-api.clarovideo.net/",
}


  let deviceInfo = window.AndroidPlayerInterface && window.AndroidPlayerInterface.getDeviceInformation?
    window.AndroidPlayerInterface.getDeviceInformation():
    "{}";
    deviceInfo=JSON.parse(deviceInfo);

/* TODO get back to this
export default {
  end_point_apa :endpoints[env],
  appKey: deviceInfo.app_key, //"53fb2a56e4b077cb2acaa390",
  device_category: deviceInfo.device_category,
  device_id: deviceInfo.device_id,  // como obtener device id
  device_manufacturer: deviceInfo.device_manufacturer,
  device_model: deviceInfo.device_model,
  device_name: deviceInfo.device_name,  //como arman device Name
  device_so: deviceInfo.device_so,  // como obtener device_so
  device_type: deviceInfo.device_type,   //como se obtener device type
  stream_type: deviceInfo.device_manufacturer == "kaonmedia" ? 'hls' : 'smooth_streaming',
  smartcardId: deviceInfo.device_id,
  appversion: deviceInfo.appversion,    //como obtener appversion
  firmwareversion: deviceInfo.firmwareversion, //como obtener firmware version,
  akamai_id : 'Unknown',
}
*/


let multipleaudio = {};
// SS
multipleaudio.smooth_streaming = {};
multipleaudio.smooth_streaming.vod = true;
multipleaudio.smooth_streaming.live = false;
multipleaudio.smooth_streaming.timeshift = false;
// HLS_KR
multipleaudio.hls_kr = {};
multipleaudio.hls_kr.vod = false;
multipleaudio.hls_kr.live = false;
multipleaudio.hls_kr.timeshift = false;

// DASHWV
multipleaudio.DASHWV = {};
multipleaudio.DASHWV.vod = true;
multipleaudio.DASHWV.live = true;
multipleaudio.DASHWV.timeshift = true;

// Put only SINGLE streams here
let supported_stream_types = {};
// in priority order, first has a major priority
supported_stream_types.vod = [DASHWV];
supported_stream_types.live = [DASHWV, HLS_KR];
supported_stream_types.timeshift = [DASHWV, HLS_KR];

/*TODO add akamai_id to all config devices*/
export default {
  end_point_apa :endpoints[env],
  /* appKey: "0577713445841eecca1931ceeb35fed8", */
  appKey: "bfcd7769d849c4b7f7b92652216b98d6",
  appSubkey: "workstation",
  // Request params
  device_category: "tv",
  /*device_id:"nousar",*/
  device_manufacturer: "sony",
  device_model: "sony",
  device_name: "sony",
  device_so: "default",
  device_type: "tv",
  stream_type:'dashwv',
  //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
}
