import React from 'react';
import ModalWrapperNew, { withOnClose } from './ModalWrapperLoading';
import Translator from '../../requests/apa/Translator';
import { connect } from "react-redux";
import './styles/modalReintento.css';
import * as api from "../../requests/loader";

import {MODAL_CONFIRMATION} from "../../actions/modal";

const ModalConfirmationBuyLoading = (props) => {
 let lastDigits;
 if (props.cardCredit.data.creditCardResults.length === 1) {
    lastDigits = props.cardCredit.data.creditCardResults[0].lastDigits;
 }
 else {
    lastDigits = props.cardCredit.data.creditCardResults.map(e => {
            if (e.preferred === true) {
               return e.lastDigits
          } else  {
               return e.lastDigits
          }
     })
 }
    const p = {
        className: 'retry',
        content: `Se procedera a la compra por $${props.price} con cargo a tu tarjeta con terminacion en ${lastDigits[0]}`,
        buttons: [
            {
            
                content: 'Continuar',
                props: {
                  onClick: async (e) => {
                     return  props.handleClose(e, props.onReject)
                    },
                }
            },
            {
            
                content: 'Continuar',
                props: {
                  onClick: async (e) => {
                     return  props.handleClose(e, props.onReject)
                    },
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
    subscription: state.subscriptions.showSubscriptionsProps
});
export default withOnClose(connect(mapStateToProps, null)(ModalConfirmationBuyLoading));