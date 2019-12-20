import React, { Component } from 'react';
import Translator from "../../../requests/apa/Translator";
import DeviceStorage from "../../../components/DeviceStorage/DeviceStorage"
import { connect } from "react-redux";
import { showModal, MODAL_GENERIC, MODAL_SUCCESS } from "../../../actions/modal";
import RequestManager from "../../../requests/RequestManager";
import CancelSuscTask from "../../../requests/tasks/payway/CancelSuscTask";

class UnSubscription extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dataFetch: false,
      expirationDate: "",
      price: "",
      in_process_canceled: this.props.extradata && this.props.extradata.payway && this.props.extradata.payway.purchase_data&&this.props.extradata.payway.purchase_data.in_process_canceled==1,
      canceling:false,
    };

    this.VENDORS_DEMO = {
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

    this.performCancel=this.performCancel.bind(this);
    this.successCancel=this.successCancel.bind(this);
  }



  setExpirationDate() {
    let paywayData = this.props.extradata.payway;
    if (paywayData.expiration_date) {
      let dateSimple = paywayData.expiration_date.split(" ");
      return dateSimple[0];
    }
    if (paywayData.expiration) {
      let dateSimple = paywayData.expiration.split(" ");
      return dateSimple[0];
    }

    return "";
  }

  isArrayResponsePayway(param) {
    if (Array.isArray(param)) {
      return true;
    }
  }

  isClaro() {
    return (
      this.props.extradata.provider &&
      this.props.extradata.provider.startsWith("CV_")
    );
  }

  isItunes() {
    return (
      this.props.extradata.payway &&
      this.props.extradata.payway.gateway &&
      this.props.extradata.payway.gateway === "itunesgate"
    );
  }

  isPlayTV() {
    return (
      this.props.producttype &&
      this.props.producttype === "PLAY_TV"
    );
  }

  getTextsKey() {
    return this.isItunes() && this.isClaro()? 'itunesgate' : 'default';
  }

  performCancel(){
    this.setState({canceling:true});
    const CancelSusc= new CancelSuscTask({purchase_id:this.props.extradata.payway.purchase_id});
   RequestManager.addRequest(CancelSusc).then(this.successCancel).catch(x=>{ this.setState({canceling:false}); console.log('ocurrio un error durante la cancelacion')})
  }
  successCancel(){

    const modal = {
      modalType: MODAL_SUCCESS,
      modalProps: {
        title: Translator.get(
          'titulo_cancelacion_exitosa',
          "Cancelación exitosa"
        ),
        content:Translator.get(
          'contenido_cancelacion_exitosa',
          "Tu cancelacion fue recibida y procesada con exito"
        ),
      }
    }
    this.setState({in_process_canceled:true,canceling:false});
    this.props.showModal(modal);
  }

  onCancel(event) {

    /*if(this.canceling==true){
      const modal = {
        modalType: MODAL_GENERIC,
        modalProps: {
          buttons: [
            {
              content:Translator.get('llave_cancelar',
                "Aceptar."
              ),
              props: {
                onClick:x=>{},
              }
            },
          ],
          content:Translator.get(
            'contenido_estamos_cancelando',
            "Estamos procesando tu solicitud por favor ten paciencia"
          ),
        }
      }
      this.props.showModal(modal);
      return;
    } */

    const texts = this.getTextsKey();

    // aqui empieza el hardcodeo neta hay que cambiarlo cuando tengamos llaves
    let hardCodeText = "";
    if (
      this.props.extradata &&
      this.props.extradata.provider &&
      this.VENDORS_DEMO &&
      this.VENDORS_DEMO[this.props.extradata.provider]
    ) {
      hardCodeText = `Si cancelas tu suscripción ${this.VENDORS_DEMO[
        this.props.extradata.provider
        ]}, , no podrás disfrutar de las series exclusivas, películas nuevas y eventos deportivos, para ver donde quieras. 
          
          ¿Estás seguro que deseas cancelar tu suscripción?`;
    }


    let provider=this.props.extradata.provider;
    const modal = {
      modalType: MODAL_GENERIC,
      modalProps: {
        buttons: [ {
          content:Translator.get(
            this.props.extradata.texts[texts].cancellation_dialog
              .dialog_button_no,
            "NO, VOLVER."
          ),
          props: {
            onClick:x=>console.log('usuario decide no cancelar'),
          }
        },
          {
            content:Translator.get(
              this.props.extradata.texts[texts].cancellation_dialog
                .dialog_button_yes,
              "SI."
            ),
            props: {
              onClick:this.performCancel,
            }
          },

        ],
        title: Translator.get(
          this.props.extradata.texts[texts].cancellation_dialog.dialog_title,
          "Cancela tu Suscripci&oacute;n"
        ),
        content:Translator.get(
          this.props.extradata.texts[texts].cancellation_dialog
            .dialog_description,
          "¿Estás seguro que deseas cancelar tu Suscripci&oacute;n?"
        ),
       // withCancel:true,
      }
    }
    this.props.showModal(modal);
  }

  render() {
    if (!this.props.extradata.payway && !this.props.translations) {
      return null;
    }

    if (
      this.props.extradata.payway &&
      this.props.extradata.payway.purchase_data
    ) {
      this.props.extradata.payway.purchase_data.price = this.props.extradata.payway.price;
      this.props.extradata.payway.purchase_data.currency = this.props.extradata.payway.currency;
      this.props.extradata.payway = this.props.extradata.payway.purchase_data;
    }

    const texts = this.getTextsKey();

    let textDesc =
      "Actualmente estás disfrutando la suscripción a {@PROVIDER} con cargo a tu {@MEDIOPAGO}, hasta el {@EXPIRATION}";
    let optionalTitle = "Suscripcion " + this.props.extradata.provider;
    let optionalCancelation = "tu Renovacion";

    if (
      this.props.extradata &&
      this.props.extradata.provider &&
      this.VENDORS_DEMO &&
      this.VENDORS_DEMO[this.props.extradata.provider]
    ) {
      optionalTitle =
        "Suscripcion " + this.VENDORS_DEMO[this.props.extradata.provider];
      optionalCancelation = `Tu renovación automática para ${this
        .VENDORS_DEMO[
        this.props.extradata.provider
        ]} fue suspendida con éxito.`;
    }

    if (
      this.props.extradata &&
      this.props.extradata.texts &&
      this.props.extradata.texts[texts] &&
      this.props.extradata.texts[texts].offer_description &&
      this.props.extradata.texts[texts].offer_description.purchased
    ) {
      if (
        this.props.translations &&
        this.props.translations[
          this.props.extradata.texts[texts].offer_description.purchased
          ]
      ) {
        textDesc = Translator.get(
          this.props.extradata.texts[texts].offer_description.purchased
        );
      }
    }

    let proveedor = "Claro";
    let gateway = " medio de pago";
    const payway = this.props.extradata.payway || {};

    if (
      this.props.extradata &&
      this.props.extradata.provider &&
      this.VENDORS_DEMO &&
      this.VENDORS_DEMO[this.props.extradata.provider]
    ) {
      proveedor = this.VENDORS_DEMO[this.props.extradata.provider];
    }

    if (
      this.props.translations &&
      this.props.extradata &&
      this.props.extradata.provider &&
      this.props.translations[this.props.extradata.provider]
    ) {
      proveedor = Translator.get(
        this.props.extradata.provider
      );
    }

    if (
      this.props.extradata &&
      this.props.extradata.payway &&
      this.props.extradata.payway.gateway &&
      this.GATEWAYS_DEMO &&
      this.GATEWAYS_DEMO[this.props.extradata.payway.gateway]
    ) {
      gateway = this.GATEWAYS_DEMO[this.props.extradata.payway.gateway];
    }

    if (
      this.props.extradata &&
      this.props.extradata.payway &&
      this.props.extradata.payway.gateway &&
      this.props.translations &&
      this.props.translations[this.props.extradata.payway.gateway]
    ) {
      gateway = Translator.get(
        this.props.extradata.payway.gateway
      );
    }

    // FIXME: get real countries from config
    const countries = ["dominicana", "chile"];
    const region = DeviceStorage.getItem('region');
    const subsData =
      this.props.user.paywayData &&
      this.props.user.paywayData.reduce((p, c) => {
        return c.purchase_data.purchase_id !== payway.purchase_id ? p : c;
      }, {});

    if (countries.indexOf(region) === -1) {
      const old = textDesc;
      textDesc = Translator.get(
        subsData.offer_text,
        old
      );
    }

    textDesc = textDesc
      .replace("{@PROVIDER}", proveedor)
      .replace(
        "{@PRICE}",
        this.props.extradata.payway.currency +
        " " +
        this.props.extradata.payway.price
      )
      .replace("{@MEDIOPAGO}", gateway)
      .replace("{@EXPIRATION}", this.setExpirationDate());
    const content = (
      <div className="row">
        <div className="left-content">
                <div className="title">
                  {Translator.get(
                    this.props.extradata.title,
                    optionalTitle
                  )}
                </div>
        {this.props.extradata.payway ? (
            <div  className="body">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: textDesc
                    }}
                  />
                {!this.state.in_process_canceled && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: Translator.get(
                            this.props.extradata.texts && this.props.extradata.texts[texts] && this.props.extradata.texts[texts].offer_message
                              .purchased,
                            "Recuerda que tu suscripción se renovará automáticamente. Si deseas cancelar el servicio deberás hacerlo 24 horas antes de la fecha de vencimiento. De esta manera evitarás que se te deduzcan nuevos cargos. "
                          )
                        }}
                      />

                )}

                {this.state.in_process_canceled && (
                      <div>
                        {Translator.get(
                          this.props.extradata.texts && this.props.extradata.texts[texts] && this.props.extradata.texts[texts].offer_message
                            .in_process_canceled,
                          "Tu renovación automática fue suspendida con éxito."
                        )}{" "}
                      </div>
                )}
            </div>
          ) : (
            <div />
          )}
        </div>
        <div className="right-content">
        {!this.isItunes() && !this.isPlayTV() &&( this.state.canceling || this.state.in_process_canceled?<div className="focusable button"> {this.state.in_process_canceled?Translator.get(
              "profile_suscription_button_canceled",
              "Cancelada"
            ):"..."}</div>:<a
            href="javascript:void(0)"
            id="btn_suspender"
            type="button"
            className="focusable button"
            onClick={this.onCancel.bind(this)}
          >
            {Translator.get(
              "profile_suscription_button_cancel",
              "Cancelar Suscripci&oacute;n"
            )}
          </a>)}
        </div>
      </div>
    );

    return (
      <div> {content}</div>
    );
  }
}

export default  connect(null, { showModal })(UnSubscription);
