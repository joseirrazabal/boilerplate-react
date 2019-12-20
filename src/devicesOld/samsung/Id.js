import AbstractId from "../all/AbstractId";
import SamsungOrsay from '../../utils/SamsungOrsay';

class SamsungId extends AbstractId {

    constructor() {
        super();

        this.isSamsungEmulator = this.isSamsungEmulator.bind(this);
        this.samsungOrsay = new SamsungOrsay();

    }

    isSamsungEmulator() {
        return false;//window.location.search.indexOf("product=") < 0;
    }

    getDeviceType() {

        if (this._deviceType) {
            return this._deviceType;
        }

        if (this.isSamsungEmulator()) {
            this._deviceType = this.HARDWARE_TYPE.EMULATOR;
            return this._deviceType;
        }

        let product = window.location.search[window.location.search.indexOf("product=") + 8];

        switch (product) {
            case "2":
                try {
                    let productType = this.samsungOrsay.device.tvPlugin.GetBDProductType();

                    if (productType === 2) {
                        this._deviceType = this.HARDWARE_TYPE.HOME_THEATRE;
                    } else {
                        this._deviceType = this.HARDWARE_TYPE.BD;
                    }
                } catch (err) {
                    this._deviceType = this.HARDWARE_TYPE.BD;
                }
                break;
            case "1":
                this._deviceType = this.HARDWARE_TYPE.MONITOR;
                break;
            default:
                this._deviceType = this.HARDWARE_TYPE.TV;
                break;
        }

        return this._deviceType;
    }

    getDeviceModel() {

        if (this._model) {
            return this._model;
        }


        let model = this.samsungOrsay.device && this.samsungOrsay.device.tvPlugin && this.samsungOrsay.device.tvPlugin.GetProductCode ?
            this.samsungOrsay.device.tvPlugin.GetProductCode(0): null;

        if (model) {
            this._model = model;
            return this._model;
        }

        return null;
    }

    getModelYear() {

        let model = this.getDeviceModel();
        let arrModel = [];

        if (model !== undefined && model !== null) {
            arrModel = model.split("");
        }


        let isSizeInches = false;
        let isModelYear = false;
        let modelYear = '';

        for (var i = 0; i < arrModel.length; i++) {
            if (!isNaN(arrModel[i]) && !isSizeInches && !isModelYear) {
                isSizeInches = true;
            }
            if (isNaN(arrModel[i]) && isSizeInches) {
                modelYear = arrModel[i];
                isModelYear = true;
                isSizeInches = false;
            } else if (isModelYear && !isSizeInches) {
                if (isNaN(arrModel[i]))
                    modelYear += arrModel[i];
                else
                    break;
            }
        }

        let code = this.getSamsungYear(modelYear);

        if (code === null && modelYear.length > 1) {
            for (var i = 1; i < modelYear.length; i++) {
                let newModelYear = modelYear.slice(0, -1 * (i));
                code = this.getSamsungYear(newModelYear);
                if (code !== null) {
                    return code;
                }
            }
        }

        return code;
    }

    getSamsungYear(code) {

        let returnValue;

        switch (code) {
            case 'A':
                returnValue = '2008';
                break;
            case 'B':
                returnValue = '2009';
                break;
            case 'C':
                returnValue = '2010';
                break;
            case 'D':
                returnValue = '2011';
                break;
            case 'E':
                returnValue = '2012';
                break;
            case 'F':
                returnValue = '2013';
                break;
            case 'HU':
                returnValue = '2014';//'2014 UHD';
                break;
            case 'H':
                returnValue = '2014';
                break;
            case 'JU':
                returnValue = '2015';//'2015 UHD';
                break;
            case 'JS':
                returnValue = '2015';//'2015 SUHD';
                break;
            case 'L':
                returnValue = '2015';
                break;
            case 'KU':
                returnValue = '2016';//'2016 UHD';
                break;
            case 'KS':
                returnValue = '2016';//'2016 SUHD';
                break;
            case 'M':
                returnValue = '2017';//'2017 HD'
                break;
            case 'MU':
                returnValue = '2017';//'2017 UHD'
                break;
            case 'Q':
                returnValue = '2017';//2017 QLED
                break;
            default:
                returnValue = null;
        }

        return returnValue;

    }

    getDeviceManufacturer() {
        return this.DEVICE_MANUFACTURER.SAMSUNG;
    }

    getDeviceCategory() {
        return this.DEVICE_CATEGORY.TV;
    }

    getFirmware() {

        if (this._firmware) {
            return this._firmware;
        }

        let firmware;

        try {
            firmware = this.samsungOrsay.device.NNaviPlugin.GetFirmware();

        } catch (e) {
            console.warn("Can't get firmware from Samsung:" + e);
        }

        if (firmware !== undefined && firmware.length > 0) {
            this._firmware = firmware;
        } else {
            this._firmware = "noFirmware";
        }

        return this._firmware;
    }

    getFirmwareYear() {

        let firmware = this.getFirmware(),
            year;

        if (firmware !== undefined) {
            year = parseInt(firmware.substr(10, 4), 10);
            return isNaN(year) ? 0 : year;
        }

        return null;
    }

    getModel() {

        if (this._model) {
            return this._model;
        }

        var model = this.samsungOrsay.device && this.samsungOrsay.device.tvPlugin && this.samsungOrsay.device.tvPlugin.GetProductCodes?
            this.samsungOrsay.device.tvPlugin.GetProductCode(0): null;

        if (model) {
            this._model = model;
            return this._model;
        }
        return null;
    }

    getMac() {

        if (this._mac) {
            return this._mac;
        }

        if (this.isSamsungEmulator()) {
            return null;
        } else {
            try {
                this.samsungOrsay.device.networkPlugin.CreatePlugin();

                var type = this.samsungOrsay.device.networkPlugin.GetActiveType();
                if (type > -1) {
                    this.__mac = this.samsungOrsay.device.networkPlugin.GetMAC(type);
                    return this.__mac;
                }
            } catch (e) {
                console.log(e);
            }
        }
        return null;
    }

    getUniqueID() {

        if (this.isSamsungEmulator()) {
            return "noUniqueId";
        }

        var mac = this.getMac();

        try {
            return this.samsungOrsay.device.NNaviPlugin.GetDUID(mac);
        } catch (e) {
            console.debug("Fail to get DUID from the device and use UUID");
            return null;
        }
    }

    getIP() {

        if (this.getFirmwareYear() > 2010) {
            let ip = this.samsungOrsay.device.networkPlugin.GetHostAddr();
            if (ip) {
                return ip;
            }
        } else {
            console.warn("This function is not supported on this device (samsung 2010 or lower)");
        }
        return "0.0.0.0";

    }
}

export default SamsungId;
