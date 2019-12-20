import React, {Component} from "react";
import store from '../../store';
import { connect } from 'react-redux';
import { SHOW_MODAL, HIDE_MODAL, MODAL_MUSIC_CONTEXTUAL_MENU } from '../../actions/modal';
import { addToContextMenu, toggleContextMenu} from "../../actions/musica/context-menu-actions";
import { Redirect } from 'react-router-dom';
import { addSongsToPlayerPlaylistStartAt } from '../../actions/musica/player-action-creators';
import MusicUtils from "../../actions/musica/music-actions";
import Translator from './../../requests/apa/Translator';

class ContextMenu extends Component {
  constructor(props) {
    super(props);
    this.modal = {
      type: SHOW_MODAL,
      modalType: MODAL_MUSIC_CONTEXTUAL_MENU
    };
    this.state = {
      menuItems: [],
      totalMenuItems: [
        {
          title: Translator.get('NEXT_LIST', 'Próxima en la lista'),
          action: () => this.addToNext(this.props.contextMenu.currentContent)
        },
        {
          title: Translator.get('LAST_LIST', 'Última en la lista'),
          action: () => this.addToNext(this.props.contextMenu.currentContent, true)
        },
        {
          title: Translator.get('GO_ARTIST', 'Ir al artista'),
          action: () => this.goToArtist(this.props.contextMenu.currentContent)
        },
        {
          title: Translator.get('GO_ALBUM', 'Ir al álbum'),
          action: () => this.goToAlbum(this.props.contextMenu.currentContent)
        },
        {
          title: Translator.get('INFORMATION', 'Información'),
          action: () => this.showSongInfo(this.props.contextMenu.currentContent)
        },
        {
          title: Translator.get('btn_close', 'Cerrar'),
          action: () => store.dispatch({
            type: HIDE_MODAL,
            modalType: MODAL_MUSIC_CONTEXTUAL_MENU
          })
        },
      ],
      redirectToReferrer: false,
      from: '',
    };
    this.goToArtist = this.goToArtist.bind(this);
    this.getArtistsItems = this.getArtistsItems.bind(this);
    this.showArtistModal = this.showArtistModal.bind(this);
  }

  componentDidMount(){
    this.getMenu();
  }

  getMenu() {

    if(this.props.contextMenu.currentContent.trackNumber){ //song
      this.getSongMenuItems();
    } else if (this.props.contextMenu.currentContent.type === 'album' ){ //album
      this.getAlbumMenuItems();
    } else {// playlist
      this.getPlaylistMenuItems();
    }
  }

  showModal(){
    if(this.props.contextMenu.currentContent.type === 'radio' ||
      this.props.contextMenu.currentContent.type  === 'artist') return;
    this.getMenu();
    this.modal.modalProps = {
      menuItems: this.state.menuItems
    };
    store.dispatch(this.modal);
  }

  showArtistModal(menuItems){
    store.dispatch({
      type: HIDE_MODAL,
      modalType: MODAL_MUSIC_CONTEXTUAL_MENU
    });
    this.modal.modalProps = {
      menuItems
    };
    store.dispatch(this.modal);
  }

  addToNext(content,atEnd = false){
    console.log('next in list =>', content);
    if(content.trackNumber) { //is a song
      this.props.addSongsToPlayerPlaylistStartAt([content],atEnd);
    } else if(content.tracks){ //has tracks
      this.props.addSongsToPlayerPlaylistStartAt(content.tracks,atEnd);
    } else if (content.type.toLowerCase()==='album'){ //album
      const album = content.type === 'Album'? content.musicData : content;
      MusicUtils.getAlbumDetailFromCard(album.id, this.props.user.musicUser).then((albumDetail) => {
        this.props.addSongsToPlayerPlaylistStartAt(albumDetail,atEnd);
      }).catch(err => console.log(err));
    } else if (content.type.toLowerCase()==='playlist'){ //album
      const playlist = content.type === 'Playlist'? content.musicData : content;
      MusicUtils.getPlaylistDetailFromCard(playlist.id, this.props.user.musicUser).then((playlist) => {
        this.props.addSongsToPlayerPlaylistStartAt(playlist.tracks,atEnd);
      }).catch(err => console.log(err));
    }
  }


  goToArtist(song){
    console.log('go to artist =>', song);
    const artists = song.artists;
    if(artists.length > 1){ //show new modal with artists
      const menuItems = this.getArtistsItems(artists);
      this.setState({ menuItems });
      this.showArtistModal(menuItems);
    } else { // go to artist

      this.setState({
        redirectToReferrer: true,
        from: `/artist/${song.artistId}`
       })
    }
  }

  goToAlbum(song){
    this.setState({
      redirectToReferrer: true,
      from: `/album/${song.albumId}`
    })
  }
  showSongInfo(song){
    console.log('show info', song);
  }

  getSongMenuItems() {
    const menuItems = [
      this.state.totalMenuItems[0],
      this.state.totalMenuItems[1],
      {
        title: 'Ir al artista',
        type: this.props.contextMenu.currentContent.artists.length > 1 ? "artistsModal":"",
        action: () => this.goToArtist(this.props.contextMenu.currentContent)
      },
      this.state.totalMenuItems[3],
    ];
    if(this.props.contextMenu.currentContent.fromPlayer){
      menuItems.splice(0, 2);
    }
    this.setState({ menuItems });
  }

  getArtistsItems(artists) {
    const menuItems = artists.map((artist) => {
      return {
        title:artist.name,
        action: () => this.goToArtist({name: artist.name, artistId: [artist.id], artists:[artist]}),
      };
    });

    return menuItems;
  }

  getPlaylistMenuItems() {
    const menuItems = [
      this.state.totalMenuItems[0],
      this.state.totalMenuItems[1],
    ];
    this.setState({ menuItems });
  }

  getAlbumMenuItems() {
    const menuItems = [
      this.state.totalMenuItems[0],
      this.state.totalMenuItems[1],
      this.state.totalMenuItems[2],
    ];
    this.setState({ menuItems });
  }

  render() {
    const { redirectToReferrer, from } = this.state;
    if(redirectToReferrer){
      return (
        <Redirect to={from}/>
      )
    }
    return (
      <div className="no-display">

      </div>
    )
  }
}

const mapStateToProps = state => ({ user: state.user, contextMenu: state.contextmenu });
const mapDispatchToProps = dispatch => ({
  addToContextMenu: (currentContent) => dispatch(addToContextMenu(currentContent)),
  toggleContextMenu: () => dispatch(toggleContextMenu()),
  addSongsToPlayerPlaylistStartAt: (songs, atEnd) => dispatch(addSongsToPlayerPlaylistStartAt(0 ,songs,false, atEnd)),
});
export default connect(mapStateToProps, mapDispatchToProps,  null, { withRef: true })(ContextMenu);
