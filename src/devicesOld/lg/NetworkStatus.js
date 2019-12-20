import AbstractNetworkStatus from '../all/AbstractNetworkStatus';

class LgNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
  }

  isOnline() {
    console.log('[NetworkStatus] checking LG...');
    return this.onlineByAjax();
  }

}

export default LgNetworkStatus;
