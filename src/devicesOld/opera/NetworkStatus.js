import AbstractNetworkStatus from '../all/AbstractNetworkStatus';

class OperaNetworkStatus extends AbstractNetworkStatus {

  constructor() {
    super();
  }

  isOnline() {
    console.log('[NetworkStatus] checking Opera...');
    // Opera will not notify it immediately when we connect wifi/ethernet again after a previous disconnect,
    // we will wait until opera says there is internet connection again :( (wait about 5-10 mins after connect network again)
    return this.onlineByAjax();
  }

}

export default OperaNetworkStatus;
