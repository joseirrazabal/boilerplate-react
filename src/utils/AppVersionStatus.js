import settings from "../devices/all/settings";
import {MODAL_VERSION} from '../actions/modal';
import utils from "./Utils";
import { getAppVersion } from "../requests/loader";
import pkg from '../../package.json'
import AAFPlayer from "../AAFPlayer/AAFPlayer";
import {playFullMedia} from "../actions/playmedia";
import store from "../store";
import {AAFPLAYER_PLAY, AAFPLAYER_STOP} from '../AAFPlayer/constants'

class AppVersionStatus{
  constructor(props){
    this.__showModal = props && props.showModal;
    this.__history= props && props.history;
    this.__checkerID = null;
    this.__checkerInterval = parseInt(utils.getIntervalTimeCheckVersion());//en minutos
  }

  forceUpdate=()=>{
    let cstate = AAFPlayer.getCurrentPlayerOptions();
    const { playerstate } = cstate;
    if(playerstate === AAFPLAYER_PLAY) {
      let nullPlayer = {
        ispip: false,
        islive: false,
        ispreview: false,
        playerstate: AAFPLAYER_STOP,
      };
      store.dispatch(playFullMedia(nullPlayer))
    }
    this.__history.replace('/');
    window.location.reload(true); //al poner el true actualiza la aplicacion forzada ignorando la cache
  }

  optionalUpdate=()=>{
    if(utils.isModalHide()){
      this.__showModal({
        modalType: MODAL_VERSION,
        modalProps: {
          callback: this.forceUpdate
        }
      });
    }
  }

  handleCheckVersion = ()=>{
    const updateType=utils.getUpdateType();
    switch (updateType){
      case 'force':
        this.forceUpdate();
        break;
      case 'optional':
        this.optionalUpdate();
        break;
    }
  }

  checkVersion = async()=>{
    const appVersionResponse= await getAppVersion();
    if(appVersionResponse && appVersionResponse.appVersion && pkg.version){
      const minimunVersionRequired = utils.appVersionToNumber(utils.getMinimumVersionRequired());
      const lastVersionRequired = utils.appVersionToNumber(utils.getLastVersionRequired());
      let appVersionReact=utils.appVersionToNumber(pkg.version);
      let appVersionMiddleware=utils.appVersionToNumber(appVersionResponse.appVersion);
      console.log('[AppVersionStatus] check version',appVersionMiddleware,' vs ',appVersionReact);
      if(appVersionReact && appVersionMiddleware && appVersionMiddleware>appVersionReact){
        if(appVersionReact < minimunVersionRequired ){
          console.log('[AppVersionStatus] check version minimunVersionRequired ',minimunVersionRequired,' vs appVersionReact ',appVersionReact);
          this.forceUpdate();
        }else if(appVersionReact < lastVersionRequired){
          console.log('[AppVersionStatus] check version lastVersionRequired ',lastVersionRequired,' vs appVersionReact ',appVersionReact);
          this.optionalUpdate();
        }
      }
    }
  }

  startCheckVersion = ()=>{
    //this.__checkerID= setInterval(this.checkVersion,this.__checkerInterval*60000);
  }

}

export default AppVersionStatus;
