import AbstractDevice from '../all/AbstractDevice';
import STBKaonPlayerUtil from "./PlayerUtil";
import STBKaonConfig from "./config";
import AndroidId from "../android/Id";
import AndroidPlayer from "../android/Player";
import AndroidKeys from "../stbkaon/Keys";
import AndroidNetworkStatus from "../android/NetworkStatus";
import AndroidSystem from "../android/System";

class STBKaonDevice extends AbstractDevice {
  constructor () {
    super(
      "android",
      new AndroidId(),
      new AndroidPlayer(),
      new STBKaonPlayerUtil(),
      STBKaonConfig,
      new AndroidKeys(),
      new AndroidNetworkStatus(),
      new AndroidSystem(),
      "stbkaon"
    );
  }


  update_launcher(region, result){
    try {
      window.AndroidPlayerInterface.saveLauncher(region, JSON.stringify(result));
    }
    catch (e) {
      console.error("[Device.update_launcher]", e);
    }
  }
}

export default STBKaonDevice;
