import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import './styles/modalShowDetails.css';
import {MODAL_REINTENTO} from "../../actions/modal";

const ModalShowDetails = (props = {}) => {
  const defaultAsset = 'https://clarovideocdn6-a.akamaihd.net/pregeneracion//cms/apa/531eed59e4b050ea818ae755/ic_modal_error.png';
  const defaultTitle = props.defaultTitle || 'Detalles';
  const defaultContent = 'Error';
  const asset = props.asset || defaultAsset;
  const title = props.title || defaultTitle;
  const content = props.content || defaultContent;

  const p = {
    content,
    className: 'show-details',
    asset: Asset.get(asset, defaultAsset),
    buttons: [
      {
        content: Translator.get('net_back_registro_dispositivo', 'Voltar'),
        props: {
          onClick: (e) => props.handleSecondModal(e, MODAL_REINTENTO, props),
        }
      }
    ]
  }
  if(props.title || props.defaultTitle) p.title = Translator.get(title, defaultTitle);

  return <ModalWrapper {...p} />;
}

export default withOnClose(ModalShowDetails);
