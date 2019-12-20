import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';

import './styles/acceptTerm.css';

const ModalAcceptTerm = (props) => {
    //const defaultAsset = 'https://clarovideocdn6-a.akamaihd.net/pregeneracion//cms/apa/531eed59e4b050ea818ae755/ic_modal_error.png';
    const defaultTile = 'Bienvenido';
    const defaultContent = 'Para que empieces a disfrutar ya del mejor servicio de suscripción y renta on line, solo te pedimos que leas y aceptes nuestros Términos y Condiciones';
    const defaultFooter = 'Al continuar aceptas los Términos y Condiciones';

    let messageModal = props.messageModal ? props.messageModal : null;

    let content = '';
   
    content = `${Translator.get('terms_content', defaultContent)}`;   

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

    const getFooter = () => {
        return (
            <div className='footer'>
                <span>
                    {Translator.get('terms_footer', defaultFooter)}
                </span>
            </div>
        );
    }

    const p = {
        content,
        className: 'acceptTerms',
        title: Translator.get('terms_welcome', defaultTile),
        buttons: [
            {
                content: Translator.get('btn_modal_terms', 'Leer Términos y Condiciones'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onShowTermAndCond),
                }                
            },
            {
                content: Translator.get('btn_modal_ok', 'Aceptar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onAccept),
                }
            }
        ],
        children: getFooter(),
        buttonsAlign: 'vertical',
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalAcceptTerm);
