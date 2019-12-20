import './playlistsUser.css';
import React, {Component} from "react";
import MusicGrid from '../../components/MusicGrid'
import RibbonsUtil from "../../utils/RibbonsUtil";
import Placeholder from '../../containers/Placeholder';

class PlaylistsUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      common: null,
      seasons: null,
      purchaseButtonInfo: null,
      user: props.user,
      playlists:[],
      reloadGrid: false,
      content: props.content,
      showPlaylistUserPlaceholder: false,
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
  getMyPlaylists(user){
    this.setState({ isFetching: true});
    this.props.setIsFetching(true);
    const musicRb = new RibbonsUtil();
    musicRb.getMusicListFromApi(`userPlaylistSTV`,user,{countryCode: user.countryCode}).then(
      (resp) => {
        const  playlists = resp.playlistsUser ;
        if (playlists.length <= 0) this.setState({ showPlaylistUserPlaceholder: true, });
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
        console.log('Fail get user playlists: ' + err);
        this.setState({
          isFetching: false,
          showPlaylistUserPlaceholder: true,
        });
        this.props.setIsFetching(false);
      }
    );
  }

  componentDidMount(){
      this.getMyPlaylists(this.props.user.musicUser);
  }

  render() {
    if (!this.state.showPlaylistUserPlaceholder) {
      return (
        <MusicGrid
          items={this.state.playlists}
          onFocusHandler={this.props.onFocusCardHandler}
          reload={ this.state.reloadGrid }
          gridType="playlists"
          getMore={this.fetchMoreLists}
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

export default PlaylistsUser
