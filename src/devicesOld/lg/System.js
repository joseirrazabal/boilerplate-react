import AbstractSystem from "../all/AbstractSystem";

class LgSystem extends AbstractSystem {

    exit(param) {
        var toTV = true;
        if (param && typeof param.toTV === "boolean") {
            toTV = param.toTV;
        }

        if (window.NetCastBack) {
            window.NetCastBack();
        } else {
            if (toTV) {
                if (window.NetCastExit) {
                    window.NetCastExit();
                    return;
                }
            }

            //old method to back the app store
            window.NetCastReturn(461);
        }
    }
}

export default LgSystem;
