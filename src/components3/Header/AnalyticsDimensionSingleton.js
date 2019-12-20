import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import getAppConfig from '../../config/appConfig';
import Utils from '../../utils/Utils';
import Device from "../../devices/device";
import pkg from '../../../package.json'

let instance= null;
class AnalyticsDimensionSingleton{
  constructor(user){
    if(!instance)
      instance=this;
    this.user=user;
    return instance;
  }

  setUser(user){
    this.user=user;
  }

  getPayload(){
    let userType;
    if(this.user!==undefined){
      switch (this.user.userStatus){
        case 'susc':
          userType='Suscrito';
          break;
        case 'no_susc':
          userType='Registrado';
          break;
        default:
          userType='Anonimo';
      }
      if(userType!=='Anonimo' && typeof this.user.subscriptions!=='undefined'){
        const paywayProfileExists=(this.user.paywayProfile && this.user.paywayProfile.subscriptions && Array.isArray(this.user.paywayProfile.subscriptions));
        if(paywayProfileExists){
          if(this.user.paywayProfile.subscriptions.filter(item=>item.key==='Telmexmexico_abono_FOX_PLUS').length!==0){
            userType+='+foxplus';
          }
          else if(this.user.subscriptions.FOX)
            userType+='+fox';
        }
        if(this.user.subscriptions.HBO)
          userType+='+hbo';
        if(this.user.subscriptions.NOGGIN)
          userType+='+noggin';
        if(this.user.subscriptions.CRACKLE)
          userType+='+crackle';
      }
    }

    const region = Utils.getAbbreviation(DeviceStorage.getItem("region"));
    let pageType=window.location.toString();
    return {
      hitType: 'pageview',
      page:pageType,
      dimension1:region,
      dimension2: getAppConfig().UniqueID,
      dimension3: typeof this.user!=='undefined'? typeof this.user.user_id !== 'undefined' ? this.user.user_id : "" : "",
      dimension5: userType,
      dimension6: this.getDimesion6(),
      dimension7: typeof pkg.version!=='undefined'? pkg.version : 'v0',
      dimension8: `${getAppConfig().device_manufacturer} ${getAppConfig().device_model}`,
    };
  }


  getDimesion6(){
    const deviceCategory= getAppConfig().device_category;
    if(deviceCategory === 'stb' && getAppConfig().device_manufacturer === 'nagra' )
      return 'nagra';
    else if(deviceCategory === 'stb')
      return 'coship';
    else if(deviceCategory === 'tv')
      return 'stv';
    else if(deviceCategory === 'console')
      return 'ps4'
    else return deviceCategory;

  }

}

export default AnalyticsDimensionSingleton;
