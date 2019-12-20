import React, {Component} from "react";
import { connect } from 'react-redux';

import MusicGrid from '../../components/MusicGrid';
import RibbonsUtil from "../../utils/RibbonsUtil";
import Resume from '../../components/Resume';
import Spinner from './../../components/Spinner';
import MusicUtils from "../../actions/musica/music-actions";
import MusicActions from '../../components/MusicActions';

import { fetchLoginDynamic } from '../../reducers/user';
import { setResumeData } from "../../actions/resume";
import { getCurrentImage, getCurrentAlbumName, getCurrentTitle } from '../../actions/musica/player-action-creators';
import { doPGMRadio } from '../../actions/musica/player-shared-action-creators';
import { playFullMedia } from '../../actions/playmedia';

class GenreRadioList extends Component {
  constructor(props) {
    super(props);
    this.onFocusCardHandler = this.onFocusCardHandler.bind(this);
    this.state = {
      purchaseButtonInfo: null,
      user: props.user,
      isFetching: false,
      genreRadios: [],
      selectedRadio: {},
      pgm: null,
    };
    this.intervalRadios = null;
    this.handlePlay = this.handlePlay.bind(this);
    this.toggleFollow = this.toggleFollow.bind(this);
  }

  onFocusCardHandler(data, index) {
    if (this.idTimeout) {
      clearTimeout(this.idTimeout);
    }

    this.idTimeout = setTimeout(()=>{
      const elements = document.getElementsByClassName('focused');
      if(elements.length > 0)
        elements[0].classList.remove('focused');

      const selEl= document.getElementById(`card-${data.id}`);
      if(selEl){
        selEl.classList.add("focused");
      }

      const itemData = {
        title: this.props.match.params.name,
        year: data.name,
        rating: data.rating_code,
        category: data.artist,
        duration: data.title,
        showBack: false,
        purchaseButtonInfo: true,
      };
      this.setState({
        selectedRadio: data
      });
      this.props.setResumeData({...itemData, overWrite: true});
    }, 500);
  }

  fetchGenreRadios(user) {
    const musicRb = new RibbonsUtil();
    const genreName = this.props.match.params.name;
    musicRb.getMusicListFromApi(`radioDetailsSTV/genre/${genreName}`, user, { countryCode: user.countryCode, filterUserInteractions: 'radios' }).then(
      (resp) => {
        let genreRadios = this.state.genreRadios;
        if (resp && resp.length > 0) {
          genreRadios = resp;
        }

        this.setState({
          genreRadios,
        });

        if (this.intervalRadios === null){
          this.intervalRadios = setInterval(() => {
            this.fetchGenreRadios(user);
          },30000);
        }
      }
    ).catch(
      (err) => {
        console.log('Fail ribbons: ' + err);
      }
    );
  }

  toggleFollow(){
    const that = this;
    MusicUtils.toggleFavorite(this.state.selectedRadio, this.props.user.musicUser).then((toggleValue) => {
      const playlistDetail = {...that.state.playlistDetail, isFollowing: toggleValue}
      that.setState({ playlistDetail });
    }).catch(err => {
      const playlistDetail = {...that.state.playlistDetail, isFollowing: err}
      this.setState({ playlistDetail });
    });
  }

  sendToPlay = (pgm) => {
    if(pgm) {
      this.props.playFullMedia({
        playerstate: 'PLAYING',
        source: {
          audiosource: pgm.media.video_url
        },
        ispreview: false,
        islive: false,
        ispip: false,
      });
    }
  }

  handlePlay(){
    if(!this.state.selectedRadio.url) {
      MusicUtils.getRadioDetailFromCard(this.state.selectedRadio.id, this.props.user.musicUser).then(radio =>{
        const pgm = this.props.onPlayRadio(radio.url, radio);
        this.sendToPlay(pgm);
      });
    } else {
      const pgm = this.props.onPlayRadio(this.state.selectedRadio.url, this.state.selectedRadio);
      this.sendToPlay(pgm);
    }
  }

  componentWillMount() {
    if(this.props.user.musicUser === undefined){
      this.props.fetchLoginDynamic(this.state.user.email);
      this.setState({user: this.props.user});
    }
  }

  componentDidMount(){
    if (this.props.user.musicUser !== undefined){
      this.fetchGenreRadios(this.props.user.musicUser)
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.user.musicUser){
      this.fetchGenreRadios(nextProps.user.musicUser)
    }
  }

  componentWillUnmount(){
    clearInterval(this.intervalRadios);
  }

  render() {
    return (
      <div className="radios-container-inter">
        <Resume />
        { this.state.genreRadios.length === 0 ? <Spinner /> : ''}
        <MusicGrid
          items={this.state.genreRadios}
          gridType="radio"
          service="Radios"
          type="square"
          onFocusHandler={this.onFocusCardHandler}
        />
        <MusicActions
          actionType="radios"
          buttonData={this.state.selectedRadio}
          blueAction={this.handlePlay}
          yellowAction={this.toggleFollow}
          isHidden={true}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({ user: state.user, playerMusica: state.playermusica });
const mapDispatchToProps = dispatch => ({
  fetchLoginDynamic: (email) => dispatch(fetchLoginDynamic(email)),
  setResumeData: (itemData) => dispatch(setResumeData(itemData)),
  onPlayRadio: (index,state) => dispatch(doPGMRadio(index, state)),
  playFullMedia: (pgm) => dispatch(playFullMedia(pgm))
});
export default connect(mapStateToProps, mapDispatchToProps)(GenreRadioList);
