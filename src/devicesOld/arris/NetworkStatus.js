import AbstractNetworkStatus from '../all/AbstractNetworkStatus';

class ArrisNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
  }

  isOnline() {
    console.log('[NetworkStatus] checking Arris...');
    return this.onlineByAjax(); 
  }

}

export default ArrisNetworkStatus;
