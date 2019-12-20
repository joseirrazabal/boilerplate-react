import React from 'react';
import ModalWrapperNew, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showPlayer } from "../../actions/player";
import './styles/modalReintento.css';
import * as api from "../../requests/loader";

import { MODAL_CONFIRMATION } from "../../actions/modal";

const ModalConfirmationBuy = (props) => {
  
  console.log("data_confirmation", props.Offer_valid_zup);
// ZUP
const zup_type_offer = props.Offer_valid_zup[0].validity.period;
console.log("data_confirmation type_offer", zup_type_offer);
const zup_id = props.Offer_valid_zup[0].id;
console.log("data_confirmation id", zup_id)
const zup_item = props.Offer_valid_zup[0].items[0].id;
console.log("data_confirmation zup_item", zup_item)
 
// ID
const content_id = props.offeramco.entry.content_id;

 // IMAGEN Y DESCRIPTION
 const imageUrly = props.contentGroup.group.common.image_medium;
 console.log('COMPLA POPUP', props.contentGroup)
 const contentDescription = props.contentGroup.group.common.description;

 // TARJETA DE CREDITO
 let methodID;

 let test_methodID1 = props.cardCredit.data.creditCardResults.filter(e => e.preferred === true);
 if (props.cardCredit.data.creditCardResults.length === 1) {
    methodID = props.cardCredit.data.creditCardResults[0].creditCardId;
 } else if (test_methodID1.length === 0){
       methodID = props.cardCredit.data.creditCardResults[0].creditCardId;
 }
 else if (test_methodID1.length > 0){
       methodID = test_methodID1;
 }

 // ULTIMO REGISTRO DE LA TARJETA
 let lastDigits;
 if (props.cardCredit.data.creditCardResults.length === 1) {
    lastDigits = props.cardCredit.data.creditCardResults[0].lastDigits;
 }
else if (test_methodID1.length === 0){
    lastDigits = props.cardCredit.data.creditCardResults[0].lastDigits;
 }
 else if (test_methodID1.length > 0) {
    lastDigits = test_methodID1[0].lastDigits
 }

    // PRECIO CON COMA
    let Price_data = props.price.amount.toString();
    let Price_start = Price_data.slice(0, -props.price.scale);
    let Price_end = Price_data.slice(-props.price.scale);

    // DURATION RENTA
    let Duration_renta = props.Offer_valid_zup[0].validity.duration;

    //DESCRIPTION MODAL COMPRA
    let compra = `
    ${Translator.get('net_confirm_compra', 'A compra ser\u00e1 feita no valor de')} ${Price_start},${Price_end} 
    ${Translator.get('net_confirm_compra2', 'cobrado no seu cart\u00e3o, terminado em')} ${lastDigits}`;

    //DESCRIPTION MODAL RENTA
    let renta = `
    ${Translator.get('net_confirm_renta', 'A compra ser\u00e1 feita no valor de')} ${Duration_renta} 
    ${Translator.get('net_confirm_renta2', 'horas por R$')} ${Price_start},${Price_end} 
    ${Translator.get('net_confirm_renta3', 'e ser\u00e1 debitado no seu cart\u00e3o de cr\u00e9dito com final')} ${lastDigits}`;

    const p = {
        className: 'retry',
        //title: Translator.get('ti_modal_retry', 'Confirmar Compra'),
        content: `${props.Offer_valid_zup[0].validity.period === "HOUR" ? renta : compra}`,
        buttons: [
            {
                //content: Translator.get('btn_modal_retry', 'Continuar'),
                content: 'Continuar',
                props: {
                  onClick: async (e) => {
                      
                      if (zup_type_offer === "MONTH") { // Compra
                        props.showPlayer(true);
                        let CheckoutBuys = await api.CheckoutBuy(zup_id, methodID, imageUrly, contentDescription)
                        
                        return props.handleSecondModal(e, MODAL_CONFIRMATION, props)
                      }
                      if (zup_type_offer === "HOUR") {// Renta
                        props.showPlayer(true);
                         let CheckoutBuys = await api.CheckoutRenta(zup_id, methodID, imageUrly, contentDescription, zup_item, content_id)
                        
                            return props.handleSecondModal(e, MODAL_CONFIRMATION, props)
                        
                      }
                    },
                }
            },
            {
                content: 'Cancelar',
                props: {
                    onClick: (e) => props.handleClose(e, props.onReject),
                }
            }
        ]
    }

    return <ModalWrapperNew {...p} />;
}
const mapStateToProps = state => ({ 
    price: state.price.showPriceProps, 
    lastDigits: state.lastDigits.showLastDigitsProps,
    offeramco: state.pay.showPayProps,
    offerzup: state.zuppay.showPayZupProps,
    cardCredit: state.lastDigits.showLastDigitsProps,
    contentGroup: state.contentData.showContentDataProps,
    subscription: state.subscriptions.showSubscriptionsProps,
    Offer_valid_zup: state.valid_zup.showValidZupProps
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      showPlayer
    },
    dispatch
  );
export default withOnClose(connect(mapStateToProps, mapDispatchToProps)(ModalConfirmationBuy));