import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import DeviceNetworkStatus from '../../utils/DeviceNetworkStatus';

const ModalDesconexion = (props) => {
    const defaultTile = 'Tienes un problema con tu conexión';
    const defaultContent = 'Revisa que tu servicio de Internet esté funcionando de forma correcta e intenta nuevamente.';

    const retry = () => {
        new DeviceNetworkStatus().isOnline().then(isOnline => {
            if (isOnline) {
                window.location.reload();
            }
        });
    }

    let buttons = [
        {
            content: Translator.get('btn_modal_retry', 'Reintentar'),
            props: {
                onClick: (e) => retry(),
            }
        },
        {
            content: Translator.get('btn_modal_ok', 'Aceptar'),
            props: {
                onClick: (e) => props.handleClose(e, props.toggleVisibilityStatus),
            }
        }
    ];

    if(props.buttons) {
        buttons = props.buttons;
    }

    const p = {
        title: Translator.get('network_error_ConnectException_title', defaultTile),
        content: Translator.get('network_error_ConnectException_msg', defaultContent),
        buttons: buttons
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalDesconexion);

