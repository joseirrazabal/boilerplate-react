import focusSetting from './../Focus/settings';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from "../../utils/Parser";
import getBadges from './../../utils/Badges';
import Device from "../../devices/device";
/* import settings from './../../devices/all/settings';
import { playFullMedia } from '../../actions/playmedia';
import { AAFPLAYER_PLAY } from '../../AAFPlayer/constants'; */
import store from '../../store';
import LayersControl from "../../utils/LayersControl";
import LocalStorage from "../DeviceStorage/LocalStorage";

// Request
import RequestManager from './../../requests/RequestManager';
import ListTask from './../../requests/tasks/content/ListTask';
import Translator from "../../requests/apa/Translator";
import Asset from "../../requests/apa/Asset";
// Actions
import { MODAL_EPG, showModal } from "../../actions/modal";

// Components
import ItemCard from './../ItemCard';

// Styles
import './grid.css';

class Grid extends Component {
  constructor(props) {
    super(props);

    this.typeEnum = Object.freeze({
      Channel: 0,
      Infinite: 1,
    });
    this.ch=0;
    this.totalChannels=0;
    this.firstCardId = null;
    this.rootClass = 'channels-container';
    this.gridType = props.gridType;
    this.uri = props.request.uri;
    this.DOWN = 'DOWN';
    this.UP = 'UP';
    this.currentUpPage = 1;
    this.currentDownPage = -1;

    // Variables para la refactorización
    this.lastUp = 0;
    this.lastDown= null; // Con este se empieza a contar cual es el ultimo elemento de la paginacion
    this.totalCategory = null; // total de peliculas que contiene la categoria
    this.markupArray = [];
    this.counter = 0;
    this.flagFirstLoad = false;
    this.indexElemenetActive = null;
    this.title = null;
    this.downClicks = 2;
    this.rows = props.rows;
    this.itemsByRow = props.cols;
    this.itemsByPage = this.rows * this.itemsByRow;
    this.channels = {
      up: [],
      middle: [],
      down: []
    };

    this.focusOutSelector = `#root ${focusSetting.selector}`;
    this.keys = Device.getDevice().getKeys();

    this.state = {
      channels: this.channels.middle
    };
    this.allItems=[];

    this.firstLoad = this.firstLoad.bind(this);
    this.createGrid = this.createGrid.bind(this);
    this.willUnfocusMiddleHandler = this.willUnfocusMiddleHandler.bind(this);
    this.onFocusUpHandler = this.onFocusUpHandler.bind(this);
    this.onFocusMiddleHandler = this.onFocusMiddleHandler.bind(this);
    this.onFocusDownHandler = this.onFocusDownHandler.bind(this);
    this.setFocusUp = this.setFocusUp.bind(this);
    this.focusHandler = this.focusHandler.bind(this);

    this.quantity = props.cols * 4;
    this.lastKey = null;
    this.isKeysBloqued = false;
    this.delayKeyTime = 50;
    this.handleDelayKeyOkTimer=null;
    this.handleDelayKeyOkSafeTime=1000;
    this.channelsWrapper=null;
    // this.counterRecover = this.counterRecover.bind(this);
  }


  setHandleDelayKeyOkTimer=()=>{
    this.handleDelayKeyOkTimer = setTimeout(()=>{
      clearTimeout(this.handleDelayKeyOkTimer);
      this.handleDelayKeyOkTimer=null;
    },this.handleDelayKeyOkSafeTime);
  }


  showModalOTT=()=>{
    this.setHandleDelayKeyOkTimer();
    store.dispatch(showModal({
      modalType: MODAL_EPG,
      modalProps: {
        menuItems: [
          {
            title: Translator.get('programacion', 'Programación'),
            visible: 1,
            action: () => {
              if(!this.handleDelayKeyOkTimer )
                this.props.modalOttChannelsAction();
            }
          },
          {
            title: Translator.get('categorias', 'Categorias'),
            visible: 1,
            action: () => {
              this.props.showModalOTTCategoryAction();
            }
          },
          {
            title: Translator.get('buscar', 'Buscar'),
            visible: 1,
            action: () => {
              this.props.modalOttOpenSearchAction();
            }
          },
          {
            title: Translator.get('go_to_menu', 'Ir al menú'),
            visible: 1,
            action: () => {
              this.props.showModalOTTGoToMenuAction();
            }
          }]
      }
    }));
  }

  handleDelayKeyOk(e, key, cb) {
    console.log(
      "[EpgLogic] handleDelayKey",
      this.isKeysBloqued,
      e.keyCode,
      key
    );
    if (this.lastKey !== key && this.pressTimer) {
      clearTimeout(this.pressTimer);
    }

    this.isKeysBloqued = !!(this.lastKey === key && this.pressTimer);
    this.lastKey = key;
    if (this.isKeysBloqued) {
      e.stopPropagation();
      e.preventDefault();
      if ('function'=== typeof cb)
        cb();
    } else {
      this.pressTimer = setTimeout(this.resetTimer, this.delayKeyTime);
    }
  }

  handleKeyPress=(e)=>{
    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    // console.log('[GRID] Listening Grid, currentKey:',currentKey);
    switch (currentKey) {
      case  'OK':
        if(!this.handleDelayKeyOkTimer && LocalStorage.getItem('config_remote_control')==='simple'){
          this.handleDelayKeyOk(e, currentKey,this.showModalOTT);
        }
        break;
      case 'BLUE':
        e.preventDefault();
        e.stopPropagation();
        this.handlePlay(this.isTrailer);
        break;
      case 'GREEN':
        e.preventDefault();
        e.stopPropagation();
        this.showLanguages(this.languages);
        break;
      case 'YELLOW':
        e.preventDefault();
        e.stopPropagation();
        if(!this.state.visible) this.action(e);
        break;
      default:
        break;
    }
  }

  componentDidMount() {
    this.lastUp === 0;
    this.channelsWrapper.addEventListener('keydown', this.handleKeyPress);
    this.firstLoad();
    let url = this.props.state.url.showUrlProps;
    let menu = this.props.state.menu.showMenuProps;
    let data = null;
    let info = "";
     // subtitle the movies

   if (url.includes("_")) {
      if (typeof menu === "object") {
       data = menu.filter(e => {
            if(e.childs !== undefined && typeof e.childs === "object"){
                return e.childs
            } else {
              return false
            }
        })
       if (typeof data === "object") {
       if (data[0].childs !== undefined && typeof data[0].childs === "object") {
        info = data[0].childs.map(e => {
          if (`/node/${e.code}` === url) {
               return e.text;
          }
          else {
            return ""
          }
     });
    }
  }
  }
       this.title = info;
    }
}

  componentWillUnmount(){
    this.channelsWrapper.removeEventListener('keydown', this.handleKeyPress);
    LayersControl.showMenu()
  }

  componentWillReceiveProps(newProps) {
    this.lastUp = 0;
    this.firstCardId=null;
    this.uri = newProps.request.uri;
    this.firstLoad(newProps.request.params);
  }

  componentDidUpdate(prevProps, prevState) {

       console.log('[GRID] -- CHANNELS\n',prevState.channels,'\n',this.state.channels);

       if (prevState.channels && prevState.channels[1] && prevState.channels[1][0] && prevState.channels[1][0].id &&
        this.state.channels && this.state.channels[0] && this.state.channels[0][0] && this.state.channels[0][0].id) {

        const prevSecondRowFirsElement = prevState.channels[1][0].id;
        const nowFirstRowFirstElement = this.state.channels[0][0].id;

           //console.log('>>> movimiento hacia abajo');
           //Verificando que no sea la ultima fila
           if(this.state.channels[1]){
            // console.log("resolviendo esto",this.state.channels[1], this.state.channels[1].length,this.totalChannels, this.lastElement)
             //Si la lista infinita no tiene los 4 elementos
            if(this.state.channels[1].length<this.totalChannels){
              //Toma el ultimo valor del card, hacemos focus en el elemento
              window.SpatialNavigation.focus(`.channels-container a[data-counter="${this.lastElement}"]`);
            }else{
              //Si la lista infinita tiene los 4 elementos
              this.focusHandler(this.state.channels[1][this.getColumn(this.lastElement)]);
            }
           }else{
            //Cuando es la ultima fila
            window.SpatialNavigation.focus(`.channels-container a[data-counter="${this.lastElement}"]`);
           }
           return;

    }

    if (prevState.channels && prevState.channels[0] && prevState.channels[0][0] && prevState.channels[0][0].id &&
        this.state.channels && this.state.channels[1] && this.state.channels[1][0] && this.state.channels[1][0].id) {

        const nowSecondRowFirstElement = this.state.channels[1][0].id;
        const prevFirstRowFirsElement = prevState.channels[0][0].id;

         if (nowSecondRowFirstElement === prevFirstRowFirsElement) {
           //console.log('>>> movimiento hacia arriba');
           this.focusHandler(this.state.channels[0][this.getColumn(this.lastElement)]);
           return;
        }
    }


    if (this.lastDirection === 'down' && this.state.channels[1] && this.state.channels[1][this.getColumn(this.lastElement)]) {
        //console.log('>>>>> DOWN this.state.channels[1][col]', this.state.channels[1][this.getColumn(this.lastElement)].title);
        this.focusHandler(this.state.channels[1][this.getColumn(this.lastElement)]);
      } else
      if (this.lastDirection === 'up' && this.state.channels[0] && this.state.channels[0][0]) {
          //console.log('>>>>> UP this.state.channels[0][col]', this.state.channels[0][0].title);
          this.focusHandler(this.state.channels[0][0]);
      }


    window.SpatialNavigation.makeFocusable();
  }

  getColumn(numElement) {

    const numColsXRow = this.props.cols;

    let col = 0;
    let colFactor = (parseInt(numElement, 10) / numColsXRow).toFixed(2).split(".")[1];

    switch (colFactor) {
      case '00':
        col = 0;
        break;
      case '25':
        col = 1;
        break;
      case '50':
        col = 2;
        break;
      case '75':
        col = 3;
        break;
      default:
    }

    return col;
  }

  resetProps() {
    this.currentUpPage = 1;
    this.currentDownPage = -1;

    this.channels = {
      up: [],
      middle: [],
      down: []
    };

    this.setState({ channels: this.channels.middle });
  }

  getDirection(event) {
    return (!event.detail || !event.detail.direction)
      ? null
      : event.detail.direction.toUpperCase();
  }

  firstLoad(params = {}) {
    if (window.location.href.includes("/node/tv")) {
      LayersControl.hideMenu()
    }

    this.resetProps();
    let quantity = this.lastDown = this.quantity;
    console.log("contenidos lastDown",this.lastDown)
    console.log("request 2 element quantity",this.quantity)
    // this.request(Object.assign({}, params, { quantity ,from: 0, order_id: 800, quantity: 200 }), (data) => {
    let order_id = {}
    if (window.location.href.includes("/node/tv")) {
      order_id = { order_id: 800 }
    }

    this.request(Object.assign({}, params, { quantity ,from: 0, ...order_id }), (data) => {
      console.log('contenidos 1 ', data)
      console.log('OK veamos la famosa data: ', this.uri)
      let channels = this.channels.middle = this.createGrid(data);
      console.log("OK veamos ", channels)
            if (this.isInfiniteList()) {
              channels = this.setLastRowNonFocusable(channels);
            }
            this.totalChannels=channels[0]?(channels[0].length):4;
            this.setState({ channels });
            this.flagFirstLoad = true;
            setTimeout(() => {
              window.SpatialNavigation.focus('.channels-container .focusable');
            }, 1000);
    });
  }

  request(params, callback) {
    if (this.uri === undefined || this.uri === '') {
      return;
    }

    const newParams = Object.assign({}, this.props.request.params, params);

    try {
      console.log('[EPG] -- GRID/index/request ',this.uri,newParams);
      if(this.uri==='/services/content/list'){
        newParams.tenant_code='netnow'; // GOOSE -- HACK -- EPG -- tenant_code
      }
      const task = new ListTask(this.uri, newParams);
      const promise = RequestManager.addRequest(task);

      promise.then((response) => {
        if (parseInt(response.status) !== 1) {
          // Se necesita delimitar el máximo de elementos que hay en esa categoría y bloquear las peticiones cuando tienda a ese número.
          this.totalCategory = response.response.total;
          let groups = Parser.parserList(response);
          callback(groups);
        }
      });
    } catch (e) {
      console.error('error getting List Task', e);
    }
  }

  createGrid(data) {
    let grid = [];

    // ordena por numero de canal
    // data.sort((a, b) => {
    //   if (Number(a.channel_number) > Number(b.channel_number) ) {
    //     return 1;
    //   }
    //   if (Number(b.channel_number) > Number(a.channel_number) ) {
    //     return -1;
    //   }
    //   return 0;
    // });

    this.allItems = data

    if (data.length > this.itemsByRow) {
      for (let i = 0; i < data.length; i += this.itemsByRow) {
        grid.push(data.slice(i , i + this.itemsByRow));
      }
    } else if (data.length) {
      grid = [ data ];
    }
    //console.log("info datos correct", grid)
    return grid;
  }

  onFocusDownHandler(event) {
    //console.log("request 2 Hola")
    //console.log("request 2 event", event)
    this.lastDirection = event.detail.direction;
    //console.log("request 2 lastDirection", this.lastDirection)
    if(this.getDirection(event) !== this.DOWN) return
    let quantity = this.quantity;/*
    console.log("request 2 quantity",quantity)
    console.log("request 2 lastDown y itemsByRow",this.lastDown,this.itemsByRow)
    console.log("request 2 totalCategory", this.totalCategory) */
    if(this.lastDown - this.itemsByRow  < this.totalCategory){
      event.stopPropagation(); // HACK -- goose -- cuando me voy por abajo, cargo nuevo pero no me voy al vertical Menu
      event.preventDefault(); // HACK -- goose -- cuando me voy por abajo, cargo nuevo pero no me voy al vertical Menu
      console.log("info lastDown, itemsByRow ", this.lastDown, this.itemsByRow)
      //this.request(Object.assign({}, { quantity ,from: this.lastDown - this.itemsByRow }), (payload) => { // goose -- comentado
      let order_id = {}
      if (window.location.href.includes("/node/tv")) {
        order_id = { order_id: 800 }
      }

      this.request(Object.assign({}, { quantity ,from: this.lastUp + this.itemsByRow, ...order_id }), (payload) => { // goose -- me baso en el de arriba
          /*  payload.map((channel, channelIndex) => {
          if( this.counter < this.totalCategory ){ // Si el contador es mayor que el número de contenido deja de summarle
            this.counter++;
            channel.positionInfinite = this.counter;
            channel.focusable = true;
          }
        });*/
        console.log("resolucion", payload.length)
        let payloadArray;
        // if (payload.length > 15) {
          payloadArray = this.createGrid(payload)
        // }

        this.lastUp =this.lastUp + this.itemsByRow  //this.channels.middle[0][0].positionInfinite; // porque a partir de esta posicion vamos a pedir los elementos
        const lastUpError = this.lastUp === -4 ? 0 : this.lastUp;
        this.lastUp = lastUpError;
        let algo = this.channels.middle.slice(4,10);
        let concatenado = algo.concat(payloadArray);
        this.lastDown = this.lastDown + this.itemsByRow;
        // if (payload.length > 15) {
        this.channels.middle = this.setLastRowNonFocusable(concatenado);
        // }
        console.log("jose result channels", this.channels.middle)
        this.setState({ channels: this.channels.middle });
      });
    }

  }

  onFocusUpHandler(event) {
    this.lastDirection = event.detail.direction;
    if(this.getDirection(event) !== this.UP) return

    let quantity = this.quantity;
   /* let counter = this.lastUp;*/
    if(this.lastUp >0) {
    let order_id = {}
    if (window.location.href.includes("/node/tv")) {
      order_id = { order_id: 800 }
    }

    this.request(Object.assign({}, { quantity ,from: this.lastUp - this.itemsByRow, ...order_id }), (payload) => {

    //console.log('payload response en UP: ', payload); // Aquí tal vez rompa
    //console.log('contenidos 3 ', payload);


    let payloadArray = [ ...this.createGrid(payload) ];
    let finalArray = [ ...this.channels.middle.slice(4,10) ];
    //console.log('Arreglo concatenado super mil ochomil final ',finalArray)
    payloadArray = [ ...payloadArray, ...finalArray];
    //console.log('Arreglo concatenado super mil ochomil final payload', payloadArray);
    // if (payload.length > 15) {
    this.channels.middle = this.setLastRowNonFocusable(payloadArray);
    // }
    this.lastUp= this.lastUp - this.itemsByRow;
    this.lastDown= this.lastDown - this.itemsByRow

        this.setState({ channels: this.channels.middle });
        window.SpatialNavigation.focus(`.channels-container a[data-counter="${this.ch}"]`);
      });
    }

  }

  setFocusUp(element) {
    if (this.firstCardId === null) {
      this.firstCardId = document.querySelectorAll(`.${this.rootClass} ${focusSetting.selector}`);
      this.firstCardId =[...this.firstCardId];
      if (this.firstCardId) {
        this.firstCardId=this.firstCardId.filter((x,i)=>i<this.props.cols).map(x=>x.getAttribute('id'));
        /*this.firstCardId = this.firstCardId.getAttribute('id');*/
      }
    }

    const link = element.querySelector(`${focusSetting.selector}`);
    const linkPrevious = parseInt(link.dataset.counter, 10) - this.totalChannels < 1 ? 0 : parseInt(link.dataset.counter, 10) - this.totalChannels;
    this.ch=linkPrevious;

    if (this.firstCardId.indexOf(element.querySelector(`${focusSetting.selector}`).getAttribute('id'))!==-1) {
      link.removeAttribute('data-sn-up');
    }else{
      link.setAttribute('data-sn-up', `.channels-container a[data-counter="${linkPrevious}"]`);
    }

  }

  // Metodos para Listado Infinito.
  getType() {
    switch (this.gridType) {
      case this.typeEnum.Infinite:
        return window.location.href.includes("/node/tv") ? 'channel' : 'infinite';
      default:
        return 'channel';
    }
  }

  isInfiniteList() {
    return (this.gridType === this.typeEnum.Infinite);
  }

  setLastRowNonFocusable(channels) {
    for (let i = 0; i < channels.length; i++) {
      const isFocusable = i === 4 ? false: true; // HARDCODE -- goose -- cantidad de renglones
      channels[i].map(e => {
        e.focusable = isFocusable;
        return e;
      });
    }

    return channels;
  }

  setLastRowFocusable(channels) {
    channels.map((row, index, array) => {
      if (index === array.length - 1) {
        row.map(e => {
          e.focusable = true;
          return e;
        });
      }

      return row;
    });

    return channels;
  }

  onFocusMiddleHandler(element) {

    /*let parentBottom = document.querySelector('div.channels-row:first-of-type').getBoundingClientRect().top;
    let lastChildTop = document.querySelector('div.channels-row:last-of-type').getBoundingClientRect().bottom;
    if (lastChildTop > parentBottom) {*/


        this.lastElement = element.target.getAttribute('data-counter');
        console.log("Principio el contenido", this.lastElement)
        console.log("Principio el contenido lastElement ,lastDown  itemsByRow y lastUp", this.lastElement,this.lastDown, this.itemsByRow, this.lastUp)
      if(element.target.getAttribute('data-counter')>=(this.lastDown - this.itemsByRow) && element.target.getAttribute('data-counter')<=(this.lastDown-1)) {
        console.log("Principio el contenido 2 lastDown", this.lastDown-1)
        this.onFocusDownHandler(element)
    } else if(element.target.getAttribute('data-counter')>=this.lastUp && element.target.getAttribute('data-counter')<=this.lastUp + (this.itemsByRow - 1 )) {
      console.log("Principio el contenido 3 itemsByRow", this.itemsByRow - 1)
      this.onFocusUpHandler(element);
    }

  }

  willUnfocusMiddleHandler(element) {
      if (element) {
        element.addEventListener('sn:willmove', this.onFocusMiddleHandler);
        if(element.firstElementChild.firstElementChild.getAttribute('data-counter')>=this.lastUp && element.firstElementChild.firstElementChild.getAttribute('data-counter')<=this.lastUp+(this.totalChannels-1)) {
          element.addEventListener('sn:focused', () => {this.setFocusUp(element)})
        }
      }
  }

  focusHandler(data) {
    console.log('Entramos al handler', data);// Siempre va a entrar aqui
    if(data.id)
      data.group_id=data.id;
    if (typeof this.props.focusHandler === 'function') {
      this.props.focusHandler(data);
    }
  }

  getPosition(id){
    for (let i=0; i < this.allItems.length; i++) {
      if (this.allItems[i].id === id) {
        return i
      }
    }
  }

  counterRecover(contador){
    this.counter = contador;
  }

  buttonBack = () => {
    if (window.location.href.includes("/node/tv")) {
      return (<div onClick={() => { LayersControl.showPlayer()}}>
        <img className="image-back focusable" src={`${Asset.get("player_controls_back_icon")}`} alt="back"/>
      </div>)
    }
  }

  render() {
    this.markupArray = [ ...this.state.channels ];
      return (
        <div className={`channels-wrapper-subnivel ${this.props.className} fromVMenu`} ref={(div) => this.channelsWrapper = div} style={{width: this.props.width}}>
        <h1 className="submenu">{window.location.href.includes("/node/tv") ? null :  this.title}</h1>
        <div className={this.rootClass}>
          { window.location.href.includes("/node/tv") &&
           this.buttonBack()
          }
          { this.markupArray.map((row, rowIndex) => {
            return (
              <div key={ rowIndex } className="channels-row">
                { row.map((channel, channelIndex) => {
                    const willUnfocusHandler = this.willUnfocusMiddleHandler;
                    const badges = getBadges(this.props.user, channel.proveedor_name, channel.format_types, channel.live_enabled);
                    // Evita que los focos vallan hacia la izquierda o hacia la derecha.
                    const focusLeft = channelIndex === 0 ? null : null;
                    const focusRight = channelIndex === this.props.cols ? `#link-${channel.id}` : null;

                    let FuncResponse = () => {}
                    let OnClick = window.location.href.includes("/node/tv") ? false : FuncResponse
                    return (
                      <ItemCard
                        channelNumber={channel && channel.channel_number}
                        typeRender={this.gridType === this.typeEnum.Channel ? 'a' : 'Link'}
                        key={ channelIndex }
                        index={ channelIndex }
                        cover={ channel.image_small }
                        group_id={ channel.group_id || channel.id }
                        title={ channel.title }
                        label= {channel.label}
                        sibling={channel.sibling}
                        hideInnerTitle={channel.hideInnerTitle ? true : false}
                        type={this.getType()}
                        focusable={channel.focusable}
                        badgesHtml={ badges }
                        // Estas propiedades las requiere InfiniteList
                        id={channel.group_id ? channel.group_id : (channel.id ? channel.id : null)}
                        positionInfinite = { this.lastUp + channelIndex +(this.itemsByRow * rowIndex) } // Está prop me permite hacer pop() y unshift() de los elemnetos del grid.
                        focusRight={focusRight}
                        focusLeft={focusLeft}
                        data={channel}
                        clickHandler={() => console.log('==> Este evento es solo para que pase el flujo en CARD')}
                        onClickCb={OnClick}
                        focusHandler={this.focusHandler}
                        onLoadHandler={ willUnfocusHandler }
                        setMetricsEvent={this.props.setMetricsEvent}
                        dataMetric={{cardPosition:this.getPosition(channel.id)}}
                      />
                    )
                  })
                }
              </div>
            )})
          }
        </div>
      </div>
    )
  }
}

/**
 * @type {{request: {uri: *, params: *}, gridType: shim, rows: shim, cols: shim}}
 */
Grid.propTypes = {
  user: PropTypes.object,
  request: PropTypes.object.isRequired,
  gridType: PropTypes.number,
  rows: PropTypes.number,
  cols: PropTypes.number,
  focusHandler: PropTypes.func,
  keyUpHandler: PropTypes.func,
  className: PropTypes
};

Grid.defaultProps = {
  user: null,
  gridType: 1,
  rows: 3,
  cols: 5,
  className: null,
  focusHandler: () => { },
  keyUpHandler: () => { },
};

export default Grid;
