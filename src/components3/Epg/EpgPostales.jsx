/**
 * Dependencies
 */

import React, { Component } from "react";
import settings from "./../../devices/all/settings";
import moment from "moment";
import PropTypes from "prop-types";
import RequestManager from "./../../requests/RequestManager";
import EpgTask from "./../../requests/tasks/epg/EpgTask";
import Utils from "../../utils/Utils";
import PlayerStreamingUtils from "../../utils/PlayerStreamingUtils";
import Metadata from "../../requests/apa/Metadata";
import EpgLogic from "./EpgLogic";
import ChannelSingleton from "./ChannelsSingleton";
import epgCache from "../../utils/EpgCache";
import {
  showModal,
  MODAL_ACTION,
  HIDE_MODAL,
  MODAL_CHANNEL_EPG,
  MODAL_EPG
} from "../../actions/modal";

/**
 * Assets
 */
import "./styles/epg.css";
import CoverFlow from "./CoverFlow";
import Device from "../../devices/device";

import store from "./../../store";
import { navigateFrom } from "./../../actions/epg";
import LayersControl from "../../utils/LayersControl";
import Translator from "../../requests/apa/Translator";
//import {playFullMedia} from "../../actions/playmedia";
import LocalStorage from "../DeviceStorage/LocalStorage";
import DeviceStorage from "../DeviceStorage/DeviceStorage";
import EPGDataRequest from "./EPGDataRequest";

class Epg extends EpgLogic {
  constructor(props) {
    super(props);

    /**
     * DOM references
     */
    this.schedulesContainer = null;
    this.channelsContainer = null;
    this.eventContainer = null;

    /**
     * Control flags
     */
    this.isRequesting = false;
    this.visibleRows = this.props.visibleRows;
    this.minuteSize = 10;
    this.rowWidth = this.props.eventContainerWidth;
    this.total = null;
    this.navTimer = null;
    this.lastKey = null;
    this.isKeysBloqued = false;
    this.delayKeyTime = 50;
    this.handleDelayKeyOkTimer = null;
    this.handleDelayKeyOkSafeTime = 1500;
    this.lastEpgRequest = null;

    /**
     * Direction types
     */
    this.verticalDirection = "verticalDirection";
    this.horizontalDirection = "horizontalDirection";
    this.rightDirection = "right";
    this.leftDirection = "left";
    this.downDirection = "down";
    this.upDirection = "up";

    /**
     * UpdaterEPG Time Line
     */
    this.timerUpdaterMin = 1000 * 60;
    this.timerEventContainerUpdater = null;

    /*
     ** Epg Cache default time in seconds
     */

    this.epgCacheExpireTimeSeconds = 18000;

    this.platform = Device.getDevice().getPlatform();
    this.sendAllToTheCard = null;
    this.keys = Device.getDevice().getKeys();
    console.info("[EpgPostales] constructor this.keys", this.keys);
    this.memory_range = {
      horizontal: { start: null, end: null },
      vertical: { start: this.props.from, end: this.getVerticalMemorySize() }
    };

    this.memory_visible = {
      horizontal: { start: null, end: null },
      vertical: { start: this.props.from }
    };

    this.epg = {
      channels: [],
      events: [],
      data: [],
      schedules: []
    };

    this.epgSnapShot = null;
    this.state = {
      schedules: [],
      renderedChannels: [],
      renderedEvents: [],
      showVCard: false,
      showSubscrition: false,
      count: 0
    };

    this.maxTimeshift = 120; //minutos
    this.isGoingToFetch = true;

    this.paymentData = {
      groupId: null,
      offerId: null,
      pbi: null
    };

    /**
     * Methods
     */
    this.calcInitRangeTime = this.calcInitRangeTime.bind(this);
    this.initSchedules = this.initSchedules.bind(this);
    this.request = this.request.bind(this);
    this.firstLoad = this.firstLoad.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.changePageHandler = this.changePageHandler.bind(this);
    this.loadData = this.loadData.bind(this);
    this.keyPressListener = this.keyPressListener.bind(this);
    this.addListeners = this.addListeners.bind(this);
    this.isHandleUpdatingTime = this.isHandleUpdatingTime.bind(this);
    this.updatingTime = this.updatingTime.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.getEpgSnapShot = this.getEpgSnapShot.bind(this);
    this.setEpgSnapShot = this.setEpgSnapShot.bind(this);
    this.clearFromRigth = this.clearFromRigth.bind(this);
    this.doRequest = this.doRequest.bind(this);
    /**
     * Initializations
     */
    this.calcInitRangeTime();

    this.playerStreamingUtils = new PlayerStreamingUtils();

    EPGDataRequest.initialise();
  }

  calcInitRangeTime() {
    const now = this.now();
    const time = now.toObject();
    //time.hours          -= (time.hours % 2) ? 1: 0;
    //time.minutes        = 0;
    time.minutes = time.minutes >= 30 ? 30 : 0;
    time.seconds = 0;
    time.milliseconds = 0;
    this.memory_range.horizontal.start = moment(time).subtract(
      this.props.visibleTime * this.props.horizontalOffset,
      "hours"
    );
    this.memory_range.horizontal.end = moment(
      this.memory_range.horizontal.start
    ).add(
      this.props.horizontalOffset * this.props.visibleTime * 2 +
        this.props.visibleTime,
      "hours"
    );
    this.memory_visible.horizontal.start = moment(time);
    this.memory_visible.horizontal.end = moment(
      this.memory_visible.horizontal.start
    ).add(this.props.visibleTime, "hours");
  }

  initSchedules() {
    const schedules = [];
    if (this.memory_range.horizontal.start !== null) {
      const start = moment(this.memory_range.horizontal.start);
      const end = moment(this.memory_range.horizontal.end);
      while (start.unix() < end.unix()) {
        schedules.push(moment(start));
        start.add(this.props.intervalSize, "m");
      }
    }
    const result = [];
    const range = (this.props.visibleTime * 60) / this.props.intervalSize;
    while (schedules.length > 0) {
      result.push(schedules.splice(0, range));
    }
    return result;
  }

  reset() {
    this.total = null;
    this.navTimer = null;

    this.current = {
      channel: {},
      event: {}
    };

    this.sendAllToTheCard = null;

    this.memory_range = {
      horizontal: { start: null, end: null },
      vertical: { start: this.props.from, end: this.getVerticalMemorySize() }
    };

    this.memory_visible = {
      horizontal: { start: null, end: null },
      vertical: { start: this.props.from }
    };

    this.epg = {
      channels: [],
      events: [],
      data: [],
      schedules: []
    };

    this.state = {
      schedules: [],
      renderedChannels: [],
      renderedEvents: [],
      showVCard: false,
      showSubscrition: false,
      count: 0
    };

    this.isGoingToFetch = true;

    this.paymentData = {
      groupId: null,
      offerId: null,
      pbi: null
    };

    this.calcInitRangeTime();
  }

  now() {
    return Utils.now(true, "minutes");
  }

  request(params = {}, callback = response => {}) {
    if (!this.isRequesting) {
      try {
        const visible_time = this.props.visibleTime * 60;
        const query = Object.assign(
          {},
          {
            filter_inactive: this.props.filterInactive,
            visible_time,
            interval_size: this.props.intervalSize,
            container_width: this.props.eventContainerWidth,
            horizontal_blocks: 1,
            node_id: this.props.node_id
          },
          params
        );
        const task = new EpgTask(query);

        const paramsQueryString = Utils.buildQueryParams(task.getParams());

        //Toggle EPG cache
        if (settings && settings.epg_cache_enabled) {
          const epgResponse = epgCache.get(paramsQueryString);

          if (epgResponse !== undefined) {
            if (this.lastEpgRequest !== paramsQueryString) {
              //Se toma la respuesta en cache.
              callback(JSON.parse(epgResponse));
              return;
            }
          }
        }

        this.lastEpgRequest = paramsQueryString;
        const promise = RequestManager.addRequest(task);

        this.isRequesting = true;
        promise
          .then(
            function(response) {
              if (settings.epg_cache_enabled) {
                //Se 'cachea' la llamada a EPG, para no volverla a hacer
                epgCache.set(
                  paramsQueryString,
                  JSON.stringify(response),
                  this.epgCacheExpireTimeSeconds
                );
              }

              callback(response);
              this.isRequesting = false;
              if (this && this.props && this.props.setEpgError) {
                this.props.setEpgError(false);
              }
            }.bind(this)
          )
          .catch(
            function(reason) {
              this.isRequesting = false;
              //callback(reason.completeError);
              if (
                this &&
                this.props &&
                this.props.hideEpgOutside &&
                this.props.hasEpgError
              ) {
                //this.props.hideEpgOutside(true);
                if (this.props.setEpgError) {
                  this.props.setEpgError(true);
                }
              }
            }.bind(this)
          );
      } catch (e) {
        this.isRequesting = false;
        console.error("Error general e", e);
      }
    } else {
      console.log(
        "IPIGI ******** se pierde un request this.props:",
        this.props
      );
    }
  }

  parseResponse(response) {
    const map = {
      events: "body",
      channels: "channelsRender",
      data: "channels"
    };
    const result = { events: [], channels: [], data: [] };
    Object.keys(map).map(key => {
      const responseKey = map[key];
      while (response[responseKey].length > 0) {
        result[key].push(response[responseKey].splice(0, this.visibleRows));
      }
    });
    return result;
  }

  getQuantity() {
    return this.props.verticalOffset * 2 + this.props.visibleRows;
  }

  firstLoad(customParams = {}) {
    this.getChannelData();
    const params = Object.assign(
      {},
      {
        from: this.props.from,
        quantity: this.getQuantity(),
        date_from: this.memory_range.horizontal.start.format("YYYYMMDDHHmmss"),
        date_to: this.memory_range.horizontal.end.format("YYYYMMDDHHmmss"),
        horizontal_blocks:
          this.props.visibleTime * this.props.horizontalOffset + 1,
        infinite_fix: this.props.infinite_fix ? this.props.infinite_fix : ""
      },
      customParams
    );
    //console.log('[EPGFILTER] EpgPostales firstLoad params: ', params);

    this.request(
      params,
      function(response) {
        if (response.body) {
          this.minuteSize = response.constants
            ? response.constants.minute_size
            : null;
          this.rowWidth = response.constants
            ? response.constants.row_width
            : null;
          this.total = response.total;
          if (!this.total) {
            if (this.eventContainer) {
              this.eventContainer.innerHTML = `<p id="epg-nodata">${Metadata.get(
                "epg_nodata",
                "No hay canales disponibles"
              )}</p>`;
            }
            if (this.channelsContainer) {
              this.channelsContainer.innerHTML = "";
              return;
            }
          } else if (this.total <= this.getQuantity()) {
            this.isGoingToFetch = false;
            this.forceFill = true;
            this.fromNewRequest = this.getFromFiltered(
              response.entry.node_id,
              response.lastChannel
            );
          }

          const { events, channels, data } = this.parseResponse(response);

          this.currentHorizontalIndex = this.props.horizontalOffset;
          this.currentVerticalIndex = this.isGoingToFetch
            ? this.props.verticalOffset / this.props.visibleRows
            : 0;

          this.epg.schedules = this.initSchedules();
          this.epg.channels = channels;
          this.epg.events = events;
          this.epg.data = data;

          this.props.saveEpgData(this.epg, this.currentHorizontalIndex);

          if (!this.epg.events[this.currentVerticalIndex]) {
            return;
          }

          const renderedChannels = channels[this.currentVerticalIndex];
          const renderedEvents = events[this.currentVerticalIndex];
          const schedules = this.epg.schedules[this.currentHorizontalIndex];

          const nextFrom = this.props.from + this.props.verticalOffset;
          this.memory_visible.vertical.start =
            nextFrom > this.total ? nextFrom - this.total : nextFrom; //nextFrom == this.total ? nextFrom + 1 : nextFrom;
          this.renderInitial();
          window.SpatialNavigation.makeFocusable();

          //const active = document.querySelector('.epg-events-container .epg-events-row:first-of-type .epg-events-block:nth-child(2) .epg-event-active');
          const active = document.querySelector(
            ".focusable.epg-event-current.epg-event-item-container"
          );
          const element = active
            ? active
            : document.querySelector(
                `.epg-events-container .epg-events-row:first-of-type .epg-events-block:nth-child(2) .focusable`
              );

          if (
            typeof this.props.onFirstLoad === "function" &&
            element &&
            !this.props.isFullEpg
          ) {
            const channelId = element.getAttribute("data-channel-id");
            const eventId = element.getAttribute("data-event-id");
            let channel = this.epg.data.find(channel => {
              channel = channel.reduce(channel => channel);
              return channel.id === channelId;
            });
            if (channel) {
              channel = channel.reduce(channel => channel);
              const event = channel.events[this.currentHorizontalIndex].find(
                event => event.id === eventId
              );
              const initialData = { channel, event, focused: element };
              this.props.onFirstLoad(initialData);
            }
          } else {
            if (
              typeof this.props.onFirstLoad === "function" &&
              element &&
              this.props.isFullEpg
            ) {
              let channelId = element.getAttribute("data-channel-id");
              let eventId = element.getAttribute("data-event-id");

              if (element.attributes) {
                if (element.attributes["data-channel-id"]) {
                  let test = element.attributes["data-channel-id"];
                  if (test && test.value) {
                    channelId = test.value;
                  }
                }
              }

              if (element.attributes) {
                if (element.attributes["data-event-id"]) {
                  let test = element.attributes["data-event-id"];
                  if (test && test.value) {
                    eventId = test.value;
                  }
                }
              }

              let channel = this.epg.data.find(channel => {
                channel = channel.reduce(channel => channel);
                return channel.id === channelId;
              });
              if (channel && !this.props.fullToHide) {
                channel = channel.reduce(channel => channel);
                const event = channel.events[this.currentHorizontalIndex].find(
                  event => event.id === eventId
                );
                const initialData = { channel, event, focused: element };
                this.props.onFirstLoad(initialData);
              }
            }
          }
        }
      }.bind(this)
    );
  }

  getVerticalMemorySize() {
    return this.visibleRows + this.props.verticalOffset * 2;
  }

  setEpgDefaultFocus() {
    if (Utils.isModalHide()) {
      let currentEventId = Utils.idEventCurrent(
        this.epg,
        this.currentHorizontalIndex
      );
      console.log("FOCUS MINI", currentEventId);
      Utils.isMiniEPGOpen() &&
        window.SpatialNavigation.focus(
          currentEventId || ".channels-container .focusable"
        );
    }
  }

  setCurrentData() {
    try {
      const { focused, block, row } = this.getFocusedData();

      console.log("IPIGI  setCurrentData focused *******", focused);

      if (focused) {
        const channelId = focused.getAttribute("data-channel-id");
        const eventId = focused.getAttribute("data-event-id");
        let channel =
          this.epg.data[this.currentVerticalIndex] &&
          this.epg.data[this.currentVerticalIndex].find(
            channel => channel && channel.id === channelId
          );
        if (!channel) {
          for (const iCh in this.epg.data) {
            channel = this.epg.data[iCh].find(c => c && c.id === channelId);
            if (channel) break;
          }
        }
        if (channel) {
          if (channel.events[this.currentHorizontalIndex]) {
            let event = channel.events[this.currentHorizontalIndex].find(
              event => event.id === eventId
            );
            event.channel_group_id = channel.group_id;
            this.current = { channel, event, focused };
            if (typeof this.props.onSetCurrentData === "function") {
              this.props.onSetCurrentData({ channel, event, focused });
            }
            if (typeof this.props.changeCurrentGroupId === "function") {
              this.props.changeCurrentGroupId(this.current);
            }
          } else {
            //TODO: ¿Aún pasa lo de los indices?
            console.error(
              "RDGV: iVertical 0> currentVerticalIndex: ",
              this.currentVerticalIndex,
              " iHorizontal",
              this.currentHorizontalIndex,
              " data",
              this.epg.data
            );
          }
        } else {
          //TODO: ¿Aún pasa lo de los indices?
          console.error(
            "RDGV: iVertical 1> currentVerticalIndex: ",
            this.currentVerticalIndex,
            " iHorizontal",
            this.currentHorizontalIndex,
            " data",
            this.epg.data
          );
        }
      }
    } catch (error) {
      //TODO: ¿Aún pasa lo de los indices?
      console.error(
        "RDGV: iVertical 2> currentVerticalIndex: ",
        this.currentVerticalIndex,
        " iHorizontal",
        this.currentHorizontalIndex,
        " data",
        this.epg.data
      );
    }
  }

  onFocus(e) {
    console.log("[EpgPostales] onFocus");
    LayersControl.hideMenu()
    this.setCurrentData();
    if (this.timerOnFocus) clearTimeout(this.timerOnFocus);
    this.timerOnFocus = setTimeout(() => {
      // console.log('[dann][EpgPostales] hideEPG');
      const { target } = e;
      // After setCurrentData above, handle/fire pip
      this.playPipPlayer();
      this.timerOnFocus = null;
    }, 1000);
  }

  removeListeners() {
    console.log("[EpgPostales] removeListeners");
    if (this.eventContainer) {
      this.eventContainer.removeEventListener("sn:focused", this.onFocus);
      this.eventContainer.removeEventListener(
        "sn:navigatefailed",
        this.changePageHandler
      );
      this.eventContainer.removeEventListener("click", this.handleClick);
      this.eventContainer.removeEventListener("keyup", this.resetTimer);
      this.eventContainer.removeEventListener("keydown", this.keyPressListener);
    }
  }

  addListeners() {
    console.log("[EpgPostales] addListeners", this.eventContainer);
    if (this.eventContainer) {
      this.eventContainer.addEventListener("sn:focused", this.onFocus);
      this.eventContainer.addEventListener(
        "sn:navigatefailed",
        this.changePageHandler
      );
      this.eventContainer.addEventListener("click", this.handleClick);
      this.eventContainer.addEventListener("keyup", this.resetTimer);
      this.eventContainer.addEventListener("keydown", this.keyPressListener);
    }
  }

  handleClick = () => {
    store.dispatch(navigateFrom("MiniEPG"));
    const state = store.getState();
    if (state && state.islive && this.props.isChangingChannel()) {
      //Si el cambio de canal esta en progreso, evitar mostar EPG
      return;
    }

    if (!this.handleDelayKeyOkTimer) {
      super.handleClick();
      this.changeFirstChannelMiniEPG = true;
    }
  };

  moreInfo = e => {
    e.preventDefault();
    e.stopPropagation();
    this.sendAllToTheCard = true;
    super.sendToVcard();
  };

  setHandleDelayKeyOkTimer = () => {
    this.handleDelayKeyOkTimer = setTimeout(() => {
      clearTimeout(this.handleDelayKeyOkTimer);
      this.handleDelayKeyOkTimer = null;
    }, this.handleDelayKeyOkSafeTime);
  };

  cbOk = () => {
    this.props.onPressYellowButton();
    this.setHandleDelayKeyOkTimer();
  };

  showModalOTT = () => {
    this.setHandleDelayKeyOkTimer();
    //this.props.hideEpgOutside();
    const type_user_menu = this.props.user.is_user_logged_in
      ? this.props.user.is_user_logged_in
      : 0;
    const { event } = this.current;
    let dateBegin = event.date_begin;
    let dateEnd = event.date_end;
    let isCurrent = Utils.isDateBetween(dateBegin, dateEnd);
    const menuItems = [];
    if (isCurrent) {
      menuItems.push({
        title: Translator.get("detail_play", "Ver"),
        visible: 1,
        action: () => {
          if (!this.handleDelayKeyOkTimer) {
            this.props.modalOttPlayAction();
          }
        }
      });
    } else {
      menuItems.push({
        title: Translator.get("more_info", "Más info"),
        visible: 1,
        action: () => {
          if (!this.handleDelayKeyOkTimer) {
            this.props.modalOttMoreInfoAction();
          }
        }
      });
    }
    if (event.ext_recordable == "1") {
      menuItems.push({
        title: Translator.get("grabar", "Grabar"),
        visible: type_user_menu == "1" ? 1 : 0,
        action: () => {
          this.props.modalOttNpvrAddAction();
        }
      });
    }
    menuItems.push(
      {
        title: Translator.get("recordar", "Recordar"),
        visible: type_user_menu == "1" ? 1 : 0,
        action: () => {
          this.props.modalOttAddReminderAction();
        }
      },
      {
        title: Translator.get("canales", "Canales"),
        visible: 1,
        action: () => {
          this.props.modalOttChannelsAction();
        }
      },
      {
        title: Translator.get("categorias", "Categorias"),
        visible: 1,
        action: () => {
          this.props.showModalOTTCategoryAction();
        }
      },
      {
        title: Translator.get("buscar", "Buscar"),
        visible: 1,
        action: () => {
          this.props.modalOttOpenSearchAction();
        }
      },
      {
        title: Translator.get("go_to_menu", "Ir al menú"),
        visible: 1,
        action: () => {
          this.props.showModalOTTGoToMenuAction();
        }
      }
    );
    store.dispatch(
      showModal({
        modalType: MODAL_EPG,
        modalProps: {
          menuItems: menuItems
        }
      })
    );
  };

  keyPressListener(e) {
    console.log("Listening [EPGPostales] keyPressListener");
    if (LayersControl.isUXVisible()) return;
    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    console.log(
      "Enter to Listening [EPGPostales] keyPressListener, currentKey:",
      currentKey
    );
    switch (currentKey) {
      case "OK":
        if (
          !this.handleDelayKeyOkTimer &&
          LocalStorage.getItem("config_remote_control") === "simple"
        ) {
          if (this.props.isFullEpg)
            this.handleDelayKeyOk(e, currentKey, this.showModalOTT);
          else this.handleDelayKeyOk(e, currentKey, this.cbOk);
        }
        break;
      case "GUIDE":
        e.preventDefault();
        e.stopPropagation();
        this.props.handleEPG();
        break;

      case "BLUE":
        //this.moreInfo(e);
        break;

      case "INFO":
        let isOTTGuy =
          !this.props.user ||
          !this.props.user.paymentMethods ||
            (this.props.user.paymentMethods &&
              !this.props.user.paymentMethods.hubcorporativofijogate &&
              !this.props.user.paymentMethods.hubfijovirtualgate);

        if (!isOTTGuy) {
          /*quitando funcionalidad de boton info para usuarios que no son ott
          e.preventDefault();
          e.stopPropagation();
          this.sendAllToTheCard = true;
          this.handleClick(e);
          */
        }
      case "UP":
      case "DOWN":
        /* TODO handleDelayKey Abstract for every device */
        this.handleDelayKey(e, currentKey);
        break;
      default:
        break;
    }
  }
  shouldComponentUpdate(nexprops, nextstate) {
    if (
      JSON.stringify(nexprops) != JSON.stringify(this.props) ||
      JSON.stringify(nextstate) != JSON.stringify(this.state)
    ) {
      return true;
    }
    return false;
  }

  changePageHandler(e) {
    const direction = e.detail.direction;
    if (direction === this.upDirection && this.isRequesting) {
      return;
    }
    switch (direction) {
      case this.rightDirection:
        //
        if (this.epg.events && this.epg.events[0] && this.epg.events[0][0]) {
          // FIXME. Cuando la EPG no traiga "pareja" la info en todos los canales? existe este escenario?
          let currHorIndex = this.currentHorizontalIndex;
          //console.error('RDGV2 changePageHandler, length: ', this.epg.events[0][0].length, this.currentHorizontalIndex);
          if (this.currentHorizontalIndex >= this.epg.events[0][0].length - 1) {
            // SI ya llegó al tope a la derecha, se mantiene el horizontal por si ahora baja -vertical- a sig página
            this.currentHorizontalIndex = currHorIndex;
            return; // Que no haga re render
          } else {
            this.currentHorizontalIndex += 1;
          }
          //this.currentHorizontalIndex = this.currentHorizontalIndex >= (this.epg.events[0][0].length - 1) ? this.currentHorizontalIndex : this.currentHorizontalIndex + 1;
        } else {
          this.currentHorizontalIndex += 1;
        }
        break;
      case this.leftDirection:
        const nextTimeshift = this.now().diff(
          this.memory_visible.horizontal.start,
          "minutes"
        );
        //console.error('RDGV1 maxTimeshift', this.maxTimeshift, 'nextTimeshift', nextTimeshift, 'eval', this.maxTimeshift < nextTimeshift);
        if (this.maxTimeshift < nextTimeshift) {
          //console.error('RDGV1 leftDirection entra en return', this.currentHorizontalIndex, this.epg);
          return;
        }
        if (this.currentHorizontalIndex > 0) {
          this.currentHorizontalIndex -= 1;
        }
        //console.error('RDGV1 leftDirectionthis.currentHorizontalIndex no entra en return: ', this.currentHorizontalIndex, this.epg);
        break;
      case this.downDirection:
        this.currentVerticalIndex += 1;
        if (
          (!this.isGoingToFetch &&
            this.epg.events.length == this.currentVerticalIndex) ||
          this.epg.events[this.currentVerticalIndex] === undefined
        ) {
          this.currentVerticalIndex = 0;
        }
        break;
      case this.upDirection:
        this.currentVerticalIndex -= 1;
        //console.error('RDGV1 upDirection.currentVerticalIndex: ', this.currentVerticalIndex);
        if (!this.isGoingToFetch && this.currentVerticalIndex < 0) {
          this.currentVerticalIndex = this.epg.events.length - 1;
        }
        break;
      default:
        return;
        break;
    }
    //console.error("RDGV2 [EpgPostales] changePageHandler++ horizontalOffset: ", this.props.horizontalOffset, ",currentVerticalIndex:", this.currentVerticalIndex, ",currentHorizontalIndex:", this.currentHorizontalIndex);
    this.nextRenderHandler(direction);
  }

  nextRenderHandler(direction) {
    //console.log('RDGV2 nextRenderHandler direction---: ', direction, 'currentVerticalIndex: ', this.currentVerticalIndex, 'currentHorizontalIndex', this.currentHorizontalIndex, this.epg);
    if (this.isRequesting) {
      this.waitToLoad(direction);
    } else if (
      this.isHorizontalDirection(direction) &&
      this.epg.events[this.currentVerticalIndex] &&
      this.epg.events[this.currentVerticalIndex][0] &&
      this.epg.events[this.currentVerticalIndex][0][this.currentHorizontalIndex]
    ) {
      this.renderNextEvents(direction);
    } else if (
      this.isVerticalDirection(direction) &&
      this.epg.events[this.currentVerticalIndex]
    ) {
      this.renderNextEvents(direction);
    }
  }

  isHorizontalDirection(direction) {
    return this.getDirectionType(direction) == this.horizontalDirection;
  }

  isVerticalDirection(direction) {
    return this.getDirectionType(direction) == this.verticalDirection;
  }

  waitToLoad(direction) {
    console.error("RDGV: waiting to load epg data");
    window.SpatialNavigation.pause();
    setTimeout(() => {
      this.nextRenderHandler(direction);
      if (!this.isRequesting) {
        window.SpatialNavigation.resume();
      }
    }, 200);
  }

  getDirectionType(direction) {
    if (direction == this.leftDirection || direction == this.rightDirection) {
      return this.horizontalDirection;
    }
    return this.verticalDirection;
  }

  renderInitial(verticalIndex) {
    if (Utils.isNotNullOrNotUndefined(verticalIndex)) {
      this.currentVerticalIndex = verticalIndex;
    }

    if (this.eventContainer) this.renderEvents();
    if (this.channelsContainer) this.renderChannels();
    if (this.schedulesContainer) this.renderSchedules();
    this.setEpgSnapShot();
    this.addListeners();
  }

  renderChannels() {
    if (
      this.epg &&
      this.epg.channels &&
      this.epg.channels[this.currentVerticalIndex]
    ) {
      this.channelsContainer.innerHTML = this.epg.channels[
        this.currentVerticalIndex
      ].join("");

      if (this.current && this.current.channel && this.current.channel.group_id) {
        const canPlayChannel = ChannelSingleton.canPlayChannel(this.current.channel.group_id);
        if (!canPlayChannel) {
          const activeChannel = document.querySelector(
            ".epg-channels-container .epg-channel-item-image-container"
          );

          activeChannel.classList.add("channelBlock");
        }
      }

    }
  }

  setEpgSnapShot() {
    if (
      this.channelsContainer &&
      this.schedulesContainer &&
      this.eventContainer
    ) {
      this.epgSnapShot = {
        channels: this.channelsContainer.innerHTML,
        schedules: this.schedulesContainer.innerHTML,
        events: this.eventContainer.innerHTML
      };
    }
  }

  getEpgSnapShot() {
    if (
      this.epgSnapShot &&
      this.channelsContainer &&
      this.schedulesContainer &&
      this.eventContainer
    ) {
      this.channelsContainer.innerHTML = this.epgSnapShot.channels;
      this.schedulesContainer.innerHTML = this.epgSnapShot.schedules;
      this.eventContainer.innerHTML = this.epgSnapShot.events;
    }
  }

  renderSchedules() {
    let nextSchedules = "";
    if (
      this.epg &&
      this.epg.schedules &&
      this.epg.schedules[this.currentHorizontalIndex]
    ) {
      this.epg.schedules[this.currentHorizontalIndex].forEach(
        (current, index) => {
          const width = this.props.intervalSize * this.minuteSize;
          //nextSchedules = `${nextSchedules}<div class=${`epg-hour`} data-time-index=${index} style='width: ${width}px;'>${moment(current).format('DD/MM HH.mm')}hs.</div>`;
          nextSchedules = `${nextSchedules}<div class=${`epg-hour`} data-time-index=${index} style='width: ${width}px;'>${moment(
            current
          ).format("HH.mm")}</div>`;
        }
      );
      this.schedulesContainer.innerHTML = nextSchedules;
    }
  }

  calculateVerticalIndex() {
    var index = this.currentVerticalIndex;
    var channelShows = document.getElementsByClassName("epg-channel-item-id");
    channelShows = Array.from(channelShows);
    var channelShowsValues = [];
    if (channelShows.length > 1) {
      channelShows.map(value => {
        channelShowsValues.push(value.innerHTML);
      });
    }
    const channelToCompare =
      channelShowsValues.length == 6
        ? channelShowsValues[1]
        : channelShowsValues[0];
    this.epg.data.map((value, key) => {
      if (value[0].number === channelToCompare) {
        index = key;
      }
    });
    return index;
  }

  renderEvents(direction = null) {
    //console.error("RDGV2 [EpgPostales] renderEvents horOffset: ", this.props.horizontalOffset, ",currentVerticalIndex:", this.currentVerticalIndex, ",currentHorizontalIndex:", this.currentHorizontalIndex);
    //console.info("RDGV2 [EpgPostales] renderEvents direction>>>>>>>>> ", direction);
    let nextEvents = "";
    let nextFocus = "";

    if (
      this.now().isBetween(
        this.memory_visible.horizontal.start,
        this.memory_visible.horizontal.end
      )
    ) {
      const diff = this.now().diff(this.memory_visible.horizontal.start, "m");
      const offset =
        this.eventContainer.offsetLeft === 0
          ? 153
          : this.eventContainer.offsetLeft; // caso para el render inicial pone la linea de tiempo al principio, es 153 por que this.eventContainer.offsetLeft siempre es 153 excepto en el primer render es 0
      const left = diff * this.minuteSize + offset;
      nextEvents = `${nextEvents}<span  style='left:${left}px;display:none;' id='line-time'></span>`;
    }
    this.index = this.calculateVerticalIndex();

    if (this.epg.events && this.epg.events[this.index]) {
      //console.info("RDGV2 [EpgPostales] renderEvents 2 this.epg: ", this.epg);
      this.epg.events[this.index].forEach((row, index) => {
        //console.info("RDGV2 [EpgPostales] renderEvents 2 currentHorizontalIndex: ", (row[this.currentHorizontalIndex] ? ' con valor' : 'undefined*****'));
        nextEvents = `${nextEvents}<div id=${`row-${index}`} class='epg-events-row' style='width: ${
          this.rowWidth
        }px;'>${row[this.currentHorizontalIndex]}</div>`;
      }, this);
      const current = this.getFocusedData();
      this.eventContainer.innerHTML = nextEvents;
      let currentEventId = Utils.idEventCurrent(
        this.epg,
        this.currentHorizontalIndex
      );
      nextFocus = !direction
        ? currentEventId || ".epg-events-container .focusable"
        : this.getDirectionType(direction) == this.horizontalDirection &&
          current.row &&
          current.row.id
        ? `#${current.row.id} .focusable`
        : direction == this.upDirection
        ? `.epg-events-container .epg-events-row:last-of-type .focusable`
        : `.epg-events-container .focusable`;
    }
    if (Utils.isModalHide()) {
      //Como ambas epgs estan en el dom, el selector actual daba preferencia a la epg mini, se valida que se este mostrando full epg y se usa su selector.
      if (
        this.eventContainer.parentNode &&
        this.eventContainer.parentNode.parentNode &&
        this.eventContainer.parentNode.parentNode.parentNode &&
        this.eventContainer.parentNode.parentNode.parentNode.parentNode &&
        this.eventContainer.parentNode.parentNode.parentNode.parentNode.style &&
        this.eventContainer.parentNode.parentNode.parentNode.parentNode.style
          .display == "block"
      ) {
        nextFocus = " " + nextFocus;
        let toArray = [
          ...this.eventContainer.parentNode.parentNode.parentNode.parentNode
            .classList
        ];
        toArray.forEach(x => {
          nextFocus = "." + x + nextFocus;
        });
      }
      console.log("FOCUS MINI renderEvents", nextFocus);
      Utils.isMiniEPGOpen() && window.SpatialNavigation.focus(nextFocus);
    }
  }

  renderNextEvents(direction) {
    //console.error("RDGV2 [EpgPostales] renderNextEvents** horizontalOffset: ", this.props.horizontalOffset, ",currentVerticalIndex:", this.currentVerticalIndex, ",currentHorizontalIndex:", this.currentHorizontalIndex);
    //Reset memoria
    let nextFrom;
    if (this.isHorizontalDirection(direction)) {
      if (direction == this.rightDirection) {
        this.memory_visible.horizontal.start = moment(
          this.memory_visible.horizontal.end
        );
        this.memory_visible.horizontal.end = moment(
          this.memory_visible.horizontal.start
        ).add(this.props.visibleTime, "hours");
      } else {
        this.memory_visible.horizontal.end = moment(
          this.memory_visible.horizontal.start
        );
        this.memory_visible.horizontal.start = moment(
          this.memory_visible.horizontal.end
        ).subtract(this.props.visibleTime, "hours");
      }
    } else {
      if (direction == this.downDirection) {
        nextFrom = this.memory_visible.vertical.start + this.props.visibleRows;
        this.memory_visible.vertical.start =
          nextFrom > this.total ? nextFrom - this.total : nextFrom;
      } else {
        nextFrom = this.memory_visible.vertical.start - this.props.visibleRows;
        this.memory_visible.vertical.start =
          nextFrom < 0 ? this.total - Math.abs(nextFrom) : nextFrom;
      }
    }
    //Renders
    if (this.eventContainer) {
      //console.info("RDGV1 [EpgPostales] renderNextEvents render events direction: ", direction);
      this.renderEvents(direction);
    }
    if (
      this.getDirectionType(direction) == this.verticalDirection &&
      this.channelsContainer
    ) {
      this.renderChannels();
    } else if (this.schedulesContainer) {
      this.renderSchedules();
    }
    //Carga de datos
    if (this.isGoingToFetch || this.forceFill) {
      const loadIn = 2;
      if (
        !this.isRequesting &&
        direction == this.rightDirection &&
        this.epg.events[this.currentVerticalIndex][0].length ==
          this.currentHorizontalIndex + loadIn
      ) {
        if (this.changeFirstChannelMiniEPG) {
          this.memory_range.vertical.start = this.props.from;
        }
        this.memory_range.horizontal.start = moment(
          this.memory_visible.horizontal.start
        ).add(loadIn * this.props.visibleTime, "hours");
        this.memory_range.horizontal.end = moment(
          this.memory_range.horizontal.start
        ).add(
          this.props.horizontalOffset * this.props.visibleTime * 2 +
            this.props.visibleTime,
          "hours"
        );
        this.loadData(direction);
      } else if (
        !this.isRequesting &&
        direction == this.leftDirection &&
        this.currentHorizontalIndex == loadIn
      ) {
        this.memory_range.horizontal.end = moment(
          this.memory_visible.horizontal.start
        ).subtract(loadIn * this.props.visibleTime, "hours");
        this.memory_range.horizontal.start = moment(
          this.memory_range.horizontal.end
        ).subtract(
          this.props.horizontalOffset * this.props.visibleTime * 2 +
            this.props.visibleTime,
          "hours"
        );
        this.loadData(direction);
      } else if (
        !this.isRequesting &&
        direction == this.downDirection &&
        this.epg.events.length == this.currentVerticalIndex + 1
      ) {
        nextFrom = this.memory_visible.vertical.start - this.props.visibleRows;
        this.memory_range.vertical.start =
          nextFrom > 0 ? nextFrom : this.total - Math.abs(nextFrom);
        this.memory_range.horizontal.start = moment(
          this.memory_visible.horizontal.start
        ).subtract(
          this.props.horizontalOffset * this.props.visibleTime,
          "hours"
        );
        this.memory_range.horizontal.end = moment(
          this.memory_visible.horizontal.end
        ).add(this.props.horizontalOffset * this.props.visibleTime, "hours");
        this.loadData(direction);
      } else if (
        !this.isRequesting &&
        direction == this.upDirection &&
        this.currentVerticalIndex == 0
      ) {
        nextFrom =
          this.memory_visible.vertical.start - this.props.verticalOffset;
        this.memory_range.vertical.start =
          nextFrom > 0 ? nextFrom : this.total - Math.abs(nextFrom);
        this.memory_range.horizontal.start = moment(
          this.memory_visible.horizontal.start
        ).subtract(
          this.props.horizontalOffset * this.props.visibleTime,
          "hours"
        );
        this.memory_range.horizontal.end = moment(
          this.memory_visible.horizontal.end
        ).add(this.props.horizontalOffset * this.props.visibleTime, "hours");
        this.loadData(direction);
      }
    }
  }

  getFromFiltered(node_id, last) {
    var from = 0;
    var channels = new ChannelSingleton();
    var channelFilter = channels.getFilteredChannelsByNode(node_id);
    channelFilter.map((value, index) => {
      if (value.id === last) {
        from = index + 1;
      }
    });
    return from;
  }

  clearFromRigth(direction) {
    if (direction == this.rightDirection) {
      this.changeFirstChannelMiniEPG = false;
      if (typeof this.props.setFromProps == "function") {
        this.props.setFromProps(false);
      }
    }
  }

  loadData(direction, customParams = {}) {
    //console.log('[EPGFILTER] EpgPostales loadData');
    const from =
      this.fromNewRequest && direction == this.downDirection
        ? this.fromNewRequest
        : this.memory_range.vertical.start;
    const quantity = this.getQuantity();
    const infinite_fix =
      from + quantity > this.total ? from + quantity - this.total : "";

    this.clearFromRigth(direction);

    const params = Object.assign(
      {},
      {
        from,
        quantity,
        infinite_fix,
        date_from: this.memory_range.horizontal.start.format("YYYYMMDDHHmmss"),
        date_to: this.memory_range.horizontal.end.format("YYYYMMDDHHmmss"),
        horizontal_blocks:
          this.props.visibleTime * this.props.horizontalOffset + 1
      },
      customParams
    );

    console.log("IPIGI fullTohide en postales loadData: ", params);

    this.request(
      params,
      function(response) {
        const { events, channels, data } = this.parseResponse(response);
        this.total = response.total;
        if (this.total <= this.getQuantity()) {
          this.fromNewRequest = this.getFromFiltered(
            response.entry.node_id,
            response.lastChannel
          );
        } else {
          this.fromNewRequest = 0;
        }
        if (this.isVerticalDirection(direction)) {
          this.epg.events = events;
          this.epg.channels = channels;
          this.epg.data = data;
          this.currentHorizontalIndex = this.props.horizontalOffset;

          if (direction == this.downDirection) {
            this.currentVerticalIndex =
              this.props.visibleRows === 1
                ? this.props.visibleRows
                : this.currentVerticalIndex -
                  this.props.verticalOffset / this.props.visibleRows;
          } else {
            this.currentVerticalIndex =
              this.props.visibleRows === 1
                ? this.props.verticalOffset
                : this.currentVerticalIndex +
                  this.props.verticalOffset / this.props.visibleRows;
          }
          if (this.epg.data.length <= this.currentVerticalIndex) {
            this.currentVerticalIndex = 0;
          }

          if (this.fromNewRequest) {
            this.currentVerticalIndex = -1;
          }
        } else {
          this.epg.schedules =
            direction == this.rightDirection
              ? [...this.epg.schedules, ...this.initSchedules()]
              : [...this.initSchedules(), ...this.epg.schedules];

          this.epg.events = this.epg.events.map((page, i) => {
            if (events[i]) {
              return page.map((channels, cIndex) => {
                const next = events[i][cIndex];
                return direction == this.rightDirection
                  ? [...channels, ...next]
                  : [...next, ...channels];
              }, this);
            }
          }, this);

          this.epg.data = this.epg.data.map((page, i) => {
            return page.map((channels, cIndex) => {
              const next = data[i][cIndex];
              const events =
                direction == this.rightDirection
                  ? [...channels.events, ...next.events]
                  : [...next.events, ...channels.events];
              channels.events = events;
              return channels;
            }, this);
          }, this);

          if (direction == this.leftDirection) {
            this.currentHorizontalIndex += events[0][0].length;
          }
        }
        this.props.saveEpgData(this.epg, this.currentHorizontalIndex);
      }.bind(this)
    );
  }

  hideCoverFlow(isChangeChannel = false) {
    const selector = ".color-codes .focusable";
    console.log("[EpgPostales] hideCoverFlow");
    super.hideCoverFlow(selector, isChangeChannel);
    this.props.focusSearchColor();
  }

  componentDidMount() {
    this.firstLoad();
    if (typeof this.props.setMoreInfoFunction === "function")
      this.props.setMoreInfoFunction(this.moreInfo);

    this.setEpgDefaultFocus();

    if (!this.idTimeMini) {
      let now = new Date();
      let diffMinutes =
        now.getMinutes() >= 30 ? 60 - now.getMinutes() : 30 - now.getMinutes();
      let diffMilisecons = diffMinutes * 60000;

      this.idTimeMini = setTimeout(() => {
        this.doRequest();
      }, diffMilisecons);
    }
  }

  doRequest() {
    console.log("[AAF] EPGDataRequest EpgPostales primer llamado doRequest");
    this.sendFirstLoad(this.props);
    let timeToSendRequest = JSON.parse(
      Metadata.get("time_to_request", '{"default":{"time":"1800000"}}')
    ); //15 minutos
    const region = DeviceStorage.getItem("region");
    timeToSendRequest = timeToSendRequest[region]
      ? parseInt(timeToSendRequest[region].time)
      : parseInt(timeToSendRequest["default"].time);
    this.idIntervalMini && clearInterval(this.idIntervalMini);

    const userLoggedIn = store.getState().user;
    let uid = null;
    if (userLoggedIn.user_id) {
      uid = userLoggedIn.user_id;
    }
    let dataInterval = EPGDataRequest.getRequestInterval(uid);
    this.idIntervalMini = setInterval(() => {
      if (dataInterval && dataInterval.request_interval > 0) {
        console.log("[AAF] EPGDataRequest EpgPostales entra en interval");
        // Hacemos un delay...
        setTimeout(() => {
          console.log(
            "[AAF] EPGDataRequest EpgPostales entra en interval luego al timeout para hacer el request, lanzando request"
          );
          this.sendFirstLoad(this.props);
        }, dataInterval.request_interval);
      } else {
        console.log(
          "[AAF] EPGDataRequest EpgPostales NO entra en interval luego al timeout para hacer el request, lanzando request"
        );
        this.sendFirstLoad(this.props);
      }
    }, timeToSendRequest);
  }

  componentWillUnmount() {
    clearInterval(this.idIntervalMini);
    clearTimeout(this.idTimeMini);
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
    // this.removeListeners();
  }

  componentWillReceiveProps(newProps) {
    //console.log('[EPGFILTER] EpgPostales componentWillReceiveProps', Object.getPrototypeOf(this.constructor).name, newProps);
    /*
    if (this.props.showCoverFlow === false && newProps.showCoverFlow === true) {

      this.launchCoverFlow();
    }
    */

    if (newProps.fromProps && !this.changeFirstChannelMiniEPG) {
      this.changeFirstChannelMiniEPG = true;
    }

    this.updatingTimeAfterHideEpg(newProps);
    // console.log('IPIGI +++++ fullTohide en postales willreceive, props, newProps: ', this.props, newProps);
    // Si esta ocultándose, se forza el reset & first load
    let canPlayChannel = ChannelSingleton.canPlayChannel(newProps.groupId);
    if (
      !newProps.fromMiniEpg &&
      newProps.fullToHide === true &&
      this.props.node_id !== newProps.node_id
    ) {
      let y = 0;
      this.reset();
      this.firstLoad({
        node_id: newProps.node_id,
        from: newProps.from,
        quantity: newProps.quantity,
        infinite_fix: newProps.infinite_fix
      });
    } else if (!Utils.isMiniEPGOpen() && !Utils.isLineTime()) {
      this.sendEpgWhenHide(newProps);
    } else {
      if (
        this.props.node_id !== newProps.node_id ||
        this.props.from !== newProps.from
        //|| newProps.forceUpdate
        // || (this.props.from === newProps.from && this.currentVerticalIndex !== 0 && this.props.checkStatusEPG)
      ) {
        if (canPlayChannel !== false) {
          this.reset();
          this.firstLoad({
            node_id: newProps.node_id,
            from: newProps.from,
            quantity: newProps.quantity,
            infinite_fix: newProps.infinite_fix
          });
        }
      } else if (newProps.forceUpdate && Utils.isLineTime()) {
        const state = store.getState();

        new ChannelSingleton()
          .getChannelByGroupId(state.player.source.videoid)
          .then(async channel => {
            let index = this.epg.data.findIndex(
              data => data[0].number == channel.id
            );

            //Es otra pagina, mostrar el canal guardado
            if (index < 0 && canPlayChannel !== false) {
              this.reset();
              this.getEpgSnapShot();
              this.firstLoad({
                node_id: newProps.node_id,
                from: newProps.from,
                quantity: newProps.quantity,
                infinite_fix: newProps.infinite_fix
              });
            } else {
              this.renderInitial(index);
            }
          });
      }
    }

    //if (this.props.node_id !== newProps.node_id || this.props.from !== newProps.from || newProps.forceUpdate) {
    //if(this.props.from !== newProps.from || newProps.forceUpdate) {
    //console.log('[EPGFILTER] EpgPostales componentWillReceiveProps entra a update');

    //}
  }
  componentWillUpdate() {
    // this.removeListeners();
  }

  componentDidUpdate() {
    //console.log('[EPGFILTER] EpgPostales componentDidUpdate');
    if (!this.state.coverFlow) {
      this.addListeners();
    } else {
      this.removeListeners();
    }

    this.eventContainerUpdater();
  }

  sendFirstLoad(newProps) {
    this.reset();
    this.firstLoad({
      node_id: newProps.node_id,
      from: newProps.from,
      quantity: newProps.quantity,
      infinite_fix: newProps.infinite_fix
    });
  }

  sendEpgWhenHide(newProps) {
    if (!this.isRequesting) {
      this.sendFirstLoad(newProps);
    } else {
      if (this.idRequestToEpg) clearInterval(this.idRequestToEpg);
      this.idRequestToEpg = setInterval(() => {
        if (!this.isRequesting) {
          this.sendFirstLoad(newProps);
          clearInterval(this.idRequestToEpg);
        }
      }, 1000);
    }
  }

  updatingTime(forceUpdate = false, nextProps = null) {
    const now = this.now();
    const time = now.toObject();
    // console.log('[dann] setTimeout exec');
    if (
      time.minutes % Metadata.get("epg_interval_time", 5) === 0 ||
      forceUpdate
    ) {
      // Que no lance la llamada si viene filtro (esto viene del willreceive y ahi ya hace el firsload con el filtro)
      if (
        Utils.isNotNullOrNotUndefined(nextProps) &&
        Utils.isNullOrUndefined(nextProps.node_id)
      ) {
        //console.log('[EPEGE] epgpostales updatingTime, hace reset y firstload');
        this.reset();
        this.firstLoad();
      }
    } else if (forceUpdate) {
      this.reset();
    } else {
      this.renderInitial();
    }
    this.eventContainerUpdater();
  }

  isHandleUpdatingTime() {
    const { checkStatusCoverFlowCH, checkStatusEPG, isMiniEpg } = this.props;
    return (
      !checkStatusEPG &&
      !checkStatusCoverFlowCH &&
      !LayersControl.isUXVisible() &&
      isMiniEpg
    );
  }

  eventContainerUpdater() {
    if (this.timerEventContainerUpdater)
      clearTimeout(this.timerEventContainerUpdater);
    if (this.isHandleUpdatingTime()) {
      // console.log('[dann] setTimeout set');
      this.timerEventContainerUpdater = setTimeout(
        this.updatingTime,
        this.timerUpdaterMin
      );
    }
  }

  updatingTimeAfterHideEpg(newProps) {
    const { isMiniEpg, checkStatusEPG } = this.props;
    if (
      checkStatusEPG !== newProps.checkStatusEPG &&
      (!newProps.checkStatusEPG || newProps.receiveOK) &&
      !isMiniEpg
    ) {
      if (this.timerEventContainerUpdater)
        clearTimeout(this.timerEventContainerUpdater);
      this.updatingTime(true, newProps);
    }
  }

  render() {
    //console.log('[EPGFILTER] EpgPostales render', this.props, this.state);
    // ir a payment
    if (this.state.showSubscrition) {
      const { groupId, offerId, pbi } = this.paymentData;

      console.log(
        "[PAYMENT]  redirect a payment",
        this.paymentData,
        store.getState().user.isAnonymous
      );
      if (groupId && offerId) {
        this.props.handleEPG();
        const userLoggedIn = store.getState().user.isAnonymous === false;
        /* if(userLoggedIn) {
          return <Redirect
            to={{
              pathname: `/payment/${groupId}/${offerId}`,
              state: pbi
            }}
            push={true}
          />
        }
        else {
          return <Redirect
            to={{
              pathname: '/register',
              state: pbi
            }}
            push={true}
            />
        }*/
      }
    }

    if (this.state.showVCard) {
      console.info("showVCard state", this.state);
      const { channel, event } = this.current;
      if (channel && event) {
        if (this.sendAllToTheCard == true) {
          event.keyOfControl = true;
        }

        this.props.handleEPG();
        // this.props.closePlayer();
        // Se agrega el node_id para que no se rompa el player
        event.node_id = this.props.node_id;
        let eventData = JSON.stringify({ event });
        this.props.goToCard(
          `/epg/${channel.group_id}?eventData=${encodeURI(eventData)}`
        );
        /*  return <Redirect
            push={!Utils.isDateBetween(event.date_begin, event.date_end)}
            to={{
              pathname: `/epg/${channel.group_id}?eventData=${encodeURI(eventData)}`
            }} />*/
      }
    }

    //console.error('levelrdgv', this.props.levelChannels);
    return (
      <div>
        {this.props.isPlayingLiveAsFull &&
          Utils.getCoverFlowVisibilityFromMetadata().enable && (
            <CoverFlow
              from="EPG POSTALES"
              channels={this.props.levelChannels}
              current={this.current}
              show={this.state.coverFlow}
              onPressYellowButton={this.hideCoverFlow}
              onPressBackButton={this.hideCoverFlow}
              onSelect={this.onSelectCard}
              onChangeChannel={channel => {
                this.props.hideEpgOutside(channel.group_id, channel);
                this.hideCoverFlow(true);
              }}
            />
          )}
        <div className="epg-main">
          <div
            className="epg-schedule"
            ref={div => (this.schedulesContainer = div)}
          >
            <div
              className="epg-schedule-container"
              style={{ width: this.rowWidth }}
            />
          </div>
          <div
            className="epg-channels-container"
            ref={div => (this.channelsContainer = div)}
            dangerouslySetInnerHTML={{
              __html: this.state.renderedChannels.join("")
            }}
          />
          <div
            className="epg-events-container"
            ref={div => (this.eventContainer = div)}
          />
        </div>
      </div>
    );
  }
}

Epg.propTypes = {
  filterInactive: PropTypes.number,
  verticalOffset: PropTypes.number,
  horizontalOffset: PropTypes.number,
  visibleTime: PropTypes.number,
  visibleRows: PropTypes.number,
  intervalSize: PropTypes.number,
  eventContainerWidth: PropTypes.number,
  node_id: PropTypes.string,
  from: PropTypes.number,
  quantity: PropTypes.number,
  infinite_fix: PropTypes.number,
  enableCoverFlow: PropTypes.bool,
  onSetCurrentData: PropTypes.func,
  onFirstLoad: PropTypes.func,
  playPipPlayer: PropTypes.func,
  closePipPlayer: PropTypes.func,
  killPipTimeout: PropTypes.func,
  updateEpg: PropTypes.func,
  enableColorActions: PropTypes.func,
  disableColorActions: PropTypes.func,
  levelChannels: PropTypes.array,
  hideEpgOutside: PropTypes.func,
  focusSearchColor: PropTypes.func
};

Epg.defaultProps = {
  filterInactive: 0,
  verticalOffset: 5,
  horizontalOffset: 3,
  visibleTime: 2,
  visibleRows: 5,
  intervalSize: 30,
  eventContainerWidth: 1126,
  node_id: null,
  from: 0,
  quantity: 15,
  infinite_fix: 0,
  enableCoverFlow: true,
  onSetCurrentData: () => {},
  onFirstLoad: () => {},
  playPipPlayer: () => {},
  closePipPlayer: () => {},
  killPipTimeout: () => {},
  updateEpg: () => {},
  enableColorActions: () => {},
  disableColorActions: () => {},
  levelChannels: [],
  hideEpgOutside: () => {},
  focusSearchColor: () => {}
};

/*
Epg.contextTypes = {
  router: PropTypes.object.isRequired
};
*/

export default Epg;
