import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';

const ModalSuccess = (props = {}) => {
    const defaultAsset = 'https://clarovideocdn6-a.akamaihd.net/pregeneracion//cms/apa/531eed59e4b050ea818ae755/ic_modal_success.png';
    const defaultTitle = props.defaultTitle || '¡Éxito!';
    const defaultContent = 'Para continuar selecciona Aceptar';

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
            content: okText || Translator.get('btn_modal_ok', 'Aceptar'),
            props: {
                onClick: (e) => props.handleClose(e, props.callback),
            }
        }]
    }
    
    if(props.closeTime){
        setTimeout(()=>{
            props.handleClose()
        },props.closeTime);
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalSuccess);
