import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';

const ModalVersion = (props) => {
  const defaultTile = 'Hay una nueva versión disponible';
  const defaultContent = '¿Deseas actualizarla?';

  let buttons = [
    {
      content: Translator.get('btn_modal_actualizar', 'Actualizar'),
      props: {
        onClick: (e) => props.callback(e),
      }
    },
    {
      content: Translator.get('btn_modal_omitir', 'Omitir'),
      props: {
        onClick: (e) => props.handleClose(e),
      }
    }
  ];

  if(props.buttons) {
    buttons = props.buttons;
  }

  const p = {
    title: Translator.get('new_version_title', defaultTile),
    content: Translator.get('new_version_msg', defaultContent),
    buttons: buttons
  }

  return <ModalWrapper {...p} />;
}

export default withOnClose(ModalVersion);
