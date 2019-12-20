import AbstractDevice from '../all/AbstractDevice';
import LgId from "./Id";
import LgPlayer from "./Player";
import LgPlayerUtil from "./PlayerUtil";
import LgConfig from "./config";
import LgKeys from "./Keys";
import LgNetworkStatus from "./NetworkStatus";
import LgSystem from "./System";

class LgDevice extends AbstractDevice {
  constructor () {
    super(
      "lg",
      new LgId(),
      new LgPlayer(),
      new LgPlayerUtil(),
      LgConfig,
      new LgKeys(),
      new LgNetworkStatus(),
      new LgSystem()
    );
  }
}

export default LgDevice;
