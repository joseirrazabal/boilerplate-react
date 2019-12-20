import env from  '../all/env'
import { SS } from "../../utils/playerConstants";

var endpoints = {
  // production: "https://apa-api-consoleplaystation.clarovideo.net/",
  // preprod:  "https://apa-api-consoleplaystation.clarovideo.net/",
  // test:  "https://apa-api-consoleplaystation-test.clarovideo.net"
  // goose -- cambio de endpoints
  production: "http://mfwktvnx1-api.clarovideo.net/",
  preprod: "http://mfwktvnx1-api.clarovideo.net/",
  test: "http://mfwktvnx1-api.clarovideo.net/",
};

let multipleaudio = {};

// SS
multipleaudio.smooth_streaming = {};
multipleaudio.smooth_streaming.vod = true; // it exist? only for consistency
multipleaudio.smooth_streaming.live = false;
multipleaudio.smooth_streaming.timeshift = false;

let supported_stream_types = {};
supported_stream_types.vod = [SS];
supported_stream_types.live = [SS]; //
supported_stream_types.timeshift = [SS];

export default {
  end_point_apa :endpoints[env],
  /* appKey: "a039abcb466a5a2b2c668c47fae4107e", */
  appKey: "996264de20e74fb01393510961964bd0",
  appSubkey: "generic",
  // Request params
  device_category: "console",
  /*device_id:"nousar",*/
  device_manufacturer: "playstation",
  device_model: "ps4",
  device_name: "ps4",
  device_type: "ps4",
  stream_type:'smooth_streaming',
  device_so: "freebsd",

  //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //TODO put the correct akamai_id value
  akamai_id : "PS4",
  nodetv: "tv", // TODO este attr se necesita en ps4?
  useEpgPostals: true,
}
