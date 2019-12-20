import "./vcard.css";
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import Utils from "../../utils/Utils";
//import LayersControl from "../../utils/LayersControl";

// Actions
import { showNotification } from "../../actions/notification";
import { playFullMedia, playPipMedia } from "../../actions/playmedia";
import {  showPlayerLoading } from "../../reducers/user";

import { setResumeData } from "../../actions/resume";
import { showPay } from "../../actions/pay";
import { zuppay } from "../../actions/zupPay";
import { showSubscriptions } from "../../actions/subscriptions";
import { showPrice } from "../../actions/price";
import { showLastDigits } from "../../actions/lastDigits";
import { receiveIsLoggedIn } from "../../reducers/user";
import { showContentData } from "../../actions/contentData";
import { showPlayer } from "../../actions/player";
import { showPurchaseData } from "../../actions/purchaseData";
import { showValidZup } from "../../actions/valid_zup";
import {
  showModal,
  HIDE_MODAL,
  SHOW_MODAL,
  MODAL_LANGUAGES,
  MODAL_TOBUY,
  MODAL_CONFIRMATIONBUY,
  MODAL_ERROR,
  MODAL_GENERIC,
  MODAL_PIN,
  MODAL_TOBUY_LOADING,
  MODAL_CONFIRMATION,
  MODAL_REINTENTO,
  MODAL_EPISODE_SELECT,
  MODAL_RENTS_EXPIRED
} from "../../actions/modal";
import { setMetricsEvent } from "../../actions/metrics";

// Components
import EpisodeSelection from "../EpisodeSelection/index";
import Button from "../Button";
import Ribbon from "../Ribbon";
import Scrollable from "../Scrollable";
import DeviceStorage from "../../components/DeviceStorage/DeviceStorage";
import AnalyticsDimensionSingleton from "../../components/Header/AnalyticsDimensionSingleton";

// Requests
import favoriteDelTask from "../../requests/tasks/ficha/favoriteDelTask";
import favoriteTask from "../../requests/tasks/ficha/favoriteTask";
import RequestManager from "../../requests/RequestManager";
import Metadata from "../../requests/apa/Metadata";
import { UserSeenLast, getRentedByGroupId } from "../../requests/loader";
import Translator from "../../requests/apa/Translator";
import * as api from "../../requests/loader";
import Asset from "../../requests/apa/Asset";
//import AddFavorite from "../../requests/tasks/user/AddFavoriteTask";

import { updateFavorite, deleteFavorite } from "../../reducers/user";
import PlayerStreamingUtils from "../../utils/PlayerStreamingUtils";
import Device from "../../devices/device";
import settings from "../../devices/all/settings";
import AAFPlayer from "../../AAFPlayer/AAFPlayer";
import store from "../../store";

import { setLastTouchFavoritesData, setLastTouchData } from "./../../reducers/user";

import ZUPConfig from "../../config/ZUPConfig";

const config_remote_control = DeviceStorage.getItem("config_remote_control") !== "simple" ? true : false;

const TypeOffer = {
  A: 'subs',
  M: 'alug'
}
class VCard extends Component {
  constructor(props = {}) {
    super(props);
    this.provider_id = false;
    this.groupId = "";
    this.contentId = "";
    this.recommendations = [];
    this.state = {
      isFetching: true,
      purchaseButtonInfo: {},
      roles: [],
      externalrole: null,
      recommendations: [],
      hasPreview: false,
      serieData: {
        seasons: [],
        seasonNumber: null,
        episodeNumber: null
      },
      pgm: null,
      favoriteKey: null,
      visible: null,
      streamType: null,
      progress: 0,
      time_progress: null
    };

    this.PGM = null;
    this.sType = null;
    this.content_id = null;
    this.test_isOffertVisible = true;
    this.is_trailer = null;
    this.player = null;
    this.test_contentSerie = null;
    this.test_contentData = null;
    this.test_recomendation = null;
    this.test_offerAmco = null;
    this.test_offerZup = null;
    this.haveStartContentId = null;
    this.tooglePlay = false;
    this.favorite = true;
    this.lastEpisode = null;
    this.isTrailer = false;
    this.languages = [];
    this.dataBuy = [];
    this.currentGroupId = null;
    this.provider = null;
    this.keys = Device.getDevice().getKeys();
    this.handlePlay = this.handlePlay.bind(this);
    this.tryHandlePlay = this.tryHandlePlay.bind(this);
    this.handleEpisodeClick = this.handleEpisodeClick.bind(this);
    this.handleRecommendationClick = this.handleRecommendationClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.showLanguages = this.showLanguages.bind(this);
    this.showEpisodeSelect = this.showEpisodeSelect.bind(this); // MOSTRAR EPISODIOS
    this.showToBuy = this.showToBuy.bind(this);
    this.focusDefaultElement = this.focusDefaultElement.bind(this);
    this.initPlayer = this.initPlayer.bind(this);
    this.getAllContentData = this.getAllContentData.bind(this);
    this.setterHandler = this.setterHandler.bind(this);
    this.isReplayContent = this.isReplayContent.bind(this);
    this.handleUpdateProgress = this.handleUpdateProgress.bind(this);
    this.back = this.back.bind(this);

    this.playerStreamingUtils = new PlayerStreamingUtils();
    this.action = () => {};
    this.isFavouriteButtonVisible = false;
    this.isPlayTrailerButtonVisible = false;
    this.toggleFunctions = Utils.getToggleFunctionsFromMetadata();
    this.bookMarkByGroupId = null;
    this.isSerie = false;

    this.payway_token_offer = null;
  }

  componentWillMount(){
    getRentedByGroupId(this.props.match.params.groupId)
      .then(data=>{
      this.setState({
        renderItem:data,
        isLoading: false
      })
    });
  }

  filterFavorited = (favorited, id) => {
    if (favorited.filter) {
      const favorite = favorited.filter(it => it.id == id)[0];

      if (favorite) return true;
      else return null;
    }
  };

  addToFavorite = event => {
    this.sendMetric("agregar a mi lista");
    event.preventDefault();
    this.setState({ visible: true });
    const p = {
      object_id: this.groupId,
      object_type: 1,
      user_hash: this.props.user.session_userhash
    };

    let params = new favoriteTask(p);
    RequestManager.addRequest(params)
      .then(data => {
        // Actualizar favoritos y seen con el mismo valor de favorited
        if (data.lasttouch && data.lasttouch.favorited) {
          const lastTouchFav = data.lasttouch.favorited;
          store.dispatch(setLastTouchData(lastTouchFav));
          store.dispatch(setLastTouchFavoritesData(lastTouchFav));
        }

        this.props.updateFavorite(this.state.favoriteData);
        if (data.response) {
          let message = Translator.get(
            "add_favorite_message",
            "Se agrego, {title} a mis favoritos."
          );
          message = message.replace("{title}", this.props.resume.title);
          this.props.showNotification({
            show: true,
            title: message,
            faClass: "fa-plus",
            type: "message"
          });
          this.setState({ visible: null });
          this.props.setResumeData({
            favouriteButton: this.getFavouriteButton()
          });
        }
      })
      .catch(e => {
        this.setState({ visible: null });
        const modal = {
          modalType: MODAL_ERROR,
          modalProps: {
            content: e
          }
        };
        this.props.showModal(modal);
      });
  };

  deleteFavorite = event => {
    this.sendMetric("quitar de mi lista");
    event.preventDefault();
    this.setState({ visible: true });

    const p = {
      object_id: this.groupId,
      object_type: 1,
      user_hash: this.props.user ? this.props.user.session_userhash : null
    };

    let params = new favoriteDelTask(p);
    RequestManager.addRequest(params)
      .then(data => {
        this.props.deleteFavorite(this.groupId);
        if (data.response) {
          // Actualizar favoritos y seen con el mismo valor de favorited (para que lo tome level-user)
          if (data.lasttouch && data.lasttouch.favorited) {
            const lastTouchFav = data.lasttouch.favorited;
            store.dispatch(setLastTouchData(lastTouchFav));
            store.dispatch(setLastTouchFavoritesData(lastTouchFav));
          }

          let message = Translator.get(
            "delete_favorite_message",
            "Se removió, {title} de mis favoritos."
          );
          message = message.replace("{title}", this.props.resume.title);
          this.props.showNotification({
            show: true,
            title: message,
            faClass: "fa-minus",
            type: "message"
          });
          this.setState({ visible: null });
          this.props.setResumeData({
            favouriteButton: this.getFavouriteButton()
          });
        }
      })
      .catch(e => {
        const modal = {
          modalType: MODAL_ERROR,
          modalProps: {
            content: e
          }
        };
        this.props.showModal(modal);
      });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      //this.props.resume.key!== nextProps.resume.key ||
      JSON.stringify(this.state) !== JSON.stringify(nextState)
    );
  }

  handleKeyPress(e) {
    const playerIsPlayingInPip = AAFPlayer.livePlayingAsPip();
    if (AAFPlayer.playerOptions) {
      if (AAFPlayer.playerOptions.playerstate && !playerIsPlayingInPip) return;
    } else if (!Utils.isModalHide()) {
      return;
    }

    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    console.log("Listening Ficha, currentKey", currentKey);
    switch (currentKey) {
      case "BLUE":
        e.preventDefault();
        e.stopPropagation();
        if (this.isPlayTrailerButtonVisible) this.handlePlay(this.isTrailer);
        break;
      case "SUB_AUD":
      case "GREEN":
        e.preventDefault();
        e.stopPropagation();
        this.showLanguages(this.languages);
        break;

      //case 'FAV':
      case "YELLOW":
        e.preventDefault();
        e.stopPropagation();
        if (this.isFavouriteButtonVisible) this.action(e);
        break;
      case "UP":
        this.scrollVertical(0);
        break;
      case "DOWN":
        this.scrollVertical(null);
        break;
      case "BACK":
        e.preventDefault();
        e.stopPropagation();
        this.back();
        break;
      default:
        break;
    }
  }

  back() {
    this.props.history.goBack();
    if (window.location.href.indexOf("/vcard") !== -1) {
      setTimeout(() => {
        const pathname = window.location.pathname.split("/");
        const goGroupIdBack = pathname[2] ? pathname[2] : "";
        this.groupId = goGroupIdBack;
        this.getAllContentData(goGroupIdBack);
      }, 3000);
    }
  }

  async handleUpdateProgress(evnt) {
    let groupID = null;
    let bookMark = null;
    let imageFrames = null;
    let lasTime = null;
    if (evnt && evnt.detail && evnt.detail.videoid) {
      groupID = evnt.detail.videoid;
    }
    const resp = await api.getBookmark(groupID);
    if (
      resp &&
      resp.response &&
      resp.response.groups &&
      resp.response.groups[0]
    ) {
      bookMark = resp.response.groups[0];
      imageFrames = bookMark.image_frames;
      lasTime = bookMark.vistime.last.time;
      if (imageFrames) {
        imageFrames = Utils.getImageFrame(imageFrames, lasTime);
        const rpClass = "resume-preview";
        var previewResume =
          document.getElementsByClassName(rpClass) &&
          document.getElementsByClassName(rpClass)[0] &&
          document
            .getElementsByClassName(rpClass)[0]
            .getElementsByTagName("img") &&
          document
            .getElementsByClassName(rpClass)[0]
            .getElementsByTagName("img")[0];
        if (previewResume) {
          previewResume.src = imageFrames;
        }
      }
    }
  }

  isReplayContent() {
    const player = this.props.player;
    return (
      player.playerstate === "PLAYING" &&
      player.source.videoid &&
      player.isReplay
    );
  }

  async componentDidMount() {
    const match = this.props.match;
    const groupId = match.params.groupId;
    //---------------------------------------------------------------------
    let [
      purchaseButtonInfo,
      contentData,
      recommendations,
      CardCredit
    ] = await Promise.all([
      api.GetOffersZUP({ groupId }),
      api.contentData(groupId),
      api.contentRecomendations(groupId),
      api.CardCredit()
    ]).catch((err) => {
      return(
        this.showModalSinContent(err)
      )
    });
    //----------------------------------------------------------------
    let test = null;
    this.test_offerAmco = purchaseButtonInfo;
    this.test_contentData = contentData;
    this.test_recomendation = recommendations;
    console.log("test_offerAmco", this.test_offerAmco, this.test_contentData);

    // GET CARD CREDIT
    console.log("test_CardCredit", CardCredit);
    // ADD CARD CREDIT TO REDUX
    this.props.showLastDigits(CardCredit);

    // ADD OFFER AMCO TO REDUX
    this.props.showPay(purchaseButtonInfo);
    console.log("test_purchaseButtonInfo", purchaseButtonInfo, contentData);

    // ADD OFFER DE ZUP TO REDUX
    if (purchaseButtonInfo.response.offers !== undefined) {
      console.log("[AMCO][OFFERS] ALL offers ", purchaseButtonInfo.response.offers);
      // filtrar para traer tovd y sovd (alquiler y subscription)
      // el filtro ya estaba, agrego subcripcion (= A) por que no se que mas puede traer
      let VODOffers = purchaseButtonInfo.response.offers.filter(e => e.product_id =='M' || e.product_id == 'A');
      console.log("[AMCO][OFFERS] VOD offers", VODOffers);
      // let keys = purchaseButtonInfo.response.offers.map(e => e.key);
      let keys = VODOffers.map(e => e.key);
      console.log("[AMCO][OFFERS]test_prueba_offerAmco", keys);
      test = await api.getOffers(contentData.group.common.title, keys, keys);
      const prueba = await api.getListOffers();
      console.log("jose bien 01", prueba)
    }
    console.log("test_purchaseButtonInfo 1 ", test);
    this.props.zuppay(test);
    this.test_offerZup = test;

    // GROUP TITLE AND PICTURE
    let ContentGroup = contentData;
    this.props.showContentData(ContentGroup);

    // PRICE Y SUBSCRIPTION THE ZUP
    let Price;
    let subscription;
    let Prices;
    let subscriptions;
    if (test !== null) {
      Price = test.data.addons.filter(
        e => e.name === purchaseButtonInfo.response.offers[0].key
      );
      Prices = Price.length === 0 ? undefined : Price[0].totalPrice;
      subscription = test.data.addons.filter(
        e => e.name === purchaseButtonInfo.response.offers[0].key
      );
      subscriptions =
        subscription.length === 0
          ? undefined
          : subscription[0].validity.duration;
    } else {
      Prices = undefined;
      subscriptions = undefined;
    }

    // ADD SUBSCRIPTION TO REDUX
    this.props.showSubscriptions(subscriptions);

    // ADD PRICE TO REDUX
    //this.props.showPrice(Prices)

    //-----------------------------------------------------

    document.addEventListener("keydown", this.handleKeyPress, true);
    document.addEventListener(
      settings.update_progress,
      this.handleUpdateProgress
    );

    const lastEpisode = this.props.resume.lastEpisode;
    if (
      lastEpisode &&
      lastEpisode !== groupId &&
      groupId === this.props.resume.groupId &&
      !this.isReplayContent()
    ) {
      this.groupId = lastEpisode;
    } else if (this.isReplayContent() && !this.props.player.islive) {
      this.groupId = this.props.player.source.videoid;
    } else {
      this.groupId = groupId;
    }

    if (this.canGetAllContentData()) {
      this.getAllContentData(this.groupId);
    }

    console.log("MUERE FICHA");
  }

  componentWillUnmount() {
    document.removeEventListener(
      settings.update_progress,
      this.handleUpdateProgress
    );
    document.removeEventListener("keydown", this.handleKeyPress, true);
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      nextProps.resume.isBack !== this.props.resume.isBack &&
      (this.props.resume.isBack || nextProps.resume.isBack)
    ) {
      this.getSeeLast(this.props.match.params.groupId);
    }
  }

  componentWillReceiveProps(nextProps) {
    const lastEpisode = nextProps.resume.lastEpisode;
    const match = this.props.match;
    const groupId = match.params.groupId;
    const { isFetching } = this.state;
    this.lastEpisode = lastEpisode;

    if (lastEpisode && this.groupId !== lastEpisode && !isFetching) {
      this.groupId = lastEpisode;
      if (groupId === nextProps.resume.groupId) {
        this.getAllContentData(this.groupId);
      } else {
        this.getAllContentData(groupId);
      }
    }
  }

  async getSeeLast(groupId = "", resumeData = {}) {
    let lastContentSeen = this.props.match.params.groupId;
    if (this.props.user.isLoggedIn && groupId) {
      try {
        const seenLastInfo = await UserSeenLast(groupId);
        if (seenLastInfo) {
          const vistime = seenLastInfo.vistime;
          const viewed = vistime && vistime.viewed == "true";
          if (viewed && seenLastInfo.episode) {
            lastContentSeen = seenLastInfo.episode.id;
          }
        }
      } catch (error) {
        console.error("UserSeenLast error", error);
      }
      this.getAllContentData(lastContentSeen);
    }
  }

  showModalSinContent() {
    const modal = {
      modalType: MODAL_RENTS_EXPIRED,
      modalProps: {
        serieData: this.serieData,
        //handleEpisodeClick: this.handleEpisodeClick
      }
    };
    this.props.showModal(modal);
  }

  getSeasonId(contentData) {
    return (
      contentData &&
      contentData.group &&
      contentData.group.common &&
      contentData.group.common.extendedcommon &&
      contentData.group.common.extendedcommon.media &&
      contentData.group.common.extendedcommon.media.serieseason &&
      contentData.group.common.extendedcommon.media.serieseason.id
    );
  }

  setIsSerie(value) {
    this.isSerie = value;
  }

  getIsSerie() {
    return this.isSerie;
  }

  async getSeeLastProgress(groupId = "") {
    try {
      const seenLastInfo = await UserSeenLast(groupId);
      if (seenLastInfo) {
        const vistime = seenLastInfo.vistime;
        const isSerie = !!seenLastInfo.serie;
        let progress =
          vistime.last && vistime.last.time
            ? isSerie
              ? vistime.last.progress
              : vistime.max.progress
            : 0;
        let time =
          vistime.last && vistime.last.time && progress != 100
            ? isSerie
              ? vistime.last.time
              : vistime.max.time
            : "00:00:00";
        time = time.replace(":", "h-").replace(":", "m-");
        time = `${time}s`;
        this.setState({
          time_progress: time,
          progress
        });
        console.log("UserSeenLast SEEN LAST: ", this.state);
      }
    } catch (error) {
      console.error("UserSeenLast error", error);
    }
  }

  componentDidUpdate() {
    if (this.currentGroupId !== this.groupId) {
      this.currentGroupId = this.groupId;
    }

    /*
    Se agrega el metodo languageRefresh() para setear la variable this.languages
    -- ya que solo setea al inicio de la carga de la ficha --
    */
    this.languageRefresh(this.groupId);
  }

  /*
  Esta promesa espera el objeto contentData, actualmente solo utiliza para setear la variable this.languages
  */
  async languageRefresh(groupId = "") {
    let contentData = this.test_contentData;

    //------------------------------------------------------------------
    console.log("TRAEME YA >>>>>>", api);
    if (
      contentData &&
      contentData.group &&
      contentData.group.common &&
      contentData.group.common.extendedcommon &&
      contentData.group.common.extendedcommon.media &&
      contentData.group.common.extendedcommon.media.language &&
      contentData.group.common.extendedcommon.media.language.options &&
      contentData.group.common.extendedcommon.media.language.options.option
    ) {
      this.languages =
        contentData.group.common.extendedcommon.media.language.options.option;
    }
  }

  focusDefaultElement() {
    //Solo pasa el foco a la ficha si no hay alguna ventana modal activa
    if (Utils.isModalHide()) {
      window.SpatialNavigation.focus("main_container");
    }
  }

  scrollVertical(value) {
    /*Scrollea el div scroller-container verticalmente deacuerdo al valor recivido como parametro*/
    //Esto solo aplica para Hisense
    if (Utils.isHisense()) {
      const scrollContainer =
        document.getElementsByClassName("scroller-container") &&
        document.getElementsByClassName("scroller-container")[0]
          ? document.getElementsByClassName("scroller-container")[0]
          : null;
      const activeElement = document.activeElement;

      if (
        scrollContainer &&
        activeElement.pathname &&
        activeElement.pathname.includes("/socialProfile/")
      ) {
        const scrollTop = value === null ? scrollContainer.scrollHeight : value;
        scrollContainer.scrollTop = scrollTop;
      }
    }
  }

  getPlayButton({
    isPlayButtonVisible,
    hasPreview,
    handlePlay,
    episode,
    season
  }) {
    let playText = Translator.get("npvr_confirm_play", "Ver ahora");

    console.log("hasPreview", hasPreview);
    const trailerButton = hasPreview ? (
      <Button
        className="elementopredeterminado"
        textBottom={Translator.get("btn_trailer", "Trailer")}
        //iconClassName={"fa fa-film"}
        text={<img style={{height: 20 }} src={`${Asset.get("net_vcard_trailer")}`} />}
        onClick={() => {
          handlePlay(!isPlayButtonVisible);
        }}
      />
    ) : null;

    return isPlayButtonVisible ? (
      <Button
        className="elementopredeterminado"
        textBottom={playText}
        iconClassName={"fa fa-play"}
        //colorCode={config_remote_control ? "blue" : null}
        onClick={() => {
          this.setState({isLoading:true},() => {
            this.props.showPlayerLoading(true)
             handlePlay(!isPlayButtonVisible);
          })
        }}
      />
    ) : (
      trailerButton
    );
  }

  getPlayTrailerButtonVisibility(isPlayButtonVisible, hasPreview) {
    return isPlayButtonVisible || hasPreview;
  }
  getFavouriteButton() {
    let handlerList;
    if (this.props.user.groups)
      handlerList = this.filterFavorited(this.props.user.groups, this.groupId);
    let icon = handlerList ? "fa-star" : "fa-star-o";
    this.action = handlerList ? this.deleteFavorite : this.addToFavorite;
    if (this.props.user.isLoggedIn != true) {
      this.isFavouriteButtonVisible = false;
      return null;
    }
    this.isFavouriteButtonVisible = true;
    if (!this.state.visible) {
      return (
        <Button
          textBottom={Translator.get("grupo_button_addFan", "Mi lista")}
          iconClassName={`fa ${icon}`}
          //colorCode={config_remote_control ? "yellow" : null}
          onClick={this.action}
        />
      );
    } else {
      return (
        <Button
          textBottom={Translator.get("grupo_button_addFan", "Mi lista")}
          iconClassName={`fa ${icon}`}
          colorCode={config_remote_control ? "yellow" : null}
        />
      );
    }
  }

  getLangButton() {
    return (
      <Button
        textBottom={Translator.get("ficha_lang_label", "Idioma")}
        iconClassName={"fa fa-comment"}
        //colorCode={config_remote_control ? "green" : null}
        onClick={() => this.showLanguages()}
      />
    );
  }

  // CREAMOS EL BOTON APRA MSOTRAR LOS EPISODIOS
  getEpisodeButton() {
    return (
      <Button
        textBottom={Translator.get("ficha_lang_label", "Episodios")}
        iconClassName={"fa fa-comment"}
        //colorCode={config_remote_control ? "green" : null}
        onClick={() => this.showEpisodeSelect()}
      />
    );
  }

  // getBuyButton() {
    /*
    let subscriptions = this.props.resume.result.subscriptions.showSubscriptionsProps;
    let price;
    let scale;
    let Price_data;
    let Price_start;
    let Price_end;
    if (this.props.resume.result.price.showPriceProps !== undefined && this.props.resume.result.price.showPriceProps.amount !== null) {
       price = this.props.resume.result.price.showPriceProps.amount;
       scale = this.props.resume.result.price.showPriceProps.scale;
       Price_data = price.toString();
       Price_start = Price_data.slice(0, -scale);
       Price_end = Price_data.slice(-scale);
    } else {
       price = undefined;
       scale = undefined;
    }

    let productId;
    if (this.props.pay.response.offers !== undefined && this.props.pay.response !== undefined) {
        productId = this.props.pay.response.offers[0].product_id;
    } else {
      productId = ""
    }

    let Renta = subscriptions === undefined ? "" : `Renta ${subscriptions} hrs`;
    let Assinatura = productId === "A" && subscriptions !== undefined ? `${subscriptions} mês de assinatura`: Renta;

    return (
      <Button
        //textBottom={Assinatura}
        text={`${price === undefined ? "Nofertas" : `R$${Price_start},${Price_end}`}`}
        onClick={() => {
          if (subscriptions === undefined && price === undefined) {
               return null
          }
          else {
            return this.showToBuy()
          }

        }}
      />
    );
*/

/*
if(this.test_offerAmco.response.offers !== undefined && this.test_offerZup.data !== undefined) {
  ButtonPrices = this.test_offerAmco.response.offers.map(res => {
         this.test_offerZup.data.addons.map(e => {
           console.log("", e.name)
             if (e.name === res.key) {
              return (
                <div key={res.key}>
                  <Button
                //textBottom={Assinatura}
                text={`12.36`}
                onClick={() => {
                    return this.showToBuy()
                }}
              />
                </div>
               )
             }
     })
})
}*/

  getBuyButton() {
    // paso la lista entera y ordeno (primero tvod, segundo svod)
    const list = this.test_offerZup.data.addons
    list.sort((a, b) => (a.name < b.name) ? 1 : -1)

    // creo array obj, valor para los productos validos
    const codeOfferValid = {}
    this.test_offerAmco.response.offers.map(amco => codeOfferValid[amco.key] = amco.product_id)

    // filtro la lista, verificando con el objeto valor de production validos
    // limito a solo un caso de cada uno
    let exist = {}
    const OfferValid = list.filter( item => {
      // si aun no se incluyo un item (sea tvod, svod) y si es valido el codigo, lo agrego
      if (!exist[codeOfferValid[item.name]] && codeOfferValid[item.name]) {
        exist[codeOfferValid[item.name]] = true
        return true
      }
      return false
    })

    const textButton = (name) => {
      switch (TypeOffer[codeOfferValid[name]]) {
        case "subs":
          return Translator.get("net_assinar_por", 'assinar por')
        case "alug":
          return Translator.get("net_alugar_por", 'alugar por')
        default:
          return Translator.get("net_alugar_por", 'alugar por')
      }
    }

    if (this.test_isOffertVisible === true && this.test_offerZup !== undefined) {
      if (OfferValid.length <= 0) {
        return <Button text={`NoOffer`} />
      }

      return OfferValid.map(e => {
        let currency = ZUPConfig.getItem('currency')[e.totalPrice.currency];
        let data_price = e.totalPrice;
        let Price_show = parseFloat( e.totalPrice.amount / 10 ** e.totalPrice.scale ).toFixed(2);// GOOSE -- calculo del precio con x digitos

        return (
            <Button
              key={e.name}
              textBottom={textButton(e.name)}
              text={`${currency} ${Price_show.replace('.', ',')}`}
              onClick={() => {
                return this.showToBuy(data_price, e, TypeOffer[codeOfferValid[e.name]]);
              }}
            />
        );
      });
    }
  }

  resolveContentTalent(universal_id, external) {
    let resolveKey = JSON.stringify({
      default: {
        enabled: true,
        provider: "gracenote"
      }
    });
    resolveKey = Metadata.get("external_metadata", resolveKey);
    resolveKey = JSON.parse(resolveKey);
    const region = DeviceStorage.getItem("region");
    let providerTalent = null;
    let externalTalents = null;
    if (resolveKey) {
      if (
        Utils.isNotNullOrNotUndefined(resolveKey[region]) &&
        resolveKey[region]["enabled"] &&
        resolveKey[region]["enabled"] === true
      ) {
        providerTalent = resolveKey[region]["provider"];
      } else {
        if (
          Utils.isNotNullOrNotUndefined(
            resolveKey["default"] &&
              resolveKey["default"]["enabled"] &&
              resolveKey["default"]["enabled"] === true
          )
        ) {
          providerTalent = resolveKey["default"]["provider"];
        }
      }
      // Después aún si hay key, verificar si viene la llave en universal_id
      if (
        providerTalent &&
        universal_id &&
        universal_id["metadata_providers"] &&
        universal_id["metadata_providers"][providerTalent]
      ) {
        // Verificar si viene el array de talentos
        this.provider_id =
          universal_id["metadata_providers"][providerTalent]["provider_id"];
        let arrTalent =
          external[providerTalent] && external[providerTalent]["cast"];
        if (arrTalent) {
          externalTalents = this.getExternalTalents(
            external[providerTalent]["cast"]
          );
        }
      }
    }

    return externalTalents;
  }

  canGetAllContentData() {
    return !this.lastEpisode || this.groupId == this.lastEpisode;
  }

  async getAllContentData(groupId = "") {
    const [contentData, recommendations] = await Promise.all([
      api.contentData(groupId),
      api.contentRecomendations(groupId)
    ]);
    await this.getSeeLastProgress(this.groupId);

    // //Cambio, si es serie la llamada de PBI requiere el parametro season_id que se obtiene de content/data
    const seasonId = this.getSeasonId(contentData);

    // Purchase
    let purchaseButtonInfo = this.test_offerAmco;
    let isPlayButtonVisible;
    if (seasonId) {
      // SERIE
      this.setIsSerie(true);
      // --------------------------- END SERIE ------------------------------------------
    }

    this.recommendations = recommendations;
    //console.log(">> contentData:", contentData);
    //console.log("test_ficha 1");
    const common = contentData.group.common;
    const { title, large_description } = common;
    const duration = Utils.formatDuration(common.duration);
    let previewImage = common.image_still;
    let frameImage = common.image_frames;
    const spriteImage = common.image_sprites;
    const extendedcommon = common.extendedcommon;
    const genreArray = extendedcommon.genres ? extendedcommon.genres.genre : [];
    const genresText = genreArray
      .slice(0, 3)
      .map(genre => genre.desc)
      .join(", ");

    let bookMarkByGroupIdAll = null;

/*     if (false) {
      console.log("test_ficha 2");
      const getBookmark = await api.getBookmark(groupId);
      if (
        getBookmark &&
        getBookmark.response &&
        getBookmark.response.groups &&
        getBookmark.response.groups[0]
      ) {
        bookMarkByGroupIdAll = getBookmark.response.groups[0];
      }
      if (bookMarkByGroupIdAll) {
        let time_progress = bookMarkByGroupIdAll.vistime.last.time;
        if (frameImage) {
          previewImage = Utils.getImageFrame(frameImage, time_progress);
          frameImage = previewImage;
        }
      }
    } */

    //console.log("test_ficha 3")
    const role = extendedcommon.roles ? extendedcommon.roles.role : [];

    const media = extendedcommon.media;
    this.sendVirtualPage(common);
    const year = media.publishyear;
    const lenguage = media.language.dubbed == "true";
    const subtitle = media.language.subbed == "true";
    const resolution = media.profile.hd.enabled == "true";
    const rating = media.rating.code;
    const hasPreview = media.haspreview == "true";

    isPlayButtonVisible = false;
    //console.log("[OFFER] purchaseButtonInfo", purchaseButtonInfo);

    if (typeof purchaseButtonInfo === "object") {
      if (typeof purchaseButtonInfo.response === "object") {
        if (typeof purchaseButtonInfo.response.offers === "object") {
          let info_payway_token = purchaseButtonInfo.response.offers.filter(
            e => {
              if (e.purchase_data.payway_token_play !== undefined) {
                return e.purchase_data.payway_token_play;
              } else {
                return e.purchase_data;
              }
            }
          );
          this.player = info_payway_token;
          //console.log("[OFFER] info_payway_token", info_payway_token);
          if (info_payway_token.length !== 0) {
            if (
              info_payway_token[0].purchase_data !== undefined &&
              info_payway_token[0].purchase_data !== ""
            ) {
              isPlayButtonVisible = true;
              this.test_isOffertVisible = false;
            }
          }
        }
      }
    }

    // isPlayButtonVisible=false;
    // this.test_isOffertVisible=true;
    // console.log("[OFFER] purchaseButtonInfo", purchaseButtonInfo)

    // if ( purchaseButtonInfo && purchaseButtonInfo.response && purchaseButtonInfo.response.offers ) {
    //   // si hay offers
    //   for (var i = 0; i < purchaseButtonInfo.response.offers.length; i++) {
    //     // para cada offer
    //     var el = purchaseButtonInfo.response.offers[i];
    //     if ( typeof el.purchase_data === "object" && el.purchase_data.payway_token_play ) {
    //       // si hay payway_token_play - uso el payway_token_play
    //       console.log('[OFFER] -- el.purchase_data.payway_token_play ',el)
    //       this.player = el.purchase_data.payway_token_play;
    //       isPlayButtonVisible = true;
    //       this.test_isOffertVisible = false;
    //       break;
    //     }
    //   }
    // }

    this.isTrailer = !isPlayButtonVisible;
    this.isPlayTrailerButtonVisible = this.getPlayTrailerButtonVisibility(
      isPlayButtonVisible,
      hasPreview
    );
    const defaultLang = DeviceStorage.getItem("default_lang");
    const lang = media.language.options.option.find(
      language => language.option_id == defaultLang
    );
    //console.log("QUIERO IDIOMA", subtitle);
    this.languages = media.language.options.option;
    this.dataBuy = "tengo datos";
    this.provider = media.proveedor.nombre;
    const externalrole = this.resolveContentTalent(
      contentData.group.universal_id,
      contentData.group && contentData.group.external
    );
    const serieData = {
      groupId,
      seasons: [],
      seasonNumber: null,
      episodeNumber: null
    };
    const favoriteData = {
      id: contentData.group.common.id,
      title: contentData.group.common.title,
      image_small: contentData.group.common.image_small,
      format_types: contentData.group.common.extendedcommon.format.types,
      proveedor_name:
        contentData.group.common.extendedcommon.media.proveedor.nombre
    };
    //console.log(">> favoriteData:", favoriteData);
    let serieTitle = "";
    if (media.serie) {
      const contentSerie = await api.contentSerie(groupId);
      serieData.seasons = contentSerie.seasons;
      serieData.seasonNumber = media.episode.season;
      serieData.episodeNumber = media.episode.number;
      serieTitle = media.serie.title + " : ";
    }
    this.contentId = lang ? lang.content_id : "";
    this.lastEpisode = null;

    const seasons = this.state.serieData.seasons;

    let progress = 0;

    if (
      bookMarkByGroupIdAll &&
      bookMarkByGroupIdAll.vistime &&
      bookMarkByGroupIdAll.vistime.last &&
      bookMarkByGroupIdAll.vistime.last.progress
    ) {
      progress = bookMarkByGroupIdAll.vistime.last.progress;
    }

    this.props.setResumeData({
      title: serieTitle + title,
      serieTitle: media.serie && media.serie.title ? media.serie.title : "",
      episodeTitle: title,
      episode:
        media.episode && media.episode.number
          ? media.episode && media.episode.number
          : "",
      season:
        media.episode && media.episode.season
          ? media.episode && media.episode.season
          : "",
      year,
      lenguage,
      subtitle,
      resolution,
      large_description,
      infoRented: this.state.renderItem && this.state.renderItem.endDate || false,
      rating,
      category: genresText,
      duration,
      purchaseButtonInfo,
      previewImage,
      frameImage,
      spriteImage,
      showBack: false,
      seasonsText:
        seasons.length > 0
          ? seasons.length === 1
            ? `1 ${Translator.get("season")}`
            : `${seasons.length} ${Translator.get("season")}s`
          : null,
      groupId,
      progress,
      time_progress: this.state.time_progress,
      lastEpisode: null,
      showActionBtns: true,
      playButton: this.getPlayButton({
        isPlayButtonVisible: isPlayButtonVisible,
        hasPreview: hasPreview,
        handlePlay: this.handlePlay,
        episode: media.episode && media.episode.number,
        season: media.episode && media.episode.season
      }),
      langButton: this.getLangButton(),
      episodeButton: this.getEpisodeButton(),
      playBuy: this.getBuyButton(),
      favouriteButton: this.getFavouriteButton(),
      recommendations,
      isBack: false,
      isLive: false
    });
    //console.log("getAllContentData");
    this.setState(
      {
        isFetching: false,
        purchaseButtonInfo,
        roles: role,
        externalrole: externalrole,
        recommendations,
        hasPreview,
        extendedcommon,
        serieData,
        favoriteData
      },
      this.focusDefaultElement
    );
  }

  async getEpisodeData(episode = {}) {
    const {
      id,
      title,
      title_episode,
      large_description,
      year,
      lenguage,
      subtitle,
      resolution,
      rating_code,
      episode_number
    } = episode;
    const groupId = id;
    const duration = Utils.formatDuration(episode.duration);
    const previewImage = episode.image_still;
    let frameImage = episode.image_frames;
    const spriteImage = episode.image_sprites;

    const contentData = this.test_contentData;

    //Cambio, si es serie la llamada de PBI requiere el parametro season_id que se obtiene de content/data
    const seasonId = this.getSeasonId(contentData);
    let purchaseButtonInfo = null;
    if (seasonId) {
      this.setIsSerie(true);

      purchaseButtonInfo = await api.PurchaseButtonInfov585({
        groupId,
        seasonId
      });
    } else {
      this.setIsSerie(false);

      purchaseButtonInfo = await api.PurchaseButtonInfov585({ groupId });
      console.log("test_PurchaseButtonInfov585", purchaseButtonInfo);
    }
    if (this.props && this.props.user && !this.props.user.isAnonymous) {
      const getBookmark = await api.getBookmark(groupId);
      if (
        getBookmark &&
        getBookmark.response &&
        getBookmark.response.groups &&
        getBookmark.response.groups[0]
      ) {
        this.bookMarkByGroupId = getBookmark.response.groups[0];
      } else {
        this.bookMarkByGroupId = null;
      }
      if (this.bookMarkByGroupId) {
        let time_progress = this.bookMarkByGroupId.vistime.last.time;
        if (frameImage) {
          frameImage = Utils.getImageFrame(frameImage, time_progress);
        }
      }
    }

    const { extendedcommon } = contentData.group.common;
    const media = extendedcommon.media;
    const { option } = media.language.options;
    const contentId = option[0].content_id;
    const hasPreview = media.haspreview == "true";

    const isPlayButtonVisible =
      purchaseButtonInfo &&
      purchaseButtonInfo.playButton &&
      purchaseButtonInfo.playButton.visible === "1";

    const favoriteData = {
      id: id,
      title: title,
      image_small: episode.image_small,
      format_types: contentData.group.common.extendedcommon.format.types,
      proveedor_name:
        contentData.group.common.extendedcommon.media.proveedor.nombre
    };

    this.isTrailer = !isPlayButtonVisible;
    this.isPlayTrailerButtonVisible = this.getPlayTrailerButtonVisibility(
      isPlayButtonVisible,
      hasPreview
    );
    this.props.setResumeData({
      title: `${title} : ${title_episode}`,
      year,
      lenguage,
      subtitle,
      resolution,
      large_description,
      rating: rating_code,
      duration,
      previewImage,
      frameImage,
      spriteImage,
      purchaseButtonInfo,
      groupId,
      episode_number,
      progress: episode.bookmark,
      time_progress: episode.time_progress,
      showActionBtns: true,
      playButton: this.getPlayButton({
        isPlayButtonVisible: isPlayButtonVisible,
        hasPreview: hasPreview,
        handlePlay: this.handlePlay,
        episode: media.episode && media.episode.number,
        season: media.episode && media.episode.season
      }),
      // BOTON EPISODIOS
      // episodeButton: this.getEpisodeButton(),
      langButton: this.getLangButton(),
      favouriteButton: this.getFavouriteButton()
    });

    this.contentId = contentId;

    const serieData = {
      seasons: this.state.serieData.seasons,
      episodeNumber: episode.episode_number,
      seasonNumber: episode.season_number
    };

    this.setState(
      {
        contentId,
        hasPreview,
        purchaseButtonInfo,
        serieData,
        favoriteData
      },
      this.focusDefaultElement
    );
  }

  handleEpisodeClick(episode, changeVcard = true) {
    this.sendMetric("cambiar episodio", episode.title_episode);
    const groupId = episode.id;
    this.groupId = groupId;
    if (changeVcard) this.props.history.replace(`/vcard/${groupId}`);
    this.getEpisodeData(episode);
  }

  handleTalentClick(talent) {
    const { history } = this.props;
    //history.push(`/talent/${talent.id}/${talent.fullname}/${this.provider_id}`);
  }

  showLanguages() {
    const modal = {
      modalType: MODAL_LANGUAGES,
      modalProps: {
        languages: this.languages,
        callback: this.setLanguage
      }
    };

    if (this.languages.length > 0) this.props.showModal(modal);
    else this.showError("No languages");
  }

  // MOSTRAMOS LOS EPISODIOS EN UN MODAL
  showEpisodeSelect() {
    const modal = {
      modalType: MODAL_EPISODE_SELECT,
      modalProps: {
        serieData: this.state.serieData,
        handleEpisodeClick: this.handleEpisodeClick
      }
    };
    this.props.showModal(modal);
  }

  showToBuy(Prices, data, type) {
    const data_zup = [data];

    this.props.showValidZup(data_zup);
    this.props.showPrice(Prices);

    const modal = {
      modalType: MODAL_TOBUY,
      modalProps: {
        dataBuy: this.dataBuy,
        typeBuy: type,
        callback: this.dataBuy
      }
    };

    this.props.showModal(modal);
  }

  showToTest() {
    const modal = {
      modalType: MODAL_CONFIRMATION,
      modalProps: {
        dataBuy: this.dataBuy,
        callback: this.dataBuy
      }
    };
    this.props.showModal(modal);
  }

  showError(message, callback = () => {}) {
    const modal = {
      modalType: MODAL_ERROR,
      modalProps: {
        callback,
        content: { message }
      }
    };
    this.props.showModal(modal);
  }

  canPlay(streamType) {
    /*
     * TODO We need to refactor this method.
     * Playback support for every provider must be a device abstraction.
     */
    const isAndroid = Device.getDevice().getPlatform() === "android";
    if (isAndroid) {
      return true;
    }

    const agent = navigator.userAgent.toLowerCase();

    if (
      (agent.indexOf("hisense/2014") !== -1 || agent.indexOf("5651") !== -1) &&
      this.provider === "HBO" &&
      this.provider === "CRACKLE"
    ) {
      let message = "";
      const defaultMessage =
        "El contenido que quieres reproducir no es soportado por este dispositivo. Intenta verlo en otro dispositivo.";
      message = Translator.get("videoplayer_unsupported", defaultMessage);
      this.showError(message);
      return false;
    }

    if (!streamType) {
      let message = "";
      let defaultMessage =
        "El proveedor de este contenido no soporta este formato, por favor intenta en alguno de los dispositivos soportados.";

      message = Translator.get(
        `${this.provider}_videoplayer_unsupported_encoder`,
        defaultMessage
      );

      this.showError(message);

      return false;
    }

    return true;
  }

  handleBookmark(pgm, isTrailer, streamType) {
    const buttons = [
      {
        content: Translator.get("player_continue_btn", "Reanudar"),
        props: {
          onClick: e => this.initPlayer(pgm, isTrailer, streamType)
        }
      },
      {
        content: Translator.get("player_begin_btn", "Desde el principio"),
        props: {
          onClick: e => {
            pgm.media.initial_playback_in_seconds = 0;
            this.initPlayer(pgm, isTrailer, streamType);
          }
        }
      }
    ];

    const modal = {
      modalType: MODAL_GENERIC,
      modalProps: {
        buttons,
        buttonsAlign: "vertical"
      }
    };

    this.props.showModal(modal);
  }

  initPlayer(pgm, isTrailer, streamType) {
    this.setState({
      pgm: pgm,
      isTrailer,
      streamType
    });
  }

  sendDimension() {
    const payload = new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: "executor" });
  }

  sendVirtualPage(common) {
    if (typeof this.props.setMetricsEvent === "function") {
      let virtualPage = "vCard/" + common.extendedcommon.format.types;
      if (common.extendedcommon.genres) {
        virtualPage +=
          "-" +
          common.extendedcommon.genres.genre
            .map(i => i.desc)
            .reduce((current, previous) => {
              return current.concat(",").concat(previous);
            });
      }
      let title;
      if (common.title.indexOf(":") === -1) {
        if (typeof common.extendedcommon.media.serie !== "undefined") {
          title = `${common.extendedcommon.media.serie.title}: ${this.props.resume.title}`;
          virtualPage += "-" + title;
        } else virtualPage += "-" + common.title;
      } else virtualPage += "-" + common.title;
      this.props.setMetricsEvent({
        hitType: "pageview",
        page: virtualPage
      });
      this.props.setMetricsEvent({ type: "executor" });
    }
  }

  sendMetric(action, label = null) {
    if (typeof this.props.setMetricsEvent === "function") {
      if (action === "cambiar episodio") {
        let t = this.props.resume.title.split(":");
        label = `${t[0]} - ${label}`;
      } else {
        if (label !== null) label = `${label} - ${this.props.resume.title}`;
        else label = `${this.props.resume.title}`;
      }
      this.props.setMetricsEvent({
        hitType: "event",
        eventCategory: "vcard",
        eventAction: action,
        eventLabel: label
      });
      this.props.setMetricsEvent({ type: "executor" });
      this.sendDimension();
    }
  }

  sendToPlay = () => {
    this.tooglePlay = !this.tooglePlay;
    let options = {
      playerstate: "PLAYING",
      source: { videoid: this.currentGroupId },
      size: {
        top: 0,
        left: 0,
        width: 1280,
        height: 720
      },
      ispreview: this.is_trailer,
      islive: false,
      ispip: false,
      recommendations: this.recommendations,
      tooglePlay: this.tooglePlay
    };
    if (typeof this.player === "object" && this.player.length > 0) {
      options[
        "timeshifttoken"
      ] = this.player[0].purchase_data.payway_token_play;
      localStorage.setItem("payway_token", options["timeshifttoken"]);
      console.log(
        "[PURCHASE] -- sendToPlay -- this.payway_token_offer ",
        this.payway_token_offer
      );
    }
    this.props.playFullMedia(options);
  };

  setterHandler(currentPin, pinIsCreated) {
    if (pinIsCreated) {
      // Cerrar modal
      store.dispatch({
        type: HIDE_MODAL,
        modalType: MODAL_PIN
      });
    }

    this.sendToPlay();
  }

  async handlePlay(isTrailer = false) {
    this.is_trailer = isTrailer;
    if (!this.is_trailer)
      this.sendMetric(Translator.get("detail_play", "Ver ahora"));
    else this.sendMetric(Translator.get("btn_trailer", "Trailer"));
    this.sendToPlay();
  }

  tryHandlePlay() {
    this.handlePlay(this.is_trailer);
  }

  resolveStreamType(encodes, provider, isLive) {
    let streamType = null;
    let i;
    console.log(
      "PlayerUtil WS ficha en resolveStreamType",
      encodes,
      provider,
      isLive
    );
    /**
     * this.contentId was resolved in getAllContentData,
     * it it exists it means that the user
     * have a prefered lang saved in the localStorage
     */
    if (this.contentId) {
      let streams_to_check = this.playerStreamingUtils.getEncodesByContentID(
        this.contentId,
        this.languages
      );
      console.log("Play ", this.contentId, this.languages, streams_to_check);
      streamType = this.playerStreamingUtils.resolveStreamType(
        streams_to_check,
        provider,
        false
      );
    }

    if (streamType === null) {
      /**
       * if we cant find a prefered lang, search for some
       */
      console.log(
        "PlayerUtil WS ficha en resolveStreamType, NO tiene content id"
      );
      for (i = 0; i < this.languages.length; i++) {
        streamType = this.playerStreamingUtils.resolveStreamType(
          this.languages[i].encodes,
          provider,
          false
        );
        if (streamType !== null) {
          break;
        }
      }
    }

    console.log("PlayerUtil WS ficha en resolveStreamType", streamType);
    return streamType;
  }

  handleRecommendationClick(groupId = "") {
    this.groupId = groupId;
    console.log("history_push", groupId);
    this.props.history.push(groupId);
    this.getAllContentData(groupId);
  }

  setLanguage = language => {
    DeviceStorage.setItem("default_lang", language.option_id);
    this.contentId = language.content_id;
    this.sendMetric("idioma", language.label_short);
  };

  getTalents(roles = []) {
    const talentArray = roles
      .map(role => {
        const { talent } = role && role.talents ? role.talents : { talent: [] };
        talent.forEach(t => {
          t.name = t.name ? t.name : "";
          t.fullname = t.fullname ? t.fullname : "";
          t.surname = t.surname ? t.surname : "";
          t.groupName = role.name;
        });
        return talent;
      })
      .reduce((curr, next) => {
        return curr.concat(next);
      }, []);

    return talentArray.map(talent => ({
      id: talent.id,
      group_id: talent.id,
      groupName: talent.groupName,
      title: `${talent.name} ${talent.surname}`,
      clickHandler: () => {
        this.handleTalentClick(talent);
      }
    }));
  }

  getExternalTalents(roles = []) {
    const talentArray = roles
      .map(role => {
        const talent = role && role.talents ? role.talents : { talent: [] };
        console.log(talent);
        if (talent.length > 0) {
          talent.forEach(t => {
            t.first_name = t.first_name ? t.first_name : "";
            t.last_name = t.last_name ? t.last_name : "";
            t.groupName = role.role_name;
            t.fullname = `${t.last_name}, ${t.first_name}`;
            t.name = t.first_name;
            t.surname = t.last_name;
          });
          return talent;
        } else {
          return [];
        }
      })
      .reduce((curr, next) => {
        return curr.concat(next);
      }, []);

    return talentArray.map(talent => ({
      id: talent.id,
      group_id: talent.id,
      groupName: talent.groupName,
      title: `${talent.first_name} ${talent.last_name}`,
      fullname: `${talent.first_name} ${talent.last_name}`,
      name: `${talent.first_name}`,
      surname: `${talent.last_name}`,
      fullname: `${talent.last_name} ${talent.first_name}`,
      cover: talent.image ? talent.image + "?impolicy=resize&vwidth=88" : null,
      //cover: 'http://clarovideocdn9.clarovideo.net/GRACENOTE/TALENT/68580/EXPORTACION_WEB/68580.jpg?size&imwidth=131',
      clickHandler: () => {
        this.handleTalentClick(talent);
      }
    }));
  }

  render() {
    if (this.state.isFetching) {
      return null;
    }
    console.log('traeme la data del item rentado', this.state.renderItem)
    const {
      pgm,
      isTrailer,
      serieData,
      recommendations,
      streamType
    } = this.state;
    if (pgm) {
      //return
      this.state.PGM = null;
    }

    const talentObject = talents => {
      return (
        talents &&
        talents
          .filter(item => item.length !== {})
          .map(item => ({
            name: item.name,
            talent_type: item.groupName
          }))
      );
    };

    const { roles, externalrole } = this.state;

    const talents = externalrole ? externalrole : this.getTalents(roles);

    const scrolleableHeight = Utils.isNetcast()
      ? 360
      : Utils.isHisense()
      ? 370
      : 290;

    return (
      <Scrollable height={scrolleableHeight} className="fixedContainer">
        {serieData.seasons.length > 0 ? (
          <EpisodeSelection
            data={serieData}
            handleEpisodeClick={this.handleEpisodeClick}
            setMetricsEvent={this.props.setMetricsEvent}
            dataMetric={this.props.resume.title}
            handlePlay={this.handlePlay}
            getPlayButton={this.getPlayButton}
          />
        ) : null}

        <div className="vcard-talents">
          {talents.length > 0 && this.toggleFunctions.talents ? (
            <Ribbon
              slidesToShow={10}
              type={"user-profile"}
              title={Translator.get(
                "predictSearch_talents_label",
                "Talentos Relacionados:"
              )}
              items={talents}
              visibleNumber={talents.length < 12 ? talents.length : 12}
              //visibleNumber={talents.length < 100 ? talents.length : 100}
              setMetricsEvent={this.props.setMetricsEvent}
              carruselTitle={"Talentos Relacionados:"}
            />
          ) : null}
        </div>

        <div className="vcard-recommendations">
          {recommendations.length > 0 &&
          this.toggleFunctions.recommendations ? (
            <Ribbon
              user={this.props.user}
              title={Translator.get(
                "SeeOther",
                "Otros usuarios que vieron este contenido tambien vieron:"
              )}
              type="landscape"
              items={recommendations.map(r => {
                return {
                  id: r.id,
                  title: r.title,
                  group_id: r.id,
                  cover: r.image_small.replace("http:", "https:"),
                  proveedor_name: r.proveedor_name,
                  provider:
                    r.proveedor_name == "AMCO" ? "default" : r.proveedor_name,
                  format_types: r.format_types.split(","),
                  live_enabled: r.live_enabled,
                  type: r.live_enabled === "1" ? "live" : "vod",
                  clickHandler: () => {
                    this.handleRecommendationClick(r.id);
                  }
                };
              })}
              setMetricsEvent={this.props.setMetricsEvent}
              carruselTitle={Translator.get(
                "SeeOther",
                "Otros usuarios que vieron este contenido tambien vieron:"
              )}
            />
          ) : null}
        </div>
      </Scrollable>
    );
  }
}
//const mapStateToProps = state => ({ ...state.resume, user: state.user });
const mapStateToProps = state => ({
  resume: {
    key: Math.random(),
    lastEpisode: state.resume.lastEpisode,
    title: state.resume.title,
    category: state.resume.category,
    groupId: state.resume.groupId,
    progress: state.resume.progress,
    isBack: state.resume.isBack,
    price: state.price.showPriceProps,
    result: state,
    players: state.players.showPlayerProps,
    refresh_purchaseData: state.purchaseData.showPurchaseDataProps,
  },
  pay: state.pay.showPayProps,
  user: state.user,
  player: state.player,
  test_player: state.players.showPlayerProps,
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      showPlayerLoading,
      playFullMedia,
      setResumeData,
      showModal,
      updateFavorite,
      deleteFavorite,
      setMetricsEvent,
      showNotification,
      showPay,
      zuppay,
      showPrice,
      showSubscriptions,
      showLastDigits,
      showContentData,
      showPlayer,
      showPurchaseData,
      receiveIsLoggedIn,
      showValidZup
    },
    dispatch
  );
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VCard));
