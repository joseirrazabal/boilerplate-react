import AbstractDevice from '../all/AbstractDevice';
import SonyId from "./Id";
import SonyPlayer from "./Player";
import SonyPlayerUtil from "./PlayerUtil";
import SonyConfig from "./config";
import SonyKeys from "./Keys";
import SonyNetworkStatus from "./NetworkStatus";
import SonySystem from "./System";

class SonyDevice extends AbstractDevice {
  constructor () {
    super(
      "sony",
      new SonyId(),
      new SonyPlayer(),
      new SonyPlayerUtil(),
      SonyConfig,
      new SonyKeys(),
      new SonyNetworkStatus(),
      new SonySystem()
    );
  }
}

export default SonyDevice;
