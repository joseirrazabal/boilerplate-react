//import './header.css'
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import Assets from './../../requests/apa/Asset';
import Translator from './../../requests/apa/Translator';
import Metadata from '../../requests/apa/Metadata';
import Clock from '../Clock'
import focusSettings from './../Focus/settings';
import SocialAvatar from '../Social/SocialAvatar';
import { connect } from 'react-redux';
import { showModal, MODAL_PROFILE, MODAL_KEYBOARD } from '../../actions/modal';
import CCOM from '../../devices/nagra/CCOM';
import PropTypes from "prop-types";
import Utils from '../../utils/Utils';
import {setMetricsEvent} from "../../actions/metrics";
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import clarotv_logo from './clarotv.png'

//IP TELMEX 2
import UtilsIpTelmex from '../../utils/user/IpTelmex';
import ActivesSingleton from './ActivesSingleton';
import AnalyticsDimensionSingleton from './AnalyticsDimensionSingleton';
import Device from "../../devices/device";
import LayersControl from "../../utils/LayersControl";

import ConfigSession from './../ConfigSession';
import { login } from '../../requests/loader';
import { fetchLinealChannels } from '../../actions/payway';
import { receiveIsLoggedIn } from '../../reducers/user';
import AAFPlayer from '../../AAFPlayer/AAFPlayer';
import { playFullMedia } from '../../actions/playmedia';
import store from '../../store';

import {
  AAFPLAYER_STOP,
  AAFPLAYER_PLAY,
} from '../../AAFPlayer/constants';

const config_remote_control = (DeviceStorage.getItem('config_remote_control') !== 'simple') ? true : false ;

class Header extends Component {

  static propTypes = {
    user: PropTypes.object.isRequired,
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    initialRoute: PropTypes.string.isRequired,
  };

  static defaultProps = {
    user: {},
    nodes: [],
    initialRoute: "home", // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
  };

  constructor(props) {
    super(props);

    this.keys = Device.getDevice().getKeys();

    this.tree = [];
    this.lastTree = [];
    this.current = {}; // current selected node
    this.actives = []; // ids of selected elements for tracking parents of last node selected

    this.state = {
      top: [],
      down: [],
      count_unread: 0,
    };

    this.headerContainerRef = null;
    this.CCOM = CCOM;
    this.allNodes = this.getAllNodes(this.props.nodes);
    let navcodes = this.allNodes.map(x => x.code);
    new ActivesSingleton().setNav(navcodes);
    this.setSelected = this.setSelected.bind(this);
    this.handleFocusMove = this.handleFocusMove.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.refreshSession = this.refreshSession.bind(this);
    this.parseRefreshSession = this.parseRefreshSession.bind(this);
    this.goPerfil = this.goPerfil.bind(this);

    this.isANode=this.isANode.bind(this);
    this.getNextHeadersState=this.getNextHeadersState.bind(this);
    this.getActiveGA=this.getActiveGA.bind(this);
    this.isVcard=this.isVcard.bind(this);
    this.isMusicNode=this.isMusicNode.bind(this);

    this.musicFlag = null;
    this.homeFlag = null;
    this.musicContent;
    this.homeContent;
    this.counter=0;

    this.mapa={};

    if (this.props.nodes) {
        if (Array.isArray(this.props.nodes)) {
            this.props.nodes.map((it) => {
                if (it.code === 'claromusica') {
                    this.musicContent = it.childs;
                }

                if(it.code === 'clarotv') {
                    this.homeContent = it.childs;
                }

            });
        }
    }

    // this variable allows to the view render the claromusica node
    this.user
    this.oldNode=null;

    this.menuOnFocusPosition = 0;
    this.menuOnFocusLastPosition = 0;
    this.menuOnBlur = null;
    this.menuWidth = 0;
  }

  getAllNodes(nodes) {
    let allNodes = [];
    nodes.forEach(node => {
      allNodes.push(node);
      if (node.childs && node.childs.length > 0) {
        const childs = this.getAllNodes(node.childs);
        allNodes = [...allNodes, ...childs];
      }
    }, this);
    return allNodes;
  }

  componentWillMount() {
    this.user = this.props.user;

      //Extraer todos los nodos del nav
    let recur= (nodes,parent='__root')=>{
     nodes.map(x=>{this.mapa[x.code]={childs:x.childs?x.childs:null,parent,  text:x.text}; if(x.childs){recur(x.childs,x.code)}})
    }
    recur(this.props.nodes)
    let node=this.isANode()
    this.getNextHeadersState(node);
  }

  componentDidMount() {

    //Listen email
    if (this.CCOM && this.CCOM.ConditionalAccess && this.CCOM.ConditionalAccess.addEventListener) {
      CCOM.ConditionalAccess.addEventListener("onIrdMailNew", this.onSomeEvent);
    }

    this.addEventListeners();

    this.activeSubmenuSlider();
    
  }
  
  componentDidUpdate(){
    
    clearTimeout(this.menuOnBlur);
    
    this.activeSubmenuSlider();
    
  }
  
  activeSubmenuSlider = () => {
    
    this.menuWidth = 0;
    this.menuOnFocusPosition = 0;
    // this.menuOnFocusLastPosition = 0;

    const container = document.getElementById("header-down");
    if(container && container.firstChild){
      const menuList = container.firstChild.firstChild;
      menuList.style.marginLeft = "0px";
  
      [...menuList.querySelectorAll("li")].map( item => {
        item.setAttribute("data-marginLeft", this.menuWidth);
        this.menuWidth += item.getBoundingClientRect().width;
      });
  
      console.log("Debug== this.menuWidth", this.menuWidth);
  
      if(this.menuWidth > 1280){
        console.log("Debug== if");
        menuList.style.width = `${this.menuWidth}px`;
      } else {
        console.log("Debug== else");
        menuList.style.width = '100%';
      }
    }
  }


  getNextHeadersState(node,targetFocus){

    let forTop=[];
    let forDown=[];
    if(this.mapa && node && this.mapa[node])
    {
      if(this.mapa[node].childs)//tiene hijos
      {

        if(this.mapa[node].parent==='__root' || !this.mapa[node].parent) //es primer nivel
        {
          forTop=this.props.nodes;
          forDown=this.mapa[node].childs
        }
        else      /// tiene nodos padre
        {
          forTop=this.mapa[this.mapa[node].parent].childs;
            forDown=this.mapa[node].childs
        }

      }
      else //no tiene hijos
      {
        if(this.mapa[node].parent==='__root') //es primer nivel
        {
          forTop=[];
            forDown=this.props.nodes;

        }
        else      /// tiene nodos padre
        {

          forTop=this.mapa[this.mapa[node].parent].parent=='__root'?this.props.nodes: this.mapa[this.mapa[this.mapa[node].parent].parent].childs;
          forDown=this.mapa[this.mapa[node].parent].childs
        }
      }
    }
    else{
      forTop=[];
      forDown=this.props.nodes;
    }
    forTop=this.filterNavNodes(forTop);
    forDown=this.filterNavNodes(forDown);
    this.setState({
      top:forTop,
      down:forDown,
    },() => {
      if(document.getElementById("header-down") && document.getElementById("header-down").firstChild){
        document.getElementById("header-down").firstChild.firstChild.style.marginLeft = `-${this.menuOnFocusPosition}px`;
      }
    });
  }
  componentWillReceiveProps(nextProps){
    let node=this.isANode()
    this.getNextHeadersState(node);

      if(this.props.history && this.props.history.location && nextProps.history && nextProps.history.location)
      {
        if(this.props.history.location.path!==nextProps.history.location.path)
        {
          this.counter=0;
        }
      }

/*
    const selectedDepth = this.current.level - 1;
    /*
    if (this.user.isLoggedIn === nextProps.user.isLoggedIn) {
      //const initialRoute = nextProps.initialRoute;
      //if(this.getLinks().music.indexOf(initialRoute)!== -1 || this.getLinks().ppv.indexOf(initialRoute)!== -1 )
        //this.setInitialTreeFromCode(initialRoute);
      return null;
    }




    this.user = nextProps.user;

    this.setInitialTreeFromCode(nextProps.initialRoute, nextProps.nodes);

    if(this.tree && this.tree[selectedDepth] && this.tree.length > 1){
        this.lastTree = [ ...this.tree];
        this.setState({
          top: this.tree[selectedDepth],
          down:this.tree[this.current.level]
        });
      } else if(this.tree && this.tree[selectedDepth]){
        this.lastTree = [ ...this.tree];
        this.setState({
          top: [],
          down: this.tree[selectedDepth]
        });
      } else {

        this.tree = [ ...this.lastTree ];
        if(!(this.tree && this.tree[selectedDepth])){
          this.setInitialTreeFromCode(this.props.initialRoute, this.props.nodes);
        }
        this.setState({
          top: [],
          down: this.tree[selectedDepth]
        });
      }
      new AnalyticsDimensionSingleton().setUser(nextProps.user);*/
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

  getLinks(){
    const links = JSON.parse(Utils.mock_links_nav_configuration());
    //const links = JSON.parse(Metadata.get('links_nav_configuration')); //Add links_nav_configuration a Metadata
    const country = DeviceStorage.getItem('region');
    if(links)
      return links[country] || links['default'];
    return {}
  }

  isNodeVisible = code => {
    const match = this.allNodes.find(node => node.code === code);
    const navVisibility = JSON.parse(Metadata.get('nav_visibility', '[]'));
    const filterOut = navVisibility.find(nav => nav.code === code);
    if(!match) {
      return false;
    } else if (match && !filterOut) {
      return true
    } else if (filterOut && !!filterOut[this.user.userStatus]) {
      return false
    }
    return true;
  };

  handleKeyPress(e) {
    const pathname = window.location.pathname.split('/');
    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;

    if(Utils.keyBloquedInPTV(pathname,currentKey)){
      return;
    }

    let isPipPlaying = AAFPlayer.livePlayingAsPip();
    
    console.log('Listening [Header] handleKeyPress');

    if(LayersControl.isPlayerVisible() && currentKey === 'RED' && !isPipPlaying)
      return;
    
    console.log('Enter to Listening [Header] handleKeyPress, currentKey:', currentKey);
    if(!Utils.isModalHide()){
      return;
    }

    switch (currentKey) {
      case 'LIST':
        const pathname = this.props.history.location.pathname;
        const profileSettings = 'user-settings/idioma';
        if(this.props.user.isLoggedIn && pathname.indexOf(profileSettings) < 0)
          this.redirect(profileSettings);
        break;
      case 'RED':
        e.preventDefault();
        e.stopPropagation();
        this.sendMetric('buscar');
        this.props.changePath('/search');
        break;
      case 'MUSIC':
        /*Funcionalidad anterior
        e.preventDefault();
        e.stopPropagation();
        let code = this.getLinks().music;
        if (this.isNodeVisible(code)) {
          this.props.changePath(`/node/${code}`);
        }*/
      break;
      /*
      // Sólo para ps4 debug
      case 'RIGHT':
      case 'LEFT':
      case 'UP':
      case 'DOWN':
      if(window.WM_devSettings) {
        console.info(' [PS4] FOCUS DEBUG on FOCUS MemInfo ============== ');
        console.info(window.WM_devSettings.memoryInfo);
      }
      break;
      */

      default:
        break;
    }
  }

  onSomeEvent = (e) => {
    const newMessage = e.mailId;
    let messages = [];

    const filterByIdMethod = (data, id) => {
      const filterById = data.filter((it) => it == id)[0];
      return filterById;
    }

    const msg = this.CCOM.ConditionalAccess.getIrdAllMail();
    if (Array.isArray(msg)) messages = Object.assign([], msg);
    else messages.push(msg.mailInfo);

    const DeviceStorageMessages = DeviceStorage.getItem('nagra_messages') || '[]';
    const unread_messages = JSON.parse(DeviceStorageMessages);

    messages.map((it) => {
      const unread = filterByIdMethod(unread_messages, it.mailId);

      if (!unread) {
        this.setState({ count_unread: this.state.count_unread + 1 })
      }

    });
  }

  setInitialTree(initialNode = "") {
    this.setInitialTreeFromCode(initialNode);
  }

  redirect = (route) => {
    this.props.history.push(`/${route}`);
  }

  refreshSession() {
    if(this.props.user && this.props.user.email && DeviceStorage.getItem('user_hash')) {
      login({ userhash: DeviceStorage.getItem('user_hash') }).then(this.parseRefreshSession).catch((err) => {
        // Nothing to do ¿?
      });
    }
  }

  parseRefreshSession(result) {
    if (result && result.status == '0') {
      // Actualizar lista de suscripciones/paquetes que el user ha comprado/tiene acceso
      this.props.fetchLinealChannels(result.response.user_id);
      this.props.receiveIsLoggedIn(result.response);
      const region = DeviceStorage.getItem('region');
      DeviceStorage.setItem('user_hash', result.response.session_userhash);

      // Cerrar player
      let playerState = AAFPlayer.getCurrentPlayingState(false);
      let playerOptions = AAFPlayer.getCurrentPlayerOptions(false);
      // Si esta el full en pip, se cierra pip
      if (playerState === AAFPLAYER_PLAY) {
        this.props.playFullMedia({
          playerstate: AAFPLAYER_STOP,
          source: null,
          ispreview: false,
          islive: true,
          ispip: false
        });
        // Mjk5MjQ0NzB8MTUyMDYyNTA1NnwwOGJiYjE4NGY3MTYyNzMxNTA4ZjUxZGZmMGYyMDJlZjdhYjBhZjk1MjIyMWM1MDEzZg==
        // Mjk5MjQ0NzB8MTUyMDYyNTA1NnwwOGJiYjE4NGY3MTYyNzMxNTA4ZjUxZGZmMGYyMDJlZjdhYjBhZjk1MjIyMWM1MDEzZg

        // Mjk5MjQ0NzB8MTUyMDYyNTEyOHw5NjMyMjFjMmE3MjNiYWI4ZjYzNzNhYTI0YTE0Yjg3ZjM1YWEyZGJjMzQ1YWFkMjhiYw==

        //Mjk5MjQ0NzB8MTUyMDYyNTEyOHw5NjMyMjFjMmE3MjNiYWI4ZjYzNzNhYTI0YTE0Yjg3ZjM1YWEyZGJjMzQ1YWFkMjhiYw==
      }
      // TODO lógica para dirigir a formulario de suscripción
      if(region !== result.response.region) {
        DeviceStorage.setItem('region', result.response.region);
        window.location.href = '/';
      }
      else {
        this.props.history.push('/');
      }
    }
  }

  goValidateMail = (callback, userhash, resp) => {

    const modalProps = {
        onOmit: callback,
        userhash: userhash,
        phone: resp.userDetectWS && resp.userDetectWS.account ? resp.userDetectWS.account : '',
    };

    const modal = {
        modalType: MODAL_KEYBOARD,
      modalProps: {
        ... modalProps
      }
    };

    this.props.showModal(modal);

  }

  goPerfil = () => {
    if(!this.props.user.isLoggedIn) return;
    const gamificationId = this.props.user.gamification_id;

    const platform = Device.getDevice().getPlatform();
    const region = DeviceStorage.getItem('region');

    const enableSocialProfile = !(region === 'argentina' && platform === 'android');
    const enableSessionRefresh = (region === 'argentina' && platform === 'android');
    const enableAbout = false;
    // por agregar enableAbout para habilitar la seccion "Acerca de" desde APA
    const modal = {
      modalType: MODAL_PROFILE,
      modalProps: {
        gamificationId,
        enableSocialProfile,
        enableSessionRefresh,
        enableAbout,
        callback: (route, refreshSession) => {
          if(refreshSession) {
            this.refreshSession();
          }
          else {
            this.redirect(route);
          }
        },
      }
    };
    this.props.showModal(modal);
    this.sendMetric('perfil');
  };

  setInitialTreeFromCode(code = "") {
    this.tree = [];
    const nodes = this.props.nodes;
    const match = nodes.find(node => node.code === code);
    if (match) {
      const children = match.childs;
      this.addToTree(nodes);

      if (children) this.addToTree(children);

      this.setSelected(match);
    } else {
      for (let node of nodes) {
        const children2 = node.childs;
        if (!children2) continue;

        const match2 = children2.find(child => child.code === code);
        if (match2) {
          this.addToTree(nodes);
          this.addToTree(children2);

          if (match2.childs) this.addToTree(match2.childs);

          this.setSelected(match2);
          break;
        }
      }
    }
  }

  addEventListeners() {
    this.headerContainerRef.addEventListener("sn:willmove", this.handleFocusMove);
    document.addEventListener('keydown', this.handleKeyPress, true);
  }

  removeEventListeners() {
    this.headerContainerRef.removeEventListener("sn:willmove", this.handleFocusMove);
    document.removeEventListener('keydown', this.handleKeyPress, true);
  }

  handleFocusMove(e) {
      let cNode=this.isANode();
      if(cNode==false) //no update if is not a node
      {
        return
      }
    const direction = e.detail.direction;
    const id=e.detail.sectionId;

   // const isOnTop=this.state.top.filter(x=>x.code==cNode).length>0;

   /*if(isOnDown && this.mapa[cNode] && this.mapa[cNode].parent)
   {
     this.counter++
   }*/
    let node =cNode;

    switch (direction)
    {
      case 'up':
        if(id=="header-top") {

         let justCodesActives=this.actives.map(x=>x.code);
         let onTop = this.state.top.filter(x => justCodesActives.indexOf(x.code) > -1);
          if (onTop[0]) {
            let focusNode=null;
              node = onTop[0].code;
            if(this.mapa[node].parent=='__root'){
              focusNode=node;
            }
            else
              focusNode=node;
              this.getNextHeadersState(this.mapa[node].parent, focusNode);
          }
        /* if( this.counter>0)
          {
            let tempC=this.counter;
            while(tempC>0)
            {
              node=this.mapa[node].parent
              tempC--;
            }
          }
          const isOnDown=this.state.down.some(x=>x.code==node);
          let focusNode=null;
          if(isOnDown)
          {
            focusNode=this.mapa[node].parent;
            node=this.mapa[node].parent
          }
          if(this.mapa[node] && this.mapa[node].parent)
          {

            if(this.mapa[node].parent=='__root'){
              focusNode=node;
            }
              this.getNextHeadersState(this.mapa[node].parent,focusNode);
              this.counter++
          }*/
        }
        break;

      case 'down':
        if(id=="nav_down"){ //&& this.counter>0) {

          let justCodesActives=this.actives.map(x=>x.code);
          let onDown = this.state.down.filter(x => justCodesActives.indexOf(x.code) > -1);
          if (onDown[0]) {

            let index=justCodesActives.indexOf(onDown[0].code);
            if(index>0)
            {
              console.log('going to',justCodesActives[index-1]);
              this.getNextHeadersState(justCodesActives[index-1]);
            }
            else if(index==0){
              this.getNextHeadersState(justCodesActives[index]);
            }

            /*let focusNode=null;
            node = onDown[0].code;
            if(this.mapa[node].parent=='__root'){
              focusNode=node;
            }
            else
              focusNode=node;
            this.getNextHeadersState(this.mapa[node].parent, focusNode);*/
          }
          /*let tempC=this.counter-1;
          while(tempC>0)
          {
            node=this.mapa[node].parent
            tempC--;
          }
          if(node!=='__root')
          {
            this.getNextHeadersState(node);
            this.counter--
          }*/
        }
        break;
      default:
        break;
    }


    return;
    const target = e.target;
    const level = parseInt(target.getAttribute("data-level"));
    const focusedLevel = parseInt(target.getAttribute("data-focused-level"));
    switch (direction) {
      case "up":
        this.musicFlag = null;
        this.homeFlag = null;
        const topNodes = this.tree[level - 1];

        let down = this.tree[level];

        /* TODO change this location evaluations
        * We can do something with APA layout_node_configuration
        */
        if(this.props.history.location.pathname.indexOf('claromusica') !== -1) {
            down = this.musicContent;
        }

        /* TODO change this location evaluations
        * We can do something with APA layout_node_configuration
        */
        if(this.props.history.location.pathname.indexOf('nagrainicio') !== -1
          || this.props.history.location.pathname.indexOf('home') !== -1) { // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
            down = this.homeContent;
        }

         if (topNodes && focusedLevel === 1) {
           console.log("header should scroll up");
           this.setState({
            top: topNodes,
            down: down,
           })

         } else if (topNodes && focusedLevel === 0) {
           console.log("header should scroll up");
           this.setState({
             top: topNodes,
            down: down,
           })
           window.SpatialNavigation.focus('.nav-item.focusable.active');
         }
        break;

      case "down":

        this.musicFlag = null;
        this.homeFlag = null;

        const downNodes = this.tree[level + 1];
         if (downNodes && focusedLevel === 1) {
           console.log("header should scroll down");
           this.setState({
             top: this.tree[level],
             down: downNodes
           })

         }
         break;

      default: break;
    }
  }

  setActiveElements() {
    this.props.setResumeDataEmpty();

    let node =this.isANode();
    if(!node)
    {
      this.actives=[];
      return
    }

    this.actives=[];
    if(this.mapa[node]) {
      this.actives.push({code:node, text:this.mapa[node].text})
      while(this.mapa[node].parent && this.mapa[node].parent!=='__root'){
        node=this.mapa[node].parent;
        this.actives.push({code:node, text:this.mapa[node].text})

      }
    }
    new ActivesSingleton().setActives(this.actives);
   // this.sendMetric();
    //this.actives.push({code:node, text:this.mapa[node].text})
    return
  }

  getActiveGA(code=null) {
    let node = code;
    if (!node) {
      return
    }

    let pathString=this.mapa[node].text;
    while (this.mapa[node].parent && this.mapa[node].parent !== '__root') {
      node = this.mapa[node].parent;
      pathString=this.mapa[node].text +'/'+pathString;

    }
    return pathString

  }

  sendDimension(){
    const payload=new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: 'executor'});
  }



  sendMetric(label=null){
    if(label===null)
      label=new ActivesSingleton().getTree();
    if(label==='registro'){
      this.props.setMetricsEvent({
        hitType: 'event',
        eventCategory: label,
        eventAction: 'click',
        eventLabel: 'click',
      });
      this.props.setMetricsEvent({ type: 'executor'});
    }
    if(label==='ingresar'){
      this.props.setMetricsEvent({
        hitType: 'event',
        eventCategory: 'login',
        eventAction: 'click',
        eventLabel: 'click',
      });
      this.props.setMetricsEvent({ type: 'executor'});
    }
    this.props.setMetricsEvent({
      hitType: 'event',
      eventCategory: 'top menu',
      eventAction: 'click',
      eventLabel: label,
    });
    this.props.setMetricsEvent({ type: 'executor'});
    this.sendDimension();
  }

  isANode(){
    if(this.props  && this.props.history && this.props.history.location && this.props.history.location.pathname)
    {


      if(this.props.history.location.pathname.indexOf('/node/')==-1)
      {
        if((this.isVcard() && this.oldNode) || (this.isMusicNode() && this.oldNode))
        {
          return this.oldNode;
        }
        this.oldNode=null;
        //debugger
        return false;
      }
      else
      {
        let splitted=this.props.history.location.pathname.split('/node/');
        this.oldNode= splitted[1]?splitted[1]:false
        return this.oldNode;
      }
    }
  }

  isVcard(){
    if(this.props  && this.props.history && this.props.history.location && this.props.history.location.pathname)
    {
      if(this.props.history.location.pathname.indexOf('/vcard/')==-1)
      {
        return false;
      }
      else
      {
        return true
      }
    }
    return false
  }

  isMusicNode(){
    if (this.props && this.props.history && this.props.history.location && this.props.history.location.pathname) {
      if (this.props.history.location.pathname.indexOf('/playlist/') === 0 || this.props.history.location.pathname.indexOf('/album/') === 0
        || this.props.history.location.pathname.indexOf('/radioList/') === 0 || this.props.history.location.pathname.indexOf('/artist/') === 0) {
          return true;
      }
    }
    return false
  }

  shouldComponentUpdate(nextProps){
    return   true//(this.isANode()!==false  || this.props.user.isLoggedIn!==nextProps.user.isLoggedIn)
  }

  setSelected(selected = {}) {
    let porEnviar=this.getActiveGA(selected.code);
    this.sendMetric(porEnviar)
    return;
    const prev = this.current;
    const prevDepth = prev.level - 1;
    const selectedDepth = selected.level - 1;
    this.actives = [];

    this.actives.push(selected);

    new ActivesSingleton().setActives(this.actives);
    this.setActiveElements(selected);
    if (prev.id !== selected.id) {

      if (prevDepth > selectedDepth) { // if selected upper level
        this.tree.length = selectedDepth + 1;

      } else if (prev.id === selected.id_parent) { // if child selected
        console.log("header selected is my child");

      } else if (prev.childs) {
        this.tree.pop();
      }

      const children = selected.childs;

      if (children) {
        this.setState({
          top: this.tree[selectedDepth],
          down: children
        });

      } else {
        this.setState({
          top: [],
          down: (this.tree && this.tree[selectedDepth])?this.tree[selectedDepth]:[],
        })

      }

      this.current = selected;

      if(typeof children !== 'undefined'){
        this.addToTree(children);
      }

    }

    this.sendMetric();
  }

  addToTree(nodes = []) {
    if (!nodes.length) return;
    const filteredNodes = this.filterNavNodes(nodes);
    this.tree.push(filteredNodes);
  }

  filterNavNodes(nodes = []) {

    const user = store.getState().user;


    const navVisibility = JSON.parse(Metadata.get("nav_visibility"));


    const filteredNodes = nodes.filter(node => {
      const isAnonymous = user.isAnonymous;
      const isSusc = user.isSusc;
      let shouldBeVisible = true;

      const match = navVisibility.find(nav => nav.code === node.code);
      if (match) {
        if (isAnonymous) {
          shouldBeVisible = !!match.anonymous;
          console.log('Match shouldBeVisible isAnonymous', shouldBeVisible);
        } else if (isSusc) {
          shouldBeVisible = !!match.susc;
          console.log('Match shouldBeVisible isSusc', shouldBeVisible);
      } else if (!isSusc) {
          shouldBeVisible = !!match.no_susc;
          console.log('Match shouldBeVisible !isSusc', shouldBeVisible);

        }
      }


      return shouldBeVisible;
    });



    return filteredNodes;
  }

  handleShowPerfilModal(isHuaweiArgentina = false) {
    const that = this;

    if(!isHuaweiArgentina && this.props.user.isLoggedIn){
      UtilsIpTelmex.validateMail(this.props.user.session_userhash).then(function (resp) {
        if (resp && !resp.validEmail) {
          const callback = that.goPerfil;
          that.goValidateMail(callback, that.props.user.session_userhash, resp);
        }
        else {
          that.goPerfil();
        }
      });
    } else {
      this.goPerfil();
    }
  }


Nav = ({ nodes = [], index, setSelected, actives }) => {
  const navItems = nodes.map((node, position) => this.NavItem({ node, index, setSelected, actives, position }));
  return (
    <ul key={index} className={`nav`}>
      {navItems}
    </ul>
  );
};

NavItem = ({ node, index, setSelected, actives, position }) => {

  let nodeValue;
  let iconMenu = Assets.get(`ic_imgmenu_${node.code}`);

  if (iconMenu != `ic_imgmenu_${node.code}`) {
    nodeValue = <img src={iconMenu} className='nav-image' alt="node.text" />
  }
  else {
    nodeValue = node.text;
  }

  const level = node.level;
  const active = actives.find(it => it.code === node.code) ? 'active' : '';
  const idItem = `${node.id_parent}_${position}`;
  return (
    <li
      key={node.id}
      id={idItem}
      onClick={(e) => {
        setSelected(node)
        this.menuOnFocusLastPosition = this.menuOnFocusPosition;

      }}
      onFocus={(e) => {
        if(this.menuWidth > 1280){
          const marginLeft = document.getElementById(idItem).getAttribute("data-marginLeft");
          if(marginLeft !== null){
            document.getElementById(idItem).parentNode.style.marginLeft = `-${marginLeft}px`;  
            this.menuOnFocusPosition = marginLeft;
          }
        }
        if(this.menuOnBlur){
          clearTimeout(this.menuOnBlur);
        };
        
      }}
      onBlur={()=>{
        if(this.menuWidth > 1280){
          this.menuOnBlur = setTimeout(()=>{
            const marginLeft = document.getElementById(idItem).getAttribute("data-marginLeft");
            if(marginLeft !== null){
              document.getElementById(idItem).parentNode.style.marginLeft = `-${this.menuOnFocusLastPosition}px`;
            }
          }, 400);
        }
      }}
      >
      <NavLink
        id={node.code}
        className={`nav-item ${focusSettings.className} ${active}`}
        to={`/node/${node.code}`}
        data-level={level - 1}
        data-focused-level={index}
      >
        {nodeValue}
      </NavLink>
    </li>
  );
};

  render() {
    this.setActiveElements()

    let newUser;

    if (!this.props.user.isLoggedIn)
      newUser = { metadatas: { facebookId: null } }
    else if (this.props.user && this.props.user.socialNetworks && this.props.user.socialNetworks.filter) {
      let withFace = this.props.user.socialNetworks.filter((x) => x.extra_data && x.extra_data.id)[0];

      if (withFace)
        newUser = { metadatas: { facebookId: withFace.extra_data.id } }
    }

    let top = this.state.top;

    let down = this.state.down;

    const clockOrNav = this.state.top.length === 0 ?
      <div className="clock">
        <Clock />
        {!Device.getDevice().getConfig().hideArrowHeader && <i className="fa fa-chevron-down" /> }
      </div>
      :
      <nav className="nav-container top" ref={nav => this.navContainerRef = nav}>
        {
          this.Nav({
            nodes: top,
            index: 0,
            setSelected: this.setSelected,
            actives: this.actives
          })
        }
      </nav>;

    const headerRightContent = [
      <span key="red-ball" className={ config_remote_control ? "color-ball red" : null }></span>,

      <NavLink
        id="search"
        key={"search"}
        className={`btn-search ${focusSettings.className}`}
        to={`/search`}
        activeStyle={{ fontWeight: "700" }}
        onClick={()=>{this.sendMetric('buscar');}}
      >
        <i className="fa fa-search" />
      </NavLink>,
    ];

    if (!this.props.user.isLoggedIn) {
      headerRightContent.push(
        <NavLink
          id="login"
          key="login"
          className={`${focusSettings.className}`}
          to={`/login`}
          onClick={()=>{this.sendMetric('ingresar');}}
        >
          {Translator.get('login_btn_lbl', 'Ingresar')}
        </NavLink>

      );
      headerRightContent.push(
        <NavLink
          id="register"
          key="register"
          className={`${focusSettings.className}`}
          to={`/register`}
          onClick={()=>{this.sendMetric('registro');}}
        >
          {Translator.get('registration_lbl', 'Registro')}
        </NavLink>
      );
    }

    if (this.props.user.isLoggedIn) {
      let src = Assets.get('icono_settings_arg');
      headerRightContent.push(
        <NavLink
          id="config"
          key={"config"}
          className={`btn-config ${focusSettings.className}`}
          to={`/user-settings/idioma`}
          activeStyle={{fontWeight: "700"}}
          onClick={() => {
            this.sendMetric('configuracion');
          }}
        >
          <i className="fa fa-bars" />
        </NavLink>
      );

      // **** Refresh session
      // Cerrarlo a argentina
      const isHuawei = Device.getDevice().getPlatform() === 'android';
      const argentina = DeviceStorage.getItem('region') === 'argentina';
      const isHuaweiArgentina = isHuawei && argentina;

      if(isHuaweiArgentina) {
        headerRightContent.push(
          <ConfigSession
              id = 'configsession'
              handlerFunction = { () => this.handleShowPerfilModal(isHuaweiArgentina) }
          />
        );
      }

      const socializationEnabled = Metadata.get('socialization_enabled') == 'true';
      if (socializationEnabled) {
        if (!isHuaweiArgentina) {
          headerRightContent.push(
            <div className="header-avatar">
              <SocialAvatar
                userSocial={newUser}
                handlerFunction={() => this.handleShowPerfilModal()}
              />
              {this.state.unread > 0 && <div className="header-badge">{this.state.count_unread}</div>}
            </div>
          );
        }
      }
    }

    const headerLogo = this.props.history.location.pathname.indexOf('claromusica') !== -1 ?
      Assets.get('claro_musica_logo') :
      Assets.get('logo_clarotv',clarotv_logo);

    const widthHeaderLogo = this.props.history.location.pathname.indexOf('claromusica') !== -1 ?
      '151' : '156';
    //TODO  cambiar este meteodo
     let showByPTV=window.location.href.indexOf('/ptv')==-1;
    return (
      <header id="header" className="header">
        <div className="header-container" ref={nav => this.headerContainerRef = nav}>

          <div id="header-top" className="header-top">
            <div className="header-logo">
              <img width={widthHeaderLogo} src={headerLogo} alt="claroTv logo" />
            </div>

            {showByPTV && clockOrNav}

            {showByPTV && <div className="header-right">

              { headerRightContent}
            </div>}
          </div>

          <div id="header-down" className="header-down">

            { showByPTV && <nav className="nav-container down">
              {
                this.Nav({
                  nodes: down,
                  index: 1,
                  setSelected: this.setSelected,
                  actives: this.actives
                })
              }
            </nav> }

          </div>

        </div>
      </header>
    )
  }
}


export const getLinksFromNavConfiguration = () => {
  const links = JSON.parse(Metadata.get('links_nav_configuration'), Utils.mock_links_nav_configuration()); //Add links_nav_configuration a Metadata
  const country = DeviceStorage.getItem('region');
  if(links)
    return links[country] || links['default'];
  return {}
};

export default connect(null, { showModal,setMetricsEvent, fetchLinealChannels, receiveIsLoggedIn, playFullMedia })(Header)
