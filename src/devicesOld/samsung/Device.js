import AbstractDevice from '../all/AbstractDevice';
import SamsungId from "./Id";
import SamsungPlayer from "./Player";
import SamsungPlayerUtil from "./PlayerUtil";
import SamsungConfig from "./config";
import SamsungKeys from "./Keys";
import SamsungNetworkStatus from "./NetworkStatus";
import SamsungSystem from "./System";

class SamsungDevice extends AbstractDevice {
  constructor () {
    super(
      "samsung",
      new SamsungId(),
      new SamsungPlayer(),
      new SamsungPlayerUtil(),
      SamsungConfig,
      new SamsungKeys(),
      new SamsungNetworkStatus(),
      new SamsungSystem()
    );
  }
}

export default SamsungDevice;
