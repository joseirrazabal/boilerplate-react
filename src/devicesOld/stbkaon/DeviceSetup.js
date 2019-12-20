import AbstractDeviceSetup from "../all/AbstractDeviceSetup";
import storage from "../../components/DeviceStorage/DeviceStorage";

class STBKaonDeviceSetup extends AbstractDeviceSetup {
  /* constructor() {
    super();
  } */

  setup () {
    STBKaonDeviceSetup.getUserInfo();
  }

  static getUserInfo() {
    let response = null;
    try {
      response = window.AndroidPlayerInterface.getUserInformation();
    }
    catch (e) { console.error("[STBKaonDeviceSetup.getUserInfo]", e); }
    if (response) {
      let result = JSON.parse(response);
      if (result.userHash
        && result.sessionStringValue
        && result.region) {
        const user_hash = result.userHash;
        const HKS = result.sessionStringValue;
        const region = result.region;
        storage.setItem('HKS', HKS);
        storage.setItem('user_hash', user_hash);
        storage.setItem('region', region);
      }
    }
  }
}

export default STBKaonDeviceSetup;
