class AbstractSystem {
    constructor() {
        //añadir innternetonline function cuando esté terminada
    }

    /**
     * Setting the screen saver On/Off
     * @name setScreenSaver
     * @method
     * @param {Boolean} flag True to turn on and off to turn off.
     * @return {Boolean}  Return true if success or no state change. Return false if system API not available.
     */
    /*jshint unused:false */
    setScreenSaver(flag) {
        return false;
    }

    /*jshint unused:true */
    /**
     * Setting the system to mute/unmute.
     * @name setSystemMute
     * @method
     * @param {Boolean} flag True to mute and false to unmute
     * @return {Boolean}  Return true if
     * success or no state change. Return false if system API not available.
     */
    /*jshint unused:false */
    setSystemMute(flag) {
        return false;
    }
    /*jshint unused:true */
    /**
     * Power off the system
     * @name powerOff
     * @method
     * @return {Boolean} Return false if system API not available.
     */
    powerOff() {
        return false;
    }

    /**
     * Exit the application
     * @name exit
     * @method
     * @param {Object} [obj] To set the information when exit
     * @param {Boolean} [obj.toTV] True when exit back to TV source, false will go back to smartHub/App Store page.Default is true
     * @return {Boolean} Return false if system API not available.
     */
    exit() {
        return false;
    }

    /**
     * Determine whether device support mouse
     * @name hasMouse
     * @method
     * @return {Boolean} Return true if the platform has pointer devices/emulation support.Return false if not available.
     * @memberof ax/device/AbstractSystem#
     */
    hasMouse() {
        return false;
    }

    /**
     * Determine whether device support hardware keyboard
     * @name hasFixedKeyboard
     * @method
     * @return {Boolean} Return true if the platform has hardware keyboard support..Return false if not available.
     */
    hasFixedKeyboard() {
        return false;
    }

    /**
     * @typedef Resolution
     * @type {Object}
     * @property {Number} width in pixels
     * @property {Number} height in pixels
     */
    /**
     * Get the getDisplayResolution
     * @name getDisplayResolution
     * @method
     * @return {ax/device/AbstractSystem.Resolution} Return the display resolution from of the platform.Return {width:0,height:0} if not available.
     */
    getDisplayResolution() {
        return {
            width: 0,
            height: 0
        };
    }

    /**
     * Whether SSL is supported in the device
     * @name suportSSL
     * @method
     * @return {Boolean} Return true if the platform support SSL certificate verification.
     */
    supportSSL() {
        return false;
    }

    /**
     * Whether same-origin policy exists in the device (i.e. cross domain ajax is not allowed). Modern browsers should have this policy.
     * @name hasSOP
     * @method
     * @return {Boolean} Return true if cross domain ajax is not allowed natively. Proxy / Allow-Origin header setup may be needed.
     */
    hasSOP() {
        return true;
    }
}

export default AbstractSystem;
