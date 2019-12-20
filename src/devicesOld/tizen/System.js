import AbstractSystem from "../all/AbstractSystem";

class TizenSystem extends AbstractSystem {

  exit(param) {
    //http://developer.samsung.com/tv/develop/guides/fundamentals/terminating-applications    
        var toTV = true;
        if (param && typeof param.toTV === "boolean") {
            toTV = param.toTV;
        }

        const application = window.tizen.application;

        if (!toTV) {
            console.debug(">> exit to where the app is launched from");
            application.getCurrentApplication().exit();
        } else {
            console.debug(">> exit to TV and channel");
            application.getCurrentApplication().exit();
        }

    }
}

export default TizenSystem;
