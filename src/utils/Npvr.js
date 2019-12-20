import RequestManager from './../requests/RequestManager';
import ListNpvrTask from './../requests/tasks/npvr/ListNpvrTask';
import AddNpvrTask from './../requests/tasks/npvr/AddNpvrTask';
import RemoveNpvrTask from './../requests/tasks/npvr/RemoveNpvrTask';
import SeriesListNpvrTask from '../requests/tasks/npvr/SeriesListNpvrTask';
import DeviceStorage from '../components/DeviceStorage/DeviceStorage';
import ChannelsSingleton from '../components/Epg/ChannelsSingleton';
import store from '../store';
import { showNotification } from '../actions/notification';
import Translator from './../requests/apa/Translator';
import ListNpvrFromUrlTask from "../requests/tasks/npvr/ListNpvrFromUrlTask";

async function list(user_token) {

  let response = {};
  try {
    const listNpvrTask = new ListNpvrTask({ user_token: user_token });
    response = await RequestManager.addRequest(listNpvrTask);
  } catch (err) {
    console.error("Error calling npvr list: ", err);
  }

  return new Promise((resolve, reject) => {
    if (response.status === 200) {
      resolve(response.response);
    } else {
      reject(response);
    }
  });
}

async function listFromUrl(user_token,url) {
  let response = {};
  try {
    const listNpvrTask = new ListNpvrFromUrlTask({ user_token: user_token},url);
    response = await RequestManager.addRequest(listNpvrTask);
  } catch (err) {
    console.error("Error calling npvr list: ", err);
  }

  return new Promise((resolve, reject) => {
    if (response.status === 200) {
      resolve(response.response);
    } else {
      reject(response);
    }
  });
}

async function getEventsRecorded(userToken = null) {
  let recordings = [];
  try {
    const listResponse = await list(userToken);
    recordings = listResponse.recordings;
  } catch (error) {
    console.log('Npvr error on getEventsRecorded getting list', error);
  }
  return new Promise((resolve, reject) => {
    const result = recordings.reduce((records, record) => {
      //|| record.status == 'scheduled'
      if (record.status == 'ingested') {
        records.push(record.channel.event.id)
      }
      return records;
    }, []);
    resolve(result);
  });
}

function getEventsBeenRecording() {
  const saved = DeviceStorage.getItem('recordings');
  return saved ? JSON.parse(saved) : {};
}

const setData = (instance, userToken) => {
  return new Promise((resolve, reject) => {
    instance._eventsRecording = getEventsBeenRecording();
    getEventsRecorded(userToken).then((recordings => {
      instance._eventsRecorded = recordings;
      resolve(instance);
    }));
  });
}

const init = (instance, userToken) => {
  instance._eventsRecorded = [];
  instance._eventsRecording = {};
  instance._userToken = userToken;
  setData(instance, userToken);
}

let instance = null;
export class RecordingSingleton {

  constructor(user) {
    if (!instance) {
      init(this, user && user.user_token ? user.user_token : null);
      instance = this;
    }
    return instance;
  }

  refresh() {
    return new Promise((resolve, reject) => {
      setData(this, this._userToken).then(() => resolve(this));
    });
  }

  getEventsRecorded() {
    return [...this._eventsRecorded];
  }

  getEventsBeenRecording() {
    return { ...this._eventsRecording };
  }
}

class Npvr {

  constructor() {
    this.singleton = new RecordingSingleton();
  }

  async add(user, event_id, channel_id, group_id) {
    let response = {};
    const notificationProps = {
      show: true,
      title: Translator.get('recording_started', '¡Grabando!'),
      msg: Translator.get('recording_notification_started', 'Este programa será agregado a tu sección de Mis grabaciones'),
      apaAsset: 'player_controls_recording_icon',
      type:'message',
    };

    if (!user || user.isAnonymous) {
      notificationProps.title = Translator.get('recording_error', '¡Error!');
      notificationProps.msg = Translator.get('recording_error_user', 'Verifica que estés logueado');
      notificationProps.type='message';
      return store.dispatch(showNotification(notificationProps));
    }

    try {
      //const addNpvrTask = new AddNpvrTask({ user_token: user.user_token, event_id: '249435554', channel_id: '997' });
      const payway_token = await new ChannelsSingleton().getPaywayToken(group_id);
      console.log('dan: paywayToken: ', payway_token);
      const addNpvrTask = new AddNpvrTask({ user_token: user.user_token, event_id, channel_id, payway_token });
      response = await RequestManager.addRequest(addNpvrTask);
    } catch (err) {
      response = err;
    }

    return new Promise((resolve, reject) => {
      if (response.status === 200 && response.response && response.response.success) {
        const savedRecordings = this.singleton.getEventsBeenRecording();
        const newEvent = { [`${event_id}`]: { channelId: channel_id } };
        const newRecords = { ...savedRecordings, ...newEvent };
        DeviceStorage.setItem('recordings', JSON.stringify(newRecords));
        resolve({eventStatus:'recording',recording_id:response.response.record_id});
      }else {
        if((response.code&&response.code!==undefined)&&response.code==='PLY_REC_00014'){ 
          notificationProps.title = Translator.get('recording_error', '¡Error!'); 
          notificationProps.msg = Translator.get('recording_notification_limit', 'Se superó el límite de grabación'); 
          notificationProps.type = 'message'; 
          resolve({eventStatus:null,recording_id:null}); 
        }else{
          notificationProps.title = Translator.get('recording_error', '¡Error!');
          notificationProps.msg = Translator.get('recording_notification_error', 'Hubo un error en la grabación, intenta nuevamente');
          notificationProps.type = 'message';
          resolve({eventStatus:null,recording_id:null});
        }
        
      }
      store.dispatch(showNotification(notificationProps));
    });
  }

  async remove(user_token, record_id, event_id) {
    console.error('edc:Npvr.remove', user_token, record_id);

    let response;

    try {
      const removeNpvrTask = new RemoveNpvrTask({ user_token, record_id });
      response = await RequestManager.addRequest(removeNpvrTask);
    } catch (err) {
      console.error("Error calling npvr remove: ", err);
    }

    return new Promise((resolve, reject) => {
      if (response.status === 200) {
        const savedRecordings = getEventsBeenRecording();
        if(savedRecordings[event_id]){
          delete savedRecordings[event_id];
          DeviceStorage.setItem('recordings', JSON.stringify(savedRecordings));
        }
        resolve(response.response);
      } else {
        reject(response);
      }
    });
  }

  async list(user_token) {
    return list(user_token);
  }

  async listFromUrl(user_toker,url){
    return listFromUrl(user_toker,url);
  }

  async seriesList({userToken, serieId, seasonId, groupId, language}) {
    let result = {};
    try {
      const seriesListNpvrTask = new SeriesListNpvrTask({userToken, serieId, seasonId, groupId, language});
      result = await RequestManager.addRequest(seriesListNpvrTask);
      return result.status === 200 ? Promise.resolve(result.response) : Promise.reject({});
    } catch (err) {
      console.error("Error calling npvr series list: ", err);
      return Promise.reject({});
    }
  }

  getEventStatus(eventId = null) {
    const localRecordings = getEventsBeenRecording();
    if (localRecordings[eventId]) {
      return 'recording';
    } else {
      const recorded = this.singleton.getEventsRecorded();
      const event = recorded.find(e => e == eventId);
      if (event) {
        return 'recorded';
      } else {
        return null;
      }
    }
  }

  async notificationHandler() {
    this.singleton.refresh().then((singleton) => {
      const recordings = singleton.getEventsRecorded();
      const localRecordings = singleton.getEventsBeenRecording();
      const toNotify = [];
      let newLocalRecordings = {};
      Object.keys(localRecordings).forEach(record => {
        const ready = recordings.find(r => r == record);
        if (ready) {
          toNotify.push(record);
        } else {
          newLocalRecordings = { ...newLocalRecordings, [`${record}`]: localRecordings[record] }
        }
      });
      console.log('Npvr notification, to notify ', toNotify, ' waiting', newLocalRecordings, ' recordings', recordings);
      if (toNotify.length) {
        store.dispatch(showNotification({
          show: true,
          title: Translator.get('recording_success', '¡Grabado!'),
          msg: Translator.get('recording_notification_success', 'Se han completado {{numGrabaciones}} de tus grabaciones').replace('{{numGrabaciones}}', toNotify.length),
          apaAsset: 'player_controls_recording_icon',
          type : 'message',
        }));
      }
      DeviceStorage.setItem('recordings', JSON.stringify(newLocalRecordings));
    });
  }
}

export default Npvr;
