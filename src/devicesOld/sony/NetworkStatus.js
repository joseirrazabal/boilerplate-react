import AbstractNetworkStatus from '../all/AbstractNetworkStatus';

class SonyNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
  }

  isOnline() {
    console.log('[NetworkStatus] checking Sony...');
    return this.onlineByAjax();
  }

}

export default SonyNetworkStatus;
