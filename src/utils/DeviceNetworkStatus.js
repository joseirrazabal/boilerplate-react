//import NetworkStatus from "../devices/workstation/NetworkStatus";
import settings from '../devices/all/settings';
import { MODAL_DESCONEXION, HIDE_MODAL } from '../actions/modal';
import Device from "../devices/device";
import AAFPlayer from '../AAFPlayer/AAFPlayer';

import {
  AAFPLAYER_STOP,
  AAFPLAYER_PLAY
} from '../AAFPlayer/constants';


class DeviceNetworkStatus {

  constructor(props) {
    this.__showModal = props && props.showModal;
    this.__checkerID = null;
    this.__checkerInterval = settings.interval_time_check_; // in seconds
    this.__networkStatus = true;
    this.__eventNetworkStatus = 'current-network-status';
    this.__plaftorm = Device.getDevice().getPlatform();
    // binded functions
    this.startCheckNetwork = this.startCheckNetwork.bind(this);
    this.checkNetworkStatus = this.checkNetworkStatus.bind(this);
    this.resetCheckNetwork = this.resetCheckNetwork.bind(this);
    this.isOnline = this.isOnline.bind(this);
    this.handleNetworkStatusChange = this.handleNetworkStatusChange.bind(this);
    this.resetNetworkStatusEvent = this.resetNetworkStatusEvent.bind(this);
    // Add custom event
    document.addEventListener(this.__eventNetworkStatus, this.handleNetworkStatusChange);
  }

  isOnline() {
    // TODO For each device...
    // Return a promise...
    let platform = this.__plaftorm;
    let promRet;
    let fncBind = this.updateNetworkStatus.bind(this);
    const NetworkStatus = Device.getDevice().getNetworkStatus();
    //let vari = new LGNetworkStatus();
    //platform = 'tizen';

    promRet = NetworkStatus.isOnline();

    promRet.then(function (nwtStatus) {
      console.info('[NetworkStatusUtil] status', nwtStatus);
      fncBind(nwtStatus);
      }
    );

    return promRet;
  }

  updateNetworkStatus(val) {
    this.__networkStatus = val;
    return this.__networkStatus;
  }

  startCheckNetwork() {
    this.__checkerID = setTimeout(this.checkNetworkStatus, (this.__checkerInterval * 1000));
  }

  checkNetworkStatus() {
    this.resetCheckNetwork();
    // Keep last value to compare when next val arrives...
    let currentNetworkStatus = this.__networkStatus;
    // Below, this.onLine will update the val of __networkStatus
    this.isOnline().then((nwtStatus) => {
      //console.log('[NetworkStatus] Is there network?> ' + nwtStatus);
      if (currentNetworkStatus === nwtStatus) {
        // Reinit check network, no change
        this.startCheckNetwork();
      }
      else {
        // Fire event when status change
        console.log('>>>> handleNetworkDisconnection, enviando evento de cambio en red:', nwtStatus);
        document.dispatchEvent(new CustomEvent(this.__eventNetworkStatus, { detail: nwtStatus }));
        this.startCheckNetwork();
      }
    })
  }

  resetCheckNetwork() {
    if (this.__checkerID)
      clearTimeout(this.__checkerID);
  }

  handleNetworkStatusChange(event) {
    console.log('NetworkStatus event detail> ' + event.detail);
    let div1 = document.getElementById('nsplatform');
    let div2 = document.getElementById('nsisconnected');
    let isPip = true;
    let full_state = AAFPlayer.getCurrentPlayingState(!isPip);
    let in_stop = AAFPLAYER_STOP;
    let in_play = AAFPLAYER_PLAY;
    if (event.detail && event.detail === true) {
      // Si esta en player, el player controla la desconexión/reconexión
      if(full_state !== in_play) {
        this.__showModal({ modalType: HIDE_MODAL });
        div1 ? div1.innerHTML = 'Platform> ' + this.__plaftorm : null;
        div2 ? div2.innerHTML = 'IsConnected [expected true]> ' + this.__networkStatus : null;
      }
    }
    else {
      // Si esta en player, el player controla la desconexión/reconexión
      if(full_state === in_stop) {
        this.__showModal({ modalType: MODAL_DESCONEXION });
        div1 ? div1.innerHTML = 'Platform> ' + this.__plaftorm : null;
        div2 ? div2.innerHTML = 'IsConnected [expected false]> ' + this.__networkStatus : null;
      }
    }
  }

  resetNetworkStatusEvent() {
    // TODO Make sure to remove DOM listener when the main component is unmounted ...(App js ¿?)
    document.removeEventListener(this.__eventNetworkStatus, this.handleNetworkStatusChange);
  }
}

export default DeviceNetworkStatus;
