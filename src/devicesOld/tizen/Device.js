import AbstractDevice from '../all/AbstractDevice';
import TizenId from "./Id";
import TizenPlayer from "./Player";
import TizenPlayerUtil from "./PlayerUtil";
import TizenConfig from "./config";
import TizenKeys from "./Keys";
import TizenNetworkStatus from "./NetworkStatus";
import TizenSystem from "./System";

class TizenDevice extends AbstractDevice {
  constructor () {
    super(
      "tizen",
      new TizenId(),
      new TizenPlayer(),
      new TizenPlayerUtil(),
      TizenConfig,
      new TizenKeys(),
      new TizenNetworkStatus(),
      new TizenSystem()
    );
  }
}

export default TizenDevice;
