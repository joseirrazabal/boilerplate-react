import AbstractId from "../all/AbstractId";

class Ps4Id extends AbstractId {
    constructor() {
        super();
    }

    getDeviceType() {
        return "console";
    }

    getHardwareType() {
        return 'console';
    }

    getFirmware() {
        
        return "console/ps4";
    }
}

export default Ps4Id;
