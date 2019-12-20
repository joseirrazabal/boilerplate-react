import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import focusSetting from "./../Focus/settings";
import CardHelper from "./helpers";
import CoverImage from "../CoverImage";
import ActivesSingleton from "../../components/Header/ActivesSingleton";
import AnalyticsDimensionSingleton from "../../components/Header/AnalyticsDimensionSingleton";
import Asset from "../../requests/apa/Asset";
import getAppConfig from "../../config/appConfig";

import ChannelSingleton from "../../components/Epg/ChannelsSingleton";
import store from "../../store";
import { playFullMedia } from "../../actions/playmedia";
import FakeLink from "../../components/FakeLink";
import AAFPlayer from "../../AAFPlayer/AAFPlayer";

// Material Components
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Paper from "@material-ui/core/Paper";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import {
  showModal,
  MODAL_AOVIVO_NOTCHANNEL
} from "../../actions/modal";

// Material Components
import "./itemCard.css";
import LayersControl from "../../utils/LayersControl";

/* function createMarkup(markup) {
  return { __html: markup };
} */

function ItemCard(props) {
  let itemSearch = `${
    window.location.href.includes("/search") === true &&
    typeof props.data.id === "string"
      ? "card-container-search card-container"
      : "card-search-container"
  }`;
  const channelSubNivel =
    window.location.pathname.includes("/node/kids") ||
    window.location.pathname.includes("_") ||
    window.location.pathname.includes("/node/series")
      ? "card-container-one card-container"
      : itemSearch;
  console.log("data autor", props.data);
  console.log("data item", props.data.id);
  console.log("cover itemCard", props.cover);
  const focusClassName = props.focusable
    ? focusSetting.className
    : focusSetting.nonfocusable;
  console.log("focus item", focusClassName);
  const cardImgClassName = props.data.music_class
    ? `${props.data.music_class} ${
        window.location.href.includes("/search") === true
          ? "card-cover"
          : "card-cover"
      }`
    : `${
        window.location.href.includes("/search") === true &&
        typeof props.data.id === "number"
          ? "card-cover-search"
          : `${
              window.location.href.includes("/search")
                ? "card-cover-search-movies"
                : "card-cover"
            }`
      }`;
  const is_music_cover = props.is_music || props.data.music_class;
  const props_data = props.data;
  //const props_dataMetric = props.dataMetric;
  const handleError = event => {
    if (props.data.groupName) {
      const typeOfError = props.data.groupName.toLowerCase();
      event.target.src = CardHelper.getPlaceholder(typeOfError);
    } else event.target.src = CardHelper.getPlaceholder(props.type);
  };

  let placeholder = CardHelper.getPlaceholder(props.type);
  if (props.data.groupName) {
    const type = props.data.groupName.toLowerCase();
    placeholder = CardHelper.getPlaceholder(type);
  }

  function sendDimension() {
    const payload = new AnalyticsDimensionSingleton().getPayload();
    props.setMetricsEvent(payload);
    props.setMetricsEvent({ type: "executor" });
  }

  function sendMetric() {
    let label = "";
    const location = window.location.toString();
    const url = location.split("/");
    let action = url[url.length - 1];
    const props_data = props.data;
    const props_dataMetric = props.dataMetric;
    switch (props.type) {
      case "highlight":
        if (location.indexOf("claromusica") !== -1) {
          let title = props.title === "" ? " superdestacado" : props.title;
          let carruselTitle =
            props_dataMetric.carruselTitle === ""
              ? "superdestacado"
              : props.title;
          action = `${new ActivesSingleton().getTree()}/${carruselTitle}`;
          label = `${props_dataMetric.cardPosition} | ${title}`;
        } else {
          const props_data_format_type = props_data.format_types;
          if (props_data_format_type !== null) {
            if (typeof props_data_format_type === "string") {
              label = `${props_data_format_type} - `;
            } else {
              //if(typeof props_data_format_type === 'Array') {
              label = `${props_data_format_type.reduce(
                (previous, current) => previous + "," + current
              )} - `;
            }
          }
          const carruselTitle =
            props_dataMetric.carruselTitle !== null
              ? props_dataMetric.carruselTitle
              : "superdestacado";
          label += `${props.title} - ${props_dataMetric.cardPosition} | ${carruselTitle}`;
          action = new ActivesSingleton().getTree();
        }
        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "carrusel",
          eventAction: action,
          eventLabel: label
        });
        break;
      case "landscape":
        if (location.indexOf("claromusica") !== -1) {
          action = `${new ActivesSingleton().getTree()}/${
            props_dataMetric.carruselTitle
          }`;
          label = `${props_dataMetric.cardPosition} | ${props.title}`;
        } else {
          const props_data_format_type = props_data.format_types;
          if (typeof props_data_format_type !== "undefined") {
            if (typeof props_data_format_type === "string") {
              label = `${props_data_format_type} - `;
            } else if (typeof props_data_format_type === "Array") {
              label = `${props_data_format_type.reduce(
                (previous, current) => previous + "," + current
              )} - `;
            }
          }
          if (
            location.indexOf("talent") !== -1 ||
            location.indexOf("vcard") !== -1
          ) {
            action = "vcard";
            label += `-${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
          } else if (location.indexOf("socialProfile") !== -1) {
            action = "perfil";
            let title = props.data.title_uri.replace(/-/g, " ");
            label += `-${title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
          } else {
            action = new ActivesSingleton().getTree();
            label += `${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
          }
        }
        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "carrusel",
          eventAction: action,
          eventLabel: label
        });
        break;

      case "alugados":
        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "carrusel",
          eventAction: action,
          eventLabel: label
        });
        break;

      case "search":
        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "carrusel",
          eventAction: action,
          eventLabel: label
        });
        break;

      case "infinite":
        label = `${props_data.format_types}-${props_data.title} - ${props_dataMetric.cardPosition} | Listado Infinito`;
        action = new ActivesSingleton().getTree();
        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "carrusel",
          eventAction: action,
          eventLabel: label
        });
        break;
      case "user-profile":
      case "user-info":
        if (location.indexOf("vcard") !== -1) action = "vcard";
        label = `${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "carrusel",
          eventAction: action,
          eventLabel: label
        });
        break;
      case "channel":
        label = props_data.title;
        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "tv",
          eventAction: "menu canales",
          eventLabel: label
        });
        break;
      case "portrait":
        action = new ActivesSingleton().getTree();
        label = `${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "carrusel",
          eventAction: action,
          eventLabel: label
        });
        break;

      case "square":
        if (location.indexOf("claromusica") !== -1) {
          if (typeof props_data !== "undefined") {
            if (props_data.type === "radio") {
              if (props.stationTitle === "genero") {
                label = `${props_data.genre} - ${props_data.name}`;
                props.setMetricsEvent({
                  hitType: "event",
                  eventCategory: "radios",
                  eventAction: "genero",
                  eventLabel: label
                });
              } else {
                label = `${props.stationTitle} - ${props_data.name}`;
                props.setMetricsEvent({
                  hitType: "event",
                  eventCategory: "radios",
                  eventAction: "estaciones",
                  eventLabel: label
                });
              }
            } else if (
              props_data.type === "Playlist" ||
              props_data.type === "radios" ||
              props_data.type === "Radio"
            ) {
              action = `${new ActivesSingleton().getTree()}/${
                props_dataMetric.carruselTitle
              }`;
              label = `${props_dataMetric.cardPosition} | ${props.title}`;
              props.setMetricsEvent({
                hitType: "event",
                eventCategory: "carrusel",
                eventAction: action,
                eventLabel: label
              });
            }
          }
        }
        break;
      case "circle":
        if (location.indexOf("claromusica") !== -1) {
          if (props.stationTitle === "artistas") {
            props.setMetricsEvent({
              hitType: "event",
              eventCategory: "radios",
              eventAction: "artistas",
              eventLabel: props_data.artist
            });
          } else {
            action = `${new ActivesSingleton().getTree()}/${
              props_dataMetric.carruselTitle
            }`;
            label = `${props_dataMetric.cardPosition} | ${props.title}`;
            props.setMetricsEvent({
              hitType: "event",
              eventCategory: "carrusel",
              eventAction: action,
              eventLabel: label
            });
          }
        }

        break;
      case "epg_event":
        const props_data_format_type = props_data.format_types;

        if (typeof props_data_format_type !== "undefined") {
          if (typeof props_data_format_type === "string") {
            label = `${props_data_format_type} - `;
          } else if (typeof props_data_format_type === "Array") {
            label = `${props_data_format_type.reduce(
              (previous, current) => previous + "," + current
            )} - `;
          }
        }
        if (
          location.indexOf("talent") !== -1 ||
          location.indexOf("vcard") !== -1
        ) {
          action = "vcard";
          label += `-${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        } else if (location.indexOf("socialProfile") !== -1) {
          action = "perfil";
          let title = props.data.title_uri.replace(/-/g, " ");
          label += `-${title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        } else {
          action = new ActivesSingleton().getTree();
          label += `${props.title} - ${props_dataMetric.cardPosition} | ${props_dataMetric.carruselTitle}`;
        }

        props.setMetricsEvent({
          hitType: "event",
          eventCategory: "carrusel",
          eventAction: action,
          eventLabel: label
        });
        break;
      default:
        break;
    }
    props.setMetricsEvent({ type: "executor" });
    sendDimension();
  }

  let linkTo;
  if (props_data && props_data.ads === "app_behaviour")
    linkTo = props_data.href;
  else linkTo = CardHelper.getUri(props.href, props.group_id, props_data);

  let cover = props.cover.replace("http:", "https:");
  console.log("cover", cover);
  let config = getAppConfig();
  if (props_data.type === "Radio")
    cover =
      config.end_point_music + "proxyImage?url=" + cover + "&size&imwidth=165";
  let isGoingToPlay = false;
  let isGoingToPlayWithFilter = !!props.filterTV;
  //let activateFilter = null;
  linkTo = linkTo.indexOf("/") > 0 ? `/${linkTo}` : linkTo;
  if (props.isChannel || linkTo.indexOf("/player/") !== -1) {
    linkTo = "";
    isGoingToPlay = true;
    if (props.filterTV) {
      isGoingToPlayWithFilter = true;
      isGoingToPlay = false;
    }
  }

  const fullNameSplit = props.title.split(" ");

  const NameSeparate = () => {
    return (
      <div
        className={
          props.data.provider || props.data.episode
            ? "talent-name hide"
            : `${
                window.location.href.includes("/search") === true &&
                typeof props.data.id === "number"
                  ? "talent-name-search"
                  : "talent-name"
              }`
        }
      >
        <Typography component="span">
          <b>{fullNameSplit[0]}</b>
        </Typography>
        <Typography component="span">
          <b>{fullNameSplit[1]}</b>
        </Typography>
      </div>
    );
  };

  const EpisodeName = () => {
    return (
      <div
        className={props.data.episode ? "name-episode" : "name-episode hide"}
      >
        <Typography component="span">
          <b>{props.title}</b>
        </Typography>
      </div>
    );
  };

  let canPlay = false
  let channelNumber = 0

  if (props.isChannel) { // cuando viene de la busqueda is es un canal
    canPlay = ChannelSingleton.canPlayChannel(props.data.channel_group_id || props.data.group_id);
    channelNumber = props.data.channel_group_id || props.data.group_id
  } else {
    canPlay = ChannelSingleton.canPlayChannel(props.group_id);
    channelNumber = props.group_id
  }

  return (
    <div
      id={props.data.id}
      className={`card ${props.type} ${
        typeof props.data.id === "number" ? "card-logo" : ""
      } ${props.className} ${props.sibling ? "double" : ""}
        ${props.specialClassName}`}
      ref={props.onLoadHandler}
    >
      {CardHelper.createSibling(props.sibling)}

      <div
        className={`${channelSubNivel} ${
          typeof props.data.id === "number" ? "card-coner" : ""
        }`}
      >
        <FakeLink
          typeRender={props.typeRender}
          id={`link-${props.id}`}
          to={linkTo}
          style={props.styles}
          className={`link ${focusClassName} ${ window.location.href.includes("/search") ? '' : isGoingToPlay && !canPlay ? 'channelBlock' : ''}`}
          data-counter={props.positionInfinite}
          data-sn-up={props.focusUp}
          data-sn-right={props.focusRight}
          data-sn-left={props.focusLeft}
          onClick={e => {
            if (typeof props.setMetricsEvent === "function") {
              try {
                sendMetric();
              } catch (e) {
                console.error("Could not send metrics from card click", e);
              }
            }
            if (
              typeof props.clickHandler !== "function" &&
              !isGoingToPlay &&
              !isGoingToPlayWithFilter
            ) {
              return null;
            }
            if (typeof props.onClickCb === "function") {
              if (props.data && props.data.live_enabled == "0") {
                //si el link es a vcard no se tiene que ejecutar la funcion
                return null;
              } else {
                props.onClickCb(e); //Esta funcion se ocupa para la grilla de canales
              }
            }

            e.preventDefault();

            const dispatchPlayMedia = (group_id, filterTV) => {
              store.dispatch(
                playFullMedia({
                  playerstate: "PLAYING",
                  source: {
                    videoid: group_id
                  },
                  ispreview: false,
                  islive: true,
                  size: {
                    top: 0,
                    left: 0,
                    width: 1280,
                    height: 720
                  },
                  ispip: false,
                  showEpg: !!filterTV,
                  filterTV: filterTV
                })
              );
              props.history.push('/node/tv')
              LayersControl.showPlayer()
            };

            if (is_music_cover && typeof props.clickHandler === "function") {
              return props.clickHandler(props_data);
            } else if (isGoingToPlay) {
              if (!canPlay) {
                // redirect en grilla de canales
                store.dispatch(showModal({
                  modalType: MODAL_AOVIVO_NOTCHANNEL,
                  modalProps: {
                      callback: () => {
                      },
                      content: {code: 'empty_channels_live'}
                  }
                }));
                // props.history.push('/node/home')
              } else {
                dispatchPlayMedia(channelNumber);
                return null;
              }
            } else if (isGoingToPlayWithFilter) {
              let filterGroupid = null;
              new ChannelSingleton()
                .getFilteredChannels(props.group_id)
                .then(async availableChannels => {
                  if (availableChannels.length === 0) {
                    availableChannels.push({ groupId: props.group_id });
                  }
                  filterGroupid = availableChannels[0].group_id;
                  const currentPlayerOptions = AAFPlayer.getCurrentPlayerOptions();
                  if (
                    currentPlayerOptions.playerstate === "PLAYING" &&
                    currentPlayerOptions.islive &&
                    !currentPlayerOptions.hasOwnProperty("audiosource") &&
                    currentPlayerOptions.size.width < 1280
                  ) {
                    filterGroupid =
                      currentPlayerOptions.source &&
                      currentPlayerOptions.source.videoid
                        ? currentPlayerOptions.source.videoid
                        : filterGroupid;
                  }
                  filterGroupid &&
                    dispatchPlayMedia(filterGroupid, props.filterTV);
                });
              return null;
            } else {
              return props.clickHandler();
            }
          }}
          onFocus={() => {
            CardHelper.focusHandler(props.focusHandler, props_data);
            if (props_data.episode) {
              //TODO:Si se desea que al seleccionar el episodio se actualice la ficha, va esta linea.
              //store.dispatch(setResumeData(props_data));
            }
          }}
          onKeyUp={() => CardHelper.keyUpHandler(props.keyUpHandler, props)}
          onKeyDown={e =>
            CardHelper.keyDownHandler(e, props.keyDownHandler, props.data)
          }
          onBlur={props.unFocusHandler}
        >
          {window.location.href.includes("/search") === true &&
          typeof props.data.id === "number" ? (
            <div>
              {is_music_cover ? (
                <CoverImage
                  contentProps={props_data}
                  image={cover}
                  imagePlaceholder={CardHelper.getPlaceholder(props.type)}
                  type={props.type}
                  classComponent={cardImgClassName}
                />
              ) : props.type === "text" ? null : (
                <div
                  className={`${
                    window.location.href.includes("/search") === true &&
                    typeof props.data.id === "number"
                      ? "card-div-search"
                      : `${
                          window.location.href.includes("/search") === true &&
                          typeof props.data.id === "string"
                            ? "card-div-search-div"
                            : "card-div"
                        }`
                  }`}
                  style={{
                    backgroundImage: `url(${placeholder})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {props.cover !== "" && typeof props.data.id === "number" ? (
                    <div
                      className={cardImgClassName}
                      onError={handleError}
                      style={{
                        backgroundImage: `url(${props.cover})`,
                        backgroundPosition: "initial",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "137px 160px"
                      }}
                    />
                  ) : (
                    <div
                      className={cardImgClassName}
                      onError={handleError}
                      style={{
                        backgroundImage: `url(${props.cover})`,
                        backgroundPosition: "center"
                      }}
                    />
                  )}

                  <span
                    className="preview-progress"
                    style={{
                      width: `${props.bookmark}%`
                    }}
                  />
                </div>
              )}

              {props.type === "text" ? (
                <div className={`text`}> {props.data.channel_image} </div>
              ) : props.data &&
                (props.data.type || props.data.live_enabled) &&
                (props.data.type === "live" ||
                  props.data.live_enabled === "1") &&
                props.data.channel_number ? (
                <div className={`channel-number`}>
                  {/* {props.data.channel_number} */}
                </div>
              ) : (
                <Paper
                  elevation={5}
                  className={`badge-container ${(props.badgesAlign,
                  props.classes.paper)} `}
                >
                  {props.novo ? (
                    <Chip label="NOVO" className={props.classes.chip} />
                  ) : (
                    <div />
                  )
                  /* <div
                dangerouslySetInnerHTML={createMarkup(props.badgesHtml)}
              /> */
                  }
                </Paper>
              )}
              {props_data.provider !== "default" &&
                props_data.proveedor_name !== "AMCO" &&
                !props.hideInnerTitle && (
                  <div
                    className={`card-metadata ${
                      props.data.isRecord ? "recording" : ""
                    } ${props.data.isSeries ? "is-series" : ""} ${
                      props.data.isRecording ? "is-recording" : ""
                    }`}
                  >
                    <div
                      className="background-transparent"
                      style={{ display: "none" }}
                    >
                      <div className="inner-title">
                        {props.filterTV ? (
                          " "
                        ) : (
                          <React.Fragment>
                            <Typography
                              align="center"
                              variant="subheading"
                              noWrap
                            >
                              {props.title}
                            </Typography>
                          </React.Fragment>
                        )}
                        {typeof props.data.dateOfRecord === "string" ? (
                          <div style={{ color: "#aaa", fontSize: 14 }}>
                            {props.data.dateOfRecord}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {props.data.isSeries ? (
                      <div
                        style={{
                          position: "absolute",
                          right: 16,
                          bottom: 10,
                          color: "#fff",
                          zIndex: 1
                        }}
                      >
                        <img
                          style={{ width: 35 }}
                          className="icon icon-record recording"
                          src={Asset.get("player_controls_seasons_icon")}
                          alt="recording icon"
                        />
                      </div>
                    ) : null}
                    {props.data.isRecording && !props.data.isSeries ? (
                      <div
                        style={{
                          position: "absolute",
                          right: 16,
                          bottom: 10,
                          color: "#fff",
                          zIndex: 1
                        }}
                      >
                        <img
                          style={{ width: 35 }}
                          className="icon icon-record recording"
                          src={Asset.get("player_controls_recording_icon")}
                          alt="recording icon"
                        />
                      </div>
                    ) : null}
                  </div>
                )}
            </div>
          ) : (
            <Paper elevation={3} className="card-placeholder">
              {is_music_cover ? (
                <CoverImage
                  contentProps={props_data}
                  image={cover}
                  imagePlaceholder={CardHelper.getPlaceholder(props.type)}
                  type={props.type}
                  classComponent={cardImgClassName}
                />
              ) : props.type === "text" ? null : (
                <div
                  className={`${
                    window.location.href.includes("/search") === true &&
                    typeof props.data.id === "number"
                      ? "card-div-search"
                      : "card-div"
                  }`}
                  style={{
                    backgroundImage: `url(${props.data.ext_eventimage_name})`, // IMAGEN FONDO CANAL PARA TYPE SEARCH
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {/* ocultar channel number en search y mostrar en node/tv */}
                  {props.type === "search" ? <div></div> : props.channelNumber && (
                    <div className={'channel-number-grid'}>
                      <p>{ props.channelNumber }</p>
                    </div>
                  )}

                  {props.cover !== "" && typeof props.data.id === "number" ? (
                    <div
                      className={cardImgClassName}
                      onError={handleError}
                      style={{
                        backgroundImage: `url(${props.cover})`,
                        backgroundPosition: "initial",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "130px 160px"
                      }}
                    />
                  ) : (
                    props.type === "channel" ?
                    <div
                      className={cardImgClassName}
                      onError={handleError}
                      style={{
                        backgroundImage: `url(${props.cover})`,
                        backgroundPosition: "center",
                        backgroundSize: 135,
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    :
                    <div
                      className={cardImgClassName}
                      onError={handleError}
                      style={{
                        backgroundImage: `url(${props.cover})`,
                        backgroundPosition: "center"
                      }}
                    />
                  )}

                  <span
                    className="preview-progress"
                    style={{
                      width: `${props.bookmark}%`
                    }}
                  />

                  {/* IMAGEN DE FONDO  */}
                  {props.type === "search" ?
                    <div
                      className={cardImgClassName}
                      onError={handleError}
                      style={{
                        backgroundImage: `url(${props.data.channel_image})`, // LOGO  CANAL ARRIBA DEL FONDO PARA TYPE SEARCH
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        position: "absolute",
                        backgroundSize: '160px',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  : null}
                  {/* FIN IMAGEN DE FONDO  */}

                  {props.type === "alugados" ? (
                    <div className="content-info-alugados">
                      <div className="info-alugados">
                        <p>
                          alugado em {props.startDate} por {props.currency}
                          {props.price}
                        </p>
                        <p style={{ color: "#D2B007" }}>
                          {props.endDate}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {props.type === "text" ? (
                <div className={`text`}> {props.data.channel_image} </div> // logo canal
              ) : props.data &&
                (props.data.type || props.data.live_enabled) &&
                (props.data.type === "live" ||
                  props.data.live_enabled === "1") &&
                props.data.channel_number ? (
                <div>
                  {/* {props.data.channel_number} */}
                </div>
              ) : (
                <Paper
                  elevation={5}
                  className={`badge-container ${(props.badgesAlign,
                  props.classes.paper)} `}
                >
                  {props.novo ? (
                    <Chip label="NOVO" className={props.classes.chip} />
                  ) : (
                    <div />
                  )
                  /* <div
                dangerouslySetInnerHTML={createMarkup(props.badgesHtml)}
              />  */
                  }
                </Paper>
              )}
              {props_data.provider !== "default" &&
                props_data.proveedor_name !== "AMCO" &&
                !props.hideInnerTitle && (
                  <div
                    className={`card-metadata ${
                      props.data.isRecord ? "recording" : ""
                    } ${props.data.isSeries ? "is-series" : ""} ${
                      props.data.isRecording ? "is-recording" : ""
                    }`}
                  >
                    <div
                      className="background-transparent"
                      style={{ display: "none" }}
                    >
                      <div className="inner-title">
                        {props.filterTV ? (
                          " "
                        ) : (
                          <React.Fragment>
                            <Typography
                              align="center"
                              variant="subheading"
                              noWrap
                            >
                              {props.title}
                            </Typography>
                          </React.Fragment>
                        )}
                        {typeof props.data.dateOfRecord === "string" ? (
                          <div style={{ color: "#aaa", fontSize: 14 }}>
                            {props.data.dateOfRecord}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {props.data.isSeries ? (
                      <div
                        style={{
                          position: "absolute",
                          right: 16,
                          bottom: 10,
                          color: "#fff",
                          zIndex: 1
                        }}
                      >
                        <img
                          style={{ width: 35 }}
                          className="icon icon-record recording"
                          src={Asset.get("player_controls_seasons_icon")}
                          alt="recording icon"
                        />
                      </div>
                    ) : null}
                    {props.data.isRecording && !props.data.isSeries ? (
                      <div
                        style={{
                          position: "absolute",
                          right: 16,
                          bottom: 10,
                          color: "#fff",
                          zIndex: 1
                        }}
                      >
                        <img
                          style={{ width: 35 }}
                          className="icon icon-record recording"
                          src={Asset.get("player_controls_recording_icon")}
                          alt="recording icon"
                        />
                      </div>
                    ) : null}
                  </div>
                )}
            </Paper>
          )}
          {window.location.href.includes("/search") === true &&
          typeof props.data.id === "string" ? (
            <div className="card-search-box">
              <p className="card-content">{props.isChannel === true ? props.data.name : props.title}</p>
              <p className="card-content" style={{color: '#6d8fb2'}}>{props.label} {console.log('hora', props.label)}</p>
            </div>
          ) : null}
        </FakeLink>
      </div>

      <div
        className={
          window.location.href.includes("/search") === true &&
          typeof props.data.id === "number"
            ? "card-labels-container-search"
            : "card-labels-container"
        }>
        {props.type === "square" ? null : <EpisodeName />}
        {props.type === "square" || props.data.duration ? null : (
          <NameSeparate />
        )}
        {CardHelper.createLabel(props.label)}
        {props.data.groupName ? (
          <div className="type-talent">
            <Typography component="span">{props.data.groupName}</Typography>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const styles = theme => ({
  bigAvatar: {
    margin: 10,
    width: 60,
    height: 60
  },
  paper: {
    background: "transparent"
  },
  chip: {
    borderRadius: 6,
    background: theme.palette.secondary.main,
    height: "auto",
    padding: 2
  }
});

const cardTypes = [
  "portrait",
  "landscape",
  "alugados",
  "search",
  "highlight",
  "user-profile",
  "user-info",
  "cd",
  "channel",
  "infinite",
  "square",
  "talent",
  "epg_event",
  "text",
  "circle"
];
ItemCard.propTypes = {
  className: PropTypes.string,
  styles: PropTypes.object,
  classes: PropTypes.object.isRequired,
  group_id: PropTypes.string,
  data: PropTypes.object,
  cover: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string
  ]),
  title: PropTypes.string,
  roleName: PropTypes.string,
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

  badgesAlign: PropTypes.oneOf(["left", "right"]),
  badges: PropTypes.arrayOf(PropTypes.object),
  badgesHtml: PropTypes.string,
  // props rents
  endDate: PropTypes,
  startDate: PropTypes,
  price: PropTypes,
  currency: PropTypes,
  //
  unFocusHandler: PropTypes.func,
  clickHandler: PropTypes.func,
  onClickCb: PropTypes.func,
  focusHandler: PropTypes.func,
  setMetricsEvent: PropTypes.func,
  keyUpHandler: PropTypes.func,
  keyDownHandler: PropTypes.func,
  onLoadHandler: PropTypes.func,
  novo: PropTypes.bool,
  specialClassName: PropTypes,
  typeRender: PropTypes.string
};

ItemCard.defaultProps = {
  id: null,
  novo: false,
  className: "",
  styles: null,
  group_id: "",
  data: {},
  cover: "",
  title: "",
  roleName: "",
  label: "",
  href: null,
  bookmark: 0,
  type: "landscape",
  focusable: true,
  focusUp: null,
  focusRight: null,
  focusLeft: null,
  sibling: null,
  specialClassName: null,
  filterTV: "",
  endDate: null,
  startDate: null,
  price: null,
  currency: null,
  badgesAlign: "left",
  badges: [],
  badgesHtml: "",

  unFocusHandler: null,
  clickHandler: null,
  focusHandler: null,
  setMetricsEvent: null,
  keyUpHandler: null,
  keyDownHandler: null,
  onLoadHandler: null,
  onClickCb: null,

  typeRender: null
};

// export default withStyles(styles)(withRouter(ItemCard));
const mapStateToProps = (state, ownProps) => {
  return { };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      showModal,
    },
    dispatch
  );

export { cardTypes };
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(ItemCard)));
