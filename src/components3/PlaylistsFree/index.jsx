import './playlistsFree.css';
import React, {Component} from "react";
import MusicGrid from '../../components/MusicGrid'
import RibbonsUtil from "../../utils/RibbonsUtil";
class PlaylistsFree extends Component {


  constructor(props) {
    super(props);

    this.state = {
      isFetching: true,
      common: null,
      seasons: null,
      purchaseButtonInfo: null,
      user: props.user.musicUser,
      playlists:[],
      reloadGrid: false,
    };
  }

  componentWillUnmount(){
    //remove blurEl background
    /*setTimeout(() => {
      const blurEl = document.getElementById("blur");
      blurEl.style.background = "none";
      blurEl.classList.remove('blury');
    },1000)*/
  }
  componentDidMount() {
    this.setState({ isFetching: true});
    this.props.setIsFetching(true);
    const musicRb = new RibbonsUtil();
    musicRb.getMusicListFromApi(`playlistsFreeSTV`,this.state.user,{countryCode: this.state.user.countryCode, filterUserInteractions: 'playlists'}).then(
      (resp) => {

        const  playlists = resp.map((playlist) => {
          return {...playlist, href: `/playlist/${playlist.id}`}
        });

        this.setState({
          playlists,
          index: this.state.index + this.state.size,
          isFetching: false,
          reloadGrid: false,
        });
        this.props.setIsFetching(false);
      }
    ).catch(
      (err) => {
        console.log('Fail ribbons: ' + err);
        this.setState({ isFetching: false});
        this.props.setIsFetching(false);
      }
    );
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.playlists !== nextState.playlists;
  }
  render() {
    return (
        <MusicGrid
          items={this.state.playlists}
          onFocusHandler={this.props.onFocusCardHandler}
          reload={ this.state.reloadGrid }
          gridType="playlist"
          getMore = {this.fetchMoreLists}
        />
    )
  }
}

export default PlaylistsFree
