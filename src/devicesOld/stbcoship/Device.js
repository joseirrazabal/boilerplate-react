import AbstractDevice from '../all/AbstractDevice';
import STBCoshipPlayerUtil from "./PlayerUtil";
import STBCoshipConfig from "./config";
import AndroidId from "../android/Id";
import AndroidPlayer from "../android/Player";
import AndroidKeys from "../stbcoship/Keys";
import AndroidNetworkStatus from "../android/NetworkStatus";
import AndroidSystem from "../android/System";

class STBCoshipDevice extends AbstractDevice {
  constructor () {
    super(
      "android",
      new AndroidId(),
      new AndroidPlayer(),
      new STBCoshipPlayerUtil(),
      STBCoshipConfig,
      new AndroidKeys(),
      new AndroidNetworkStatus(),
      new AndroidSystem(),
      "stbcoship"
    );
  }
  
  getSubplatform() {
    return 'stbcoship';
  }

  update_launcher (region, result){
    try {
      window.AndroidPlayerInterface.saveLauncher(region, JSON.stringify(result));
    }
    catch (e) {
      console.error("[Device.update_launcher]", e);
    }
  }
}

export default STBCoshipDevice;
