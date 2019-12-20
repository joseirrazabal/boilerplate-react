/*import './styles/social.css';
import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';

const ModalSocialLevel = (props = {}) => {
    const defaultAsset = 'https://testcvcdn4-a.akamaihd.net/pregeneracion//cms/apa/531eed59e4b050ea818ae755/SC_Nivel0_EstudianteDeActuacion.png';
    const defaultTile = '¡Éxito!';
    const defaultContent = 'Para continuar selecciona Aceptar';

    const asset = props.asset || defaultAsset;
    const title = props.title || defaultTile;
    const content = props.content || defaultContent;

    const p = {
        asset: Asset.get(asset, defaultAsset),
        title: title,
        content: content,
        className: 'modal-social', 
        buttons: [
            {
                content: Translator.get('btn_modal_ok', 'Aceptar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.callback),
                }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalSocialLevel);*/