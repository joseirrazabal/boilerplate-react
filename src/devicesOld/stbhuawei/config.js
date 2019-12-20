import env from '../all/env'
import { HLS_KR, SS, IP_MULTICAST, IP_MULTICAST_UDP } from "../../utils/playerConstants";
import storage from '../../components/DeviceStorage/DeviceStorage'

var endpoints = {
  // production: "http://apa-api-huawei.clarovideo.net/",
  // preprod: "http://apa-api-huawei.clarovideo.net/",
  // test: "http://apa-api-huawei-test.clarovideo.net/",
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

// MULTICAST_UDP
multipleaudio.ip_multicast_udp = {};
multipleaudio.ip_multicast_udp.vod = false;
multipleaudio.ip_multicast_udp.live = false;
multipleaudio.ip_multicast_udp.timeshift = false;

// SS
multipleaudio.smooth_streaming = {};
multipleaudio.smooth_streaming.vod = true;
multipleaudio.smooth_streaming.live = false;
multipleaudio.smooth_streaming.timeshift = false;

// Put only SINGLE streams here
let supported_stream_types = {};
// in priority order, first has a major priority
supported_stream_types.vod = [SS];
supported_stream_types.live = [IP_MULTICAST_UDP, IP_MULTICAST, HLS_KR];
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
  appKey: storage.getItem("force_appkey") ? "1828df951b0d1ed79a5a93046096bed6" : "5501bdb5ec118e7f46aa061b7d9b942e",  //TODO ESTO ES DE NAGRA
  appSubkey: "generic",
  // Request params
  device_category: "stb",
  device_id: deviceInfo.device_id || "2153017310HYGA500086",  // como obtener device id
  device_manufacturer: "huawei",
  device_model: "EC6108V9",
  device_name: deviceInfo.device_name||"EC6108V9",  //como arman device Name
  device_so: deviceInfo.device_so||"Android 4.4.2",  // como obtener device_so
  device_type: storage.getItem("force_appkey")?"ptv":"ott",
  stream_type:'smooth_streaming',
  appversion: deviceInfo.appversion || "402",    //como obtener appversion
  firmwareversion: deviceInfo.firmwareversion || "711.720.141", //como obtener firmware version,
  useEpgPostals:true,
  akamai_id : "STBHuawei",
  nodetv: "nagratv",
  //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
  hideLogoutButton: true,
  hideArrowHeader:true,
  loadingFlow: "argentinatv",
  serial_id:deviceInfo.device_id||'FF05E537L06',
  //serial_id: '2153017310HYGA500033'
  //init: init,
}
