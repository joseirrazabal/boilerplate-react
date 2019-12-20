import env from '../all/env'
import {HLS_KR, SS, IP_MULTICAST} from "../../utils/playerConstants";
import storage from "../../components/DeviceStorage/DeviceStorage";

var endpoints = {
  // production: "http://apa-api-stbkaon.clarovideo.net/",
  // preprod: "http://apa-api-stbkaon.clarovideo.net/",
  // test: "http://apa-api-stbkaon-test.clarovideo.net/",
  // goose -- cambio de endpoints
  production: "http://mfwktvnx1-api.clarovideo.net/",
  preprod: "http://mfwktvnx1-api.clarovideo.net/",
  test: "http://mfwktvnx1-api.clarovideo.net/",
}


let deviceInfo = window.AndroidPlayerInterface && window.AndroidPlayerInterface.getDeviceInformation ?
  window.AndroidPlayerInterface.getDeviceInformation() :
  "{}";
deviceInfo = JSON.parse(deviceInfo);

let multipleaudio = {};
// HLS_KR
multipleaudio.hls_kr = {};
multipleaudio.hls_kr.vod = false;
multipleaudio.hls_kr.live = false;
multipleaudio.hls_kr.timeshift = false;
// MULTICAST
multipleaudio.ip_multicast = {};
multipleaudio.ip_multicast.vod = false;
multipleaudio.ip_multicast.live = false;
multipleaudio.ip_multicast.timeshift = false;
// SS
multipleaudio.smooth_streaming = {};
multipleaudio.smooth_streaming.vod = true;
multipleaudio.smooth_streaming.live = false;
multipleaudio.smooth_streaming.timeshift = false;

// Put only SINGLE streams here
let supported_stream_types = {};
// in priority order, first has a major priority
supported_stream_types.vod = [SS];
supported_stream_types.live = [IP_MULTICAST,HLS_KR];
supported_stream_types.timeshift = [HLS_KR];
/*
export default {
  end_point_apa :endpoints[env],
  appKey: "531eed59e4b050ea818ae755",//deviceInfo.app_key, //"53fb2a56e4b077cb2acaa390",
  device_category: deviceInfo.device_category,
  device_id: deviceInfo.device_id,  // como obtener device id
  device_manufacturer: deviceInfo.device_manufacturer,
  device_model: deviceInfo.device_model,
  device_name: deviceInfo.device_name,  //como arman device Name
  device_so: deviceInfo.device_so,  // como obtener device_so
  device_type: deviceInfo.device_type,   //como se obtener device type
  stream_type: 'smooth_streaming',
  smartcardId: deviceInfo.device_id,
  appversion: deviceInfo.appversion,    //como obtener appversion
  firmwareversion: deviceInfo.firmwareversion, //como obtener firmware version,
  akamai_id : 'Unknown',
}
*/


export default {
  end_point_apa :endpoints[env],
  appKey: storage.getItem("force_appkey") ? "89df3cf2f6b4e82d7d1e529002a617af" : "b7566d04ee257cd5bf36939acb09205a", //TODO ESTO ES DE NAGRA
  appSubkey: "sc7210",
  // Request params
  device_category: "stb",
  device_id: deviceInfo.device_id,  // como obtener device id
  device_manufacturer: "kaonmedia",
  device_model: "sc7210",
  device_name: deviceInfo.device_name,  //como arman device Name
  device_so: deviceInfo.device_so,  // como obtener device_so
  device_type: storage.getItem("force_appkey")?"ptv":"ott",
  stream_type:'smooth_streaming',
  appversion: deviceInfo.appversion,    //como obtener appversion
  firmwareversion: deviceInfo.firmwareversion, //como obtener firmware version,
  useEpgPostals:true,
  akamai_id : "STBKaon",
  nodetv : "nagratv",
  hideArrowHeader: true,
  //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
  serial_id:deviceInfo.device_id||'FF05E537L06',
  //init: init,
}

