import React from 'react';
import PropTypes from 'prop-types';

import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';

const ModalAoVivoNotChannel = (props = {}) => {

    const defaultAsset = Asset.get("net_contenido_alquilado_sin_contenido");
    const contentLineTwo = `${Translator.get("net_sin_plan_activo", "No hay canales disponibles")}`

    const p = {
        className: 'not_channels',
        content: contentLineTwo,
        asset: defaultAsset,
        buttons: [
            {
                content: Translator.get('net_back_registro_dispositivo', 'Cerrar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.callback),
                    className: 'modal-button focusable modal-default-item'
                }
            }
        ]
    }
    return <ModalWrapper {...p} />;
}

ModalAoVivoNotChannel.propTypes = {
    asset: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.object,
    callback: PropTypes.func
}

ModalAoVivoNotChannel.defaultProps = {
    content: {
        code: 'net_sin_plan_activo',
        message: 'Por favor vuelve a intentarlo'
    },
    callback: () => { console.log('callback...') }
};

export default withOnClose(ModalAoVivoNotChannel);
