import AbstractId from "../all/AbstractId";

class AndroidId extends AbstractId {
    constructor() {
        super();
    }

    getDeviceType() {
        return "Android";
    }

    getHardwareType() {
        return this.HARDWARE_TYPE.ANDROID;
    }

    getFirmware() {
        //to get the browser and version
        var name = "android",
            version = "DummyFirmware";
        return name + "/" + version;
    }
}

export default AndroidId;
