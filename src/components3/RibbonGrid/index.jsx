import React, { Component } from "react";
import PropTypes from "prop-types";

import RequestManager from "./../../requests/RequestManager";
import LevelRibbonTask from "./../../requests/tasks/cms/LevelRibbonTask";
import LevelUserRibbonTask from "./../../requests/tasks/cms/LevelUserTask";
import { SpecialRibbon } from "./../Ribbon";
import Scrollable from "./../Scrollable";
import ActivesSingleton from "../Header/ActivesSingleton";
/* import store from "./../../store";
import RibbonsUtil from "../../utils/RibbonsUtil"; */
import Utils from "../../utils/Utils";

// Styles
import "./ribbongrid.css";

class RibbonGrid extends Component {
  constructor(props) {
    super(props);

    this.levelUri = this.props.levelRequest.uri;
    this.levelUserUri = this.props.levelUserRequest.uri;
    this.hasUsersRibbons = false;
    this.levelUserRequested = false;
    this.focused = null;

    this.DOWN = "DOWN";
    this.UP = "UP";

    this.state = {
      ribbonsPrev: this.props.ribbonsPrev,
      ribbonsRest: [],
      ribbonsUser: []
    };

    this.levelsRequest = this.levelsRequest.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  shouldComponentUpdate(newProps, newState) {
    this.state.ribbonsPrev = newProps.ribbonsPrev;
    //console.log ("[RibbonGrid.shouldComponentUpdate] this.props", this.props,
    //  "\n[RibbonGrid.shouldComponentUpdate] newProps", newProps);
    if (JSON.stringify(this.props) !== JSON.stringify(newProps)) {
      this.loadRibbons({ node: newProps.levelRequest.params.node });
      //console.log ("[RibbonGrid.shouldComponentUpdate] loaded new props ribbons");
      return true;
    }
    //console.log ("[RibbonGrid.shouldComponentUpdate] this.state", this.state,
    //  "\n[RibbonGrid.shouldComponentUpdate] newState", newState);
    return JSON.stringify(this.state) !== JSON.stringify(newState);
  }

  handleFocus(data) {
    this.focused = document.activeElement.dataset.snLeft;
    if (typeof this.props.focusHandler === "function") {
      this.props.focusHandler(data);
    }

     if (Utils.getToggleFunctionsFromMetadata().scrolling_ribbon_home) {
      let item = document.getElementById(
        document.activeElement.getAttribute("id")
      ).parentNode;
      while (item.getAttribute("class") !== "special-ribbon-carousel") {
        item = item.parentNode;
      }
      let position = item.parentNode.offsetTop;

      // console.log(' cual es 1 ---------', item.parentNode.parentNode);
      // console.log(' cual es 1 ---------', item.parentNode);
      // console.log(' cual es 2 ---------', position);
      // console.log(' cual es 3 --------- ', document.activeElement.getAttribute("id"));
      // ---------------------------------------
      let i = 0, sib=item.parentNode;
      while( (sib = sib.previousSibling) != null ) i++;
      // console.log(' cual es sibling ------',i, sib);
      let child = document.querySelectorAll(".scroll-children")[0].childNodes; //consigo los hijos de scroll-children
      for(let j=0;j<child.length;j++) child[j].className=''; // le saco a todos
      child[i].className='fromVMenu'; // le pongo al actual
      // console.log(' cual es children',child.length,child,child[i])
      // ---------------------------------------

 
      document.querySelector(
        "#slider-grid-movies .scroller-container"
      ).style.marginTop = `-${position}px`;
      document.querySelector(
        ".ribbongrid-wrapper"
      ).scrollTop=0; 
    }
  }

  componentDidUpdate() {
    setTimeout(() => {
      const modal = document.getElementsByClassName("modal-overlay");
      if (modal.length === 0) {
        window.SpatialNavigation.focus(".scroller-container .focusable");
      }
    }, 300);
  }

  componentDidMount() {
    setTimeout(() => {
      const modal = document.getElementsByClassName("modal-overlay");
      if (modal.length === 0) {
        window.SpatialNavigation.focus(".scroller-container .focusable");
      }
    }, 300);
  }

  loadRibbons(params = {}) {
    if (this.hasUsersRibbons)
      this.levelUserRequest(params, response => {
        this.setState({ ribbonsUser: response.components });
      });
  }

  levelsRequest(params, callback) {
    if (this.levelUri === undefined || this.levelUri === "") {
      return;
    }

    const newParams = Object.assign({}, this.props.levelRequest.params, params);

    try {
      const task = new LevelRibbonTask(this.levelUri, newParams);
      RequestManager.addRequest(task).then(response => {
        if (typeof callback === "function") {
          callback(response.response);
        }
      });
    } catch (e) {
      console.error("error getting Level in", e);
    }
  }

  levelUserRequest(params, callback) {
    if (this.props.levelUserRequest.params.user_hash !== "") {
      if (this.levelUserUri === undefined || this.levelUserUri === "") {
        return;
      }

      const newParams = Object.assign(
        {},
        this.props.levelUserRequest.params,
        params
      );

      try {
        const task = new LevelUserRibbonTask(this.levelUserUri, newParams);
        RequestManager.addRequest(task).then(response => {
          if (typeof callback === "function") {
            callback(response.response);
          }
        });
      } catch (e) {
        console.error("error getting Level in", e);
      }
    }
  }

  isString = ribb => typeof ribb === "string";
  idStartsWithNumber = stringId => {
    if (this.isString(stringId)) {
      const id = stringId[0];
      return id >= 48 && id <= 57;
    } else return;
  };

  parserId = id => `a_${id}`;

  render() {
    const ribbonsPrev = this.props.ribbonsPrev;
    const ribbonsRest = this.state.ribbonsRest;
    const ribbonsUser = this.props.ribbonsUser;

    const ribbons = [...ribbonsPrev, ...ribbonsRest];
    /*
    let numRibbons = 10;
    let ribbons = [];
    if(ribbonss && ribbonss.length > 0) {
      ribbons = ribbonss.filter((elem, cindex) => {
        return cindex < numRibbons;
      });    
    }
    */
    //console.log("[RibbonGrid] count: ", ribbons.length);
    //console.log('[RibbonGrid] RibbonPrev: ', ribbonsPrev);
    //console.log('[RibbonGrid] RibbonRest: ', ribbonsRest);
    //console.log('[RibbonGrid] RibbonUser: ', ribbonsUser);
    if (ribbonsUser)
      ribbonsUser.map(obj => {
        const ribbon = ribbons.find(r => r.id === obj.id);
        const index = ribbons.indexOf(ribbon);
        ribbons[index] = Object.assign({}, ribbon, obj);
      });

    const node = new ActivesSingleton().getTvNode();
    return (
      <div className="ribbongrid-wrapper">
        <div
          className="ribbongrid-container"
          id={
            Utils.getToggleFunctionsFromMetadata().scrolling_ribbon_home
              ? "slider-grid-movies"
              : ""
          }
        >
          <Scrollable height={"410px"}>
            {ribbons.map(ribbon => {
              const { id } = ribbon;

              if (id === "guia-tv") {
                if (ribbon && Array.isArray(ribbon.items)) {
                  let props_asset = this.props.asset;
                  ribbon.items.map((it, i) => {
                    const url = encodeURIComponent(`/player/${it.id}/true`);
                    const it_key = it.key;
                    it.cover = props_asset.get(it_key);
                    it.image_still = props_asset.get(it_key);
                    it.src = `/node/${node}?url=${url}`;
                    it.filterTV = i + "";
                  });
                }
              }

              if (this.idStartsWithNumber(id)) {
                ribbon.id = this.parserId(id);
              }
              return (
                <SpecialRibbon
                  user={this.props.user}
                  key={Math.random() * 10}
                  {...ribbon}
                  focusHandler={this.handleFocus}
                  setMetricsEvent={this.props.setMetricsEvent}
                  forceUpdateGrid={this.props.forceUpdateGrid}
                />
              );
            })}
          </Scrollable>
        </div>
      </div>
    );
  }
}

RibbonGrid.propTypes = {
  ribbonsPrev: PropTypes.array,
  user: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
    isSusc: PropTypes.bool
  }),
  levelRequest: PropTypes.shape({
    uri: PropTypes.string,
    params: PropTypes.object
  }).isRequired,
  levelUserRequest: PropTypes.shape({
    uri: PropTypes.string,
    params: PropTypes.object
  }).isRequired,
  focusHandler: PropTypes.func
};

RibbonGrid.defaultProps = {
  user: {},
  ribbonsPrev: [],
  focusHandler: null
};

export default RibbonGrid;
