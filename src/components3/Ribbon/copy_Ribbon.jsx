import './styles/carousel.css';
import focusSettings from './../Focus/settings';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getAppConfig from '../../config/appConfig';
import Badges from './../../requests/apa/Badges';
import Card, { cardTypes } from './../Card';
import {withRouter} from "react-router-dom";
import Device from "../../devices/device";
import DeviceStorage from "../DeviceStorage/DeviceStorage";
import LayersControl from "../../utils/LayersControl";
import LocalStorage from "../DeviceStorage/LocalStorage";
import Utils from "../../utils/Utils";
import {showModal,MODAL_ACCIONES_CONTENIDO} from "../../actions/modal";
import store from '../../store';
import DeleteFavorite from "../../requests/tasks/user/DeleteFavoriteTask";
import RequestManager from "../../requests/RequestManager";
import {
  deleteFavorited, deleteFavoritedChannels, setLastTouchData,
  setLastTouchFavoritesData
} from "../../reducers/user";
import { playFullMedia } from '../../actions/playmedia';

class Ribbon extends Component {
  constructor(props) {
      super(props);

    this.ribbonId = this.props.id || `cv-${new Date().getTime()}`;
    this.config = getAppConfig();
    this.region = (props.user && props.user.region)
      || DeviceStorage.getItem("region");

    this.userType = 'anonymous';
    this.keys = Device.getDevice().getKeys();
    this.data = null;
    this.carruselTitle=
      typeof(props.carruselTitle) !== 'undefined'
        ? props.carruselTitle
        : props.title;
    if (props.user.isLoggedIn) {
      this.userType = props.user.isSusc ? 'susc' : 'no_susc';
    }

    this.RIGHT = 'RIGHT';
    this.LEFT = 'LEFT';

    this.state = {
      items: this.getVisibleItems(props.items, props.visibleNumber)
    };

    this.getDirection = this.getDirection.bind(this);
    this.focusHandler = this.focusHandler.bind(this);

    this.badgesUserType = {};
    const region = Badges.data[this.region] ? this.region : 'default';
    if (Badges.data[region]
      && Badges.data[region][this.userType]) {
      this.badgesUserType = Badges.data[region][this.userType];
    }
  }

  keyDownHandler = (e,data) => {
    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    console.log('Listening [Ribbon] keyDownHandler, currentKey:',currentKey);
    switch (currentKey){
      case 'YELLOW':
        e.preventDefault();
        e.stopPropagation();
        this.yellowAction(data);
        break;
    }
  }

  yellowAction=(cardData,cb=null)=>{
    if('function' === typeof cb)
      cb();
    const modal = document.getElementsByClassName('modal-overlay');
    if (modal.length === 0) {
      this.lastElement=document.activeElement;
      store.dispatch(showModal({
        modalType: MODAL_ACCIONES_CONTENIDO,
        modalProps: {
          playButtonVisible:false,
          myContentDeleteHandler: () =>{
            this.handleFavoriteDelete(cardData.group_id, cardData.type);
          },
          title:'Eliminar contenido favorito',
          content:'¿Estás seguro de deseas eliminar este contenido de favoritos?',
        }
      }));
    }
  }

  handleFavoriteDelete = async (groupId, type) => {
    const service = new DeleteFavorite(groupId);
    RequestManager.addRequest(service).then((resp) => {
      if (resp.response && resp.response === 'OK') {

        // Actualizar favoritos y seen con el mismo valor de favorited (para que lo tome level-user)
        if(resp.lasttouch && resp.lasttouch.favorited) {
          const lastTouchFav = resp.lasttouch.favorited;
          store.dispatch(setLastTouchData(lastTouchFav));
          store.dispatch(setLastTouchFavoritesData(lastTouchFav));
        }


        //Borrarlo en redux de canales o VOD segun corresponda
        if (type === 'vod') {
          console.log(' >> Se borra de VOD');
          store.dispatch(deleteFavorited(groupId));
          if(typeof this.props.forceUpdateGrid === 'function'){
            console.log(' invocamos forceUpdateGrid ribbon');
            this.props.forceUpdateGrid();
          }
        }
        else {
          console.log(' >> Se borra de CANALES');
          store.dispatch(deleteFavoritedChannels(groupId));
          if(typeof this.props.forceUpdateGrid === 'function'){
            console.log(' forceUpdateGrid ribbon');
            this.props.forceUpdateGrid();
          }
        }
      }
    }).catch((err) => {
      console.error(err);
    });
  };



  handleKeyPress = (e) => {
    if(LayersControl.isPlayerVisible())
      return;
    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    console.log('Listening [Ribbon] handleKeyPress, currentKey:',currentKey);
    switch (currentKey) {
      case 'INFO':
        let isOTTGuy =
          !this.props.user || (
            !this.props.user.paymentMethods
            || (
              this.props.user.paymentMethods
              && !this.props.user.paymentMethods.hubcorporativofijogate
              && !this.props.user.paymentMethods.hubfijovirtualgate
            )
          );

        if (!isOTTGuy && this.data && this.data.group_id) {
          /*
          e.preventDefault();
          e.stopPropagation();
          if(this.data.clickHandler)  this.data.clickHandler(this.data.group_id);
          else this.props.history.push(`/vcard/${this.data.group_id}`);
          */
        }
        break;
      default:
        break;
    }
  }

  componentWillUnmount() {
   //document.removeEventListener('keydown', this.handleKeyPress, true); //listening innecesario
  }

  componentDidMount() {
    //document.addEventListener('keydown', this.handleKeyPress, true); //listening innecesario
    //console.log ("[Ribbon.componentDidMount] ", this.ribbonId);
  }

  componentDidUpdate() {
    //console.log ("[Ribbon.componentDidUpdate] ", this.ribbonId);
  }

  componentWillReceiveProps(nextProps){
      if(this.props.items
        && nextProps.items
        && this.props.items[0] !== nextProps.items[0]) {
        this.setState({
          items: this.getVisibleItems(
            nextProps.items,
            nextProps.visibleNumber)
        });
      }
  }

  getVisibleItems(items, visibleNumber) {
    const visible = [];
    let currentIndex = null;

    for (let i = 0; i < items.length; i++) {
      if (items[i].current) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex !== null) {
      let fromCurrent = items.slice(currentIndex, currentIndex + visibleNumber);

      if (fromCurrent.length < visibleNumber) {
        const rest = items.slice(0, visibleNumber - fromCurrent.length);
        fromCurrent = fromCurrent.concat(rest);
      }

      for (let i = 0; i < fromCurrent.length; i++) {
        let index = (currentIndex + i < items.length)
          ? currentIndex + i
          : (currentIndex + i) - items.length;
        visible.push({index, item: fromCurrent[i]})
      }
    } else {
      const lim = Math.min(items.length, visibleNumber);
      for (let i = 0; i < lim; i++) {
        visible.push({index: i, item: items[i]});
      }
    }

    return visible;
  }

  getDirection(e) {
    if (!e.detail.direction) {
      return null;
    }

    const direction = e.detail.direction.toUpperCase();
    this.arrowHandler(direction);
  }

  focusHandler(data) {
    /* Commented to prevent multiple adding of the event */
    //document.addEventListener('keydown', this.handleKeyPress);
    const focused = document.activeElement;
    this.data = data;

    focused.removeEventListener('sn:willmove', this.getDirection);
    focused.addEventListener('sn:willmove', this.getDirection);

    if (typeof this.props.focusHandler === 'function') {
      this.props.focusHandler(data);
    }

    this.data = data;
  }


  arrowHandler(direction) {
    let visible = this.state.items;

    if (visible.length === 0) {
      return;
    }

    switch (direction) {
      case this.LEFT:
        this.navigationLeft(visible); break;
      case this.RIGHT:
        this.navigationRight(visible); break;
      default:
        return;
    }

    this.setState({ items: visible });
  }

  unFocusHandler = () => {
      //document.removeEventListener('keydown', this.handleKeyPress);
  }

  navigationLeft(visible) {
    const index = (visible[0].index === 0)
      ? this.props.items.length - 1
      : visible[0].index - 1;

    visible.pop();
    visible.unshift({index, item: this.props.items[index]});
  }

  navigationRight(visible) {
    const last = visible[visible.length - 1];

    const index = (last.index === (this.props.items.length - 1))
      ? 0 : last.index + 1;

    visible.shift();
    visible.push({index, item: this.props.items[index]});
  }

  getRibbonProps() {
    const newProps = Object.assign({}, this.props);

    for (let key in propTypes) {
      newProps[key] !== undefined && delete newProps[key];
    }
    newProps.sibling !== undefined && delete newProps.sibling;
    return newProps;
  }

  getPosition(title){
    for(let i=0; i<this.props.items.length;i++){
      if(this.props.items[i].title===title)
        return i;
    }

  }

  render() {
    const config_remote_control = LocalStorage.getItem('config_remote_control') != 'simple' ? true : false ;
    //const ribbonProps = this.getRibbonProps();
    //console.log ("[Ribbon.render] ribbonProps", this.ribbonId, this.props);
    const spanYellow=<span>Presione <span className="color-ball yellow"></span> para ver más opciones</span>;
    const pressAndHoldOk=<span>Manten presionado  <span className="clv-btn">OK</span> para ver más opciones</span>
    const buttonMoreOptions=config_remote_control?spanYellow: pressAndHoldOk ;
    return (
      <div
           id={this.ribbonId}
           className={`ribbon ${this.props.className || ''}`}>
        <div className="ribbon-title">
          { this.props.title }
        </div>
        <div className="ribbon-container">
          <div className="ribbon-items">
            {
              this.state.items.map((node, index) => {
                const node_item = node.item;
                let node_item_provider = node_item && node_item.provider;
                let badges = '';

                if (this.badgesUserType[node_item_provider] === undefined) {
                  node_item_provider = 'default';
                }

                if (node_item_provider
                  && this.badgesUserType
                  && this.badgesUserType[node_item_provider]
                ) {
                  const formatTypes = node_item.format_types ? node_item.format_types : [];
                  const badge_provider = this.badgesUserType[node_item_provider];

                  for (let i = 0; i < formatTypes.length; i++) {
                    if (badge_provider[formatTypes[i]]
                      && badge_provider[formatTypes[i]][node_item.type]
                    ) {
                      const data = badge_provider[formatTypes[i]][node_item.type];

                      for (let i = 0; i < data.length; i++) {
                        badges += data[i].render;
                      }
                    }
                  }
                }

                const key = Math.random() * 10;

                let uri = null;

                if(this.props.type === 'user-profile') {
                  if (node && node_item && node_item.typeContent) {
                    uri = node_item.src;
                  }
                  else {
                    uri = `/socialProfile/${node_item.id}`;
                  }
                }
                else { uri = node_item.src; }

                return <Card
                  unFocusHandler={ this.unFocusHandler }
                  id={key}
                  key={key}
                  data={node_item}
                  //group_id={"762224"}
                  group_id={node_item.group_id || node_item.id}
                  cover={node_item.cover}
                  label={node_item.label}
                  type={this.props.type || node_item.type}
                  title={node_item.title}
                  badgesHtml={badges}
                  dataMetric={{carruselTitle:this.carruselTitle,cardPosition:this.getPosition(node_item.title)}}
                  focusable={index === 0}
                  focusRight={`#${this.ribbonId} ${focusSettings.selector}`}
                  focusLeft={`#${this.ribbonId} ${focusSettings.selector}`}
                  focusHandler={this.focusHandler}
                  setMetricsEvent={this.props.setMetricsEvent}
                  clickHandler={node_item.clickHandler || this.props.onClickHandler}
                  sibling={node_item.sibling}
                  href={uri}
                  hideInnerTitle={this.props.hideInnerTitle ? true : false}
                  bookmark={node_item.bookmark ? String(node_item.bookmark) : "0"}
                  keyDownHandler={this.props.showFooter ? (this.props.keyDownHandler || this.keyDownHandler) : null}
                  filterTV={(node_item.filterTV) ? node_item.filterTV : null}
                />

              })
            }
          </div>
            </div>
        {this.state.items.length > 0 && this.props.showFooter &&
        <div className="ribbon-footer">
            <ul className="color-codes" style={{ width: '100%' }}>
                <li className="color-code-item">
                  {buttonMoreOptions}
                </li>
            </ul>
            </div>
          }
      </div>
    );
  }
}

const propTypes = {
  title: PropTypes.string,
  type: PropTypes.oneOf(cardTypes),

  visibleNumber: PropTypes.number,
  items: PropTypes.arrayOf(PropTypes.shape({
    group_id: PropTypes.string.isRequired,
    cover: PropTypes.string.isRequired,
    provider: PropTypes.string,
    format_types: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,

  focusHandler: PropTypes.func,
  setMetricsEvent: PropTypes.func,
  carruselTitle: PropTypes.string,
  byUser: PropTypes.bool,
  url: PropTypes.string,

  user: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
    isSusc: PropTypes.bool
  }),
};
Ribbon.propTypes = propTypes;

Ribbon.defaultProps = {
  title: '',
  type: null,
  visibleNumber: 5,
  focusHandler: null,
  setMetricsEvent:null,
  carruselTitle: '',
  user: {}
};

export default withRouter(Ribbon);


export {
  propTypes
}
