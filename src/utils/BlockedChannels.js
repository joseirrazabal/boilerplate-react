import StatusControlPinTask from "../requests/tasks/user/StatusControlPinTask";
import RequestManager from '../requests/RequestManager';

class BlockedChannels{
    constructor () {
	    this.data = [];
	    this.checkBlockedChannels = this.checkBlockedChannels.bind(this);
	    this.channelsRequest = new StatusControlPinTask();
    }

    checkBlockedChannels() {
    	return new Promise( (resolve, reject) => {
    		RequestManager.addRequest(this.channelsRequest).then((resp) => {
    			let blockedChannels = resp.response.pin_channel.status ? resp.response.pin_channel.info : [];
	        	console.log('[BlockedChannels] Canales: ',blockedChannels);
		        resolve(blockedChannels);
	      	}).catch((err) => {
	        	console.error(err);
	        	reject(err);
	      	});
    	});
      	
	 }
}

export default BlockedChannels;
