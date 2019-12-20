import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EpgGrid from './index';
import EpgPostales from './EpgPostales';
import ChannelSingleton from '../../components/Epg/ChannelsSingleton';
import './styles/epg.css';
import './styles/miniEpg.css';
import Utils from "../../utils/Utils";
import FrontPanel from './../../devices/nagra/FrontPanel';
import Device from "../../devices/device";
import LayersControl from "../../utils/LayersControl";
import AnalyticsDimensionSingleton from "../Header/AnalyticsDimensionSingleton";
import DeviceStorage from "../DeviceStorage/DeviceStorage";

const config_remote_control = (DeviceStorage.getItem('config_remote_control') !== 'simple') ? true : false ;

class MiniEpg extends Component {

    constructor(props) {
        super(props);

        this.keys = Device.getDevice().getKeys();

        const { location } = this.props;
        this.channelsRange = location && location.state && location.state.live || false;

        this.state = {
            currentData: {
                eventId: null,
                channelId: null,
                image: null,
                html: null,
                groupId: null,
            },
            isOpen: false,
            nodeId: null,
            channels: null,
        };

        this.setCurrentData = this.setCurrentData.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.resetFirst = this.resetFirst.bind(this);
        this.setChannels = this.setChannels.bind(this);
        this.setNodeId = this.setNodeId.bind(this);
        this.updateEpg = this.updateEpg.bind(this);
    }

    sendDimension=()=>{
      const payload=new AnalyticsDimensionSingleton().getPayload();
      this.props.setMetricsEvent(payload);
      this.props.setMetricsEvent({ type: 'executor'});
    }

    sendMetric=(label)=>{
      if(typeof this.props.setMetricsEvent === 'function'){
        this.props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'tv',
          eventAction: 'menu',
          eventLabel: label,
        });
        this.props.setMetricsEvent({type: 'executor'});
        this.sendDimension();
      }

    }

    handleKeyPress(e) {
      console.log('Listening [MiniEpg] handleKeyPress');
      if(LayersControl.isUXVisible())
        return;
      const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
      console.log('Enter to Listening [MiniEpg] handleKeyPress, currentKey:',currentKey);
      switch (currentKey) {
          case 'BLUE':
              /*
              if (this.props.isOpen) {
                  e.preventDefault();
                  this.props.goToCard(`/epg/${this.state.currentData.groupId}`, this.state.currentData);
              }
              */
              break;
          case 'YELLOW':
              e.preventDefault();
              if(this.props.enableButton('yellow')) {
                this.props.onPressYellowButton();
              }
              break;
          case 'RED':
            e.preventDefault();
            e.stopPropagation();
            this.sendMetric('buscar');
            this.props.goToCard('/search');
            default:
                break;
      }
    }


  resetFirst() {

    const groupId = this.props.groupId || this.state.channels[0].group_id;
    this.setState({ groupId, forceUpdate: true, currentChannel: this.state.currentData.channelId });
    //console.log('[MiniEPG] GCR canal actual ', this.state.currentData.channelId);
      //this.forceUpdate();
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPress);
        new ChannelSingleton().getFilters().then(this.setNodeId);
        new ChannelSingleton().getChannels().then(this.setChannels);
        this.props.hideListeners.push(this.resetFirst);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPress);
        const indexHideListener =
          this.props.hideListeners.indexOf(this.resetFirst);
        if (indexHideListener !== -1) {
          this.props.hideListeners.splice(indexHideListener, 1);
        }
    }

    setNodeId(filters) {
        const nodeId = filters[0] && filters[0].id || null;
        this.setState({ nodeId });
    }

    setChannels(channels) {
        this.setState({ channels });
    }

    setCurrentData({ channel, event, focused }, withGroupId) {
        const currentData = {
            eventId: event.id,
            channelId: channel.number,
            image: channel.image,
            html: focused && focused.innerHTML,
            groupId: channel.group_id,
            title: event.name,
            description: event.description,
            dateBegin: event.date_begin,
            dateEnd: event.date_end,
            hasTimeShift: event.ext_startover && event.ext_startover == '1' ? true : false,
            stopRedirect: true,
            number: event.channel_id,
        };
        this.props.onGetCurrentData(currentData);
        this.props.onGetCurrentEvent({ channel, event, focused });
        const newState = this.state;
        newState.currentData = currentData;
        if (withGroupId) newState.groupId = channel.group_id;
        this.setState(newState, () => {
          const element = document.querySelector('.epg-main .epg-event-current.focusable');
          if (Utils.isModalHide()) {
            window.SpatialNavigation.focus(focused || element || '.epg-main .focusable');
          }
            try {
                //Esto parece un hardcodeo, pero dado que construímos el 'focused' en el middleware, si el focused existe, esto debería ser válido y al hacerlo de esta manera, mejoramos el performance, si cambia la maquetación, hay que actualizar esto
                const eventContainer = focused.parentNode.parentNode.parentNode.parentNode;
                eventContainer.scrollTo(element.offsetLeft - eventContainer.offsetLeft, 0);
            } catch (error) {
                console.log("Error on epg's row structure");
            }
        });
    }

    updateEpg(channel, event, focused) {
        this.setCurrentData({channel, event, focused}, true);
        if (typeof this.props.onUpdateEpg == 'function') {
            this.props.onUpdateEpg(channel.group_id);
          }
    }

    render() {
        if ( !this.state.channels || !this.state.nodeId) {
            return null;
        }
        const groupId = this.props.groupId || this.state.channels[0].group_id;
       // const EpgId=DeviceStorage.getItem('lastChannel');
        const indexChannel = this.state.channels.findIndex(channel => channel.group_id == groupId);
        const totalChannels = this.state.channels.length;
        const verticalOffset = 20;
        const visibleRows = 1;
        const {from, quantity, infinite_fix} = Utils.getEpgRange(indexChannel, totalChannels, verticalOffset, visibleRows);
        const config_remote_control = (DeviceStorage.getItem('config_remote_control') !== 'simple') ? true : false ;
        this.epgProps = {
            verticalOffset,
            visibleRows,
            node_id: this.state.nodeId,
            onFirstLoad: this.setCurrentData,
            eventContainerWidth: 1150,
            from,
            infinite_fix,
            quantity,
            handleEPG: () => {
                this.props.handleFullEpg();
            },
            updateEpg: this.updateEpg,
            setMetricsEvent: this.props.setMetricsEvent,
            fromMiniEpg: true,
          /*  showMiniEpg: this.props.show,*/
            forceUpdate: this.state.forceUpdate,
            currentChannel: this.state.currentChannel,
            hideEpgOutside: this.props.hideEpgOutside,
            onChangingChannel: this.props.onChangingChannel,
            isChangingChannel: this.props.isChangingChannel,
            onPressYellowButton: this.props.onPressYellowButton,
            // NOTA: isMiniEpg de abajo se puede sustituir con fromMiniEpg?, ya existía ese atrr arriba. Duplicados?
            isMiniEpg: true,
            changeCurrentGroupId: this.props.changeCurrentGroupId,
            groupId: groupId,
            fromProps: this.props.fromProps,
            setFromProps: this.props.setFromProps,
            saveEpgData: this.props.saveEpgData
        };
        console.log("[MiniEpg] render",
          "\ngroupId", groupId,
          "\nindexChannel", indexChannel,
          "\nforceUpdate", this.state.forceUpdate
        );
        if (this.state.forceUpdate) this.state.forceUpdate = false;

        if (this.state.currentData.channelId)
            FrontPanel.setFrontPanel(this.state.currentData.channelId);

      const showEpgPostales = Device.getDevice().getConfig().useEpgPostals;

      const checkStatusEpg = {
        checkStatusEPG: this.props.checkStatusEPG,
        checkStatusCoverFlowCH: this.props.checkStatusCoverFlowCH,
      };

      return (
        <div className={`mini-epg epg-container`}>
          <div className="mini-epg-header">
            <div className="mini-epg-header-title">
              <span>{this.state.currentData.channelId}</span>
              <img src={this.state.currentData.image} />
            </div>
            <div className="mini-epg-header-data">
              <i
                id="btn-hide"
                data-sn-up={'#btn-hide'}
                data-sn-down={'#btn-hide'}
                data-sn-left={'#btn-hide'}
                data-sn-right={'.player-ui-button.focusable:first-child'}
                onClick={this.props.onPressYellowButton}
                className={`fa fa-chevron-down focusable`}
              />
              {config_remote_control ? <span className="color-ball yellow" />:null}
              <div dangerouslySetInnerHTML={{ __html: this.state.currentData.html }} />
            </div>
          </div>
          <div className="epg-wrapper">
            <i className="fa fa-chevron-up" id="btn-up" />
            {/* <i className="fa fa-chevron-left" id="btn-left" /> */}
            { showEpgPostales
              ? <EpgPostales {...this.epgProps}  goToCard={this.props.goToCard} {...checkStatusEpg}/>
              : <EpgGrid {...this.epgProps}  goToCard={this.props.goToCard} /> }
            {/* <i className="fa fa-chevron-right" id="btn-right" /> */}
            <i className="fa fa-chevron-down" id="btn-down" />
          </div>
        </div>
      );
    }
}

MiniEpg.propTypes = {
    isOpen: PropTypes.bool,
    onGetCurrentData: PropTypes.func,
    onPressYellowButton: PropTypes.func,
    onGetCurrentEvent: PropTypes.func,
};

MiniEpg.defaultProps = {
    isOpen: false,
    onGetCurrentData: () => { },
    onPressYellowButton: () => { },
    onGetCurrentEvent: () => { },
};

export default MiniEpg;
