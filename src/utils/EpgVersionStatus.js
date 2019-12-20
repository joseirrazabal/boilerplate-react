
import { getEpgVersionFromService } from "../requests/loader";
import ChannelSingleton from "../components/Epg/ChannelsSingleton";
import DeviceStorage from "../components/DeviceStorage/DeviceStorage";
import Utils from "./Utils";
import Device from "../devices/device";
import Badges from "../requests/apa/Badges";
import Launcher from "../requests/apa/Launcher";
import Metadata from "../requests/apa/Metadata";
import * as loader from "../requests/loader";
import Asset from "../requests/apa/Asset";
import AAFPlayer from '../AAFPlayer/AAFPlayer';
import { AAFPLAYER_PLAY } from '../AAFPlayer/constants';
import store from '../store';
import {playFullMedia} from '../actions/playmedia';
import TvChannelUtil from "./TvChannelUtil";
import { showModal, MODAL_GENERIC } from '../actions/modal';
import Translator from "../requests/apa/Translator";

class EpgVersionStatus{
  constructor(updateApp){
    this.__updateApp = updateApp;
    this.__checkerID = null;
    this.__checkerIDLinealChannels=null
    this.__checkerInterval = parseInt(Utils.getIntervalTimeCheckEpgVersion());
    this.__checkerIntervalLinealChannels = parseInt(Utils.getIntervalTimeCheckLinealChannels());
    console.log('[EpgVersionStatus] init');
  }

  setEpgVersion = (version) => {
    console.log('[EpgVersionStatus] setEpgVersion version',version);
    if(version){
      DeviceStorage.setItem('epgVersion',version);
    }
  }

  clearHKS = () => {
      DeviceStorage.setItem('HKS',"");
      localStorage.setItem('refresh',"true");
  }

  setSoaVersion = (version) => {
    console.log('[EpgVersionStatus] setSoaVersion version',version);
    if(version){
      DeviceStorage.setItem('soaVersion',version);
    }
  }

  setAppVersionLastUpdated = (version) => {
    console.log('[EpgVersionStatus] setAppVersionLastUpdated version',version);
    if(version){
      DeviceStorage.setItem('appVersionLastUpdated',version);
    }
  }

  getAppVersionLastUpdated = () => {
    console.log('[EpgVersionStatus] getAppVersionLastUpdated');
    return DeviceStorage.getItem('appVersionLastUpdated') || null;
  }

  getEpgVersion = () => {
    console.log('[EpgVersionStatus] getEpgVersion');
    return DeviceStorage.getItem('epgVersion') || null;
  }

  getSoaVersion = () => {
    console.log('[EpgVersionStatus] getSoaVersion');
    return DeviceStorage.getItem('soaVersion') || null;
  }

  getAppVersion = () => {
    console.log('[EpgVersionStatus] getAppVersion');
    return  DeviceStorage.getItem('appVersion') || null ;
  }

  resetEpg = () => {
    console.log('[EpgVersionStatus] resetEpg');
    const cb = this.getCheckPlayingPermissionAsCb();
    new ChannelSingleton().resetData(cb);
    if(this.__updateApp.length!==0 && typeof this.__updateApp[0] === 'function'){
      console.log('[EpgVersionStatus] resetEpg __updateApp')
      this.__updateApp[0]();
    }
    
  }

  getLastChannel = () => ( (DeviceStorage.getItem('lastChannel') || null ) )

  getCheckPlayingPermissionAsCb = () => ( ()=>{ setTimeout(this.checkPlayingPermission,3000) } );

  checkPlayingPermission = () => {
    console.log('[EpgVersionStatus] checkPlayingPermission');
    if(this.isPlayingLive()){
      console.log('[EpgVersionStatus] checkPlayingPermission isPlayingLive');
      const groupId = this.getStateGroupId();
      console.log('[EpgVersionStatus] checkPlayingPermission groupId',groupId);
      if(Utils.isNotNullOrNotUndefined(groupId) && !ChannelSingleton.canPlayChannel(groupId)){
        console.log('[EpgVersionStatus] checkPlayingPermission can not Play Channel, play first channel',this.getFirstGroupId());
        this.playChannel(this.getFirstGroupId());
      }
    }
    else{
      const lastChannel = this.getLastChannel();
      console.log('[EpgVersionStatus] checkPlayingPermission lastChannel',lastChannel);
      if(Utils.isNotNullOrNotUndefined(lastChannel) && !ChannelSingleton.canPlayChannel(lastChannel)){
        console.log('[EpgVersionStatus] checkPlayingPermission can not Play Channel, set Last Channel in storage',this.getFirstGroupId());
        TvChannelUtil.setLastChannel(this.getFirstGroupId());
      }
    }
  }

  isPlayingLive = () => {
    console.log('[EpgVersionStatus] isPlayingLive function');
    const cstate = AAFPlayer.getCurrentPlayerOptions(false);
    const {playerstate, islive} = cstate;
    return (playerstate === AAFPLAYER_PLAY && islive) ? true : false;
  }

  playChannel = (groupId) =>{
    console.log('[EpgVersionStatus] playChannel groupId',groupId);
    if(Utils.isNotNullOrNotUndefined(groupId)){
      store.dispatch(playFullMedia({
        playerstate: AAFPLAYER_PLAY,
        source: {
          videoid: groupId
        },
        size: {
          top: 0,
          left: 0,
          width: 1280,
          height: 720,
        },
        ispreview: false,
        islive: true,
        ispip: false
      }));
    }
  }
  
  getStateGroupId = () => {
    const cstate = AAFPlayer.getCurrentPlayerOptions(false);
    console.log('[EpgVersionStatus] cstate',cstate);
    if(cstate){
      const {source} =  cstate;
      if(source){
        const {videoid}  = source;
        if(videoid){
          return videoid;
        }    
      }
    }  
    return null;
  }

  getFirstGroupId = () => {
    const linealChannels = store.getState().linealChannels;
    let nextGroupId = null
    if (Array.isArray(linealChannels) && linealChannels[0]) {
      nextGroupId = linealChannels[0].id;
    }
    return nextGroupId;
  }

  loadApisAgain = async () =>{
    console.log('[EpgVersionStatus] loadApisAgain');
    const [apaMetadata, apaAsset, apaLauncher, badges] = await Promise.all([
      loader.apaMetadata(),
      loader.apaAsset(),
      loader.apaLauncher(),
      loader.badges()
    ]);
    Metadata.setData(apaMetadata);
    Asset.setData(apaAsset);
    Badges.set(badges);
    if(apaLauncher) {
      let region = DeviceStorage.getItem("region");
      Device.getDevice().update_launcher(region, apaLauncher.response);
      Launcher.setData(apaLauncher.response);
    }
    return new Promise(resolve => {
      resolve();
    });
  }



  resetApp = (sessionRefresh = false) => {
    console.log('[EpgVersionStatus] resetApp');
    if(window.navigator.userAgent.toLowerCase().indexOf('stb')!==-1){
      if(sessionRefresh){
        this.clearHKS();
      }
      console.log('Stop stb player');
      window.AndroidPlayerInterface.stopFullPlayer();
      console.log('Va a reiniciar');
      fetch('http://aaf-tv.clarovideo.net/webapi-video/success-reset');
      setTimeout(window.location.replace('/'),15000);
    }
  }

  showModal(responseEpgVersion){
    const refresh = responseEpgVersion.session_refresh;
    const msg = responseEpgVersion.soa_message;
    store.dispatch(
      showModal({
        modalType: MODAL_GENERIC,
        modalProps: {
          buttons: [ 
            {
              content:Translator.get("modal_yes_btn_cancel", "SI."),
              props: {
                onClick: () => {this.resetApp(refresh)},
              }
            }
          ],
          content:Translator.get(msg,  "¿Quieres actualizar la aplicación?" ),
          withCancel:true,
        }
      })
    );
  }

  checkVersion = async () => {
    const epgVersionFromLocalStorage = this.getEpgVersion();
    let soaVersionFromLocalStorage = this.getSoaVersion();
    const appVersionFromLocalStorage = this.getAppVersion();
    const epgVersionFromService = await getEpgVersionFromService();
    const appVersionLastUpdated = this.getAppVersionLastUpdated();
    if(Utils.isNullOrUndefined(soaVersionFromLocalStorage)){
      soaVersionFromLocalStorage = "0.0.0";
    }
    console.log('[EpgVersionStatus] checkVersion epgVersionFromLocalStorage:',epgVersionFromLocalStorage,', appVersionFromLocalStorage: ',appVersionFromLocalStorage, ', soaVersionFromLocalStorage: ',soaVersionFromLocalStorage,', epgVersionFromService:',epgVersionFromService);
    if(Utils.isNotNullOrNotUndefined(epgVersionFromService) && Utils.isNotNullOrNotUndefined(epgVersionFromService.app_version)){
      const appVersionFromService = epgVersionFromService.app_version;
      const soaVersionFromService = epgVersionFromService.soa_version; 
      const sessionRefresh = epgVersionFromService.session_refresh;
      console.log('[EpgVersionStatus] checkVersion appVersionFromService',appVersionFromService);
      if(Utils.isNotNullOrNotUndefined(appVersionLastUpdated)){
        if(Utils.compareVersions(appVersionFromService,appVersionLastUpdated)){
          this.setAppVersionLastUpdated(appVersionFromService);
          this.resetApp(sessionRefresh);
        }else if(Utils.compareVersions(soaVersionFromService, soaVersionFromLocalStorage)){
          console.log('[EpgVersionStatus]',soaVersionFromService, 'es mayor que ',soaVersionFromLocalStorage);
          this.setSoaVersion(soaVersionFromService);  
          this.showModal(epgVersionFromService);         
        }
      }
      else if(Utils.isNotNullOrNotUndefined(appVersionFromLocalStorage)){
        if(Utils.compareVersions(appVersionFromService,appVersionFromLocalStorage)){
          this.setAppVersionLastUpdated(appVersionFromService);
          this.resetApp(sessionRefresh);
        }else if(Utils.compareVersions(soaVersionFromService, soaVersionFromLocalStorage)){
          console.log('[EpgVersionStatus]',soaVersionFromService, 'es mayor que ',soaVersionFromLocalStorage);
          this.setSoaVersion(soaVersionFromService); 
          this.showModal(epgVersionFromService);         
        }
      }
    }
    if(epgVersionFromLocalStorage && epgVersionFromService && epgVersionFromService.epg_version){
      console.log('[EpgVersionStatus] epgVersion comparison ',epgVersionFromLocalStorage,' vs ',epgVersionFromService.epg_version);
      if(epgVersionFromLocalStorage!=epgVersionFromService.epg_version){
        this.setEpgVersion(epgVersionFromService.epg_version)
        this.loadApisAgain().then(()=>{
          console.log('[EpgVersionStatus] resetEpg');
          this.resetEpg();
        });
      }
    }
  }

  checkLinealChannels = () => {
    console.log('[EpgVersionStatus] checkLinealChannels');
    const cb = this.getCheckPlayingPermissionAsCb();
    new ChannelSingleton().checkLinealChannels(cb);
  }

  startCheckVersion = async (cb) => {
    const epgVersionResponse = await getEpgVersionFromService();
    if(cb && typeof cb === "function") cb();
    console.log('[EpgVersionStatus] startCheckVersion epgVersionResponse',epgVersionResponse);
    if(epgVersionResponse && epgVersionResponse.epg_version){
      this.setEpgVersion(epgVersionResponse.epg_version);
    }
    this.__checkerID= setInterval(this.checkVersion, this.__checkerInterval*60000);
  }


  startCheckLinealChannels = () => {
    this.__checkerIDLinealChannels= setInterval(this.checkLinealChannels, this.__checkerIntervalLinealChannels*60000);
  }

}

export default EpgVersionStatus;
