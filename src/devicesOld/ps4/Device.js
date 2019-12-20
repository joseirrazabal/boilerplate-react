import AbstractDevice from '../all/AbstractDevice';
import Ps4Id from "./Id";
import Ps4Player from "./Player";
import Ps4PlayerUtil from "./PlayerUtil";
import Ps4Config from "./config";
import Ps4Keys from "./Keys";
import Ps4NetworkStatus from "./NetworkStatus";
import Ps4System from "./System";

class Ps4Device extends AbstractDevice {
  constructor () {
    super(
      "ps4",
      new Ps4Id(),
      new Ps4Player(),
      new Ps4PlayerUtil(),
      Ps4Config,
      new Ps4Keys(),
      new Ps4NetworkStatus(),
      new Ps4System()
    );
  }
}

export default Ps4Device;
