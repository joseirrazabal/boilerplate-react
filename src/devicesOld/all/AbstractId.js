class AbstractId {
    constructor() {
        this.HARDWARE_TYPE = {
            /** Bluray player */
            BD: "Bluray",
            /**  TV */
            TV: "TV",
            /**  MONITOR */
            MONITOR: "Monitor",
            /**  HOME THEATRE */
            HOME_THEATRE: "Home Theatre",
            /**  EMULATOR */
            EMULATOR: "Emulator",
            /**  WORKSTATION */
            WORKSTATION: "Workstation",
            ANDROID: "Android",
            /**  Set Top Box */
            STB: "Set Top Box",
            /**  game console like playstation, wiiu */
            CONSOLE: "Console",
            /**  game console monitor like wiiu gamepad monitor*/
            CONSOLE_MONITOR: "Console Monitor",
            /**  Unknown which is unable to determine the device type among various devices*/
            UNKNOWN: "Unknown"
        };

        this.DEVICE_MODEL = {
            GENERIC: "generic",
            HISENSE: "hisense",
            LGNETCAST: "netcast",
            LGWEB0S: "web0s",
            LG: "lg",
            SAMSUNG: 'samsung',
            ORSAY: 'orsay',
            TIZEN: 'tizen',
            SONY: 'sony',
            OPERA: 'opera',
            PLAYSTATION3: 'ps3',
            PLAYSTATION4: 'ps4',
        };

        this.DEVICE_MANUFACTURER = {
            LG: 'lg',
            SONY: 'sony',
            SAMSUNG: 'samsung',
            OPERA: 'opera',
            SONY: 'sony',
            HISENSE: 'hisense',
            NAGRA: 'nagra',
            NGV: 'nvg',
            COSHIP: 'android'
        };

        this.DEVICE_CATEGORY = {
            TV: 'tv',
            CONSOLE: 'console',
            STB: 'stb',
        };
    }
    /**
     * Get the MAC address.
     * @name getMac
     * @function
     * @return {String} mac address. null if not available.
     * @memberof ax/device/AbstractId#
     * @public
     */
    getMac() {
        return null;
    }

    /**
     * Get the system's firmware version.
     * @name getFirmware
     * @function
     * @return {String} firmware version."dummyFirmware" if not available.
     * @memberof ax/device/AbstractId#
     * @public
     */
    getFirmware() {
        return "dummyFirmware";
    }

    /**
     * Get the year from the system's firmware version.
     * @name getFirmwareYear
     * @function
     * @return {Number} firmware year Return 0 if not available.
     */
    getFirmwareYear() {
        return 0;
    }

    /**
     * Get a uniqueID of the device. UUID is gernerated and stored in localStorage to pretent a
     * unique if device API is not available.
     * @name getUniqueID
     * @function
     * @return {String} unique ID
     */
    getUniqueID() {
        //este id es dummy, añadir función en cuanto se tenga el abstract de store
        return "aX4j9Z";
    }

    /**
     * Get device's model number.
     * @name getModel
     * @function
     * @return {String} "dummyModel" if not available.
     */
    getModel() {
        return "dummyModel";
    }

    /**
     * Get device's internal IP.If there are no related api, it will return 0.0.0.0 and
     * developer may need to send ajax to public api service to get the ip.
     * @name getIP
     * @function
     * @return {String} ip address."0.0.0.0" if it's not available.
     */
    getIP() {
        return "0.0.0.0";
    }

    getUserAgent() {
        let agent = navigator.userAgent.toLowerCase();
        return agent;
    }

    getDeviceType() {
      return null;
    }

    getDeviceModel() {
      return null;
    }

    getDeviceManufacturer() {
        return null;
    }

    getDeviceCategory() {
      return null;
    }

    getModelYear() {
      return null;
    }
}

export default AbstractId;
