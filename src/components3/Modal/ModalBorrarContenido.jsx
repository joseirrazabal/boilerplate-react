import React from 'react';
import ModalWrapper, {withOnClose} from './ModalWrapper';
import Translator from "../../requests/apa/Translator";

const ModalBorrarContenido = (props) => {
  const defaultTile = props.title || 'Eliminar grabación';
  const defaultContent =  props.content || '¿Estás seguro de deseas eliminar esta grabación?';

  const p = {
    title: defaultTile,
    content: defaultContent,
    buttons: [
      {
        content: Translator.get('no', 'No'),
        props: {
          onClick: (e) => props.handleClose(e, props.toggleVisibilityStatus)
        }
      },
      {
        content: Translator.get('yes', 'Sí'),
        props: {
          onClick: (e) => {
            props.myContentDeleteHandler();
            props.handleClose(e, props.toggleVisibilityStatus)
          }
        }
      }
    ]
  };

  return <ModalWrapper {...p} />;
};

export default withOnClose(ModalBorrarContenido);
