import AbstractNetworkStatus from '../all/AbstractNetworkStatus';

class Web0sNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
  }

  isOnline() {
    console.log('[NetworkStatus] checking Web0s...');
    return this.onlineByAjax();
  }

}

export default Web0sNetworkStatus;
