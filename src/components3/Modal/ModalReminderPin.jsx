import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';

const ModalReminderPin = (props = {}) => {

    const title = props.title;
    const content = props.content; 

    const p = {
        title,
        content,
        buttons: [
            {
                content: Translator.get('exit_btn_cancel_txt', 'Cancelar'),
                props: {
                    onClick: (e) => props.handleClose(e)
                }
            },
            {
                content: Translator.get('reminder_button', 'Enviar'),
                props: {
                      onClick: (e) => props.handleClose(e, props.sendRemind),
                 }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalReminderPin);
