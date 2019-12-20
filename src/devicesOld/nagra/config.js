import CCOM from './CCOM';
import init from './init';
import env from  '../all/env'
import { HLSPRM, DVBC } from "../../utils/playerConstants";

const smartcardId = getSmartCardId();

var endpoints={
  // production: "https://apa-api-ngv.clarovideo.net/",
  // preprod:  "https://apa-api-ngv.clarovideo.net/",
  // test:  "https://apa-api-ngv-test.clarovideo.net/",
  // goose -- cambio de endpoints
  production: "http://mfwktvnx1-api.clarovideo.net/",
  preprod: "http://mfwktvnx1-api.clarovideo.net/",
  test: "http://mfwktvnx1-api.clarovideo.net/",
};

let multipleaudio = {};
// HLSPRM
multipleaudio.hlsprm = {};
multipleaudio.hlsprm.vod = true;
multipleaudio.hlsprm.live = false;
multipleaudio.hlsprm.timeshift = false;
// DVBC
multipleaudio.dvbc = {};
multipleaudio.dvbc.vod = false; 
multipleaudio.dvbc.live = true;
multipleaudio.dvbc.timeshift = false;

let supported_stream_types = {};
supported_stream_types.vod = [HLSPRM];
supported_stream_types.live = [DVBC];
supported_stream_types.timeshift = [HLSPRM];

export default {
  end_point_apa :endpoints[env],

  /* appKey: "54324c4e36f45ca87786a77f722f21fd", */
  appKey: "996264de20e74fb01393510961964bd0",
  appSubkey: "generic",
  device_category: "stb",
  device_id: smartcardId,
  device_manufacturer: "nagra",
  device_model: "nagra",
  device_name: "nagra",
  device_so: "opentv",
  device_type: "stb",

  stream_type: "hlsprm",
  smartcardId: smartcardId,
  init: init,

  //multipleaudio: multipleaudio, //Estos valores ahora se toman de la llave supported_stream de METADATA
  //supported_stream_types: supported_stream_types, //Estos valores ahora se toman de la llave supported_stream de METADATA
  useEpgPostals:true,
  //TODO put the correct akamai_id value
  akamai_id : "Unknown",
  nodetv : "nagratv",
  loadingFlow: "smartcard",
}

function getSmartCardId() {
  const spaces = /\s/g;
  const smartcardInfo = CCOM.ConditionalAccess.getSmartcardInfo();

  if(smartcardInfo.error) {
    return '245705069313'
  }

  const serialNumber = smartcardInfo.smartcardInfo.serialNumber;
  return serialNumber.replace(spaces, "");
}
