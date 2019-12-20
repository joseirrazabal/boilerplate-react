import AbstractDeviceSetup from "../all/AbstractDeviceSetup";
import storage from "../../components/DeviceStorage/DeviceStorage";

class STBHuaweiDeviceSetup extends AbstractDeviceSetup {
  /* constructor() {
    super();
  } */

  setup () {
    STBHuaweiDeviceSetup.getUserInfo();
  }

  static getUserInfo() {
    let response = null;
    try {
      response = window.AndroidPlayerInterface.getUserInformation();
    }
    catch (e) { console.warn("[STBHuaweiDeviceSetup] getUserInfo err", e); }
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

export default STBHuaweiDeviceSetup;
