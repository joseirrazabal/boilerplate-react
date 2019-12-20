import RequestManager from './../../requests/RequestManager';
import FiltersTask from './../../requests/tasks/epg/FiltersTask';
import LevelRibbonTask from "../../requests/tasks/cms/LevelRibbonTask";
import epgCache from "../../utils/EpgCache";
import Device from '../../devices/device';
import store from '../../store';
import ActivesSingleton from "../Header/ActivesSingleton";
import ChangeControlPinTask from '../../requests/tasks/user/ChangeControlPinTask';
import settings from '../../devices/all/settings';
import Metadata from '../../requests/apa/Metadata'
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import ChannelStreamUtil from '../../utils/ChannelStreamUtil';
import { fetchLinealChannels } from '../../actions/payway';
import LocalStorage from "../DeviceStorage/LocalStorage";
//const node = 'tv';//new ActivesSingleton().getTvNode();

const levelTvRequest = (instance, userStatus, nodeId, resolve) => {

    let nodes = JSON.parse(Metadata.get("links_nav_configuration", "{}"));
    const region = DeviceStorage.getItem("region");
    var nodoTV = (nodes[region]) ? nodes[region].clarotv : nodes['default'].clarotv;
    var isCurrentNodoTV = (nodoTV === instance.node) ? true : false;

    try {
        const level_params = {
            node:instance.node,
            user_status: userStatus,
            node_id: nodeId,
            isCurrentNodoTV: isCurrentNodoTV,
            epg_version: LocalStorage.getItem('epgVersion') || false,
            soa_version: LocalStorage.getItem('soaVersion') || false,
        };
        const task = new LevelRibbonTask('level', level_params);

        RequestManager.addRequest(task).then(response => {
            const channels = response.response.components[0].items;
            instance._channels = buildChannels(channels);
            instance.gettingData=false;
            if (resolve) resolve(instance.getChannels());
            getAllFilterData(instance);
        });
    } catch (e) {
        console.error('[ChannelsSingleton] levelTvRequest err', e);
    }
}

const buildChannels = (channels = []) => {
    return channels.map(channel => {
        if(channel.encodes && channel.encodes.length > 0) {
            // Se usa live_url, porque channel_url siempre viene en null y para no alterar esa lógica
            ChannelStreamUtil.set(channel.group_id, { encodes: channel.encodes, live_url: channel.live_url, fast_play: channel.fast_play, proveedor: channel.proveedor, background: channel.background  });
        }
        return {
            channel_url: channel.channel_url ? channel.channel_url : "tv://channel.00a0002a0002",
            cover: channel.cover,
            title: channel.title,
            group_id: channel.group_id,
            id: channel.id,
            provider: channel.provider, // Necesario para presentar modales de susc, en caso de
            timeshift: channel.timeshift ? channel.timeshift : null // en horas
        }
    });
}

const getAllFilterData = (instance) => {

    let nodes = JSON.parse(Metadata.get("links_nav_configuration", "{}"));
    const region = DeviceStorage.getItem("region");
    var nodoTV = (nodes[region]) ? nodes[region].clarotv : nodes['default'].clarotv;
    var isCurrentNodoTV = (nodoTV === instance.node) ? true : false;

    return new Promise((resolve, reject) => {
        try {
            instance._allFilterData = {};
            instance.getFilters().then(filters => {
                filters.map((filter, index) => {
                    const level_params = {
                        node:instance.node,
                        user_status: instance._userStatus,
                        node_id: filter.id,
                        isCurrentNodoTV: isCurrentNodoTV,
                        epg_version: LocalStorage.getItem('epgVersion') || false,
                        soa_version: LocalStorage.getItem('soaVersion') || false,
                    };
                    const task = new LevelRibbonTask('level', level_params);
                    RequestManager.addRequest(task).then(response => {
                        const channels = response.response.components[0].items;
                        instance._allFilterData[`${filter.id}`] = buildChannels(channels);
                        console.log('_allFilterData', instance._allFilterData);
                        if (filters.length - 1 == index) resolve(instance._allFilterData);
                    });
                });
            });
        } catch (error) {
            console.error('[ChannelsSingleton] getAllFilters err', error);
        }
    });
}

const getData = (instance, userStatus, isFilter = false, resolve) => {
  if(instance.node==null)
  {
    instance._filters = [];
    instance._channels=[];
    resolve?resolve([]):null;
    instance.gettingData=false;
    return
  }

    if(instance.gettingData)
          return
    instance.gettingData=true;


    try {
        const task = new FiltersTask({

        });
        console.log('[EPG] -- ChannelSingleton -- ');
        RequestManager.addRequest(task).then(response => {
            let filters = response.response.nodes;
            console.log('[EPG] -- ChannelSingleton -- filters ',filters);

            // const fakefilter = {
            //   "entry": {
            //     "format": "json",
            //     "api_version": "5.82",
            //     "authpn": "amco",
            //     "authpt": "12e4i8l6a581a",
            //     "device_category": "web",
            //     "device_manufacturer": "windows",
            //     "device_model": "html5",
            //     "device_type": "html5",
            //     "region": "brasil",
            //     "type": "epg",
            //     "tenant_code": "netnow"
            //   },
            //   "response": {
            //     "nodes": [
            //       {
            //         "id": "54317",
            //         "id_parent": "47426",
            //         "code": "nx_epg_todos",
            //         "text": "Todos",
            //         "menu_id": "2105",
            //         "image": null,
            //         "image_over": null,
            //         "level": 1,
            //         "type": "dest",
            //         "order": "1",
            //         "status": "1",
            //         "app_behaviour": null,
            //         "re-ordenable": false
            //       }
            //     ]
            //   },
            //   "status": "0",
            //   "msg": "OK"
            // }
            // console.log('[EPG] -- ChannelSingleton -- fakefilters ',fakefilter);
            // filters=fakefilter.response.nodes;


            let defaultNodeId = null;
            instance._filters = [];
            if (filters) {
                instance._filters = filters.map(filter => {
                    return {
                        id: filter.id,
                        code: filter.code,
                        text: filter.text
                    }
                });
                if (resolve && isFilter) resolve(instance.getFilters());
                defaultNodeId = instance._filters[0].id
            }

            levelTvRequest(instance, userStatus, defaultNodeId, resolve);
        });
    } catch (e) {
        console.error('[ChannelsSingleton] getData err', e);
    }

}

const init = (instance, userStatus,nodes) => {
    instance._filters = null;
    instance._channels = null;
    instance._userStatus = userStatus;
    instance._allFilterData = {};
    instance.node=new ActivesSingleton().getTvNode();

    let navV=Metadata.get('nav_visibility','{}');
    navV=JSON.parse(navV);
    navV=navV.filter(x=>x.code==instance.node && x[userStatus]=='0');
    //TODO necesitamos una mejor forma de de ahcer esto
    nodes=nodes.filter(x=>x.code==instance.node);
    if(navV.length>0)
    {
      instance.node=null;
    }

     instance.getChannels=instance.getChannels.bind(instance);

}

let instance = null;
class ChannelSingleton {

    constructor(user,nodes=[]) {
        if (!instance) {
          init(this,user.userStatus,nodes);
            instance = this;
            getData(instance, user.userStatus);


            const region = DeviceStorage.getItem('region');
            //let channel_settings = Metadata.get('channel_settings', '{"mexicos": {"time_refresh": 30},"argentina": {"time_refresh": 30},"default": {"time_refresh": 30,"otrallave": 12,"mas llaves": 50}}');
            let channel_settings = Metadata.get('channel_settings', '{}');
            channel_settings = JSON.parse(channel_settings);
            let refreshSeconds = 3600;

            if (channel_settings && (channel_settings['default'] || channel_settings[region])) {
              if (channel_settings[region] && channel_settings[region].time_refresh) {
                refreshSeconds = channel_settings[region].time_refresh;
              }
              else if (channel_settings['default'] && channel_settings['default'].time_refresh) {
                refreshSeconds = channel_settings['default'].time_refresh;
              }
            }

            setInterval(() => {
              getData(this, user.userStatus);
            }, refreshSeconds * 1000);

        }
        return instance;
    }

    static hasTimeshiftAPA() {
        let ret_region = false;
        let timeshift_npvr_configuration = Metadata.get('timeshift_npvr_configuration');
        //let timeshift_npvr_configuration ='{"default": {"timeshift": {"enable": true},"vcard_past_epg_event": {"enable": true},"npvr_button_record": {"enable": true}},"argentina": {"timeshift": {"enable": false},"vcard_past_epg_event": {"enable": true},"npvr_button_record": {"enable": true}}}';
        if (timeshift_npvr_configuration != 'timeshift_npvr_configuration') {
        //if (true) {
            timeshift_npvr_configuration = JSON.parse(timeshift_npvr_configuration);
            let region = DeviceStorage.getItem('region');
            let tocheck = null;
            if(timeshift_npvr_configuration) {
                if(timeshift_npvr_configuration[region]) {
                    tocheck = timeshift_npvr_configuration[region];
                }
                if(tocheck === null) {
                    if(timeshift_npvr_configuration['default']) {
                        tocheck = timeshift_npvr_configuration['default'];
                    }
                }
                if(tocheck !== null) {
                    if(tocheck && tocheck['timeshift']) {
                        ret_region = tocheck['timeshift'].enable;
                    }
                }
            }
        }

        return ret_region;
    }

    static getTimeshift(channelId, inSeconds = false) {
        // Verificar aquí si de inicio, esta metadata con timeshift habilitado

        //Se comenta solo para habilitar timeshift siempre, no tomando en cuenta la configuracion de APA

        // TODO: Descomentar el IF para que funcione la configuracion de APA
        if(!ChannelSingleton.hasTimeshiftAPA()) {
          return 0;
        }

        const linealChannels = store.getState().linealChannels;
        if (Array.isArray(linealChannels)) {
            const channel = linealChannels.find(channel => channel.id == channelId);
            let timeshift = channel ? parseInt(channel.timeshift) : null;
            if(isNaN(timeshift)) {
                timeshift = 0;
            }

            //console.log('[STARTIME TIMESHIFT] ChannelSingleton.getTimeshift timeshift de linnealChannels ', timeshift);

            let opts = [];
            opts.push(timeshift);
            // En content/list, hay channels?
            let resultInMins = 0;
            if(instance._channels && (Array.isArray(instance._channels))) {
                const channelContentList = instance._channels.find(channel => channel.group_id == channelId);
                if(channelContentList) {

                    const timeshiftContentList = channelContentList.timeshift ? channelContentList.timeshift : 0;
                    //console.log('[STARTIME TIMESHIFT] ChannelSingleton.getTimeshift timeshift de timeshiftContentList ', timeshiftContentList);
                    opts.push(timeshiftContentList);
                    resultInMins = opts.reduce((x, y) => {
                        return ( x < y ? x : y );
                    });
                    resultInMins = resultInMins * 60;
                }
            }
            else {
                // Default es lineal channels
                resultInMins = !isNaN(timeshift) ? timeshift * 60 : 0;
                //console.log('[STARTIME TIMESHIFT] entra en singleton ', resultInMins);
            }

            //console.error('[ChannelsSingleton] getTimeshift ', channelId, 'result: ', channel, 'timeshift ', timeshift, 'linealChannels', linealChannels, 'return in min', !isNaN(timeshift) ? timeshift * 60 : 0);
            /*
            console.info('[ChannelsSingleton] getTimeshift ', channelId,
              '\nresult: ', channel,
              '\ntimeshift ', timeshift,
              //'\nlinealChannels', linealChannels,
              '\nreturn in min', resultInMins);
              */
            return inSeconds ? 60 * resultInMins : resultInMins;
        }
        return 0;
    }

  static getNpvrStorage(channelId) {
    const linealChannels = store.getState().linealChannels;
    if (Array.isArray(linealChannels)) {
      const channel = linealChannels.find(channel => channel.id == channelId);
      this.getMaxNpvrStorage();
      const npvrStorage = channel ? parseInt(channel.npvrstorage) : null;
      console.error('RDGV: getTimeshift ', channelId, 'result: ', channel, 'npvrStorage ', npvrStorage, 'linealChannels', linealChannels, 'return in min', !isNaN(npvrStorage) ? npvrStorage * 60 : 0);
      const resultInMins = !isNaN(npvrStorage) ? npvrStorage * 60 : 0;
      return resultInMins;
    }
    return 0;
  }

  static getMaxNpvrStorage(){
    const linealChannels = store.getState().linealChannels;
    let npvrStorageInMinutes=0;
    if (Array.isArray(linealChannels)) {
      const channelsWithNpvrStorage= linealChannels.filter(channel=>channel.npvrstorage!="")
      if(channelsWithNpvrStorage.length!=0){
        const maxNpvrStorage= linealChannels.reduce((prev,current)=>(prev.npvrstorage> current.npvrstorage)? prev: current).npvrstorage;
        npvrStorageInMinutes=!isNaN(maxNpvrStorage) ? maxNpvrStorage * 60 : 0;
      }

    }
    return npvrStorageInMinutes;
  }

    /*
        Revisar si un user tiene la suscripción al canal del group_id indicado
    */
    static canPlayChannel(group_id) {
        let channel = null;
        const linealChannels = store.getState().linealChannels;
        if (Array.isArray(linealChannels)) {
            channel = linealChannels.find(tchannel => tchannel.id === group_id);
        }
        return channel && channel.play ? channel : false;
    }

  getFiltersTO(resolve) {
    // console.log('[ChannelsSingleton] getFilters');
    setTimeout(((resolve) => {
      if (this.gettingData)
        this.getFiltersTO(resolve)
      else {
        // console.log('[ChannelsSingleton] getFilters');
        resolve([...this._filters])
      }
    }).bind(this), 500,resolve);
  }

    getFilters() {
        return new Promise(((resolve, reject) => {
            if (this._filters) {
                resolve([...this._filters]);
            } else {
              this.getFiltersTO(resolve)
            }
        }).bind(this))
    }

    getChannelTO(resolve) {
      // console.log('[ChannelsSingleton] getChannelTO');
      setTimeout(((resolve) => {
        if (this.gettingData)
          this.getChannelTO(resolve)
        else {
          // console.log('[ChannelsSingleton] getChannelTO resolve');
          resolve([...this._channels])
        }
      }).bind(this), 500,resolve);
    }

  getChannelsNow() {
    return this._channels;
  }

  getChannelByGroupIdNow(groupId) {
    if (!this._channels) {
      return null;
    }
    const index = this.getChannelsNow().findIndex((data) => data.group_id == groupId);

    if (index == -1) {
      return null;
    }

    return this.getChannelsNow()[index];
  }

    getChannels() {
        // console.log('[ChannelsSingleton] getChannels');
        return new Promise(((resolve, reject) => {
            if (this._channels) {
                resolve([...this._channels]);
            } else {
              this.getChannelTO(resolve);
            }
        }).bind(this))
    }

    getFilteredChannelsByNode(nodeId) {
        if(this._allFilterData) {
            return this._allFilterData[nodeId];
        }
        return null;
    }

    getFilteredChannels(nodeId) {
        return new Promise((resolve, reject) => {
            if (this._allFilterData) {
                //console.log('[EPGFILTER] Singleton getFilteredChannels hay data ', this._allFilterData, nodeId);
                return resolve([...this._allFilterData[nodeId]]);
            } else {
                //console.log('[EPGFILTER] Singleton getFilteredChannels NO hay data');
                return getAllFilterData(this).then(() => { return resolve([...this._allFilterData[nodeId]]); });
            }
        });
    }

    getMaxTimeshift() {
        return new Promise((resolve, reject) => {
            this.getChannels().then(channels => {
                let maxTimeshift = 0;
                channels.forEach(ch => {
                    const timeshift = ChannelSingleton.getTimeshift(ch.group_id);
                    if (timeshift > maxTimeshift) maxTimeshift = timeshift;
                });
                resolve(maxTimeshift*60);
            });
        });
    }

    getChannelByGroupId = async channelId => {
      try {
        const channels = await this.getChannels();
        console.log('dan 2: channel', channels, channelId);
        const channel = channels.find(channel => channel.group_id == channelId);
        console.log('dan 2: channel', channels, channelId);
        return Promise.resolve(channel);
      } catch (e) {
        console.error('[ChannelSingleton] could not getChannel by id: ', channelId);
        return Promise.reject({});
      }
    };

    getTimeshiftToken = async channelId => {
        console.log('dan 1: channel', channelId);
      const channel = await this.getChannelByGroupId(channelId);
      const linealChannels = store.getState().linealChannels;
      console.log('dan: linealChannels', linealChannels);
      console.log('dan: channel', channel);
      if (Array.isArray(linealChannels)) {
        const linealChannel = linealChannels.find(linealChannel => linealChannel.id == channel.group_id);
        console.log('dan: linealChannel', linealChannel);
        const paywayToken = linealChannel ? linealChannel.timeshift_token : '';
        return Promise.resolve(paywayToken);
      }
      return Promise.resolve('');
    };

    getPaywayToken = async channelId => {
        console.log('dan 1: channel', channelId);
      const channel = await this.getChannelByGroupId(channelId);
      const linealChannels = store.getState().linealChannels;
      console.log('dan: linealChannels', linealChannels);
      console.log('dan: channel', channel);
      if (Array.isArray(linealChannels)) {
        const linealChannel = linealChannels.find(linealChannel => linealChannel.id == channel.group_id);
        console.log('dan: linealChannel', linealChannel);
        const paywayToken = linealChannel ? linealChannel.npvr_token : '';
        return Promise.resolve(paywayToken);
      }
      return Promise.resolve('');
    };

    /*
    Devuelve un array de canales que puede playear el usuario (registrado, anónimo, suscrito, linealchannels-based)
    */
    static getUserChannels() {
      let userChannels = [];
      const linealChannels = store.getState().linealChannels;
      if (Array.isArray(linealChannels)) {
        userChannels = linealChannels.filter( channel => channel.play);
      }

      return userChannels;
    }

    resetData = (cb = null) =>{
      const user = store.getState().user;
      console.log('[ChannelSingleton] resetData user',user);
      getData(instance, user.userStatus);
      store.dispatch(fetchLinealChannels(user.user_id, cb));

      if (settings.epg_cache_enabled) {
        epgCache.clear();
      }
    }

    checkLinealChannels = (cb ) => {
        const user = store.getState().user;
        store.dispatch(fetchLinealChannels(user.user_id, cb));
    }
}

export default ChannelSingleton;
