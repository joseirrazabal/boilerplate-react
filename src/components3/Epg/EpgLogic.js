import { Component } from "react"
import {
  showModal,
  MODAL_PPE,
  MODAL_ACTION,
  HIDE_MODAL,
  MODAL_PIN,
  MODAL_AOVIVO_NOTCHANNEL
} from "../../actions/modal"
import PPE from "./../../devices/nagra/PPE"
//import getAppConfig from "../../config/appConfig";
import * as api from "../../requests/loader"
import store from "./../../store";
import * as playerConstant from "../../utils/playerConstants";
import { replaceFullSourceMedia } from "../../actions/playmedia";
import Utils from "../../utils/Utils"
//import TvChannelUtil from "../../utils/TvChannelUtil";
import ChannelSingleton from "./ChannelsSingleton"
import AnalyticsDimensionSingleton from "../../components/Header/AnalyticsDimensionSingleton"
import Device from "../../devices/device"
import DeviceStorage from "../DeviceStorage/DeviceStorage"
import { playerControlsIsVisible } from "../PlayerControls/PlayerControls"
import RequestManager from "../../requests/RequestManager"
import StatusControlPinTask from "../../requests/tasks/user/StatusControlPinTask"
import Translator from "../../requests/apa/Translator"
import PlayerStreamingUtils from "../../utils/PlayerStreamingUtils"

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

class EpgLogic extends Component {
  constructor(props) {
    super(props);
    this.statusRequest = new StatusControlPinTask();
    this.onSelectCard = this.onSelectCard.bind(this);
    this.focus = this.focus.bind(this);
    this.launchCoverFlow = this.launchCoverFlow.bind(this);
    this.hideCoverFlow = this.hideCoverFlow.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.runGetMedia = this.runGetMedia.bind(this);
    this.playPipPlayer = this.playPipPlayer.bind(this);
    this.closePipPlayer = this.closePipPlayer.bind(this);
    this.checkStatusPin = this.checkStatusPin.bind(this);

    this.blockedChannels = [];
    this.playerStreamingUtils = new PlayerStreamingUtils();

    this.checkStatusPin();
  }

  componentWillUnmount() {
    // Si esta por ir a payment, no se cierran los players, los players se cierran en payment al montar el componente
    // porque puede que por ejemplo en nagra se abrá el pip en el focus en la epg y mientras esto pasa
    // la app navega hacía payment y puede llegar aquí con un pip player o incluso un fullplayer
    if (!this.state.showSubscrition) {
      console.log("[Payment] closing players en epgPostales");
      //this.closeFullPlayer();
    }
    // Close pip player ya estaba antes, se deja como estaba ¿? :/
    // TODO: quiza sea este closepip el que haga un efecto raro al hacer un resize del full player
    // al pasar de TV a fichaEPG (resize y full player se queda como pip en la ficha epg)
    this.closePipPlayer();
    this.removeListeners();
  }

  checkStatusPin() {
    RequestManager.addRequest(this.statusRequest)
      .then(resp => {
        //console.log('EDM:pinStatuss',resp.response.pin_channel.status)
        this.blockedChannels =
          resp.response.pin_channel.status == 1
            ? resp.response.pin_channel.info
            : [];
      })
      .catch(err => {
        console.error(err);
      });
  }

  now() {
    return Utils.now(true);
  }

  getFocusedData() {
    const focused =
      this.eventContainer &&
      this.eventContainer.querySelector(".focusable:focus");
    let row = null,
      block = null,
      firstBlock = null,
      lastBlock = null;
    if (focused) {
      row = focused.parentNode.parentNode.parentNode;
      block = focused.parentNode.parentNode;
      firstBlock = row.querySelector(".epg-events-block:first-child");
      lastBlock = row.querySelector(".epg-events-block:last-child");
    }
    return {
      row,
      block,
      firstBlock,
      lastBlock,
      focused
    };
  }

  getChannelData() {
    new ChannelSingleton().getMaxTimeshift().then(maxTimeshift => {
      this.maxTimeshift = maxTimeshift / 60;
    });
  }

  handleDelayKey(e, key) {
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
      if(Utils.getCoverFlowVisibilityFromMetadata().enable){
        e.stopPropagation();
        e.preventDefault();
        this.launchCoverFlow();
      }
    } else {
      this.pressTimer = setTimeout(this.resetTimer, this.delayKeyTime);
    }
  }

  handleDelayKeyOk(e, key, cb) {
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
        cb();
    } else {
      this.pressTimer = setTimeout(this.resetTimer, this.delayKeyTime);
    }
  }



  launchCoverFlow(specialLoading) {
    // Launch if isFullEpg or receive linealChannels (from Video/index.jsx)
    if (this.props.isFullEpg || this.props.linealChannels) {
      if(this.props.disableColorActions) {
        this.props.disableColorActions();
      } else {
        this.disableColorActions();
      }
      let newState={ coverFlow: true}
      if(specialLoading)
      {
        newState.specialLoading=specialLoading;
      }
      this.setState(newState, this.resetTimer);
    }
  }

  hideCoverFlow(selector, isChangeChannel) {
    if(this.props.enableColorActions) {
      this.props.enableColorActions();
    } else {
      this.enableColorActions();
    }
    this.setState({ coverFlow: false }, () => this.focus(selector, isChangeChannel));
  }

  resetTimer() {
    if(this.playInMini){
      clearTimeout(this.playInMini);
    }
    clearTimeout(this.pressTimer);
    this.lastKey = null;
    this.pressTimer = null;
  }

  focus(selector, isChangeChannel) {
    if (Utils.isModalHide() && !isChangeChannel) {
      window.SpatialNavigation.focus(selector);
    }
    if(this.setCurrentData) {
      this.setCurrentData();
    }
  }

  playPipPlayer() {
    if (this.props.playPipPlayer && this.usingPip()) {
      this.props.playPipPlayer(this.current);
      this.sendMetricPlayer(this.current);
    }
  }

  closePipPlayer() {
    if (this.props.closePipPlayer && this.usingPip()) {
      console.log(
        "@@@@@@@@@@@@ componentWillReceiveProps EPG components closePipPlayer"
      );
      this.props.closePipPlayer();
    }
  }

  killPipTimeout() {
    if (this.props.killPipTimeout && this.usingPip()) {
      console.log(
        "@@@@@@@@@@@@ componentWillReceiveProps EPG components killPipTimeout"
      );
      this.props.killPipTimeout();
    }
  }

  usingPip() {
    return this.platform === "nagra" || this.platform === "workstation";
  }

  sendDimension() {
    const payload = new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: "executor" });
  }

  sendMetric(label) {
    DeviceStorage.setItem("label-channel-analytics", label);
    if (typeof this.props.setMetricsEvent === "function") {
      this.props.setMetricsEvent({
        hitType: "event",
        eventCategory: "TV",
        eventAction: "menu programacion",
        eventLabel: label
      });
      this.props.setMetricsEvent({ type: "executor" });
      this.sendDimension();
    }
  }

  sendMetricPlayer(current) {
    if (
      typeof this.props.setMetricsEvent === "function" &&
      typeof current !== "undefined"
    ) {
      let action = "play/pip",
        label;
      if (current.channel && current.channel.group) {
        label = current.channel.group.common.format_types;
        label += " - " + current.channel.group.common.proveedor_name;
        if (current.channel.group.common.proveedor_name === "AMCO") {
          label += " - suscripcion";
        } else {
          label += " - " + current.channel.group.common.proveedor_name;
        }
        label += " - " + current.channel.group.common.title;
        this.props.setMetricsEvent({
          hitType: "event",
          eventCategory: "reproductor",
          eventAction: action,
          eventLabel: label
        });
        if (DeviceStorage.getItem("pip-analytics-label") !== label) {
          this.props.setMetricsEvent({
            type: "executor"
          });
          DeviceStorage.setItem("pip-analytics-label", label);
          this.sendDimension();
        }
      }
    }
  }

  canPlayChannel(group_id) {
    return ChannelSingleton.canPlayChannel(group_id);
  }

  goProviderSusc(groupId, offerId, pbiData) {
    console.log("[PAYMENT] @@@@ goProviderSusc", groupId, offerId);

    if (groupId && offerId) {
      this.paymentData = {
        groupId: groupId,
        offerId: offerId,
        pbi: pbiData
      };

      store.dispatch(
        showModal({
          modalType: HIDE_MODAL,
          modalProps: {}
        })
      );

      this.setState({
        showSubscrition: true
      });
    }
  }

  async getPBI(groupId) {
    return await api.purchaseButtonInfo(groupId);
  }

  showModalSusc(provider, groupId, offerButtons, format_type) {
    let pbiButtons = [];
    let default_susc_button_text = "";

    /*
    if (provider.toUpperCase() === 'FOXV3') {
        provider = 'FOX';
    }
 */
    offerButtons.forEach(button => {
      default_susc_button_text = button.oneofferdesc;
      let button_text = Translator.get(provider + "_forced_label", "NOTEXT");

      const userLoggedIn = store.getState().user.isAnonymous === false;
      button.fromsusctv = userLoggedIn ? "susctvregistrado" : "susctvanonimo"; // Para back desde payment

      if (button_text === "NOTEXT") {
        button_text = default_susc_button_text;
      }
      let oneButton = {
        content: button_text,
        props: {
          onClick: e => {
            this.goProviderSusc(groupId, button.offerid, button);
          }
        }
      };
      pbiButtons.push(oneButton);
    });

    const modalProps = {
      proveedorName: provider,
      format_type,
      buttons: pbiButtons,
      callback: () =>
        console.log("No susc, ejecutando callback al cancelar ....")
    };

    store.dispatch(
      showModal({
        modalType: MODAL_ACTION,
        modalProps: modalProps
      })
    );
  }

  async getContentData(gid) {
    let contentData = await api.contentData(gid);
    return contentData;
  }

  sendToVcard() {
    this.setState({
      showVCard: true
    });
  }

  closeModal(pinIsCreated) {
    if (pinIsCreated) {
      store.dispatch({
        type: HIDE_MODAL,
        modalType: MODAL_PIN
      });
    }
  }

  handleClick(e, fromMiniEpg = false, showMiniEpg = null) {

    this.runGetMedia(e, fromMiniEpg, showMiniEpg);
  }





  async runGetMedia(e, fromMiniEpg = false, showMiniEpg = null) {
    if (fromMiniEpg) {
      if (!playerControlsIsVisible()) {
        if (typeof showMiniEpg === "function") {
          showMiniEpg();
        }
        return null;
      }
    }

    let sendToVcard = false;

    // get current clicked
    let tt = this.current;
    const { channel, event, focused } = this.current;
    let dateBegin = event.date_begin;
    let dateEnd = event.date_end;

    let isCurrent = Utils.isDateBetween(dateBegin, dateEnd);
    let isPastEvent = Utils.isDateBetween(dateEnd,Utils.now());
    let isFutureEvent = Utils.isDateBetween(Utils.now(), dateBegin);
    // Can go to epg vcard?
    let canGoToEPGVcard = (isPastEvent && this.playerStreamingUtils.canGoToPastEPGCard());

    if(!channel.group_id) {
      console.log('[[[PAU]]] intenta ir a ficha');
      return;
    }

    let channelBackgroundImage =
      channel &&
      channel.group &&
      channel.group.common &&
      channel.group.common.image_background;
    //send Metric to Google Analytics
    this.sendMetric(`${channel.name}-${event.name}`);

    // goose -- se saca youbora
    /*
    let youboraInfoChannel = {
      channel_id: event.channel_id,
      channel_group_id: event.channel_group_id,
      channel_name: channel.name,
      program_event_id: event.id,
      program_event_name: event.name
    }
    let youboraMetadata = JSON.stringify(youboraInfoChannel);
    window.youboraChannelMetadata = youboraInfoChannel;
    */

    // Add for performance

    let platf = Device.getDevice().getPlatform();
    let is_nagra = platf === "nagra";

    /* TODO this kind of things must not be here,
         * must be some config o apa attribute
         *
         * Nagra must not be here, for the moment...
         */
    const supportReplace = [
      "web0s",
      "samsung",
      "tizen",
      "lg",
      "android",
      "hisense",
      "workstation",
      "ps4"
    ];
    let existsPlatform = supportReplace.find(elem => elem === platf);
    if (!is_nagra) {
      // Double check? o_O
      let gid = channel.group_id;
      if (!gid) {
        gid =
          this.current &&
          this.current.channel &&
          this.current.channel.group &&
          this.current.channel.group.common &&
          this.current.channel.group.common.id;
      }
      const canPlay = this.canPlayChannel(gid)
      if ((isCurrent || !canGoToEPGVcard) && gid && !isFutureEvent) {
if (!canPlay) {
                // redirect en grilla de canales
                store.dispatch(showModal({
                  modalType: MODAL_AOVIVO_NOTCHANNEL,
                  modalProps: {
                      callback: () => {
                      },
                      content: {code: 'empty_channels_live'}
                  }
                }));
        // this.props.goToCard(
        //   `/node/home`
        // );

} else {

        let newSource = {
          playerstate: "PLAYING",
          source: {
            //videoid: 764423
            videoid: gid
          },
          size: {
            top: 0,
            left: 0,
            width: 1280,
            height: 720
          },
          ispreview: false,
          islive: true,
          ispip: false
        };

        //  this.props.handleEPG();
        // if (typeof this.props.updateEpg == 'function') {
        //     this.props.updateEpg(channel, event, focused);
        //}
        this.props.hideEpgOutside(gid,channel);
        //TvChannelUtil.setLastChannel(channel.group_id); solo se debe de ejecutar en onResolveParams de components/Video
        //store.dispatch(playFullMedia(newSource));

}
      } else {
        if (!canPlay) {
                // redirect en grilla de canales
                store.dispatch(showModal({
                  modalType: MODAL_AOVIVO_NOTCHANNEL,
                  modalProps: {
                      callback: () => {
                      },
                      content: {code: 'empty_channels_live'}
                  }
                }));

          // this.props.goToCard(
          //   `/node/home`
          // );
        } else {
          sendToVcard = true;
        }
      }
    } else if (is_nagra) {
      console.log("Canal en vivo ___ isCurrent", isCurrent);
      let channel_url = null;
      if (event.channel_group_id) {
        channel_url = Utils.getChannelUrl(event.channel_group_id);
      }

      if (isCurrent && channel_url && !this.sendAllToTheCard) {
        sendToVcard = false;
        // Change source video
        console.info("[EPG handleClick] change source url");
        //TvChannelUtil.setLastChannel(channel.group_id); solo se debe de ejecutar en onResolveParams de components/Video
        let newSource = {
          src: channel_url, // new url to replace current and play
          drmInfo: { server_url: null, content_id: null, challenge: null }, // reset to null (we are un DBVC), just in case...
          streamType: playerConstant.DVBC, // see playerConstants
          isLive: true,
          isActiveEpg: false,
          backgroundImage: channelBackgroundImage
          // TODO cómo recuperamos pgm en nagra, en este caso, para trackstop ¿?
        };

        if (is_nagra) {
          let srcArray = newSource.src.split(".");
          let eventObject = PPE.getEventCurrent(srcArray[1]);
          console.log("[eventObject.eventId]", eventObject.eventId);
          let purchasableObject = PPE.getPurchasableObject(eventObject);
          console.log("[purchasableObject]", purchasableObject);

          if (!purchasableObject) {
            this.props.handleEPG();
            if (typeof this.props.updateEpg == "function") {
              this.props.updateEpg(channel, event, focused);
            }
            //TvChannelUtil.setLastChannel(channel.group_id); solo se debe de ejecutar en onResolveParams de components/Video
            store.dispatch(replaceFullSourceMedia(newSource));
          } else {
            store.dispatch(
              showModal({
                modalType: MODAL_PPE,
                modalProps: {
                  callback: a => {
                    if (PPE.initiatePPVEventPurchase()) {
                      this.props.handleEPG();
                      if (typeof this.props.updateEpg == "function") {
                        this.props.updateEpg(channel, event, focused);
                      }
                      //TvChannelUtil.setLastChannel(channel.group_id); solo se debe de ejecutar en onResolveParams de components/Video
                      store.dispatch(replaceFullSourceMedia(newSource));
                    }
                  }
                }
              })
            );
          }
        } else {
          this.props.handleEPG();
          if (typeof this.props.updateEpg == "function") {
            this.props.updateEpg(channel, event, focused);
          }
          //TvChannelUtil.setLastChannel(channel.group_id); solo se debe de ejecutar en onResolveParams de components/Video
          store.dispatch(replaceFullSourceMedia(newSource));
        }
      }
    }

    if (sendToVcard) {
      /* Anothers devices... VCard really? */
      console.info("showVCard state", this.state);
      const { channel, event } = this.current;
      if (channel && event) {
        if (this.sendAllToTheCard == true) {
          event.keyOfControl = true;
        }
        // this.props.closePlayer();
        // Se agrega el node_id para que no se rompa el player
        event.node_id = this.props.node_id;
        event.time = Date.now();
        let eventData = JSON.stringify({ event });
        this.props.hideEpgOutside();
        this.props.goToCard(
          `/epg/${channel.group_id}?eventData=${encodeURI(eventData)}`
        );
      }
      /*  this.setState({
                showVCard: true,
            });*/
    }

    // DeviceStorage.setItem("youbora-channel-metadata", youboraMetadata); // goose -- se saca youbora
  }

  isNotPurchased(button) {
    return button.waspurchased === "0";
  }

  onSelectCard(channel,fromCoverFlow=false) {
    if(this.props.enableColorActions) {
      this.props.enableColorActions();
    } else {
      this.enableColorActions();
    }
    if(this.props.updateEpg){
      this.props.updateEpg(channel,fromCoverFlow);
    } else {
      this.updateEpg(channel);
    }
  }
}

export default EpgLogic
