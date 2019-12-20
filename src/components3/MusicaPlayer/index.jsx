import React, { PureComponent } from 'react';
import './musicaPlayer.css'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { playFullMedia, isEnding } from "../../actions/playmedia";
import { addToContextMenu } from "../../actions/musica/context-menu-actions";
import { setMetricsEvent } from "../../actions/metrics";

import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import MusicActions from '../../components/MusicActions';
import ContextMenu from '../../components/ContextMenu';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import settings from './../../devices/all/settings';

import placeholder_square from '../../assets/musica/placeholder_square_emptysongalbum.png';

class MusicPlayer extends PureComponent {

    constructor(props) {
      super(props);
      this.state = {
        isEnding: false,
        currentContent: null,
      };

      this.handleEndPlayer = this.handleEndPlayer.bind(this);
      this.toggleMore = this.toggleMore.bind(this);
      this.metricSend = null;
    }

    componentWillMount() {
      if(!this.state.currentContent){
        this.setState({
          currentContent: {
            trackNumber: "21",
            id: "2113325",
            internalId: "",
            name: "Butterflies and Hurricanes",
            url: "http://cdn.imusica.com.br/api/musicStreaming/playTrackCdn?phonogramId=2113325&token_wap=WHLwQ7SeDfvs9jTVSxY5bllSiadtEbARw9NZoxpyqk&isPreview=0&typeId=10&appId=f14eadf1e22495ac2b404ee4e256a4e2&appVersion=00022b851d34aacd2f00ea5301d26c60",
            durationInSeconds: 301,
            albumId: "173544",
            albumName: "Absolution (New 09 version)",
            image: placeholder_square,
            songSourceType: 3,
            listSourceType: 1,
            playlistName: "test71",
            artist: ['muse'],
            artistId: ["15497"],
            artists: [{ id: "15497", name: "Muse" }],
            index: 20,
            isPaused: false,
            contentType: "song",
            enabledButtons: {},
            hasContentToPlay: true,
            radioArtistMode: 0,
            flagUpdate: false,
          }
        });
      }
      document.addEventListener(settings.end_vod_fire_event, this.handleEndPlayer);
    }

    componentDidMount(){
      //this.setBackgroundImage();
      window.SpatialNavigation.makeFocusable();
    }

    componentWillUnmount() {
      const blurEl = document.getElementById("blur");
      blurEl.style.background = "none";
      blurEl.classList.remove('blury');
    }

    handleEndPlayer(e) {
      this.setState({
        isEnding: true
      })
    }

    setBackgroundImage() {
      const background = this.props.playerMusica.playermusica.currentContent.image;
      const blurEl = document.getElementById("blur");

      if(blurEl !== null) {
        blurEl.style.background = "#000 url('" + background + "') no-repeat center";
        blurEl.style.backgroundSize = "cover";
        blurEl.classList.add("bgimage");
        blurEl.classList.add("blury");
      }
    }

    getLabel(currentContent, contentType){
      const name=currentContent.name;
      switch (contentType){
        case 'song':
          const artista = Array.isArray(currentContent.artist) ? currentContent.artist.reduce((current,previous)=>current+','+previous):'';
          return `playlist/${currentContent.playlistName}/${artista}/${currentContent.albumName}/${name}`;
          break;
        case 'radio':
          return `radio/${currentContent.dial} ${currentContent.band}/${name}`;
          break;
        default:
          return '';
          break;
      }
    }

    sendMetric(action,label){
      if(typeof this.props.setMetricsEvent === 'function'){
        this.props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'player',
          eventAction: action,
          eventLabel: label,
        });
        this.props.setMetricsEvent({ type: 'executor'});
        DeviceStorage.setItem('label-music-analytics',label);
        this.sendDimension();
      }
    }

    sendDimension(){
      const payload = new AnalyticsDimensionSingleton().getPayload();
      this.props.setMetricsEvent(payload);
      this.props.setMetricsEvent({ type: 'executor'});
    }

    getPrevImage(playlist, index){
      if(index === 0 || playlist === undefined || playlist[index-1] === undefined)
        return null;

      return <div className="prev-song cover-song back-song">
        <img src={playlist[index - 1].image} onError={(e) => {
          e.target.src = placeholder_square;
        }}/>
      </div>;
    }

    getNextImage(playlist, index){
      if(playlist === undefined || index + 1 === playlist.length )
        return null;
      if(playlist[index + 2] !== undefined)
        return <div className="next-song cover-song back-song">
          <img src={playlist[index + 1].image} />
          <img className="dontShow" src={playlist[index + 2].image} />
        </div>;
      if(playlist[index + 1] !== undefined)
        return <div className="next-song cover-song back-song">
          <img src={playlist[index + 1].image} onError={(e) => {
            e.target.src = placeholder_square;
          }} />
        </div>;
    }

    toggleMore(){
      this.props.addToContextMenu({...this.props.playerMusica.playermusica.currentContent, fromPlayer:true });
      const context = this.contextMenu.getWrappedInstance();
      context.showModal();
    }

    sliceTitleText(string) {
      let newStr = '';
      if (string.length > 60) {
        newStr = string.slice(0, 60) + ' ...';
      } else {
        newStr = string;
      }
      return newStr;
    }

    render() {
      //this.setBackgroundImage();
      const { isEnding } = this.state;
      const currentContent = this.props.playerMusica.playermusica.currentContent;
      const contentType = this.props.playerMusica.playermusica.contentType;
      const label = this.getLabel(currentContent,contentType);
      if(this.metricSend !== label && label!== ''){
        this.sendMetric('play',label);
        this.metricSend = label;
      }

      const playlist = this.props.playerMusica.playermusica.playlist.originalContent;
      const nextImage = this.getNextImage(playlist, currentContent.trackNumber - 1 );
      const prevImage = this.getPrevImage(playlist, currentContent.trackNumber - 1);
      const songTitle = currentContent.name || currentContent.title || null;

      return (
          <div className="music-player-container">
            <div className="music-player-songs">
              { nextImage }
              <div className="current-song cover-song">
                <img src={currentContent.image} onError={(e) => {
                  e.target.src = placeholder_square;
                }}/>
              </div>
              { prevImage }
            </div>
            <div className="music-player-controls">
              <div className="song-title-section">
                <div className="song-title">{ songTitle }</div>
                <div className="more-controls">
                  <div className="more-actions">
                    <i className='fa fa-ellipsis-v'></i>
                  </div>
                  <div>
                    <span className={`color-ball green`}></span>
                  </div>
                </div>
              </div>
              <div className="song-album-title">{ currentContent.artist ? currentContent.artist.join(', ') || currentContent.albumName : ''}</div>
            </div>
            <ContextMenu ref={instance => { this.contextMenu = instance; }}/>
            <MusicActions
              actionType = "musicPlayer"
              buttonData = { this.state.playlistDetail }
              greenAction = { this.toggleMore }
              isHidden = { true }
            />
          </div>
      )
    }
}

const mapStateToProps = state => { return { player: state.player, playerMusica: state, user: state.user } };

const mapDispatchToProps = dispatch => bindActionCreators({
  isEnding,
  addToContextMenu,
  setMetricsEvent
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlayer);
