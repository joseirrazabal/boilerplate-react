import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import PropTypes from 'prop-types';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import Device from "../../devices/device";
import TrackerManager from '../../utils/TrackerManager';

const ModalError = (props = {}) => {
    const defaultAsset = 'https://clarovideocdn6-a.akamaihd.net/pregeneracion//cms/apa/531eed59e4b050ea818ae755/ic_modal_error.png';
    const defaultTitle = Translator.get('ti_modal_retry','¡Ocurrió algo inesperado!');

    const asset = props.asset || defaultAsset;
    const title = props.title || defaultTitle;

    const codeError = props.content.code;
    let content = Translator.get(codeError);
    const replaces = props.replaces || null;
    /*const getTrackerManager = () => {
      const dashboardTracker = new DashboardTracker();

      return new TrackerManager([ dashboardTracker ]);
    };
    const trackerManager = getTrackerManager();
    if(trackerManager && player){
        trackerManager.error(null, player.getCurrentTime());
        trackerManager.stop(player.getCurrentTime());
    } */


    if ((content == codeError || content == null) && props.content.message) {
        content = props.content.message;
    }
    if(props.message) content = props.message;

    if(props.session && !props.content.code) content = Translator.get("error_404_not_found", "Servicio no disponible, intentar más tarde");

    if(typeof props.setMetricsEvent === 'function'){
      const sendDimension=()=>{
        const payload=new AnalyticsDimensionSingleton().getPayload();
        props.setMetricsEvent(payload);
        props.setMetricsEvent({ type: 'executor'});
      };
      const sendMetric=()=>{
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'errores',
          eventAction: title,
          eventLabel: content,
        });
        props.setMetricsEvent({type:'executor'});
        sendDimension();
      };
      sendMetric();
    }

    const p = {
        content,
        replaces,
        asset: Asset.get(asset, defaultAsset),
        alwaysEnabled: true,
        buttons: [
            {
                content: Translator.get('btn_modal_ok', 'Aceptar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.callback),
                    className: 'modal-button focusable modal-default-item'
                }
            }
        ]
    }
    if(props.title) p.title = Translator.get(title, defaultTitle);
    return <ModalWrapper {...p} />;
}

ModalError.propTypes = {
    asset: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.object,
    callback: PropTypes.func
}

ModalError.defaultProps = {
    content: {
        code: 'modal_msg_error_default',
        message: 'Por favor vuelve a intentarlo'
    },
    callback: () => { console.log('callback...') }
};

export default withOnClose(ModalError);
