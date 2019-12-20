import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Device from "../../devices/device";

const ModalPpe = (props) => {
    const defaultTile = 'El contenido que deseas sintonizar es PPE';
    const defaultContent = '¿Deseas pagar por verlo?';

    const closeApp = () => {
        const system = Device.getDevice().getSystem();
        console.warn('Attemping to close the app...');
        system.exit();
    }

    const p = {
        title: Translator.get('ppe_title_msg', defaultTile),
        content: Translator.get('confirmacion_ppe', defaultContent),
        buttons: [
            {
                content: Translator.get('exit_btn_cancel_txt', 'Cancelar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.toggleVisibilityStatus)
                }
            },
            {
                content: Translator.get('btn_aceptar_txt', 'Aceptar'),
                props: {
                    onClick: (e) =>{ props.handleClose(e, props.callback()) }
                }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalPpe);
