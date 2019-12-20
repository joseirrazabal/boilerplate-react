import Metadata from '../../requests/apa/Metadata';
import { isLoggedIn } from '../../requests/loader';
import { receiveIsLoggedIn } from '../../reducers/user';
import store from '../../store';
import Utils from '../Utils';

class UtilsIsLoggedIn {
  constructor() {


    this.default = 24;
    this.isLoggedInInterval = null; 
    this.intervaltime = null;    
    
    this.setIntervalIsLoggedIn = this.setIntervalIsLoggedIn.bind(this);

    console.log('[ISLOGGEDIN] - constructor [default=',this.default,'|isLoggedInInterval=',this.isLoggedInInterval,'|intervaltime=',this.intervaltime,']');
  }

  setIntervalIsLoggedIn() {

    console.log('[ISLOGGEDIN] - setIntervalIsLoggedIn')

    let hours = null;

    if (!this.intervaltime) {
      try {
        hours = parseFloat(Utils.getAPARegionalized('isloggedin_refresh_hours_time', 'hour_refresh', this.default));

      } catch (e) {
        hours = this.default;
      }
      this.intervaltime = hours * 60 * 60 * 1000; // goose -- el calculo real
      // this.intervaltime = 5000; // goose -- 5 segundos
      // this.intervaltime = 900000; // goose -- 15 minutos
      // this.intervaltime = 1800000; // goose -- 30 minutos
    }

    console.log('[ISLOGGEDIN] - setIntervalIsLoggedIn [intervaltime=',this.intervaltime,'ms, ',hours,'h]');

    if (this.isLoggedInInterval) {
      clearInterval(this.isLoggedInInterval);
      this.isLoggedInInterval = null;
    }

    this.isLoggedInInterval = setInterval(() => {
      return isLoggedIn()
        .then(result => {
          console.log('[ISLOGGEDIN] - setInterval - then : ',result)
          const user = (result && result.response) ? result.response : { isLoggedIn : false };
          store.dispatch(receiveIsLoggedIn(user));         
        })
        .catch(err=>{
          console.log('[ISLOGGEDIN] - ERROR - catch : ',err)
        });
    }, this.intervaltime);    

    console.log('[ISLOGGEDIN] - setIntervalIsLoggedIn [isLoggedInInterval=',this.isLoggedInInterval,']');

  } 
}

const instanceUtilsIsLoggedIn = new UtilsIsLoggedIn();
//Object.freeze(instance);

export default instanceUtilsIsLoggedIn;
