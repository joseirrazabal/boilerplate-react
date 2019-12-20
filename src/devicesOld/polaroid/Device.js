import AbstractDevice from '../all/AbstractDevice';
import PolaroidPlayerUtil from "./PlayerUtil";
import PolaroidConfig from "./config";
import PolaroidId from "./Id";
import PolaroidPlayer from "./Player";
import PolaroidKeys from "./Keys";
import PolaroidNetworkStatus from "./NetworkStatus";
import PolaroidSystem from "./System";

class PolaroidDevice extends AbstractDevice {
  constructor () {
    super(
      "polaroid",
      new PolaroidId(),
      new PolaroidPlayer(),
      new PolaroidPlayerUtil(),
      PolaroidConfig,
      new PolaroidKeys(),
      new PolaroidNetworkStatus(),
      new PolaroidSystem()
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

export default PolaroidDevice;
