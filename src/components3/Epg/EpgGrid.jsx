import './styles/epgGrid.css';
import focusSetting from './../Focus/settings';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RequestManager from './../../requests/RequestManager';
import LevelRibbonTask from "../../requests/tasks/cms/LevelRibbonTask";
import Card from './../Card';
import Parser from "../../utils/Parser";
import getBadges from './../../utils/Badges';
import Device from "../../devices/device";
import settings from './../../devices/all/settings';
import { playFullMedia } from '../../actions/playmedia';
import { AAFPLAYER_PLAY } from '../../AAFPlayer/constants';
import store from '../../store';
import LayersControl from "../../utils/LayersControl";
import LocalStorage from "../DeviceStorage/LocalStorage";
import Translator from "../../requests/apa/Translator";
import {MODAL_EPG, showModal} from "../../actions/modal";

class Grid extends Component {
  constructor(props) {
    super(props);
    
    this.typeEnum = Object.freeze({
      Channel: 0,
      Infinite: 1,
    });
    this.ch=0;
    this.totalChannels=0;

    //Parametros para nuevas llamadas
    this.channelsArray=null;
    this.from=0;
    this.segmentChannels=null;
    
    
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

    this.quantity = props.cols * 2;
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
    console.log('Listening Grid, currentKey:',currentKey);
    switch (currentKey) {
      case  'OK':
        if(!this.handleDelayKeyOkTimer && LocalStorage.getItem('config_remote_control')==='simple'){
          this.handleDelayKeyOk(e, currentKey,this.showModalOTT);
        }
        break;
      case 'BLUE':
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'GREEN':
        e.preventDefault();
        e.stopPropagation();
        this.props.greenHandler();
        break;
      case 'YELLOW':
        e.preventDefault();
        e.stopPropagation();
        this.props.yellowHandler();
        break;
      default:
        break;
    }
  }

  componentDidMount() {
    this.channelsWrapper.addEventListener('keydown', this.handleKeyPress);
    this.firstLoad();
  }

  componentWillUnmount(){
    this.channelsWrapper.removeEventListener('keydown', this.handleKeyPress);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.request.params.node_id !== newProps.request.params.node_id) {
      this.firstLoad(newProps.request.params);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    
       if (prevState.channels && prevState.channels[1] && prevState.channels[1][0] && prevState.channels[1][0].id &&
        this.state.channels && this.state.channels[0] && this.state.channels[0][0] && this.state.channels[0][0].id) {
          //console.log("gustavo",this.state.channels)
       
        const prevSecondRowFirsElement = prevState.channels[1][0].id;
        const nowFirstRowFirstElement = this.state.channels[0][0].id;

           //console.log('>>> movimiento hacia abajo');
           //Verificando que no sea la ultima fila
           if(this.state.channels[1]){
             console.log("contenido",this.state.channels[1])
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
    this.resetProps();
    let quantity = this.quantity;
    this.from=0;
    this.lastUp= 0;
    this.lastDown= this.quantity;
    this.channelsArray=null;
    this.segmentChannels=null;


    this.request(Object.assign({}, params, { quantity ,from: this.from }), (data) => {
      //Guardadndo la primera llamada con la lista de canales
      this.channelsArray=data;
      //Segmentado los canales a partir de un indice y la cantidad de canales a mostrar
      // console.log('[epgGRID]- FIRST LOAD - quantity:',this.quantity);
      // console.log('[epgGRID]- FIRST LOAD - from',this.from);
      // console.log('[epgGRID]- FIRST LOAD - channels:',this.channelsArray);
      this.segmentChannels=this.segmentGrid(this.quantity,this.channelsArray,this.from);
      let channels = this.channels.middle = this.createGrid(this.segmentChannels);
            if (this.isInfiniteList()) {
              channels = this.setLastRowNonFocusable(channels);
            }
            this.totalChannels=channels[0]?(channels[0].length):4;
            this.setState({ channels });
            this.flagFirstLoad = true;
            //setTimeout(() => {
              window.SpatialNavigation.focus('.channels-container .focusable');
            //}, 1000);
    });
  }


  request(params, callback) {
    if (this.uri === undefined || this.uri === '') {
      return;
    }

    const newParams = Object.assign({}, this.props.request.params, params);

    try {
      const task = new LevelRibbonTask(this.uri, newParams);
      
      const promise = RequestManager.addRequest(task);

      promise.then((response) => {
        if (parseInt(response.status) !== 1) {
        // console.log('[epgGRID]-Response',response.response.components[0].items);

          // Se necesita delimitar el máximo de elementos que hay en esa categoría y bloquear las peticiones cuando tienda a ese número.
          this.totalCategory = response.response.components[0].items.length;
          console.log(' TOTAL CATEGORY: ', this.totalCategory );
          let groups = response.response.components[0].items;
          callback(groups);
        }
      });
    } catch (e) {
      console.error('error getting List Task', e);
    }
  }

  segmentGrid(total,array,index=0){
    // console.log('[epgGRID]-SEGMENTANDO-cantidad',total);
    // console.log('[epgGRID]-SEGMENTANDO-index',index);
    // console.log('[epgGRID]-SEGMENTANDO-array',array);
    //OBTENIENDO EL INDICE DESDE DONDE COMENZARA
    let result=array.slice(index,total+index);
    return result;
  }

  createGrid(data) {
    let grid = [];
    let flag=false;
    if (data.length > this.itemsByRow) {
      for (let i = 0, row = data.length; i < row; i += this.itemsByRow) {
        let aRow=data.slice(i , i + this.itemsByRow).map((item)=>item.id);
        if(this.allItems.length!==0){
          this.allItems.forEach((item)=>{
            for(let j=0;j<aRow.length; j++){
              if(item===aRow[j]){
                flag=true;
              }
            }
          });
          if(!flag){
            this.allItems.push(...aRow);
            flag=false;
          }
        }else this.allItems.push(...aRow);
        grid.push(data.slice(i , i + this.itemsByRow));
      }
    } else if (data.length) {
      grid = [ data ];
    }
    return grid;
  }

  onFocusDownHandler(event) {
    this.lastDirection = event.detail.direction;

    if(this.getDirection(event) !== this.DOWN) return
    this.from=this.lastDown - this.itemsByRow;

    if(this.lastDown - this.itemsByRow  < this.totalCategory){
      // console.log('[epgGRID]-DOWN-bajando',this.channelsArray);
      // console.log('[epgGRID]-DOWN-quantity',this.quantity);
      // console.log('[epgGRID]-DOWN-from',this.from);

      //Obteniendo los nuevos canales.
      this.segmentChannels=this.segmentGrid(this.quantity,this.channelsArray,this.from);
      let payloadArray = this.createGrid(this.segmentChannels)
      this.lastUp =this.lastUp + this.itemsByRow  //this.channels.middle[0][0].positionInfinite; // porque a partir de esta posicion vamos a pedir los elementos
      let algo = this.channels.middle.slice(3,10);
      let concatenado = algo.concat(payloadArray);
      this.lastDown = this.lastDown + this.itemsByRow;
      this.channels.middle = this.setLastRowNonFocusable(concatenado);
      this.setState({ channels: this.channels.middle });
    }

  }

  onFocusUpHandler(event) {
    this.lastDirection = event.detail.direction;
    if(this.getDirection(event) !== this.UP) return
   /* let counter = this.lastUp;*/
    if(this.lastUp >0){
      this.from=this.lastUp - this.itemsByRow;
      this.segmentChannels=this.segmentGrid(this.quantity,this.channelsArray,this.from);
      let payloadArray = [ ...this.createGrid(this.segmentChannels) ];
      let finalArray = [ ...this.channels.middle.slice(3,10) ];
      console.log('Arreglo concatenado super mil ochomil final ',finalArray)
      payloadArray = [ ...payloadArray, ...finalArray];
      console.log('Arreglo concatenado super mil ochomil final payload', payloadArray);
  
      this.channels.middle = this.setLastRowNonFocusable(payloadArray);
      this.lastUp= this.lastUp - this.itemsByRow;
      this.lastDown= this.lastDown - this.itemsByRow
  
      this.setState({ channels: this.channels.middle });

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
      if(this.lastUp >0){
        link.setAttribute('data-sn-up', `a[data-counter="${linkPrevious}"]`);
      }
    }
  }

  // Metodos para Listado Infinito.
  getType() {
    switch (this.gridType) {
      case this.typeEnum.Infinite:
        return 'infinite';
      default:
        return 'channel';
    }
  }

  isInfiniteList() {
    return (this.gridType === this.typeEnum.Infinite);
  }

  setLastRowNonFocusable(channels) {
    for (let i = 0; i < channels.length; i++) {
      const isFocusable = i === 2 ? false: true;
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
        console.log('11 Last Up',this.lastUp);
        console.log('11 element coutn',element.target.getAttribute('data-counter'));
        console.log('11 Last Down',this.lastDown);
        this.lastElement = element.target.getAttribute('data-counter');
        var xx=element.target.getAttribute('data-counter')>=(this.lastDown - this.itemsByRow);
      if(element.target.getAttribute('data-counter')>=(this.lastDown - this.itemsByRow) && element.target.getAttribute('data-counter')<=(this.lastDown-1)) {
        this.onFocusDownHandler(element)
    } else if(element.target.getAttribute('data-counter')>=this.lastUp && element.target.getAttribute('data-counter')<=this.lastUp + (this.itemsByRow )) {
        if(this.lastUp>0){
          this.onFocusUpHandler(element);
        }
    }

  }

  willUnfocusMiddleHandler(element) {
      if (element) {
        element.addEventListener('sn:willmove', this.onFocusMiddleHandler);

        if(element.firstElementChild.firstElementChild.getAttribute('data-counter')>=this.lastUp
        && element.firstElementChild.firstElementChild.getAttribute('data-counter')<=this.lastUp+(this.totalChannels)) {
          element.addEventListener('sn:focused', () => {this.setFocusUp(element)})
        }
      }
  }

  focusHandler(data) {
    console.log('Entramos al handler', data);// Siempre va a entrar aqui
    if (typeof this.props.focusHandler === 'function') {
      this.props.focusHandler(data);
    }
  }

  getPosition(id){
    for(let i=0; i<this.allItems.length;i++){
      if(this.allItems[i]===id)
        return i
    }
  }

  counterRecover(contador){
    this.counter = contador;
    console.log('Mandame el contador profa', this.counter);
  }

  render() {
    this.markupArray = [ ...this.state.channels ];
      console.log('markupArray: ', this.markupArray);
      let flag = this.flagFirstLoad;

    return (
        <div className="channels-wrapper" ref={(div) => this.channelsWrapper = div} /* style={{width: this.props.width}} */>
        <div className={this.rootClass}>
          { this.markupArray.map((row, rowIndex) => {
            console.log('RowIndex', row );

            return (
              <div key={ rowIndex } className="channels-row">
                { row.map((channel, channelIndex) => {

                  let willUnfocusHandler = () => {
                  };

                  if(1){
                    willUnfocusHandler = this.willUnfocusMiddleHandler;
                  }

                  const badges = getBadges(this.props.user, channel.proveedor_name, channel.format_types, channel.live_enabled);
                  // Evita que los focos vallan hacia la izquierda o hacia la derecha.
                  const focusLeft = channelIndex === 0 ? `#link-${channel.id}`: null;
                  const focusRight = channelIndex === this.props.cols ? `#link-${channel.id}` : null;



                  return <Card
                    typeRender={this.gridType === this.typeEnum.Channel ? 'a' : 'Link'}
                    key={ channelIndex }
                    index={ channelIndex }
                    cover={ channel.image_small }
                    group_id={ channel.group_id }
                    title={ channel.title }
                    label= {channel.label}
                    sibling={channel.sibling}
                    hideInnerTitle={channel.hideInnerTitle ? true : false}
                    type={this.getType()}
                    focusable={channel.focusable}
                    badgesHtml={ badges }
                    // Estas propiedades las requiere InfiniteList
                    id={channel.id ? channel.id : null}
                    positionInfinite = { this.lastUp + channelIndex +(this.itemsByRow * rowIndex) } // Está prop me permite hacer pop() y unshift() de los elemnetos del grid.
                    focusRight={focusRight}
                    focusLeft={focusLeft}
                    data={channel}
                    clickHandler={() => console.log('==> Este evento es solo para que pase el flujo en CARD')}
                    onClickCb={e => {

                      if (this.props.onHide) {
                        this.props.onHide(channel.group_id,channel);
                      }

                    }}
                    focusHandler={this.focusHandler}
                    onLoadHandler={ willUnfocusHandler }
                    setMetricsEvent={this.props.setMetricsEvent}
                    dataMetric={{cardPosition:this.getPosition(channel.id)}}/>
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
  keyUpHandler: PropTypes.func
};

Grid.defaultProps = {
  user: null,
  gridType: 1,
  rows: 3,
  cols: 5,
  focusHandler: () => { },
  keyUpHandler: () => { },
};

export default Grid;
