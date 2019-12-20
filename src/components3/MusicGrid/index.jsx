import './musicGrid.css';
import React, {Component} from "react";
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";

import Card from './../Card';
import PropTypes from 'prop-types';
import getAppConfig from '../../config/appConfig';
import MusicUtils from '../../actions/musica/music-actions';

import { doPGMRadio } from '../../actions/musica/player-shared-action-creators';
import { playFullMedia } from '../../actions/playmedia';

class MusicGrid extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: props.user.musicUser,
      items: props.items,
      type: props.type,
      contentId: null,
      pgm: null
    };
    this.config = getAppConfig();
    this.onClickService = this.onClickService.bind(this);
  }

  addScrollListenerToLoadMore() {
    const divToScroll = document.getElementById('music-grid-container');
    let eventToBind = 'scroll';
    divToScroll.addEventListener(eventToBind, () => {
      const executeLater = () => {
        this.scrollTimeout = null;
      };
      const getMore = divToScroll.scrollHeight - Math.round(divToScroll.scrollTop) - 1 <= divToScroll.clientHeight ;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = (setTimeout(executeLater, 30));
      if (getMore) {
        this.props.getMore();
      }
    });
  }

  componentDidMount(){
    if(this.props.gridType === 'playlist' || this.props.gridType === 'radio')
      this.addScrollListenerToLoadMore();
  }

  componentWillReceiveProps(newProps) {
    this.setState({ items: newProps.items });
    if(this.props.items.length === 0)
    setTimeout(function() { window.SpatialNavigation.focus('.music-grid-container .focusable'); }, 300);
  }

  componentDidUpdate() {
    window.SpatialNavigation.makeFocusable();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.items !== nextProps.items || this.state.pgm !== nextState.pgm;
  }

  handlePlay(urlRadio, item){
    const pgm = this.props.onPlayRadio(urlRadio, item);
    if(pgm) {
      this.props.playFullMedia({
        playerstate: 'PLAYING',
        source: {
          audiosource: pgm.media.video_url,
        },
        ispreview: false,
        islive: true,
        ispip: false,
      });
    }
  }

  onClickService(service, item){
    switch(service){
      case 'favoritesRadiosSTV':
        this.handlePlay(item.url + item.id, item);
        break;
      case 'Radios':
      case 'radios':
        if(!item.url) {
          if(item.subType==='stvRadio'){
            MusicUtils.getPGMSTVRadio(item).then(radioUrl =>{
              const radio = {...item, url: radioUrl};
              this.handlePlay(radio.url, radio);
            });
          } else {
            MusicUtils.getRadioDetailFromCard(item.id, this.props.user.musicUser).then(radio =>{
              this.handlePlay(radio.url, radio);
            });
          }

        } else {
          this.handlePlay(item.url, item);
        }
        break;
      case 'favoritesPlaylistsSTV':
      case 'favoritesAlbumsSTV':
      case 'favoritesArtistsSTV':
        return this.props.history.push(item.href);
        break;
      default:
        return this.props.history.push(item.href);
        break;
    }
  }

  render() {
    return (
      <div className={`music-grid-container ${this.props.musicClass}`} id="music-grid-container">
            { this.state.items.map((item, index) => {
              return <Card
                index={ index }
                key={ index }
                data={ {...item, type: this.props.gridType} }
                cover={ item.image }
                group_id={ item.id }
                title= { item.artist }
                label={ item.label }
                href={item.href}
                type={this.props.type}
                firstItem={ (index === 0) }
                clickHandler={ () => { this.onClickService(this.props.service, item) } }
                focusHandler={ this.props.onFocusHandler}
                onLoadHandler={ this.willUnfocusUpHandler }
                ribbon={ false }
                focusable = { this.props.focusable }
                sibling={item.sibling}
                is_music={true}
                setMetricsEvent={this.props.setMetricsEvent}
                stationTitle={this.props.stationTitle}
              />;
            }) }
      </div>
    )
  }
}

MusicGrid.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(['highlight', 'portrait', 'landscape', 'cd', 'user-profile', 'user-info', 'square', 'circle']),
  gridType: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  title: PropTypes.string,
  onFocusHandler: PropTypes.func,
  focusHandler: PropTypes.func,
  getMore: PropTypes.func,
  focusable: PropTypes.bool,
  musicClass: PropTypes.string,
};

MusicGrid.defaultProps = {
  id: '',
  className: '',
  type: 'square',
  gridType: '',
  focusHandler: null,
  focusable: true,
  getMore: () => {},
  musicClass: ''
};

MusicGrid.propTypes = {
  onPlayRadio: PropTypes.func
};

const mapStateToProps = state => ({ user: state.user});

const mapDispatchToProps = dispatch => ({
  onPlayRadio: (index,state) => dispatch(doPGMRadio(index, state)),
  playFullMedia: (pgm) => dispatch(playFullMedia(pgm))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MusicGrid))
