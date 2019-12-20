import AbstractDevice from '../all/AbstractDevice';
import AndroidId from "./Id";
import Web0sPlayer from "../web0s/Player";
import AndroidPlayerUtil from "./PlayerUtil";
import AndroidConfig from "./config";
import AndroidKeys from "./Keys";
import AndroidNetworkStatus from "./NetworkStatus";
import AndroidSystem from "./System";

class AndroidDevice extends AbstractDevice {
  constructor () {
    super(
      "android",
      new AndroidId(),
      new Web0sPlayer(),
      new AndroidPlayerUtil(),
      AndroidConfig,
      new AndroidKeys(),
      new AndroidNetworkStatus(),
      new AndroidSystem()
    );
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

export default AndroidDevice;
