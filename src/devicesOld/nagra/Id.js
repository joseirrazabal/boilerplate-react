import AbstractId from "../all/AbstractId";

class NagraId extends AbstractId {

    constructor() {
        super();
    }

    getDeviceType() {
        //return navigator.appName;
        console.log(navigator);
        return "nagra";
    }

    getHardwareType() {
        var agent = navigator.userAgent;
        //TODO: Need validate STB in user-agent
        if (agent.indexOf("opentv5") !== -1) {
            return this.HARDWARE_TYPE.STB;
        }
        return this.HARDWARE_TYPE.TV;
    }

    getFirmware() {
        if (navigator.userAgent.toLowerCase().indexOf("emulator") > -1) {
            return "Nagra TV emulator";
        } else {
            return "Nagra dummy firmware";
        }
    }

    getFirmwareYear() {
        var agent, deviceStr, year;
        try {
            agent = navigator.userAgent.toLowerCase();
            deviceStr = agent.match(/avdn\/[^;]+;/)[0];
            year = parseInt(deviceStr.split(".")[2], 10);
        } catch (ex) {
            year = 0;
        }
        return year;
    }

    getModel() {
       console.log("[GetModel]");
        return "nagra";
    }
}

export default NagraId;
