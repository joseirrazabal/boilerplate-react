// DOC https://dlatvarg.atlassian.net/wiki/spaces/DAMCO/pages/250741191/Diagrama+de+estados+de+los+reproductores

import * as pConstants from './playerConstants';


class PlayerStates {

  static resolveNextPlayerState(playerParams, currentPlayersState, nextPlayerInfo) {
    // Set player state, based on pgm data
    if(playerParams.src) {
      if(playerParams.streamType && playerParams.streamType === pConstants.PLAYERIMAGE) {
        nextPlayerInfo.internalState = pConstants.SHOWING_IMAGE;    
      }
      else if(playerParams.streamType && (playerParams.streamType == pConstants.AUDIO) || (playerParams.streamType == pConstants.RADIO)) {
        // PLAYING_RADIO
        if(playerParams.isLive) {
          nextPlayerInfo.internalState = pConstants.PLAYING_RADIO;    
        }
        // PLAYING_MP3
        else {
          nextPlayerInfo.internalState = pConstants.PLAYING_MP3;
        }
      }
      else {
        if(playerParams.isLive) {
          // PLAYING_LIVE_IP,
          // PLAYING_LIVE_DVB, 
          // TODO check when it will be PLAYING_LIVE_DVB
          nextPlayerInfo.internalState = pConstants.PLAYING_LIVE_IP;
        }
        else {
          // PLAYING_VOD_DRM, 
          // PLAYING_VOD_CLEAR,
          if(playerParams.drmInfo && playerParams.drmInfo.server_url) {
            nextPlayerInfo.internalState = pConstants.PLAYING_VOD_DRM;
          }
          else {
            nextPlayerInfo.internalState = pConstants.PLAYING_VOD_CLEAR;    
          }
        }
      }
    }
    /*
    else if(playerParams.audioSrc) {
      // PLAYING_RADIO
      if(playerParams.isLive) {
        nextPlayerInfo.internalState = PLAYING_RADIO;    
      }
      // PLAYING_MP3
      else {
        nextPlayerInfo.internalState = PLAYING_MP3;
      }
    }
    else if(playerParams.imageSrc) {
      nextPlayerInfo.internalState = SHOWING_IMAGE;
    }
    */
    else {
      // NOT PLAYING
      nextPlayerInfo.internalState = pConstants.NOT_PLAYING;
    }

    return PlayerStates.resolveNewStatus(currentPlayersState, nextPlayerInfo);
  }

  static resolveNewStatus(currentPlayerStates, nextPlayerInfo) {
    let ret = null;
    /*
    const currentPlayerStates = {
        
      singlefullplayerstate: {
        currentstate: NOT_PLAYING,
        previousstate: NOT_PLAYING
      },

      singlepipplayerstate: {
        currentstate: NOT_PLAYING,
        previousstate: NOT_PLAYING
      },

      currentplayersstate: NOT_PLAYING,
      previousplayersstate: NOT_PLAYING
    };
    ---------------------------------------
    nextPlayerInfo = {

      isFull: true/false (false for pip),
      internalState: NOT_PLAYING/PLAYING_LIVE_DVB/PLAYING_LIVE_IP etc etc etc

    }
    */

    let nextState = null;
    switch(nextPlayerInfo.internalState) {
      case pConstants.PLAYING_VOD_DRM:
        nextState = PlayerStates.resolveFrom_PlayingVODDRM(currentPlayerStates, nextPlayerInfo);
      break;
      case pConstants.PLAYING_VOD_CLEAR:
        nextState = PlayerStates.resolveFrom_PlayingVODClear(currentPlayerStates, nextPlayerInfo);
      break;
      case pConstants.PLAYING_LIVE_IP:
        nextState = PlayerStates.resolveFrom_PlayingLiveIP(currentPlayerStates, nextPlayerInfo);
      break;
      case pConstants.PLAYING_LIVE_DVB:
        nextState = PlayerStates.resolveFrom_PlayingLiveDVB(currentPlayerStates, nextPlayerInfo);
      break;
      case pConstants.SHOWING_IMAGE:
        nextState = PlayerStates.resolveFrom_ShowingImage(currentPlayerStates, nextPlayerInfo);
      break;
      case pConstants.NOT_PLAYING:
        nextState = PlayerStates.resolveFrom_NotPlaying(currentPlayerStates, nextPlayerInfo);
      break;
      case pConstants.PLAYING_MP3:
        nextState = PlayerStates.resolveFrom_PlayingMP3(currentPlayerStates, nextPlayerInfo);
      break;
      case pConstants.PLAYING_RADIO:
        nextState = PlayerStates.resolveFrom_PlayingRadio(currentPlayerStates, nextPlayerInfo);
      break;
      default: 
      break;
    }

    // Compose response...
    ret = currentPlayerStates;
    ret.forcefullstop = false;
    ret.forcepipstop = false;

    // nextState could be null...
    // force to not playing? here only add a flag...if we need to force stop/deinit 
    // players then do it in dispatch method where the call to this method comes from...
    if(nextState === null) {
      if(currentPlayerStates.singlefullplayerstate.currentstate !== pConstants.NOT_PLAYING) {
        ret.forcefullstop = true;
      }
      if(currentPlayerStates.singlepipplayerstate.currentstate !== pConstants.NOT_PLAYING) {
        ret.forcepipstop = true;
      }
      // E19 as a default, players without content or image, not playing
      nextState = pConstants.E19;
    }

    // Full
    if(nextPlayerInfo.isFull) {
      ret.singlefullplayerstate.previousstate = ret.singlefullplayerstate.currentstate;
      ret.singlefullplayerstate.currentstate = nextPlayerInfo.internalState;
    }
    // PIP
    else {
      ret.singlepipplayerstate.previousstate = ret.singlepipplayerstate.currentstate;
      ret.singlepipplayerstate.currentstate = nextPlayerInfo.internalState;
    }

    ret.previousplayersstate = ret.currentplayersstate;
    ret.currentplayersstate = nextState;

    /* Important: returns an object when success, return null otherwise */
    return ret;
  }    

  static resolveFrom_NotPlaying(currentPlayerStates, nextPlayerInfo) {
    let nextState = null;
    let toCheckWith = nextPlayerInfo.isFull ? currentPlayerStates.singlepipplayerstate.currentstate : currentPlayerStates.singlefullplayerstate.currentstate;

    switch(toCheckWith) {
      case pConstants.PLAYING_VOD_DRM:
        nextState = nextPlayerInfo.isFull ? pConstants.E1 : pConstants.E14;
      break;
      case pConstants.PLAYING_VOD_CLEAR:
        nextState = nextPlayerInfo.isFull ? pConstants.E2 : pConstants.E15;
      break;
      case pConstants.PLAYING_LIVE_IP:
        nextState = nextPlayerInfo.isFull ? pConstants.E5 : pConstants.E16;
      break;
      case pConstants.PLAYING_LIVE_DVB:
        nextState = nextPlayerInfo.isFull ? pConstants.E8 : pConstants.E17;
      break;
      case pConstants.SHOWING_IMAGE:
        nextState = nextPlayerInfo.isFull ? pConstants.E13  : pConstants.E18;
      break;
      case pConstants.NOT_PLAYING:
        nextState = pConstants.E19;
      break;
      default: 
      break;
    }

    return nextState;
  }

  static resolveFrom_PlayingLiveIP(currentPlayerStates, nextPlayerInfo) {
    let nextState = null;
    let toCheckWith = nextPlayerInfo.isFull ? currentPlayerStates.singlepipplayerstate.currentstate : currentPlayerStates.singlefullplayerstate.currentstate;

    switch(toCheckWith) {
      case pConstants.PLAYING_LIVE_DVB:
        nextState = nextPlayerInfo.isFull ? pConstants.E6 : pConstants.E4;
      break;
      case pConstants.NOT_PLAYING:
        nextState = nextPlayerInfo.isFull ? pConstants.E16 : pConstants.E5;
      break;
      case pConstants.SHOWING_IMAGE:
        nextState = nextPlayerInfo.isFull ? pConstants.E9 : null;
      break;
      case pConstants.PLAYING_LIVE_IP:
        nextState = pConstants.E3;
      break;
      default:
      break;
    }

    return nextState;
  }

  static resolveFrom_PlayingLiveDVB(currentPlayerStates, nextPlayerInfo) {
    let nextState = null;
    let toCheckWith = nextPlayerInfo.isFull ? currentPlayerStates.singlepipplayerstate.currentstate : currentPlayerStates.singlefullplayerstate.currentstate;

    switch(toCheckWith) {
      case pConstants.PLAYING_LIVE_IP:
        nextState = nextPlayerInfo.isFull ? pConstants.E4 : null;
      break;
      case pConstants.NOT_PLAYING:
        nextState = nextPlayerInfo.isFull ? pConstants.E17 : pConstants.E8;
      break;
      case pConstants.SHOWING_IMAGE:
        nextState = nextPlayerInfo.isFull ? pConstants.E10 : null;   
      break;
      case pConstants.PLAYING_LIVE_DVB:
        nextState = pConstants.E7;
      break;
      default:
      break;
    }

    return nextState;
  }

  static resolveFrom_PlayingMP3(currentPlayerStates, nextPlayerInfo) {
    let nextState = null;
    let toCheckWith = nextPlayerInfo.isFull ? currentPlayerStates.singlepipplayerstate.currentstate : currentPlayerStates.singlefullplayerstate.currentstate;

    switch(toCheckWith) {
      case pConstants.SHOWING_IMAGE:
        nextState = nextPlayerInfo.isFull ? pConstants.E11 : null;
      break;
      default:
      break;
    }

    return nextState;
  }

  static resolveFrom_PlayingRadio(currentPlayerStates, nextPlayerInfo) {
    let nextState = null;
    let toCheckWith = nextPlayerInfo.isFull ? currentPlayerStates.singlepipplayerstate.currentstate : currentPlayerStates.singlefullplayerstate.currentstate;

    switch(toCheckWith) {
      case pConstants.SHOWING_IMAGE:
        nextState = nextPlayerInfo.isFull ? pConstants.E12 : null;
      break;
      default:
      break;
    }

    return nextState;
  }

  static resolveFrom_PlayingVODDRM(currentPlayerStates, nextPlayerInfo) {
    let nextState = null;
    let toCheckWith = nextPlayerInfo.isFull ? currentPlayerStates.singlepipplayerstate.currentstate : currentPlayerStates.singlefullplayerstate.currentstate;

    switch(toCheckWith) {
      case pConstants.NOT_PLAYING:
        nextState = nextPlayerInfo.isFull ? pConstants.E14 : pConstants.E1;
      break;
      default:
      break;
    }

    return nextState;
  }

  static resolveFrom_PlayingVODClear(currentPlayerStates, nextPlayerInfo) {
    let nextState = null;
    let toCheckWith = nextPlayerInfo.isFull ? currentPlayerStates.singlepipplayerstate.currentstate : currentPlayerStates.singlefullplayerstate.currentstate;

    switch(toCheckWith) {
      case pConstants.NOT_PLAYING:
        nextState = nextPlayerInfo.isFull ? pConstants.E15 : pConstants.E2;
      break;
      default:
      break;
    }

    return nextState;
  }

  static resolveFrom_ShowingImage(currentPlayerStates, nextPlayerInfo) {
    let nextState = null;
    let toCheckWith = nextPlayerInfo.isFull ? currentPlayerStates.singlepipplayerstate.currentstate : currentPlayerStates.singlefullplayerstate.currentstate;

    switch(toCheckWith) {
      case pConstants.PLAYING_LIVE_IP:
        nextState = nextPlayerInfo.isFull ? null : pConstants.E9;
      break;
      case pConstants.PLAYING_LIVE_DVB:
        nextState = nextPlayerInfo.isFull ? null : pConstants.E10;
      break;
      case pConstants.PLAYING_MP3:
        nextState = nextPlayerInfo.isFull ? null : pConstants.E11;
      break;
      case pConstants.PLAYING_RADIO:
        nextState = nextPlayerInfo.isFull ? null : pConstants.E12;
      break;
      case pConstants.NOT_PLAYING:
       nextState = nextPlayerInfo.isFull ? pConstants.E18 : pConstants.E13;
      break;
      case pConstants.SHOWING_IMAGE:
        nextState = null;
      break;
      default:
      break;
    }

    return nextState;
  }
}

export default PlayerStates;