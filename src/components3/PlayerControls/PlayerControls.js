/**
 * Dependencies
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import {
  MODAL_ERROR,
  HIDE_MODAL,
  MODAL_ACTION,
  MODAL_EPISODE_SELECT,
  MODAL_LANGUAGES,
  MODAL_PPE,
  showModal
} from "../../actions/modal";
import { setResumeData } from "../../actions/resume";
import CodeToVal from "../../utils/CodeToVal";
import store from "../../store";
import { navigateFrom } from "./../../actions/epg";
import ChannelSingleton from "../Epg/ChannelsSingleton";
import DeviceStorage from "../DeviceStorage/DeviceStorage";
import json from "../../utils/data/channels";
import Utils from "../../utils/Utils";
import TvChannelUtil from "../../utils/TvChannelUtil";
import EpgHeader from "./../../components/Epg/EpgHeader";
/**
 * General
 */
import { replaceFullSourceMedia, playFullMedia } from "../../actions/playmedia";
import Metadata from "../../requests/apa/Metadata";
import PPE from "./../../devices/nagra/PPE";
import PlayerStreamingUtils from "../../utils/PlayerStreamingUtils";
import * as playerConstant from "../../utils/playerConstants";
/**
 * Components
 */
import Button from "../Button/index";
import MiniEpg from "../Epg/MiniEpg";
/**
 * Assets
 */
import "./player-ui.css";
import Asset from "../../requests/apa/Asset";
/**
 * Musica
 */
import {
  doFavorite,
  doToggleRepeat,
  doToggleShuffle,
  goToNextSong,
  goToPreviewSong
} from "../../actions/musica/player-controls-user";
import {
  finishPlaying,
  onPlayingRadio,
  startPlaying
} from "../../actions/musica/player-action-creators";
import {
  checkListType,
  checkSongType,
  sendMetricsMusica,
  canGoToNextSong,
  isPreviewSong
} from "../../actions/musica/player-shared-action-creators";
import AnalyticsDimensionSingleton from "../../components/Header/AnalyticsDimensionSingleton";
import Translator from "../../requests/apa/Translator";
/**
 * Player events
 */
import TrackerManager from "../../utils/TrackerManager";

import Device from "../../devices/device";
import storage from "../../components/DeviceStorage/DeviceStorage";
import { getLinksFromNavConfiguration } from "../Header";
import ModelDetection from "../../utils/ModelDetection";

import LayersControl from "./../../utils/LayersControl";
import LocalStorage from "../DeviceStorage/LocalStorage";
import ChannelsSingleton from "../Epg/ChannelsSingleton";
import * as api from "../../requests/loader";

const device_platform = Device.getDevice().getPlatform();
let show_lang_platform = device_platform == "nagra" ? true : false;

const config_remote_control =
  DeviceStorage.getItem("config_remote_control") !== "simple" ? true : false;

const skip_seconds = Metadata.get("skip_seconds", 60);
const autoHideMiniEpgSeconds = Metadata.get(
  "mini_epg_auto_hide_seconds",
  /* 7 */ 60
); // tiempo en que se oculta la miniepg

const playerSettings = {
  slideTime: skip_seconds / 4,
  backwardTime: skip_seconds / 6, // 10 hacía atrás
  stepBackwardTime: skip_seconds / 4, // 15 hacía atrás
  fastBackwardTime: skip_seconds / 2, // 30 hacía atrás
  forwardTime: skip_seconds / 6, // 10 hacía adelante
  stepForwardTime: skip_seconds / 4, // 15 hacía adelante
  fastForwardTime: skip_seconds / 2, // 30 hacía adelante
  inactivityTime: skip_seconds / 3,

  // Timeshift
  backwardTime_timeshift: skip_seconds * 3, // 3 hacía atrás
  stepBackwardTime_timeshift: skip_seconds * 10, // 10 Mins hacía atrás
  forwardTime_timeshift: skip_seconds * 3, // 3 Mins hacía adelante
  stepForwardTime_timeshift: skip_seconds * 10, // 10 Mins hacía adelante
  slideTime_timeshift: skip_seconds * 3, // intervalos de 3 mins forward/backward

  types: {
    default: {
      buttons: [
        "seasons",
        "replay",
        "backward",
        "play",
        "forward",
        "next",
        "lang",
        "back"
      ]
    },
    serie: {
      buttons: [
        "back",
        "replay",
        "backward",
        "play",
        "forward",
        "next",
        "lang",
        "seasons"
      ]
    },
    live: {
      buttons: [
        "back",
        "record",
        "stepBackward",
        "backward",
        "play",
        "forward",
        "stepForward",
        "lang",
        "epg"
      ]
    },
    musica: {
      buttons: [
        "back",
        "favorite",
        "previewSong",
        "backward",
        "play",
        "forward",
        "nextSong",
        "repeat",
        "shuffle"
      ]
    },
    radio: {
      buttons: ["back", "play", "favorite"] //remove favorite button from dvbc radio
    }
  }
};

const setSeekInterval = function(callback, intervalTime) {
  console.log("Playerinterval setSeekInterval");
  const seekInterval = {
    interval: intervalTime * 1000,
    callback: callback,
    stopped: false,
    timeout: null,
    initBucle: function() {
      //Do a stopped state
      if (seekInterval.stopped) {
        console.log(
          "Playerinterval setSeekInterval initBucle en stop (ready to track next seek)"
        );
        return;
      }
      console.log("Playerinterval setSeekInterval initBucle");
      let result;
      result = seekInterval.callback.call(seekInterval);
      console.log(
        "Playerinterval setSeekInterval initBucle tiene result: " + result
      );
      if (typeof result == "number") {
        if (result === 0) {
          return;
        }
        seekInterval.interval = result;
      }
      // After do a seek, reinit loop (bucle method) to get next state: stopped state (above)
      seekInterval.bucle();
    },
    stop: function() {
      console.log("Playerinterval setSeekInterval stop");
      this.stopped = true;
      clearTimeout(this.timeout);
    },
    start: function() {
      console.log("Playerinterval setSeekInterval start");
      this.stopped = false;
      return this.bucle();
    },
    bucle: function() {
      console.log("Playerinterval setSeekInterval bucle " + this.setResumeData);
      this.timeout && clearTimeout(this.timeout);
      this.timeout = setTimeout(this.initBucle, this.interval);
      return this;
    }
  };

  return seekInterval.start();
};

class PlayerControls extends Component {
  static languageOptions = [];
  static isVisible = true;

  constructor(props) {
    super(props);
    this.serieData = null;
    this.timer = null;
    this.timerDelayChannelChange = null;
    this.buttonTimer = null;
    this.isMoving = false;
    this.isVisible = false;
    this.isFocusButton = false;

    this.timeBack = 0;
    this.timeForward = 0;
    this.seekTime = 0;
    this.seekTotalTime = 0;
    this.localCurrentTime = 0;
    this.seekInPause = 0;

    this.currentEvent = null;
    this.timeshiftAllowed = props.timeshiftAllowed;
    this.delayTimeshiftSeek = 1000; //ms;
    this.timerTimeshitDelayId = null;
    this.timeshift = null;

    this.isPlay = false;
    this.delayChannelChange = 1500;
    this.lastNumberPressed = "";
    this.maxLenNumberChannel = 4;

    this.currentTime = this.isLive() ? props.currentTimeshiftTime : 0;
    this.duration = this.isLive() ? this.timeshiftAllowed : props.duration;
    this.keys = Device.getDevice().getKeys();
    this.timePauseEventInterval = 1; // minutos

    this.codeToVal = new CodeToVal();
    this.settings = playerSettings;
    this.jsonLangs = [];
    this.isLangModalOpen = false;
    this.disableTS = false;
    if (this.isLive()) {
      const autoHideMiniEpgSeconds = Metadata.get(
        "mini_epg_auto_hide_seconds",
        5
      );
      if (typeof autoHideMiniEpgSeconds === "number") {
        this.settings.inactivityTime = autoHideMiniEpgSeconds;
      }
    }

    this.state = {
      playing: props.autoPlay,
      showControls: false,
      timeshiftTime: 0,
      channelInfo: {}
    };

    this.setTimer = this.setTimer.bind(this);
    this.hide = this.hide.bind(this);
    this.toggleControls = this.toggleControls.bind(this);

    this.canPlay = this.isLive() ? true : false;
    this.slide = this.slide.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onFocusMove = this.onFocusMove.bind(this);
    this.focus = this.focus.bind(this);
    this.keyPressHandler = this.keyPressHandler.bind(this);
    this.resetPlayerStatus = this.resetPlayerStatus.bind(this);

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.seek = this.seek.bind(this);
    this.resetSeekInPause = this.resetSeekInPause.bind(this);

    this.previewSong = this.previewSong.bind(this);
    this.nextSong = this.nextSong.bind(this);
    this.onFinishSong = this.onFinishSong.bind(this);
    this.onPlayingSong = this.onPlayingSong.bind(this);
    this.onPlayingRadio = this.onPlayingRadio.bind(this);

    this.backward = this.backward.bind(this);
    this.stepBackward = this.stepBackward.bind(this);
    this.fastBackward = this.fastBackward.bind(this);
    this.forward = this.forward.bind(this);
    this.stepForward = this.stepForward.bind(this);
    this.fastForward = this.fastForward.bind(this);
    this.replay = this.replay.bind(this);
    this.back = this.back.bind(this);
    this.next = this.next.bind(this);
    this.record = this.record.bind(this);
    this.changeLang = this.changeLang.bind(this);
    this.handleEpisodeClick = this.handleEpisodeClick.bind(this);

    this.addListeners = this.addListeners.bind(this);
    this.removeButtonListener = this.removeButtonListener.bind(this);

    this.showLangModal = this.showLangModal.bind(this);
    this.updateSpriteSrc = this.updateSpriteSrc.bind(this);
    this.showSeasonsModal = this.showSeasonsModal.bind(this);
    this.showFullEpg = this.showFullEpg.bind(this);
    this.updateCurrentTime = this.updateCurrentTime.bind(this);
    this.updateDurationTime = this.updateDurationTime.bind(this);
    this.focusPlayButton = this.focusPlayButton.bind(this);
    this.focusMiniEpg = this.focusMiniEpg.bind(this);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.reopenMiniEpg = this.reopenMiniEpg.bind(this);

    this.onFavoriteSong = this.onFavoriteSong.bind(this);
    this.doRepeat = this.doRepeat.bind(this);
    this.doShuffle = this.doShuffle.bind(this);
    this.setChannelInfo = this.setChannelInfo.bind(this);
    this.enableButton = this.enableButton.bind(this);
    this.hasEpgErrorOnLive = this.hasEpgErrorOnLive.bind(this);
    this.saveEpgData = this.saveEpgData.bind(this);

    this.onSkipIntro = this.onSkipIntro.bind(this);
    this.flagSkipIntro = false;
    this.introFinishTime = null;

    let that = this;
    this.seekBarInterval = setSeekInterval(function() {
      if (that.seekTotalTime >= 0 && that.isMoving) {
        console.log("[PlayerControls] interval seek", that.seekTotalTime);
        //Send stats related to seek (i.e. sumologic)
        that.sendFowardRewindSeek();
        that.seek(that.seekTotalTime);
        that.seekTotalTime = 0;
        that.seekTime = 0;
        that.isMoving = false;
        that.setTimer();
      }
      console.log("[PlayerControls] interval before stop after set seek ");
      console.log("HAY TITULO ACA", store.getState().resume.title);
      this.stop();
    }, 2);

    this.playerStreamingUtils = new PlayerStreamingUtils();

    const isAndroid = Device.getDevice().getPlatform() === "android";
    const isArgentina = DeviceStorage.getItem("region") === "argentina";

    this.recordingsEnabled = !(isAndroid && isArgentina);
    this.metricSend = null;

    // Envio de información hacia el dashboard.
    this.player = Device.getDevice().getPlayer();
    /* this.trackerManager = this.getTrackerManager();*/

    this.onHideListeners = [];
    this.spriteShown = "hidden";
    this.imageSprite = new Image();
    this.imageSprite.crossOrigin = "Anonymous";
    this.imageSpriteURL = "";
    this.imageSpriteURLnew = "";
    this.flagChapterSkipIntro = false;
    this.currentLangChapter = [];
    this.hasSkipIntro = false;
    // Para guardar referencias a los listeners en los botones y después poder removerlos
    this.buttonsListeners = {};
    this.proporcion = 0;
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.checkStatusMiniEPG !== this.props.checkStatusMiniEPG &&
        nextProps.checkStatusMiniEPG === false) ||
      (nextProps.checkStatusEPG && !this.props.checkStatusMiniEpg)
    ) {
      this.hide();
    }
    this.reopenMiniEpg(nextProps);
  }

  reopenMiniEpg(nextProps) {
    if (
      nextProps.checkStatusEPG !== this.props.checkStatusEPG &&
      !nextProps.checkStatusEPG
    ) {
      this.isVisible = true;
    }
  }

  /* getTrackerManager = () => {
    return null;
    const dashboardTracker = new DashboardTracker();

    return new TrackerManager([ dashboardTracker ]);
}*/

  // skipIntro
  doFocusableSkipIntro() {
    // let curTime = this.getCurrentTime();
    // let time = (curTime => this.introStartTime) ? ((this.introFinishTime - curTime + 2) * 1000) : (this.introFinishTime - this.introStartTime + 2) * 1000;

    this.focus(".focusable-skip");
    // this.setTimeSkipIntroControlShow(time);
  }

  hideSkipIntro() {
    let skipIntroElement = document.getElementsByClassName(
      "player-ui-container-skip"
    )[0];
    if (skipIntroElement) {
      skipIntroElement.classList.remove("show-skip-intro");
    }
  }

  showSkipIntro() {
    let skipIntroElement = document.getElementsByClassName(
      "player-ui-container-skip"
    )[0];
    if (skipIntroElement) {
      // this.toggleControls();
      skipIntroElement.classList.add("show-skip-intro");
      this.doFocusableSkipIntro();
    }
  }

  setTimeSkipIntroControlShow(time) {
    clearInterval(this.timer);
    this.timer = setInterval(this.hide, time);
  }

  skipIntroControl() {
    // Se ejecuta cada vez que se recibe componentDidUpdate
    let langsChapter = PlayerControls.languageOptions;

    if (langsChapter.length > 0 && this.props.type === "vod") {
      const curTime = this.getCurrentTime();
      const currentLang = DeviceStorage.getItem("default_lang");
      this.hasSkipIntro =
        langsChapter[0].intro_finish_time !== null &&
        langsChapter[0].intro_start_time !== null
          ? true
          : false;

      if (this.hasSkipIntro) {
        this.currentLangChapter = langsChapter.filter(
          lang => lang.option_id === currentLang
        );
        this.introFinishTime =
          this.currentLangChapter[0] &&
          this.currentLangChapter[0].intro_finish_time;
        this.introStartTime =
          this.currentLangChapter[0] &&
          this.currentLangChapter[0].intro_start_time;
      } else {
        let skipIntroElement = document.getElementsByClassName(
          "player-ui-container-skip"
        )[0];

        if (this.flagSkipIntro && skipIntroElement) {
          this.hideSkipIntro();
        }
      }
    }
  }

  handleSkipIntro() {
    if (this.hasSkipIntro) {
      const curTime = this.getCurrentTime();

      if (
        curTime >= this.introStartTime &&
        curTime <= this.introFinishTime &&
        this.flagSkipIntro === false
      ) {
        this.flagSkipIntro = true;
        this.showSkipIntro();
      } else if (
        this.flagSkipIntro === true &&
        (curTime > this.introFinishTime || curTime < this.introStartTime)
      ) {
        this.flagSkipIntro = false;
        this.hideSkipIntro();
      }
    }
  }

  onSkipIntro(e) {
    e.preventDefault();
    e.stopPropagation();

    let curTime = parseInt(this.getCurrentTime(), 10);
    this.hideSkipIntro();
    if (!this.state.playing) this.play();
    var seekTime = parseInt(this.introFinishTime, 10);
    this.setOperatorsSeek({ curTime, seekTime });
    this.doSeek(seekTime, curTime);
    this.updateCurrentTimeUI(seekTime);
    this.updateSprite(seekTime);
    this.hideSprites();

    // hideControlsAfterSkip
    const className = this.refs.container.className;
    this.refs.container.className =
      className.indexOf("hide-controls") === -1
        ? `${className} hide-controls`
        : className;
  }

  onCanPlay() {
    console.log("[PlayerControls.onCanPlay]");
    this.canPlay = true;
    this.isPlay = true;
    this.setState({ playing: true });
  }

  getCurrentTime() {
    return this.currentTime < 0 ? 0 : this.currentTime;
  }

  setCurrentTime(time) {
    this.currentTime = time;
  }

  setDuration(time) {
    this.duration = time;
    if (
      this.props.type === playerConstant.AUDIO &&
      store.dispatch(isPreviewSong())
    ) {
      this.duration = "30";
    }
  }

  getDuration() {
    return this.isLive() && this.hasTimeshift()
      ? this.timeshiftAllowed
      : this.duration;
  }

  /**
   * Calculate current time as percent of duration
   * @param currentTime
   * @returns {number}
   */
  getPercentProgress(currentTime) {
    const percent =
      currentTime > 0 ? (currentTime * 100) / this.getDuration() : 0;
    return percent <= 100 ? percent : 100;
  }

  /**
   * Set current time string in DOM without change state an re render
   * @param currentTime
   */
  updateCurrentTime(currentTime) {
    this.handleSkipIntro();

    if (!this.isLive()) {
      this.setCurrentTime(currentTime);
      if (!this.isMoving) {
        if (
          this.props.type === playerConstant.AUDIO &&
          this.duration === "30" &&
          currentTime >= this.duration
        ) {
          this.pause();
          this.onFinishSong();
        } else {
          this.updateCurrentTimeUI(currentTime);
        }
      }
    }
  }

  getAbsoluteElementPosition(idOfElement) {
    let element = document.getElementById(idOfElement);

    if (!element) return { top: 0, left: 0 };

    let y = 0;
    let x = 0;
    while (element.offsetParent) {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    }
    return { top: y, left: x };
  }

  areSpritesSupportedOnThisDevice() {
    const modelDetection = ModelDetection.getDeviceDescription();
    const modelDevice = modelDetection.modelDevice;
    const platform = modelDetection.platform;
    let result;

    const device = modelDevice === null ? platform : modelDevice;
    console.log("[playerControls][deviceDescription]", modelDetection);

    switch (device) {
      case "ps4":
        result = false;
        break;
      case "hisense":
        result = false;
        break;
      case "samsung-hybrid":
        result = false;
        break;
      case "sony-bravia":
        result = false;
        break;
      default:
        result = true;
        break;
    }
    return result;
  }

  canShowSprites() {
    let result = false;

    if (this.imageSpriteURL !== store.getState().resume.spriteImage) {
      this.imageSpriteURL = store.getState().resume.spriteImage;
      this.imageSprite.src = store.getState().resume.spriteImage;
    }

    if (this.imageSprite.src && this.imageSpriteURL !== "") {
      let ctx = this.refs.sprite.getContext("2d");
      const frame_width = 200;
      const frame_height = 113;
      const maxRow = 10;
      let fraccion = 1 / 8;
      let count_fraccionado = 0;

      ctx.canvas.height = frame_height;
      ctx.canvas.width = frame_width;
      try {
        //this.isPixelEmpty(ctx.getImageData(0, 0, 1 , 1));
        if (this.proporcion == 0) {
          ctx.drawImage(
            this.imageSprite,
            frame_width * (maxRow - 1),
            0,
            frame_width,
            frame_height,
            0,
            0,
            frame_width,
            frame_height
          );
          this.proporcion = 1;
          while (
            this.isPixelEmpty(ctx.getImageData(190, 0, 1, 1)) &&
            this.proporcion >= 0
          ) {
            count_fraccionado++;
            this.proporcion = 1 - count_fraccionado * fraccion;
            console.log("CANVAS PROPORCION: ", this.proporcion);
            ctx.drawImage(
              this.imageSprite,
              frame_width * this.proporcion * (maxRow - 1),
              0,
              frame_width * this.proporcion,
              frame_height * this.proporcion,
              0,
              0,
              frame_width,
              frame_height
            );
          }
        }
        if (this.proporcion > 1 - 3 * fraccion) {
          //Solo se redujo a lo más en 2/8 la resolución
          result = true;
        }
      } catch (error) {
        console.error(
          `Images are not found in route:"${this.imageSprite.src}" ... ${error}`
        );
      }
    }
    return result;
  }

  updateSprite(currentTime) {
    if (this.spriteShown === "visible" && this.imageSprite.src) {
      let ctx = this.refs.sprite.getContext("2d");
      currentTime = currentTime / 10;
      const frame_width = 200;
      const frame_height = 113;
      const maxRow = 10;
      let rowLength = frame_width;
      let row = Math.round(parseInt(currentTime / 10));
      let column = Math.round(parseInt((currentTime % rowLength) % 10));
      console.log("SPRITE ROW:" + row);
      console.log("SPRITE ROW_LENGHT:" + rowLength);
      console.log("SPRITE CurrentTime:" + currentTime);
      console.log("SPRITE COLUMN:" + column);
      console.log("SPRITE height:" + this.imageSprite.height);
      console.log("SPRITE width:" + this.imageSprite.width);
      console.log("CANVAS height:" + this.canvasHeight);
      ctx.canvas.height = frame_height;
      ctx.canvas.width = frame_width;
      try {
        if (this.proporcion > 1 - 3 / 8) {
          //Solo se redujo a lo más en 2/8 la resolución
          ctx.drawImage(
            this.imageSprite,
            frame_width * this.proporcion * column,
            frame_height * this.proporcion * row,
            frame_width * this.proporcion,
            frame_height * this.proporcion,
            0,
            0,
            frame_width,
            frame_height
          );
        }
      } catch (error) {
        console.error(
          `Images are not found in route:"${this.imageSprite.src}" ... ${error}`
        );
      }
    }
  }

  isPixelEmpty(imgData) {
    const red = imgData.data[0];
    const green = imgData.data[1];
    const blue = imgData.data[2];
    const alpha = imgData.data[3];
    console.log("COLORS:" + red + " " + green + " " + blue + " " + alpha);
    return red == 0 && green == 0 && blue == 0 && alpha == 0;
  }

  updateCurrentTimeUI(currentTime) {
    if (this.refs.currentTime) {
      if (this.isLive()) {
        let hasTshift = this.hasTimeshift();
        let ct = this.getCurrentTime();
        let dur = this.getDuration();

        const currentTimeUI =
          this.isLive() && hasTshift && this.state.timeshiftTime != 0
            ? this.state.timeshiftTime
            : ct;
        let diff = dur - currentTimeUI;

        const label =
          !hasTshift || diff <= 0
            ? "EN DIRECTO"
            : `-${Utils.parseSecondsToHours(diff)}`;
        this.refs.currentTime.innerHTML = label;
      } else {
        this.refs.currentTime.innerHTML = this.getCurrentTimeAsString(
          currentTime
        );
        this.refs.currentTimeSprite.innerHTML = this.getCurrentTimeAsString(
          currentTime
        );
      }
    }
    if (this.refs.progressBar) {
      const currentTimePg =
        this.isLive() && this.hasTimeshift() && this.state.timeshiftTime != 0
          ? this.state.timeshiftTime
          : currentTime;
      const percent =
        this.isLive() && !this.hasTimeshift()
          ? 100
          : this.getPercentProgress(currentTimePg);
      this.refs.progressBar.style.width = `${percent}%`;
      const position = this.getAbsoluteElementPosition(
        "player-ui-progress-bar-ball"
      );
      this.refs.sprite.style.left = `${position.left -
        (this.refs.sprite.offsetWidth / 2 -
          this.refs.slider.offsetWidth / 2)}px`;
      this.refs.sprite.style.top = `${position.top - 150}px`;
      this.refs.sprite.style.visibility = `${this.spriteShown}`;
      this.refs.currentTimeSprite.style.visibility = `${this.spriteShown}`;

      this.refs.currentTimeSprite.style.left = `${position.left -
        (this.refs.currentTimeSprite.offsetWidth / 2 -
          this.refs.slider.offsetWidth / 2)}px`;
      this.refs.currentTimeSprite.style.top = `${position.top - 60}px`;
    }
  }

  updateDurationTime(duration) {
    this.setDuration(duration);
    if (this.refs.duration) {
      if (!this.isLive()) {
        this.refs.duration.innerHTML = this.getDurationAsString();
      } else {
        this.refs.duration.innerHTML = "";
      }
    }
  }

  onPlayingSong() {
    store.dispatch(startPlaying());
  }

  onPlayingRadio() {
    store.dispatch(onPlayingRadio());
  }

  onFinishSong() {
    store.dispatch(sendMetricsMusica(this.getCurrentTime(), false));
    store.dispatch(finishPlaying());
  }

  onFavoriteSong() {
    this.sendMetric("agregar favorito");
    store.dispatch(doFavorite());
  }

  resetFavoriteBtn() {
    const btnFav = document.getElementById("favoriteBtn");
    btnFav
      .getElementsByTagName("img")[0]
      .setAttribute("src", Asset.get("player_controls_favorited"));
  }

  /**
   * Get current time as string
   * @param currentTime number
   * @returns {string}
   */
  getCurrentTimeAsString(currentTime) {
    if (
      parseInt(currentTime) === 31 &&
      (this.props.type === playerConstant.AUDIO ||
        this.props.type === playerConstant.RADIO)
    ) {
      this.sendMetricMoreThan30Seconds();
    }
    if (this.props.type === playerConstant.RADIO) {
      return "--:--:--";
    }
    const time =
      typeof currentTime === "number" ? currentTime : this.getCurrentTime();
    return moment({ hours: 0, minute: 0, seconds: 0 })
      .add(time, "s")
      .format("HH:mm:ss");
  }

  /**
   * Get duration time as string
   * @returns {string}
   */
  getDurationAsString() {
    if (this.props.type === playerConstant.RADIO) {
      return "--:--:--";
    } else {
      return this.duration
        ? moment({ hours: 0, minute: 0, seconds: 0 })
            .add(this.duration, "s")
            .format("HH:mm:ss")
        : "--:--:--";
    }
  }

  getDurationInMinutes() {
    return (this.getDuration() / 60.0).toFixed();
  }

  getCurrentTimeInMinutes() {
    return (this.getCurrentTime() / 60.0).toFixed();
  }

  play() {
    var channel_if = window.localStorage.lastChannel;
    var liveTime_if = ChannelsSingleton.getTimeshift(channel_if);
    if (liveTime_if == 0 && this.isLive()) {
      this.hide();
    }

    if (this.isLive()) {
      this.backwardTimeshiftUI();
    }
    this.sendMetric("reproducir");
    if (
      (this.isVisible && this.canPlay) ||
      this.props.type === playerConstant.AUDIO
    ) {
      console.log("Playercontrols > play method");
      this.setState({ playing: true }, this.focusPlayButton);
      this.props.play();
      this.isPlay = true;
      if (this.seekInPause) {
        Utils.seekInPause(this.props.seek, this.seekInPause);
        this.seekInPause = 0;
      }
    }
  }

  sendDimension() {
    const payload = new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: "executor" });
  }

  sendMetric(action, label = null) {
    var pgm = TrackerManager.getDataPgm();
    try {
      this.props.dataMetric.title = store.getState().resume.title;
      this.props.dataMetric.provider =
        pgm.response.group.common.extendedcommon.media.proveedor.nombre;
    } catch (e) {
      console.log("Send Metric TV");
      console.log("HAY TITULO ACA? >>>>>>", this.props.dataMetric.title);
    }

    if (typeof this.props.setMetricsEvent === "function") {
      if (this.props.type === "audio" || this.props.type === "radio") {
        if (label === null) {
          label = DeviceStorage.getItem("label-music-analytics");
        }
        if (action === "volver") {
          action = `${action}/${this.getCurrentTimeInMinutes()}/${this.getDurationInMinutes()}`;
        }
        this.props.setMetricsEvent({
          hitType: "event",
          eventCategory: "acciones",
          eventAction: action,
          eventLabel: label
        });
      } else {
        let provedor;
        if (label === null) {
          switch (this.props.dataMetric.provider) {
            case "FOX":
              provedor = "fox";
              break;
            case "AMCO":
              provedor = "suscripcion";
              break;
            case "HBO":
              provedor = "hbo";
              break;
            case "INDYCAR":
              provedor = "indycar";
              break;
            case "EDYE":
              provedor = "edye";
              break;
            default:
              provedor = "suscripcion";
          }
          label = `${provedor} - ${this.props.dataMetric.title}`;
        } else {
          label = `${label} - ${this.props.dataMetric.title}`;
        }
        if (action === "volver") {
          action = `${action}/${this.getCurrentTimeInMinutes()}/${this.getDurationInMinutes()}`;
        }
        if (action === "cambiar episodio") {
          let t = this.props.dataMetric.title.split(":");
          label = `${t[0]} - ${label}`;
        }

        this.props.setMetricsEvent({
          hitType: "event",
          eventCategory: "reproductor",
          eventAction: action,
          eventLabel: label
        });
      }

      this.props.setMetricsEvent({ type: "executor" });
      this.sendDimension();
    }
  }

  sendMetricMoreThan30Seconds() {
    if (typeof this.props.setMetricsEvent === "function") {
      const label = DeviceStorage.getItem("label-music-analytics") || "";
      if (label !== this.metricSend) {
        this.props.setMetricsEvent({
          hitType: "event",
          eventCategory: "reproductor",
          eventAction: "completo+30",
          eventLabel: label
        });
        this.props.setMetricsEvent({
          type: "executor"
        });
        this.metricSend = label;
        this.sendDimension();
      }
    }
  }

  closeModal(modalType) {
    if (!Utils.isModalHide() && modalType === Utils.modalType()) {
      store.dispatch({
        type: HIDE_MODAL,
        modalType
      });
    }
  }

  closeModalLang() {
    this.closeModal(MODAL_LANGUAGES);
  }

  backwardTimeshiftUI(pauseEnable = false) {
    let hasTshift = this.hasTimeshift();
    if (this.onLivePauseTimer) clearInterval(this.onLivePauseTimer);

    if (hasTshift && pauseEnable) {
      const timerExecuteMs = this.timePauseEventInterval * 60 * 1000;
      const timerExecuteMin = this.timePauseEventInterval * 60;
      this.state.timeshiftTime = this.getCurrentTime();

      this.onLivePauseTimer = setInterval(() => {
        let timePassingLeft = 0;

        if (this.state.timeshiftTime > 0 && !this.state.playing) {
          timePassingLeft = this.state.timeshiftTime - timerExecuteMin;
          timePassingLeft = timePassingLeft < 0 ? 0 : timePassingLeft;

          this.state.timeshiftTime = timePassingLeft;
          this.setCurrentTime(timePassingLeft);
          this.updateCurrentTimeUI(timePassingLeft);
        } else {
          // Self destroy
          clearInterval(this.onLivePauseTimer);
        }
      }, timerExecuteMs);
    }
  }

  pause() {
    var channel_if = window.localStorage.lastChannel;
    var liveTime_if = ChannelsSingleton.getTimeshift(channel_if);
    if (liveTime_if === 0 && this.isLive()) {
      this.hide();
    }
    this.sendMetric("pausa");
    if (
      (this.isVisible && this.canPlay) ||
      this.props.type === playerConstant.AUDIO ||
      this.props.type === playerConstant.RADIO
    ) {
      console.log("Playercontrols > pause method");
      this.setState({ playing: false }, this.focusPlayButton);
      if (this.isLive()) {
        //this.props.pause(this.hasTimeshift());
        this.props.pause();
        this.backwardTimeshiftUI(true);
      } else {
        this.props.pause();
      }
      this.isPlay = false;
    }
  }

  seek(time) {
    if ((this.isVisible || this.flagSkipIntro) && this.canPlay) {
      if (!this.state.playing) {
        this.seekInPause = time;
        this.setCurrentTime(this.seekInPause);
      } else {
        this.props.seek(time);
      }
    }
  }

  backward(time) {
    var channel_if = window.localStorage.lastChannel;
    var liveTime_if = ChannelsSingleton.getTimeshift(channel_if);
    if (liveTime_if === 0 && this.isLive()) {
      this.hide();
    }

    if (
      this.props.type === playerConstant.AUDIO &&
      store.dispatch(checkListType())
    ) {
      return false;
    }
    if (this.isVisible && this.canPlay) {
      if (!this.isLive()) {
        this.calculateFinalSeekTime(true, this.settings.backwardTime);
      } else {
        console.log("[PS4 TSH] enter backward 3");
        this.handleTimeshiftSeek(true, this.settings.backwardTime_timeshift);
      }
    }
  }

  /*
  TODO verificar si este boton: regresar en tiempo y/o en serie regresar cap anterior
  */
  stepBackward(time) {
    if (this.isVisible) {
      if (!this.isLive()) {
        this.calculateFinalSeekTime(true, this.settings.stepBackwardTime);
      } else {
        this.handleTimeshiftSeek(
          true,
          this.settings.stepBackwardTime_timeshift
        );
      }
    }
  }

  fastBackward(time) {
    TrackerManager.rewind30(this.player.getCurrentTime());
    this.sendMetric("Atrasar 30 segundos");

    if (this.isVisible && this.canPlay) {
      this.calculateFinalSeekTime(true, this.settings.backwardTime);
    }
  }

  forward(time) {
    var channel_if = window.localStorage.lastChannel;
    var liveTime_if = ChannelsSingleton.getTimeshift(channel_if);
    if (liveTime_if === 0 && this.isLive()) {
      this.hide();
    }
    //this.sendMetric('adelantar');
    console.log("&&&&&&&&&&& forward time 0: " + time);

    if (
      this.props.type === playerConstant.AUDIO &&
      store.dispatch(checkListType())
    ) {
      return false;
    }
    console.log("&&&&&&&&&&& forward time 1: " + time);
    if (this.isVisible && this.canPlay) {
      console.log("&&&&&&&&&&& forward time 2: " + time);
      if (!this.isLive()) {
        this.calculateFinalSeekTime(false, this.settings.forwardTime);
      } else {
        this.handleTimeshiftSeek(false, this.settings.forwardTime_timeshift);
      }
    }
  }

  /*
  TODO verificar si este boton: adelantar en tiempo y/o en serie regresar cap siguiente
  */
  stepForward(time) {
    if (this.isVisible) {
      if (!this.isLive()) {
        this.calculateFinalSeekTime(false, this.settings.stepForwardTime);
      } else {
        this.handleTimeshiftSeek(
          false,
          this.settings.stepForwardTime_timeshift
        );
      }
    }
  }

  fastForward(time) {
    TrackerManager.foward30(this.player.getCurrentTime());
    this.sendMetric("adelantar 30 segundos");

    if (this.isVisible && !this.isLive() && this.canPlay) {
      this.calculateFinalSeekTime(false, this.settings.forwardTime);
    }
  }

  replay() {
    if (this.isVisible) {
      this.props.replay();
    }
  }

  back(withHistoryBack) {
    this.sendMetric("volver");
    // document.removeEventListener('keydown', this.keyPressHandler);
    this.hide();
    this.props.back(withHistoryBack);
  }

  next() {
    if (this.isVisible) {
      this.props.next();
    }
  }

  nextSong() {
    if (store.dispatch(canGoToNextSong())) {
      this.sendMetric("siguiente cancion");
      this.resetFavoriteBtn();
      store.dispatch(goToNextSong(this.getCurrentTime()));
    }
  }

  previewSong() {
    this.sendMetric("anterior cancion");
    this.resetFavoriteBtn();
    store.dispatch(goToPreviewSong(this.getCurrentTime()));
  }

  doRepeat() {
    this.sendMetric("repetir");
    store.dispatch(doToggleRepeat());
  }

  doShuffle() {
    const actShuffle = store.dispatch(doToggleShuffle());
    this.sendMetric("aleatorio");
    if (actShuffle) {
      const btnShuffle = document.getElementById("shuffleBtn");
      const img = btnShuffle.getElementsByTagName("img")[0].getAttribute("src");
      if (img.indexOf("controls_random.png") !== -1) {
        btnShuffle
          .getElementsByTagName("img")[0]
          .setAttribute("src", Asset.get("player_controls_random_selected"));
      } else {
        btnShuffle
          .getElementsByTagName("img")[0]
          .setAttribute("src", Asset.get("player_controls_random"));
      }
    }
  }

  record() {
    if (this.isVisible && this.currentEvent) {
      this.props.record(this.currentEvent);
    }
  }

  resetSeekInPause() {
    this.seekInPause = 0;
  }

  changeLang(e) {
    TrackerManager.audioChange(this.player.getCurrentTime());
    this.sendMetric("idioma", e.label_short);
    if (this.seekInPause) {
      e.resume = this.seekInPause;
    }
    this.actions = {
      play: () => this.play(),
      resetSeekInPause: () => this.resetSeekInPause()
    };
    try {
      this.props.changeLang(e, this.actions);
    } catch (e) {
      console.error("Error changeLang:", e);
    }
  }

  static onUpdateLangOptions(langOptions) {
    PlayerControls.languageOptions = langOptions;
  }

  showLangModal() {
    store.dispatch(
      showModal({
        modalType: MODAL_LANGUAGES,
        modalProps: {
          languages:
            PlayerControls.languageOptions &&
            PlayerControls.languageOptions.length > 0
              ? PlayerControls.languageOptions
              : this.props.jsonLangs,
          callback: this.changeLang
        }
      })
    );
  }

  updateSpriteSrc(episode = {}) {
    this.imageSpriteURLnew = episode.image_sprites;
  }

  async handleEpisodeClick(episode = {}) {
    let that = this;
    console.log("[PlayerControls] episode:", episode);
    this.__isNextEpisodeAvailable(episode)
      .then(function(response) {
        console.log(
          "[PlayerControls] El siguiente contenido SI se puede ver",
          response
        );
        that.sendMetric("cambiar episodio " + episode.title_episode);

        that.updateSpriteSrc(episode);
        if (episode && episode.image_sprites) {
          episode.spriteImage = episode.image_sprites;
        }
        store.dispatch(setResumeData(episode));
        if (that.props.changeContentfromSelector) {
          return that.props.changeContentfromSelector(episode.id);
        }
        const groupId = episode.id;
        const state = {
          isTrailer: false,
          serieData: {
            seasons: that.props.serieData.seasons,
            episodeNumber: episode.episode_number,
            seasonNumber: episode.season_number
          }
        };
        that.addListeners();
        that.props.handleRedirect(`/player/${groupId}`, state, true);
        /* Inicio de comentarios que ya estaban */
        // GET MEDIA
        //TrackerManager.pgm(this.player.getCurrentTime());
        // TrackerManager.playing(this.player.getCurrentTime());
        /* Fin de comentarios que ya estaban */
      })
      .catch(error => {
        console.log(
          "[PlayerControls] El siguiente contenido NO se puede ver",
          error
        );
        //Se mostrará en modal de error que provenga del error (error.errors[0].code)
        this.showModalNotPurchasedEpisodeError(error);
      });
  }

  /*
   * Modal que muestra el error de que el contenido que se intenta reproducir no está disponible
   */

  showModalNotPurchasedEpisodeError(error) {
    /* El valor 'PLY_PLY_00007' podría cambiar en APA, por lo que es necesaria una mejor forma de obtener esa referencia, desde API por ejemplo */
    let code =
      error && error.errors && error.errors[0].code
        ? error.errors[0].code
        : "PLY_PLY_00007";
    let errorMsg = Translator.get(code, "");
    const modalProps = {
      callback: null,
      content: { message: errorMsg }
    };
    const modal = {
      modalType: MODAL_ERROR,
      modalProps
    };
    store.dispatch(showModal(modal));
  }

  /*
   *   Método que indica que el siguiente contenido esta disponible, devolviendo la respuesta como error
   *   si no está comprado o no disponible.
   */
  __isNextEpisodeAvailable(episode) {
    let isSourceReplace = false;
    return new Promise((resolve, reject) => {
      api.purchaseButtonInfo(episode.id).then(response => {
        console.log(
          "[PlayerControls] respuesta de la purchaseButtonInfo: ",
          response
        );
        if (response.playButton && response.playButton.waspurchased === "1") {
          resolve(true);
        } else {
          reject(response);
        }
      });
    });
  }

  showSeasonsModal() {
    if (this.isVisible) {
      const modal = {
        modalType: MODAL_EPISODE_SELECT,
        modalProps: {
          serieData: this.serieData,
          handleEpisodeClick: this.handleEpisodeClick,
          onClose: () => this.addListeners()
        }
      };
      store.dispatch(showModal(modal));
    }
  }

  showFullEpg() {
    if (this.isVisible) {
      this.props.handleFullEpg("GUIDE");
      this.isVisible = false;
      this.hide();
    }
  }

  /**
   * hide controls
   */
  hide = () => {
    console.log("[PlayerControls] hide");
    console.log("[PlayerControls][miniEpg] hide");
    this.imageSpriteURLnew = ""; //To reset URL sprites when changing channels from episodes selector when playing
    let isAudio =
      this.props.type === playerConstant.AUDIO ||
      this.props.type === playerConstant.RADIO;
    const coverFlowIsActive = document.querySelector(".epg-cover-flow");
    this.hideControls();
    this.skipIntroPositionDown();
    clearInterval(this.timer);
    if (this.refs && this.refs.container && !isAudio && !coverFlowIsActive) {
      const className = this.refs.container.className;
      this.refs.container.className =
        className.indexOf("hide-controls") === -1
          ? `${className} ${this.hasEpgErrorOnLive() ? "" : "hide-controls"}`
          : className;
      this.isVisible = false;
      PlayerControls.isVisible = false;
      this.props.controlBarIsShowed(this.isVisible);
      this.onHideListeners.forEach(el => {
        el && el();
      });
    }
  };

  /**
   * Show controls and set a timer for hide
   */
  show = currentKey => {
    if (this.props.checkStatusEPG) return;

    const isHidden =
      this.refs.container.className.indexOf("hide-controls") > -1;

    //Si hay un error de la EPG no mostrar este control
    if (this.hasEpgErrorOnLive()) {
      this.isVisible = false;
      //this.props.launchCoverFlow(true);
      //TODO: activar el coverFlow
      return;
    }

    const reduxState = store.getState();
    if (
      reduxState.player &&
      reduxState.player.source &&
      this.props.epgGroupId &&
      reduxState.player.source.videoid != this.props.epgGroupId &&
      this.currentEvent &&
      reduxState.player.source.videoid != this.currentEvent.groupId
    ) {
      this.isVisible = false;
      return;
    }

    // [TIZEN][resetPlayerStatus] After the key is pressed the flag returns to its normal state.
    this.isFocusButton = false;

    if (this.refs && this.refs.container && !this.props.checkStatusEPG) {
      const className = this.refs.container.className;
      this.refs.container.className = `${className.replace(
        " hide-controls",
        ""
      )}`;
      this.isVisible = true;
      PlayerControls.isVisible = true;
      this.skipIntroPositionUp();
      this.setTimer();
      if (!this.isLive()) {
        window.SpatialNavigation.enable("player_controls");
      }
      this.props.controlBarIsShowed(this.isVisible);
    }

    this.setfocusMiniEpg(isHidden, currentKey);
  };

  setfocusMiniEpg(isHidden, currentKey) {
    let sendMoveSpatial = {};
    if (isHidden && (currentKey == "CH_DOWN" || currentKey == "CH_UP")) {
      sendMoveSpatial = { currentKey };
    }
    if (
      this.isVisible &&
      this.isLive() &&
      Utils.isModalHide() &&
      isHidden &&
      !(currentKey == "DOWN" || currentKey == "UP")
    ) {
      setTimeout(() => {
        this.focusMiniEpg(sendMoveSpatial);
      }, 300);
    }
  }

  hasEpgErrorOnLive() {
    return this.props.hasEpgError() && this.isLive();
  }

  /**
   * Position Skip Intro
   */
  skipIntroPositionUp() {
    if (this.refs && this.refs.skipIntro && this.hasSkipIntro) {
      const className = this.refs.skipIntro.className;
      const classNameReplace = className.replace(
        "skip-intro-down",
        "skip-intro-up"
      );
      this.refs.skipIntro.className =
        className.indexOf("skip-intro-down") > -1
          ? classNameReplace
          : className;
    }
  }

  skipIntroPositionDown() {
    if (this.refs && this.refs.skipIntro && this.hasSkipIntro) {
      const className = this.refs.skipIntro.className;
      const classNameReplace = className.replace(
        "skip-intro-up",
        "skip-intro-down"
      );
      this.refs.skipIntro.className = classNameReplace;
      this.doFocusableSkipIntro();
    }
  }

  toggleControlsVod = () => {
    if (this.isVisible) this.hide();
    else this.show();
  };

  showControls() {
    if (this.isLive() && this.refs.container) {
      const className = this.refs.container.className;
      // this.refs.container.className = `${className} mini-epg-visible`;
      if (this.enableButton("yellow") || !config_remote_control) {
        this.refs.container.className = `${className.replace(
          "show-mini-epg",
          "show-controls"
        )}`;
      }
      window.SpatialNavigation.enable("player_controls");
      //   this.setState({showControls: true}, () => setTimeout(this.focusPlayButton, 300));
    }
  }

  enableButton(colorCode) {
    let ret = null;
    let playercontrols = Metadata.get("playercontrols", "NA");
    if (playercontrols !== "NA") {
      playercontrols = JSON.parse(playercontrols);

      if (Utils.isObject(playercontrols)) {
        const region = storage.getItem("region");
        let keyCode = null;
        switch (colorCode) {
          case "yellow":
            keyCode = "yellowbutton";
            break;
          default:
            break;
        }

        if (
          Utils.isNotNullOrNotUndefined(playercontrols[region]) &&
          Utils.isNotNullOrNotUndefined(playercontrols[region][keyCode])
        ) {
          ret = playercontrols[region][keyCode].enable;
        }

        // Null aún?
        if (ret === null) {
          if (
            Utils.isNotNullOrNotUndefined(playercontrols["default"]) &&
            Utils.isNotNullOrNotUndefined(playercontrols["default"][keyCode])
          ) {
            ret = playercontrols["default"][keyCode].enable;
          }
        }
      }
    }

    // ...sigue null aún?
    if (ret === null) {
      ret = false; // <- por defecto, amarillo inactivo
    }

    return ret;
  }

  hideControls() {
    if (this.isLive() && this.refs.container) {
      const className = this.refs.container.className;
      // this.refs.container.className = `${className.replace(' mini-epg-visible', '')}`;
      this.refs.container.className = `${className.replace(
        "show-controls",
        "show-mini-epg"
      )}`;
      window.SpatialNavigation.disable("player_controls");
      // this.setState({showControls: false}, () => setTimeout(this.focusMiniEpg, 200));
    }
  }

  toggleControls() {
    if (this.refs && this.refs.container) {
      this.show();
      const className = this.refs.container.className;
      if (className.includes("show-mini-epg")) {
        this.showControls();
      } else {
        this.hideControls();
      }
    }
  }

  /**
   * Slider side actions
   * @param e
   */
  slide(e) {
    console.log("Playercontrols slide events");
    if (!this.isVisible) {
      return false;
    }

    if (!this.canPlay) {
      return false;
    }

    if (
      this.props.type === playerConstant.AUDIO &&
      store.dispatch(checkListType())
    ) {
      return false;
    }

    const { direction } = e.detail;
    let time = 0;
    switch (direction) {
      case "left":
        e.preventDefault();
        if (!this.isLive()) {
          this.calculateFinalSeekTime(true, this.settings.slideTime);
        } else {
          this.handleTimeshiftSeek(true, this.settings.slideTime_timeshift);
        }
        break;
      case "right":
        e.preventDefault();
        if (!this.isLive()) {
          this.calculateFinalSeekTime(false, this.settings.slideTime);
        } else {
          this.handleTimeshiftSeek(false, this.settings.slideTime_timeshift);
        }
        break;
      default:
    }
  }

  /**
    if(!this.isPlayerFull) return;
    if (!this.timeShift || !isNaN(this.timeShift)) {
      this.timeShift = m().unix();
    }
    const safeTime = this.getSafeTime();
    this.timeShift += seconds + safeTime;
    const _this = this;
    if (this.waitingSeek) clearTimeout(this.waitingSeek);
    this.waitingSeek = setTimeout(() => {
      const currentTime = m().unix();
      const time = _this.timeShift > currentTime ? currentTime : _this.timeShift;
      _this.timeShift = m.unix(time).format("YYYY/MM/DD hh:mm:ss");
      _this.performTimeShift(params);
    }, 1000);

   */

  /*
    handleTimeshiftSeek(isBackward, seekTime) {
    if (this.hasTimeshift()) {
      if (this.timerTimeshitDelayId) clearTimeout(this.timerTimeshitDelayId);
      if (isBackward) {
        this.setCurrentTime(this.getCurrentTime() - seekTime < 0 ? 0 : this.getCurrentTime() - seekTime);
      } else {
        this.setCurrentTime(this.getCurrentTime() + seekTime > this.getDuration() ? this.getDuration() : this.getCurrentTime() + seekTime);
      }
      this.updateCurrentTimeUI(this.getCurrentTime());
      this.timerTimeshitDelayId = setTimeout(() => {
        this.timerTimeshitDelayId = null;
        this.perfomTimeshift();
      }, this.delayTimeshiftSeek);
    }
  }
  */

  handleTimeshiftSeek(isBackward, seekTime) {
    console.log(
      "[PS4 PAUPESTAS] enter handleTimeshiftSeek seekTime: ",
      seekTime
    );
    if (this.hasTimeshift()) {
      console.log("[PS4 TSH] enter handleTimeshiftSeek 2 hasTimeshift=true");
      if (this.timerTimeshitDelayId) clearTimeout(this.timerTimeshitDelayId);
      let currTime = this.getCurrentTime();
      if (isBackward) {
        console.log("[PS4 TSH] enter handleTimeshiftSeek isBackward = true");
        const newCurrentTime =
          currTime - seekTime < 0 ? 0 : currTime - seekTime;
        this.setCurrentTime(newCurrentTime);
        //if(this.isLive() && isBackward && (newCurrentTime < this.getCurrentTime())){
        if (this.isLive() && isBackward && newCurrentTime < currTime) {
          this.state.timeshiftTime = newCurrentTime; // Sólo como flag
        }
      } else {
        const newCurrentTimeForward =
          currTime + seekTime > this.getDuration()
            ? this.getDuration()
            : currTime + seekTime;
        this.setCurrentTime(newCurrentTimeForward);
        if (this.isLive() && newCurrentTimeForward > currTime) {
          this.state.timeshiftTime = newCurrentTimeForward;
        }
      }

      let timeshiftDelay = this.getDuration() - this.getCurrentTime();
      let timeshiftData = {
        backward: isBackward,
        // Si es negativo o no, se verifica en video/component, quien es quien decide
        // si se va o no a pgm o solo hace seek sobre el actual playing
        seektime:
          this.state.channelInfo.timeshiftAllowed - this.state.timeshiftTime,
        maxtimeshiftallowed: this.state.channelInfo.timeshiftAllowed,
        timeshiftDelay
      };

      this.updateCurrentTimeUI(this.getCurrentTime());
      this.timerTimeshitDelayId = setTimeout(() => {
        this.timerTimeshitDelayId = null;
        this.perfomTimeshift(timeshiftData);
      }, this.delayTimeshiftSeek);
    }
  }

  async perfomTimeshift(timeshiftData) {
    console.log("[PS4 TSH] enter perfomTimeshift");
    const now = Utils.now();
    const safeTime = this.getSafeTime();
    console.error(
      "[PS4 TSH] RDGV: now",
      now,
      "getDuration",
      this.getDuration(),
      "getCurrentTime",
      this.getCurrentTime()
    );
    let begin = moment(Utils.now())
      .subtract(
        this.getDuration() - this.getCurrentTime() + safeTime,
        "seconds"
      )
      .toDate();
    begin = this.getDuration() - this.getCurrentTime() > 0 ? begin : null;
    console.error("[PS4 TSH] RDGV: begin pgm", begin);
    //const streamType = 'smooth_streaming';
    let platf = Device.getDevice().getPlatform();
    const groupId = DeviceStorage.getItem("lastChannel");
    if (this.props.doTimeshift && Utils.isFunction(this.props.doTimeshift)) {
      this.props.doTimeshift(groupId, begin, timeshiftData);
    }

    try {
      if (typeof this.props.onUpdateCurrentTimeshift === "function") {
        console.error(
          "[PS4 TSH] RDGV prev onUpdateCurrentTimeshift",
          this.getCurrentTime()
        );
        this.props.onUpdateCurrentTimeshift(this.getCurrentTime());
      }
      //store.dispatch(replaceFullSourceMedia(newSource));
    } catch (error) {
      console.error("[PS4 TSH] Error on timeshift ", error);
    }
  }

  getSafeTime() {
    const region = storage.getItem("region");
    let safeTime = Metadata.get("epg_event_safe_time", null);
    if (typeof safeTime !== "Object") {
      if (safeTime !== "epg_event_safe_time") safeTime = JSON.parse(safeTime);
      else return 0;
    }
    const safeTimeRegionExists =
      safeTime[region] &&
      safeTime[region].timeshift &&
      safeTime[region].timeshift.start;
    if (safeTimeRegionExists) return safeTime[region].timeshift.start;
    else {
      const safeTimeDefaultExists =
        safeTime["default"] &&
        safeTime["default"].timeshift &&
        safeTime["default"].timeshift.start;
      if (safeTimeDefaultExists) return safeTime["default"].timeshift.start;
      else return 0;
    }
  }

  doSeek(newSecs, currentTime) {
    // MANDANDO METRICAS AL DASHBOARD
    console.log(
      "[PlayerControls] doSeek  " + "-newSecs " + newSecs,
      "- currentTime " + currentTime
    );
    this.seekBarInterval.stop();
    this.seekBarInterval.start();
    this.isMoving = true;
    this.seekTotalTime = newSecs;
  }

  showSprites(itCanShowSprites) {
    if (
      itCanShowSprites &&
      !this.isTrailer() &&
      !this.isLive() &&
      !store.getState().user.isAnonymous
    ) {
      this.spriteShown = "visible";
    }
  }

  hideSprites() {
    this.spriteShown = "hidden";
  }

  setOperatorsSeek(values) {
    this.valuesSeek = { ...values };
  }

  getOperatorsSeek() {
    return this.valuesSeek;
  }

  sendFowardRewindSeek() {
    const { isBackward, seekTime } = this.getOperatorsSeek();

    if (isBackward && (seekTime === 15 || seekTime === 10)) {
      TrackerManager.rewind(this.player.getCurrentTime());
    } else if (!isBackward && (seekTime === 15 || seekTime === 10)) {
      TrackerManager.foward(this.player.getCurrentTime());
    }
  }

  calculateFinalSeekTime(isBackward, seekTime) {
    // MANDANDO METRICAS AL DASHBOARD necesita refactorizado...
    this.showSprites(this.canShowSprites());
    console.log(
      "Vemos los nuevos tiempos que se tienen en el player  -isBackward - seekTime ",
      isBackward,
      seekTime
    );
    this.setOperatorsSeek({ isBackward, seekTime });
    this.show();
    console.log(
      "Playerinterval calculateFinalSeekTime this.seekTime> " + this.seekTime
    );
    let secs = isBackward ? -seekTime : seekTime;
    let curTime = this.getCurrentTime();
    if (this.seekInPause) {
      curTime = this.seekInPause;
    }
    let newSecs = curTime + (this.seekTime += secs);
    if (newSecs < 0) {
      newSecs = 0;
    }
    if (newSecs > this.duration) {
      newSecs = this.duration - 1;
    }
    console.log(
      "[PlayerControls] calculateFinalSeekTime",
      "\nisBackward " + isBackward,
      "\nnewSeekTime " + seekTime,
      "\nseekTime " + this.seekTime,
      "\nnewSecs " + newSecs,
      "\ncurTime " + curTime
    );
    this.updateCurrentTimeUI(newSecs);
    this.updateSprite(newSecs);
    this.doSeek(newSecs, curTime);
    this.hideSprites();
  }

  focus(selector) {
    window.SpatialNavigation.focus(selector);
  }

  focusPlayButton() {
    // [TIZEN][resetPlayerStatus] If an key is pressed isFocusButton = TRUE
    this.isFocusButton = true;
    this.focus(".player-main-button");
  }

  focusPlayButtonAudio() {
    if (
      this.props.type == playerConstant.AUDIO ||
      this.props.type == playerConstant.RADIO
    ) {
      this.focus(".player-main-button");
    }
  }

  focusMiniEpg(sendMoveSpatial) {
    let currentEventId = Utils.idEventCurrent(
      this.epgInPlayerControl,
      this.currentHorizontalIndex
    );
    console.log("FOCUS MINI", currentEventId);
    Utils.isMiniEPGOpen() &&
      window.SpatialNavigation.focus(currentEventId || ".epg-main .focusable");
    if (sendMoveSpatial && sendMoveSpatial.currentKey) {
      Utils.moveSpatial(sendMoveSpatial.currentKey);
    }
  }

  onFocus(e) {
    console.log("Playercontrols onFocus method");
    this.resetPlayerStatus();
    this.show();
  }

  resetPlayerStatus() {
    // [TIZEN] This method is add for Tizen transition between an External App (e.g Youtube) & Clarovideo
    const platf = Device.getDevice().getPlatform();

    if (
      platf === "tizen" &&
      !this.state.playing &&
      !this.isLive() &&
      !this.isFocusButton
    ) {
      // The state only changes when no key is pressed
      this.setState({
        playing: true
      });
    }
  }

  onFocusMove(e) {
    const { direction } = e.detail;
    /* switch (direction) {
      case 'down':
        e.preventDefault();
      default:
    } */
  }

  getLinks() {
    return getLinksFromNavConfiguration();
  }

  keyPressHandler(e) {
    console.log("Listening [PlayerControls] keyPressHandler");
    if (LayersControl.isUXVisible()) return;
    const modal = document.getElementsByClassName("modal-overlay");

    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    console.log(
      "Enter to Listening [PlayerControls] keyPressHandler, currentKey:",
      currentKey
    );
    switch (currentKey) {
      case "INFO":
        let user = store.getState().user;
        let isOTTGuy =
          !user ||
          !user.paymentMethods ||
          (user.paymentMethods &&
            !user.paymentMethods.hubcorporativofijogate &&
            !user.paymentMethods.hubfijovirtualgate);
        if (!isOTTGuy) {
          /* quitando funcionalidad de boton info para usuarios que no son ott
          console.log('Listening PlayerControls => Handle INFO ', currentKey);
          const lastChannel = DeviceStorage.getItem('lastChannel');
          this.props.goToCard('/epg/' + lastChannel);
          */
        }

        //Mostrar miniguia
        if (this.isVisible) {
          this.hide();
        } else {
          this.showMiniEPG(e);
        }
        break;
      case "BLUE":
        if (this.isVod()) {
          //Se quita funcionalidad a los botones de colores en VOD
          return;
        }
        if (!this.isLive()) this.toggleControlsVod();
        /*
        if(this.state.showControls) {
          console.log('Listening PlayerControls - to Handle BLUE - currentEventOriginal', this.currentEventOriginal);
          if(this.currentEventOriginal.event && this.currentEventOriginal.channel){
            console.log('Listening EPG btn BLUE after');
            e.preventDefault();
            const channelGroupId = this.currentEventOriginal.channel.group_id;
            let channelEvent = this.currentEventOriginal.event;
            this.currentEventOriginal.event.group_id = channelEvent.group_id ? channelEvent.group_id : channelGroupId;
            let eventData = JSON.stringify({ event: channelEvent });
            const pathName = `/epg/${channelGroupId}?eventData=${encodeURI(eventData)}`;
            this.props.goToCard(pathName);
          }
        }
        */
        break;
      case "YELLOW":
        if (this.isVod()) {
          //Se quita funcionalidad a los botones de colores en VOD
          return;
        }
        if (!this.isLive()) this.toggleControlsVod();
        break;
      case "GREEN":
        if (this.isVod()) {
          //Se quita funcionalidad a los botones de colores en VOD
          return;
        }
        if (!this.isLive()) this.showLangModal();
        break;
      case "RED":
        if (this.isVod()) {
          //Se quita funcionalidad a los botones de colores en VOD
          return;
        }
        if (this.isLive()) {
          this.sendMetric("buscar");
          this.props.goToCard("/search");
        } else {
          this.toggleControlsVod();
        }
        break;
      case "FWD":
        this.show();
        this.showControls();
        this.forward();
        if (!this.isLive()) this.closeModalLang();
        break;
      case "RWD": //backward
        this.show();
        this.showControls();
        this.backward();
        if (!this.isLive()) this.closeModalLang();
        console.log("PLAYER");
        break;
      case "NEXT_SKIP":
        this.show();
        this.showControls();
        this.stepForward();
        console.log("NEXT_SKIP BUTTON");
        break;
      case "PREV_SKIP":
        this.show();
        this.showControls();
        this.stepBackward();
        console.log("PREV_SKIP BUTTON");
        break;
      case "PLAY": //PAUSE / PLAY
        if (!this.isLive()) {
          this.show();
          this.showControls();
          this.closeModalLang();
          this.isPlay = !this.isPlay;
          if (this.isPlay) {
            this.play();
          } else {
            this.pause();
          }
        } else {
          this.playPauseButtonControl();
        }
        break;
      case "STOP": //PARAR - INICIAR
        if (!this.isLive()) {
          //this.show();
          //this.seek(0);
          this.back(); //regresa a la ficha solo para vod
          this.closeModalLang();
        }
        break;
      case "REC": //RECORD
        if (this.recordingsEnabled && !this.isLive()) {
          this.show();
          this.record();
        }
        break;
      case "SUB_AUD": //SUBTITLES
        if (this.isPlay && this.langDevice()) {
          this.show();
          this.showControls();
          this.showLangModal();
        }
        break;
      case "GUIDE":
        if (this.props.isChangingChannel()) {
          return;
        }

        if (this.isLive()) {
          this.props.handleFullEpg("GUIDE");
        } else if (this.isVod()) {
          e.preventDefault();
          e.stopPropagation();
          console.log("GUIDE btn in VOD should not be handled");
        } else {
          /* TODO nagratv hardcode */
          this.props.goToCard(
            `/node/${this.getLinks().clarotv}?param=channels`
          );
        }
        break;
      case "BACK":
        e.preventDefault();
        e.stopPropagation();
        // Para música
        if (
          this.props.type === playerConstant.AUDIO ||
          this.props.type === playerConstant.RADIO
        ) {
          this.back();
          store.dispatch({ type: HIDE_MODAL });
          this.props.hideEpgOutside();
        }
        // Para video
        else {
          if (this.isVisible) {
            this.hide();
          } else {
            this.back();
            this.props.hideEpgOutside();
          }
        }
        break;
      case "RIGHT":
      case "LEFT":
      case "UP":
      case "DOWN":
        this.showMiniEPG(e, currentKey);
        break;
      case "MOSAIC":
        e.stopPropagation();
        if (this.isLive()) {
          // this.show();
          this.props.handleFullEpg("MOSAIC");
        }
        break;
      case "OK":
        // TODO add here all methods that will have similar functionality
        if (
          e.target.id === "backward" ||
          e.target.id === "forward" ||
          e.target.id === "stepBackward" ||
          e.target.id === "stepForward"
        ) {
          e.preventDefault();
          e.stopPropagation();
          if (e.target.id === "backward") {
            this.backward();
          }
          if (e.target.id === "stepBackward") {
            this.stepBackward();
          }
          if (e.target.id === "forward") {
            this.forward();
          }
          if (e.target.id === "stepForward") {
            this.stepForward();
          }
        } else if (true && !this.flagSkipIntro) {
          //todo to define a condition to this
          this.showMiniEPG(e, currentKey);
        }
        break;
      case "CH_UP":
      case "CH_DOWN":
        if (!this.isLive()) {
          break;
        }
        if (Utils.choiceBehaviorChannelChange()) {
          this.showMiniEPG(e, currentKey);
        }
        break;
      case "ZERO":
      case "ONE":
      case "TWO":
      case "THREE":
      case "FOUR":
      case "FIVE":
      case "SIX":
      case "SEVEN":
      case "EIGHT":
      case "NINE":
        store.dispatch(navigateFrom("Number"));
        if (this.props.type === "live" && modal.length == 0) {
          if (!this.props.isChangingChannel() && !this.props.checkStatusEPG) {
            this.handleChannelChange(e, this.codeToVal.getKeyValue(currentKey));
          }
        }
        break;
      default:
        break;
    }
  }

  showMiniEPG(e, currentKey) {
    if (this.props.isChangingChannel()) {
      return;
    }
    const modal = document.getElementsByClassName("modal-overlay");

    if (modal.length === 0) {
      if (
        !this.isVisible &&
        this.props.style &&
        this.props.style.display == "block" &&
        !this.isLive()
      ) {
        e.stopPropagation();
        this.show();
        this.focusPlayButton();
      } else this.show(currentKey);
    }
  }

  langDevice() {
    if (!this.isLive()) return true;
    else return show_lang_platform;
  }

  playPauseButtonControl = () => {
    if (!this.isVisible) {
      this.toggleControlsVod();
      this.showControls();
    }

    if (this.isVisible && this.refs.container) {
      const className = this.refs.container.className;
      if (className.indexOf("show-mini-epg") > -1) {
        this.showControls();
      }
      if (this.state.playing) {
        this.stop();
      } else {
        this.play();
      }
    }
  };

  handleChannelChange(e, number) {
    e.preventDefault();
    e.stopPropagation();

    if (this.props.isChangingChannel()) {
      return;
    }
    this.show();
    if (this.timerDelayChannelChange)
      clearTimeout(this.timerDelayChannelChange);
    this.lastNumberPressed = `${this.lastNumberPressed}${number}`;
    const currentLength = this.lastNumberPressed.length;

    if (
      this.refs.channelNumber &&
      this.refs.container &&
      currentLength <= this.maxLenNumberChannel
    ) {
      const className = this.refs.container.className;
      this.refs.container.className = `${className.replace(
        " hide-controls",
        ""
      )}`;
      this.refs.channelNumber.innerHTML = this.lastNumberPressed;
    }
    if (currentLength == this.maxLenNumberChannel) {
      this.channelChangeHandler(
        this.lastNumberPressed,
        this.props.linealChannels
      );
    } else if (
      currentLength < this.maxLenNumberChannel &&
      !this.resetChannelNumberId
    ) {
      this.timerDelayChannelChange = setTimeout(() => {
        this.channelChangeHandler(
          this.lastNumberPressed,
          this.props.linealChannels
        );
      }, this.delayChannelChange);
    }
  }

  channelChangeHandler(newChannel, linealChannelsPurchased) {
    this.timerDelayChannelChange = null;
    new ChannelSingleton().getChannels().then(channels => {
      let channelIndex = channels.findIndex(
        channel => channel.id == newChannel
      );
      const channel =
        channelIndex >= 0
          ? channels[channelIndex]
          : Utils.getClosestChannel(parseInt(newChannel), channels);

      if (channel) {
        const lastChannel = DeviceStorage.getItem("lastChannel");

        if (channel.group_id !== lastChannel) {
          let channelIndex = channels.findIndex(
            channel => channel.id == newChannel
          );
          let paywayTem = this.props.linealChannels.map(x => x.id);
          let paywayIds = channels
            .filter(x => paywayTem.indexOf(x.group_id) != -1)
            .map(x => x.group_id);
          if (channelIndex >= 0) {
            if (paywayIds.indexOf(channels[channelIndex].group_id) == -1) {
              this.refs.channelNumber.innerHTML = "";
              this.resetChannelNumberId = null;
              this.lastNumberPressed = "";
              this.showModalSusc(channel.provider, channel.group_id);
              return;
            } else {
              this.props.hideOnlyMini(
                paywayIds.indexOf(channels[channelIndex].group_id)
              );
            }
          } else {
            channels = channels.filter(x => paywayIds.indexOf(x.group_id) > -1);
            const channel = Utils.getClosestChannel(
              parseInt(newChannel),
              channels
            );
            this.props.hideOnlyMini(paywayIds.indexOf(channel.group_id));
          }
        }
        if (this.refs.channelNumber) {
          this.refs.channelNumber.innerHTML = this.lastNumberPressed;
          this.resetChannelNumberId = setTimeout(() => {
            this.refs.channelNumber.innerHTML = "";
            this.resetChannelNumberId = null;
            this.lastNumberPressed = "";
          }, this.delayChannelChange / 2);
        }
      }
    });
  }

  showModalSusc(provider, groupId, offerButtons = []) {
    console.log("showModalSusc", offerButtons);
    let pbiButtons = [];
    let default_susc_button_text = "";

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

  getNextChannel(params) {
    if (
      params &&
      params.channels &&
      params.channels.length &&
      params.channels.length === 0
    ) {
      return;
    }

    if (
      Utils.getFieldFromJsonToArray(
        params.linealChannelsPurchased,
        "id"
      ).indexOf(params.channel.group_id) > -1
    ) {
      //Mostar canal
      this.showChannel(params);
    } else {
      //TODO: La recursividad debe ir aqui o en utils?
      console.log("==> Buscar siguiente canal ....");

      //Eliminamos de chanels el canal del que no se tienen permisos
      params.channels = params.channels.filter(function(channel) {
        return channel.id !== params.channel.id;
      });

      params.channel = Utils.getClosestChannel(
        parseInt(params.newChannel),
        params.channels
      );
      this.getNextChannel(params);
    }
  }

  showChannel(params) {
    const lastChannel = DeviceStorage.getItem("lastChannel");

    if (params.channel.group_id !== lastChannel) {
      let platf = Device.getDevice().getPlatform();

      if (platf !== "nagra") {
        params.channelIndex = params.channels.findIndex(
          x => x.id === params.channel.id
        );
        this.props.changeChannel(params.channelIndex);
      } else {
        //TvChannelUtil.setLastChannel(params.channel.group_id); solo se debe de ejecutar en onResolveParams de components/Video
        const newSource = {
          src: json[params.channel.group_id], // new url to replace current and play
          drmInfo: { server_url: null, content_id: null, challenge: null }, // reset to null (we are un DBVC), just in case...
          streamType: "dvbc",
          isLive: true,
          isActiveEpg: false,
          groupId: params.channel.group_id
        };

        let purchasableObject = false;
        let platf = Device.getDevice().getPlatform();

        if (platf === "nagra") {
          let srcArray = newSource.src.split(".");
          let eventObject = PPE.getEventCurrent(srcArray[1]);
          console.log("[eventObject.eventId]", eventObject.eventId);
          purchasableObject = PPE.getPurchasableObject(eventObject);
          console.log("[purchasableObject]", purchasableObject);
        }
        if (!purchasableObject) {
          store.dispatch(replaceFullSourceMedia(newSource));
        } else {
          store.dispatch(
            showModal({
              modalType: MODAL_PPE,
              modalProps: {
                callback: a => {
                  if (PPE.initiatePPVEventPurchase())
                    store.dispatch(replaceFullSourceMedia(newSource));
                }
              }
            })
          );
        }
      }
    }
  }

  setTimer() {
    console.log("[PlayerControls] setTimer method");
    if (this.props.autoHide) {
      clearInterval(this.timer);
      if (this.isLive()) {
        if (typeof autoHideMiniEpgSeconds === "number") {
          this.settings.inactivityTime = autoHideMiniEpgSeconds;
        }
      }
      const time = this.settings.inactivityTime
        ? this.settings.inactivityTime * 1000
        : 20000;
      this.timer = setInterval(this.hide, time);
    }
  }

  isLive() {
    return this.props.type.toLowerCase() === "live";
  }

  isVod() {
    return this.props.type.toLowerCase() === "default" || "serie";
  }

  isTrailer() {
    return store.getState().player.ispreview;
  }

  hasTimeshift() {
    return this.timeshiftAllowed && this.timeshiftAllowed > 0 ? true : false;
  }

  /**
   * Toggle main button between play and pause
   * @returns {ReactElement}
   */
  getPlayButton(buttons) {
    return this.state.playing ? buttons["pause"] : buttons["play"];
  }

  getDefaultButtons() {
    let isFavorite,
      isShuffle,
      isRepeat = null;
    if (
      this.props.type == playerConstant.AUDIO ||
      this.props.type == playerConstant.RADIO
    ) {
      isFavorite = this.props.opcFavorite
        ? Asset.get("player_controls_favorited_selected")
        : Asset.get("player_controls_favorited");
      isShuffle = this.props.opcShuffle
        ? Asset.get("player_controls_random_selected")
        : Asset.get("player_controls_random");
      isRepeat =
        this.props.opcRepeat === 2
          ? Asset.get("player_controls_repeat_selected")
          : this.props.opcRepeat === 1
          ? Asset.get("player_controls_repeat_one_selected")
          : Asset.get("player_controls_repeat");
    }

    //time shift buttons
    let opacityClass = "focusable";
    this.disableTS = false;
    if (this.isLive()) {
      let timAllow = "0";
      if (
        this.state.channelInfo &&
        Utils.isNotNullOrNotUndefined(this.state.channelInfo.timeshiftAllowed)
      ) {
        timAllow = this.state.channelInfo.timeshiftAllowed;
      } else {
        if (
          this.props.channelInfo &&
          Utils.isNotNullOrNotUndefined(this.props.channelInfo.timeshiftAllowed)
        ) {
          timAllow = this.props.channelInfo.timeshiftAllowed;
        }
      }
      this.disableTS = timAllow == "0";
      opacityClass = this.disableTS ? "btnopacity" : "focusable";
    }

    const isPs4 = device_platform === "ps4" ? "noshadow" : null;
    const mainClassName = `player-ui-button action focusable ${isPs4}`;
    const mainClassOpacity = `player-ui-button action ${opacityClass} ${isPs4}`;
    const hasNoTimeshift = this.isLive() && !this.hasTimeshift();
    const timeshiftStyle = hasNoTimeshift ? { opacity: "0.2" } : null;
    const timeshiftOnClick = () => {};
    const defaultButtons = {
      /*       back          : <a href="javascript:void(0)" key='back' className={`${mainClassName} player-secondary-button`}                      onClick={this.back}><img src={Asset.get('player_controls_back_icon')}/></a>,
      favorite      : <a href="javascript:void(0)" key="favorite" id="favoriteBtn" className={`${mainClassName}`} onClick={this.onFavoriteSong}><img src={`${isFavorite}`}/></a>,
      replay        : <a href="javascript:void(0)" key='replay' className={`${mainClassOpacity}`}                    onClick={this.disableTS?null:() => this.fastBackward()}><img src={Asset.get('player_controls_replay_icon')}/></a>,
      previewSong   : <a href="javascript:void(0)" key='previewSong' className={`${mainClassName}`}               onClick={() => this.previewSong()}><img src={Asset.get('player_controls_step_backward_icon')}/></a>,
      fastBackward  : <Button key='fastBackward' className={ 'player-ui-button '+opacityClass} iconClassName='fa fa-fast-backward' onClick={this.disableTS?null: this.fastBackward}/>,
      stepBackward  : <a href="javascript:void(0)" id='stepBackward' key='stepBackward' className={`${mainClassOpacity}`}><img src={Asset.get('player_controls_step_backward_icon')}/></a>,
      backward      : <a href='javascript:;' id='backward' key='backward' className={`${mainClassOpacity}`}><img src={Asset.get('player_controls_backward_icon')}/></a>,
      play          : <a href="javascript:void(0)" key='play' className={`${mainClassOpacity} player-main-button`}   onClick={this.disableTS?null: this.play}><img src={Asset.get('player_controls_play_icon')}/></a>,
      pause         : <a href="javascript:void(0)" key='pause' className={`${mainClassOpacity} player-main-button`}   onClick={this.disableTS?null: this.pause}><img src={Asset.get('player_controls_pause_icon')}/></a>,
      forward       : <a href='javascript:;' id='forward' key='forward' className={`${mainClassOpacity}`} data-sn-up=".player-ui-progress-bar-ball"><img src={Asset.get('player_controls_forward_icon')}/></a>,
      stepForward   : <a href="javascript:void(0)" id='stepForward' key='stepForward' className={`${mainClassOpacity}`}><img src={Asset.get('player_controls_step_forward_icon')}/></a>,
      fastForward   : <Button key='fastForward' className='player-ui-button' iconClassName='fa fa-fast-forward' onKeyPress={this.fastForward}/>,
      next          : <a href="javascript:void(0)" key ='next' className={`${mainClassName}`} onClick={this.disableTS?null: () => this.fastForward()} data-sn-up=".player-ui-progress-bar-ball"><img src={Asset.get('player_controls_next_icon')}/></a>,
      nextSong      : <a href="javascript:void(0)" key='next' className={`${mainClassName}`} onClick={() => this.nextSong()}><img src={Asset.get('player_controls_step_forward_icon')}/></a>,
      lang          : <a href="javascript:void(0)" key='lang' className={`${mainClassOpacity}`} onClick={this.disableTS?null: () => this.showLangModal()} data-sn-up=".player-ui-progress-bar-ball"><img src={Asset.get('player_controls_lang_icon')}/></a>,
      seasons       : <a href="javascript:void(0)" key='seasons' ref='seasons' style={{display:'none'}} className={`${mainClassName}`} onClick={this.showSeasonsModal} data-sn-up=".player-ui-progress-bar-ball"><img src={Asset.get('player_controls_seasons_icon')}/></a>,
      epg           : <a href="javascript:void(0)" key='epg' className={`${mainClassName}`} onClick={this.showFullEpg}><img src={Asset.get('player_controls_epg_icon')}/></a>,
      repeat        : <a href="javascript:void(0)" id='repeatBtn'key='epg' className={`${mainClassName}`} onClick={this.doRepeat}><img src={`${isRepeat}`}/></a>,
      shuffle       : <a href="javascript:void(0)" id='shuffleBtn' key="shuffle" className={`${mainClassName}`} onClick={this.doShuffle}><img src={`${isShuffle}`}/></a> */

      back: (
        <a
          href="javascript:void(0)"
          key="back"
          className={`${mainClassName} absolute`}
          onClick={this.back}
        >
          <img
            className="icon-back"
            src={Asset.get("player_controls_back_icon")}
          />
        </a>
      ),
      seasons: (
        <a
          href="javascript:void(0)"
          key="seasons"
          ref="seasons"
          style={{ display: "none" }}
          className={`${mainClassName}`}
          onClick={this.showSeasonsModal}
          data-sn-up=".player-ui-progress-bar-ball"
        >
          <img src={Asset.get("player_controls_seasons_icon")} />
        </a>
      ),
      favorite: (
        <a
          href="javascript:void(0)"
          key="favorite"
          id="favoriteBtn"
          className={`${mainClassName}`}
          onClick={this.onFavoriteSong}
        >
          <img src={`${isFavorite}`} />
        </a>
      ),
      replay: (
        <a
          href="javascript:void(0)"
          key="replay"
          className={`${mainClassOpacity}`}
          onClick={this.disableTS ? null : () => this.fastBackward()}
        >
          <img src={Asset.get("player_controls_replay_icon")} />
        </a>
      ),
      previewSong: (
        <a
          href="javascript:void(0)"
          key="previewSong"
          className={`${mainClassName}`}
          onClick={() => this.previewSong()}
        >
          <img src={Asset.get("player_controls_step_backward_icon")} />
        </a>
      ),
      fastBackward: (
        <Button
          key="fastBackward"
          className={"player-ui-button " + opacityClass}
          iconClassName="fa fa-fast-backward"
          onClick={this.disableTS ? null : this.fastBackward}
        />
      ),
      stepBackward: (
        <a
          href="javascript:void(0)"
          id="stepBackward"
          key="stepBackward"
          className={`${mainClassOpacity}`}
        >
          <img src={Asset.get("player_controls_step_backward_icon")} />
        </a>
      ),
      //backward      : <a href='javascript:;' id='backward' key='backward' className={`${mainClassOpacity}`}><img src={Asset.get('player_controls_backward_icon')}/></a>,
      play: (
        <a
          href="javascript:void(0)"
          key="play"
          className={`${mainClassOpacity} player-main-button transparent`}
          onClick={this.disableTS ? null : this.play}
        >
          <img
            className="default"
            src={Asset.get("player_controls_play_icon")}
          />
          <img
            className="focusImg"
            src={Asset.get("net_player_controls_playFoco_icon")}
          />
        </a>
      ),
      pause: (
        <a
          href="javascript:void(0)"
          key="pause"
          className={`${mainClassOpacity} player-main-button transparent`}
          onClick={this.disableTS ? null : this.pause}
        >
          <img
            className="default"
            src={Asset.get("net_player_controls_pause_icon")}
          />
          <img
            className="focusImg"
            src={Asset.get("net_player_controls_pauseFoco_icon")}
          />
        </a>
      ),
      //forward       : <a href='javascript:;' id='forward' key='forward' className={`${mainClassOpacity}`} data-sn-up=".player-ui-progress-bar-ball"><img src={Asset.get('player_controls_forward_icon')}/></a>,
      stepForward: (
        <a
          href="javascript:void(0)"
          id="stepForward"
          key="stepForward"
          className={`${mainClassOpacity}`}
        >
          <img src={Asset.get("player_controls_step_forward_icon")} />
        </a>
      ),
      fastForward: (
        <Button
          key="fastForward"
          className="player-ui-button"
          iconClassName="fa fa-fast-forward"
          onKeyPress={this.fastForward}
        />
      ),
      next: (
        <a
          href="javascript:void(0)"
          key="next"
          className={`${mainClassName}`}
          onClick={this.disableTS ? null : () => this.fastForward()}
          data-sn-up=".player-ui-progress-bar-ball"
        >
          <img src={Asset.get("player_controls_next_icon")} />
        </a>
      ),
      nextSong: (
        <a
          href="javascript:void(0)"
          key="next"
          className={`${mainClassName}`}
          onClick={() => this.nextSong()}
        >
          <img src={Asset.get("player_controls_step_forward_icon")} />
        </a>
      ),
      lang: (
        <a
          href="javascript:void(0)"
          key="lang"
          className={`${mainClassOpacity}`}
          onClick={this.disableTS ? null : () => this.showLangModal()}
          data-sn-up=".player-ui-progress-bar-ball"
        >
          <img src={Asset.get("player_controls_lang_icon")} />
        </a>
      ),
      epg: (
        <a
          href="javascript:void(0)"
          key="epg"
          className={`${mainClassName}`}
          onClick={this.showFullEpg}
        >
          <img src={Asset.get("player_controls_epg_icon")} />
        </a>
      ),
      repeat: (
        <a
          href="javascript:void(0)"
          id="repeatBtn"
          key="epg"
          className={`${mainClassName}`}
          onClick={this.doRepeat}
        >
          <img src={`${isRepeat}`} />
        </a>
      ),
      shuffle: (
        <a
          href="javascript:void(0)"
          id="shuffleBtn"
          key="shuffle"
          className={`${mainClassName}`}
          onClick={this.doShuffle}
        >
          <img src={`${isShuffle}`} />
        </a>
      )
    };

    if (this.recordingsEnabled) {
      defaultButtons.record = (
        <a
          href="javascript:void(0)"
          key="record"
          className={`${mainClassOpacity}`}
          onClick={this.disableTS ? null : this.record}
        >
          <img src={Asset.get("player_controls_record_icon")} />
        </a>
      );
    }

    if (this.handleSkipIntro) {
      let text = Translator.get("skip_intro_player", "Omitir intro");
      defaultButtons.skipIntro = (
        <a
          href="javascript:void(0)"
          key="skipIntro"
          id="skipIntro"
          className={`focusable focusable-skip skip-control-btn action`}
          onClick={this.onSkipIntro}
          data-sn-down=".player-ui-progress-bar-ball"
        >
          <div className="i" /> {text}
        </a>
      );
    }

    return defaultButtons;
  }

  getVisibleButtons() {
    const buttons = Object.assign(
      {},
      this.getDefaultButtons(),
      this.props.buttons
    );
    let options = this.settings.types.hasOwnProperty(this.props.type)
      ? this.settings.types[this.props.type]
      : this.settings.types.default;
    const visible = {};

    if (
      this.props.type === playerConstant.AUDIO ||
      this.props.type === playerConstant.RADIO
    ) {
      const songType = store.dispatch(checkSongType());
      options =
        songType == playerConstant.AUDIO
          ? this.settings.types.musica
          : songType == playerConstant.RADIO
          ? this.settings.types.radio
          : this.settings.types.musica;
    }

    options.buttons.forEach(name => {
      if (buttons.hasOwnProperty(name)) {
        visible[name] =
          name === "play" ? this.getPlayButton(buttons) : buttons[name];
      }
    });
    return visible;
  }

  getSkipIntroButton() {
    const buttons = this.getDefaultButtons();
    return buttons.skipIntro;
  }

  /**
   * Add actions to control buttons
   */
  addListeners() {
    this.focusPlayButton();
    const buttons = Array.from(document.querySelectorAll(".player-ui-button"));
    buttons.map((button, index) => {
      if (index === 0) {
        if (document.getElementById("btn-hide") !== null) {
          button.setAttribute("data-sn-left", "#btn-hide");
        } else {
          button.setAttribute(
            "data-sn-left",
            ".player-ui-button.focusable:first-child"
          );
        }
      }
      if (index === buttons.length - 1) {
        button.setAttribute(
          "data-sn-right",
          ".player-ui-button.focusable:last-child"
        );
      }

      button.removeEventListener("sn:focused", this.onFocus);
      button.removeEventListener("sn:willmove", this.onFocusMove);

      button.addEventListener("sn:focused", this.onFocus);
      button.addEventListener("sn:willmove", this.onFocusMove);
    });
    if (this.refs.slider) {
      this.refs.slider.removeEventListener("sn:willmove", this.slide);
      this.refs.slider.addEventListener("sn:willmove", this.slide);
    }
    if (this.refs.container) {
      if (
        navigator.userAgent.toLowerCase().indexOf("opera") !== -1 &&
        Utils.deviceIsNotHisense()
      ) {
        window.removeEventListener("keydown", this.keyPressHandler, true);
        window.addEventListener("keydown", this.keyPressHandler, true);
      } else {
        document.removeEventListener("keydown", this.keyPressHandler, false);
        document.addEventListener("keydown", this.keyPressHandler, false);
      }
    }

    const namesButtons = this.getVisibleButtons();

    Object.keys(namesButtons).map(name => {
      const element = document.getElementById(name);
      const func = () => this[name]();
      if (element) {
        if (name !== "backward" || name !== "forward") {
          // Se agrega porque al menos en local, se van duplicando los listeners
          // conforme se usan
          this.removeButtonListener(name, "sn:enter-down");
          element.removeEventListener("sn:enter-down", func);
          element.addEventListener("sn:enter-down", func);

          if (!this.buttonsListeners[name]) {
            this.buttonsListeners[name] = {};
          }

          if (!this.buttonsListeners[name]["sn:enter-down"]) {
            this.buttonsListeners[name]["sn:enter-down"] = [];
          }

          this.buttonsListeners[name]["sn:enter-down"].push(func);
        }
      }
    });
  }

  // Se agrega porque al menos en local, se van duplicando los listeners
  // conforme se usan
  removeButtonListener(buttonName, type) {
    if (this.buttonsListeners[buttonName]) {
      if (this.buttonsListeners[buttonName][type]) {
        console.log(
          "&&&&&&&&&&&& segundo map 3, 3- se quita listener a ",
          buttonName
        );
        if (Utils.isArray(this.buttonsListeners[buttonName][type])) {
          for (
            let y = 0;
            y < this.buttonsListeners[buttonName][type].length;
            y++
          ) {
            let b = document.getElementById(buttonName);
            if (b) {
              b.removeEventListener(
                type,
                this.buttonsListeners[buttonName][type][y]
              );
            }
          }
          this.buttonsListeners[buttonName][type] = [];
        }
      }
    }
  }

  removeListeners() {
    const buttons = Array.from(document.querySelectorAll(".player-ui-button"));

    buttons.map((button, index) => {
      button.removeEventListener("sn:focused", this.onFocus);
      button.removeEventListener("sn:enter-down", this.show);
      button.removeEventListener("sn:willmove", this.onFocusMove);
    });
    if (this.refs.slider) {
      this.refs.slider.removeEventListener("sn:focused", this.show);
      this.refs.slider.removeEventListener("sn:willmove", this.slide);
    }
    if (this.refs.container) {
      if (
        navigator.userAgent.toLowerCase().indexOf("opera") !== -1 &&
        Utils.deviceIsNotHisense()
      ) {
        window.removeEventListener("keydown", this.keyPressHandler, true);
      } else {
        document.removeEventListener("keydown", this.keyPressHandler, false);
      }
    }

    const namesButtons = this.getVisibleButtons();
    Object.keys(namesButtons).map(name => {
      const element = document.getElementById(name);
      const func = () => this[name]();
      if (element) {
        element.removeEventListener("sn:enter-down", func);
      }
    });
  }

  componentDidMount() {
    this.updateCurrentTimeUI(this.currentTime);
    this.addListeners();
  }

  componentDidUpdate() {
    this.updateCurrentTimeUI(this.currentTime);

    this.setSpriteImage();
    this.skipIntroControl();
    if (Utils.isModalHide()) {
      let currentEventId = Utils.idEventCurrent(
        this.epgInPlayerControl,
        this.currentHorizontalIndex
      );
      console.log("FOCUS MINI", currentEventId);
      Utils.isMiniEPGOpen() &&
        window.SpatialNavigation.focus(
          currentEventId || ".epg-event-item-container .focusable"
        );
    }
  }

  setSpriteImage() {
    if (this.areSpritesSupportedOnThisDevice()) {
      let url = "";
      if (this.imageSpriteURL !== store.getState().resume.spriteImage) {
        // imageSpriteURL is Empty or selecting a different one from Ficha
        this.imageSpriteURL = store.getState().resume.spriteImage;
        this.imageSprite.src = this.imageSpriteURL;
      } else {
        if (this.imageSpriteURLnew) url = this.imageSpriteURLnew;
        else url = this.imageSpriteURL;
      }
      if (url && url.includes("SPRITES", 0) && this.imageSprite.src !== url) {
        this.imageSprite.src = url;
        this.imageSpriteURL = url;
        this.proporcion = 0;
      }
    }
  }

  componentWillUnmount() {
    this.removeListeners();
    if (this.onLivePauseTimer) clearInterval(this.onLivePauseTimer);
  }

  setChannelInfo(channelInfo) {
    this.timeshiftAllowed = channelInfo.timeshiftAllowed
      ? channelInfo.timeshiftAllowed
      : 0;
    if (!channelInfo.fromCoverFlow) {
      if (
        channelInfo &&
        channelInfo.timeshiftAllowed &&
        channelInfo.currentTimeshiftTime == 0
      ) {
        //this.currentTime = Utils.isNotNullOrNotUndefined(channelInfo.startprogressbar) ? channelInfo.startprogressbar : channelInfo.timeshiftAllowed;
        this.currentTime = channelInfo.timeshiftAllowed;
        this.setState({ channelInfo: channelInfo, timeshiftTime: 0 });
      } else {
        if (Utils.isNotNullOrNotUndefined(channelInfo.currentTimeshiftTime)) {
          this.currentTime = channelInfo.currentTimeshiftTime;
          this.setState({
            channelInfo,
            timeshiftTime: channelInfo.currentTimeshiftTime
          });
        } else {
          this.setState({ channelInfo });
        }
      }
    }
  }

  saveEpgData(epg, index) {
    this.epgInPlayerControl = epg;
    this.currentHorizontalIndex = index;
  }

  redHandler= () => {
    this.props.handleFullEpg("GUIDE")
  }

  greenHandler= () => {
    store.dispatch(
      showModal({
        modalType: MODAL_LANGUAGES,
        modalProps: {}
      })
    );
  }

  yellowHandler = () => {
    LayersControl.hidePlayer()
    LayersControl.hideMenu()
    // this.props.goToCard(`/node/tv`)
  }

  blueHandler = () => {
    LayersControl.showMenu()
  }

  render() {
    if (!this.props.enable) {
      if (
        navigator.userAgent.toLowerCase().indexOf("opera") !== -1 &&
        Utils.deviceIsNotHisense()
      ) {
        window.removeEventListener("keydown", this.keyPressHandler, true);
      } else {
        document.removeEventListener("keydown", this.keyPressHandler, false);
      }
      return null;
    }

    const visibleClass = this.props.visible ? "" : "hide-down";
    const typeClass = `player-ui-${this.props.type}`;
    const buttons = this.getVisibleButtons();
    const titlePlayer = store.getState().resume.title;
    const titleEpisode = store.getState().resume.episodeTitle;
    const titleSeason = store.getState().resume.season;
    const titleSerie = store.getState().resume.serieTitle;
    const numberEpisode = store.getState().resume.episode;

    console.log("ACA TRAE EL TITULO DEL PLAYER >>>>", store.getState().resume);
    const ifYellow = this.enableButton("yellow");

    const checkStatusEpg = {
      checkStatusEPG: this.props.checkStatusEPG,
      checkStatusCoverFlowCH: this.props.checkStatusCoverFlowCH
    };

    const flowPressDown = this.disableTS
      ? ".player-secondary-button"
      : ".player-main-button";

    return (
      <div>
        {
          <div
            className={`player-ui-container-skip player-ui-controls skip-intro-up`}
            ref="skipIntro"
          >
            {this.getSkipIntroButton()}
          </div>
        }
        <div
          id="player-ui-container"
          className={`player-ui-container ${visibleClass} ${typeClass} show-mini-epg ${
            this.isVisible
              ? ""
              : this.hasEpgErrorOnLive()
              ? "hide-controls"
              : ""
          }`}
          ref="container"
        >
          {!this.isLive() ? (
            <div
              className={`player-ui-title ${
                this.hasEpgErrorOnLive() ? "hide" : ""
              }`}
            >
              {this.serieData ? (
                <React.Fragment>
                  <h3 style={{ marginBottom: 10 }}>{titleEpisode}</h3>
                  <h3>{`${titleSerie} - Temporada ${titleSeason} Episodio ${numberEpisode}`}</h3>
                </React.Fragment>
              ) : (
                <h3>{titlePlayer}</h3>
              )}
            </div>
          ) : null}
          <div className="player-ui-channel-number" ref="channelNumber" />
          <div
            className={`player-ui-wrapper ${
              this.hasEpgErrorOnLive() ? "hide" : ""
            }`}
          >
            <div className="player-ui-epg">
              {this.isLive() &&
              (this.state.channelInfo.id || this.props.epgGroupId) ? (
                <MiniEpg
                  onUpdateEpg={this.props.onUpdateEpg}
                  groupId={this.state.channelInfo.id || this.props.epgGroupId}
                  handleFullEpg={e => this.props.handleFullEpg("GUIDE")}
                  onPressYellowButton={this.toggleControls}
                  isOpen={!this.state.showControls}
                  setMetricsEvent={this.props.setMetricsEvent}
                  onGetCurrentData={eventCurrent => {
                    if (
                      store.getState().epg.place == "ChangeWithNumber" ||
                      store.getState().epg.place == "FullEPG"
                    ) {
                      this.show();
                      store.dispatch(navigateFrom(""));
                    }
                    const lastEventGroup =
                      this.currentEvent && this.currentEvent.groupId;
                    this.currentEvent = eventCurrent;
                    if (
                      eventCurrent &&
                      eventCurrent.groupId !== lastEventGroup
                    ) {
                    }
                  }}
                  onGetCurrentEvent={eventCurrentOriginal => {
                    this.currentEventOriginal = eventCurrentOriginal;
                  }}
                  show={this.show}
                  hideListeners={this.onHideListeners}
                  goToCard={this.props.goToCard}
                  enableButton={this.enableButton}
                  hideEpgOutside={this.props.hideEpgOutside}
                  onChangingChannel={this.props.onChangingChannel}
                  changeCurrentGroupId={this.props.changeCurrentGroupId}
                  fromProps={this.props.fromProps}
                  setFromProps={this.props.setFromProps}
                  saveEpgData={this.saveEpgData}
                  {...checkStatusEpg}
                />
              ) : null}
            </div>
            <div className={`player-ui-controls`} ref={() => this.setTimer()}>
              <div className="player-ui-time-line">
                <div className="player-ui-current-time" ref="currentTime">
                  {this.getCurrentTimeAsString()}
                </div>
                <div className="player-ui-progress-bar-container">
                  <div className="player-ui-progress-bar">
                    <div
                      id="player-ui-progress-load"
                      ref="progressLoad"
                      className="player-ui-progress-bar-load"
                    />
                    <canvas
                      id="player-ui-progress-bar-sprite"
                      ref="sprite"
                    ></canvas>
                    <div
                      id="player-ui-current-time-sprite"
                      className="player-ui-current-time-sprite"
                      ref="currentTimeSprite"
                    >
                      {this.getCurrentTimeAsString()}
                    </div>
                    <div
                      id="player-ui-progress-bar"
                      ref="progressBar"
                      className="player-ui-progress-bar-time-tick"
                    >
                      <a
                        id="player-ui-progress-bar-ball"
                        href="javascript:void(0)"
                        ref="slider"
                        className="player-ui-progress-bar-ball focusable"
                        data-sn-down={flowPressDown}
                      />
                    </div>
                  </div>
                </div>
                <div className="player-ui-duration" ref="duration">
                  {this.getDurationAsString()}
                </div>
              </div>
              <div className="player-ui-controls-container">
                {Object.keys(buttons).map((name, index) => buttons[name])}
              </div>
            </div>
          </div>

            {this.isLive() && (
              <EpgHeader
                className="transparent"
                redHandler={this.redHandler}
                greenHandler={this.greenHandler}
                yellowHandler={this.yellowHandler}
                blueHandler={this.blueHandler}
              />
            )}
        </div>
      </div>
    );
  }
}

PlayerControls.propTypes = {
  duration: PropTypes.number,
  currentTime: PropTypes.number,
  autoPlay: PropTypes.bool,
  enable: PropTypes.bool,
  visible: PropTypes.bool,
  autoHide: PropTypes.bool,
  type: PropTypes.oneOf(["default", "live", "serie", "audio", "radio"]),
  buttons: PropTypes.shape({
    back: PropTypes.element,
    record: PropTypes.element,
    replay: PropTypes.element,
    fastBackward: PropTypes.element,
    stepBackward: PropTypes.element,
    backward: PropTypes.element,
    play: PropTypes.element,
    pause: PropTypes.element,
    forward: PropTypes.element,
    stepForward: PropTypes.element,
    fastForward: PropTypes.element,
    next: PropTypes.element,
    seasons: PropTypes.element
  }),
  play: PropTypes.func,
  pause: PropTypes.func,
  backward: PropTypes.func,
  stepBackward: PropTypes.func,
  fastBackward: PropTypes.func,
  forward: PropTypes.func,
  stepForward: PropTypes.func,
  fastForward: PropTypes.func,
  replay: PropTypes.func,
  back: PropTypes.func,
  next: PropTypes.func,
  record: PropTypes.func,
  changeLang: PropTypes.func
};

PlayerControls.defaultProps = {
  duration: 0,
  currentTime: 0,
  autoPlay: false,
  enable: true,
  visible: true,
  autoHide: false,
  type: "live",
  buttons: {},
  play: () => {},
  pause: () => {},
  backward: () => {},
  stepBackward: () => {},
  fastBackward: () => {},
  forward: () => {},
  stepForward: () => {},
  fastForward: () => {},
  replay: () => {},
  back: () => {},
  next: () => {},
  record: () => {},
  changeLang: () => {}
};
/*
PlayerControls.contextTypes = {
  router: PropTypes.object.isRequired
};
*/

export const playerControlsIsVisible = () => PlayerControls.isVisible;
export default PlayerControls;
