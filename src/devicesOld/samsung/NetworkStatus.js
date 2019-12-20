import AbstractNetworkStatus from '../all/AbstractNetworkStatus';
import SamsungOrsay from '../../utils/SamsungOrsay';

// DOC
// Seems you are using the API for old platform (which is Orsay platform for models on 2014 and before). The API docs are as follow:
// http://developer.samsung.com/tv/develop/legacy-platform-library/API00004/Network_167

// If you are using 2015 models or newer, you should refer to the API in this link below:
// http://developer.samsung.com/tv/develop/api-references/samsung-product-api-references/network-api
class SamsungNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
    this.isSamsungEmulator = this.isSamsungEmulator.bind(this);
    this.samsungOrsay = new SamsungOrsay();
  }

  isOnline() {
    if(this.isSamsungEmulator())
    {
      return Promise.resolve(true);
    }

    let netStatus = false;
    /*
    1  : active interface is WIRED
    0  : active interface is WIRELESS
    -1 : Fail
    DOC http://developer.samsung.com/tv/develop/legacy-platform-library/API00004/Network_167
     */

    let activeInterface = this.samsungOrsay.device.networkPlugin.GetActiveType();
    if (activeInterface === -1) {
      netStatus = false;
    }
    netStatus = this.samsungOrsay.device.networkPlugin.CheckGateway(activeInterface);
    console.log('[NetworkStatus] checking Samsung netStatus ' +(activeInterface == 1 ? '[Wireless]: ' : '[Wired]: ') + (netStatus === 1 ? 'Connected' : 'Disconnected'));

    return Promise.resolve(netStatus === 1);
    /*
    if(activeInterface == 1) {
      netStatus = this.samsungOrsay.device.networkPlugin.CheckGateway(activeInterface) > 0;
    }
    else {

    }
    // Check for LAN...
    if (!this.isLANConnected()) {
      return Promise.resolve(false);
    }

    try {
      netStatus = this.samsungOrsay.device.networkPlugin.CheckGateway(activeType) > 0;
      console.debug("[NetworkStatus] isInternetConencted:" + netStatus);
    } catch (e) {
      console.warn("[NetworkStatus] Samsung unable to detect the internet Connection" + e);
    }

    return Promise.resolve(netStatus);
    */
  }

  /*
  isLANConnected() {
    console.log('[NetworkStatus] checking Samsung isLANConnected');
    let LANConnected = false;

    if (this.isSamsungEmulator()) {
      return true;
    }

    let LANtype = this.samsungOrsay.device.networkPlugin.GetActiveType();

    console.log('[NetworkStatus] checking Samsung isLANConnected LANType: ' + LANtype);

    if (LANtype === -1) {
      return false;
    }

    try {
      LANConnected = this.samsungOrsay.device.networkPlugin.CheckPhysicalConnection(LANtype) > 0;
      console.log('[NetworkStatus] checking Samsung isLANConnected LANConnected: ' + LANConnected);
    } catch (e) {
      console.warn("[NetworkStatus] cant get lan connection info" + e);
    }

    return LANConnected;
  }
  */

  isSamsungEmulator() {
    return false;
    //return window.location.search.indexOf("product=") < 0;
  }

}

export default SamsungNetworkStatus;
