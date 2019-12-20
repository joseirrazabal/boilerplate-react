import * as playerConstant from '../../utils/playerConstants';

class AbstractPlayer {

/*   constructor() {
  } */

  getStateName(state) {
    let nameState = '';
    return nameState;
  }

  setCurrentPlayerState(state) {
  }

  getCurrentPlayerState() {
    return undefined;
  }

  setPlayerBackground(urlBackgroundImage) {
  }

  createPlayer(options) {
  }

  createMedia(options) {
  }

  loadMedia() {
  }

  setPlayerFull() {
  }

  setPlayerSize(top, left, width, height) {
  }

  setVideoSource(url, type) {
  }

  play() {
  }

  resume() {
  }

  pause() {
  }

  stop() {
  }

  replaceMediaSource(newSource) {
  }

  seek(seconds) {
  }

  skip(seconds) {
  }

  hide() {
  }

  show() {
  }

  destroy() {
  }

  // For optimize pip playing, we dont destroy pip, we only change source
  destroyPip() {
  }

  destroyPlayerContainer() {
  }

  addEventsListeners() {
  }

  removeEventsListener() {
  }

  getCurrentTime() {
  }

  getDuration() {
  }

  setDuration() {
  }

  doVideoResume() {
  }

  /* PLAYER STATE EVENTS */
  onPlayerStateConnect() {
  }

  onPlayerStatePlay() {
  }

  onPlayerStatePause() {
  }

  onPlayerStateStop() {
  }

  onPlayerStateSkip() {
  }

  onPlayerStateSpeed() {
  }

  onPlayerStateBuffer() {
  }
  /* END PLAYER STATE EVENTS */


  getAudioTracks() {
  }

  getAudioTrackById() {
  }

  // @codeTrack iso id i.e.: esp, eng, por, ori
  setAudioTrack(codeTrack) {

  }

  getAudioIndexOfCode(codeTrack) {
  }

  getLanguageCodeByISO3(codeTrack) {
  }

  /* END MULTIPLE AUDIOTRACKS */



  /* UTILS FOR PLAYER */
  streamIsVideo(streamType) {
    return (streamType === playerConstant.SS
            || streamType === playerConstant.SS_MA
            || streamType === playerConstant.HLS
            || streamType === playerConstant.HLSPRM);
  }

  streamIsAudio(streamType) {
    return (streamType === playerConstant.AUDIO
            || streamType === playerConstant.RADIO
    );
  }

  streamIsImage(streamType) {
    return streamType === playerConstant.PLAYERIMAGE;
  }
  /* END UTILS FOR PLAYER */


}

export default AbstractPlayer;
