import './playlistsFollowed.css';
import React, {Component} from "react";
import MusicGrid from '../../components/MusicGrid';
//import ShouldNotUpdate from 'should-not-update'
import RibbonsUtil from "../../utils/RibbonsUtil";
import Placeholder from '../../containers/Placeholder';

class PlaylistsFollowed extends Component {

  constructor(props) {
    super(props);
    this.fetchMoreLists = this.fetchMoreLists.bind(this);
    this.state = {
      isFetching: true,
      user: props.user.musicUser,
      playlists:[],
      index: 0,
      size: 30,
      reloadGrid: false,
      content: props.content,
      showFollowedPlaceholder: false,
    };
  }

  fetchMoreLists(){
    this.setState({ isFetching: true});
    this.props.setIsFetching(true);
    const musicRb = new RibbonsUtil();
    musicRb.getMusicListFromApi(`followedPlaylistSTV/${this.state.index}/${this.state.size}`,this.state.user,{countryCode: this.state.user.countryCode}).then(
      (resp) => {
        let playlists = this.state.playlists;
        if (this.state.reloadGrid) playlists = resp.playlistsFollowed;
        else if(resp.playlistsFollowed && resp.playlistsFollowed.length > 0){
          playlists = playlists.concat(resp.playlistsFollowed);
        }
        this.setState({
          playlists,
          index: this.state.index + this.state.size,
          isFetching: false,
          reloadGrid: false,
          showFollowedPlaceholder: playlists.length === 0
        });
        this.props.setIsFetching(false);
      }
    ).catch(
      (err) => {
        console.log('Fail get playlists followed: ' + err);
        this.setState({
          isFetching: false,
          showFollowedPlaceholder: true,
        });
        this.props.setIsFetching(false);
      }
    );
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
    this.fetchMoreLists();
  }
  shouldComponentUpdate(nextProps) {
    return this.props.isFetching !== nextProps.isFetching;
  }
  render() {
    if (!this.state.showFollowedPlaceholder) {
      return (
        <MusicGrid
          items={this.state.playlists}
          onFocusHandler={this.props.onFocusCardHandler}
          reload={ this.state.reloadGrid }
          gridType="playlist"
          getMore = {this.fetchMoreLists}
        />
      )
    } else {
      return (
        <Placeholder
          type={this.state.content}
          onFocusHandler={this.props.onFocusCardHandler}
        />
      )
    }
  }
}

export default PlaylistsFollowed
