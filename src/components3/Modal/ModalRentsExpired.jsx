import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';

const ModalRentsExpired = (props = {}) => {
    const defaultAsset = Asset.get("net_contenido_alquilado_sin_contenido");
    const defaultTitle = props.defaultTitle || '¡Éxito!';
    const defaultContent = Translator.get('net_alugados_contenido_no_disponible', 'Este conteudo foi removido.');

    const asset = props.asset || defaultAsset;
    const title = props.title || defaultTitle;
    const content = props.content || defaultContent;
    const okText = props.okText ? props.okText : false;
    const replaces = props.replaces || null;

    const p = {
        content,
        replaces,
        asset: Asset.get(asset, defaultAsset),
    }

    if(props.title || props.defaultTitle) p.title = Translator.get(title, defaultTitle);

    if(!props.noButton) {
        p.buttons = [{
            content: okText || Translator.get('net_cerrar_sin_medio_de_pago', 'Volver'),
            props: {
                onClick: (e) => props.handleClose(e, window.history.back(-1)),
            }
        }]
    }
    
    if(props.closeTime){
        setTimeout(()=>{
            props.handleClose()
        },props.closeTime);
    }

    return <ModalWrapper className="modal-rent-expired" {...p} />;
}

export default withOnClose(ModalRentsExpired);
