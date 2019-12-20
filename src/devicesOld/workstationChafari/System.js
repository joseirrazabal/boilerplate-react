import AbstractSystem from "../all/AbstractSystem";

class WorkstationSystem extends AbstractSystem {
    constructor() {
        super();
        this.device = undefined;
        this.document = undefined;
    }

    exit() {
        window.close();
    }

    hasMouse() {
        return true;
    }

    hasFixedKeyboard() {
        return true;
    }

    getDisplayResolution() {
        //the display resolution in workstation are 1280p and 1080p
        const config = window.config;
        var resolution1080p = config.get("device.workstation.1080p", false);
        if (resolution1080p) {
            return {
                width: 1920,
                height: 1080
            };
        }
        return {
            width: 1280,
            height: 720
        };
    }

    supportSSL() {
        return true;
    }

    redraw(element) {
        return false;
    }
}

export default WorkstationSystem;
