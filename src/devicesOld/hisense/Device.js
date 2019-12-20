import AbstractDevice from '../all/AbstractDevice';
import HisenseId from "./Id";
import HisensePlayer from "./Player";
import HisensePlayerUtil from "./PlayerUtil";
import HisenseConfig from "./config";
import HisenseKeys from "./Keys";
import HisenseNetworkStatus from "./NetworkStatus";
import HisenseSystem from "./System";

class HisenseDevice extends AbstractDevice {
  constructor () {
    super(
      "hisense",
      new HisenseId(),
      new HisensePlayer(),
      new HisensePlayerUtil(),
      HisenseConfig,
      new HisenseKeys(),
      new HisenseNetworkStatus(),
      new HisenseSystem()
    );
  }
}

export default HisenseDevice;
