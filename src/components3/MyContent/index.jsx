import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import m from 'moment';

import RequestManager from "../../requests/RequestManager";
import Ribbon from '../../components/Ribbon';
import Scrollable from '../../components/Scrollable';
import MyRecordings, {EmptyContent} from "../../components/MyContent/MyRecordings";
import LevelUserRibbonTask from './../../requests/tasks/cms/LevelUserTask';
import Translator from "../../requests/apa/Translator";
import Npvr from "../../utils/Npvr";
import ChannelSingleton from "../../components/Epg/ChannelsSingleton";
import Metadata from "../../requests/apa/Metadata";
import Device from "../../devices/device";
import {HIDE_MODAL, MODAL_ACCIONES_CONTENIDO, MODAL_EPG} from "../../actions/modal";
import store from "../../store";
import LocalStorage from "../DeviceStorage/LocalStorage";

import RibbonsUtil from "../../utils/RibbonsUtil";
import Utils from '../../utils/Utils';
import LayersControl from "../../utils/LayersControl";

class MyContent extends Component {
  state = {
    isLoading:true,
    ribbons:[],
  };

  lastKey = null;
  isKeysBloqued = false;
  delayKeyTime = 50;
  handleDelayKeyOkTimer=null;
  handleDelayKeyOkSafeTime=1000;
  lastElement=null

  componentWillReceiveProps(next_props){
    const ribbons= this.props.ribbonsUser.length>0?this.props.ribbonsUser:next_props.ribbonsUser.length>0?next_props.ribbonsUser:[]
    if(ribbons.length>0){
      this.getRibbons(ribbons);
    }
  }

  componentDidUpdate() {
    window.SpatialNavigation.focus('.ribbon-items .focusable');
  }

  getRibbons = async  (ribbonsUser)=>{
    ribbonsUser.map(it=>{
      it.showFooter=true;
      it.title=it.id.replace("-"," ").replace("-"," ");
      return it;
    });
    const ribbons= await this.getRibbonsItems(ribbonsUser);
    this.setState({
      ribbons:ribbons,isLoading:false
    });
  }

  getRibbonsItems=async(ribbons)=>{
    for(let i=0;i <ribbons.length; i++){
      const items =  await this.getUserRecordingsFromUrl(ribbons[i].url);
      ribbons[i].items=items;
    }
    return ribbons;
  }



  getUserRecordingsFromUrl = async (url) => {
    const isRecordingsEnabled = Metadata.get('recordings_enabled', 'true') === 'true';
    if (isRecordingsEnabled) {
      try {
        const {user_token} = this.props.user;
        const result = await new Npvr().listFromUrl(user_token, url);
        const recordings = result && result.recordings || [];
        const {time_used: timeUsed} = result;
        const myRecordings = recordings.map((record) => {
          const {channel, pack_id: packId, actions, status, date} = record;
          const {event} = channel;
          const title = event.name;
          const group_id = event.group_id;
          //const isSeries = event.ext_series_id != 0;
          const isSeries = false;
          const dateOfRecord = m(date, 'YYYY-MM-DDThh:mm:ssZ').format('dddd DD/MM/YYYY [a las] hh:mm[hs.]');
          return {
            group_id: group_id,
            cover: channel.event.ext_eventimage_name.replace('https://', 'http://'),
            title,
            description: event.description,
            node: 'myRecords',
            record_id: record.record_id,
            status,
            label: this.getRecordStatusLabel(status),
            actions,
            used: typeof timeUsed[packId] === 'number' ? timeUsed[packId] : 0, // minutes,
            limit:ChannelSingleton.getMaxNpvrStorage(), //ChannelSingleton.getNpvrStorage(channel.group_id),
            isRecord: true,
            dateOfRecord: isSeries ? null : dateOfRecord,
            isSeries, //alcance de serie todavia no para esta version
            isRecording: status === 'recording',

            clickHandler: (e) => {
              isSeries
                ? this.handleRecordingSeries({title, event, timeUsed})
                : this.props.handleRecordingPlay(group_id, title, actions);
            }
          };
        });

        return myRecordings;
      } catch (e) {
        console.error('Error getting recordings/list', e);
        return [];
      }
    } else {
      return [];
    }
  };


  getUserRecordings = async () => {
    const isRecordingsEnabled = Metadata.get('recordings_enabled', 'true') === 'true';
    if (isRecordingsEnabled) {
      try {
        const {user_token, session_userhash} = this.props.user;
        const result = await new Npvr().list(user_token, session_userhash);
        const recordings = result && result.recordings || [];
        const {time_used: timeUsed} = result;
        const myRecordings = recordings.map((record) => {
          const {channel, pack_id: packId, actions, status, date} = record;
          const {event} = channel;
          const title = event.name;
          const group_id = event.group_id;
          //const isSeries = event.ext_series_id != 0;
          const isSeries = false;
          const dateOfRecord = m(date, 'YYYY-MM-DDThh:mm:ssZ').format('dddd DD/MM/YYYY [a las] hh:mm[hs.]');
          return {
            group_id: group_id,
            cover: channel.image.replace('https://', 'http://'),
            title,
            description: event.description,
            node: 'myRecords',
            record_id: record.record_id,
            status,
            label: this.getRecordStatusLabel(status),
            actions,
            used: typeof timeUsed[packId] === 'number' ? timeUsed[packId] : 0, // minutes,
            limit:ChannelSingleton.getMaxNpvrStorage(), //ChannelSingleton.getNpvrStorage(channel.group_id),
            isRecord: true,
            dateOfRecord: isSeries ? null : dateOfRecord,
            isSeries, //alcance de serie todavia no para esta version
            isRecording: status === 'recording',

            clickHandler: (e) => {
              isSeries
                ? this.handleRecordingSeries({title, event, timeUsed})
                : this.props.handleRecordingPlay(group_id, title, actions);
            }
          };
        });

        return Promise.resolve(myRecordings);
      } catch (e) {
        console.error('Error getting recordings/list', e);
        return Promise.reject([]);
      }
    } else {
      return Promise.resolve([]);
    }
  };

  getRecordStatusLabel = recordStatus => {
    switch(recordStatus) {
      case 'recording':
        return Translator.get('my_recordings_status_recording', 'Grabando');
      case 'ingested':
        return Translator.get('my_recordings_status_ingested', 'Listo');
      case 'scheduled':
      default:
        return Translator.get('my_recordings_status_scheduled', 'Pendiente');
    }
  };

  handleRecordingSeries = async ({title, event, timeUsed}) => {
    const {
      group_id: groupId,
      ext_series_id: serieId,
      ext_season_id: seasonId,
      language
    } = event;
    const userToken = this.props.user.user_token;
    const result = await new Npvr().seriesList({userToken, serieId, seasonId, groupId, language});
    console.log('dan: ', result);
    this.props.history.push(`${this.props.match.url}/series`, {
      title,
      timeUsed,
      series: result.recordings,
    });
  };

  handleDelayKeyOk(e, key, cb,cardData,cb2) {
    console.log(
      "[EpgLogic] handleDelayKey",
      this.isKeysBloqued,
      e.keyCode,
      key
    );
    if (this.lastKey !== key && this.pressTimer) {
      clearTimeout(this.pressTimer);
    }

    this.isKeysBloqued = !!(this.lastKey === key && this.pressTimer);
    this.lastKey = key;
    if (this.isKeysBloqued) {
      e.stopPropagation();
      e.preventDefault();
      if ('function'=== typeof cb)
        cb(cardData,cb2);
    } else {
      this.pressTimer = setTimeout(this.resetTimer, this.delayKeyTime);
    }
  }

  hideModal = () => {
    store.dispatch({
      type: HIDE_MODAL,
      modalType: MODAL_ACCIONES_CONTENIDO
    });
  }

  yellowAction=(cardData,cb=null)=>{
    if('function' === typeof cb)
      cb();
    const showModal = this.props.showModal;
    const modal = document.getElementsByClassName('modal-overlay');
    if (modal.length === 0) {
      this.lastElement=document.activeElement;
      showModal({
        modalType: MODAL_ACCIONES_CONTENIDO,
        modalProps: {
          playContent:() => {
            if(!this.handleDelayKeyOkTimer){
              this.locationHandler(cardData.group_id)
              this.hideModal();
            }
          },
          playButtonVisible:true,
          myContentDeleteHandler: () =>{
            this.props.handleFavoriteDelete(cardData.group_id, cardData.type).then(() =>{
              Utils.sleep(1).then(() => { this.updateUserRibbons() });
            });

          },
          title:'Eliminar contenido favorito',
          content:'¿Estás seguro de deseas eliminar este contenido de favoritos?',
        }
      });
    }
  }

  setHandleDelayKeyOkTimer=()=>{
    this.handleDelayKeyOkTimer = setTimeout(()=>{
      clearTimeout(this.handleDelayKeyOkTimer);
      this.handleDelayKeyOkTimer=null;
    },this.handleDelayKeyOkSafeTime);
  }


  handleKeyPress = (e, cardData) => {
    if (e && e.keyCode) {
      const keys = Device.getDevice().getKeys();
      const key = keys.getPressKey(e.keyCode);

      switch (key) {
        case 'YELLOW':
          e.preventDefault();
          e.stopPropagation();
          this.yellowAction(cardData);
          break;
        case 'OK':
          if(!this.handleDelayKeyOkTimer && LocalStorage.getItem('config_remote_control')==='simple')
            this.handleDelayKeyOk(e, key, this.yellowAction,cardData, this.setHandleDelayKeyOkTimer)
          break;
      }
    }
  };



  setResumeData=(cardData,cb)=>{
    cardData.showActionBtns=false;
    cardData.playButton=false;
    cardData.langButton=false;
    cardData.favouriteButton=false;
    cardData.purchaseButtonInfo=null;
    cardData.overWrite=true;
    this.props.setResumeData(cardData);
    if(typeof cb==='function' && cardData.status=='ingested'){
      cb(cardData);
    }
  }

  ribbonsHasItems=(ribbons)=>{
    return !Array.isArray(ribbons) || ribbons.length===0 ? false : ribbons.filter(it=>it.items.length>0).length>0? true : false;
  }



  render() {
    const {ribbons}=this.state;
    return (
      <Scrollable height={'510px'}>
        {
          this.ribbonsHasItems(ribbons) ?
            <MyRecordings
              render={callback => ribbons.length===0?
                null
                :
                ribbons.filter(r=>r.items.length!==0).map((it,i)=>{
                  return(
                    <Ribbon
                      id={'recordings-'+i}
                      title={it.title}
                      items={it.items}
                      focusHandler={cardData => {
                        this.setResumeData(cardData,callback);
                      }}
                      keyDownHandler={this.props.handleKeyPress}
                      setMetricsEvent={this.props.setMetricsEvent}
                      showFooter={it.showFooter}
                      user={this.props.user}
                    />
                  )
                })

              }
            />:
            this.state.isLoading? null : <EmptyContent message={'No tienes grabaciones'}/>
        }
      </Scrollable>
    )
  }
}

MyContent.propTypes = {
  user: PropTypes.func.isRequired,
  setResumeData: PropTypes.func.isRequired,
  setMetricsEvent: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  handleRecordingPlay: PropTypes.func.isRequired,
};

MyContent.defaultProps = {
  user: {},
  setResumeData: () => null,
  setMetricsEvent: () => null,
  handleKeyPress: () => null,
  handleRecordingPlay: () => null,
};

export default withRouter(MyContent)
