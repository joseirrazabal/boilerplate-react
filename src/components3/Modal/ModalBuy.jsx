import React from 'react';
import ModalWrapperNew, { withOnClose } from './ModalWrapperNew';
import Resume from '../Resume';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showLastDigits } from "../../actions/lastDigits";
import * as api from "../../requests/loader";

import './styles/confirmPurchase.css';

import {MODAL_CONFIRMATIONBUY, MODAL_ERRORBUY, MODAL_CONFIRMATION} from "../../actions/modal";

const ModalBuy = (props) => {
console.log("Modal_Buy", props.price)
console.log("test_cardCredit", props.cardCredit.data.creditCardResults.length);
    let Price_data = props.price.amount.toString();
    let Price_start = Price_data.slice(0, -props.price.scale);
    let Price_end = Price_data.slice(-props.price.scale);
    const p = {
        //content: props.content,
        buttons: [
            {
                content: `R$${Price_start},${Price_end}`,
                props: {
                    onClick: async (e) => {
                        // ADD CARD CREDIT TO REDUX
                        let CardCredit = await api.CardCredit();
                        props.showLastDigits(CardCredit)
                        console.log("CardCredit_buy", CardCredit)
                        console.log("CardCredit_buy 2", props.cardCredit.data.creditCardResults.length)
                        if (typeof CardCredit === "object" && CardCredit.data !== undefined) {
                            if (typeof CardCredit.data.creditCardResults === "object") {
                                  if (CardCredit.data.creditCardResults.length === 0) {
                                    return props.handleSecondModal(e, MODAL_ERRORBUY, props)
                                  } else {
                                    return props.handleSecondModal(e, MODAL_CONFIRMATIONBUY, props)
                                  }
                            }
                        }
                       /* if (props.cardCredit.data.creditCardResults.length === 0) {
                            return props.handleSecondModal(e, MODAL_ERRORBUY, props)
                        } else {
                            return props.handleSecondModal(e, MODAL_CONFIRMATIONBUY, props)
                        }*/
                        
                    },
                    className: 'modal-button focusable purchase'
                }
            },
            {
                content: Translator.get('btn_modal_cancel', 'Cancelar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onRetry),
                    className: 'modal-button focusable purchase'
                }
            }
        ],
        children: props.children
    }
    return <ModalWrapperNew {...p}>
    <div className={"modal-resume-data"}>
        <Resume />
    </div>
  </ModalWrapperNew>;
}
const mapStateToProps = state => ({ price: state.price.showPriceProps, cardCredit: state.lastDigits.showLastDigitsProps});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
        showLastDigits
    },
    dispatch
  );


export default withOnClose(connect(mapStateToProps, mapDispatchToProps)(ModalBuy));
