import Metadata from '../../requests/apa/Metadata';
import epgCache from "../../utils/EpgCache";
import Utils from '../Utils';

class epgClearCache {
  constructor() {

    this.default = 10000;  //miliseconds
    this.epgInterval = null; 
    this.intervaltime = null;    
    
    this.setIntervalEpgClearCache = this.setIntervalEpgClearCache.bind(this);

  }

  setIntervalEpgClearCache() {
    let time = null;

    if (!this.intervaltime) {
      try {
        time = parseFloat(Utils.getAPARegionalized('epg_cache_refresh_time', 'refresh', this.default));

      } catch (e) {
        time = this.default;
      }
      this.intervaltime = time;
    }

    if (this.epgInterval) {
      clearInterval(this.epgInterval);
      this.epgInterval = null;
    }

    this.epgInterval = setInterval(() => {
      epgCache.releaseMemory();
    }, this.intervaltime);    

  } 
}

const instanceEpgClearCache = new epgClearCache();

export default instanceEpgClearCache;
