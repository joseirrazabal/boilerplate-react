import './playlistsFilter.css';
import React, {Component} from "react";
import RibbonsUtil from "../../utils/RibbonsUtil";
import store from '../../store';
import Translator from './../../requests/apa/Translator';
import { SHOW_MODAL, MODAL_MUSIC_FILTER } from '../../actions/modal';

class PlaylistsFilter extends Component {
  constructor(props) {
    super(props);
    this.modal = {
      type: SHOW_MODAL,
        modalType: MODAL_MUSIC_FILTER
    };
    this.state = {
      user: props.user,
      menuItems: [],
      genre: {
        title:'',
        name:''
      },
      genreListIsOpen: false,
    };
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.user !== undefined && nextProps.user !== this.props.user ){
      this.getMenu(nextProps.user);
    }
  }

  componentDidMount(){
    if (this.props.user !== undefined){
      this.getMenu(this.props.user);
    }
    window.SpatialNavigation.makeFocusable();
  }
  getMenu(user) {
    //get menu items
    let musicRb = new RibbonsUtil();
    musicRb.getMusicListFromApi(`genreMenuSTV`,user,{countryCode: user.countryCode}).then(
      (resp) => {
        console.log('El menutas');
        console.log('Menu-----', resp);
        this.setState({ menuItems: resp});
      }
    ).catch(
      (err) => {
        console.log('Fail to get Menu filter will not show: ' + err);
      }
    );
    //http://localhost:3003/webapi/genreMenu/
  }

  toggleListGenreFilter(){
    if (!this.state.genreListIsOpen){
      this.modal.modalProps = {
        setGenreTitle: (category) => this.setGenreTitle(category),
        onSelectFilter: (category) => this.props.onSelectFilter(category),
        toggleListGenreFilter: () => this.toggleListGenreFilter(),
        menuItems: this.state.menuItems
      };
      store.dispatch(this.modal);
    }
    this.setState((prevState) => {
      return {genreListIsOpen: !prevState.genreListIsOpen};
    });
  }

  setGenreTitle(category){
    this.setState({genre: category})
  }
  render() {
    return (
      <div className="playlist-filter">
        <nav className="nav_interno_2 ni2_1e">
          <ul>
            <li className="focusable focus-selector" onClick={(e) => {
              e.stopPropagation();
              this.toggleListGenreFilter();
            }}>
              <a

                id="filtro_gen"
                onClick={(e) => {
                  e.stopPropagation();
                  this.toggleListGenreFilter();
                }}
              >
                <span>{(this.state.genre.title === '') ? Translator.get('FILTER_BY', 'FILTRAR POR') : this.state.genre.title.toUpperCase()}</span>
                <i className={`${(this.state.genreListIsOpen) ? 'fa fa-angle-down rotate2 down' : 'fa fa-angle-down rotate2'}`} />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}

export default PlaylistsFilter;
