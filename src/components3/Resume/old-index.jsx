import './resume.css';
import defaultImg from './no_image.png';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import storage from '../../components/DeviceStorage/DeviceStorage';

import Button from '../Button';
import Translations from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import Metadata from '../../requests/apa/Metadata';
import ModalConductor from '../../containers/Modal';
import { showModal, MODAL_PIN, HIDE_MODAL } from '../../actions/modal';
import store from '../../store';
import Utils from "../../utils/Utils";

import {bindActionCreators} from 'redux'
import {setMetricsEvent} from '../../actions/metrics';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import MusicUtils from "../../actions/musica/music-actions";
import { getCurrentImage, getCurrentAlbumName, getCurrentTitle } from '../../actions/musica/player-action-creators';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import Device from "../../devices/device";
import { playFullMedia } from '../../actions/playmedia';
import LayersControl from '../../utils/LayersControl';
import AAFPlayer from '../../AAFPlayer/AAFPlayer';

import * as constant from '../../components/Payment/constants';
function Resume(props) {

  const promo = getPromoBanner(props.purchaseButtonInfo, props);
  promo.content = props.hide != true ? promo.content : null;
  let musicData={};
  if(props.playerMusica.currentContent.id){ // overide props for music
    musicData = {
      pgm: MusicUtils.getPgmFromState(props.playerMusica.currentContent, props.playerMusica.contentType),
      previewImage: getCurrentImage(props.playerMusica),
      titleSong: getCurrentTitle(props.playerMusica),
      album: getCurrentAlbumName(props.playerMusica),
      href: `/player/${props.playerMusica.currentContent? props.playerMusica.currentContent.id : ''}`,
      isMusic: true,
    }
  }

  if(props.isLive || props.type ==="vod"){
    musicData.isMusic = false;
  }

  return (
    <div className="resume">
      <div className="resume-container">
        {getBtnBack(props)}
        <div className="resume-data-container">
          <div className={`${!promo.content ? 'resume-data-large' : 'resume-data'}`}>
            {getTitle(props.title)}
            <div className='resume-info'>
              <div className="resume-metadata">
                {getSchedule(props.schedule)}
                {getYear(props.year)}
                {getRating(props.rating)}
                {getCategory(props.category)}
                {getSeason(props.seasonsText)}
                {getDuration(props.duration)}
                {getReminder(props.hasReminder)}
                {props.isLive && getRecBadge(props.recordable, props.eventStatus)}
              </div>
              {getDescription(props.description, `${!promo.content ? 'large' : 'small'}`)}
              {getActionButtons(props.showActionBtns,props.playButton,props.langButton,props.favouriteButton)}
            </div>
          </div>
          {promo.content}
        </div>
        {console.log("CHARGING RESUME")}
        {!musicData.isMusic?
          getPreviewImage(props.previewImage || props.image_still, props.frameImage, props.progress, props.time_progress, props.isLive) :
          getMusicPreviewImage(musicData, props)
        }

      </div>
    </div>
  );
}

Resume.propTypes = {
  title: PropTypes.string,
  schedule: PropTypes.string,
  year: PropTypes.string,
  category: PropTypes.string,
  description: PropTypes.string,
  duration: PropTypes.string,
  previewImage: PropTypes.string,
  image_still: PropTypes.string,
  frameImage: PropTypes.string,
  progress: PropTypes.number,
  time_progress: PropTypes.string,
  recordable: PropTypes.bool,
  tiimeshift: PropTypes.bool,
  rating: PropTypes.string,
  seasonsText: PropTypes.string,
  isRecording: PropTypes.bool,
  hasReminder: PropTypes.bool,
  showBack: PropTypes.bool,
  purchaseButtonInfo: PropTypes.object,
  showActionBtns: PropTypes.bool,
  playButton: PropTypes.object,
  langButton: PropTypes.object,
  favouriteButton: PropTypes.object,

};

Resume.defaultProps = {
  title: null,
  schedule: null,
  year: null,
  category: null,
  description: null,
  duration: null,
  previewImage: null,
  image_still: null,
  frameImage: null,
  progress: 0,
  time_progress: '',
  recordable: false,
  timeshift: false,
  rating: null,
  seasonsText: null,
  isRecording: null,
  hasReminder: null,
  showBack: false,
  purchaseButtonInfo: null,
  showActionBtns: false,
  playButton: null,
  langButton: null,
  favouriteButton: null,
};

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setMetricsEvent: setMetricsEvent,
    playFullMedia: playFullMedia
  }, dispatch);
}

const mapStateToProps = state => ({ ...state.resume, user: state.user, playerMusica: state.playermusica });
export default connect(mapStateToProps, { showModal, matchDispatchToProps })(Resume);

function getBtnBack(props) {
  const backText = Translations.get("btn_menu_back", "Volver");
  const btnBack = (
    <div className={`resume-back`}>
      <Button
        text={backText}
        iconClassName="fa fa-undo back"
        onClick={(e) => {
          const history = props.history;
          history.goBack();
        }}
      />
    </div>
  );

  return props.showBack ? btnBack : null;
}

function getTitle(title) {
  const titleComp = (
    <div className={`resume-title`}>
      {title}
    </div>
  );

  return (title) ? titleComp : null;
}

function getSchedule(schedule) {
  const scheduleComp = <span className="resume-meta">{schedule}</span>;

  return schedule ? scheduleComp : null;
}

function getYear(year) {
  const yearComp = <span className="resume-meta">{year}</span>;

  return year ? yearComp : null;
}

function getRating(rating) {
  const ratingComp = <span className="resume-meta resume-tag">{rating}</span>;

  return rating ? ratingComp : null;
}

function getCategory(category) {
  const categoryComp = <span className="resume-meta">{category}</span>;

  return category ? categoryComp : null;
}

function getSeason(seasonsText) {
  const seasonComp = <span className="resume-meta">{seasonsText}</span>;

  return seasonsText ? seasonComp : null;
}

function getDuration(duration) {
  const durationComp = (
    <span className="resume-meta">{duration}</span>
  );

  return duration ? durationComp : null;
}

function getReminder(hasReminder) {
  const reminderBadge = (
    <span className="resume-meta">
      <i className="fa fa-clock-o" aria-hidden="true" />
    </span>
  );

  return hasReminder ? reminderBadge : null;
}

function getTimeShift(timeshift) {
  return !timeshift
    ? null
    : <div className="resume-meta resume-badge"><img className="icon icon-timeshift" src={Asset.get("player_controls_timeshift_icon")} alt="timeshift icon"/></div>;
}

function getRecBadge(recordable, eventStatus) {
  if (!recordable) {
    return null;
  }

  const isAndroid = Device.getDevice().getPlatform() === 'android';
  const isArgentina = DeviceStorage.getItem('region') === 'argentina';
  const recordingsEnabled = isAndroid && isArgentina ? false : true;

  if (!recordingsEnabled) {
    return null;
  }

  let recBadge = null;
  switch (eventStatus) {
    case 'recording':
      recBadge = <div className="resume-meta resume-badge"><img className="icon icon-record recording" src={Asset.get("player_controls_recording_icon")} alt="recording icon" /></div>;
      break;
    default:
      recBadge = <div className="resume-meta resume-badge"><img className="icon icon-record" src={Asset.get("player_controls_record_icon")} alt="record icon" /></div>;
      break;
  }
  return recBadge;
}

function getDescription(description, size) {

  const rows = 4;
  const maxlimit = size === 'large' ? (73 * rows) : (57 * rows);
  const ellipsis = (description && description.length && (description).length > maxlimit) ? '...': '';
  const descriptionComp = <div data-line={ellipsis} className="resume-description block-with-text">{description}</div>;
  //console.log('==> La longitud es de:', description && description.length ? description.length : '-');
  return description ? descriptionComp : null;
}

function getActionButtons(showActionBtns, playButton, langButton, favouriteButton) {
  const actionButtons=<div className="resume-action-buttons">{playButton}{langButton}{favouriteButton}</div>;
  return showActionBtns? actionButtons: null;
}

function getTransactionalConfiguration() {
  const region= storage.getItem('region');
  let transactionalConfiguration=Metadata.get('transactional_configuration',null);
  if(typeof transactionalConfiguration !== 'Object') {
    if (transactionalConfiguration !== 'transactional_configuration')
      transactionalConfiguration = JSON.parse(transactionalConfiguration);
    else return null;
  }
  const transactionalConfigurationRegionExists = (transactionalConfiguration[region]);
  if (transactionalConfigurationRegionExists)
    return transactionalConfiguration[region];
  else {
    const transactionalConfigurationDefaultExists = (transactionalConfiguration['default']);
    if (transactionalConfigurationDefaultExists)
      return transactionalConfiguration['default'];
    else return null;
  }
}

function getPromoBanner(purchaseButtonInfo, props) {
  //console.log('checando el banner',props)
  let types = {}, provider = (props.provider === 'default') ? 'AMCO' : props.provider, wp='wp0';
  let productPurchase=false;
  if (props.format_types) types = props.format_types;
  if(props.user.is_user_logged_in !== 0){
    const transactionalConfiguration=getTransactionalConfiguration();
    if(props.user.subscriptions){
      const subscriptions = props.user.subscriptions;
      if(typeof provider !== 'undefined' && provider!="") {
        const providerProducts = transactionalConfiguration.suscription.products[provider]; //productypes asociados al provedor
        subscriptions && providerProducts.forEach(product => {
          const filter = Object.keys(subscriptions).filter(it => it == product);
          if (filter.length>0) {
            productPurchase = filter;
          }else if(subscriptions && filter.length===0){
            if(props.user && props.user.paywayProfile && props.user.paywayProfile.subscriptions) {
              const subscriptionsPayway = props.user.paywayProfile.subscriptions;
              const filter2 = subscriptionsPayway.filter(x => x.name === product);
              if(filter2.length > 0){
                productPurchase = filter2;
              }
            }
          }
        });
      }
    }

    if(productPurchase){
      wp='wp1';
    }
  }


  if(provider!==undefined)
    provider=provider.replace(' ','_');

  let BannerName = `${provider}_${types[0]}_${storage.getItem("region")}_${wp}`;
  let src = Asset.get(BannerName);
  const promoBanner = (
    <div className="resume-promo">
      <img src={src} alt=""/>
    </div>
  );

  return {
    isPromoBanner: !purchaseButtonInfo,
    content: !purchaseButtonInfo ? ( src !== BannerName ? promoBanner : null ) : getPurchaseBtns(purchaseButtonInfo, props)
  }
}

function getPromoText (purchaseButtonInfo = null) {
  console.log("dan: purchaseButtonInfo", purchaseButtonInfo);
  if (!purchaseButtonInfo) {
    return null;
  }

  const promoTextKey = `${purchaseButtonInfo.bannerpromo}_text`;
  const promoText = Translations.get(promoTextKey);
  // const promoText = "Por ser cliente <b>Infinitum</b> ya tienes Claro video SIN COSTO o 1 mes gratis para clientes <b>Telcel</b>.";

  const result = promoText !== promoTextKey ? (
    <div className='promo-text'      
      dangerouslySetInnerHTML={{__html: promoText}}
    />
  ) : null;

  return result;
}


function sendDimension(props){
  const payload=new AnalyticsDimensionSingleton().getPayload();
  props.setMetricsEvent(payload);
  props.setMetricsEvent({ type: 'executor'});
}


function sendMetric(props,btn) {
  if(typeof props.setMetricsEvent==='function'){
    let action,label,provider='';
    if (btn.oneoffertype === 'subscrition') {
      // Suscripcion
      if (btn.oneofferdesc.includes('Semanal')){
        action = 'suscripcion semanal';
      }
      else if (btn.oneofferdesc.includes('Mensual')){
        action = 'suscripcion mensual';
      }
      else if (btn.oneofferdesc.includes('HBO')){
        action = 'suscripcion hbo';
        provider='- hbo -';
      }
      else if (btn.oneofferdesc.includes('FOX PREMIUM')){
        action = 'suscripcion fox';
        provider='- fox -';
      }
      else if (btn.oneofferdesc.includes('FOX')){
        action = 'suscripcion foxplus';
        provider='- foxplus-';
      }
      else if (btn.oneofferdesc.includes('NOGGIN')){
        action = 'suscripcion noggin';
        provider='- noggin -';
      }
      else if (btn.oneofferdesc.includes('CRACKLE')){
        action = 'suscripcion crackle';
        provider='- crackle -';
      } else if (btn.oneofferdesc.toLowerCase().includes('indycar')) {
        action = 'suscripcion indycar';
        provider = '- indycar -';
      }
      else if (btn.oneofferdesc.toLowerCase().includes('edye')) {
        action = 'suscripcion edye';
        provider = '- edye -';
      }
      if(typeof props.format_types === 'Array')
        label=props.format_types.reduce((current,previous)=>{ return current.concat(',').concat(previous);});
      else
        label=props.format_types;
      label +=` ${provider} ${props.title}`;
      DeviceStorage.setItem('analytics-label',label);
      props.setMetricsEvent({
        hitType: 'event',
        eventCategory: 'vcard',
        eventAction: action,
        eventLabel: label,
      });
      props.setMetricsEvent({type: 'executor'});

    }
    else {
      // Renta / Compra      

      if(typeof props.format_types === 'Array')
        label=props.format_types.reduce((current,previous)=>{ return current.concat(',').concat(previous);});
      else
        label=props.format_types;
        label += ` - ${props.title}`;      

      DeviceStorage.setItem('analytics-label',label);
      props.setMetricsEvent({
        hitType: 'event',
        eventCategory: 'vcard',
        eventAction: btn.oneofferdesc,
        eventLabel: label,
      });
      props.setMetricsEvent({type: 'executor'});
    }
    sendDimension(props);
  }

}

function closeModal(pinIsCreated,props) {
  if(pinIsCreated) {
    props.closeModal({
      type: HIDE_MODAL,
      modalType: MODAL_PIN
    });
  }
}

function getPurchaseBtns(purchaseButtonInfo, props) {
  const purchaseButtonsVisible = purchaseButtonInfo
    && purchaseButtonInfo.listButtons
    && purchaseButtonInfo.listButtons.button;

  const promoText = getPromoText(purchaseButtonInfo);

  const purchaseButtons = purchaseButtonsVisible ?
    purchaseButtonInfo.listButtons.button.map((btn, index) => {

      const total = purchaseButtonInfo.listButtons.button.length;
      const goToPayment = () => {

          btn.accessCode = purchaseButtonInfo.accessCode;
          btn.fromVCard = true;
          btn.recommendations = props.recommendations ? props.recommendations : [];

        if (props.user.isLoggedIn) {
          if (btn.oneoffertype === 'subscrition') {
            const vcard = props.history.location.pathname.split('/');
            props.history.push(`/payment/${vcard[2] ? vcard[2] : ''}/${btn.offerid}`, btn);
          }
          else {
            // Renta / Compra
            let requets = Utils.getRequest(btn.linkworkflowstart);
            props.history.push(`/payment/${requets.params.group_id}/${btn.offerid}`, btn);
          }
        }
        else {
          props.history.push(`/register`, btn);
        }
      };

      const showDisclaimer = (btn) => {

        const disclaimerKey = `${btn.bannerpromo}_disclaimer`;
        const disclaimer = Translations.get(disclaimerKey);
        
        const promoTextClassName = 'promo-text';
        const resumeClassName = 'resume-purchase-buttons';
        var promoText = document.getElementsByClassName(promoTextClassName);

        if (disclaimer !== disclaimerKey) {
          if (promoText && promoText[0]) {
            promoText[0].innerHTML = disclaimer;
          } else {
            var resume = document.getElementsByClassName(resumeClassName);
            if (resume && resume[0]) {
              var promoTextDiv = document.createElement('div');
              promoTextDiv.id = promoTextClassName;
              promoTextDiv.className = promoTextClassName;
              promoTextDiv.innerHTML = disclaimer;
              resume[0].appendChild(promoTextDiv);
            }
          }
        } else {
          if (promoText && promoText[0]) {
            promoText[0].innerHTML = '';
          }
        }
      }

      const getApaConfiguration = (key) => {

        const apaKey = 'purchasebutton_colors';
        const defaultValue = 'default';

        let local_purchasebutton_colors = {
          "default": {
            "default": {
              "gradient": {
                "direction": "to right",
                "color_stop1": "#FF9900 0%",
                "color_stop2": "#FFd400 100%",
                "background": "#FF9900"
              }
            }
          },
          "mexico": {
            "default": {
              "background": "#4C6FA7"
            },
            "CV_SEASONBUY_wp0": {
              "background": "#8065DF"
            },
            "CV_EPISODEBUY_wp0": {
              "background": "#40336F"
            },
            "CV_STDRENT_wp0": {
              "background": "#8D4CA7"
            },
            "CV_PRERENT_wp0": {
              "background": "#8D4CA7"
            },
            "CV_PREMIUM_wp0": {
              "background": "#8D4CA7"
            },
            "CV_STDBUY_wp0": {
              "background": "#477F9B"
            },
            "CV_PREBUY_wp0": {
              "background": "#477F9B"
            },
            "CV_STD_ESTEXC_wp0": {
              "background": "#477F9B"
            },
            "CV_PRE_ESTEXC_wp0": {
              "background": "#477F9B"
            }
          }
        };
       
        let apaValue = Metadata.get(apaKey);
        let region = storage.getItem("region");
        try {

          if (apaValue == apaKey) {
            apaValue = local_purchasebutton_colors;
          } else {
            apaValue = JSON.parse(apaValue);
          }

          if (apaValue) {
            apaValue = apaValue[region] || apaValue[defaultValue];
          }
          return apaValue[key] || apaValue[defaultValue];
        }
        catch (e) {
          return null;
        }
        return null;
      }

      const getButtonStyle = (btn) => {        
        const key = `${btn.producttype}_wp${btn.waspurchased}`;
        //console.log('GCR key', key);
        let buttonColors = getApaConfiguration(key);
        let background = 'none';
        const style = {};

        if (buttonColors) {          
          if (buttonColors.gradient) {
            style.background = `linear-gradient(${buttonColors.gradient.direction}, ${buttonColors.gradient.color_stop1}, ${buttonColors.gradient.color_stop2})`;
          }else if (buttonColors.background) {
            style.background = `${buttonColors.background}`;
          }
        }        
        return style;
      };

      const style = getButtonStyle(btn);      
      const order = ['left-text','right-text'];
      
      //const episode_number = props.episode_number ? `${props.episode_number }` : '';

      return btn.waspurchased != "1" ? (
        <div key={index} className="purchase-btn-container">
          <Button    
            rightText={`${btn.currency} ${btn.price}`}
            leftText={`${btn.oneofferdesc}`}
            order={order}
            className={`purchase large elementopredeterminado ${btn.producttype}`}
            style={style}
            focusDown={total - 1 == index ? '.resume-action-buttons .focusable':''}
            onClick={() =>
            {
              sendMetric(props,btn);
              if (purchaseButtonInfo && purchaseButtonInfo.accessCode && purchaseButtonInfo.accessCode.enabled) {

                const modal = {
                  modalType: MODAL_PIN,
                  modalProps: {
                    action: 'MP_CHECAR_STATUS',
                    pinIsCreated: true,
                    successCallBack: (currentPin, pinIsCreated) => {
                      closeModal(pinIsCreated,props);
                      goToPayment();
                    },
                    flag: true,
                  }
                }
                props.showModal(modal);
              }
              else {
                goToPayment();
              }
            }}
            onFocus={(e) => {
              showDisclaimer(btn);
            }}
          />
        </div>
      ) : null;
    }).filter(btn => btn !== null)
  : null;

  const purchaseBtns = (
    <div className="resume-purchase-buttons">
      {purchaseButtons}
      {promoText}
    </div>
  );
  const showPurchaseButtons = Array.isArray(purchaseButtons) && purchaseButtons.length > 0;
  return showPurchaseButtons ? purchaseBtns : null;
}

let image_still;

const handleError = (event) => {
  //event.target.src = '/images/placeholder_landscape.png';
  event.target.src = image_still;
};



function getPreviewImage(src, frame, progress = 0, time_progress, isLive) {

  let isPip = false;
  if(AAFPlayer.livePlayingAsPip()) {
    isPip = true;
  }
  image_still = src;
  let imagen = frame && time_progress !== '00h-00m-00s' ? frame.replace('00h-00m-00s', time_progress) : src;
  const cssClass = `resume-preview ${isLive ? 'live' : ''}`;
  const previewImage = (
    <div className={cssClass}>
      {!isPip &&<img src={imagen && imagen.indexOf("?size") !==-1 ? imagen : imagen+"?size=290x163"} alt="preview" onError={handleError} />}
      {!isPip && <span className="preview-progress" style={{ width: `${progress}%` }}></span>}
    </div>
  );

  return (imagen) ? previewImage : null;

}

function getMusicPreviewImage(musicData, props) {
  if(!musicData.titleSong) return null;
  const style = {
    background: `url('${musicData.previewImage}') no-repeat center`,
    'background-size': 'cover',
  }

  const handlePlay = (musicData) => {
    store.dispatch(playFullMedia({
      playerstate: 'PLAYING',
      source: {
        audiosource: musicData.pgm.media.video_url,
      },
      ispreview: false,
      islive: musicData.pgm.media.isLive,
      ispip: false,
      size: {
        top: 0,
        left: 0,
        width: 1280,
        height: 720
      }
    }));
  }

  return (
      <a
        id="pip_musica_click"
          onClick={() => {
            handlePlay(musicData);
            LayersControl.hideUX();
          }}
      >
      <div className="resume-music-container focusable">
        <div className="badge-container left badge-music">REPRODUCIENDO</div>
        <div className="resume-preview resume-music ">
          <div className="resume-preview pip-background bgimag blury" style={style} />
          <div className="music-player-songs">
            <div className="current-song cover-song">
              <img src={musicData.previewImage} onError={(e) => {
                e.target.src = "/images/placeholder_square.png";
              }} />
            </div>
            <div className="text-container">
              <div className="background-text"/>
              <div className="song-title">{musicData.titleSong}</div>
              <div className="song-album-title" >{musicData.album}</div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
