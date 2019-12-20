import './mySongs.css';
import React, {Component} from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import SongList from '../SongList';
import RibbonsUtil from '../../utils/RibbonsUtil';
import Placeholder from '../../containers/Placeholder';
import Translator from './../../requests/apa/Translator';

import { playFullMedia } from '../../actions/playmedia';
import { doPGMSongs, doUpdateFlagStatus } from '../../actions/musica/player-shared-action-creators';

class MySongs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      common: null,
      seasons: null,
      purchaseButtonInfo: null,
      user: props.user.musicUser,
      tracks: [],
      totalTracks: [],
      index: 0,
      size: 10,
      pmg: null,
      showMySongsPlaceholder: true,
    };
    this.getMyFavoriteSongs = this.getMyFavoriteSongs.bind(this);
    this.fetchMoreSongs = this.fetchMoreSongs.bind(this);
    this.addScrollListenerToLoadMore = this.addScrollListenerToLoadMore.bind(this);
  }

  componentDidMount() {
    this.getMyFavoriteSongs();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.updateData !== this.props.updateData) {
      this.getMyFavoriteSongs();
    }
  }

  getMyFavoriteSongs() {
    this.setState({ isFetching: true });
    this.props.setIsFetching(true);
    let musicRb = new RibbonsUtil();

    musicRb.getMusicListFromApi(`favoritesSongsSTV`, this.state.user, { countryCode: this.state.user.countryCode }).then(
      (resp) => {
        this.setState({
          tracks: resp.slice(0, this.state.size),
          totalTracks: resp,
          isFetching: false,
          index: this.state.index + this.state.size,
          showMySongsPlaceholder: resp.length <= 0,
        });
        this.props.setIsFetching(false);
        this.props.doUpdateFlagStatus(false);
        this.addScrollListenerToLoadMore();
      }
    ).catch(
      (err) => {
        console.log('Fail ribbons: ' + err);
      }
    );
  }

  addScrollListenerToLoadMore() {
    const divToScroll = document.getElementById('w_canciones');
    let eventToBind = 'scroll';
    divToScroll.addEventListener(eventToBind, () => {
      const executeLater = () => {
        this.scrollTimeout = null;
      };
      console.log(divToScroll.scrollHeight - divToScroll.scrollTop, divToScroll.clientHeight)
      const getMore = divToScroll.scrollHeight - divToScroll.scrollTop >= divToScroll.clientHeight &&
        divToScroll.scrollHeight - divToScroll.scrollTop <= divToScroll.clientHeight+40;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = (setTimeout(executeLater, 30));
      if (getMore) {
        this.fetchMoreSongs();
      }
    });
  }

  fetchMoreSongs() {
    console.log(this.state.index);
    let tracks = this.state.tracks;
    tracks = tracks.concat(this.state.totalTracks.slice(this.state.index, this.state.index + this.state.size));
    this.setState({
      tracks,
      index: this.state.index + this.state.size,
      isFetching: false,
    });
    this.props.setIsFetching(false);
    this.addScrollListenerToLoadMore();
  }

  handlePlay(index){
    if(!index) index = 0;
    let pgm_musica = this.props.doPGMSongs(index, this.state);
    if(pgm_musica) {
      this.props.playFullMedia({
        playerstate: 'PLAYING',
        source: {
          audiosource: pgm_musica.media.video_url,
        },
        ispreview: false,
        islive: false,
        ispip: false,
      });
    }
  }

  render() {
    if (!this.state.showMySongsPlaceholder) {
      return (
        <div>
          {this.state.isFetching ? '' :
            <div className="w_detail">
              <div className="w_album">
                <div>
                  <img
                    src={this.state.cover ? this.state.cover : this.state.tracks.length > 0 ? this.state.tracks[0].image : ''}
                    className="portada-lista" role="presentation"
                    alt="Album cover" />
                </div>
              </div>
              <div className="w_canciones section_songs" id="w_canciones">
                <div className="Table">
                  <div className="Heading">
                    <div className="Cell song-name">{Translator.get('SONG', 'Canción')}</div>
                    <div className="Cell song-artist">{Translator.get('ARTIST', 'Artista')}</div>
                    <div className="Cell song-album">{Translator.get('ALBUM', 'Álbum')}</div>
                    <div className="Cell song-duration-title">{Translator.get('DURATION', 'Duración')}</div>
                  </div>
                  {
                    this.state.tracks.map((track, index) => (
                      <SongList
                        {...track}
                        trackNumber={index + 1}
                        //section={section}
                        onPlayClick={() => this.handlePlay(index) }
                        position={index}
                        key={index}
                        onSelectSong={this.props.onFocusCardHandler}
                      />
                    ))}
                </div>
              </div>
            </div>
          }
        </div>
      )
    } else {
      return (
        <Placeholder
          type="song"
          onFocusHandler={this.props.onFocusCardHandler}
        />
      )
    }
  }
}

MySongs.propTypes = {
  updateData: PropTypes.bool,
  doPGMSongs: PropTypes.func,
  handlePlay: PropTypes.func,
  doUpdateFlagStatus: PropTypes.func,
};

const mapStateToProps = (state) => ({
  updateData: state.playermusica.currentContent.flagUpdate,
});

const mapDispatchToProps = dispatch => ({
  doPGMSongs: (index,state) => dispatch(doPGMSongs(index, state)),
  playFullMedia: (pgm) => dispatch(playFullMedia(pgm)),
  doUpdateFlagStatus: (status) => dispatch(doUpdateFlagStatus(status)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MySongs);
