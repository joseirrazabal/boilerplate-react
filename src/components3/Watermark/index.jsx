import './watermark.css'
import React,{ Component } from 'react';
import storage from '../DeviceStorage/DeviceStorage'
import pkg from '../../../package.json'



class WaterMark extends Component {
  constructor() {
    super();
    this.hostname=window.location.hostname;
    this.showHostnames=["localhost","127.0.0.1","aaf-stbnagra-test.clarovideo.net","aaf-stbnagra-preprod.clarovideo.net"];
    this.state={enable: false};

    this.checkVisibilty=this.checkVisibilty.bind(this);
    this.setVisibilty=this.setVisibilty.bind(this);
    this.validateIpAddress = this.validateIpAddress.bind(this);
  }
  componentDidMount(){
  this.setVisibilty();
  }
  setVisibilty(){
    this.setState({enable:this.checkVisibilty()})
  }
  checkVisibilty(){
    if(storage.getItem("forceWaterMark")=="true" || this.validateIpAddress(this.hostname))
      return true;
    else
     return this.showHostnames.indexOf(this.hostname)!=-1
  }

  validateIpAddress(hostname) {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(hostname);
  }

  render() {
      if(this.state.enable)
        return  <div className="watermark">
          <div className="version">version:{pkg.version}</div>
          <div className="extra-info">hostname:{this.hostname}</div>

           </div>
      return null
      }
}

export default WaterMark
