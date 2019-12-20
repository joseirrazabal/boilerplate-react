import env from '../all/env'
import { HLS_KR, DASHWV } from "../../utils/playerConstants";
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
//HLS
multipleaudio.hls = {};
multipleaudio.hls.vod = false;
multipleaudio.hls.live = false;
multipleaudio.hls.timeshift = false;
// DASH
multipleaudio.dash_streaming = {};
multipleaudio.dash_streaming.vod = false;
multipleaudio.dash_streaming.live = false;
multipleaudio.dash_streaming.timeshift = false;

// Put only SINGLE streams here
let supported_stream_types = {};
// in priority order, first has a major priority
supported_stream_types.vod = [DASHWV];
supported_stream_types.live = [HLS_KR];
supported_stream_types.timeshift = [HLS_KR];


export default {
	end_point_apa :endpoints[env],
		/* appKey: "0577713445841eecca1931ceeb35fed8", */
		appKey: "996264de20e74fb01393510961964bd0",
    appSubkey: "generic",
	  // Request params
	  device_category: "stb",
	  device_id: deviceInfo.device_id || "XXX",  // como obtener device id
	  device_manufacturer: "coship",
	  device_model: "android",
	  device_name: deviceInfo.device_name||"N9090",  //como arman device Name
	  device_so: deviceInfo.device_so||"Android 4.4.2",  // como obtener device_so
	  device_type: "stb",
	  stream_type:'dashwv',
	  appversion: deviceInfo.appversion || "503",    //como obtener appversion
	  firmwareversion: deviceInfo.firmwareversion || "001.999.999", //como obtener firmware version,
	  useEpgPostals:true,
	  akamai_id : "AndroidAAF",
	  nodetv : "tv",
	  //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
	  //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
	  //serial_id: '2153017310HYGA500033'
	  //init: init,
  
}
