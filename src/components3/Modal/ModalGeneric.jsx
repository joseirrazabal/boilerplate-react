import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';

const ModalGeneric = (props) => {
    const asset = props.asset || false;
    const title = props.title || false;
    const content = props.content || false;
    let buttons = [];
    const callback = props.callback || false;
    const buttonsAlign = props.buttonsAlign || 'horizontal';
    const withCancel = props.withCancel || false;

    if (withCancel) {
        const buttonCancel = Translator.get('modal_default_cancel', 'Cancelar');
        buttons.push({
            content: buttonCancel,
            props: {
                onClick: (e) => props.handleClose(e, callback),
            }
        });
    }

    if (props.buttons) {
        const tmp = props.buttons.map(button => {
            const newButton = Object.assign({}, button);
            const cb = newButton.props.onClick;
            newButton.props.onClick = (e) => {
                props.handleClose(e, cb);
            };
            return newButton;
        });
        buttons = [...buttons, ...tmp];
    }

    const p = {
        buttonsAlign,
        buttons
    };

    if (asset) p['asset'] = asset;
    if (title) p['title'] = title;
    if (content) p['content'] = content;

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalGeneric);