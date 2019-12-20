import React from 'react';

// Components
import ModalWrapperNew, { withOnClose } from './ModalWrapper';

// Redux
import { connect } from "react-redux";
import { showPlayer } from "../../actions/player";
import { bindActionCreators } from "redux";

// Request
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';

// Styles
import './styles/modalReintento.css';

const ModalErrorBuy = (props) => {

    const defaultAsset = Asset.get("net_vcard_renta_sin_tarjeta");
    const asset = props.asset || defaultAsset;

    const p = {
        className: 'retry error-buy',
        asset: Asset.get(asset, defaultAsset),
        content: Translator.get('net_sin_medio_de_pago', '- No cuentas con un medio de pago, para ingresar uno, abre la aplicacion desde un dispositivo movil'),
        buttons: [
            {
                content: Translator.get('net_cerrar_sin_medio_de_pago', 'Cerrar'),
                props: {
                    onClick: (e) => {
                       return props.handleClose(e, props.onReject)
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
    contentGroup: state.contentData.showContentDataProps
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      showPlayer
    },
    dispatch
  );
export default withOnClose(connect(mapStateToProps, mapDispatchToProps)(ModalErrorBuy));