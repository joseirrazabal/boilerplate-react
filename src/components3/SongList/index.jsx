import './songlist.css';
import React, {Component} from "react";
import { connect } from 'react-redux';

import Resume from '../Resume';
import Spinner from './../../components/Spinner';
import media from '../../containers/Epg/media.png';
import {contentData, purchaseButtonInfo, contentSerie} from '../../requests/loader';

class SongList extends Component {
  constructor() {
    super();
    this.groupId = "";
    this.state = {
      isFetching: true,
      common: null,
      seasons: null,
      purchaseButtonInfo: null
    };

    this.setFocused = this.setFocused.bind(this);
  }

  setFocused(id, props){
    const el = document.getElementById(`id-${id}`);
    el.classList.add("song-selected");
    if(this.props.onSelectSong){
      setTimeout(()=>{
        this.props.onSelectSong(props);
      }, 500)
    }
  }

  removeFocused(id, props){
    const el = document.getElementById(`id-${id}`);
    el.classList.remove("song-selected");
    if(this.props.onBlurSong)
      this.props.onBlurSong(props);
  }

  componentDidMount(){
    window.SpatialNavigation.makeFocusable();
  }

  render() {
    const artistName = this.props.artistName || this.props.artist;
    const tagsArtistNames = Array.isArray(artistName) ? artistName.map((result, index) => {
      return (
        <tag className="variousArtistSongs" key={index}>
          <a>
            {result}
          </a>
        </tag>
      );
    }) :
      artistName;
    return (
        <div className="Row" >
          <a  href="javascript:void(0)"   className="song-info focusable"
              id={`id-${this.props.phonogramId || this.props.id}`}
              onFocus={() => this.setFocused(this.props.phonogramId || this.props.id, this.props)}
              onBlur={() => this.removeFocused(this.props.phonogramId || this.props.id, this.props)}
              onClick={() => this.props.onPlayClick() }>
          <div className="Cell song-name">
                <i className="fa fa-play nonDisplay" aria-hidden="true"></i>
                {this.props.trackNumber}. {this.props.name}
          </div>
          <div className="Cell song-artist">
              {tagsArtistNames}
          </div>
          <div className="Cell song-album">
              {this.props.albumName}
          </div>
          <div className="Cell song-duration">
            {this.props.leftTime || this.props.duration}
          </div>
          </a>
        </div>
    )
  }
}

export default SongList;
