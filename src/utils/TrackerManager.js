import './trackers';
import * as playerConstant from '../utils/playerConstants';

/**
 * Created by miguelvelez on 25/08/17.
 */

const START_TICKING = 'startTicking';
const STOP_TICKING = 'stopTicking';
const BUFFER_START = 'bufferStart';
const BUFFER_END = 'bufferEnd';
const PLAYING = 'playing';
const PAUSE = 'pause';
const RESUME = 'resume';
const SEEK = 'seek';
const STOP = 'stop';
const BIT_RATE_CHANGE = 'bitRateChange';
const AUDIO = 'audioChange';
const SUBTITLE_CHANGE = 'subtitleChange';
const EXIT = 'exit';
const ERROR = 'error';
const END = 'end';
const CREDITS = 'credits';
const API_ERROR = 'api_error';

class TrackerManager {

  static trackers = [];

  constructor(trackers = []) {
    if (trackers.length > 0) {
      TrackerManager.trackers = trackers;
    }
  }

  static setPlayhead(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }
    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.setPlayhead === 'function') {
        tracker.setPlayhead(currentTime);
      }
    });
  }

  static addTracker(tracker = null) {
    if (tracker) TrackerManager.trackers.push(tracker);
  }

  static addTrackers(trackers = []) {
    if (trackers.length > 0) {
      TrackerManager.trackers = [...TrackerManager.trackers, ...trackers];
    }
  }

  static ignore(streamType) {
    if(
      streamType === playerConstant.AUDIO ||
      streamType === playerConstant.RADIO ||
      streamType === playerConstant.PLAYERIMAGE
    ) {
      return true;
    }
    return false;
  }

  static setup(pgm = {} /* Playergetmedia response object */, extraParams = {}) {
    this.pgm=pgm;



    console.log('TRACCCC', pgm);
    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.setup === 'function') {
        tracker.setup(pgm, extraParams);
      }
    });
    //TrackerManager.playerGetMedia();
  }

  static setupExtraParams(extraParams = {}){
    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.setupExtraParams === 'function') {
        tracker.setupExtraParams(extraParams);
      }
    });
  }


  static tick(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }
    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.tick === 'function') {
        tracker.tick(currentTime);
      }
    });
  }

  static startTicking(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }
    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.startTicking === 'function') {
        tracker.startTicking(currentTime);
      }
    });
  }

  static playerGetMedia(data, streamType) {
    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.pgm === 'function') {
        tracker.pgm(data);
      }
    });

  }


  static getDataPgm(){
   return this.pgm;
  }

  static pgm(currentTime, streamType) {
    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.pgm === 'function') {
        tracker.pgm();
      }
    });

  }

  static stopTicking(streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.stopTicking === 'function') {
        tracker.stopTicking();
      }
    });
  }

  static bufferStart(streamType) {
    // console.log("YouboraEvent bufferStart");
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.bufferStart === 'function') {
        tracker.bufferStart();
      }
    })
  }

  static bufferEnd(streamType) {
    // console.log("YouboraEvent bufferEnd");

    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.bufferEnd === 'function') {
        tracker.bufferEnd();
      }
    })
  }

  static playing(time,streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.playing === 'function') {
        tracker.playing(time);
      }
    })
  }

  static start(streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.playing === 'function') {
        tracker.start();
      }
    })
  }

   static play(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.play === 'function') {
        tracker.play();
      }
    })
  }

  static pause(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.pause === 'function') {
        tracker.pause(currentTime);
      }
    })
  }

  static resume(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }
    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.resume === 'function') {
        tracker.resume(currentTime);
      }
    })
  }

  static seek(seek, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      console.log('==>tracker manager seek ....')
      console.log(tracker)
      if (typeof tracker.seek === 'function') {
        if (tracker.name === 'dashboard') {
          tracker.seek(seek);
        }
        else {
          const currentTime = seek.seek_start;
          tracker.seek(currentTime);
        }
      }
    })
  }
  /*
    Se agrega urlStop que es la url para el track
    para asegurar que realmente sea la url de stop que corresponde al
    contenido en el que se esta haciendo stop
    curTime, TrackerManager.props.player.streamType, stopUrl, isLive
  */
  static stop(currentTime, streamType, urlStop, isLive) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.stop === 'function') {
        tracker.stop(currentTime, isLive, urlStop);
      }
    })
  }

  static bitRateChange(bitrate, bandwidth, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.bitRateChange === 'function') {
        tracker.bitRateChange(bitrate, bandwidth);
      }
    })
  }

  static audioChange(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.audioChange === 'function') {
        tracker.audioChange(currentTime);
      }
    })
  }

  static episodeChange(currentTime, streamType){
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.episodeChange === 'function') {
        tracker.episodeChange(currentTime);
      }
    })
  }

  static subtitleChange(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.subtitleChange === 'function') {
        tracker.subtitleChange(currentTime);
      }
    })
  }

  static leaveContent(currentTime, streamType){
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.leaveContent === 'function') {
        tracker.leaveContent(currentTime);
      }
    })
  }

  static leaveApp(currentTime, streamType){
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.leaveApp === 'function') {
        tracker.leaveApp(currentTime);
      }
    })
  }

  static foward(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.foward === 'function') {
        tracker.foward(currentTime);
      }
    })
  }

  static rewind(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.rewind === 'function') {
        tracker.rewind(currentTime);
      }
    })
  }

  static foward30(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.foward30 === 'function') {
        tracker.foward30(currentTime);
      }
    })
  }

  static rewind30(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.rewind30 === 'function') {
        tracker.rewind30(currentTime);
      }
    })
  }

  static exit(streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.exit === 'function') {
        tracker.exit();
      }
    })
  }

  static end(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if(typeof tracker.end === 'function') {
        tracker.end(currentTime);
      }
    })
  }

  static credits(currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    TrackerManager.trackers.forEach(tracker => {
      if(typeof tracker.credits === 'function') {
        tracker.credits(currentTime);
      }
    })
  }

  static error(e, currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    if (!e) {
      e='666 [Generic Error on Player]';
    }
    let error={stackTrace:e};

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.error === 'function') {
        tracker.error({ message: error }, currentTime);
      }
    });

    console.error('Tracked Error', error);
  }

  static errorContent(e, currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    if (!e) {
      e='666 [Generic Error on Player]';
    }
    let error={stackTrace:e};

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.errorContent === 'function') {
        tracker.errorContent({ message: error }, currentTime);
      }
    });

    console.error('Tracked  VOD Error', error);
  }

  static errorLive(e, currentTime, streamType) {
    if (TrackerManager.ignore(streamType)) {
      return;
    }

    if (!e) {
      e='666 [Generic Error on Player]';
    }
    let error={stackTrace:e};

    TrackerManager.trackers.forEach(tracker => {
      if (typeof tracker.errorLive === 'function') {
        tracker.errorLive( { message: error }, currentTime);
      }
    });

    console.error('Tracked  VOD Error', error);
  }

  static apiError(content){
    let error = { message: content };
    TrackerManager.trackers.forEach(tracker => {

      if (typeof tracker.apiError === 'function') {
        tracker.apiError(content);
      }
    });
    console.error('Tracked  api_error', error);
  }

}

export default TrackerManager
