import React, { Component } from 'react';
import { connect } from 'react-redux';

import RequestManager from "../../../../requests/RequestManager";
import BlockedChannelsTask from '../../../../requests/tasks/user/GetBlockedChannelsTask';

import ContentDataTask from '../../../../requests/tasks/content/ContentDataTask';
import Channel from './Channel';
import ChannelSingleton from "../../../../components/Epg/ChannelsSingleton";

import ModalConductor from '../../../../containers/Modal';
import { showModal, MODAL_ACCIONES_CANALES } from '../../../../actions/modal';
import Device from "../../../../devices/device";

class ContentBlockedChannels extends Component {
    constructor() {
      super();
      
        this.state = {
          data: []
        }        
        this.keys=Device.getDevice().getKeys();
        this.focusId;
        this.channelsRequest = new BlockedChannelsTask();        
        this.device = Device.getDevice().getPlatform();
        this.focusHandler = this.focusHandler.bind(this);
        this.keyActions = this.keyActions.bind(this);
        this.handleKeyPress=this.handleKeyPress.bind(this);
        this.setChannels = this.setChannels.bind(this);
        this.getChannelList = this.getChannelList.bind(this);
        this.stateHandler = this.stateHandler.bind(this);
        this.hasChannelUnblocked = this.hasChannelUnblocked.bind(this);
    }

    getChannelList() {
        new ChannelSingleton().getChannels().then(this.stateHandler);
    }

    componentDidMount() {
        this.getChannelList();
        document.addEventListener('keydown', this.handleKeyPress);
        window.SpatialNavigation.makeFocusable();
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.hasChannelUnblocked(prevState)) {
            this.focusHandler()
        }
    }

    componentWillUnmount(){
      document.removeEventListener('keydown', this.handleKeyPress);
    }

    hasChannelUnblocked(prevState) {
        return prevState.data && this.state.data && prevState.data.length > this.state.data.length;
    }

    handleKeyPress(e){
      let that=this;
      let keyName = that.keys.getPressKey(e.keyCode);
      if(keyName !== 'OK')
        that.keyActions(keyName);
    }

    setChannels(channels) {
      //console.log('[==>] setChannels')
      if (this.state.data && channels) {        
        let newData = this.state.data;
        //console.log('[==>] oldData:', newData);
        if (newData && newData.length && newData.length > 0) {
          //console.log('[==>] enter if:', newData);
          newData = newData.map(value => {
            let number = channels.find(x => x.group_id == value.id);
            return {
              ...value,
              number: (number && number.id) ? number.id : '',              
            };
          });
          //console.log('[==>] newData:', newData);
          this.setState({ data: newData});
        }
      }
    }  

    focusHandler(data) {
        this.focusId = document.activeElement.id;
    }

    stateHandler(channels) {
      RequestManager.addRequest(this.channelsRequest).then((resp) => {
        if (resp.response.groups) {
          this.setState({data: JSON.parse(JSON.stringify(resp.response.groups))});
        } else {
          this.setState({data: []});
        }
        this.setChannels(channels);
        }).catch((err) => {
            console.error(err);
        });
    }

    keyActions(key) {
        const showModal = this.props.showModal;
        const modal =  document.getElementsByClassName('modal-overlay');

        switch (key) {
            case 'GREEN':
                    if (modal.length === 0) {console.log('acatot')
                        document.querySelector('[id="parental_control"] a').click();
                    }
                break;
            case 'OK':
                if (modal.length === 0 && this.focusId && this.focusId === document.activeElement.id) {
                    let serviceToUpdate = document.activeElement.parentNode.parentNode.parentNode.id;

                    showModal({ modalType: MODAL_ACCIONES_CANALES, modalProps: {group_id: this.focusId, service: () => { this.getChannelList() }} });
                }
                break;
        }
    }

    render() {

      let arr = [];      
        let jsonChannelList,
            hideChannels,
            hideNoChannels;
        const styleHide = {display: 'none'};        

        if (this.state.data.length > 0) {
            let json = this.state.data;
            let that = this;
            hideNoChannels = styleHide;

        jsonChannelList = json.map(function(json, i) {
                return (
                    <Channel
                        key={ i }
                        id={ json.id }
                        img={ json.image_small }
                        title={ json.title }
                        channel={json.number }
                        style={ { background: `url(${json.image_small})` } }
                        keyActions={ () => that.keyActions('OK') }
                        focusHandler={ that.focusHandler }
                    />
                );
            });
        } else {
            hideChannels = styleHide;
        }

        return(
            <div id="" className="ContentBlockedChannels">
               <div className="finish-button focusable" onClick={ ()=>this.keyActions('GREEN')}>
                    <ul className="color-codes">
                        <li className="color-code-item">
                            <span className="color-ball green"></span> Terminar
                        </li>
                    </ul>
                </div>
                <p>{ this.props.text }</p>
                <div id="frameChannels" style={ hideChannels } className="frameChannels invisible-scrollbar">
                   { jsonChannelList }
                </div>
                <div className="message-box" style={ hideNoChannels }>
                    <h2>No tienes canales bloqueados.</h2>
                </div>
            </div>
        );
    }
}

export default connect(null,{showModal})(ContentBlockedChannels);
