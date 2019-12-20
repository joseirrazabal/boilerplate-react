import Device from "../../devices/device";

import React, { Component } from 'react';

class DeviceInfo extends Component {
    constructor() {
        super();
        this.device = Device.getDevice().getPlatform();
    }
    render() {

        let abstractId = Device.getDevice().getId();
        //let abstractId = new dynamicClass('Id', this.device);

        return (
            <div className='deviceInfo'>
                <div>getDeviceType: <span>{abstractId.getDeviceType()}</span></div><br />
                <div>getDeviceModel: <span>{abstractId.getDeviceModel()}</span></div><br />
                <div>getDeviceManufacturer: <span>{abstractId.getDeviceManufacturer()}</span></div><br />
                <div>getDeviceCategory: <span>{abstractId.getDeviceCategory()}</span></div><br />
                <div>getFirmware: <span>{abstractId.getFirmware()}</span></div><br />
                <div>getFirmwareYear: <span>{abstractId.getFirmwareYear()}</span></div><br />
                <div>getModel: <span>{abstractId.getModel()}</span></div><br />
                <div>getMac: <span>{abstractId.getMac()}</span></div ><br />
                <div>getUniqueID: <span>{abstractId.getUniqueID()}</span></div ><br />
                <div>getIP: <span>{abstractId.getIP()}</span></div ><br />
                <div>Device Type: <span>{this.device}</span></div ><br />
                <div>getUserAgent: <span>{abstractId.getUserAgent()}</span></div><br />
                <div>getModelYear: <span>{abstractId.getModelYear()}</span></div><br />
            </div>
        )
    }
}

export default DeviceInfo

