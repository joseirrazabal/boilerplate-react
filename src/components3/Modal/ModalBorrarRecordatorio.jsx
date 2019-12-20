import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import ReminderDelete from '../../requests/tasks/user/ReminderDeleteTask'
import RequestManager from "../../requests/RequestManager";
import ReminderNotifications from '../../utils/RemindersNotifications/ReminderNotifications';
const reminderDelete = (reminder_id, cb) => {
    ReminderNotifications.clearTimeoutReminder(reminder_id);
    let service = new ReminderDelete(reminder_id);

    RequestManager.addRequest(service).then((resp) => {
        if (typeof cb === 'function') return cb(this);
    }).catch((err) => {
                console.log('ACÁ ANDAMOS')

        console.error(err);
    });
};

const ModalBorrarRecordatorio = (props) => {
    const defaultTile = 'Eliminar Recordatorio';
    const defaultContent = '¿Estás seguro de deseas eliminar este recordatorio?';

    const p = {
        title: defaultTile,
        content: defaultContent,
        buttons: [
            {
                content: 'No',
                props: {
                    onClick: (e) => props.handleClose(e, props.toggleVisibilityStatus)
                }
            },
            {
                content: 'Si',
                props: {
                    onClick: (e) => {
                        reminderDelete(props.reminder_id, props.service);
                        props.handleClose(e, props.toggleVisibilityStatus)
                    }
                }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalBorrarRecordatorio);
