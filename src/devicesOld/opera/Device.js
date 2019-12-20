import AbstractDevice from '../all/AbstractDevice';
import OperaId from "./Id";
import OperaPlayer from "./Player";
import OperaPlayerUtil from "./PlayerUtil";
import OperaConfig from "./config";
import OperaKeys from "./Keys";
import OperaNetworkStatus from "./NetworkStatus";
import OperaSystem from "./System";

class OperaDevice extends AbstractDevice {
  constructor () {
    super(
      "opera",
      new OperaId(),
      new OperaPlayer(),
      new OperaPlayerUtil(),
      OperaConfig,
      new OperaKeys(),
      new OperaNetworkStatus(),
      new OperaSystem()
    );
  }
}

export default OperaDevice;
