import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { showModal, MODAL_ERROR, MODAL_SUCCESS } from '../../actions/modal';
import { playFullMedia } from '../../actions/playmedia';
import { activateControlPin, activateControlPinWithoutEmail, changeControlPin, modifyControlPin, checkControlPin, remindControlPin } from '../../requests/loader';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import CodeToVal from '../../utils/CodeToVal';
import Asset from '../../requests/apa/Asset';
import Keyboard from './../Keyboard/Keyboard';
import FormGroup from './../FormGroup';
import Utils from "../../utils/Utils";
import UtilsIpTelmex from "../../utils/user/IpTelmex";
import './styles/keyboard.css';

import './styles/pin.css';
import '../../assets/css/simple-line-icons.css';
import Device from "../../devices/device";
import getAppConfig from "../../config/appConfig";

import AAFPlayer from '../../AAFPlayer/AAFPlayer';
import { AAFPLAYER_PLAY } from '../../AAFPlayer/constants';
import settings from "../../devices/all/settings";

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
    this.wasPip=false;
    this.action = props.action || MP_ACTIVACION_PURCHASE;
    this.keys = Device.getDevice().getKeys();
    this.CodeToVal = new CodeToVal();
    this.texts = this.getDefaultTexts();
    let hasNextCheck = true;
    //if it enters to check status it only has to type in one pin
    let isCheckingStatus = false;
    this.pinFlag = false;
    this.firstPin = null;
    this.secondPin = null;
    const newCb=  typeof props.failedCallBack === 'function'? () =>{
      props.failedCallBack();
      if(props.callback){
        props.callback();
      }
    }: (props.callback ? props.callback : null);
    let buttons = [{
      content: Translator.get('exit_btn_cancel_txt', 'Cancelar'),
      props: {
        onClick: (e) => props.handleClose(e, newCb),
      }
    }];
    if(Device.getDevice().getPlatform() === 'android'){
      this.closePIP(false);
    }

    switch (this.action) {
      case MP_ACTIVACION_PARENTAL:
        this.pinRatings = props.pinRatings || '20' //TODO: cambiar por ratings default;
      case MP_ACTIVACION_PURCHASE:
        this.texts.title = Translator.get('modal_activate_pin_title', 'Crea tu PIN de Control Parental');
        this.texts.content = Translator.get('modal_activate_pin_message', 'Por favor ingrese un pin de 4 a 6 dígitos');
        break;
      case MP_CAMBIO_PIN:
        this.texts.title = Translator.get('modal_change_pin_title', 'Ingresa tu PIN de Control Parental');
        this.texts.content = Translator.get('modal_change_pin_message', 'Para continuar con el cambio, ingresa tu PIN actual');
        break;
      case MP_CAMBIAR_STATUS:
        this.type = props.type || MP_STATUS_ACTIVAR;
        hasNextCheck = false;
        this.pinStatus = props.pinStatus;
        if (this.type === MP_STATUS_ACTIVAR) {
          this.texts.title = Translator.get('modal_activate_pin_confirm_title', 'Reingrese su PIN de Control Parental');
          this.texts.content = Translator.get('modal_activate_pin_confirm_message', 'Por favor reingrese el PIN de 6 números');
        } else {
          this.texts.title = Translator.get('modal_deactivate_pin_confrim_title', 'Desactivar Control Parental');
          this.texts.content = Translator.get('modal_deactivate_pin_confrim_message', 'Al desactivar el Control Parental se perderán todos los ajustes previos, incluyendo la Protección de compras y los Canales bloqueados. ¿Estás seguro que deseas desactivar el Control Parental?');
        }
        break;
      case MP_CHECAR_STATUS:
        hasNextCheck = false;
        isCheckingStatus = true;
        this.texts.title = Translator.get('modal_check_pin_title', 'Ingresa tu PIN de Control Parental');
        this.texts.content = '';
        break;
      case MP_RECORDAR_PIN:
        hasNextCheck = false;
        this.texts.title = Translator.get('modal_remind_pin_title', 'Recuerda tu PIN');
        this.texts.content = Translator.get('modal_remind_pin_message', 'Tu PIN se enviará al correo electrónico asociado a tu cuenta');
        break;
    }

    if (this.action === MP_RECORDAR_PIN) {
      buttons.push({
        content: 'Enviar',
        props: {
          onClick: (e) => props.handleClose(e, this.sendRemind),
        }
      });
    }else{
      buttons.push({
        content: Translator.get('bt_suscripcion_siguiente', 'Siguiente'),
        props: {
          id: 'nextButton',
          onClick: (e) => this.nextButton(),
          disabled: true,
        }
      });
    }

    this.modalProps = {
      extraClass: 'pinKeyboard',
      buttons: buttons,
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
      nextPressed: false,
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
    this.currentNumber = "number1";
    this.handleSetPinNumber = this.handleSetPinNumber.bind(this);
    this.toggleTypeInput = this.toggleTypeInput.bind(this);
    this.sendRemind = this.sendRemind.bind(this);
    this.nextButton = this.nextButton.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyFromKeyboard = this.handleKeyFromKeyboard.bind(this);

  }

  setTimerInput=()=>{
    let previousInput=document.activeElement.id;
    this.setState({['timeInput' + previousInput]: false});
  }

  closePIP(willPause = true) {
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
      if(willPause){
        AAFPlayer.pause();
      }
      AAFPlayer.setPlayerSize(false, -1, -1, 1, 1);
      this.wasPip=true;
    }
  }

  handleKeyPress(e) {
    let that = this;
    let swapPin;
    let keyName = that.keys.getPressKey(e.keyCode);
    let keyVal = that.CodeToVal.getKeyValue(keyName);

    if (!(/[0-9]/.test(keyVal))){
      swapPin = (that.state.pin[document.activeElement.id]) ? that.state.pin[document.activeElement.id] : '';

      switch (keyName) {

          case "RIGHT":
            if (document.activeElement.id.search("number") !== -1)
              this.setTimerInput();
            break;
          case "LEFT":
            if (document.activeElement.id.search("number") !== -1)
              this.setTimerInput()
            break;
          default:
            window.SpatialNavigation.resume();
      }
    }
  }

  handleKeyFromKeyboard(character){
    // that.handleSetPinNumber(document.activeElement.id, keyVal.toString());
    if(character === ''){
        const cleanPin = this.getCleanPinNumbers();
        this.setState({pin: cleanPin});
        this.currentNumber = 'number1';
    }else if (character.length == 1){
        this.handleSetPinNumber(this.currentNumber, character);
        this.nextCurrentNumber();
    }
    // this.currentNumber
    console.log("CHARACTER: ",character);
  }

  handleBackspaceClick(){
    let newPin = this.state.pin;
    if(this.state.pin.number6 === ''){
      this.pastCurrentNumber();
    }
    newPin[this.currentNumber] = '';
    this.setState({pin: newPin});
  }

  nextCurrentNumber(){
    if(!this.currentNumber.includes('6')){
      let number = parseInt(this.currentNumber.substring(6,7));
      number++;
      this.currentNumber = this.currentNumber.substring(0,6) + number;
      this.checkDisableNextButton(number);
    }
  }

  pastCurrentNumber(){
    if(!(this.currentNumber.includes('1'))){
      let number = parseInt(this.currentNumber.substring(6,7));
      number--;
      this.currentNumber = this.currentNumber.substring(0,6) + number;
      this.checkDisableNextButton(number);
    }
  }

  checkDisableNextButton(number){
    if (number > 4){
      document.getElementById('nextButton').removeAttribute('disabled');
      document.getElementById('nextButton').classList.remove("disabled");
    }else{
      document.getElementById('nextButton').setAttribute('disabled','true');
      document.getElementById('nextButton').classList.add("disabled");
    }

  }

  nextButton(swapPin = ''){
    console.log("nextBUTTON activated");
    if (this.state.pin.number1 !== '' && this.state.pin.number2 !== '' && this.state.pin.number3 !== '' && this.state.pin.number4 !== '' && !(this.state.pin.number5 === '' && this.state.pin.number6 !== '')){
        this.setState({['nextPressed']: true}, () => {
        this.handleSetPinNumber(document.activeElement.id, swapPin.toString(), true);
        this.currentNumber = 'number1';
        window.SpatialNavigation.focus('#ABC');
      });
    }
  }


  componentDidMount() {
    document.getElementById('form').addEventListener('keydown', this.handleKeyPress);
    let nextButton = document.getElementById('nextButton');
    if (nextButton){
      nextButton.classList.add("disabled");
    }
    console.log('foco seteado did mount', document.querySelector('#number1'));
    setTimeout(function () {
      window.SpatialNavigation.focus('#number1');
    }, 400)
    window.SpatialNavigation.disable('main_container');
    window.SpatialNavigation.disable('header-top');
    window.SpatialNavigation.disable('nav_down');
  }

  componentWillUnmount() {
    if(this.wasPip){
      AAFPlayer.setPlayerSize(false,settings.live_fullplayer_position_top, settings.live_fullplayer_position_left, settings.live_fullplayer_position_width, settings.live_fullplayer_position_height);
      this.wasPip=false;
    }
    window.SpatialNavigation.resume();
    document.getElementById('form').removeEventListener('keydown', this.handleKeyPress);
    window.SpatialNavigation.enable('main_container');
    window.SpatialNavigation.enable('header-top');
    window.SpatialNavigation.enable('nav_down');
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
    document.getElementById('nextButton').classList.add("disabled");
    document.getElementById('nextButton').setAttribute('disabled','true');
    this.currentNumber = 'number1';
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
    if ((this.state.pin.number6 !== '' || this.state.nextPressed) && !this.state.hasNextCheck) {
      this.secondPin = {...this.state.pin}; // por segunda vez el pin
    }

    if ((this.state.pin.number6 !== '' || this.state.nextPressed) && this.state.hasNextCheck) {
      this.firstPin = {...this.state.pin}; // Por primera vez el pin
    }

    const pin = currentPin || this.state.pin;
    const isPinComplete = Object.keys(pin).every(key => pin[key]);
    let flag = JSON.stringify(this.firstPin) === JSON.stringify(this.secondPin);
    if(isPinComplete || this.state.nextPressed){
      if(!this.state.nextPressed){
        window.SpatialNavigation.focus('#nextButton');
      } else {
          console.log("handlePinChange this.state.nextPressed: ",this.state.nextPressed);
          if (this.state.nextPressed){
            this.setState({['nextPressed']: false});
          }
          this.pinFlag = this.state.isCheckingStatus || (flag && !this.state.hasNextCheck);
          if (jump) {
            return this.checkCanSubmit();
          } else {
            if (this.endTimeout) {
              clearTimeout(this.endTimeout);
            }
            let that = this;
            this.endTimeout = setTimeout(function () {
              return that.checkCanSubmit();
            }, 3000);
          }


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
      this.texts = this.getDefaultTexts();
      window.SpatialNavigation.focus('#number1');

      switch (this.action) {
        case MP_ACTIVACION_PURCHASE:
        case MP_ACTIVACION_PARENTAL:
          this.texts.title = Translator.get('modal_activate_pin_confirm_title', 'Reingrese su PIN de Control Parental');
          this.texts.content = Translator.get('modal_activate_pin_confirm_message', 'Por favor reingrese el PIN de 6 números');
          break;
        case MP_CAMBIO_PIN:
          if (!this.isComparingPin) {
            this.oldPin = currentPin;
            this.texts.title = Translator.get('modal_new_pin_title', 'Cambia tu PIN de Control Parental');
            this.texts.content = Translator.get('modal_new_pin_message', 'Ingresa tu nuevo PIN de Control Parental ');
            hasNextCheck = true;
            this.isComparingPin = true;
          } else {
            this.texts.title = Translator.get('modal_new_pin_confirm_title', 'Reingresa tu nuevo PIN de Control Parental');
            this.texts.content = Translator.get('modal_new_pin_confirm_message', 'Por favor reingrese el PIN nuevamente');
          }
          break;
      }
      const buttons = this.modalProps.buttons;
      this.modalProps = {
        buttons
      }
      this.setState({hasNextCheck, pin: cleanPin});
      return this.handleFocus();
    }
    if (!(this.pinFlag && !this.state.hasNextCheck) && this.action !== MP_CAMBIAR_STATUS) {
      let modal;
      modal = {
        modalType: MODAL_ERROR,
        modalProps: {
          title: 'incorrect_pin_code_msg',
          callback: this.props.lastFocus? ()=> { window.SpatialNavigation.focus(this.props.lastFocus) } : null,
        }
      }
      return this.props.showModal(modal);
    }else{
      return this.submitPin(currentPin);
    }
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
    let m_title='modal_pin_create_title';
    let m_desc='modal_pin_create_msg';

    const currentPin = pin || this.generatePinStringFromState();

    if (this.pinSaved && this.pinSaved !== currentPin) {
      //return this.handleErrors();
    }

    let requestParams = {};
    let functionToRequest = () => {
    };

    switch (this.action) {
      case MP_ACTIVACION_PURCHASE:
        requestParams.pin_code = encodeURIComponent(encodeURIComponent(encodeURIComponent(currentPin)));
        requestParams.user_hash = this.props.user.session_userhash;
        requestParams.pin_purchase = 1;
        functionToRequest = this.performActivateControlPin;
        break;
      case MP_ACTIVACION_PARENTAL:
        requestParams.pin_code = encodeURIComponent(currentPin);
        requestParams.user_hash = this.props.user.session_userhash;
        switch (this.props.activate){
          case 'channels':
            requestParams.pin_channel = 1;
          case 'contents':
            requestParams.pin_parental = 1;
            requestParams.pin_ratings = this.pinRatings;
            break;
          case 'payments':
            requestParams.pin_purchase = 1;
            break;
          default:
            requestParams.pin_parental = 1;
            requestParams.pin_ratings = this.pinRatings;
        }
        functionToRequest = this.performActivateControlPin;
        break;
      case MP_CAMBIO_PIN:
        requestParams.current_pin = encodeURIComponent(this.oldPin);
        requestParams.new_pin = encodeURIComponent(currentPin);
        functionToRequest = this.performChangeControlPin;
        break;
      case MP_CAMBIAR_STATUS:
        this.type = this.props.type || MP_STATUS_ACTIVAR;
        requestParams.pin = encodeURIComponent(currentPin);

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
        requestParams.controlPIN = encodeURIComponent(currentPin);
        functionToRequest = this.performCheckControlPin;
        break;
    }

    const response = await functionToRequest(requestParams);
    if (response.success) {
      if( this.action === MP_ACTIVACION_PARENTAL && getAppConfig().device_category==='stb' && ( getAppConfig().device_manufacturer==='huawei' || getAppConfig().device_manufacturer==='kaonmedia' )){
        functionToRequest = this.performActivateControlPinWithoutEmail;
        const responseFromActivatePinWithoutEmail = await functionToRequest(requestParams);
      }

      if (this.action === MP_CHECAR_STATUS && this.props.pinIsCreated && this.props.pinIsCreated === true) {
        this.closePIP();
        if (this.props.successCallBack) {
          this.props.successCallBack(currentPin, (this.props.pinIsCreated && this.props.pinIsCreated === true));
        }
        return;
      }

      if (this.props.successCallBack && this.type === MP_STATUS_DESACTIVAR) {
        this.props.successCallBack(currentPin);
        return;
      }

      if(this.action===MP_CAMBIO_PIN){
        m_title='modal_modify_pin_ok_title';
        m_desc='modal_modify_pin_ok_message';
      }

      let modal;
      const modalProps = {
        modalProps: {
          defaultTitle: Translator.get(m_title, '¡Creaste tu PIN!'),
          content: Translator.get(m_desc, 'Ya puedes comenzar a gestionar tus Ajustes.'),
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

    if(this.props.failedCallBack){
      this.props.failedCallBack();
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
        <div id='pinKeyboard' >
            <div className='left'>
                <Keyboard
                    modal={true}
                    onClick={(character) => {
                        this.handleKeyFromKeyboard(character);
                    }}
                    backspaceClick={() => {
                        this.handleBackspaceClick();
                }}/>
            </div>
            <div className='right' >
                <div className='title'>
                    <span>{this.texts.title}</span>
                </div>
                <div className='text'>
                    <span className='password'>{this.texts.content}</span>
                </div>
                <form id="form" className="modal-pin-children">
                  {this.action !== 'MP_RECORDAR_PIN' &&
                  <div>
                    <a href="javascript:void(0)" onClick={this.toggleTypeInput}
                       className='icon-eye button-show focusable'/>

                                    <a id="number1" href="#" className="input-pin">
                                        <span>
                                            {(this.state.typeInput === 'text' || this.state.timeInputnumber1) &&
                                            this.state.pin.number1
                                            }
                        {(this.state.pin.number1 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber1) &&
                        '*'
                        }
                                        </span>
                                    </a>
                                    <a id='number2' href="#" className="input-pin">
                                        <span>
                                            {(this.state.typeInput === 'text' || this.state.timeInputnumber2) &&
                                            this.state.pin.number2
                                            }
                        {(this.state.pin.number2 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber2) &&
                        '*'
                        }
                                        </span>
                                    </a>
                                    <a id='number3' href="#" className="input-pin">
                                        <span>
                                            {(this.state.typeInput === 'text' || this.state.timeInputnumber3) &&
                                            this.state.pin.number3
                                            }
                        {(this.state.pin.number3 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber3) &&
                        '*'
                        }
                                        </span>
                                    </a>
                                    <a id='number4' href="#" className="input-pin">
                                        <span>
                                            {(this.state.typeInput === 'text' || this.state.timeInputnumber4) &&
                                            this.state.pin.number4
                                            }
                        {(this.state.pin.number4 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber4) &&
                        '*'
                        }
                                        </span>
                                    </a>
                                    <a id='number5' href="#" className="input-pin">
                                        <span>
                                            {(this.state.typeInput === 'text' || this.state.timeInputnumber5) &&
                                            this.state.pin.number5
                                            }
                        {(this.state.pin.number5 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber5) &&
                        '*'
                        }
                                        </span>
                                    </a>
                                    <a id='number6' href="#" className="input-pin">
                                        <span>
                                            {(this.state.typeInput === 'text' || this.state.timeInputnumber6) &&
                                            this.state.pin.number6
                                            }
                        {(this.state.pin.number6 !== '' && this.state.typeInput === this.defaultTypeInput) && (this.state.pin.number1 !== '' && !this.state.timeInputnumber6) &&
                        '*'
                        }
                                        </span>
                    </a>
                  </div>
                  }
                </form>
            </div>
        </div>
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
