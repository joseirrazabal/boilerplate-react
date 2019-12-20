class AbstractDeviceSetup {
  constructor() {
  }

  setup() {
    return new Promise( (resolve) => {
      resolve();
    }) ;
  }
}

export default AbstractDeviceSetup;
