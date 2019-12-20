import AbstractNetworkStatus from '../all/AbstractNetworkStatus';
import PlaystationWebmaf from './PlaystationWebmaf';

class Ps4NetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
    this.initListenerNetwork = this.initListenerNetwork.bind(this);
    this.initListenerNetwork();
  }

  isOnline() {
    console.log('[NetworkStatus] checking PS4...');
    return new Promise((resolve, reject) => {
      resolve(this.onLine);
    });
  }

  initListenerNetwork() {
    try {
      PlaystationWebmaf.addEventListener("networkStatusChange", (networkStatus) => {
        if (networkStatus && networkStatus.newState) {
          console.info("[PS4] Received the network status change callback> ", networkStatus.newState);
          if (networkStatus.newState === "connected") {
            this.onLine  = true;
          } else if (networkStatus.newState === "disconnected") {
            this.onLine  = false;
          }
        }
      });
    }
    catch(e) {
      console.error("[NetworkStatus] PS4 Unable to init network status listener> " + e);
    }
  }
}

export default Ps4NetworkStatus;
