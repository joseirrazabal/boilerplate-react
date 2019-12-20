import AbstractDevice from '../all/AbstractDevice';
import WorkstationId from "./Id";
import WorkstationPlayer from "./Player";
import WorkstationPlayerUtil from "./PlayerUtil";
import WorkstationConfig from "./config";
import WorkstationKeys from "./Keys";
import WorkstationNetworkStatus from "./NetworkStatus";
import WorkstationSystem from "./System";

class WorkstationDevice extends AbstractDevice {
  constructor () {
    super(
      "workstation",
      new WorkstationId(),
      new WorkstationPlayer(),
      new WorkstationPlayerUtil(),
      WorkstationConfig,
      new WorkstationKeys(),
      new WorkstationNetworkStatus(),
      new WorkstationSystem()
    );
  }

}

export default WorkstationDevice;
