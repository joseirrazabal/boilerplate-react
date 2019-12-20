import './musicActions.css';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '../Button';
import Translator from './../../requests/apa/Translator';
import DeviceDetection from '../../utils/DeviceDetection';
import Device from "../../devices/device";
import { addPlaylistSongsToPlayerPlaylist, getRandomOrderSongs } from '../../actions/musica/player-action-creators';
import DeviceStorage from '../DeviceStorage/DeviceStorage';

const config_remote_control = (DeviceStorage.getItem('config_remote_control') !== 'simple') ? true : false ;

class MusicActions extends Component {
  constructor(props = {}) {
    super(props);
    this.state = {
      data: props.buttonData,
      type: props.actionType,
      contentId: null,
      pgm: null
    };

    this.buttonFavorite=this.buttonFavorite.bind(this)
    this.buttonFollow=this.buttonFollow.bind(this);
    this.buttonPlay=this.buttonPlay.bind(this);
    this.buttonMore=this.buttonMore.bind(this);
    this.getButtonsBySection=this.getButtonsBySection.bind(this);
    this.keys = Device.getDevice().getKeys();
    this.action = () => { };
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.play = this.play.bind(this);
  }

  componentDidMount() {
    window.SpatialNavigation.focus('.firstButton');
    document.addEventListener('keydown', this.handleKeyPress, true);
  }

  componentWillUnmount(){
    document.removeEventListener('keydown', this.handleKeyPress, true);
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      data: nextProps.buttonData
    });
  }

  play(){
    this.props.blueAction();
  }

  buttonFavorite(){
    let classFavorite = 'fa-heart';
    let textFavorite = 'Favorito';
    if(this.state.data.isFavorite){
      classFavorite = 'fa-heart favorited';
      textFavorite = Translator.get('favorite_cancel_btn', 'Quitar de favoritos');
    }
    return <Button
      key="btn-favs"
      text={textFavorite}
      iconClassName={`fa ${classFavorite}`}
      colorCode={ config_remote_control ? "yellow" : null}
      onClick={() => this.props.yellowAction()}
    />;
  }

  buttonPlay(){
    return <Button
      key="btn-play"
      text={Translator.get('PLAY', 'Play')}
      iconClassName={"fa fa-play"}
      className={"firstButton"}
      colorCode={ config_remote_control ? "blue" : null}
      onClick={() => this.play()}
    />
  }

  buttonFollow(){
      let classFollow = 'fa-bookmark';
      let textFollow = Translator.get('FOLLOW', 'Seguir');
      if (this.state.data.playlistDetail && this.state.data.playlistDetail.isFollowing){
        classFollow = 'fa-bookmark favorited';
        textFollow = Translator.get('UNFOLLOW', 'Dejar de seguir');
      }

      return <Button
        key="btn-follow"
        text={textFollow}
        iconClassName={`fa ${classFollow}`}
        colorCode={ config_remote_control ? "yellow" : null}
        onClick={() => this.props.yellowAction()}
      />
  }

  buttonMore(){
    return <Button
      key="btn-more"
      text={Translator.get('MORE', 'Más')}
      iconClassName={"fa fa-ellipsis-v"}
      colorCode={ config_remote_control ? "green" : null}
      onClick={() => this.props.greenAction()}
    />
  }

  getButtonsBySection(section){
    switch (section){
      case 'playlistDetail':
        if(this.state.data.playlistDetail.isOwnPlaylist)
          return [this.buttonPlay, this.buttonMore];
        else
          return [this.buttonPlay, this.buttonFollow, this.buttonMore];
        break;
      case 'albumDetail':
        return [this.buttonPlay, this.buttonFavorite, this.buttonMore];
        break;
      case 'artistDetail':
        return [this.buttonFavorite];
        break;
      case 'playlists':
      case 'musicHome':
        return [this.buttonPlay, this.buttonFollow, this.buttonMore];
      case 'artist':
          return [this.buttonPlay, this.buttonMore];
      case 'musicPlayer':
          return [this.buttonMore];
      case 'radios':
        return [this.buttonPlay, this.buttonFavorite];
      default:
        return [];
        break;
    }
  }

  handleKeyPress(e) {
    console.log('Listening Music Index');
    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    switch (currentKey) {
      case 'BLUE': //only for play
        this.play();
        break;
      case 'PLAY': //only for play
        this.play();
        break;
      case 'GREEN': //only for more
        this.props.greenAction();
        break;
      case 'YELLOW': // for add to favorites an follow content
        this.props.yellowAction();
      default:
        break;
    }
  }

  render() {
    const buttons = this.getButtonsBySection(this.state.type);
    return (
      <div className={`music-actions ${this.props.isHidden? 'music-actions-hidden': ''}`}>
          <div className="vcard-actions">
            {buttons.map(button => {
                return button();
              }
            )}
          </div>
      </div>
    )
  }
}

MusicActions.propTypes = {
  onPlayClick: PropTypes.func,
  greenAction: PropTypes.func,
  yellowAction: PropTypes.func,
};

MusicActions.defaultProps = {
  greenAction: () => {},
  yellowAction: () => {},
  blueAction: () => {},
};

const mapStateToProps = state => { return {} };

const mapDispatchToProps = dispatch => ({
  onPlayClick: (playlistDetails, index) => dispatch(addPlaylistSongsToPlayerPlaylist(playlistDetails, index)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MusicActions);
