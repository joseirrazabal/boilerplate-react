import Badges from './../requests/apa/Badges';
import getAppConfig from './../config/appConfig';
import storage from './../components/DeviceStorage/DeviceStorage';

function getRegion(deviceName) {
  const region =  storage.getItem("region") ;

  return Badges.data[region] ? region : 'default';
}

function getUserType(isLoggedIn, isSusc) {
  let userType = 'anonymous';

  if (isLoggedIn) {
    userType = isSusc ? 'susc' : 'no_susc';
  }

  return userType;
}

function getBadges(user, provider, format_types, live_enabled) {
  if (!user || typeof provider === 'undefined' || typeof  format_types === 'undefined' || typeof live_enabled === 'undefined') {
    return '';
  }

  let badges = '';
  const config = getAppConfig();
  const userType = getUserType(user.isLoggedIn, user.isSusc);
  const region = getRegion(config.device_name);
  const formatTypes = (typeof format_types === 'object') ? format_types : format_types.split(',');
  const type = live_enabled === '1' ? 'live' : 'vod';

  if (provider === 'AMCO') {
    provider = 'default';
  }

  if (Badges.data[region]
    && Badges.data[region][userType]
    && Badges.data[region][userType][provider]
  ) {
    for (let i = 0; i < formatTypes.length; i++) {
      if (Badges.data[region][userType][provider][formatTypes[i]]
        && Badges.data[region][userType][provider][formatTypes[i]][type]
      ) {
        const data = Badges.data[region][userType][provider][formatTypes[i]][type];
        for (let i = 0; i < data.length; i++) {
          badges += data[i].render;
        }
      }
    }
  }

  return badges;
}

export default getBadges;
