import AbstractHTML5Player from '../all/AbstractHTML5Player'
import * as  playerConstants from '../../utils/playerConstants';

class OperaPlayer extends AbstractHTML5Player {
  constructor() {
    super();
  }

  getStreamType() {
    switch(this.options.streamType) {
      case playerConstants.HLS:
        return 'application/vnd.apple.mpegurl';
        break;
      case playerConstants.AUDIO:
      case playerConstants.RADIO:
        return 'audio/mp4';
        break;
      case playerConstants.SS:
      case playerConstants.SS_MA:
        return 'application/vnd.ms-playready.initiator+xml';
        break;
      default:
        return null;
        break;
    }
  }

  setVideoSource(url, type) {
    console.log('******* <<<<<<<<<<< INIT [OPERA] AbstractHTML5Player setVideoSource: ' + url);
    let source = document.createElement("source");
    source.src = url;

    console.log('ESV [OPERA]: setting stream type', this.options.streamType, this.getStreamType());
    type = this.getStreamType();
    if (type)
      source.type = type;

    source.id = "Html5PlayerSource" + (this.options.isPip ? '_pip' : '_full');
    this._playerHTMLTag.appendChild(source);

    console.log('******* <<<<<<<<<<< END [OPERA] AbstractHTML5Player setVideoSource');
  }

  getAudioIndexOfCode(codeTrack) {
    return this.audioTracks.findIndex((track) => {
      console.log('[OPERA track codes]',track.language);
      return this.getLanguageCodeByISO3(codeTrack) === track.language;
    });
  }
}

export default OperaPlayer;
