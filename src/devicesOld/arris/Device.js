import AbstractDevice from '../all/AbstractDevice';
import ArrisId from "./Id";
import ArrisPlayer from "./Player";
import ArrisPlayerUtil from "./PlayerUtil";
import ArrisConfig from "./config";
import ArrisKeys from "./Keys";
import ArrisNetworkStatus from "./NetworkStatus";
import ArrisSystem from "./System";

class ArrisDevice extends AbstractDevice {
  constructor () {
    super(
      "arris",
      new ArrisId(),
      new ArrisPlayer(),
      new ArrisPlayerUtil(),
      ArrisConfig,
      new ArrisKeys(),
      new ArrisNetworkStatus(),
      new ArrisSystem()
    );
  }
}

export default ArrisDevice;
