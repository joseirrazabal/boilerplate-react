import './playlistdetail.css';
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Resume from '../Resume';
import SongList from '../SongList';
import MusicActions from '../MusicActions';
import Spinner from './../../components/Spinner';
import ContextMenu from '../ContextMenu';
import RibbonsUtil from "../../utils/RibbonsUtil";
import CoverImage from "../CoverImage/index";
import { playFullMedia } from "../../actions/playmedia";
import { fetchLoginDynamic } from '../../reducers/user';
import { getCurrentImage, getCurrentAlbumName, getCurrentTitle } from '../../actions/musica/player-action-creators';
import { addToContextMenu, toggleContextMenu} from "../../actions/musica/context-menu-actions";
import { doPGMPlaylist } from '../../actions/musica/player-shared-action-creators';
import { setResumeData } from "../../actions/resume";
import Translator from './../../requests/apa/Translator';

class PlaylistDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      user: props.user,
      playlistDetail: [],
      playlistTracks: [],
      totalTracks:[],
      placeholder: '/images/placeholder_square.png',
      playlistId: props.match.params.groupId,
      recommendations: [],
      contentId: null,
      pgm: null,
      index: 0,
      size: 10,
      selectedSong: {},
      modalIsOpen:false,
    };
    this.getPlaylistDetail = this.getPlaylistDetail.bind(this);
    this.toggleFollow = this.toggleFollow.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.addScrollListenerToLoadMore = this.addScrollListenerToLoadMore.bind(this);
    this.handleSelectSong = this.handleSelectSong.bind(this);
    this.setModalIsOpen = this.setModalIsOpen.bind(this);
    this.toggleMore = this.toggleMore.bind(this);
    this.contextMenu = null;
  }

  componentWillMount() {
    if(this.props.user.musicUser === undefined){
      this.props.fetchLoginDynamic(this.state.user.email);
      this.setState({user: this.props.user.musicUser});
    }
  }
  componentDidMount(){
    this.props.toggleContextMenu();
    if (this.props.user.musicUser !== undefined){
      this.getPlaylistDetail(this.props.user.musicUser);
      this.setState({user: this.props.user.musicUser});
    }
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.user.musicUser){
      this.getPlaylistDetail(nextProps.user.musicUser);
      this.setState({user: nextProps.user.musicUser});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.playerMusica !== this.props.playerMusica ||
      nextState.playlistTracks !== this.state.playlistTracks ||
      nextState.playlistDetail !== this.state.playlistDetail ||
      nextState.modalIsOpen    !== this.state.modalIsOpen
  }

  getPlaylistDetail(user){
    this.setState({ isFetching: true});
    const playlistId = this.state.playlistId;
    let musicRb = new RibbonsUtil();
    musicRb.getMusicListFromApi(`playlistSTV/${playlistId}`,user,{countryCode: user.countryCode}).then(
      (resp) => {
        console.log('[LEVEL] Music component playlist detail:');
        this.setState({
          playlistDetail: resp.playlistDetail.playlistDetail,
          playlistTracks: resp.playlistDetail.playlistDetail.tracks.slice(0,this.state.size),
          totalTracks: resp.playlistDetail.playlistDetail.tracks,
          isFetching: false,
          index: this.state.index + this.state.size,
        });
        this.addScrollListenerToLoadMore();
        this.props.addToContextMenu(this.state.playlistDetail)
        this.props.toggleContextMenu();
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
      const getMore = divToScroll.scrollHeight - divToScroll.scrollTop === divToScroll.clientHeight + 20 ||
        divToScroll.scrollHeight - divToScroll.scrollTop === divToScroll.clientHeight;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = (setTimeout(executeLater, 30));
      if (getMore) {
        this.fetchMoreSongs();
      }
    });
  }

  fetchMoreSongs(){
    let playlistTracks = this.state.playlistTracks;

    if (playlistTracks.length <= 10) {
      this.setState({
        index: playlistTracks.length,
        size: playlistTracks.length,
      });
    }
    playlistTracks = playlistTracks.concat(this.state.totalTracks.slice(this.state.index, this.state.index + this.state.size));
    this.setState({
      playlistTracks,
      index: this.state.index + this.state.size,
      isFetching: false,
    });
    this.addScrollListenerToLoadMore();
  }

  toggleFollow(){
    const musicService = new RibbonsUtil();
    const playlistId = this.state.playlistId;
    const user = this.props.user.musicUser;
    if(!this.state.playlistDetail.isFollowing){
      const playlistDetail = {...this.state.playlistDetail, isFollowing: true}
      this.setState({
        playlistDetail
      });
      musicService.getMusicListFromApi(`favorites/followPlaylistSTV/${playlistId}`,user,{countryCode: user.countryCode}).then(
        (resp) => {
        }
      ).catch(
        (err) => {
          const playlistDetail = {...this.state.playlistDetail, isFollowing: false}
          this.setState({
            playlistDetail
          });
        }
      );
    } else {
      const playlistDetail = {...this.state.playlistDetail, isFollowing: false}
      this.setState({
        playlistDetail
      });
      musicService.getMusicListFromApi(`favorites/unfollowPlaylistSTV/${playlistId}`,user,{countryCode: user.countryCode}).then(
        (resp) => {

        }
      ).catch(
        (err) => {
          const playlistDetail = {...this.state.playlistDetail, isFollowing: true}
          this.setState({
            playlistDetail
          });
        }
      );
    }
  }

  toggleMore(){
    const el = document.getElementById('w_canciones').querySelector('.focusable:focus');
    if (el !== null) { // is a song
      this.props.addToContextMenu(this.state.selectedSong);
    }
    else { //set data from playlistdetail
      this.props.addToContextMenu(this.state.playlistDetail)
    }
    const context = this.contextMenu.getWrappedInstance();
    context.showModal();
  }

  handlePlay(index){
    if(!index) index = 0;
    let pgm_musica = this.props.doPGMPlaylist(index, this.state);
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

  handleSelectSong(selectedSong){
     this.setState({selectedSong});
  }
  handleBlurSong(){
     this.setState({selectedSong: {}});
  }

  setModalIsOpen(modalIsOpen){
    this.setState({modalIsOpen: !this.state.modalIsOpen});
  }

  render() {
    const itemData = {
      title: this.state.playlistDetail.title,
      year: this.state.playlistDetail.followers + Translator.get('FOLLOWERS', 'seguidores'),
      rating: '',
      category: this.state.playlistDetail.numTracks + Translator.get('SONGS', 'canciones'),
      duration: this.state.playlistDetail.duration,
      description: '',
      showBack: false,
      purchaseButtonInfo: true,

    };
    this.props.setResumeData(itemData);
    let imageCover = this.state.playlistDetail.cover;
    if (!imageCover || imageCover.indexOf('ph_album.svg') > -1){
      imageCover = this.state.placeholder;
    }
    return (
      <div className="album_resume_container">
        { this.state.isFetching? <Spinner className="spinner-music"/> :
          <div className="album_container">
            <Resume />
            <MusicActions
              actionType="playlistDetail"
              buttonData={this.state}
              blueAction={this.handlePlay}
              yellowAction={this.toggleFollow}
              greenAction ={this.toggleMore}
            />
            <div className="playlist_separator_bar" />
            <div className="w_detail">
              <div className="w_album">
                <div>
                  <CoverImage
                    image={imageCover}
                    imagePlaceholder={this.state.placeholder}
                    classComponent={'portada-lista'}
                    type='square'
                  />

                </div>
              </div>
              <div className="w_canciones" id="w_canciones">
                <div className="Table">
                  <div className="Heading">
                    <div className="Cell song-name">{Translator.get('SONG', 'Canción')}</div>
                    <div className="Cell song-artist">{Translator.get('ARTIST', 'Artista')}</div>
                    <div className="Cell song-album">{Translator.get('ALBUM', 'Álbum')}</div>
                    <div className="Cell song-duration-title">{Translator.get('DURATION', 'Duración')}</div>
                  </div>
                  {
                    this.state.playlistTracks.map((track, index) => (
                      <SongList
                        {...track}
                        trackNumber={index + 1}
                        onPlayClick={() => this.handlePlay(index) }
                        onSelectSong={(selectedSong) => this.handleSelectSong(selectedSong) }
                        onBlurSong={(selectedSong) => this.handleBlurSong(selectedSong) }
                        position={index}
                        key={index}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        }
        <ContextMenu ref={instance => { this.contextMenu = instance; }}/>
      </div>
    )
  }
}

PlaylistDetail.propTypes = {
  onStatePlay: PropTypes.func,
  handlePlay: PropTypes.func
};

const mapStateToProps = state => ({ user: state.user, playerMusica: state.playermusica });
const mapDispatchToProps = dispatch => ({
  fetchLoginDynamic: (email) => dispatch(fetchLoginDynamic(email)),
  setResumeData: (itemData) => dispatch(setResumeData(itemData)),
  doPGMPlaylist: (index,state) => dispatch(doPGMPlaylist(index, state)),
  addToContextMenu: (currentContent) => dispatch(addToContextMenu(currentContent)),
  toggleContextMenu: () => dispatch(toggleContextMenu()),
  playFullMedia: (pgm) => dispatch(playFullMedia(pgm)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistDetail);
