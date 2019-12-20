import AbstractId from "../all/AbstractId";

class TizenId extends AbstractId {
    constructor() {
        super();
        console.log('EDM: entrando a id')
    }

    getDeviceType() {
        return "TV";
    }

    getHardwareType() {
        return this.HARDWARE_TYPE.TV;
    }

    getFirmware() {
        //to get the browser and version
        var name = "tizen",
            version = "DummyFirmware",
            ua = navigator.userAgent.toLowerCase();
        try {
            if (ua.indexOf("chrome") !== -1) {
                name = "Chrome";
                version = (/chrome\/([\d.]+)/.exec(ua))[1];
            } else if (ua.indexOf("firefox") !== -1) {
                name = "Firefox";
                version = (/firefox\/([\d.]+)/.exec(ua))[1];
            } else if (ua.indexOf("opera") !== -1) {
                name = "opera";
                version = (/version\/([\d.]+)/.exec(ua))[1];
            } else if (ua.indexOf("safari") !== -1) {
                name = "safari";
                version = (/version\/([\d.]+)/.exec(ua))[1];
            }
        } catch (ex) {
            console.warn("unable to determine the firmware");
        }
        return name + "/" + version;
    }
}

export default TizenId;
