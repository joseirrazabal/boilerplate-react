import AbstractDevice from '../all/AbstractDevice';
import Web0sId from "./Id";
import Web0sPlayer from "./Player";
import Web0sPlayerUtil from "./PlayerUtil";
import Web0sConfig from "./config";
import Web0sKeys from "./Keys";
import Web0sNetworkStatus from "./NetworkStatus";
import Web0sSystem from "./System";

class Web0sDevice extends AbstractDevice {
  constructor () {
    super(
      "web0s",
      new Web0sId(),
      new Web0sPlayer(),
      new Web0sPlayerUtil(),
      Web0sConfig,
      new Web0sKeys(),
      new Web0sNetworkStatus(),
      new Web0sSystem()
    );
  }
}

export default Web0sDevice;
