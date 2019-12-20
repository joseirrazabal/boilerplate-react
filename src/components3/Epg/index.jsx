import React from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import store from './../../store'

import EpgLogic from './EpgLogic'
import CoverFlow from "./CoverFlow"
import Device from "../../devices/device"

// Utils
import LayersControl from "../../utils/LayersControl"
import Utils from '../../utils/Utils'
import PlayerStreamingUtils from "../../utils/PlayerStreamingUtils"

// Requests
import RequestManager from './../../requests/RequestManager'
import EpgTask from './../../requests/tasks/epg/EpgTask'

// Styles
import './styles/epg.css'

class Epg extends EpgLogic {
  constructor(props) {
    super(props);

    /**
     * DOM references
     */
    this.schedulesContainer = null;
    this.channelsContainer  = null;
    this.eventContainer     = null;

    /**
     * Control flags
     */
    this.isRequesting     = false;
    this.visibleRows      = this.props.visibleRows;
    this.minuteSize       = 10;
    this.rowWidth         = this.props.eventContainerWidth;
    this.total            = null;
    this.navTimer         = null;
    this.lastKey          = null;
    this.isKeysBloqued    = false;
    this.delayKeyTime     = 50;
    this.maxTimeshift     = 120; //minutos


    this.platform = Device.getDevice().getPlatform();

    this.getVerticalMemorySize = this.getVerticalMemorySize.bind(this);
    this.sendAllToTheCard = null;
    this.keys = Device.getDevice().getKeys();

    this.visible_range    = {
      horizontal  : { start : null, end   : null },
      vertical    : {
        start : (this.props.from + this.visibleRows) + 1,
        end: this.getVerticalMemorySize() - this.visibleRows,
      }
    };

    this.memory_range     = {
      horizontal  : { start : null, end   : null },
      vertical    : { start : this.props.from, end: this.getVerticalMemorySize() }
    };

    this.epg              = {
      up: {
        channels: [],
        events: []
      },
      center: {
        channels: [],
        events: []
      },
      down: {
        channels: [],
        events: []
      },
    };

    this.data             = {
      up: [],
      center: [],
      down: [],
    };

    this.state            = {
      schedules: [],
      renderedChannels: [],
      renderedEvents:[],
      showVCard: false,
      showSubscrition: false,
      count: 0,
    };

    this.paymentData = {
      groupId: null,
      offerId: null,
      pbi: null
    };

    /**
     * Methods
     */
    this.calcInitRangeTime    = this.calcInitRangeTime.bind(this);
    this.initSchedules        = this.initSchedules.bind(this);
    this.request              = this.request.bind(this);
    this.firstLoad            = this.firstLoad.bind(this);
    this.onFocusMoveLeft      = this.onFocusMoveLeft.bind(this);
    this.onFocusMoveRight     = this.onFocusMoveRight.bind(this);
    this.onFocusMoveUp        = this.onFocusMoveUp.bind(this);
    this.onFocusMoveDown      = this.onFocusMoveDown.bind(this);
    this.onFocus              = this.onFocus.bind(this);
    this.onEventScroll        = this.onEventScroll.bind(this);

    this.moveUp               = this.moveUp.bind(this);
    this.moveDown             = this.moveDown.bind(this);
    this.moveLeft             = this.moveLeft.bind(this);
    this.moveRight            = this.moveRight.bind(this);

    /**
     * Initializations
     */
    this.calcInitRangeTime();
    this.playerStreamingUtils = new PlayerStreamingUtils();
  }

  now() {
    return Utils.now(true);
  }

  calcInitRangeTime() {
    const now           = this.now();
    const time          = now.toObject();
   // time.hours          -= (time.hours % 2) ? 1: 0;
    time.minutes        = time.minutes>=30?30:0;
    time.seconds        = 0;
    time.milliseconds   = 0;
    this.visible_range.horizontal.start  = moment(time);
    this.visible_range.horizontal.end    = moment(this.visible_range.horizontal.start).add(this.props.visibleTime, 'hours');
    this.memory_range.horizontal.start   =moment(time);
    this.memory_range.horizontal.end     = moment(this.memory_range.horizontal.start).add(this.props.horizontalOffset * 3, 'hours');
  }

  initSchedules() {
    const schedules = [];
    if (this.memory_range.horizontal.start !== null) {
      const start = moment(this.memory_range.horizontal.start);
      const end = moment(this.memory_range.horizontal.end);
      while (start.unix() < end.unix()) {
        schedules.push(moment(start));
        start.add(this.props.intervalSize, 'm');
      }
    }
    return schedules;
  }

  reset() {
    this.total            = null;
    this.navTimer         = null;

    this.epg              = {
      up: {
        channels: [],
        events: []
      },
      center: {
        channels: [],
        events: []
      },
      down: {
        channels: [],
        events: []
      },
    };

    this.data             = {
      up: [],
      center: [],
      down: [],
    };

    this.current = {
      channel: {},
      event: {}
    };

    this.state            = {
      schedules: [],
      renderedChannels: [],
      renderedEvents:[],
      showVCard: false,
      showSubscrition: false,
    };

    this.paymentData = {
      groupId: null,
      offerId: null,
      pbi: null
    };
  }

  request(params = {}, callback = (response) => {}) {
    if (!this.isRequesting) {
      try {
        const visible_time = this.props.visibleTime * 60;
        const query = Object.assign({}, {
          filter_inactive   : this.props.filterInactive,
          visible_time,
          interval_size     : this.props.intervalSize,
          container_width   : this.props.eventContainerWidth,
          horizontal_blocks : 1,
          node_id: this.props.node_id
        }, params);
        const task = new EpgTask(query);
        const promise = RequestManager.addRequest(task);
        this.isRequesting = true;
        promise.then((response) => {
          callback(response);
          this.isRequesting = false;
        });
      } catch (e) {
        this.isRequesting = false;
        console.error('error getting epg data',e);
      }
    }
  }

  getFirstData(response) {
    const map = {events: "body", channels: "channelsRender", data: "channels"};
    const result = { events: [], channels: [], data: [] };
    const safetyArea = this.props.verticalOffset + this.props.visibleRows;
    Object.keys(map).map((key) => {
      const responseKey = map[key];
      if (this.total > safetyArea) {
        result[key][0] = response[responseKey].splice(0, this.props.verticalOffset);
        result[key][1] = response[responseKey].splice(0, this.props.visibleRows);
        result[key][2] = response[responseKey].splice(0, this.props.verticalOffset)
      } else {
        result[key][0] = [];
        result[key][1] = response[responseKey].splice(0, this.props.visibleRows);
        result[key][2] = response[responseKey].splice(0);
      }
    });
    return result;
  }

  firstLoad(customParams = {}) {
    this.getChannelData();
    const params = Object.assign({},{
      from              : this.props.from,
      quantity          : this.props.quantity,
      date_from         : this.memory_range.horizontal.start.format('YYYYMMDDHHmmss'),
      date_to           : this.memory_range.horizontal.end.format('YYYYMMDDHHmmss'),
      horizontal_blocks : 3,
      infinite_fix      : this.props.infinite_fix ? this.props.infinite_fix : '',
    }, customParams);

    this.request(params, function (response) {
      if (response.body) {
        this.minuteSize = response.constants.minute_size;
        this.rowWidth   = response.constants.row_width;
        this.total = response.total;
        if (!this.total) {
          return;
        }
        const { events, channels, data } = this.getFirstData(response);
        let verticalBlocks = ['up', 'center', 'down'];
        if(channels.length < 3) {
          verticalBlocks.shift();
          this.visible_range.vertical.start = 0;
          this.visible_range.vertical.end   = this.visibleRows;
        }
        verticalBlocks.map((vKey, vIndex) => {
          this.epg[vKey].channels = (channels[vIndex]) ? channels[vIndex] : [];
          this.epg[vKey].events = (events[vIndex]) ? events[vIndex] : [];
          this.data[vKey] = (data[vIndex]) ? data[vIndex] : [];
        });

        const schedules         = this.initSchedules();
        const renderedChannels  = this.epg.center.channels;
        const renderedEvents    = this.epg.center.events;
        this.setState({schedules, renderedEvents, renderedChannels}, () => {
          const active = document.querySelector('.epg-events-container .epg-events-row:first-of-type .epg-events-block:nth-child(2) .epg-event-current');
          const element = active ? active : document.querySelector(`.epg-events-container .epg-events-row:first-of-type .epg-events-block:nth-child(2) .focusable`);
          this.makeEventVisibleInDOM(element);
          if(typeof this.props.onFirstLoad === 'function') {
            const channelId = element.getAttribute('data-channel-id');
            const eventId = element.getAttribute('data-event-id');
            const row = element.parentNode.parentNode.parentNode;
            const block = element.parentNode.parentNode;
            const blockIndex = Array.from(row.children).indexOf(block);
            const channel = this.data.center.find((channel) => channel && channel.id === channelId);
            if(channel) {
              const event = channel.events[blockIndex].find((event) => event.id === eventId);
              const initialData = { channel, event };
              if(this.props.isFullEpg)
              {                
                if (Utils.isModalHide()) {
                  window.SpatialNavigation.focus(`[id^=event-${event.id}]`);
                }
              }
              this.props.onFirstLoad(initialData);
            }
          }
          const elementfocus = document.querySelector('.epg-main .epg-event-active.focusable');          
          if (Utils.isModalHide()) {
            window.SpatialNavigation.focus(elementfocus || '.epg-main .focusable');
          }
        });

      }
    }.bind(this));
  }

  getVerticalMemorySize() {
    return this.visibleRows + (this.props.verticalOffset * 2);
  }

  getItemsSize() {
    return this.epg.up.channels.length + this.epg.center.channels.length + this.epg.down.channels.length;
  }

  getVerticalLimits() {
    const topChannel    = (this.data.up.length)   ? this.data.up[0] : this.data.center[0];
    const bottomChannel = (this.data.down.length) ? this.data.down[this.data.down.length - 1] : this.data.center[this.data.center.length - 1];
    const topLimit    = topChannel.key;
    const bottomLimit = bottomChannel.key;
    return {
      topChannel,
      bottomChannel,
      topLimit,
      bottomLimit
    }
  }

  getCurrentVerticalRange() {
    let from , quantity, infinite_fix = '', difference;
    let { topLimit, bottomLimit } = this.getVerticalLimits();

    if (this.total > this.getVerticalMemorySize()) {
      if (topLimit < bottomLimit) {
        difference = bottomLimit - topLimit;
        from = topLimit;
        quantity = difference + 1;
      } else {
        difference = this.total - topLimit;
        from = topLimit;
        quantity = difference + 1;
        infinite_fix = bottomLimit + 1;
      }
    } else {
      from = topLimit;
      quantity = topLimit < bottomLimit ? bottomLimit - topLimit + 1 : this.total - topLimit;
      infinite_fix = (this.getItemsSize() - quantity >= 0) ? this.getItemsSize() - quantity: '';
    }
    return {from, quantity, infinite_fix};
  }

  getFixedTime() {
    const now = this.now();
    const time = now.toObject();
    time.minutes = 0;
    time.seconds = 0;
    time.milliseconds = 0;
    return time;
  }

  getPrevEvents() {
    if(!this.isRequesting) {
      const {from, quantity, infinite_fix} = this.getCurrentVerticalRange();

      let date_from = moment(this.memory_range.horizontal.start).subtract(this.props.horizontalOffset, 'hours');
      let date_to = moment(this.memory_range.horizontal.start);
      const diff = this.now().diff(date_from, 'minutes');
      if (diff >= this.maxTimeshift) {
        date_from = moment(this.getFixedTime()).subtract(this.maxTimeshift, 'minutes');
        date_to = moment(date_from).add(this.props.horizontalOffset, 'hours');
      }
      if (this.memory_range.horizontal.start.diff(date_from , 'minutes') <= 0) return this.isMoving = false;
      const params = {
        from,
        quantity,
        infinite_fix,
        date_from: date_from.format('YYYYMMDDHHmmss'),
        date_to: date_to.format('YYYYMMDDHHmmss'),
      };
      this.request(params, function (response) {
        let verticalBlocks = Object.keys(this.epg);
        const events = [], channels = [];
        verticalBlocks.map((key) => {
          events.push(response.body.splice(0,this.epg[key].channels.length));
          channels.push(response.channels.splice(0,this.epg[key].channels.length));
        });
        if (events.length && response.total === this.total) {
          verticalBlocks.map((vKey, vIndex) => {
            this.epg[vKey].events.map((row, hIndex) => {
              row.pop();
              this.data[vKey][hIndex].events.pop();
              this.epg[vKey].events[hIndex] = [...events[vIndex][hIndex], ...row];
              this.data[vKey][hIndex].events = [...channels[vIndex][hIndex].events, ...this.data[vKey][hIndex].events];
            });
          });
          const renderedEvents = this.epg.center.events;
          const {row, block, focused} = this.getFocusedData();
          window.SpatialNavigation.pause();
          this.memory_range.horizontal.start = moment(date_from);
          this.memory_range.horizontal.end = moment(date_to);
          const schedules = this.initSchedules();
          this.setState({renderedEvents, schedules}, () => {
            window.SpatialNavigation.resume();
            this.focus(`#${row.id} #${block.id} #${focused.id}`);
          });
        } else {
          this.isMoving = false;
        }
      }.bind(this));
    }
  }

  getNextEvents() {
    if(!this.isRequesting) {
      const {from, quantity, infinite_fix} = this.getCurrentVerticalRange();
      const params = {
        from,
        quantity,
        infinite_fix,
        date_from: this.memory_range.horizontal.end.format('YYYYMMDDHHmmss'),
        date_to: moment(this.memory_range.horizontal.end).add(this.props.horizontalOffset, 'hours').format('YYYYMMDDHHmmss'),
      };

      this.request(params, function (response) {
        let verticalBlocks = Object.keys(this.epg);
        const events = [], channels = [];
        verticalBlocks.map((key) => {
          events.push(response.body.splice(0,this.epg[key].channels.length));
          channels.push(response.channels.splice(0,this.epg[key].channels.length));
        });
        if (events.length && response.total === this.total) {
          verticalBlocks.map((vKey, vIndex) => {
            this.epg[vKey].events.map((row, hIndex) => {
              row.shift();
              this.data[vKey][hIndex].events.shift();

              this.epg[vKey].events[hIndex] = [...row, ...events[vIndex][hIndex]];
              this.data[vKey][hIndex].events = [...this.data[vKey][hIndex].events, ...channels[vIndex][hIndex].events];
            });
          });
          const renderedEvents = this.epg.center.events;
          const {row, block, focused} = this.getFocusedData();
          window.SpatialNavigation.pause();
          this.memory_range.horizontal.start.add(this.props.horizontalOffset, 'hours');
          this.memory_range.horizontal.end.add(this.props.horizontalOffset, 'hours');
          const schedules = this.initSchedules();
          this.setState({renderedEvents, schedules}, () => {
            window.SpatialNavigation.resume();
            this.focus(`#${row.id} #${block.id} #${focused.id}`);
          });
        } else {
          this.isMoving = false;
        }
      }.bind(this));
    }
  }

  getPrevChannels() {
    if(!this.isRequesting && this.total > this.getVerticalMemorySize()) {
      const { topLimit } = this.getVerticalLimits();
      const to = (topLimit - 1 >= 0) ? topLimit - 1 : this.total;
      const prev = to - (this.props.verticalOffset - 1);
      const from = (prev >= 0) ? prev : 0;
      const quantity = (prev >= 0) ? this.props.verticalOffset : topLimit;
      const params = {
        from,
        quantity,
        date_from: this.memory_range.horizontal.start.format('YYYYMMDDHHmmss'),
        date_to: this.memory_range.horizontal.end.format('YYYYMMDDHHmmss'),
        horizontal_blocks: 3,
      };
      this.request(params, function (response) {
        if (response.body) {
          this.epg.up.channels = [...response.channelsRender, ...this.epg.up.channels];
          this.epg.up.events = [...response.body, ...this.epg.up.events];

          this.data.up = [...response.channels, ...this.data.up];
          this.memory_range.vertical.end -= response.body.length;
        }
        if (!response.total) {
          this.isMoving = false;
        }
      }.bind(this));
    }
  }

  getNextChannels() {
    if(!this.isRequesting && this.total > this.getVerticalMemorySize()) {
      const { bottomLimit } = this.getVerticalLimits();
      const next = bottomLimit + 1;
      const quantity = this.props.verticalOffset;
      const from = next < this.total ? next : 0;
      const params = {
        from,
        quantity,
        date_from: this.memory_range.horizontal.start.format('YYYYMMDDHHmmss'),
        date_to: this.memory_range.horizontal.end.format('YYYYMMDDHHmmss'),
        horizontal_blocks: 3,
      };

      this.request(params, function (response) {
        if (response.body) {
          this.epg.down.channels = [...this.epg.down.channels, ...response.channelsRender];
          this.epg.down.events = [...this.epg.down.events, ...response.body];

          this.data.down = [...this.data.down, ...response.channels];
          this.memory_range.vertical.end += response.body.length;
        }
        if (!response.total) {
          this.isMoving = false;
        }
      }.bind(this));
    }
  }

  syncScroll() {
    this.eventContainer.removeEventListener('scroll', this.onEventScroll);
    this.eventContainer.addEventListener('scroll', this.onEventScroll);
  }

  onEventScroll(e) {
    if(e && e.srcElement){
      if(this.schedulesContainer){
        this.schedulesContainer.scrollLeft = e.srcElement.scrollLeft;
      }
      if(this.channelsContainer){
        this.channelsContainer.scrollTop = e.srcElement.scrollTop;
      }
    }

    if (this.activeHour && this.refs.lineTime) {
      const positionActiveHour = this.activeHour.getBoundingClientRect().left;
      const currentHour = this.state.schedules[this.activeHour.dataset.timeIndex];
      const diff = this.now().diff(currentHour, 'm');
      const newLeftPosition = positionActiveHour + (diff * this.minuteSize);
      if (!this.props.isFullEpg && newLeftPosition > 1090) {
        //this.refs.lineTime.style.display = 'none';
      } else if (newLeftPosition > this.channelsContainer.clientWidth) {
        this.refs.lineTime.style.left = `${newLeftPosition}px`;
        this.refs.lineTime.style.display = 'inline-block';
      } else {
        //this.refs.lineTime.style.display = 'none';
      }
    } else if (this.refs.lineTime) {
      //this.refs.lineTime.style.display = 'none';
    }
  }

  moveLeft() {
    const {firstBlock} =  this.getFocusedData();
    if (firstBlock) {
      const mainRight = this.eventContainer.getBoundingClientRect().right;
      const blockRight = firstBlock.getBoundingClientRect().right;
      if (blockRight >= mainRight && !this.isMoving) {
        this.isMoving = true;
        this.getPrevEvents();
      }
    }
  }

  onFocusMoveLeft(e) {
    const { direction } = e.detail;
    if (direction === 'left') {
      clearInterval(this.navTimer);
      this.navTimer = setTimeout(this.moveLeft, 0);
    }
  }

  moveRight() {
    const {lastBlock} =  this.getFocusedData();
    if(lastBlock) {
      const mainLeft = this.eventContainer.getBoundingClientRect().left;
      const blockLeft = lastBlock.getBoundingClientRect().left;
      if (blockLeft <= mainLeft && !this.isMoving) {
        this.isMoving = true;
        this.getNextEvents();
      }
    }
  }

  onFocusMoveRight(e) {
    const {direction} = e.detail;
    if (direction === 'right') {
      clearInterval(this.navTimer);
      this.navTimer = setTimeout(this.moveRight, 0);
    }
  }

  popData(section) {
    const channel = this.epg[section].channels.pop();
    const events  = this.epg[section].events.pop();
    const data  = this.data[section].pop();
    return (!channel || !events || !data) ? null : {channel, events, data};
  }

  shiftData(section) {
    const channel = this.epg[section].channels.shift();
    const events  = this.epg[section].events.shift();
    const data  = this.data[section].shift();
    return (!channel || !events || !data) ? null : {channel, events, data};
  }

  prependData(section, row) {
    this.epg[section].channels.unshift(row.channel);
    this.epg[section].events.unshift(row.events);
    this.data[section].unshift(row.data);
  }

  appendData(section, row) {
    this.epg[section].channels.push(row.channel);
    this.epg[section].events.push(row.events);
    this.data[section].push(row.data);
  }

  moveUp() {
    if (!this.isMoving && !this.state.coverFlow) {
      this.isMoving = true;
      if (this.total <= this.getVerticalMemorySize()) {
        this.prependData('down', this.popData('center'));
        this.prependData('up', this.popData('down'));
        this.prependData('center', this.popData('up'));
      } else if (this.epg.up.channels.length) {
        this.prependData('center',this.popData('up'));
        this.prependData('down',this.popData('center'));
        this.popData('down');
      }

      if (this.epg.up.events.length <= 1) {
        this.getPrevChannels();
      }

      const renderedEvents  = this.epg.center.events;
      const selector        = `.epg-events-container .epg-events-row:first-of-type .focusable.focusable.epg-event-current`;
      this.setState({renderedEvents}, () => this.focus(selector));
    }
  }

  onFocusMoveUp(e) {
    const {direction} = e.detail;
    if (direction === 'up') {
      e.preventDefault();
      if (!this.state.coverFlow) {
        clearInterval(this.navTimer);
        this.navTimer = setTimeout(this.moveUp, 0);
      }
    }
  }

  moveDown() {
    if (!this.isMoving && !this.state.coverFlow) {
      this.isMoving = true;
      if (this.total <= this.getVerticalMemorySize()) {
        this.appendData('up', this.shiftData('center'));
        this.appendData('down', this.shiftData('up'));
        this.appendData('center', this.shiftData('down'));
      } else if (this.epg.down.channels.length) {
        this.appendData('center', this.shiftData('down'));
        this.appendData('up',this.shiftData('center'));
        this.shiftData('up');
      }

      if (this.epg.down.events.length <= 1) {
        this.getNextChannels();
      }

      const renderedEvents  = this.epg.center.events;
      const selector        = `.epg-events-container .epg-events-row:last-of-type  .focusable.epg-event-current`;
     // console.error('selector', selector, document.querySelector(selector));
      this.setState({renderedEvents}, () => this.focus(selector));
    }
  }

  onFocusMoveDown(e) {
    const {direction} = e.detail;
    if (direction === 'down') {
      e.preventDefault();
      if (!this.state.coverFlow) {
        clearInterval(this.navTimer);
        this.navTimer = setTimeout(this.moveDown, 0);
      }
    }
  }

  makeEventVisibleInDOM(element) {
    const mainRight   = this.eventContainer.getBoundingClientRect().right;
    const mainLeft    = this.eventContainer.getBoundingClientRect().left;

    if (element instanceof HTMLElement) {
      const eventRight = element.getBoundingClientRect().right;
      const eventLeft = element.getBoundingClientRect().left;
      if (eventLeft >= mainLeft && eventRight <= mainRight) {
        return;

      }
      if (eventRight > mainRight) {
        this.eventContainer.scrollLeft += eventRight - mainRight;
      }

      if (eventLeft < mainLeft) {
        this.eventContainer.scrollLeft -= mainLeft - eventLeft;
      }
    }
  }

  setCurrentData() {
    const {focused, block, row} = this.getFocusedData();
    if (focused) {
      const channelId = focused.getAttribute('data-channel-id');
      const eventId = focused.getAttribute('data-event-id');
      const blockIndex = Array.from(row.children).indexOf(block);
      const channel = this.data.center.find((channel) => channel && channel.id === channelId);
      if (channel) {
        let event = channel.events[blockIndex].find((event) => event.id === eventId);
        event.channel_group_id = channel.group_id;
        this.current = { channel, event, focused };
        if (typeof this.props.onSetCurrentData === 'function') {
          this.props.onSetCurrentData({ channel, event, focused });
        }
      }
    }
  }

  onFocus(e) {
    console.log('@@@@@@@@@@@@ componentWillReceiveProps EPG components onFocus');
    const {target}    = e;
    this.makeEventVisibleInDOM(target);
    this.setCurrentData();
    // After setCurrentData above, handle/fire pip
    this.playPipPlayer();
  }

  hideCoverFlow() {
    const selector = `.epg-events-container .epg-events-row:first-of-type .focusable.focusable.epg-event-current`;
    super.hideCoverFlow(selector);
  }

  removeListeners() {
    const focusableElements = this.eventContainer ?
      this.eventContainer.querySelectorAll('.focusable')
    : [];
    const focusables = Array.from(focusableElements);
    focusables.map((element) => {
      element.removeEventListener('sn:willmove', this.onFocusMoveLeft);
      element.removeEventListener('sn:willmove', this.onFocusMoveRight);
      element.removeEventListener('sn:willmove', this.onFocusMoveUp);
      element.removeEventListener('sn:willmove', this.onFocusMoveDown);
      element.removeEventListener('sn:focused', this.onFocus);
    });
    this.eventContainer && this.eventContainer.removeEventListener('click', this.handleClick);
    this.eventContainer && this.eventContainer.removeEventListener('keyup', this.resetTimer);
  }

  handleClick = e => {
    super.handleClick(e, this.props.fromMiniEpg, this.props.showMiniEpg);
  };

  addListeners() {
    const lastIndex = this.rows.length - 1;
    this.rows.map((row, index) => {
      if (row instanceof HTMLElement) {
        const focusables  = Array.from(row.querySelectorAll('.focusable'));
        if(index === 0) {
          focusables.map((element) => {
            element.addEventListener('sn:willmove', this.onFocusMoveUp);
          });
        }
        if(index === lastIndex) {
          focusables.map((element) => {
            element.addEventListener('sn:willmove', this.onFocusMoveDown);
          });
        }
        focusables.map((element) => {
          element.addEventListener('sn:willmove', this.onFocusMoveLeft);
          element.addEventListener('sn:willmove', this.onFocusMoveRight);
          element.addEventListener('sn:focused', this.onFocus);
        });
      }
    });
    this.eventContainer && this.eventContainer.addEventListener('click', this.handleClick);
    this.eventContainer && this.eventContainer.addEventListener('keyup', this.resetTimer);
  }

  moreInfo=(e)=>{
    e.preventDefault();
    e.stopPropagation();
    this.sendAllToTheCard = true;
    super.sendToVcard();
  }

  componentDidMount() {
    if(typeof this.props.setMoreInfoFunction ==='function')
      this.props.setMoreInfoFunction(this.moreInfo);
    this.eventContainer.addEventListener('keydown', (e) => {
        if(LayersControl.isUXVisible())
          return;
        this.sendAllToTheCard = null; //ESTA FLAG controla que se envien a la card con las teclas del control.
        const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
        console.log('Listening EPG Index, currentKey:', currentKey);
        switch (currentKey) {
            case 'GUIDE':
              e.preventDefault();
              e.stopPropagation();
              this.props.handleEPG();
              break;
            case 'BLUE':
              //this.moreInfo(e);
              break;
            case 'INFO':
              let isOTTGuy =
                !this.props.user || (
                  !this.props.user.paymentMethods
                  || (
                    this.props.user.paymentMethods
                    && !this.props.user.paymentMethods.hubcorporativofijogate
                    && !this.props.user.paymentMethods.hubfijovirtualgate
                  )
                );

              if (!isOTTGuy) {
                /* quitando funcionalidad de boton info para usuarios que no son ott
                e.preventDefault();
                e.stopPropagation();
                this.sendAllToTheCard = true;
                super.sendToVcard();*/
              }
              break;
            case 'RED':
              e.preventDefault();
              e.stopPropagation();
              this.props.handleEPG();
              break;
              
            case 'DOWN':
              /* TODO handleDelayKey Abstract for every device */
              this.handleDelayKey(e, currentKey);
              break;
            case 'FWD':
                e.preventDefault();
                e.stopPropagation();
                this.memory_range.horizontal.start = moment(this.memory_range.horizontal.start).add(24, 'hours');
                this.memory_range.horizontal.end = moment(this.memory_range.horizontal.end).add(24, 'hours');
                console.log('un día hacia adelante', this.memory_range.horizontal.end)
                this.getNextEvents();
                break;
            case 'RWD':
                e.preventDefault();
                e.stopPropagation();
                this.memory_range.horizontal.start = moment(this.memory_range.horizontal.start).subtract(24, 'hours');
                this.memory_range.horizontal.end = moment(this.memory_range.horizontal.end).subtract(24, 'hours');
                this.getPrevEvents();
                break;
            default:
              break;

        }

    });

    this.firstLoad();
    this.syncScroll();
  }

  componentWillUnmount() {
    // Si esta por ir a payment, no se cierran los players, los players se cierran en payment al montar el componente
    // porque puede que por ejemplo en nagra se abrá el pip en el focus en la epg y mientras esto pasa
    // la app navega hacía payment y puede llegar aquí con un pip player o incluso un fullplayer
    if(!this.state.showSubscrition)
    {
      console.log('[Payment] closing players en epgPostales');
      //this.closeFullPlayer();
    }
    // Close pip player ya estaba antes, se deja como estaba ¿? :/
    // TODO: quiza sea este closepip el que haga un efecto raro al hacer un resize del full player
    // al pasar de TV a fichaEPG (resize y full player se queda como pip en la ficha epg)
    this.closePipPlayer();
    this.removeListeners();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.node_id !== newProps.node_id || this.props.from !== newProps.from || newProps.forceUpdate) {
      this.reset();
      this.firstLoad({node_id: newProps.node_id, from: newProps.from, quantity: newProps.quantity, infinite_fix: newProps.infinite_fix});
    }
  }

  componentWillUpdate() {
    this.removeListeners();
  }

  componentDidUpdate() {
    window.SpatialNavigation.makeFocusable();
    const eventRows = this.eventContainer ?
      this.eventContainer.querySelectorAll('.epg-events-container .epg-events-row')
      : [];
    this.rows = Array.from(eventRows);
    this.addListeners();
    this.isMoving = false;
    this.activeHour = document.querySelector('.epg-hour-active');
  }

  render() {
    this.rows = [];

    // ir a payment
    if (this.state.showSubscrition) {
      const { groupId, offerId, pbi } = this.paymentData;
      console.log('[PAYMENT]  redirect a payment', this.paymentData, store.getState().user.isAnonymous);
      if (groupId && offerId) {
        this.props.handleEPG();
        const userLoggedIn = store.getState().user.isAnonymous === false;
        /*if(userLoggedIn) {
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
        } */
      }
    }

    if (this.state.showVCard) {
      console.info('showVCard state',this.state);
      const { channel, event } = this.current;
      if (channel && event) {
        event.channel_group_id = channel.group_id;

        if(this.sendAllToTheCard == true){
            event.keyOfControl = true;
        }

        this.props.handleEPG();
        // this.props.closePlayer();
        // Se agrega el node_id para que no se rompa el player
        event.node_id = this.props.node_id;
        let eventData = JSON.stringify({ event });

        return/* <Redirect
          push={!Utils.isDateBetween(event.date_begin, event.date_end)}
          to={{
            pathname: `/epg/${channel.group_id}?eventData=${encodeURI(eventData)}`
          }} />*/
      }
    }

    return (
      <div>
        <CoverFlow
          channels={this.props.levelChannels}
          current={this.current}
          show={this.state.coverFlow}
          onPressYellowButton={this.hideCoverFlow}
          onPressBackButton={this.hideCoverFlow}
          onSelect={this.onSelectCard}
          onChangeChannel={(channel)=>{
            this.props.hideEpgOutside();
            this.props.history.replace(`/player/${channel.group_id}`);
          }}
        />
        <div className="epg-main" >
          <div className="epg-schedule" ref={(div) => this.schedulesContainer = div}>
            <div className='epg-schedule-container' style={{width: this.rowWidth}}>
            {
              this.state.schedules.map((current, index) => {
                const width = this.props.intervalSize * this.minuteSize;
                const finished = current.isBefore(this.now().subtract(this.props.intervalSize, 'm')) ? 'epg-hour-finished' : '';
                const active = this.now().isBetween(current, moment(current).add(this.props.intervalSize, 'm')) ? 'epg-hour-active' : '';
                return (
                  <div key={index} className={`epg-hour ${finished} ${active}`} data-time-index={index} style={{width}}>
                    {current.format('DD/MM HH.mm')}hs.
                  </div>
                )
              })
            }
            </div>
          </div>
          <div className="epg-channels-container" ref={(div) => this.channelsContainer = div} dangerouslySetInnerHTML={{__html: this.state.renderedChannels.join('')}}/>
          <div className='epg-events-container' ref={(div) => this.eventContainer = div} >
            {/* <span id='line-time' ref='lineTime' /> */}
            {
              this.state.renderedEvents.map((row, index) => {
                return (
                  <div key={index} id={`row-${index}`} className='epg-events-row' style={{width: this.rowWidth}} dangerouslySetInnerHTML={{__html: row.join('')}}/>
                )
              })
            }
          </div>
        </div>
      </div>
    );
  }
}


Epg.propTypes = {
  filterInactive      : PropTypes.number,
  verticalOffset      : PropTypes.number,
  horizontalOffset    : PropTypes.number,
  visibleTime         : PropTypes.number,
  visibleRows         : PropTypes.number,
  intervalSize        : PropTypes.number,
  eventContainerWidth : PropTypes.number,
  node_id             : PropTypes.string,
  from                : PropTypes.number,
  quantity            : PropTypes.number,
  infinite_fix        : PropTypes.number,
  enableCoverFlow     : PropTypes.bool,
  onSetCurrentData    : PropTypes.func,
  onFirstLoad         : PropTypes.func,
  playPipPlayer       : PropTypes.func,
  closePipPlayer      : PropTypes.func,
  closeFullPlayer     : PropTypes.func,
  killPipTimeout      : PropTypes.func,
  updateEpg           : PropTypes.func,
  enableColorActions  : PropTypes.func,
  disableColorActions : PropTypes.func,
  levelChannels       : PropTypes.array
};

Epg.defaultProps = {
  filterInactive      : 0,
  verticalOffset      : 5,
  horizontalOffset    : 4,
  visibleTime         : 2,
  visibleRows         : 5,
  intervalSize        : 30,
  eventContainerWidth : 1126,
  node_id             : null,
  from                : 0,
  quantity            : 15,
  infinite_fix        : 0,
  enableCoverFlow     : true,
  onSetCurrentData    : () => {},
  onFirstLoad         : () => {},
  playPipPlayer       : () => {},
  closePipPlayer      : () => {},
  closeFullPlayer     : () => {},
  killPipTimeout      : () => {},
  updateEpg           : () => {},
  enableColorActions  : () => {},
  disableColorActions : () => {},
  levelChannels       : [],
};

/*
Epg.contextTypes = {
  router: PropTypes.object.isRequired
}
*/

export default Epg;
