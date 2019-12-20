import RequestManager from '../../requests/RequestManager';
import CheckNetworkStatusTask from '../../requests/tasks/application/CheckNetworkStatusTask';
import settings from './settings';

class NetworkStatus {

  constructor() {
    // -Assume- we start with internet connected
    this.onLine = true;
    this.onlineByAjax = this.onlineByAjax.bind(this);

    // Last time we check ajax
    this.__ajax_last_time = null;
    // Time between ajax calls
    this.__checkerInterval = settings.interval_time_check_;
  }

  isOnline () {
    return this.onlineByNavigator();
  }

  onlineByNavigator() {
    let couldCheck = false;

    // All objects have a toString method, it returns [object object_tye] i.e. [object Object]
    let elementToString = Object.prototype.toString;
    if(navigator) {
      // call() is a global method in JavaScript
      if(elementToString.call(navigator.onLine) === '[object Boolean]') {
        //console.log('[NetworkStatus] usando navigator object> ' + navigator.onLine);
        this.onLine = navigator.onLine;
        couldCheck = true;
      }
    }

    if(couldCheck)
      return Promise.resolve(this.onLine);
    else
      return this.onlineByAjax();
  }

  async onlineByAjax() {

    //console.log('[NetworkStatus] @@@@@@>onlineByAjax init');
    let result;
    // Current time, now
    let uptimestamp = (new Date()).getTime();

    // If we already check some seconds ago, we dont need to check again and again and again...until next interval time
    if(!this.__ajax_last_time || ((uptimestamp - this.__ajax_last_time) > (this.__checkerInterval * 1000))) {
      this.__ajax_last_time = uptimestamp;
      //console.log('[NetworkStatus] Check by ajax...');
      let checkNetworkStatusTask = new CheckNetworkStatusTask();
      let requestRes = await RequestManager.addRequest(checkNetworkStatusTask).then(
        () => {
          this.onLine = result = true;
        }
      ).catch(() => {
        this.onLine = result = false;
      });
    }
    // Return last status...
    else {
      //console.log('[NetworkStatus] Check and return previous network state...');
      result = this.onLine;
    }

    //console.log('[NetworkStatus] @@@@@@>onlineByAjax regresando con promesa ' + result);
    return new Promise((resolve, reject) => {
      resolve(result);
    });

  }

}

export default NetworkStatus;
