import React, { Component } from 'react';
import Translator from "../../../requests/apa/Translator";
import Metadata from "../../../requests/apa/Metadata";
import Utils from "../../../utils/Utils";
import { connect } from "react-redux";
import { showModal, MODAL_GENERIC } from "../../../actions/modal";
import {setMetricsEvent} from "../../../actions/metrics";
import {  withRouter } from 'react-router-dom';

class Subscription extends Component {
  constructor
  (){
    super();
  /*  this.VENDORS_DEMO = {
      FOX: 'FOX PREMIUM',
      AMCO: 'Claro video',
      HBO: 'HBO',
    };
    this.GATEWAYS_DEMO = {
      plazavipgate: 'tarjeta de crédito',
      telmexmexicogate: 'recibo TELMEX',
      hubgate: 'teléfono móvil',
      promogate: 'codigo promocional',
      itunesgate: 'itunes',
    };

    this.VENDORS_BODY_DEMO = {
      FOX: '¡Suscribete ahora a FOX PREMIUM! Disfruta estrenos, series exclusivas y más. Precio especial $139 mensual durante 6 meses, después $175 mensual.',
      AMCO: 'Vive la experiencia Claro video, por $69.00 al mes y accede a miles de películas, series, conciertos, documentales y la mejor programación infantil.<br>El cargo se verá reflejado en el medio de pago que elijas.<br>Si eres cliente Infinitum o Telcel ¡tu primer mes es GRATIS!',
    };
    this.VENDORS_FOOTER_DEMO = {
      FOX: 'El cargo se verá reflejado en el medio de pago que elijas. Si deseas cancelar el servicio deberas hacerlos 24 horas antes de la fecha de vencimiento.',
      AMCO: '*Recuerda que tu suscripción se renovará automáticamente. Si deseas cancelar el servicio deberás hacerlo 24 horas antes de la fecha de vencimiento. De esta manera evitarás que se te deduzcan nuevos cargos.',
    };*/
  }
  setMetrics(label, action) {
    const eventCategory = "perfil";
    const eventAction = action;
    const eventLabel = label;

    this.props.setMetricsEvent({
      tagManager: {
        event: "click",
        eventCategory,
        eventAction,
        eventLabel
      }
    });

    this.props.setMetricsEvent({
      type: "executor",
      success: true
    });
  }
  toPayment(event) {
    let eventAction = null;
    let eventLabel= null;
    event && event.preventDefault && event.preventDefault();
    let processPBI=this.props.extradata.PBI.listButtons && this.props.extradata.PBI.listButtons.button?this.props.extradata.PBI.listButtons.button.filter(x=>x.offerid==this.props.extradata.selectedOfferid):[];
    this.props.history.push(`/payment/0/${this.props.extradata.selectedOfferid}`,processPBI[0]);
    eventAction = "suscripción";
    let offer_desc= this.props.extradata.title;
    if (offer_desc.indexOf("_plus")!= -1)
      eventLabel= `suscribete FOX+`
    else
      eventLabel = `suscribete ${this.props.extradata.provider}`;
    this.setMetrics(eventLabel, eventAction);
  }

  beforeToPayment = callback => {
    let encodes = Metadata.get('product_encodes_configuration',"{\"subscrition\":{\"CV_MENSUAL\":{\"encodes\":[\"hls\",\"hlsfps\",\"hlsprm\",\"est_sd\",\"est_hd\",\"smooth_streaming\",\"dashpr\",\"dashwv\"]},\"CV_SEMANAL\":{\"encodes\":[\"hls\",\"hlsfps\",\"hlsprm\",\"est_sd\",\"est_hd\",\"smooth_streaming\",\"dashpr\",\"dashwv\"]},\"FOX\":{\"encodes\":[\"smooth_streaming\",\"dashwv\",\"widevine_classic\"]},\"HBO\":{\"encodes\":[\"hlsfps\",\"hlsfps_ma\",\"smooth_streaming\",\"smooth_streaming_ma\",\"dashwv\",\"dashwv_ma\"]},\"NOGGIN\":{\"encodes\":[\"hls\",\"hlsfps\",\"hls_ma\",\"hlsfps_ma\",\"hlsprm\",\"est_sd\",\"est_hd\",\"smooth_streaming\",\"smooth_streaming_ma\",\"dashpr\",\"dashwv\",\"dashwv_ma\",\"dashpr_ma\"]},\"CRACKLE\":{\"encodes\":[\"hlsfps\",\"smooth_streaming\",\"dashpr\",\"dashwv\"]}}}");
    encodes=JSON.parse(encodes);
    let provider=this.props.extradata.provider;
    const canPlay = Utils.deviceCanPlayProvider(provider,encodes);
    if (!canPlay) {
      const modal = {
        modalType: MODAL_GENERIC,
        modalProps: {
          buttons: [
            {
              content: Translator.get(
                `${provider}_unsupported_suscription_button`,
                'Aceptar'
              ),
              props: {
                onClick:callback,
              }
            }],
          title: '',
            content:Translator.get(`${provider}_unsupported_confirm_text`,
          'Este dispositivo no es compatible con el servicio que deseas contratar. Te invitamos a consultar la sección de Preguntas Frecuentes para ver dispositivos soportados.'
          ),
          withCancel:true,
        }
      }
      this.props.showModal(modal);
    } else {
      return callback && callback();
    }
  };

  render() {
    let optionalTitle = "Suscripcion "+  this.props.extradata.provider;
    let optionalBody =
      "Vive la experiencia "+  this.props.extradata.provider +" y accede a miles de películas, series, conciertos, documentales y la mejor programación infantil.";
    let optionalFooter = "*Recuerda cancelar 24 horas antes";

    /*if (
      this.props.extradata &&
      this.props.extradata.provider &&
      this.VENDORS_DEMO &&
      this.VENDORS_DEMO[this.props.extradata.provider]
    ) {
      optionalTitle = `Suscripcion ${this.VENDORS_DEMO[
        this.props.extradata.provider
        ]}`;
    }

    if (
      this.props.extradata &&
      this.props.extradata.provider &&
      this.VENDORS_BODY_DEMO &&
      this.VENDORS_BODY_DEMO[this.props.extradata.provider]
    ) {
      optionalBody = this.VENDORS_BODY_DEMO[this.props.extradata.provider];
    }
    if (
      this.props.extradata &&
      this.props.extradata.provider &&
      this.VENDORS_FOOTER_DEMO &&
      this.VENDORS_FOOTER_DEMO[this.props.extradata.provider]
    ) {
      optionalFooter =
        this.VENDORS_FOOTER_DEMO[this.props.extradata.provider];
    }*/    
    
    var result = this.props.extradata.PBI.listButtons.button.filter(x => x.producttype == this.props.extradata.provider);
    let message = '';

    if (result && Array.isArray(result) && result[0]) {
      result = result[0];
      const dynamicPrice = result.currency + result.price;
      
      message = Translator.get(
        this.props.extradata.texts && this.props.extradata.texts.default && this.props.extradata.texts.default.offer_description.not_purchased,
        optionalBody
      ).replace("{@PRICE}", dynamicPrice);
      
    }
    else {
      message = Translator.get(
        this.props.extradata.texts && this.props.extradata.texts.default && this.props.extradata.texts.default.offer_description.not_purchased,
        optionalBody
      )
    }

    const content = (
      <div className="row">
              <div className="left-content">
                <div className="title">
                  {Translator.get(
                    this.props.extradata.title,
                    optionalTitle
                  )}{" "}
                </div>
                  <div className="body">

              <p
                dangerouslySetInnerHTML={{
                __html: message
                }}
              />
              <p
                dangerouslySetInnerHTML={{
                  __html: Translator.get(
                    this.props.extradata.texts && this.props.extradata.texts.default && this.props.extradata.texts.default.offer_message.not_purchased,
                    optionalFooter
                  )
                }}
              />
                  </div>
              </div>
        <div className="right-content">
            {
              <a
                href="javascript:void(0)"
                id="btn_suscribir"
                className="focusable button"
                onClick={

                  this.beforeToPayment.bind(
                  this,
                  this.toPayment.bind(this)
                )}
              >
                {Translator.get(
                  "profile_suscription_button",
                  "Suscribite"
                )}
              </a>
            }
        </div>
      </div>
    );

    return <div>{content}</div>;
  }
}

export default  connect(null, { showModal,setMetricsEvent })(withRouter(Subscription));
