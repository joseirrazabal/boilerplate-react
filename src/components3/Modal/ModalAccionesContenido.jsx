import React from 'react';
import ModalWrapper, {withOnClose} from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import {MODAL_BORRAR_CONTENIDO} from '../../actions/modal';

const ModalAccionesContenido = (props) => {
  const {playContent, playButtonVisible, myContentDeleteHandler, title, content} = props;
  const p = {
    buttons: [{
      content: Translator.get("delete", 'Borrar'),
      props: {
        onClick: (e) => props.handleSecondModal(e, MODAL_BORRAR_CONTENIDO, {myContentDeleteHandler,title,content}),
      }
    }],
    buttonsAlign: 'vertical'
  };

  if (playButtonVisible) {
    p.buttons.unshift({
      content: Translator.get("detail_play", 'Ver Ahora'),
      props: {
        onClick: (e) => {
          playContent();
          //props.handleClose(e, props.toggleVisibilityStatus);
        }
      }
    })
  }

  return <ModalWrapper {...p} />;
}

export default withOnClose(ModalAccionesContenido);
