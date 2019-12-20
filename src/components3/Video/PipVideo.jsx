import React, { Component } from 'react';
import Video from './index'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { playPipMedia } from '../../actions/playmedia';
import AAFPlayer from '../../AAFPlayer/AAFPlayer';

class PipVideo extends Video {
  constructor(props) {
    super(props);
    this.isPlayerFull = false;
  }

  enableControls() {
    // TODO check this....
    return false;
    //return Boolean(this.props.location.pathname.match('/player'));
  }

  render() {
    console.log('[PIPVIDEO] render .....');

    return (
      <div id="HTML5VideoWrapperPIP" ref="VideoContainerPIP" className={this.props.classVideo + this.state.extraClass}>
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    AAFPlayer.setPlayerState({
      playerstate: 'PLAYING',
      source: {
        //videoid: 764423
        videoid: nextProps.gp
      },
      ispreview: false,
      islive: false,
      ispip: true,
    });
  }

}
//const mapStateToProps = (state, ownProps) => Object.assign({}, state, ownProps);

const mapDispatchToProps = (dispatch) => bindActionCreators({
  playPipMedia
}, dispatch);

const mapStateToProps = state => { return { playerpip: state.playerpip } };
export default connect(mapStateToProps, mapDispatchToProps)(PipVideo);
