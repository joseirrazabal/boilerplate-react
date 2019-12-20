import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import DeleteBlockedChannels from '../../requests/tasks/user/DeleteBlockedChannelsTask'
import RequestManager from "../../requests/RequestManager";
import channelBlockedUtil from "../../utils/ChannelBlockedUtil";

const reminderDelete = (group_id, cb) => {
    let service = new DeleteBlockedChannels(group_id);

    RequestManager.addRequest(service).then((resp) => {
        unblockChannel(group_id);
        if (typeof cb === 'function') return cb(this);
    }).catch((err) => {
                console.log('ACÁ ANDAMOS');

        console.error(err);
    });
};

const unblockChannel = (groupId) => {
    let channelList = channelBlockedUtil.get('blockedChannels');
    let index = channelList.indexOf(groupId);
    channelList.splice(index,1);
    channelBlockedUtil.clear();
    channelBlockedUtil.set('blockedChannels', channelList);
}

const ModalBorrarCanal = (props) => {
    const defaultTile = 'Desbloquear Canal';
    const defaultContent = '¿Estás seguro de deseas desbloquear este canal?';

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
                        reminderDelete(props.group_id, props.service);
                        props.handleClose(e, props.toggleVisibilityStatus)
                    }
                }
            }
        ]
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalBorrarCanal);
