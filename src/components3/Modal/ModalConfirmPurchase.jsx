import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';

import './styles/confirmPurchase.css';

const ModalConfirmPurchase = (props) => {

    const defaultTile = props.title || '';

    const p = {
        content: props.content,
        title: defaultTile,
        buttons: [
            {
                content: Translator.get('btn_modal_cancel', 'Cancelar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onRetry),
                    className: 'modal-button focusable purchase'
                }
            },
            {
                content: Translator.get('btn_modal_ok', 'Confirmar'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onConfirm),
                    className: 'modal-button focusable purchase'
                }
            }
        ],
        children: props.children
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalConfirmPurchase);
