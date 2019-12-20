import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import Device from "../../devices/device";

const ModalAction = ({ proveedorName, buttons, callback, handleClose, format_type }) => {
  proveedorName=proveedorName.replace(' ',''); //replace para soportar fox v3
  const platform = Device.getDevice().getPlatform();
  const config = Device.getDevice().getConfig();
    const keyTitle = `${proveedorName}_${format_type}_title`;
    const keyContent = `${proveedorName}_${format_type}_description`;
    const keyCancelButton = `${proveedorName}_${format_type}_cancel_button`;
    const keyAsset = `${proveedorName}_${format_type}_icon`;

    const asset = Asset.get(keyAsset, '');
    const title = Translator.get(keyTitle, '');
    const content = Translator.get(keyContent, Translator.get('channel_not_allowed_live', 'No tiene permisos para ver este canal'));
  const buttonCancel =(platform === 'android'
    && config.device_manufacturer === 'huawei'
    && config.device_type === 'ptv')
      ? Translator.get('btn_modal_ok', 'Aceptar')
      : Translator.get(keyCancelButton, 'Cancelar')
        || Translator.get('modal_default_cancel', 'Cancelar');

    const actionButtons = buttons || [];

    const p = {
        content,
        buttons: [
            {
                content: buttonCancel,
                props: {
                    onClick: (e) => handleClose(e, callback),
                }
            },
            ...actionButtons
        ]
    }

    if (asset != keyAsset) p['asset'] = asset;
    if (title != keyTitle) p['title'] = title;

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalAction);
