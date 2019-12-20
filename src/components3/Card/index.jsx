import React from 'react'
import PropTypes from 'prop-types'
import focusSetting from './../Focus/settings'
import CardHelper from './helpers'
import CoverImage from "../CoverImage"

// Components
import FakeLink from '../../components/FakeLink'
import ActivesSingleton from "../../components/Header/ActivesSingleton"
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton'
import ChannelSingleton from '../../components/Epg/ChannelsSingleton'

import Asset from "../../requests/apa/Asset"
import getAppConfig from '../../config/appConfig'


import store from '../../store'
import { playFullMedia } from '../../actions/playmedia'
import AAFPlayer from "../../AAFPlayer/AAFPlayer"

// Styles
import './card.css'

function createMarkup(markup) {
  return { __html: markup };
}

function Card(props) {
  const focusClassName = props.focusable ? focusSetting.className : focusSetting.nonfocusable;
  const cardImgClassName = props.data.music_class ? `${props.data.music_class} card-cover`: 'card-cover';
  const is_music_cover = props.is_music || props.data.music_class;
  const props_data = props.data;
  const props_dataMetric = props.dataMetric;
  const handleError = (event) => {
      if(props.data.groupName) {
          const typeOfError = props.data.groupName.toLowerCase();
          event.target.src = CardHelper.getPlaceholder(typeOfError);
      }
      else  event.target.src = CardHelper.getPlaceholder(props.type);
  }

  let placeholder = CardHelper.getPlaceholder(props.type);
  if(props.data.groupName) {
      const type = props.data.groupName.toLowerCase();
      placeholder = CardHelper.getPlaceholder(type);
  }

  function sendDimension(){
    const payload=new AnalyticsDimensionSingleton().getPayload();
    props.setMetricsEvent(payload);
    props.setMetricsEvent({ type: 'executor'});
  }


  function sendMetric() {
    let label='';
    const location = window.location.toString();
    const url = location.split('/');
    let action=url[url.length-1];
    const props_data = props.data;
    const props_dataMetric = props.dataMetric;
    switch(props.type){
      case 'highlight':
        if (location.indexOf('claromusica') !== -1) {
          let title=props.title === '' ?' superdestacado' : props.title;
          let carruselTitle = props_dataMetric.carruselTitle === '' ? 'superdestacado' : props.title;
          action=`${new ActivesSingleton().getTree()}/${carruselTitle}`;
          label=`${props_dataMetric.cardPosition} | ${title}`;
        }
        else{
          const props_data_format_type = props_data.format_types;
          if (props_data_format_type !== null) {
            if(typeof props_data_format_type === 'string') {
              label = `${props_data_format_type} - `;
            }
            else {//if(typeof props_data_format_type === 'Array') {
              label = `${props_data_format_type.reduce(
                (previous, current) => previous + ',' + current
              )} - `;
            }
          }
          const carruselTitle = props_dataMetric.carruselTitle !== null
            ? props_dataMetric.carruselTitle
            : 'superdestacado';
          label += `${props.title} - ${props_dataMetric.cardPosition} | ${carruselTitle}`;
          action=new ActivesSingleton().getTree();
        }
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'carrusel',
          eventAction: action,
          eventLabel: label,
        });
        break;
      case 'landscape':
        if(location.indexOf('claromusica') !== -1){
          action=`${new ActivesSingleton().getTree()}/${props_dataMetric.carruselTitle}`;
          label=`${props_dataMetric.cardPosition} | ${props.title}`;
        }
        else{
          const props_data_format_type = props_data.format_types;
          if (typeof props_data_format_type !== 'undefined'){
            if (typeof props_data_format_type==='string') {
              label = `${props_data_format_type} - `;
            }
            else if(typeof props_data_format_type === 'Array') {
              label = `${props_data_format_type.reduce((previous, current) => previous + ',' + current)} - `;
            }
          }
          if(location.indexOf('talent')!==-1 || location.indexOf('vcard')!==-1){
            action='vcard';
            label+=`-${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
          }
          else  if(location.indexOf('socialProfile')!==-1){
            action='perfil';
            let title=props.data.title_uri.replace(/-/g,' ');
            label+=`-${title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
          }
          else{
            action=new ActivesSingleton().getTree();
            label+=`${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
          }
        }
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'carrusel',
          eventAction: action,
          eventLabel: label,
        });
        break;
      case 'infinite':
        label = `${props_data.format_types}-${props_data.title} - ${props_dataMetric.cardPosition} | Listado Infinito`;
        action=new ActivesSingleton().getTree();
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'carrusel',
          eventAction: action,
          eventLabel: label,
        });
        break;
      case 'user-profile':
      case 'user-info':
        if(location.indexOf('vcard')!==-1)
          action='vcard';
        label = `${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'carrusel',
          eventAction: action,
          eventLabel: label,
        });
        break;
      case 'channel':
        label = props_data.title;
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'tv',
          eventAction: 'menu canales',
          eventLabel: label,
        });
        break;
      case 'portrait':
        action=new ActivesSingleton().getTree();
        label=`${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'carrusel',
          eventAction: action,
          eventLabel: label,
        });
        break;

      case 'square':
        if(location.indexOf('claromusica') !== -1){
          if(typeof props_data !== 'undefined'){
            if(props_data.type === 'radio'){
              if(props.stationTitle === 'genero'){
                label=`${props_data.genre} - ${props_data.name}`;
                props.setMetricsEvent({
                  hitType: 'event',
                  eventCategory: 'radios',
                  eventAction: 'genero',
                  eventLabel: label,
                });
              }
              else{
                label=`${props.stationTitle} - ${props_data.name}`;
                props.setMetricsEvent({
                  hitType: 'event',
                  eventCategory: 'radios',
                  eventAction: 'estaciones',
                  eventLabel: label,
                });
              }
            }
            else if(props_data.type === 'Playlist' || props_data.type === 'radios' || props_data.type === 'Radio'){
              action=`${new ActivesSingleton().getTree()}/${props_dataMetric.carruselTitle}`;
              label=`${props_dataMetric.cardPosition} | ${props.title}`;
              props.setMetricsEvent({
                hitType: 'event',
                eventCategory: 'carrusel',
                eventAction: action,
                eventLabel: label,
              });
            }
          }
        }
        break;
      case 'circle':
        if(location.indexOf('claromusica') !== -1) {
          if (props.stationTitle === 'artistas') {
            props.setMetricsEvent({
              hitType: 'event',
              eventCategory: 'radios',
              eventAction: 'artistas',
              eventLabel: props_data.artist,
            });
          } else {
            action = `${new ActivesSingleton().getTree()}/${props_dataMetric.carruselTitle}`;
            label = `${props_dataMetric.cardPosition} | ${props.title}`;
            props.setMetricsEvent({
              hitType: 'event',
              eventCategory: 'carrusel',
              eventAction: action,
              eventLabel: label,
            });
          }
        }

        break;
      case 'epg_event':
        console.log('[HOMOLOGACION] epg_event ...');

        const props_data_format_type = props_data.format_types;

        if (typeof props_data_format_type !== 'undefined') {
          if (typeof props_data_format_type === 'string') {
            label = `${props_data_format_type} - `;
          }
          else if (typeof props_data_format_type === 'Array') {
            label = `${props_data_format_type.reduce((previous, current) => previous + ',' + current)} - `;
          }
        }
        if (location.indexOf('talent') !== -1 || location.indexOf('vcard') !== -1) {
          action = 'vcard';
          label += `-${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        }
        else if (location.indexOf('socialProfile') !== -1) {
          action = 'perfil';
          let title = props.data.title_uri.replace(/-/g, ' ');
          label += `-${title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        }
        else {
          action = new ActivesSingleton().getTree();
          label += `${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        }

        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'carrusel',
          eventAction: action,
          eventLabel: label,
        });
        break;
      default:
        break;
    }
    props.setMetricsEvent({ type: 'executor'});
    sendDimension();
  }

  let linkTo;
  if(props_data && props_data.ads === 'app_behaviour') linkTo = props_data.href;
  else linkTo = CardHelper.getUri(props.href, props.group_id, props_data);

  let cover = props.cover;
  let config = getAppConfig();
  if(props_data.type === 'Radio')
    cover = config.end_point_music + "proxyImage?url=" + cover + "&size&imwidth=165";
  let isGoingToPlay=false;
  let isGoingToPlayWithFilter = !!props.filterTV;
  let activateFilter=null;
  linkTo = linkTo.indexOf('/') > 0 ? `/${linkTo}` : linkTo;
  if (linkTo.indexOf('/player/')!==-1){
    linkTo='';
    isGoingToPlay=true;
    if(props.filterTV){
      isGoingToPlayWithFilter=true;
      isGoingToPlay=false;
    }
  }



  return (
    <div id={props.id}
         className={`card ${props.type} ${props.className} ${props.sibling ? 'double' : ''}`}
         ref={props.onLoadHandler}>
      {CardHelper.createSibling(props.sibling)}
      <div className="card-container">
        <FakeLink
          typeRender={props.typeRender}
          id={`link-${props.id}`}
          to={ linkTo }
          className={`link ${focusClassName}`}
          data-counter={ props.positionInfinite }
          data-sn-up={props.focusUp}
          data-sn-right={props.focusRight}
          data-sn-left={props.focusLeft}
          onClick={(e) => {
            console.log("[Card] linkTo", linkTo);
            if (typeof props.setMetricsEvent === 'function') {
              try {
                sendMetric();
              } catch (e) {
                console.error('Could not send metrics from card click', e);
              }
            }
            if (typeof props.clickHandler !== 'function'
              && !isGoingToPlay && !isGoingToPlayWithFilter ) {
              return null;
            }
            if (typeof props.onClickCb === 'function') {
              if(props.data && props.data.live_enabled=="0"){ //si el link es a vcard no se tiene que ejecutar la funcion
                return null;
              }else {
                props.onClickCb(e); //Esta funcion se ocupa para la grilla de canales
              }
            }

            e.preventDefault();

              const dispatchPlayMedia = (group_id, filterTV) => {
                store.dispatch(playFullMedia({
                  playerstate: 'PLAYING',
                  source: {
                    videoid: group_id
                  },
                  ispreview: false,
                  islive: true,
                  size: {
                    top: 0,
                    left: 0,
                    width: 1280,
                    height: 720,
                  },
                  ispip: false,
                  showEpg: !!filterTV,
                  filterTV : filterTV,
                }));
              };



            if (is_music_cover && typeof props.clickHandler === 'function') {
              return props.clickHandler(props_data);
            } else if(isGoingToPlay){
              dispatchPlayMedia(props.group_id);
              return null;
            } else if(isGoingToPlayWithFilter){
              let filterGroupid = null;
              new ChannelSingleton().getFilteredChannels(props.group_id)
                .then(async (availableChannels) => {
                  if(availableChannels.length == 0) {
                    availableChannels.push({groupId: props.group_id});
                  }
                  filterGroupid = availableChannels[0].group_id;
                  const currentPlayerOptions = AAFPlayer.getCurrentPlayerOptions();
                  if(currentPlayerOptions.playerstate=='PLAYING' && currentPlayerOptions.islive && !currentPlayerOptions.hasOwnProperty('audiosource') && currentPlayerOptions.size.width<1280){
                    filterGroupid=currentPlayerOptions.source && currentPlayerOptions.source.videoid ? currentPlayerOptions.source.videoid : filterGroupid;
                  }
                  filterGroupid && dispatchPlayMedia(filterGroupid, props.filterTV);
                });
              return null;
            } else {
              return props.clickHandler();
            }

          }}
          onFocus={() => {
            CardHelper.focusHandler(props.focusHandler, props_data)            
            if (props_data.episode) {
              //TODO:Si se desea que al seleccionar el episodio se actualice la ficha, va esta linea.
              //store.dispatch(setResumeData(props_data));
            }            
          }}
          onKeyUp={() => CardHelper.keyUpHandler(props.keyUpHandler, props)}
          onKeyDown={e => CardHelper.keyDownHandler(e, props.keyDownHandler, props.data)}
          onBlur={ props.unFocusHandler}
        >
          {is_music_cover?
            <CoverImage
              contentProps={props_data}
              image={cover}
              imagePlaceholder={CardHelper.getPlaceholder(props.type)}
              type={props.type}
              classComponent={cardImgClassName}
            /> : props.type === 'text' ? null :
          <div className="card-div">
              <div className="card-placeholder"
                style={{ backgroundImage: `url(${placeholder})` }}
                alt="placeholder"></div>
              {props.cover !== '' &&
                <div
                  className={cardImgClassName}
                  onError={handleError}
                  style={{ backgroundImage: `url(${props.cover})` }}
                ></div>
              }
              <span className="preview-progress" style={{
                width: `${props.bookmark}%`
              }}></span>
            </div>
          }
          {props.type === 'text' ? <div className={`text`}> {props.data.name} </div> : props.data && (props.data.type || props.data.live_enabled) && (props.data.type === "live" || props.data.live_enabled === "1") && props.data.channel_number ? <div className={`channel-number`}>{props.data.channel_number}</div> :
          <div className={`badge-container ${props.badgesAlign}`} dangerouslySetInnerHTML={createMarkup(props.badgesHtml)} />
          }
          {
            (
              ( props_data.provider !== 'default'
                && props_data.proveedor_name !== 'AMCO'
              )
              && !props.hideInnerTitle
            ) &&
              <div className={`card-metadata ${props.data.isRecord ? 'recording' : ''} ${props.data.isSeries ? 'is-series' : ''} ${props.data.isRecording ? 'is-recording' : ''}`}>
                <div className="inner-title">
                  {(props.filterTV ? ' ': props.title)}
                  {
                    typeof props.data.dateOfRecord === 'string'
                      ? <div style={{ color: '#aaa', fontSize: 14 }}>{props.data.dateOfRecord}</div>
                      : null
                  }
                </div>
                {
                  props.data.isSeries ?
                    <div style={{
                      position: 'absolute',
                      right: 16,
                      bottom: 10,
                      color: '#fff',
                      zIndex: 1,
                    }}>
                      <img
                        style={{ width: 35 }}
                        className="icon icon-record recording"
                        src={Asset.get("player_controls_seasons_icon")}
                        alt="recording icon"
                      />
                    </div>
                  : null
                }
                {
                  props.data.isRecording && !props.data.isSeries ?
                    <div style={{
                      position: 'absolute',
                      right: 16,
                      bottom: 10,
                      color: '#fff',
                      zIndex: 1,
                    }}>
                      <img
                        style={{ width: 35 }}
                        className="icon icon-record recording"
                        src={Asset.get("player_controls_recording_icon")}
                        alt="recording icon"
                      />
                    </div>
                  : null
                }
                <div className="background-transparent"></div>
              </div>
          }
        </FakeLink>
      </div>
      <div className="card-labels-container">
      { props.type !== 'square' ? CardHelper.createTitle(props.title) : !is_music_cover ? CardHelper.createTitle(props.title) : ''}
      {CardHelper.createLabel(props.label)}
    </div>
    </div>
  );
}

const cardTypes = ['portrait', 'landscape', 'highlight', 'user-profile', 'user-info', 'cd', 'channel', 'infinite', 'square', 'talent', 'epg_event', 'text', 'circle'];
Card.propTypes = {
  className: PropTypes.string,

  group_id: PropTypes.string,
  data: PropTypes.object,
  cover: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  title: PropTypes.string,
  label: PropTypes.string,
  href: PropTypes.string,
  bookmark: PropTypes.string,
  type: PropTypes.oneOf(cardTypes),
  focusable: PropTypes.bool,
  focusUp: PropTypes.string,
  focusRight: PropTypes.string,
  focusLeft: PropTypes.string,
  sibling: PropTypes.string,

  filterTV: PropTypes.string,

  badgesAlign: PropTypes.oneOf(['left', 'right']),
  badges: PropTypes.arrayOf(PropTypes.object),
  badgesHtml: PropTypes.string,

  unFocusHandler: PropTypes.func,
  clickHandler: PropTypes.func,
  onClickCb: PropTypes.func,
  focusHandler: PropTypes.func,
  setMetricsEvent: PropTypes.func,
  keyUpHandler: PropTypes.func,
  keyDownHandler: PropTypes.func,
  onLoadHandler: PropTypes.func,

  typeRender: PropTypes.string,
};

Card.defaultProps = {
  id: null,
  className: '',

  group_id: '',
  data: {},
  cover: '',
  title: '',
  label: '',
  href: null,
  bookmark:0,
  type: 'landscape',
  focusable: true,
  focusUp: null,
  focusRight: null,
  focusLeft: null,
  sibling: null,

  filterTV: '',

  badgesAlign: 'right',
  badges: [],
  badgesHtml: '',

  unFocusHandler: null,
  clickHandler: null,
  focusHandler: null,
  setMetricsEvent: null,
  keyUpHandler: null,
  keyDownHandler: null,
  onLoadHandler: null,
  onClickCb: null,

  typeRender: null,
};

export default Card;

export { cardTypes };
