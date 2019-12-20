import AbstractSystem from "../all/AbstractSystem";

class SamsungSystem extends AbstractSystem {

    constructor() {
        super();
    }

    exit(param) {
        var toTV = true;
        if (param && typeof param.toTV === "boolean") {
            toTV = param.toTV;
        }


        if(window.Common && window.Common.API && window.Common.API.Widget){
            var widgetAPI = new window.Common.API.Widget();
            if(widgetAPI && typeof widgetAPI.sendExitEvent ==='function'){
                widgetAPI.sendExitEvent();    
            }
            
        }
        
        /*
       if (!toTV) {
            console.debug(">> exit to where the app is launched from");
            //only press smarthub btn will set the TV source to small screen
            this.__widgetAPI.sendReturnEvent();
        } else {
            console.debug(">> exit to TV and channel");
            this.__widgetAPI.sendExitEvent();
        }
        */
    }
}

export default SamsungSystem;
