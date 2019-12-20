import AbstractDeviceSetup from "../all/AbstractDeviceSetup";
import LGWeb0s from '../../utils/LGWeb0s';

class Web0sDeviceSetup extends AbstractDeviceSetup {
  /* constructor() {
    super();
  } */

  setup() {
    return new Promise( (resolve) => {
      let tt = new LGWeb0s();
      let t = tt.setup().then(() => {
        resolve();
      });
    });
  }
}

export default Web0sDeviceSetup;
