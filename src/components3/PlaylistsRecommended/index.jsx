import './playlistsRecommended.css';
import React, {Component} from "react";
import MusicGrid from '../../components/MusicGrid'
import PlaylistsFilter from '../../components/PlaylistsFilter'
//import ShouldNotUpdate from 'should-not-update'
import RibbonsUtil from "../../utils/RibbonsUtil";
import Placeholder from '../../containers/Placeholder';

class PlaylistsRecommended extends Component {


  constructor(props) {
    super(props);
    this.fetchMoreLists = this.fetchMoreLists.bind(this);
    this.onSelectFilter = this.onSelectFilter.bind(this);
    this.state = {
      isFetching: true,
      common: null,
      seasons: null,
      purchaseButtonInfo: null,
      user: props.user,
      playlists:[],
      index: 0,
      size: 30,
      category: 'general',
      reloadGrid: false,
      showPlaylistPlaceholder: false,
    };
  }

  onSelectFilter(category){
    this.setState({
      index: 0,
      size: 30,
      category: category.genreAlias,
      reloadGrid: true,
    }, () => {
      this.fetchMoreLists();
    });
  }
  fetchMoreLists(){
    const user = this.state.user.musicUser;
    this.setState({ isFetching: true});
    this.props.setIsFetching(true);
    const musicRb = new RibbonsUtil();
    musicRb.getMusicListFromApi(`playlistsSTV/${this.state.index}/${this.state.size}/${this.state.category}`,user,{countryCode: user.countryCode, filterUserInteractions: 'playlists'}).then(
      (resp) => {
        let playlists = this.state.playlists;
        if (this.state.reloadGrid) playlists = resp.playlistsTops;
        else if(resp.playlistsTops && resp.playlistsTops.length > 0){
          playlists = playlists.concat(resp.playlistsTops);
        }

        this.setState({
          playlists,
          index: this.state.index + this.state.size,
          isFetching: false,
          reloadGrid: false,
          showPlaylistPlaceholder: !(playlists.length > 0),
        });
        this.props.setIsFetching(false);
      }
    ).catch(
      (err) => {
        console.log('Fail playlists recommended: ' + err);
        this.setState({ isFetching: false});
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

  componentDidMount(){
      this.fetchMoreLists();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.playlists !== nextState.playlists;
  }
  render() {
    console.log('reRender -playlist/Recommended')
    if(!this.state.showPlaylistPlaceholder){
      return (
        <div className="filter-grid-container">
          <PlaylistsFilter user={this.props.user.musicUser} onSelectFilter={this.onSelectFilter}/>
          <MusicGrid
            items={this.state.playlists}
            onFocusHandler={this.props.onFocusCardHandler}
            reload={ this.state.reloadGrid }
            gridType="playlist"
            getMore = {this.fetchMoreLists}
            musicClass="playlists-recommended"
          />
        </div>
      )
    } else {
      return (<Placeholder
        type="playlistsRecommended"
        onFocusHandler={this.props.onFocusCardHandler}
      />)
    }

  }
}

export default PlaylistsRecommended
