import AbstractNetworkStatus from '../all/AbstractNetworkStatus';

class TizenNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
  }

  isOnline() {
    let netStatus = false;
    //let webapis = window.webapis || {};
    console.log('[NetworkStatus] checking Tizen...' + window.webapis);
    try {
      //let webapis = require('$WEBAPIS/webapis/webapis.js');
      netStatus = window.webapis.network.isConnectedToGateway();
      console.debug("[NetworkStatus] Tizen isInternetConencted:" + netStatus);
    } catch (e) {
      console.error("[NetworkStatus] isConnectedToGateway exception [" + e.code + "] name: " + e.name + " message: " + e.message);
    }

    return Promise.resolve(netStatus);
  }

}

export default TizenNetworkStatus;
