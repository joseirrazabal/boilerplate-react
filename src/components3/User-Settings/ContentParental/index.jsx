import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ToggleSwitch from '../../ToggleSwitch';
import RequestManager from "../../../requests/RequestManager";
import StatusControlPinTask from '../../../requests/tasks/user/StatusControlPinTask';
import { modifyControlPin } from '../../../requests/loader';
import PropTypes from "prop-types";

import ModalConductor from '../../../containers/Modal';
import {showModal, MODAL_LANGUAGE, MODAL_PIN, HIDE_MODAL, MODAL_REMINDER_PIN} from '../../../actions/modal';
import Device from "../../../devices/device";
import store from "../../../store";
import Utils  from '../../../utils/ParentalControl';
import UtilsPin from '../../../utils/pinParental/UtilsPin';
import Translator from '../../../requests/apa/Translator';
class ContentParental extends Component {
    static contextTypes = {
        router: PropTypes.object
    }

    constructor(props,context) {
        super(props,context);
        this.state = {
            contenidos: false,
            pagos: false,
            canales: false,
            pin_rating: "PG",
            pin_status: {
                parental: 0,
                purchase: 0,
                channel: 0,
                parentalCode:20,
            },
            options:[],
        };

        this.pin_code = '';
        this.jsonClassification = Utils.getContentClassification()


        this.statusRequest = new StatusControlPinTask();
        this.device = Device.getDevice().getPlatform();
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.cancelClickHandler = this.cancelClickHandler.bind(this);
        this.setterHandler = this.setterHandler.bind(this);
        this.sendModifyControl = this.sendModifyControl.bind(this);
        this.locationHandler = this.locationHandler.bind(this);
        this.showClasificationModal=this.showClasificationModal.bind(this);
    }

    pinWasActivate = (value)=>{
      this.checkStatus();
      this.setterHandler(value);
    }

    pinWasDesactivate = ()=>{
      this.checkStatus();
      this.state.canales=false;
      this.closeModal();
    }

    componentWillMount() {
        this.checkStatus();
    }

    componentWillUpdate(nextProps, nextState){
      if(this.props.status!==nextProps.status)
        this.checkStatus();
    }

    componentDidUpdate() {
        window.SpatialNavigation.makeFocusable();
    }

    displayItems(itemsArray , property) {
        for(var i=0; i<itemsArray.length; i++) {
          itemsArray[i].style.display = property;
        }
    }

    checkStatus() {
        RequestManager.addRequest(this.statusRequest).then((resp) => {
            this.setState({
                contenidos: (resp.response.pin_parental.status == 1)? true : false,
                pagos: (resp.response.pin_purchase.status == 1)? true : false,
                canales: (resp.response.pin_channel.status == 1)? true : false,
                pin_status: {
                    parental: resp.response.pin_parental.status,
                    purchase: resp.response.pin_purchase.status,
                    channel: resp.response.pin_channel.status
                },

            });
            document.getElementsByName('switch_contenidos')[0].checked = resp.response.pin_parental.status;
            document.getElementsByName('switch_pagos')[0].checked = resp.response.pin_purchase.status;
            document.getElementsByName('switch_canales')[0].checked = resp.response.pin_channel.status;
            this.displayHeaderButtons();

            if (resp.response.pin_parental.info) {
                let value = resp.response.pin_parental.info.value;

                this.setClassification(value);
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    setClassification(value) {
        let that = this
        this.jsonClassification.map(function(json) {
            if ( json.value == value) {

                console.log('la clasificación es:',json.acronym);
                that.setState({ pin_rating: json.acronym });
                document.getElementsByName('parental_code')[0].value = value;
            }
        });
        this.jsonClassification=this.jsonClassification.map((it)=>{
          if(it.value===value){
            it.active=true;
          }else it.active=false;
          return it;
        });
    }

    displayHeaderButtons() {
        if(document.getElementsByName('switch_contenidos')[0].checked || document.getElementsByName('switch_pagos')[0].checked || document.getElementsByName('switch_canales')[0].checked){
            this.displayItems(document.getElementsByClassName('header-button'), 'block');
        } else {
            this.displayItems(document.getElementsByClassName('header-button'), 'none');
        }
    }

    activationModalTrigger(id) {
        if ( this.state.pin_status.parental == 0 && this.state.pin_status.purchase == 0 && this.state.pin_status.channel == 0 ) {
            return true;
        }

        return false;
    }

    cancelClickHandler(id,state) {
        this.displayHeaderButtons();
    }

    toogleSwitch(id,state){
        document.getElementsByName(id)[0].checked = !document.getElementsByName(id)[0].checked;
        this.setState({[state]: document.getElementsByName(id)[0].checked});
    }

    getLastFocus = ()=>{
      let lastFocus=document.activeElement.getAttribute('id');
      return `#${lastFocus}`;
    }

    onChangeHandler(inputId) {
        const showModal = this.props.showModal;
        let requestParams = {};
        requestParams.status_purchase_pin = (document.getElementsByName('switch_pagos')[0].checked == false)? 0 : 1;
        requestParams.status_parental_pin = (document.getElementsByName('switch_contenidos')[0].checked == false)? 0 : 1;
        requestParams.status_channel_pin = (document.getElementsByName('switch_canales')[0].checked == false)? 0 : 1;
        requestParams.accesss_parental_code = document.getElementsByName('parental_code')[0].value;

        switch (inputId) {
            case "switch_contenidos":
                requestParams.status_parental_pin = requestParams.status_parental_pin == 0 ? 1 : 0;
                if(this.pin_code === ''){
                    if ( this.activationModalTrigger(inputId) ) {
                      showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_ACTIVACION_PARENTAL', activate: 'contents', lastFocus:this.getLastFocus() , successCallBack: (value) => {this.props.toggleStatus();} } });
                      document.getElementsByName(inputId)[0].checked =false;
                    } else {
                      showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_CHECAR_STATUS', callback: () => { this.cancelClickHandler(inputId, 'contenidos') }, lastFocus:this.getLastFocus() ,pinIsCreated:true, successCallBack: (value, pinIsCreated) => { this.setterHandler(value,pinIsCreated,inputId, 'contenidos'); this.sendModifyControl(requestParams, value) } } });
                    }
                } else {
                    this.sendModifyControl(requestParams, this.pin_code);
                    this.toogleSwitch( inputId, 'contenidos');
                }

                this.setState({contenidos: document.getElementsByName(inputId)[0].checked});
                break;
            case "switch_pagos":
                requestParams.status_purchase_pin = requestParams.status_purchase_pin == 0 ? 1 : 0;
                if(this.pin_code === ''){
                    if ( this.activationModalTrigger(inputId) ) {
                      showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_ACTIVACION_PARENTAL',activate: 'payments', lastFocus:this.getLastFocus() ,successCallBack: (value) => {this.props.toggleStatus();} } });
                      document.getElementsByName(inputId)[0].checked =false;
                    } else {
                      showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_CHECAR_STATUS', callback: () => { this.cancelClickHandler(inputId, 'pagos') },lastFocus:this.getLastFocus(), pinIsCreated:true, successCallBack: (value, pinIsCreated) => { this.setterHandler(value,pinIsCreated,inputId, 'pagos'); this.sendModifyControl(requestParams, value) } } });
                    }
                } else {
                    this.sendModifyControl(requestParams, this.pin_code);
                    this.toogleSwitch( inputId, 'pagos');
                }

                this.setState({pagos: document.getElementsByName(inputId)[0].checked});
                break;
            case "switch_canales":
                requestParams.status_channel_pin = requestParams.status_channel_pin == 0 ? 1 : 0;
                if(this.pin_code === ''){
                    if ( this.activationModalTrigger(inputId) ) {
                      showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_ACTIVACION_PARENTAL',activate: 'channels', lastFocus:this.getLastFocus() , successCallBack: (value) => {this.props.toggleStatus();}} });
                      document.getElementsByName(inputId)[0].checked =false;
                    } else {
                      showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_CHECAR_STATUS', callback: () => { this.cancelClickHandler(inputId, 'canales') },lastFocus:this.getLastFocus(), pinIsCreated:true, successCallBack: (value, pinIsCreated) => { this.setterHandler(value,pinIsCreated, inputId, 'canales'); this.sendModifyControl(requestParams, value) } } });
                    }
                } else {
                    this.sendModifyControl(requestParams, this.pin_code);
                    this.toogleSwitch( inputId, 'canales');
                }

                this.setState({canales: document.getElementsByName(inputId)[0].checked});
                break;
        }
        this.displayHeaderButtons();
    }

    setterHandler(value,pinIsCreated=false,id = false ,state = false) {
        this.pin_code = value;
        this.closeModal(pinIsCreated);
        if (id && state){
            this.toogleSwitch(id,state);
        }
    }

    async sendModifyControl(requestParams = {}, pin) {
        requestParams.pin = encodeURIComponent(pin);
        let functionToRequest = () => { };
        functionToRequest = this.modifyControlPin;
        const response = await functionToRequest(requestParams);
    }

    async modifyControlPin(params = {}) {
        const response = { success: false };
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

    locationHandler() {
        this.context.router.history.push('/user-settings/control%20parental/bloqueo%20de%20canales');
    }

    setParentalCode(value) {
        this.setClassification(value);
        let requestParams = {};
        requestParams.status_purchase_pin = (document.getElementsByName('switch_pagos')[0].checked == false)? 0 : 1;
        requestParams.status_parental_pin = (document.getElementsByName('switch_contenidos')[0].checked == false)? 0 : 1;
        requestParams.status_channel_pin = (document.getElementsByName('switch_canales')[0].checked == false)? 0 : 1;
        requestParams.accesss_parental_code = value;
        this.sendModifyControl(requestParams, this.pin_code);
    }

    closeModal(pinIsCreated) {
      if(pinIsCreated) {
        store.dispatch({
          type: HIDE_MODAL,
          modalType: MODAL_PIN
        });
      }
    }

    showClasificationModal(){
      this.props.showModal({
        modalType: MODAL_LANGUAGE,
        modalProps: {
          title: Translator.get('title_content_classification','Configuración de clasificación de contenidos'),
          content: Translator.get('description_content_classification','Selecciona la clasificación a partir de la cual se solicitará ingresar el PIN de control parental'),
          options: this.jsonClassification,
          type: 'class',
          service: (value) => { this.setParentalCode(value) }
        }
      });
    }

    sendModalReminder(){
        var modalRemider = { 
            modalType: MODAL_REMINDER_PIN, 
            modalProps: { 
                title:  Translator.get('modal_remind_pin_title', 'Recuerda tu PIN'),
                content: Translator.get('modal_remind_pin_message', 'Tu PIN se enviará al correo electrónico asociado a tu cuenta'),
                sendRemind: () => UtilsPin.sendRemind(),
            }
        }
        this.props.showModal(modalRemider);
    }

    modalActions(toDo) {
        const showModal = this.props.showModal;
        const modal =  document.getElementsByClassName('modal-overlay');
        switch (toDo) {
            case 'cambiar':
                showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_CAMBIO_PIN', lastFocus:this.getLastFocus()} });
                break;
            case 'recordar':
                this.sendModalReminder();
                break;
            case 'desactivar':
                showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_CAMBIAR_STATUS', type: 'MP_STATUS_DESACTIVAR', lastFocus:this.getLastFocus(), successCallBack: (value) => { this.closeModal(true);this.props.toggleStatus(); } } });
                break;
            case 'clasificacion':
                if(this.pin_code === ''){
                  showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_CHECAR_STATUS', pinIsCreated:true,lastFocus:this.getLastFocus(), successCallBack: (value, pinIsCreated) => { this.setterHandler(value,pinIsCreated); this.showClasificationModal(); } } });
                } else {
                  this.showClasificationModal();
                }
                break;
            case 'modificar_canales':
                if(this.pin_code === ''){
                    showModal({ modalType: MODAL_PIN, modalProps: { action: 'MP_CHECAR_STATUS', pinIsCreated: true, lastFocus:this.getLastFocus(), successCallBack: (value,pinIsCreated ) => { this.setterHandler(value,pinIsCreated); this.locationHandler() } } });
                } else {
                    this.locationHandler();
                }
                break;
        }
    }

    onFocus(id){
        if(id === 'canales' || id === 'contenidos'){
            let elements = document.getElementsByClassName('scroller-container');
            elements[0].scrollTop = 0;
        }
    }

    render(){
        let buttonText,
            displayArrow,
            buttonMiddle,
            buttonMiddleAction,
            condicion;

        if (this.props.buttonText) {
            buttonText = this.props.buttonText;
            displayArrow = 'none';
            condicion = this.state.canales;
        } else {
            buttonText = "Clasificación " + this.state.pin_rating;
            condicion = this.state.contenidos;
        }

        buttonMiddleAction = (this.props.typeButton === 'select')? 'clasificacion' : 'modificar_canales'

        buttonMiddle =
            <a href="javascript:void(0)" id={ "button-"+this.props.id } onFocus={() => { this.onFocus(this.props.id) }} onClick={ () => { this.modalActions(buttonMiddleAction) } } className="selection-middle focusable">
                { buttonText }<i style={ { display: displayArrow } } className="fa fa-angle-down fa-lg" aria-hidden="true"></i>
            </a>;

        return(
            <div id={ this.props.id } className="ContentParetnal">
                <div className="left-content">
                    { this.props.headButtons&&
                    <div id="container-headbuttons">
                        <a href="javascript:void(0)" id="button-cambiar" className="header-button focusable hide" onClick={ () => { this.modalActions('cambiar') } }>
                            Cambiar PIN
                        </a>
                        <a href="javascript:void(0)" id="button-recordar" className="header-button focusable hide" onClick={ () => { this.modalActions('recordar') } }>
                            Recordar PIN
                        </a>
                        <a href="javascript:void(0)" id="button-desactivar" className="header-button focusable hide" onClick={ () => { this.modalActions('desactivar') } }>
                            Desactivar
                        </a>
                        <input id="parental_code" type="hidden" name="parental_code" value="20" />
                    </div>
                    }
                    <h2>{ this.props.title }</h2>
                    <p>{ this.props.text }</p>
                </div>
                { condicion&&this.props.display&&
                    buttonMiddle
                }
                <ToggleSwitch id={ "switch_"+this.props.id } onChange={ () => { this.onChangeHandler("switch_"+this.props.id) } } />
            </div>
        );
    }
}

export default connect(null,{showModal})(ContentParental);
