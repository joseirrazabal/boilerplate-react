import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showModal, MODAL_REMOTE_CONTROL } from '../../../actions/modal';
import ModalConductor from '../../../containers/Modal';

import storage from '../../DeviceStorage/DeviceStorage';
import Device from '../../../devices/device';
import Translator from '../../../requests/apa/Translator';
import Asset from '../../../requests/apa/Asset';
import Button from '../../Button';


class ContentRemoteControl extends Component {
  constructor(props) {
    super(props);
    // CU-F: current-Full
    // CU-S: current-S
    this.state = {
      current: []
    };
    this.remoteControls = [{
      label_large: Translator.get('remote_control_simple', 'Control Simple'),
      option_id: 'simple',
    },{
      label_large: Translator.get('remote_control_full', 'Control Full'),
      option_id: "full",
    }];

    this.device = Device.getDevice().getPlatform();
  }

  componentWillMount() {
    let value;

    if(storage.getItem('config_remote_control') && storage.getItem('config_remote_control')!='null') {
      value = storage.getItem('config_remote_control');
      this.remoteControls.map(control => {
        if(value === control.option_id) {
          this.setState({
            current: control,
          })
        }
      });
    } else {
      storage.setItem('config_remote_control', this.remoteControls[0].option_id);
      this.setState({
        current: this.remoteControls[0],
      });
    }
  }

  componentDidMount() {
    window.SpatialNavigation.makeFocusable();
  }

  stateHandler(value) {
    this.remoteControls.map(control => {
      if(value === control.option_id) {
        storage.setItem('config_remote_control', control.option_id);
        this.setState({
          current: control,
        },x=>window.location.reload()) // TODO necesitamos una mejor forma de hacer esto
      }
    });
  }

  keyActions(key) {
    const showModal = this.props.showModal;
    const modal = document.getElementsByClassName('modal-overlay');

    switch (key) {
      case 'OK':
        if(modal.length === 0) {
          showModal({
            modalType: MODAL_REMOTE_CONTROL,
            modalProps: {
              remoteControls: this.remoteControls,
              callback: value => { this.stateHandler(value) },
              title: "Elige tu control remoto",
              current: this.state.current,
            },
          });
        }
        break;
    }
  }

  render() {
    console.log('Estado actual:', this.state);
    const controlType = this.state.current.label_large.split(" ")[1].toLowerCase();
    const message = `${this.props.currentRemoteControl} ${controlType}`;
    return (
      <div>
        <div className="ContentRemoteControl">
          <p>{message}</p>
          <div className="remote-control-container">
            <div className="remote-control-current" style={{backgroundImage: `url(${Asset.get(this.state.current.option_id+'_remote_image','')})`,backgroundSize:"100% 100%"}}></div>
            <p className="label">{this.state.current.label_large}</p>
            <Button
              text="Cambiar"
              className="remote-control-button"
              onClick={() => {this.keyActions('OK')}}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, {showModal})(ContentRemoteControl);
