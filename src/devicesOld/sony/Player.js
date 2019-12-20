import AbstractHTML5Player from '../all/AbstractHTML5Player';
import * as  playerConstants from '../../utils/playerConstants';
import Utils from "../../utils/Utils";
class SonyPlayer extends AbstractHTML5Player {
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
    console.log('******* <<<<<<<<<<< INIT sony AbstractHTML5Player setVideoSource: ' + url);
    let source = document.createElement("source");
    source.src = url;

    console.log('ESV: setting stream type', this.options.streamType, this.getStreamType());
    type = this.getStreamType();
    if (type)
      source.type = type;

    source.id = "Html5PlayerSource" + (this.options.isPip ? '_pip' : '_full');
    this._playerHTMLTag.appendChild(source);

    console.log('******* <<<<<<<<<<< END sony AbstractHTML5Player setVideoSource');
  }

  getAudioIndexOfCode(codeTrack) {
    if(Utils.isSonyBravia())
      return this.audioTracks.findIndex((track) => {
        return this.getLanguageCodeByISO3(codeTrack) === track.language;
      });
    else
      return this.audioTracks.findIndex(track => track.language === codeTrack);
  }
}

export default SonyPlayer;
