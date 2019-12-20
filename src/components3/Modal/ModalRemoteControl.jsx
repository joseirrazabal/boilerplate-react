import React from 'react';
import { connect } from 'react-redux';
import Asset from '../../requests/apa/Asset';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import './styles/modalRemoteControl.css';

const ModalRemoteControl = props => {
  // const p = {
  //   className: 'modal-remote-control',
  //   buttonsAlign: 'horizontal',
  //   buttons: [{
  //     content: Translator.get('remote_control_settings_full', 'Seleccionar'),
  //   }, {
  //     content: Translator.get('remote_control_settings_simple', 'Seleccionar'),
  //   }]
  // }
  console.log('Props que vienen desde ContentRemoteControl:', props);
  const buttons = props.remoteControls.map(control => {
    const selected = control.option_id === props.current.option_id;
    return (
      <div>
        <div className="asset-remote-control" style={{backgroundImage: `url(${Asset.get(control.option_id+'_remote_image','')})`,backgroundSize:"100% 100%"}}></div>
        <p>{control.label_large}</p>
        <a
          key={control.option_id}
          className={`modal-button focusable ${selected ? 'modal-default-item' : ''}`}
          href="javascript:void(0)"
          onClick={() => {
              props.callback(control.option_id);
              props.handleClose();
            }
          }
        >
          Seleccionar {selected && <i className="fa fa-check" aria-hidden="true" />}
        </a>
      </div>
    );
  })
  return (
    // <ModalWrapper>
    //   <button>Seleccionar</button>
    //   <button>Seleccionar</button>
    // </ModalWrapper>
    // <ModalWrapper {...p} />
    <ModalWrapper>
      <div className="modal-container-mrc">
        <p className="modal-container-title">{ props.title }</p>
        { buttons }
      </div>
    </ModalWrapper>
  );
};

export default withOnClose(ModalRemoteControl);
