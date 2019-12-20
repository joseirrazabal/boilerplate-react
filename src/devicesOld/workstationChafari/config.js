import env from '../all/env'
import { HLS_KR, HLS } from "../../utils/playerConstants"
import storage from '../../components/DeviceStorage/DeviceStorage'


var endpoints = {
  // production: "https://apa-api-tv2sony.clarovideo.net/",
  // preprod: "https://apa-api-tv2sony.clarovideo.net/",
  // test: "https://apa-api-tv2sony-test.clarovideo.net/",
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
multipleaudio.hls.vod = true;
multipleaudio.hls.live = false;
multipleaudio.hls.timeshift = false;


// Put only SINGLE streams here
let supported_stream_types = {};
// in priority order, first has a major priority
supported_stream_types.vod = [HLS];
supported_stream_types.live = [HLS_KR, HLS];
supported_stream_types.timeshift = [HLS_KR, HLS];

let fakeHuawei=false;

fakeHuawei='21530175139SGC500155'  //descomentar o cometar para activar huawei en safari


export default fakeHuawei? {
    end_point_apa :endpoints[env],
    appKey: storage.getItem("force_appkey") || "5501bdb5ec118e7f46aa061b7d9b942e",
    appSubkey: "workstation",
    device_category: "stb",
    device_id: fakeHuawei,  // como obtener device id
    device_manufacturer: "huawei",
    device_model: "EC6108V9",
    device_name: "EC6108V9",  //como arman device Name
    device_so: "Android 4.4.2",  // como obtener device_so
    device_type: storage.getItem("force_appkey")?"ptv":"ott",
    stream_type:'smooth_streaming',
    appversion:  "402",    //como obtener appversion
    firmwareversion:  "711.720.141", //como obtener firmware version,
    useEpgPostals:true,
    akamai_id : "STBHuawei",
    nodetv : "nagratv",
    multipleaudio: multipleaudio,
    supported_stream_types: supported_stream_types,
    hideLogoutButton: true,
    hideArrowHeader:true,
    loadingFlow: "argentinatv",
    serial_id: fakeHuawei
  }:{
    end_point_apa :endpoints[env],
    appKey: "a9028c58f218a7afd2d32ad11d0058e0",  //TODO ESTO ES DE NAGRA
    // Request params
    device_category: "tv",
    /*device_id:"nousar",*/
    device_manufacturer: "sony",
    device_model: "sony",
    device_name: "sony",
    device_so: "default",
    device_type: "tv",
    stream_type:'smooth_streaming',
    multipleaudio: multipleaudio,
    supported_stream_types: supported_stream_types,
  useEpgPostals:true,
  akamai_id : "WksSTV",
}
