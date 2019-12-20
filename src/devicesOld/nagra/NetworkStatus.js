import AbstractNetworkStatus from '../all/AbstractNetworkStatus';

class NagraNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
    this._CCOM = window.parent.CCOM || window.CCOM;

    this.__initListenerNetwork = this.__initListenerNetwork.bind(this);
    this.__nagraNativeCallback = this.__nagraNativeCallback.bind(this);
    this.__initListenerNetwork();
  }

  isOnline() {
    return Promise.resolve(this.onLine);
  }

  __initListenerNetwork() {
    try {
      this._CCOM.IpNetwork.addEventListener('onStatusChanged', this.__nagraNativeCallback);
    }
    catch(e) {
      console.error("[NetworkStatus] Nagra Unable to init network status listener> " + e);
    }
  }

  __nagraNativeCallback(e) {
    let evtRec = '---';
    switch(e.eventType)
    {
      // At this moment we only test over wired connection
      case this._CCOM.IpNetwork.LINK_DOWN:
        this.onLine = false;
        evtRec = 'LINK_DOWN';
        break;
      case this._CCOM.IpNetwork.LINK_UP:
        this.onLine = true;
        evtRec = 'LINK_UP';
        break;
      // TODO What happens when we are by wireless? below works?
      case this._CCOM.IpNetwork.SIGNAL_LOST:
        break;
      case this._CCOM.IpNetwork.SIGNAL_OK:
        break;
      default:
        break;
    }
    console.log("[NetworkStatus] Nagra receive callback> " + evtRec);
    // TODO we can check the same thing with e.interface.linkUp (it returns a boolean that indicates network status)
    //console.log('[NetworkStatus] inteface: ' + e.interface.linkUp);

  }
}

export default NagraNetworkStatus;
