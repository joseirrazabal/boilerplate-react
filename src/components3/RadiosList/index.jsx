
import React, {Component} from "react";

class RadiosList extends Component {
  constructor() {
    super();

    this.groupId = "";

    this.state = {
      isFetching: true,
      common: null,
      seasons: null,
      purchaseButtonInfo: null
    };
  }
  setFocused(id){
    const el = document.getElementById(`id-${id}`);
    el.classList.add("song-selected");
  }

  removeFocused(id){
    const el = document.getElementById(`id-${id}`);
    el.classList.remove("song-selected");
  }
  componentWillMount() {
    // console.log('Will Mount Song');
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
              id={`id-${this.props.stationId || this.props.id}`}
              onFocus={() => this.setFocused(this.props.stationId || this.props.id)}
              onBlur={() => this.removeFocused(this.props.stationId || this.props.id)}
              onClick={() => this.props.onPlayClick() }
          >
          <div className="Cell song-name">
            <i className="fa fa-play nonDisplay" aria-hidden="true"></i>
            {this.props.trackNumber}. {this.props.artistName}
          </div>
          <div className="Cell song-artist">
            {this.props.trackTitle}
          </div>
          <div className="Cell song-album">
            {this.props.duration}
          </div>
          <div className="Cell song-duration-radio">
            {this.props.stationName}
          </div>
          </a>
        </div>

    )
  }
}

export default RadiosList
