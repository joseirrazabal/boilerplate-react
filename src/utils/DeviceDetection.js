class DeviceDetection {
    constructor () {
        /* Workstation is the default when no device matches */
        this.supported_devices = [
          "stbcoship", "stbkaon", "stbhuawei", "android","polaroid",
          "hisense", "lg", "nagra", "ps4", "samsung", "sony", "tizen", "web0s", "opera","workstationChafari", "arris"
        ];
    }

  /**
  * Detect the current device and return the class for it
  * @return {class} the class that inherits AbstractDevice
   * for the current device
  */
  detect () {
    var agent = navigator.userAgent.toLowerCase();

    let supported_devices = this.supported_devices;
    for (let i = 0; i < supported_devices.length; i++) {
      let sdevice = supported_devices[i];
      try {
        const detection = require (`../devices/${sdevice}/detection`).default;
console.log("detection", detection(agent))
        if (detection(agent)) {
          // return require (`../devices/${sdevice}/Device`).default;
        }
      }
      catch (e) {
        console.error("[DeviceDetection] ERROR", e);
      }
    }
    // return require (`../devices/workstation/Device`).default;
  }
}

export default DeviceDetection;
