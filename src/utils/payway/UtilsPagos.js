import Utils from '../Utils';
import Metadata from '../../requests/apa/Metadata';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import * as constant from '../../components/Payment/constants';

class UtilsPagos {
  constructor() {

  }
  static oneClicBuyHiddeConfirm = (isOneClicFlow, key) => {
    
    if (isOneClicFlow) {
      const metadataKey = 'hidden_confirm_trans_config';
      const configurationAll = Utils.getAPARegionalized(metadataKey, 'all', false);
      const configurationHiddenList = Utils.getAPARegionalized(metadataKey, 'hidden_list', []);
      
      if (configurationAll) {
        return true;
      } else if (configurationHiddenList.includes(key)) {
        return true;
      } else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  static oneClicBuyRedirectPlayer = (isOneClicFlow, key) => {
    
    if (isOneClicFlow) {
      const metadataKey = 'purchase_flow_config';
      const configurationKey = Utils.getAPARegionalized(metadataKey, key, null);
      const configurationDefault = Utils.getAPARegionalized(metadataKey, 'default', null);
      
      if (configurationKey && configurationKey === 'player') {
        return true;
      } else if (configurationDefault && configurationDefault === 'player') {
        return true;
      } else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  static hasDocument = (gateway) => {   
    
    const region = DeviceStorage.getItem('region');

    let needId = Metadata.get('regional_parameters', '{}');
    if (needId)
      needId = JSON.parse(needId);
    if (needId && region && needId[region])
      needId = needId[region];
    if (needId && needId.is_id_needed) {
      needId = needId.is_id_needed == "true";
    }
    else {
      //Este caso solo si la llave no existe
      if (region && region === 'mexico') {
        needId = false;
      }
      else {
        needId = true;
      }
    }
    const hasDocument = gateway === constant.GETWAY_HUBFIJO 
      || (gateway === constant.GETWAY_HUB && needId);    

    return hasDocument;
  }
}

export default UtilsPagos;
