import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';

import './styles/acceptTerm.css';

const ModalAcceptTermG3 = (props) => {
    //const defaultAsset = 'https://clarovideocdn6-a.akamaihd.net/pregeneracion//cms/apa/531eed59e4b050ea818ae755/ic_modal_error.png';
    const defaultTile = '';
  const defaultContent = 'Para que sigas disfrutando del mejor servicio de suscripción y renta online, te pedimos que leas y aceptes nuestros Términos y Condiciones del servicio.';
    const defaultFooter = 'Al continuar aceptas los Términos y Condiciones';

    let messageModal = props.messageModal ? props.messageModal : null;

    let content = '';
    
  content = `${Translator.get('terms_content_g3', defaultContent)}`;
  const asset = Asset.get('ic_info_alert', '');

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
            <div className='footer g3'>
                <span>
              {Translator.get('ip_telmex_tyc_label_g3', defaultFooter)}
                </span>
            </div>
        );
    }

    const p = {
      content,
      asset,
        className: 'acceptTerms',
        //title: Translator.get('terms_welcome', defaultTile),
        buttons: [
            {
            content: Translator.get('ip_telmex_read_tyc_button_g3', 'Leer Términos y Condiciones'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onShowTermAndCond),
                }                
            },
            {
              content: Translator.get('ip_telmex_continue_button_g3', 'Continuar'),
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

export default withOnClose(ModalAcceptTermG3);
