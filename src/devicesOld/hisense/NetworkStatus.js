import AbstractNetworkStatus from '../all/AbstractNetworkStatus';

class HisenseNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
  }

  isOnline() {
    // Hisense dont work with navigator online
    console.log('[NetworkStatus] checking Hisense...');
    return this.onlineByAjax();
  }

}

export default HisenseNetworkStatus;
