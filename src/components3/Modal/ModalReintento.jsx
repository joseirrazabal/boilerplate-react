import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import {MODAL_SHOW_DETAILS} from '../../actions/modal';
import TrackerManager from '../../utils/TrackerManager';
import './styles/modalReintento.css';
import Device from "../../devices/device";
const ModalReintento = (props) => {
    //const defaultAsset = 'https://clarovideocdn6-a.akamaihd.net/pregeneracion//cms/apa/531eed59e4b050ea818ae755/ic_modal_error.png';
    const defaultAsset = '../../assets/icons/modal_error.png';
    const defaultTile = '¡Ocurrió algo inesperado!';
    const defaultContent = 'Tuvimos un inconveniente al intentar obtener los datos<br>';

    let messageModal = props.messageModal ? props.messageModal : null;

    let content = '';
    if(!messageModal) {
        content = `${Translator.get('msg_modal_retry', defaultContent)} ${props.url}`;
    }
    else {
        content = messageModal;
    }

    TrackerManager.apiError({stackTrace:content,msg:'api_error',url: props.url ? props.url : ''})

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
          eventAction: defaultTile,
          eventLabel: content,
        });
        props.setMetricsEvent({type:'executor'});
        sendDimension();
      };
      sendMetric();
    }
    const p = {
        className: 'retry',
        asset: Asset.get('ic_modal_error', defaultAsset),
        title: Translator.get('ti_modal_retry', defaultTile),
        buttons: [
            {
                content: Translator.get('btn_modal_retry', 'Reintentar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onRetry),
                }
            },
            {
                content: Translator.get('btn_modal_ok', 'Aceptar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onReject),
                }
            },{
                content: Translator.get('btn_modal_ver_detalles', 'Ver detalles'),
                props:{
                  onClick: (e) => props.handleSecondModal(e, MODAL_SHOW_DETAILS, {...props, content:content}),
                }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalReintento);
