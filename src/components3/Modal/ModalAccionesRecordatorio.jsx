import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import { MODAL_BORRAR_RECORDATORIO } from '../../actions/modal';
import Device from "../../devices/device";

const ModalAccionesRecordatorio = (props) => {

    const closeApp = () => {
        const system = Device.getDevice().getSystem();
        console.warn('Attemping to close the app...');
        system.exit();
    }

    const p = {
        buttonsAlign: 'vertical',
        buttons: [
            {
                content: 'Ver',
                props: {
                    onClick: (e) => { props.relocation(props.channel_group_id); props.handleClose(e, props.toggleVisibilityStatus); }
                }
            },
            {
                content: 'Borrar',
                props: {
                    onClick: (e) => props.handleSecondModal(e, MODAL_BORRAR_RECORDATORIO, props)
                }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalAccionesRecordatorio);
