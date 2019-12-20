import AbstractDevice from '../all/AbstractDevice';
import STBHuaweiPlayerUtil from "./PlayerUtil";
import STBHuaweiConfig from "./config";
import AndroidId from "../android/Id";
import AndroidPlayer from "../android/Player";
import AndroidKeys from "../stbhuawei/Keys";
import AndroidNetworkStatus from "../android/NetworkStatus";
import AndroidSystem from "../android/System";

class STBHuaweiDevice extends AbstractDevice {
  constructor () {
    super(
      "android",
      new AndroidId(),
      new AndroidPlayer(),
      new STBHuaweiPlayerUtil(),
      STBHuaweiConfig,
      new AndroidKeys(),
      new AndroidNetworkStatus(),
      new AndroidSystem(),
      "stbhuawei"
    );
  }

  getSubplatform() {
    return 'stbhuawei';
  }

  update_launcher (region, result){
    try {
      if(window.AndroidPlayerInterface)
      window.AndroidPlayerInterface.saveLauncher(region, JSON.stringify(result));
    }
    catch (e) {
      console.error("[Device.update_launcher]", e);
    }
  }
}

export default STBHuaweiDevice;
