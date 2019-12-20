import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Episodes from './Episodes';
import Seasons from './Seasons';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import store from '../../store';
import Utils from '../../utils/Utils';
import * as api from '../../requests/loader';
import { setResumeData } from './../../actions/resume';

class EpisodeSelection extends Component {

  static propTypes = {
    data: PropTypes.shape({
      groupId: PropTypes.string,
      seasons: PropTypes.arrayOf(
        PropTypes.shape({
          number: PropTypes.string.isRequired,
          episodes: PropTypes.array.isRequired,
        })
      ).isRequired,
      seasonNumber: PropTypes.string.isRequired,
      episodeNumber: PropTypes.string.isRequired,
    }),
    visibleEpisodes: PropTypes.number.isRequired,
    handleSeasonClick: PropTypes.func,
    handleEpisodeClick: PropTypes.func.isRequired, // passes episode object as the function param.
  };

  static defaultProps = {
    data: {
      groupId: null,
      seasons: [],
      seasonNumber: null,
      episodeNumber: null
    },
    visibleEpisodes: 5,
    handleSeasonClick: () => { },
    handleEpisodeClick: () => { console.warn('handleEpisodeClick, not passed as props') }
  };

  constructor(props) {
    super(props);

    this.state = {
      episodeSelected: props.data.episodeNumber,
      seasonSelected: props.data.seasonNumber,
      seasons: props.data.seasons
    };

    this.handleSeasonClick = this.handleSeasonClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.data.groupId !== this.props.data.groupId
      || nextProps.data.episodeNumber !== this.state.episodeSelected
      || nextProps.data.seasonNumber !== this.state.seasonSelected
      || nextState.seasonSelected !== this.state.seasonSelected
    ) {
      if(nextProps.data.groupId !== this.props.data.groupId) {
        // there is no need to update seasons if groupId does not change
        this.state.seasons = nextProps.data.seasons;
      }
      this.state.seasonSelected = nextProps.data.seasonNumber;
      this.state.episodeSelected = nextProps.data.episodeNumber;
      return true;
    }
    return false;
  }

  async handleSeasonClick(seasonNumber = 1) {
    this.sendMetric('Temporada '+seasonNumber);

    /* Se extra informacion del titulo del primer episodio de la temporada seleccionada*/
    let { seasons } = this.state;    
    let selectedSeason = seasons.filter((item) => item.number == seasonNumber);

    if (selectedSeason && selectedSeason[0] && selectedSeason[0].episodes) {

      const firstEpisode = selectedSeason[0].episodes[0];

      if (firstEpisode) {

        const title = `${firstEpisode.title} : ${firstEpisode.title_episode}`;
        const duration = Utils.formatDuration(firstEpisode.duration);
        const rating = firstEpisode.rating_code;
        const groupId = firstEpisode.id;
        const description = firstEpisode.description;
        const sprites = firstEpisode.image_sprites;
        const previewImage = firstEpisode.image_still;
        const frameImage = firstEpisode.image_frames;

        const [contentData, pbi] =
          await Promise.all([
            api.contentData(firstEpisode.id),
            api.purchaseButtonInfo(firstEpisode.id)
          ]);

        const isPlayButtonVisible = pbi.playButton &&
          pbi.playButton.visible === "1";
        const hasPreview = contentData.group &&
          contentData.group.common &&
          contentData.group.common.extendedcommon &&
          contentData.group.common.extendedcommon.media &&
          contentData.group.common.extendedcommon.media.haspreview &&
          contentData.group.common.extendedcommon.media.haspreview == "true";
        const handlePlay = this.props.handlePlay;

        store.dispatch(setResumeData({
          title,
          duration,
          rating,
          groupId,
          description,
          sprites,
          previewImage,
          frameImage,
          purchaseButtonInfo: pbi,
          playButton: this.props.getPlayButton({
            isPlayButtonVisible,
            hasPreview,
            handlePlay,
            episode: firstEpisode.episode_number,
            season: firstEpisode.season_number,
          }),
        }));
      }
    }

    this.setState({ seasonSelected: seasonNumber, episodeSelected: null });
    if (this.props.handleSeasonClick && typeof this.props.handleSeasonClick === 'function') {      
      this.props.handleSeasonClick(seasonNumber);
    }
  }

  sendDimension(){
    const payload=new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: 'executor'});
  }

  sendMetric(label){
    if(typeof this.props.setMetricsEvent ==='function' && window.location.toString().indexOf('vcard') !== -1 ){
      this.props.setMetricsEvent({
        hitType: 'event',
        eventCategory: 'vcard',
        eventAction: 'cambiar temporada',
        eventLabel: `${label} - ${this.props.dataMetric} `,
      });
      this.props.setMetricsEvent({ type: 'executor'});
      this.sendDimension();
    }
  }

  getEpisodes() {
    const season = this.state.seasons.find(season => season.number == this.state.seasonSelected, this);
    if (season) {
      const episodes = season.episodes.map(episode => {
        if (episode.episode_number == this.state.episodeSelected) {
          episode.current = true;
        } else {
          episode.current = false;
        }
        return Object.assign({}, episode);
      }, this);
      return episodes;
    }
    return [];
  }

  render() {
    const { seasons, seasonSelected } = this.state;
    const { visibleEpisodes } = this.props;

    const vEpisodes = (this.getEpisodes().length < 5) ? this.getEpisodes().length : visibleEpisodes;

    return (
      <div className="episode-selection" style={{ position: 'relative' }}>
        <Seasons
          seasons={seasons}
          seasonSelected={seasonSelected}
          handleSeasonClick={this.handleSeasonClick}
        />
        <Episodes
          episodes={this.getEpisodes()}
          visibleEpisodes={vEpisodes}
          handleEpisodeClick={this.props.handleEpisodeClick}
        />
      </div>
    );
  }
}

export default EpisodeSelection;
