import AbstractDevice from '../all/AbstractDevice';
import NagraId from "./Id";
import NagraPlayer from "./Player";
import NagraPlayerUtil from "./PlayerUtil";
import NagraConfig from "./config";
import NagraKeys from "./keys";
import NagraNetworkStatus from "./NetworkStatus";
import NagraSystem from "./System";

class NagraDevice extends AbstractDevice {
  constructor () {
    super(
      "nagra",
      new NagraId(),
      new NagraPlayer(),
      new NagraPlayerUtil(),
      NagraConfig,
      new NagraKeys(),
      new NagraNetworkStatus(),
      new NagraSystem()
    );
  }
}

export default NagraDevice;
