import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import { MODAL_BORRAR_CANAL } from '../../actions/modal';
import Device from "../../devices/device";

const ModalAccionesCanales = (props) => {

    const closeApp = () => {
        const system = Device.getDevice().getSystem();
        console.warn('Attemping to close the app...');
        system.exit();
    }

    const p = {
        buttonsAlign: 'vertical',
        buttons: [
            {
                content: 'Cerrar',
                props: {
                    //enlazar acción a ver contenido
                    onClick: (e) => props.handleClose(e, props.toggleVisibilityStatus)
                }
            },
            {
                content: 'Borrar',
                props: {
                    onClick: (e) => props.handleSecondModal(e, MODAL_BORRAR_CANAL, props)
                }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalAccionesCanales);
