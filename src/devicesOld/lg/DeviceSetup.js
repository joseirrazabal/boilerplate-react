import AbstractDeviceSetup from "../all/AbstractDeviceSetup";
import LGNetcast from '../../utils/LGNetcast';

class LgDeviceSetup extends AbstractDeviceSetup {
 /*  constructor() {
    super();
  } */

  setup() {
    new LGNetcast();
  }
}

export default LgDeviceSetup;
