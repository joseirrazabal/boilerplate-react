import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { showModal, MODAL_ERROR, MODAL_SUCCESS } from '../../actions/modal';
import { playFullMedia } from '../../actions/playmedia';
import { activateControlPin, activateControlPinWithoutEmail, changeControlPin, modifyControlPin, checkControlPin, remindControlPin } from '../../requests/loader';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import CodeToVal from '../../utils/CodeToVal';

import './styles/pin.css';
import '../../assets/css/simple-line-icons.css';
import Device from "../../devices/device";
import getAppConfig from "../../config/appConfig";

import AAFPlayer from '../../AAFPlayer/AAFPlayer';
import { AAFPLAYER_PLAY } from '../../AAFPlayer/constants';

//Modal types
export const MP_ACTIVACION_PURCHASE = 'MP_ACTIVACION_PURCHASE';
export const MP_ACTIVACION_PARENTAL = 'MP_ACTIVACION_PARENTAL';
export const MP_CAMBIO_PIN = 'MP_CAMBIO_PIN';
export const MP_RECORDAR_PIN = 'MP_RECORDAR_PIN';
export const MP_CAMBIAR_STATUS = 'MP_CAMBIAR_STATUS';
export const MP_CHECAR_STATUS = 'MP_CHECAR_STATUS';

//Modal status types
export const MP_STATUS_ACTIVAR = 'MP_STATUS_ACTIVAR';
export const MP_STATUS_DESACTIVAR = 'MP_STATUS_DESACTIVAR';

class ModalPin extends PureComponent {
  constructor(props) {
    super(props);   
    this.action = props.action || MP_ACTIVACION_PURCHASE;
    this.keys = Device.getDevice().getKeys();
    this.CodeToVal = new CodeToVal();
    const texts = this.getDefaultTexts();
    let hasNextCheck = true;
    //if it enters to check status it only has to type in one pin
    let isCheckingStatus = false;
    this.pinFlag = false;
    this.firstPin = null;
    this.secondPin = null;
    let buttons = [{
      content: Translator.get('exit_btn_cancel_txt', 'Cancelar'),
      props: {
        onClick: (e) => props.handleClose(e, props.callback),
      }
    }];

    this.closePIP();

    switch (this.action) {
      case MP_ACTIVACION_PARENTAL:
        this.pinRatings = props.pinRatings || '20' //TODO: cambiar por ratings default;
      case MP_ACTIVACION_PURCHASE:
        texts.title = Translator.get('modal_activate_pin_title', 'Crea tu PIN de Control Parental');
        texts.content = Translator.get('modal_activate_pin_message', 'Por favor ingrese un pin de 4 a 6 dígitos');
        break;
      case MP_CAMBIO_PIN:
        texts.title = Translator.get('modal_change_pin_title', 'Ingresa tu PIN de Control Parental');
        texts.content = Translator.get('modal_change_pin_message', 'Para continuar con el cambio, ingresa tu PIN actual');
        break;
      case MP_CAMBIAR_STATUS:
        this.type = props.type || MP_STATUS_ACTIVAR;
        hasNextCheck = false;
        this.pinStatus = props.pinStatus;
        if (this.type === MP_STATUS_ACTIVAR) {
          texts.title = Translator.get('modal_activate_pin_confirm_title', 'Reingrese su PIN de Control Parental');
          texts.content = Translator.get('modal_activate_pin_confirm_message', 'Por favor reingrese el PIN de 6 números');
        } else {
          texts.title = Translator.get('modal_deactivate_pin_confrim_title', 'Desactivar Control Parental');
          texts.content = Translator.get('modal_deactivate_pin_confrim_message', 'Al desactivar el Control Parental se perderán todos los ajustes previos, incluyendo la Protección de compras y los Canales bloqueados. ¿Estás seguro que deseas desactivar el Control Parental?');
        }
        break;
      case MP_CHECAR_STATUS:
        hasNextCheck = false;
        isCheckingStatus = true;
        texts.title = Translator.get('modal_check_pin_title', 'Ingresa tu PIN de Control Parental');
        texts.content = '';
        break;
      case MP_RECORDAR_PIN:
        hasNextCheck = false;
        texts.title = Translator.get('modal_remind_pin_title', 'Recuerda tu PIN');
        texts.content = Translator.get('modal_remind_pin_message', 'Tu PIN se enviará al correo electrónico asociado a tu cuenta');
        break;
    }

    if (this.action === MP_RECORDAR_PIN) {
      buttons.push({
        content: 'Enviar',
        props: {
          onClick: (e) => props.handleClose(e, this.sendRemind),
        }
      });
    }

    this.modalProps = {
      buttons: buttons,
      ...texts
    }

    this.defaultTypeInput = 'password';
    this.state = {
      hasNextCheck,
      isCheckingStatus,
      typeInput: this.defaultTypeInput,
      timeInputnumber1: false,
      timeInputnumber2: false,
      timeInputnumber3: false,
      timeInputnumber4: false,
      timeInputnumber5: false,
      timeInputnumber6: false,
      okPressed: false,
      pin: {
        number1: '',
        number2: '',
        number3: '',
        number4: '',
        number5: '',
        number6: ''
      },
      pinConfirm: {}
    }

    this.handleSetPinNumber = this.handleSetPinNumber.bind(this);
    this.toggleTypeInput = this.toggleTypeInput.bind(this);
    this.sendRemind = this.sendRemind.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  setTimerInput=()=>{
    let previousInput=document.activeElement.id;
    this.setState({['timeInput' + previousInput]: false});
  }

  closePIP() {
    //si el PIP esta abierto esta funcion lo cierra    

    let playerState = AAFPlayer.getCurrentPlayingState(false);
    let playerOptions = AAFPlayer.getCurrentPlayerOptions(false);
    
    if (playerState === AAFPLAYER_PLAY
      && playerOptions
      && playerOptions.size
      && playerOptions.size.width
      && playerOptions.size.width < 1280) {

      /**
       *  OJO: Truco para no detener la reproducción ni alterar el estado del player
       */
      AAFPlayer.pause();
      AAFPlayer.setPlayerSize(true, 0, 0, 0, 0);
    }
  }

  handleKeyPress(e) {
    let that = this;
    let swapPin;
    let keyName = that.keys.getPressKey(e.keyCode);
    let keyVal = that.CodeToVal.getKeyValue(keyName);

    if (/[0-9]/.test(keyVal)) {
      that.handleSetPinNumber(document.activeElement.id, keyVal.toString());
    } else {
      swapPin = (that.state.pin[document.activeElement.id]) ? that.state.pin[document.activeElement.id] : '';

      switch (keyName) {
        case "UP":
          if (document.activeElement.id.search("number") !== -1) {
            document.querySelector("#" + document.activeElement.id + " .fa-chevron-up").classList.add('key-push');
            document.querySelector("#" + document.activeElement.id + " .fa-chevron-down").classList.remove('key-push');

            that.clearTimeoutHandler(document.activeElement.id);
            that.setTimeoutHandler(document.activeElement.id);

              if (swapPin !== '') {
                if (swapPin < 9) {
                  swapPin++;
                  that.handleSetPinNumber(document.activeElement.id, swapPin.toString(), false);
                } else {
                  that.handleSetPinNumber(document.activeElement.id, '0', false);
                }
              } else{
                that.handleSetPinNumber(document.activeElement.id, '0', false);
              }
            }
            break;
          case "DOWN":

            //window.SpatialNavigation.pause();
            if (document.activeElement.id.search("number") !== -1) {
              document.querySelector("#"+ document.activeElement.id + " .fa-chevron-down").classList.add('key-push');
              document.querySelector("#"+ document.activeElement.id + " .fa-chevron-up").classList.remove('key-push');

            that.clearTimeoutHandler(document.activeElement.id);
            that.setTimeoutHandler(document.activeElement.id);

              if (swapPin !== '') {
                if (swapPin > 0) {
                  swapPin--;
                  that.handleSetPinNumber(document.activeElement.id, swapPin.toString(), false);
                } else {
                  that.handleSetPinNumber(document.activeElement.id, '9', false);
                }
              } else{
                that.handleSetPinNumber(document.activeElement.id, '9', false);
              }
            } else {
             // window.SpatialNavigation.resume();
            }
            break;
          case "RIGHT":
            if (document.activeElement.id.search("number") !== -1)
              this.setTimerInput();
            break;
          case "LEFT":
            if (document.activeElement.id.search("number") !== -1)
              this.setTimerInput()
            break;
          case "OK":
            if (this.state.pin.number1 !== '' && this.state.pin.number2 !== '' && this.state.pin.number3 !== '' && this.state.pin.number4 !== '' && !(this.state.pin.number5 === '' && this.state.pin.number6 !== '')){
              this.setState({['okPressed']: true});
              that.handleSetPinNumber(document.activeElement.id, swapPin.toString(), true);
              break;
            }
          default:
            if (document.activeElement.id.search("number") !== -1) {
              document.querySelector("#"+ document.activeElement.id + " .fa-chevron-down").classList.remove('key-push');
              document.querySelector("#"+ document.activeElement.id + " .fa-chevron-up").classList.remove('key-push');
            }
            window.SpatialNavigation.resume();
        }
      }
    }

  componentDidMount() {

    document.getElementById('form').addEventListener('keydown', this.handleKeyPress);
    console.log('foco seteado did mount', document.querySelector('#number1'));
    setTimeout(function () {
      window.SpatialNavigation.focus('#number1');
    }, 400)

  }

  componentWillUnmount() {
    window.SpatialNavigation.resume();
    document.getElementById('form').removeEventListener('keydown', this.handleKeyPress);
  }

  clearTimeoutHandler(numberId) {
    this.setState({['timeInput' + numberId]: true});

    if (this.idTimeout) {
      clearTimeout(this.idTimeout);
    }
  }

  setTimeoutHandler(numberId) {
    let that = this;
    this.idTimeout = setTimeout(function () {
      that.setState({['timeInput' + numberId]: false})
    }, 1500);
  }

  getCleanPinNumbers() {
    return {
      number1: '',
      number2: '',
      number3: '',
      number4: '',
      number5: '',
      number6: ''
    };
  }

  getDefaultTexts() {
    return {
      title: 'Falta titulo',
      content: 'Falta texto en contenido',
      buttonCancel: 'Cancelar'
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  handleSetPinNumber(inputId, value, jump = true) {
    //this.setState({ [inputId]: value });
    console.log('Guardando' + inputId + 'valor' + value)
    if (value.length <= 1) {
      const pin = this.state.pin;
      pin[inputId] = value;
      this.setState({pin});
      console.log('Pin state', this.state.pin)

      if (value.length === 1) this.handleFocus(inputId, jump);

      this.handlePinChange(pin, jump);
    }
  }

  handlePinChange(currentPin = null, jump = true) {
    if ((this.state.pin.number6 !== '' || this.state.okPressed) && !this.state.hasNextCheck) {
      this.secondPin = {...this.state.pin}; // por segunda vez el pin
    }

    if ((this.state.pin.number6 !== '' || this.state.okPressed) && this.state.hasNextCheck) {
      this.firstPin = {...this.state.pin}; // Por primera vez el pin
    }

    const pin = currentPin || this.state.pin;
    const isPinComplete = Object.keys(pin).every(key => pin[key]);
    let flag = JSON.stringify(this.firstPin) === JSON.stringify(this.secondPin);
    if (isPinComplete || this.state.okPressed) {
      if (this.state.okPressed){
        this.setState({['okPressed']: false});
      }
      if (jump) {
        this.pinFlag = this.state.isCheckingStatus || (flag && !this.state.hasNextCheck);
        return this.checkCanSubmit();
      } else {
        if (this.endTimeout) {
          clearTimeout(this.endTimeout);
        }
        let that = this;
        this.endTimeout = setTimeout(function () {
          return that.checkCanSubmit();
        }, 3000);
        this.pinFlag = this.state.isCheckingStatus || (flag && !this.state.hasNextCheck);
      }


    }
  }

  generatePinStringFromState() {
    return Object.keys(this.state.pin).reduce((number, key) => {
      return `${number}${this.state.pin[key]}`
    }, '');
  }

  handleFocus(elementId = null, jump) {
    let nextSelectorToFocus = '#number1';
    if (elementId) {
      const lengthId = elementId.length;
      const defaultInputId = elementId.substring(0, lengthId - 1);
      const numberInput = parseInt(elementId.substring(lengthId - 1, lengthId)) + 1;
      nextSelectorToFocus = `#${defaultInputId}${numberInput}`;
    }
    if (jump) {
      window.SpatialNavigation.focus(nextSelectorToFocus);
    }
  }

  checkCanSubmit() {
    const currentPin = this.generatePinStringFromState();
    if (this.state.hasNextCheck) {
      const cleanPin = this.getCleanPinNumbers();
      let hasNextCheck = false;
      this.pinSaved = currentPin;
      const texts = this.getDefaultTexts();
      window.SpatialNavigation.focus('#number1');

      switch (this.action) {
        case MP_ACTIVACION_PURCHASE:
        case MP_ACTIVACION_PARENTAL:
          texts.title = Translator.get('modal_activate_pin_confirm_title', 'Reingrese su PIN de Control Parental');
          texts.content = Translator.get('modal_activate_pin_confirm_message', 'Por favor reingrese el PIN de 6 números');
          break;
        case MP_CAMBIO_PIN:
          if (!this.isComparingPin) {
            this.oldPin = currentPin;
            texts.title = Translator.get('modal_new_pin_title', 'Cambia tu PIN de Control Parental');
            texts.content = Translator.get('modal_new_pin_message', 'Ingresa tu nuevo PIN de Control Parental ');
            hasNextCheck = true;
            this.isComparingPin = true;
          } else {
            texts.title = Translator.get('modal_new_pin_confirm_title', 'Reingresa tu nuevo PIN de Control Parental');
            texts.content = Translator.get('modal_new_pin_confirm_message', 'Por favor reingrese el PIN nuevamente');
          }
          break;
      }
      const buttons = this.modalProps.buttons;
      this.modalProps = {
        buttons,
        ...texts
      }
      this.setState({hasNextCheck, pin: cleanPin});
      return this.handleFocus();
    }
    return this.submitPin(currentPin);
  }

  async sendRemind() {
    let requestParams = {};
    let functionToRequest = () => {
    };
    functionToRequest = this.performRemindControlPin;
    const response = await functionToRequest(requestParams);
    console.log(response);
  }

  async submitPin(pin = null) {
    const currentPin = pin || this.generatePinStringFromState();

    if (this.pinSaved && this.pinSaved !== currentPin) {
      //return this.handleErrors();
    }

    let requestParams = {};
    let functionToRequest = () => {
    };

    switch (this.action) {
      case MP_ACTIVACION_PURCHASE:
        requestParams.pin_code = currentPin;
        requestParams.user_hash = this.props.user.session_userhash;
        requestParams.pin_purchase = 1;
        functionToRequest = this.performActivateControlPin;
        break;
      case MP_ACTIVACION_PARENTAL:
        requestParams.pin_code = currentPin;
        requestParams.user_hash = this.props.user.session_userhash;
        switch (this.props.activate){
          case 'contents':
            requestParams.pin_parental = 1;
            requestParams.pin_ratings = this.pinRatings;
            break;
          case 'payments':
            requestParams.pin_purchase = 1;
            break;
          case 'channels':
            requestParams.pin_channel = 1;
            break;
          default:
            requestParams.pin_parental = 1;
            requestParams.pin_ratings = this.pinRatings;
        }
        functionToRequest = this.performActivateControlPin;
        break;
      case MP_CAMBIO_PIN:
        requestParams.current_pin = this.oldPin;
        requestParams.new_pin = currentPin;
        functionToRequest = this.performChangeControlPin;
        break;
      case MP_CAMBIAR_STATUS:
        this.type = this.props.type || MP_STATUS_ACTIVAR;
        requestParams.pin = currentPin;

        if (this.type === MP_STATUS_ACTIVAR) {
          requestParams = Object.assign(requestParams, this.pinStatus);
          requestParams.status_channel_pin = 1;
          requestParams.accesss_parental_code = 40;
        } else {
          requestParams.status_channel_pin = 0;
          requestParams.status_parental_pin = 0;
          requestParams.status_purchase_pin = 0;
          requestParams.accesss_parental_code = 0;
        }

        functionToRequest = this.performModifyControlPin;
        break;
      case MP_CHECAR_STATUS:
        requestParams.userId = this.props.user.user_id;
        requestParams.controlPIN = currentPin;
        functionToRequest = this.performCheckControlPin;
        break;
    }

    const response = await functionToRequest(requestParams);
    if (response.success) {
      if(this.action === MP_ACTIVACION_PARENTAL && getAppConfig().device_manufacturer==='huawei' && getAppConfig().device_category==='stb'){
        functionToRequest = this.performActivateControlPinWithoutEmail;
        const responseFromActivatePinWithoutEmail = await functionToRequest(requestParams);
      }

      if (this.action === MP_CHECAR_STATUS && this.props.pinIsCreated && this.props.pinIsCreated === true) {
        if (this.props.successCallBack) {
          this.props.successCallBack(currentPin, (this.props.pinIsCreated && this.props.pinIsCreated === true));
        }
        return;
      }

      if (this.props.successCallBack && this.type === MP_STATUS_DESACTIVAR) {
        this.props.successCallBack(currentPin);
        return;
      }


      let modal;
      const modalProps = {
        modalProps: {
          defaultTitle: Translator.get('modal_pin_create_title', '¡Creaste tu PIN!'),
          content: Translator.get('modal_pin_create_msg', 'Ya puedes comenzar a gestionar tus Ajustes.'),
          callback: () => {
            if (this.props.successCallBack) {

              this.props.successCallBack(currentPin);
            }
          },
        }
      }

      const modalPropsFailed = {
        modalProps: {
          title: 'incorrect_pin_code_msg',
          content: {message: Translator.get('modal_pin_create_msg', 'Los pines ingresados no coinciden')},
          callback: this.props.lastFocus? ()=> { window.SpatialNavigation.focus(this.props.lastFocus) } : null,
        }
      }

      if (this.pinFlag && !this.state.hasNextCheck) {
        modal = {
          modalType: MODAL_SUCCESS,
          ...modalProps,
        }
      } else {
        modal = {
          modalType: MODAL_ERROR,
          ...modalPropsFailed
        }
      }

      return this.props.showModal(modal);
    }

    let errorContent = response.error;
    if (this.action == MP_CHECAR_STATUS) {
      errorContent = {message: response.error.completeError.errors}
    }

    return this.handleErrors({
      content: errorContent,
      callback: this.props.lastFocus? () => { window.SpatialNavigation.focus(this.props.lastFocus) } : null,
    });
  }

  handleErrors(modalProps = {content: 'defaultContentKey'}) {
    const modal = {
      modalType: MODAL_ERROR,
      modalProps: {
        title: 'defaultTitleKey',
        ...modalProps
      }
    }

    if (this.props.callback) {
      this.props.callback(this);
    }

    return this.props.showModal(modal);
  }

  async performActivateControlPin(params = {}) {
    const response = {success: false};
    try {
      const result = await activateControlPin(params);
      if (result && result.status == '0') {
        response.success = true;
      }
    } catch (error) {
      response.error = error;
    }
    return response;
  }


  async performActivateControlPinWithoutEmail(params = {}){
    const response = {success: false};
    try {
      const result = await activateControlPinWithoutEmail(params);
      if (result && result.status == '0') {
        response.success = true;
      }
    } catch (error) {
      response.error = error;
    }
    return response;
  }

  async performChangeControlPin(params = {}) {
    const response = {success: false};
    try {
      const result = await changeControlPin(params);
      if (result && result.status == '0') {
        response.success = true;
      }
    } catch (error) {
      response.error = error;
    }
    return response;
  }

  async performModifyControlPin(params = {}) {
    const response = {success: false};
    try {
      const result = await modifyControlPin(params);
      if (result && result.status == '0') {
        response.success = true;
      }
    } catch (error) {
      response.error = error;
    }
    return response;
  }

  async performCheckControlPin(params = {}) {
    const response = {success: false};
    try {
      const result = await checkControlPin(params);
      if (result && result.status == '0') {
        response.success = true;
      }
    } catch (error) {
      response.error = error;
    }
    return response;
  }

  async performRemindControlPin(params = {}) {
    const response = {success: false};
    try {
      const result = await remindControlPin(params);
      if (result && result.status == '0') {
        response.success = true;
      }
    } catch (error) {
      response.error = error;
    }
    return response;
  }

  toggleTypeInput() {
    setTimeout(function () {
      window.SpatialNavigation.focus('#number1');
    }, 300)

    if (this.state.typeInput === this.defaultTypeInput) {
      return this.setState({typeInput: 'text'})
    }
    return this.setState({typeInput: this.defaultTypeInput})
  }


  render() {
    return (
      <ModalWrapper {...this.modalProps} >
        <form id="form" className="modal-pin-children">
          {this.action !== 'MP_RECORDAR_PIN' &&
          <div>
            <a href="javascript:void(0)" onClick={this.toggleTypeInput}
               className='icon-eye button-show focusable'/>

                            <a id="number1" href="#" className="input-pin focusable" data-sn-up="#number1" data-sn-down="#number1">
                                <i className="fa fa-chevron-up fa-3" aria-hidden="true"></i>
                                <span>
                                    {(this.state.typeInput == 'text' || this.state.timeInputnumber1) &&
                                    this.state.pin.number1
                                    }
                {(this.state.pin.number1 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber1) &&
                '*'
                }
                                </span>
                                <i className="fa fa-chevron-down fa-3" aria-hidden="true"></i>
                            </a>
                            <a id='number2' href="#" className="input-pin focusable" data-sn-up="#number2" data-sn-down="#number2">
                               <i className="fa fa-chevron-up fa-3" aria-hidden="true"></i>
                                <span>
                                    {(this.state.typeInput === 'text' || this.state.timeInputnumber2) &&
                                    this.state.pin.number2
                                    }
                {(this.state.pin.number2 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber2) &&
                '*'
                }
                                </span>
                                <i className="fa fa-chevron-down fa-3" aria-hidden="true"></i>
                            </a>
                            <a id='number3' href="#" className="input-pin focusable" data-sn-up="#number3" data-sn-down="#number3">
                               <i className="fa fa-chevron-up fa-3" aria-hidden="true"></i>
                                <span>
                                    {(this.state.typeInput === 'text' || this.state.timeInputnumber3) &&
                                    this.state.pin.number3
                                    }
                {(this.state.pin.number3 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber3) &&
                '*'
                }
                                </span>
                                <i className="fa fa-chevron-down fa-3" aria-hidden="true"></i>
                            </a>
                            <a id='number4' href="#" className="input-pin focusable" data-sn-up="#number4" data-sn-down="#number4">
                               <i className="fa fa-chevron-up fa-3" aria-hidden="true"></i>
                                <span>
                                    {(this.state.typeInput === 'text' || this.state.timeInputnumber4) &&
                                    this.state.pin.number4
                                    }
                {(this.state.pin.number4 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber4) &&
                '*'
                }
                                </span>
                                <i className="fa fa-chevron-down fa-3" aria-hidden="true"></i>
                            </a>
                            <a id='number5' href="#" className="input-pin focusable" data-sn-up="#number5" data-sn-down="#number5">
                               <i className="fa fa-chevron-up fa-3" aria-hidden="true"></i>
                                <span>
                                    {(this.state.typeInput === 'text' || this.state.timeInputnumber5) &&
                                    this.state.pin.number5
                                    }
                {(this.state.pin.number5 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber5) &&
                '*'
                }
                                </span>
                                <i className="fa fa-chevron-down fa-3" aria-hidden="true"></i>
                            </a>
                            <a id='number6' href="#" className="input-pin focusable" data-sn-up="#number6" data-sn-down="#number6">
                               <i className="fa fa-chevron-up fa-3" aria-hidden="true"></i>
                                <span>
                                    {(this.state.typeInput === 'text' || this.state.timeInputnumber6) &&
                                    this.state.pin.number6
                                    }
                {(this.state.pin.number6 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber6) &&
                '*'
                }
                                </span>
              <i className="fa fa-chevron-down fa-3" aria-hidden="true"></i>
            </a>
          </div>
          }
        </form>
      </ModalWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps, { showModal, playFullMedia})(withOnClose(ModalPin));

