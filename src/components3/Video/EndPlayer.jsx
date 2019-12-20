import './styles/endPlayer.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';

import Button from '../Button';
import Card from '../Card';
import Parser from '../../utils/Parser';
import Translations from '../../requests/apa/Translator';
import * as api from "../../requests/loader";
import settings from '../../devices/all/settings';
import { showModal, MODAL_EPISODE_SELECT } from '../../actions/modal';
import { playFullMedia } from '../../actions/playmedia';
import Device from "../../devices/device";
import AAFPlayer from '../../AAFPlayer/AAFPlayer';
import LayersControl from "../../utils/LayersControl";
import store from './../../store';
import getBadges from './../../utils/Badges';
import {AAFPLAYER_STOP} from "../../AAFPlayer/constants";

class EndPlayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timer: 10,
      //pgm: null,
      pbi: null,
      recommendations: [],
      groupId: null,
      visible: null
    };

    this.keys = Device.getDevice().getKeys();
    this.updateTimerIntervalId = null;
    this.actualMovie = null;
    this.firstChapter = null;
    this.handleBack = this.handleBack.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.playNextContent = this.playNextContent.bind(this);
    this.handleEpisodeClick = this.handleEpisodeClick.bind(this);
    this.handleEpisodesModalClick = this.handleEpisodesModalClick.bind(this);
    this.handleRecommendationClick = this.handleRecommendationClick.bind(this);
    this.watchAgainMovie = this.watchAgainMovie.bind(this);
    this.watchAgainFirtsChapter = this.watchAgainFirtsChapter.bind(this);
    this.resumeUpdateTimer = this.resumeUpdateTimer.bind(this);
    this.handleBackFichaClick = this.handleBackFichaClick.bind(this);
    this.recommendations=null;
  }

  componentWillMount() {
    if(this.props.serieData && this.props.serieData.seasons && this.props.serieData.seasons.length > 0 && this.props.next === null) {
      this.firstChapter = this.props.serieData.seasons[0].first_episode; // The first season the first chapter
    }
    else if(this.props.next === null && this.props.serieData && this.props.serieData.seasons && this.props.serieData.seasons.length === 0) {
      this.actualMovie = this.props.groupId; // Watch the actual movie again
    }
    else {
      this.actualMovie = this.props.groupId; // Watch the actual movie again
    }
  }

  componentWillReceiveProps(nextProps) {
    this.resumeUpdateTimer(nextProps);
  }

  componentDidMount() {
    const { next } = this.props;
    if (next) {
      window.SpatialNavigation.focus('fin_player');
      this.setUpdateTimer();
      this.dataNextEpisode(next.id);
    } else {
      window.SpatialNavigation.focus('.end-player .card-grid :first-child a');
    }

    document.addEventListener('keydown', this.keyPressHandler, false);
    this.recommendations= this.props.player && this.props.player.recommendations? this.props.player.recommendations: null;
  }

  async dataNextEpisode(groupId) {
    var result = await api.purchaseButtonInfo(groupId);
    this.setState({
      visible: JSON.parse(result.playButton.visible)
    });
    return result;
  }

  componentWillUnmount() {
    clearInterval(this.updateTimerIntervalId);
    document.removeEventListener('keydown', this.keyPressHandler, false);
  }

  setUpdateTimer = () => {
    this.updateTimerIntervalId = setInterval(this.updateTimer, 1000);
  }

  keyPressHandler = (e) => {
    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    console.log('Listening EndPlayer, currentKey:',currentKey);
    switch (currentKey) {
      case 'BACK':
        this.handleBack();
        break;
      case 'BLUE':
        this.playNextContent();
        break;
      default:
        break;
    }
  };

  playFullPlayer = (gid, isReplay = false) => {
    let nextgid = {
      ispip: false,
      islive: false,
      ispreview: false,
      resume: 0,
      source: {
        videoid: gid
      },
      playerstate: 'PLAYING',
    };

    if(isReplay) {
      nextgid.isReplay = isReplay;
    }

    if(this.recommendations){
      Object.assign(nextgid, {recommendations:this.recommendations});
    }
    this.props.playFullMedia(nextgid);
    const { history } = this.props;
    history.goBack();
  }

  resetFullPlayer = () => {
    // ResetPlayer url and state, if we are here in endPlayer then we arrived from fullPlayer,
    // so reset full player
    if(LayersControl.isPlayerVisible()){
      LayersControl.hidePlayer(true);
    }
    let nullPlayer = {
      ispip: false, // Pasarle el full, queremos stop sobre el full
      islive: false,
      ispreview: false,
      playerstate: 'STOPPING',
    };

    this.props.playFullMedia(nullPlayer);
  }

  handleBackFichaClick() {
    this.resetFullPlayer();


    const { history, groupId } = this.props;
    history.goBack();
  }

  handleBack() {
    this.resetFullPlayer();

    const { history } = this.props;
    history.goBack();
  }

  updateTimer() {
    if (this.state.timer === 0) {
      clearTimeout(this.updateTimerIntervalId);
      this.playNextContent();
    } else {
      this.setState(prevState => ({
        timer: prevState.timer - 1
      }));
    }
  }

  resumeUpdateTimer(nextProps) {
    if(this.props.modal.modalType && nextProps.modal.modalType !== this.props.modal.modalType && this.state.timer > 0) {
      this.setUpdateTimer();
    }
  }

  async playNextContent() {
    clearInterval(this.updateTimerIntervalId);
    const { next } = this.props;
    const contentId = next.extendedcommon.media.language.options.option[0].content_id;
    /*
    const [pbi, pgm] = await Promise.all([
      api.purchaseButtonInfo(next.id),
      api.playerGetMedia(next.id, contentId, false),
    ]);
    */
    const pbi = await api.purchaseButtonInfo(next.id);
    // Restart player ¿?
    this.resetFullPlayer();

    const wasPurchased = pbi && pbi.playButton && pbi.playButton.waspurchased;
    if(wasPurchased) {
      // Passing "true" value to force Ficha Component to update the store, dispatching setResume with the content_id of the next episode
      setTimeout(this.playFullPlayer, 100, next.id, true);
    }
    else {
      setTimeout(() => {
        this.setState({
          pbi: pbi,
          //pgm: pgm,
          groupId: next.id
        });
      }, 1000);
    }
  }

  handleRecommendationClick(groupId = "") {
    this.resetFullPlayer();
    this.props.history.replace(`/vcard/${groupId}`);
  }

  watchAgainFirtsChapter(){
    clearTimeout(this.updateTimerIntervalId);
    this.resetFullPlayer();
    setTimeout(this.playFullPlayer, 100, this.firstChapter);
  }

  watchAgainMovie(){
    clearTimeout(this.updateTimerIntervalId);
    this.resetFullPlayer();
    setTimeout(this.playFullPlayer, 100, this.actualMovie, true);
  }


  async handleEpisodeClick(episode = {}) {
    const groupId = episode.id;
    const contentId = this.state.contentId;
    console.log("VOD handlePlay");
    /*
    const [pbi, pgm] = await Promise.all([
      api.purchaseButtonInfo(groupId),
      api.playerGetMedia(groupId, contentId),
    ]);
    */
    const pbi = await api.purchaseButtonInfo(groupId);
    const wasPurchased = pbi && pbi.playButton && pbi.playButton.waspurchased;
    if(wasPurchased) {
      setTimeout(this.playFullPlayer, 100, groupId);
    }
    else {
      setTimeout(() => {
        this.setState({
          pbi: pbi,
          groupId: groupId
        });
      }, 1000);
    }
  }

  handleEpisodesModalClick() {
    clearTimeout(this.updateTimerIntervalId);
    const modal = {
      modalType: MODAL_EPISODE_SELECT,
      modalProps: {
        serieData: this.props.serieData,
        handleEpisodeClick: this.handleEpisodeClick,
        onClose:()=>{
          // this.updateTimerIntervalId = setInterval(this.updateTimer, 1000);
        }
      }
    };
    this.props.showModal(modal);
  }

  render() {
    const isPlayerStopped = this.props.player && this.props.player.playerstate && this.props.player.playerstate === AAFPLAYER_STOP;
    this.actualMovie=this.props.groupId;
    const { groupId, visible, /*pgm,*/ pbi } = this.state;
    const { serieData, recommendations } = this.props;
    //const wasPurchased = pbi && pbi.playButton && pbi.playButton.waspurchased;

    console.info('Rediirect from endPlayer' + ' groupId: ' + groupId);

    /*
    if (wasPurchased) {

      return <Redirect to={{
        pathname: `/player/${groupId}`,
        state: {
          //pgm,
          isTrailer: false,
          serieData,
          recommendations
        }
      }} />
    }
    */
    const totalWidth = 1280;
    const leftWidth = 355;
    const rightWidth = totalWidth - leftWidth;

    const containerStyles = {
      position: 'absolute',
      height: '100%',
      width: '100%',

    };

    const leftStyles = {
      position: 'absolute',
      height: '100%',
      width: leftWidth,
    };

    const rightStyles = {
      position: 'absolute',
      left: leftWidth,
      height: '100%',
      width: rightWidth,
    };

    const playerStyles = {
      top: settings.end_player_position_top,
      left: settings.end_player_position_left,
      width: settings.end_player_position_width,
      height: settings.end_player_position_height,
      zIndex: 3,
    };

    const contentSelector = () => {
      if(this.actualMovie || this.firstChapter){
        playerStyles.position = 'absolute';
        if(isPlayerStopped){
          playerStyles.backgroundImage = 'url(' + `${this.props.backgroundImg}` + ')';
          playerStyles.backgroundRepeat = 'no-repeat';
          playerStyles.backgroundSize = 'cover';
        }

      }

      if(this.actualMovie){
        return(
          <div className="watch-movie-again" style={playerStyles}>
          <div className="watch-movie-again_layer">
            {isPlayerStopped?
              <a className="watch-movie-again_layer--play focusable action fa fa-undo" href="javascript:void(0)" onClick={this.watchAgainMovie}></a>:null
            }
          </div>
        </div>
        )
      } else if(this.firstChapter){
        return(
          <div className="watch-movie-again" style={playerStyles}>
          <div className="watch-movie-again_layer">
            {isPlayerStopped?
              <a className="watch-movie-again_layer--play focusable action fa fa-undo" href="javascript:void(0)" onClick={this.watchAgainFirtsChapter}></a>:null
            }

          </div>
        </div>
        )
      } else{
        return(
        <div style={playerStyles}>
        </div>
        )
      }
    }

    const { next } = this.props;
    const contentTextStyle = { fontSize: 17, marginBottom: 5 };
    const contentText = next ?
      <div
        style={contentTextStyle}
      >
        {`
          ${Translations.get("finPlayer_Ser_next")}
          ${Translations.get("finPlayer_Ser_starts")}
          ${this.state.timer}"
        `}
      </div>
      :
      <div style={contentTextStyle}>
        {Translations.get("finPlayer_Pel_related")}
      </div>;
    return (
      <div id="end-player" className="end-player" style={containerStyles} ref={div => this.endPlayerRef = div}>
        <div className="left" style={leftStyles}>
          <Button
            style={{ position: 'absolute', top: 42, left: 42 }}
            text={Translations.get("btn_menu_back", "Volver")}
            iconClassName={"fa fa-undo"}
            onClick={this.handleBackFichaClick}
          />

          { contentSelector() }
        </div>
        <div className="right" style={rightStyles}>
          <div style={{ top: 93, position: 'absolute' }}>
            {contentText}
            {
              next?
                NextEpisode({
                  title: next.title,
                  episodeNumber: next.extendedcommon.media.episode.number,
                  description: next.description,
                  imgSrc: next.image_still,
                  handlePlayNextButton: this.playNextContent,
                  handleEpisodesModalClick: this.handleEpisodesModalClick,
                  visible: visible
                })
                : RecommendationsGrid({
                  clickHandler: this.handleRecommendationClick,
                  recommendations: this.props.recommendations.slice(0, 9)
                })
            }
          </div>
        </div>
      </div>
    )
  }
}

function NextEpisode(props = {}) {
  const {
    title,
    episodeNumber,
    description,
    imgSrc,
    handlePlayNextButton,
    handleEpisodesModalClick,
    visible,
  } = props;
  const imgStyle = {
    background: `url("${imgSrc}") no-repeat`,
    backgroundSize: '100%',
    height: 488,
    width: 868,
    display: 'table',
    marginBottom: 20,
  };
  return (
    <div>
      <div style={{ height: 545, textAlign: 'center' }}>
        <div style={imgStyle}>
          <div style={{
            width: '100%',
            height: 488,
            border: 'none',
            boxSizing: 'border-box',
            // display: 'table-cell',
            textAlign: 'center',
            verticalAlign: 'middle',
            backgroundColor: 'rgba(0,0,0, 0.5)',
            padding: '227px 0',
          }}>
            { visible > 0 &&
              <Button
                className={'focusable-default'}
                text={Translations.get("detail_play","Ver")}
                  iconClassName={"fa fa-play"}
                colorCode={"blue"}
                onClick={handlePlayNextButton}
              />
            }
          </div>
          <div style={{
            position: 'absolute',
            fontSize: 24,
            fontWeight: 'normal',
            left: '3%',
            bottom: '24%',
          }}>
            {episodeNumber}. {title}
          </div>
          <div style={{
            position: 'absolute',
            fontSize: 20,
            left: '3%',
            bottom: '14%',
            textAlign: 'justify',
            height: 50,
          }}>
            {description}
          </div>
        </div>

        <Button
          text={`${Translations.get('episode')}s`}
          onClick={handleEpisodesModalClick}
        />
      </div>
    </div>
  )
}

function RecommendationsGrid({ recommendations, clickHandler }) {
  return (
    <div className='card-grid'>
      {
        recommendations.map((r, index) => (
          <Card
            key={r.id}
            index={index}
            cover={r.image_small}
            group_id={r.id}
            type={'landscape'}
            focusable
            badgesAlign='right'
            title={r.title}
            badgesHtml={getBadges(store.getState().user, r.proveedor_name, r.format_types, r.live_enabled)}
            data={r}
            clickHandler={() => clickHandler(r.id)}
          />
        ))
      }
    </div>
  )
}

EndPlayer.propTypes = {
  groupId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  backgroundImg: PropTypes.string.isRequired,
  previewImg: PropTypes.string.isRequired,
  next: PropTypes.object,
  recommendations: PropTypes.arrayOf(PropTypes.object),
  serieData: PropTypes.shape({
    seasons: PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.string.isRequired,
        episodes: PropTypes.array.isRequired,
      })
    ).isRequired,
    seasonNumber: PropTypes.string.isRequired,
    episodeNumber: PropTypes.string.isRequired,
  })
};

EndPlayer.defaultProps = {
  groupId: "",
  title: "",
  backgroundImg: "",
  previewImg: "",
  next: null,
  seasons: [],
  seasonIndex: 0,
  recommendations: [],
  serieData: {
    seasons: [],
    seasonNumber: null,
    episodeNumber: null
  }
};

const mapStateToProps = state => ({
  player: state.player,
  modal: state.modal,
});
export default withRouter(connect(mapStateToProps, { showModal, playFullMedia })(EndPlayer));
