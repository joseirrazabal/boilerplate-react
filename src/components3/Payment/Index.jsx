import './payment.css';
import * as constant from './constants';
import '../../assets/css/simple-line-icons.css';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Metadata from '../../requests/apa/Metadata';
import Translator from './../../requests/apa/Translator';
import focusSettings from './../Focus/settings';

import RequestManager from '../../requests/RequestManager';
import WorkflowTask from '../../requests/tasks/payway/WorkFlowStartTask';
import ConfirmTask from '../../requests/tasks/payway/ConfirmTask';
import GeneralTask from '../../requests/tasks/claropagos/GeneralTask';
import SimplePostRequestTask from '../../requests/tasks/SimplePostRequestTask';

import Spinner from '../../components/Spinner';
import DeviceStorage from './../DeviceStorage/DeviceStorage';

import { setMetricsEvent } from '../../actions/metrics';

import Utils from "../../utils/Utils";
import UtilsIpTelmex from '../../utils/user/IpTelmex';
import UtilsClaroPagos from "../../utils/payway/claroPagos";
import UtilsPagos from "../../utils/payway/UtilsPagos";
import PlayerUtil from '../../devices/all/PlayerUtil';
import ModalConductor from '../../containers/Modal';
import { showModal, MODAL_DROPDOWN, MODAL_ERROR, MODAL_SUCCESS, MODAL_CONFIRM_PURCHASE, MODAL_KEYBOARD } from '../../actions/modal';
import { connect } from 'react-redux';
import { receiveSubscription } from '../../reducers/user';
import { fetchLinealChannels } from '../../actions/payway';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';

import { LeftPayment, RightPayment } from './Layout';

import store from './../../store';
import { playFullMedia, playPipMedia } from "../../actions/playmedia";

class Payment extends Component {
  constructor(props) {
    super(props);
    this.groupId = parseInt(props.match.params.groupId, 10);
    this.offerId = parseInt(props.match.params.offerId, 10);

    this.backtohome = true;
    this.backToLive = Utils.isNotNullOrNotUndefined(props.location.state.fromsusctv)
    this.enableRedirectHome = false;

    this.pbi = this.props.location.state;
    this.querySelector = '#payment #rightPayment a';
    this.claropagos = {};

    if (this.pbi) {
      this.pbi.isSubscription = this.pbi.oneoffertype ? this.pbi.oneoffertype.indexOf('subscrition') > -1 : false;
      this.pbi.isRent = this.pbi.oneoffertype ? this.pbi.oneoffertype.indexOf('rent') > -1 : false;
      this.pbi.isBuy = true;
      // BACK desde susc desde TV y/o desde carrusel
      this.backtohome = this.pbi.fromsusctv && this.pbi.fromsusctv === 'susctvregistrado' ? false :
        this.pbi.fromVCard ? false : true;
    }
    this.init();
    this.binding();
  }

  binding() {
    this.onPaywaySelect = this.onPaywaySelect.bind(this);
    this.onPaywayChange = this.onPaywayChange.bind(this);
    this.onFormBack = this.onFormBack.bind(this);    
    this.setCurrentKey = this.setCurrentKey.bind(this);
    this.setTextValue = this.setTextValue.bind(this);
    this.setRadioValue = this.setRadioValue.bind(this);
    this.onAcceptPayway = this.onAcceptPayway.bind(this);
    this.onAcceptPaywaySuccess = this.onAcceptPaywaySuccess.bind(this);
    this.onCancelPayway = this.onCancelPayway.bind(this);
    this.onStepBackPayway = this.onStepBackPayway.bind(this);
    this.onCreditCardTypeChange = this.onCreditCardTypeChange.bind(this);
    this.handleErrors = this.handleErrors.bind(this);
    this.showDropDown = this.showDropDown.bind(this);
    this.closeFullPlayer = this.closeFullPlayer.bind(this);
    this.closePipPlayer = this.closePipPlayer.bind(this);
    this.setSuscriptionOnStore = this.setSuscriptionOnStore.bind(this);
    this.redirectSuscription = this.redirectSuscription.bind(this);
    this.setGateway = this.setGateway.bind(this);
    this.hasSavedPayway = this.hasSavedPayway.bind(this);
    
  }

  init() {

    let state = {
      groupId: this.groupId,
      offerId: this.offerId,
      gateway: '',
      hasSavedPayway: false,
      isLoading: false,
      enableFocused: true,
      workflow: {
        listBuyLinks: []
      },
      currentKey: '',
      currentStep: 1,
      isCurrentGatewaySavedPayway: false,
      values: {
        clarocolombiagate: {
          documentTypeId: "",
          documentTypeDesc: Translator.get('suscripcion_tipo_documento', 'Tipo de Documento'),
          document: "",
          account: "",
          captcha: "",
        },
        hubgate: {
          document: "",
          movil: "",
          pinCode: "",
        },
        telmexmexicogate: {
          document: "",
          movil: "",
          pinCode: "",
        },
        hubfijogate: {
          document: "",
          numberField: "",
        },
        hubfacturafijagate: {
          claveservicio: "",
          cuentaservicio: "",
        },
        promogate: {
          codigo: "",
        },
        plazavipgate: {
          address: "",
          cardNumber: "",
          cardType: "",
          city: "",
          dateOfBirth_DD: "",
          dateOfBirth_MM: "",
          dateOfBirth_YY: "",
          expiryDate_MM: "",
          expiryDate_YY: "",
          name: "",
          securityCode: "",
          states: "",
          statesDesc: "",
          telefono: "",
          zipCode: "",
        },
        hubcorporativofijogate: {

        },
      },
      errors: {
        clarocolombiagate: {
          documentTypeId: '',
          document: '',
          account: '',
          captcha: '',
        },
        hubgate: {
          document: '',
          movil: '',
          pinCode: '',
        },
        telmexmexicogate: {
          document: '',
          movil: '',
          pinCode: '',
        },
        hubfijogate: {
          document: '',
          numberField: '',
        },
        hubfacturafijagate: {
          claveservicio: '',
          cuentaservicio: '',
        },
        promogate: {
          codigo: '',
        },
        plazavipgate: {
          address: '',
          cardNumber: '',
          cardType: '',
          city: '',
          dateOfBirth_DD: '',
          dateOfBirth_MM: '',
          dateOfBirth_YY: '',
          expiryDate_MM: '',
          expiryDate_YY: '',
          name: '',
          securityCode: '',
          states: '',
          telefono: '',
          zipCode: '',
        },
        hubcorporativofijogate: {

        },
      }
    };

    state.values[constant.GETWAY_CLAROPAGO] = {
      address: "",
      PAN: "",
      cardType: "",
      city: "",
      expiryDate_MM: "",
      expiryDate_YY: "",
      name: "",
      CVV: "",
      states_claropagos: "",
      statesDesc: "",
      telefono: "",
      zipCode: "",
    };

    state.errors[constant.GETWAY_CLAROPAGO] = {
      address: '',
      PAN: '',
      cardType: '',
      city: '',
      expiryDate_MM: '',
      expiryDate_YY: '',
      name: '',
      CVV: '',
      states_claropagos: '',
      telefono: '',
      zipCode: '',
    };

    this.state = state;

    let validations = {
      maxLength: {
        clarocolombiagate: {
          documentTypeId: 0,
          document: 20,
          account: 20,
          captcha: 10,
        },
        hubgate: {
          document: 15,
          movil: this.GetMaxLengthMovil(),
          pinCode: 5,
        },
        hubfijogate: {
          document: 11,
          numberField: 20,
        },
        telmexmexicogate: {
          document: 15,
          movil: this.GetMaxLengthMovil(),
          pinCode: 5,
        },
        hubfacturafijagate: {
          claveservicio: 50,
          cuentaservicio: 50,
        },
        promogate: {
          codigo: 21,
        },
        plazavipgate: {
          address: 100,
          cardNumber: 20,
          cardType: 0,
          city: 0,
          dateOfBirth_DD: 0,
          dateOfBirth_MM: 0,
          dateOfBirth_YY: 0,
          expiryDate_MM: 0,
          expiryDate_YY: 0,
          name: 100,
          securityCode: 4,
          states: 0,
          telefono: 10,
          zipCode: 5,
        },
        hubcorporativofijogate: {

        },
      },
      regexp: {
        clarocolombiagate: {
          documentTypeId: null,
          document: /^\d+$/,
          account: /^\d+$/,
          captcha: null,
        },
        hubgate: {
          document: null,
          movil: this.GetRegExpMovil(),
          pinCode: null,
        },
        telmexmexicogate: {
          document: null,
          movil: this.GetRegExpMovil(),
          pinCode: null,
        },
        hubfijogate: {
          document: /^\d{11}$/,
          numberField: /^\d+$/,
        },
        hubfacturafijagate: {
          claveservicio: /^.{6,}$/,
          cuentaservicio: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        },
        promogate: {
          codigo: /^\d+$/,
        },
        plazavipgate: {
          address: null,
          cardNumber: /^\d{15,16}$/,
          cardType: null,
          city: null,
          dateOfBirth_DD: null,
          dateOfBirth_MM: null,
          dateOfBirth_YY: null,
          expiryDate_MM: null,
          expiryDate_YY: null,
          name: /^[a-zA-Z\s]+$/,
          securityCode: /^\d{3,4}$/,
          states: null,
          telefono: /^\d{10}$/,
          zipCode: /^\d{5}$/,
        },
        hubcorporativofijogate: {

        }
      }
    };

    validations.maxLength[constant.GETWAY_CLAROPAGO] = {
      address: 100,
      PAN: 16,
      cardType: 0,
      city: 0,
      expiryDate_MM: 0,
      expiryDate_YY: 0,
      name: 100,
      CVV: 4,
      states_claropagos: 0,
      telefono: 10,
      zipCode: 5,
    };

    validations.regexp[constant.GETWAY_CLAROPAGO] = {
      address: null,
      PAN: /^\d{15,16}$/,
      cardType: null,
      city: null,
      expiryDate_MM: null,
      expiryDate_YY: null,
      name: /^[a-zA-Z\sñ]{3,}$/,
      CVV: /^\d{3,4}$/,
      states_claropagos: null,
      telefono: /^\d{10}$/,
      zipCode: /^\d{5}$/,
    };

    this.validations = validations;

    let labels = {
      clarocolombiagate: {
        placeHolderDocument: Translator.get('suscripcion_identificacion_documento', 'Documento'),
        placeHolderAccount: Translator.get('suscripcion_cuenta_claro', 'Cuenta Claro'),
        placeHolderCaptcha: Translator.get('suscripcion_cuenta_captcha', 'Captcha'),
        captchaTitle: Translator.get('suscripcion_escribe_captcha', 'Escribe los caracteres que ves en la imagen'),
      },
      hubgate: {
        placeHolderDocument: Translator.get('payment_hubgate_placeHolderDocument', 'Ingresa tu número de documento'),
        placeHolderMovil: Translator.get('payment_hubgate_placeHolderMovil', 'Ingresa tu número móvil'),
      },
      telmexmexicogate: {
        placeHolderDocument: Translator.get('payment_hubgate_placeHolderDocument', 'Ingresa tu número de documento'),
        placeHolderMovil: Translator.get('payment_hubfijogate_placeHolderMovil', 'Ingresa tu Tel\u00e9fono fijo'),
      },
      hubfijogate: {
        placeHolderDocument: Translator.get('payment_hubfijogate_placeHolderDocument', 'Ingresa tu C\u00e9dula'),
        placeHolderMovil: Translator.get('payment_hubfijogate_placeHolderMovil', 'Ingresa tu Tel\u00e9fono'),
      },
      hubfacturafijagate: {
        placeHolderClave: Translator.get('payment_hubfijogate_placeHolderClave', 'Clave'),
        placeHolderCuenta: Translator.get('payment_hubfijogate_placeHolderCuenta', 'Cuenta'),
      },
      promogate: {
        placeHolderPromoCode: Translator.get('payment_promogate_placeholder', 'Ingresa tu código promocional a 20 dígitos'),
      },
      hubcorporativofijogate: {
        description: Translator.get('payment_hubcorporativofijogate_description', 'Texto desde metata para hubcorporativofijogate va aqui, ahora se muestra texto default, la llave es: payment_hubcorporativofijogate_description'),
      }
    }

    labels[constant.GETWAY_CLAROPAGO] = {};

    this.labels = labels;

    this.documentOptions = [
      {
        option: 'Carnet Diplomático',
        value: 'CD'
      },
      {
        option: 'Cédula Ciudadanía',
        value: 'CC'
      },
      {
        option: 'Cédula de extranjería',
        value: 'CE'
      },
      {
        option: 'NIT',
        value: 'NI'
      },
      {
        option: 'Pasaporte',
        value: 'P'
      }];

    let states = Metadata.get('states')
    if (states) {
      states = JSON.parse(states);
    }
    if (states && states[DeviceStorage.getItem('region')]) {
      states = states[DeviceStorage.getItem('region')]
      states = Object.keys(states).map((x, i, arr) => {
        return { option: x, value: states[x] }
      })
    }
    this.stateOptions = states ? states : [
      { option: "Aguascalientes", value: "AG" },
      { option: "Baja California", value: "BC" },
      { option: "Baja California Sur", value: "BS" },
      { option: "Campeche", value: "CM" },
      { option: "Chiapas", value: "CS" },
      { option: "Chihuahua", value: "CH" },
      { option: "Coahuila", value: "CO" },
      { option: "Colima", value: "CL" },
      { option: "Distrito Federal", value: "DF" },
      { option: "Durango", value: "DG" },
      { option: "Guanajuato", value: "GT" },
      { option: "Guerrero", value: "GR" },
      { option: "Hidalgo", value: "HG" },
      { option: "Jalisco", value: "JC" },
      { option: "Estado de México", value: "ME" },
      { option: "Michoacán", value: "MN" },
      { option: "Morelos", value: "MS" },
      { option: "Nayarit", value: "NT" },
      { option: "Nuevo León", value: "NL" },
      { option: "Oaxaca", value: "OC" },
      { option: "Puebla", value: "PL" },
      { option: "Querétaro", value: "QO" },
      { option: "Quintana Roo", value: "QR" },
      { option: "San Luis Potosí", value: "SP" },
      { option: "Sinaloa", value: "SL" },
      { option: "Sonora", value: "SR" },
      { option: "Tabasco", value: "TC" },
      { option: "Tamaulipas", value: "TS" },
      { option: "Tlaxcala", value: "TL" },
      { option: "Veracruz", value: "VZ" },
      { option: "Yucatán", value: "YN" },
      { option: "Zacateca", value: "ZS" }];

    this.dayOptions = [];
    for (var i = 1; i < 32; i++) {
      this.dayOptions.push({ option: i, value: i });
    }

    this.monthOptions = [
      { option: 'Enero', value: '1' },
      { option: 'Febrero', value: '2' },
      { option: 'Marzo', value: '3' },
      { option: 'Abril', value: '4' },
      { option: 'Mayo', value: '5' },
      { option: 'Junio', value: '6' },
      { option: 'julio', value: '7' },
      { option: 'Agosto', value: '8' },
      { option: 'Septiembre', value: '9' },
      { option: 'Octubre', value: '10' },
      { option: 'Noviembre', value: '11' },
      { option: 'Diciembre', value: '12' }];

    this.yearOptions = [];
    this.birthYearOptions = [];
    const year = 2017;
    const legalAge = 18;
    const legalYear = year - legalAge;

    for (let y = year; y < year + 9; y++) {
      this.yearOptions.push({ option: y, value: y });
    }

    for (let y = legalYear - 62; y < legalYear; y++) { // shows only 13 options
      this.birthYearOptions.push({ option: y, value: y })
    }
  }

  closePipPlayer() {
    console.log('[Payment] closePipPlayer');
    store.dispatch(playPipMedia({ src: null }));
  }

  closeFullPlayer() {
    console.log('[Payment] closeFullPlayer');
    store.dispatch(playFullMedia({ src: null }));
  }

  GetMaxLengthMovil() {
    switch (DeviceStorage.getItem('region')) {
      case 'argentina':
        return 11;
      case 'mexico':
        return 10;
      default:
        return 15;
    }
  }

  GetRegExpMovil() {
    switch (DeviceStorage.getItem('region')) {
      case 'argentina':
        return null;
      case 'costarica':
        return /^\d{8}$/;
      case 'mexico':
        return /^\d{10}$/;
      default:
        return /^\d+$/;
    }
  }

  setGateway(gateway){
    this.setState((prevState, props) => {
      return {
        gateway: gateway,
        currentKey: this.getDefaultKey(gateway, this.state.currentStep),
      };
    });
  }

  workFlowStart(extraParams = {}, action) {
    
    window.SpatialNavigation.makeFocusable();

    let that = this;
    this.setState({ isLoading: true });    
    let params = {
      offerId: this.offerId
    }

    if (this.pbi && this.pbi.linkworkflowstart) {
      let request = Utils.getRequest(this.pbi.linkworkflowstart);
      params.linkworkflowstartParams = request.params;
    }
    else {
      params.groupId = this.groupId;
    }

    params.linkworkflowstartParams = { ...params.linkworkflowstartParams, ...extraParams }

    const workflowTask = new WorkflowTask(params);
    let promiseWorkflow = RequestManager.addRequest(workflowTask);

    promiseWorkflow.then(function (res) {

      let workflow = {};
      if (res.response.workflow)
        workflow = res.response.workflow;
      else if (res.response.list)
        workflow = Object.assign(res.response, {
          listBuyLinks: res.response.list,
          contentInfo: {
            contentTitle: res.response.tittleConfirmSuscription,
            contentMessage: res.response.messageConfirmSuscription
          }
        });

        let selectedPaymentMethod = null;
        if(res.response.selectedPaymentMethod){
          selectedPaymentMethod = res.response.selectedPaymentMethod;
        }

      if(selectedPaymentMethod && workflow &&  workflow.listBuyLinks &&  workflow.listBuyLinks.length > 0){
        workflow.listBuyLinks.map((list)=>{
          if(list.gateway === selectedPaymentMethod){
            //that.setGateway(list.gateway);
            const selector = `#payment #rightPayment a.${selectedPaymentMethod}`;
            that.querySelector = selector;
          }
        })
      }      
      
      that.setState(
        {
          workflow,
          hasSavedPayway: res.response && res.response.hasSavedPayway ? res.response.hasSavedPayway === "1" : false,
          isLoading: false
        }, () => {
          if (that.querySelector) {                        
            window.SpatialNavigation.focus(document.querySelectorAll(that.querySelector)[0])
          }          
        }
      );

      //Para el caso de claro pagos continuar el flujo
      if (action === 'create_card') {
        const workflow = that.getWorkflow(constant.GETWAY_CLAROPAGO);
        const client_id = workflow.paymentMethodData.account;
        that.createCard(client_id);
      }

    }, function (err) {
      that.setState({ isLoading: false });
      if (err.message) {

        const modal = {
          modalType: MODAL_ERROR,
          modalProps: {
            callback: () => {
              that.props.history.goBack();
            },
            content: err
          }
        }
        that.props.showModal(modal);
      }
    });

    this.closePlayers();
  }

  componentDidUpdate(prevProps, prevState) {
    let currentGateway = this.state.gateway;
    let prevGateway = prevState.gateway;

    if (currentGateway !== prevState.gateway && currentGateway.length > 0) {
      if (this.state.values
        && this.state.values[currentGateway]
        && this.state.values[currentGateway].movil
        && this.state.values[currentGateway].movil.length > 0) {

        let newValues = {
          ...this.state.values,
          [currentGateway]: Object.assign({}, this.state.values[currentGateway], {
            movil: '',
          })
        };

        this.setState({
          values: newValues
        });
      }
    }
  }

  componentDidMount() {
    this.workFlowStart();
  }

  closePlayers() {
    /*
      Se cierran players si es que viene de susc desde TV
      TODO: checar funcionamiento en nagra, es necesario un timemout ¿? puede que aún siga viviendo el pip player (nagra performance) :/
    */
    if (this.pbi.fromsusctv) {
      console.log('[Payment] closing players en payment');
      this.closeFullPlayer();
      this.closePipPlayer();

    }
    if (new PlayerUtil().isFullVideoPlayingLive()) {
      this.closeFullPlayer();
    }
  }

  setMetric(action) {
    if (typeof this.props.setMetricsEvent === 'function') {
      let label = DeviceStorage.getItem('analytics-label');
      let category;
      if (this.props.history.location.state.oneoffertype === 'subscrition') {

        if (this.props.history.location.state.oneofferdesc.includes('Semanal'))
          category = 'suscripcion Semanal';
        else if (this.props.history.location.state.oneofferdesc.includes('Mensual'))
          category = 'suscripcion Mensual';
        else if (this.props.history.location.state.oneofferdesc.includes('HBO'))
          category = 'suscripcion HBO';
        else if (this.props.history.location.state.oneofferdesc.includes('FOX PREMIUM'))
          category = 'suscripcion FOX';
        else if (this.props.history.location.state.oneofferdesc.includes('FOX'))
          category = 'suscripcion FOXPLUS';
        else if (this.props.history.location.state.oneofferdesc.includes('NOGGIN'))
          category = 'suscripcion NOGGIN';
        else if (this.props.history.location.state.oneofferdesc.includes('CRACKLE'))
          category = 'suscripcion CRACKLE';
        else if (this.props.history.location.state.oneofferdesc.toLowerCase().includes('indycar'))
          category = 'suscripcion INDYCAR';
        else if (this.props.history.location.state.oneofferdesc.toLowerCase().includes('edye'))
          category = 'suscripcion EDYE';
      }
      else {
        category = this.props.history.location.state.oneofferdesc;
      }
      this.props.setMetricsEvent({
        hitType: 'event',
        eventAction: action,
        eventCategory: category,
        eventLabel: label,
      });
    }
  }

  sendMetric(label) {
    if (typeof this.props.setMetricsEvent === 'function' && window.location.toString().indexOf('payment/0/') !== -1) {
      this.props.setMetricsEvent({
        hitType: 'event',
        eventCategory: 'registro',
        eventAction: 'forma de pago',
        eventLabel: label,
      });
      this.props.setMetricsEvent({ type: 'executor' });
      this.sendDimension();
    }
  }

  sendVirtualPage(virtualPage) {
    if (typeof this.props.setMetricsEvent === 'function') {
      if (virtualPage === 'La Transaccion fue exitosa') {
        if (this.props.history.location.state.oneofferdesc.includes('Semanal'))
          virtualPage += ' - suscripcion Semanal';
        else if (this.props.history.location.state.oneofferdesc.includes('Mensual'))
          virtualPage += ' - suscripcion Mensual';
        else if (this.props.history.location.state.oneofferdesc.includes('HBO'))
          virtualPage += ' - suscripcion HBO';
        else if (this.props.history.location.state.oneofferdesc.includes('FOX PREMIUM'))
          virtualPage += ' - suscripcion FOX';
        else if (this.props.history.location.state.oneofferdesc.includes('FOX'))
          virtualPage += ' - suscripcion FOXPLUS';
        else if (this.props.history.location.state.oneofferdesc.includes('NOGGIN'))
          virtualPage += ' - suscripcion NOGGIN';
        else if (this.props.history.location.state.oneofferdesc.includes('CRACKLE'))
          virtualPage += ' - suscripcion CRACKLE';
        else if (this.props.history.location.state.oneofferdesc.toLowerCase().includes('indycar'))
          virtualPage = 'suscripcion INDYCAR';
        else if (this.props.history.location.state.oneofferdesc.toLowerCase().includes('edye'))
          virtualPage = 'suscripcion EDYE';
      }
      this.props.setMetricsEvent({
        hitType: 'pageview',
        page: virtualPage,
      });
      this.props.setMetricsEvent({ type: 'executor' });
    }
  }

  sendDimension() {
    const payload = new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: 'executor' });
  }

  hasSavedPayway(gateway) {    

    const workFlow = this.getWorkflow(gateway);
    const hasSavedPayway = this.state.hasSavedPayway &&
      workFlow.paymentMethodData &&
      workFlow.paymentMethodData.account &&
      workFlow.paymentMethodData.account !== null;      
    return hasSavedPayway;
  }


  onPaywaySelect(par) {
    
    this.isTelmexBuyConfirm = false;

    if (par.gateway === constant.GETWAY_CLAROPAGO) {
      if (!Utils.deviceSupportHttps()) {

        const message = Translator.get('claropagos_https_nosupport','Este dispositivo no soporta transacciones con tarjeta, por favor haga la compra con su cuenta en otro dispositivo.');

        const modal = {
          modalType: MODAL_ERROR,
          modalProps: {
            callback: () => {
              
            },
            message,
          }
        }

        this.props.showModal(modal);
        return;
      }
    }

    if (par.gateway !== 'saltar') {
      this.sendMetric(par.gatewaytext);
      this.sendVirtualPage(par.gatewaytext);
      this.setMetric(par.gatewaytext);
    }
        
    if (par.gateway === constant.GETWAY_AMCO) {
      //Este flujo es para evitar mostrar formulario e invocar buylink directamente      
      this.isTelmexBuyConfirm = true;
      this.onAcceptPayway(par.gateway);
      return;
    }
        
    if (this.hasSavedPayway(par.gateway) && !this.pbi.isSubscription) {
      if (this.hasStepGetway(par.gateway)) {
        this.setState({
          currentStep: 0,
          gateway: par.gateway,
          currentKey: this.getDefaultKey(par.gateway, 0),
        });
        return;
      }

      let that = this;
      let children = [];      
      const workflow = this.getWorkflow(par.gateway);      
      const content = Translator.get('confirm_content_charge', 'Al confirmar, el cargo de') + ` ${this.pbi.currency} ${this.pbi.price} ` + Translator.get('content_charge', 'se cargará en tu') + ` ${workflow.gatewaytext}.`

      children.push(this.getHtml(this.pbi.currency,
        this.pbi.price,
        this.pbi.oneofferdesc,
        this.state.workflow.contentInfo.contentTitle,
        this.state.workflow.contentInfo.contentImageSmall));

      const modal = {
        modalType: MODAL_CONFIRM_PURCHASE,
        modalProps: {
          onConfirm: () => {
            that.onAcceptPayway(par.gateway, true);
          },
          content: content,
          children: children
        }
      }

      that.props.showModal(modal);
      
    } else if (par.gateway === 'saltar') {
      if (!this.backtohome) {
        this.props.history.goBack();
      }
      else {
        this.props.history.push('/');
      }
    }
    else if (this.hasSavedPayway(par.gateway) && this.pbi.isSubscription && par.gateway !== constant.GETWAY_PROMO) {
      if (this.hasStepGetway(par.gateway)) {
        this.setState({
          currentStep: 0,
          gateway: par.gateway,
          currentKey: this.getDefaultKey(par.gateway, 0),
        });
        return;
      }
      let that = this;

      const content = this.state.workflow.messageConfirmSuscription;

      let children = [];

      children.push(this.getSuscriptionHtml(this.pbi.currency,
        this.pbi.price,
        this.pbi.oneofferdesc));

      const modal = {
        modalType: MODAL_CONFIRM_PURCHASE,
        modalProps: {
          onConfirm: () => {
            that.onAcceptPayway(par.gateway, true);
          },
          content: content,
          children: children
        }
      }

      that.props.showModal(modal);

    }
    else {
      
      if (par.gateway === constant.GETWAY_TELMEX && !par.buyLink.includes('/payway/confirm')) {
        this.isTelmexBuyConfirm = true;
        this.onAcceptPayway(par.gateway);
        return;
      }

      this.setState((prevState, props) => {
        return {
          gateway: par.gateway,
          currentKey: this.getDefaultKey(par.gateway, this.state.currentStep),
        };
      });
    }
  }

  getDefaultKey(gateway, currentStep) {

    switch (gateway) {
      case constant.GETWAY_PROMO:
        return 'codigo';
        break;
      case constant.GETWAY_CREDITCARD:
        if (currentStep === 0) {
          return 'securityCode';
        } else if (currentStep === 1) {
          return 'name';
        }
        else {
          return 'address';
        }
        break;
      case constant.GETWAY_CLAROPAGO:
        if (currentStep === 0) {
          return 'CVV';
        } else if (currentStep === 1) {
          return 'name';
        }
        else {
          return 'address';
        }
        break;
      case constant.GETWAY_CLAROCOLOMBIA:
        return 'document';
        break;
      case constant.GETWAY_TELMEX:
      case constant.GETWAY_HUB:
        const hasDocument = UtilsPagos.hasDocument(gateway);
        if (hasDocument) {
          return 'document';
        }
        else {
          return 'movil';
        }        
        break;
      case constant.GETWAY_HUBFIJO:
        return 'document';
        break;
      case constant.GETWAY_PIN:
        return 'pinCode';
        break;
      case constant.GETWAY_HUBFACTURAFIJA:
        return 'cuentaservicio';
        break;
      case constant.GETWAY_HUBCORPORATIVOFIJOFORM:
        return '';
        break;
      default:
    }
  }

  showDropDown(type) {
    let options = [];

    switch (type) {
      case 'states':
        options = this.stateOptions;
        break;
      case 'states_claropagos':
        options = UtilsClaroPagos.getProvincesCode();
        this.stateOptions = options;
        break;
      case 'document':
        options = this.documentOptions;
        break;
      case 'dateOfBirth_DD':
        options = this.dayOptions;
        break;
      case 'dateOfBirth_MM':
      case 'expiryDate_MM':
        options = this.monthOptions;
        break;
      case 'dateOfBirth_YY':
        options = this.birthYearOptions;
        break;
      case 'expiryDate_YY':
        options = this.yearOptions;
        break;
      default:
        return;
    }

    const modal = {
      modalType: MODAL_DROPDOWN,
      modalProps: {
        options: options,
        scrollable: type === 'dateOfBirth_DD' || type === 'dateOfBirth_YY' || type === 'states' || type === 'states_claropagos',
        service: (a) => {
          this.stateHandler(a, type)
        },
        type: 'lang'
      }
    }
    this.props.showModal(modal);
  }

  stateHandler(value, select) {

    switch (select) {
      case 'states':
      case 'states_claropagos':
        let statesDesc;
        for (var i in this.stateOptions) {
          if (this.stateOptions[i].value === value) {
            statesDesc = this.stateOptions[i].option;
            break;
          }
        }



        this.setState((prevState, props) => {

          let newState = {
            values: {
              ...prevState.values,
              plazavipgate: {
                ...prevState.values.plazavipgate,
                states: value,
                statesDesc: statesDesc
              }
            },
            errors: {
              ...prevState.errors,
              plazavipgate: {
                ...prevState.errors.plazavipgate,
                states: false,
              }
            }
          };

          if (select === 'select') {
            //Tarjeta de credito
            newState.values[this.state.gateway].state = value;
          } else {
            //Claro Pagos
            newState.values[this.state.gateway].states_claropagos = value;
          }
          newState.values[this.state.gateway].statesDesc = statesDesc;
          newState.errors[this.state.gateway].state = false;

          return newState;
        });
        break;
      case 'document':
        let documentType = '';

        for (let option in this.documentOptions) {
          if (this.documentOptions[option].value === value) {
            documentType = this.documentOptions[option].option;
            break;
          }
        }

        this.setState((prevState, props) => {
          return {
            values: {
              ...prevState.values,
              clarocolombiagate: {
                ...prevState.values.clarocolombiagate,
                documentTypeId: value,
                documentTypeDesc: documentType
              }
            },
            errors: {
              ...prevState.errors,
              clarocolombiagate: {
                ...prevState.errors.clarocolombiagate,
                documentTypeId: false,
              }
            }
          };
        });
        break
      case 'dateOfBirth_DD':
      case 'dateOfBirth_MM':
      case 'dateOfBirth_YY':
      case 'expiryDate_MM':
      case 'expiryDate_YY':

        let values = this.state.values;
        let errors = this.state.errors;

        values[this.state.gateway][select] = value;
        errors[this.state.gateway][select] = false;

        this.setState((prevState, props) => {
          return {
            values: values,
            errors: errors,
          }
        });
        break;

      default:
        break;
    }
  }

  handleErrors(errors) {

    let gateway = this.state.gateway === constant.GETWAY_TELMEX ? constant.GETWAY_HUB : this.state.gateway;
    let newErrors = this.state.errors;

    newErrors[gateway] = errors;

    this.setState({ newErrors });
  }

  onPaywayChange() {    

    this.setState({ gateway: '' }, (() => {
      const elements = document.querySelectorAll(this.querySelector)
      if (this.querySelector && elements && elements[0]) {        
        window.SpatialNavigation.focus(elements[0])
      } 
    }).bind(this));
  }

  onFormBack() {    
    this.setState({
      ...this.state,
      gateway: '',
      values: {
        ...this.state.values,
        hubgate: {
          ...this.state.values.hubgate,
          pinCode: ''
        },
        telmexmexicogate: {
          ...this.state.values.telmexmexicogate,
          pinCode: ''
        }
      }
    }, (() => {
      const elements = document.querySelectorAll(this.querySelector)
      if (this.querySelector && elements && elements[0]) {
        window.SpatialNavigation.focus(elements[0])        
      }
    }).bind(this));

  }

  mapExtraParams(gateway, workFlowParm) {

    let params = workFlowParm;

    if (gateway === constant.GETWAY_CLAROCOLOMBIA) {
      //params.document = params.document;
      params.document_type = params.documentType;
      params.account = params.numberField;
      delete params.documentType;
      delete params.numberField;
    }

    //Si el parametro va vacio, entonces ya no lo manda
    for (let par in params) {
      if (params[par] == '' || params[par] == undefined) {
        delete params[par];
      }
    }

    return params;

  }

  hasStepGetway(gateway) {
    const creditCardGetway = [constant.GETWAY_CREDITCARD, constant.GETWAY_CLAROPAGO];
    return creditCardGetway.find((item) => item === gateway);
  }

  onAcceptPayway(gateway, isSavedPayway) {
   
    let currentStep = this.state.currentStep;

    if (this.hasStepGetway(gateway)) {

      if (currentStep === 1) {
        currentStep++;
        const currentKey = this.getDefaultKey(gateway, currentStep);
        this.setState({ currentStep, currentKey });
        return;
      }
    }

    //Nueva lógica para claro pagos
    if (gateway === constant.GETWAY_CLAROPAGO && currentStep === 2) {
      const params = this.getWorkFlowParams(gateway);
      this.claroPagos(params);
      let isLoading = true;
      this.setState({ isLoading });
      return;
    }
    else if (gateway === constant.GETWAY_CLAROPAGO && currentStep === 0) {      
      const params = this.getWorkFlowParams(gateway);
      this.updateCard(params);
      return;
    }

    let workFlow = this.getWorkflow(gateway);
    let promiseConfirmTask;
    let that = this;
    let buyLink = workFlow.buyLink ? workFlow.buyLink : '';
    let request = Utils.getRequest(buyLink);
    let workFlowParm = {};
    request.method = workFlow.buyLink && workFlow.buyLink.includes("payway/confirm") ? constant.METHOD_GET : constant.METHOD_POST;

    if (!isSavedPayway) {     
      workFlowParm = this.getWorkFlowParams(gateway);
      if (request.method === constant.METHOD_GET) {
        request.params = Object.assign({}, request.params, workFlowParm);            
      }        
    }
   
    if (request.method === constant.METHOD_POST) {     
      //Envio por POST      
      request.params.token = this.props.user.user_token;
      request.paramsPOST = {};

      //TODO: payway seguira por POST?
      request.paramsPOST.payway = request.params['payway'];
      request.paramsPOST.token = this.props.user.user_token;
      request.paramsPOST.buyToken = workFlow.buyToken;      

      if (!this.isTelmexBuyConfirm) {
        request.paramsPOST.extra_params = JSON.stringify(this.mapExtraParams(gateway, workFlowParm));
      }
      request.paramsPOST.access_code = request.params.pin;

      //Se agrega parametro token a los parametros de GET
      request.params.token = this.props.user.user_token;
    }

    this.setState({ isLoading: true });

    if (gateway === constant.GETWAY_SENDPIN)
      delete request.params.pin;
    const confirmTask = new ConfirmTask(request.uri, request.params || {}, request.method, request.paramsPOST || {})
    promiseConfirmTask = RequestManager.addRequest(confirmTask);
    promiseConfirmTask.then(function (resp) {
      let okBtnTextKey = false;

      if (that.pbi && that.pbi.isSubscription) {

        //actualiza lineal channels
        that.props.fetchLinealChannels(that.props.user.user_id, that.onAcceptPaywaySuccess(gateway, isSavedPayway, request, resp));

        //actualizar las subcripciones
        let suscription = {};
        okBtnTextKey = 'payway_confirm_{provider}_ok'

        if (that.pbi.producttype.indexOf('CV_') > -1) {
          suscription = { AMCO: true };

          const user_hash = store.getState().user.session_userhash;
          DeviceStorage.setItem('user_hash', user_hash);

          okBtnTextKey = okBtnTextKey.replace('{provider}', 'cv');

        }
        else {
          if (that.pbi.producttype) {
            suscription[that.pbi.producttype] = true;
          }

          okBtnTextKey = okBtnTextKey.replace('{provider}', that.pbi.producttype.toLowerCase());

        }

        that.props.receiveSubscription(suscription);
        that.props.refresh();
      }
      else {
        that.onAcceptPaywaySuccess(gateway, isSavedPayway, request, resp);
      }
    }, function (err) {
        let currentStep = that.state.currentStep;
        //Este es el fix para metodo de pago asociado y regrese al formulario CVV y no de registro
        if (that.hasSavedPayway(gateway)) {
          // si tiene metodo de pago asociado, regresarlo a su vista                  
          if (that.hasStepGetway(that.state.gateway)) {
            currentStep = 0;
          }
        }


      that.setState({ isLoading: false, currentStep });
      if (err.completeError.errors && err.completeError.errors.code && err.completeError.errors.code === 'error_pin') {
        that.setState((prevState, props) => {
          let newGateway = prevState.gateway === constant.GETWAY_HUB ? prevState.gateway + '_pin' : prevState.gateway;
          return { gateway: newGateway };
        });
        return;
      }
      // Validación para mostrar MODAL_SUCCESS mientras se espera la validación telefonica del cliente que paga con Recibo Telmex
      if (err.completeError.errors && err.completeError.errors.code && err.completeError.errors.code === constant.ERR_IVR && err.completeError.errors.typeTransac === 'susc' && err.completeError.errors.est === 0) {
        const modal = {
          modalType: MODAL_SUCCESS,
          modalProps: {
            callback: () => {
              that.onAcceptPayway(gateway, false)
            },
            content: err.message
          }
        };
        that.props.showModal(modal);
        return;
      }
      if ((err.completeError.errors && err.completeError.errors.code && err.completeError.errors.code === 'error_ivr') ||
        (Array.isArray(err.completeError.errors) && err.completeError.errors[0] && err.completeError.errors[0].code === 'PGS_PMT_00006')
      ) {

        let message = null;

        if (Array.isArray(err.completeError.errors) && err.completeError.errors[0] && err.completeError.errors[0].code) {
          message = Translator.get(err.completeError.errors[0].code, 'Para concluir el proceso de contrataci&oacute;n de Claro Video con Telmex / Telnor llama al 01800 252 9999');
        }
        const modal = {
          modalType: MODAL_ERROR,
          modalProps: {
            callback: () => {
              that.onAcceptPayway(gateway, false)
            },
            message,
            content: err,
            asset: 'ic_modal_success',
          }
        }
        that.props.showModal(modal);
        return;
      }

      if (err.completeError.errors && err.completeError.errors.code && err.completeError.errors.code === 'error_usercheckpurchase') {
        const subscriptionsList = Object.keys(this.props.user.subscriptions);
        let currentSelection = this.pbi.producttype;
        let currentSubs = subscriptionsList.filter(subscription => subscription === currentSelection);
        this.enableRedirectHome = true;
        if(currentSubs.length === 0) {
          let suscriptionValue = {};
          let that = this;
          suscriptionValue[currentSelection] = true;
          
          this.setSuscriptionOnStore(suscriptionValue);

          const modal = {
            modalType: MODAL_SUCCESS,
            modalProps: {
              callback: () => {
                that.redirectSuscription();
              },
              from:'payment',
              replaces: {
                '{@EMAIL}': that.props.user.username,
                '{@provider}': currentSelection,
              },
              content: '\u00a1Felicitaciones! Ya est\u00e1s suscrito a {@provider}. Te llegar\u00e1 un mail de confirmaci\u00f3n al correo electr\u00f3nico {@EMAIL}.',
            }
          };
          that.props.showModal(modal);
          return;
        }
      }
      if (err.completeError && err.completeError.errors && err.completeError.errors.code && err.completeError.errors.code === 'error_generic') {

        const modal = {
          modalType: MODAL_ERROR,
          modalProps: {
            callback: () => {},
            message: Translator.get('claropagos_genericerror', "Estimado usuario, por el momento no podemos atender tu solicitud, intenta m\u00e1s tarde."),
            content: (err.completeError && err.completeError.errors && err.completeError.errors["0"]) ? err.completeError.errors["0"] : err,
          }
        }
        that.props.showModal(modal);
        return;
      }
      if (err.message || (err.completeError && err.completeError.errors && err.completeError.errors["0"])) {

        const modal = {
          modalType: MODAL_ERROR,
          modalProps: {
            callback: () => {
              if(that.enableRedirectHome) {
                that.redirectSuscription();
              }
            },
            content: (err.completeError && err.completeError.errors && err.completeError.errors["0"]) ? err.completeError.errors["0"] : err,
          }
        }
        that.props.showModal(modal);
      }
    }.bind(this));
  }

  onAcceptPaywaySuccess(gateway, isSavedPayway, request, resp, okBtnTextKey) {
  
    
    const oneClicKey = `${this.pbi.oneoffertype}_${gateway}`;
    const isOneClicFlow = (this.groupId !== 'undefined' && !isNaN(this.groupId) && this.groupId !== 0);

    const modal = {
      modalType: MODAL_SUCCESS,
      modalProps: {
        callback: () => {

          UtilsIpTelmex.validateMail(this.props.user.session_userhash).then((function (resp) {
            if (!resp.validEmail) {
              let callback = this.redirectSuscription.bind(this);
              if (UtilsPagos.oneClicBuyRedirectPlayer(isOneClicFlow, oneClicKey)) {
                callback = this.redirectPlayerOneClic(this.groupId, this.backToLive, this.pbi && this.pbi.isSubscription);
              }
              this.goValidateMail(callback, this.props.user.session_userhash, resp);
            }
            else {
              if (UtilsPagos.oneClicBuyRedirectPlayer(isOneClicFlow, oneClicKey)) {
                this.redirectPlayerOneClic(this.groupId, this.backToLive, this.pbi && this.pbi.isSubscription);
              }
              else {
                this.redirectSuscription();
              }
            }
          }).bind(this));
        },
        // Este faltó, mandar los replaces
        from: 'payment',
        replaces: {
          '{@EMAIL}': this.props.user.username
        },
        content: request.method === 'POST'
          && resp.response
          && resp.response.code ? Translator.get(resp.response.code, resp.response.code) : resp.response.msg,
        okText: okBtnTextKey ? Translator.get(okBtnTextKey) : okBtnTextKey,
      }
    }
    if (typeof this.props.setMetricsEvent === 'function') {
      this.props.setMetricsEvent({ type: 'executor' });
      this.sendDimension();
      this.sendVirtualPage('La Transaccion fue exitosa');
    }

    this.setState({ isLoading: true });

    if (UtilsPagos.oneClicBuyHiddeConfirm(isOneClicFlow, oneClicKey)) {
      if (UtilsPagos.oneClicBuyRedirectPlayer(isOneClicFlow, oneClicKey)) {
        this.redirectPlayerOneClic(this.groupId, this.backToLive, this.pbi && this.pbi.isSubscription);
      }
      else {
        this.redirect(this.groupId);
      }
    }
    else {
      //Flujo Original
      this.props.showModal(modal);
      this.setState({ isLoading: false });
    }
  }

  setSuscriptionOnStore(producttype) {
    if(producttype !== 'undefined') {
      this.props.receiveSubscription(producttype);
    }
  }

  claroPagos(params) {
    
    try {
      Utils.scriptCyberSource();
    } catch (e) {
      console.error('Error al cargar script CyberSource', e.message)
    }
    
    this.ClaroPagosParams = params;
    this.createClient();

  }

  createClient() {

    const action = 'create_client';
    const state = store.getState();
    this.claroPagos.fingerprint = DeviceStorage.getItem("HKS") + new Date().toTimeString().split(' ')[0];

    let client = {
      id_externo: state.user.user_id,
      nombre: state.user.firstname,
      apellido_paterno: state.user.lastname,
      email: state.user.email,
      direccion: {
        linea1: this.ClaroPagosParams.address,
        cp: this.ClaroPagosParams.zipCode,
        telefono: {
          numero: this.ClaroPagosParams.telefono,
        },
        ciudad: this.ClaroPagosParams.city,
        estado: this.ClaroPagosParams.states,
        pais: UtilsClaroPagos.getCountryCode(),
      },
      telefono: {
        numero: this.ClaroPagosParams.telefono,
      },
      device_fingerprint: this.claroPagos.fingerprint,
    };

    const config = UtilsClaroPagos.getConfiguration(action);
    const authorization = Utils.Base64Decode(config.header.authorization);

    this.createClientSuccess = this.createClientSuccess.bind(this);
    this.createClientFail = this.createClientFail.bind(this);

    this.generalRequest(config.server_url, client, authorization, this.createClientSuccess, this.createClientFail);

  }

  createClientSuccess(resp) {
    this.createCard(resp.data.cliente.id);
  }

  createClientFail(err) {
    
    if (err.completeError && err.completeError.error && err.completeError.error.code && err.completeError.error.code === 409) {
      //El cliente ya existe en claro pagos (email,  usuario claro video). Regresar al paso 3 e invocar el API payway/workflowstart enviándole como parámetro adicional cpgs_user igual a true.
      this.workFlowStart({ 'cpgs_user': true }, 'create_card');
      return;
    }

    const message = Translator.get('claropagos_genericerror', "Estimado usuario, por el momento no podemos atender tu solicitud, intenta m\u00e1s tarde.");
    var that = this;
    const modal = {
      modalType: MODAL_ERROR,
      modalProps: {
        callback: () => {
          let isLoading = false;
          that.setState({ isLoading });
        },
        message,
        content: err
      }
    };

    this.props.showModal(modal);
  }

  generalRequest(url, params, authorization, successCallBack, failCallBack, method) {
        
    let promiseGeneralTask;

    const generalTask = new GeneralTask(url, params, authorization, method);

    promiseGeneralTask = RequestManager.addRequest(generalTask);    
    promiseGeneralTask.then(successCallBack, failCallBack);
  }

  createCard(client_id) {
    
    const action = 'create_card';
    this.claroPagos.client_id = client_id;   

    let card = {
      nombre: this.ClaroPagosParams.name,
      pan: this.ClaroPagosParams.cardNumber,
      cvv2: this.ClaroPagosParams.securityCode,
      expiracion_mes: this.ClaroPagosParams.expiryDate_MM,
      expiracion_anio: this.ClaroPagosParams.expiryDate_YY,
      direccion: {
        linea1: this.ClaroPagosParams.address,
        cp: this.ClaroPagosParams.zipCode,
        telefono: {
          numero: this.ClaroPagosParams.telefono,
        },
        ciudad: this.ClaroPagosParams.city,
        estado: this.ClaroPagosParams.states,
        pais: UtilsClaroPagos.getCountryCode(),
      },
      cliente_id: this.claroPagos.client_id,
      default: true,
      cargo_unico: false,
    };

    const config = UtilsClaroPagos.getConfiguration(action);
    const authorization = Utils.Base64Decode(config.header.authorization);

    this.createCardSuccess = this.createCardSuccess.bind(this);
    this.createCardFail = this.createCardFail.bind(this);

    this.generalRequest(config.server_url, card, authorization, this.createCardSuccess, this.createCardFail);

  }

  createCardSuccess(resp) {
    //La [Aplicación] registra internamente el cliente creado en claro pagos y el token de la tarjeta para futuras consultas.
    //Se hace uso del API payway/byconfirm y los parámetros extra_params.

    this.claropagos.token = resp.data.tarjeta.token;
    let currentStep = this.state.currentStep + 1;
    this.setState({ currentStep });
    //Se ha incorporado el parámetro de entrada extra_params, mismo que a su vez contiene los parámetros:
    //client_id, card_token, card_type, device_fingerprint
    this.claroPagos.card_token = resp.data.tarjeta.token;

    this.onAcceptPayway(constant.GETWAY_CLAROPAGO, false);

  }

  createCardFail(err) {
    
    if (err.completeError.error.code === 409) {
      //Porque la tarjeta ya existe en claro pagos (nombre,  pan, cvv, mes de expiración, año de expiración, cliente claro pagos).
      //Recuperar los datos de la tarjeta retornados por payway / workflowstart y continuar al paso 9.
      
      const workflow = this.getWorkflow(this.state.gateway);
      const cardsData = workflow.paymentMethodData.cardsData;

      //Dice Lalo que se toma el primer elemento del arreglo y que en un futuro cambiara esta estructura con un default.
      this.claroPagos.card_token = (cardsData && cardsData[0] && cardsData[0].token);
      let currentStep = this.state.currentStep + 1;
      this.setState({ currentStep });
      this.onAcceptPayway(constant.GETWAY_CLAROPAGO, false);
      return;
    }

    const message = Translator.get('claropagos_genericerror', "Estimado usuario, por el momento no podemos atender tu solicitud, intenta m\u00e1s tarde.");
    var that = this;
    const modal = {
      modalType: MODAL_ERROR,
      modalProps: {
        callback: () => {
          let isLoading = false;
          that.setState({ isLoading });
        },
        message,
        content: err
      }
    };

    this.props.showModal(modal);
  }

  updateCard(params) {

    const action = 'update_card';
    this.ClaroPagosParams = params;

    let card = {
      cvv2: this.ClaroPagosParams.securityCode
    };

    const workflow = this.getWorkflow(this.state.gateway);
    const cardsData = workflow.paymentMethodData.cardsData;    

    //Dice Lalo que se toma el primer elemento del arreglo y que en un futuro cambiara esta estructura con un default.
    this.claroPagos.card_token = (cardsData && cardsData[0] && cardsData[0].token)

    const config = UtilsClaroPagos.getConfiguration(action);
    const authorization = Utils.Base64Decode(config.header.authorization);
    const url = config.server_url.replace('{token}', this.claroPagos.card_token);

    this.updateCardSuccess = this.updateCardSuccess.bind(this);
    this.updateCardFail = this.updateCardFail.bind(this);

    this.generalRequest(url, card, authorization, this.updateCardSuccess, this.updateCardFail, 'PUT');

  }

  updateCardSuccess(resp) {
    
    //La [Aplicación] registra internamente el cliente creado en claro pagos y el token de la tarjeta para futuras consultas.
    //Se hace uso del API payway/byconfirm y los parámetros extra_params.
    this.claropagos.token = resp.data.tarjeta.token;
    this.claroPagos.fingerprint = DeviceStorage.getItem("HKS") + new Date().toTimeString().split(' ')[0];
    this.claroPagos.client_id = resp.data.tarjeta.cliente_id;

    //Se ha incorporado el parámetro de entrada extra_params, mismo que a su vez contiene los parámetros:
    //client_id, card_token, card_type, device_fingerprint    

    const currentStep = 5;
    let cardType = resp.data && resp.data.tarjeta && resp.data.tarjeta.marca ? resp.data.tarjeta.marca : '';
    const cardTypes = UtilsClaroPagos.getCreditCardByRegion();
    cardType = cardTypes.find((elem) => elem.code == cardType).id; 

    this.setState((prevState, props) => {
      let newState = {
        currentStep,
        values: {
          ...prevState.values,
          [constant.GETWAY_CLAROPAGO]: {
            ...prevState.values[constant.GETWAY_CLAROPAGO],
            cardType
          }
        }
      };
      return newState;
    });

    this.onAcceptPayway(constant.GETWAY_CLAROPAGO);

  }

  updateCardFail(err) {
    
    const message = Translator.get('claropagos_genericerror', "Estimado usuario, por el momento no podemos atender tu solicitud, intenta m\u00e1s tarde.");
    var that = this;
    const modal = {
      modalType: MODAL_ERROR,
      modalProps: {
        callback: () => {
          let isLoading = false;
          that.setState({ isLoading });
        },
        message,
        content: err
      }
    };

    this.props.showModal(modal);
  }

  onCancelPayway() {

    const lastChannel = DeviceStorage.getItem('lastChannel');
    this.props.history.goBack();

    if (this.props.history.location.pathname.indexOf('player/') && this.props.history.location.pathname.split('/')[2]) {
      const channelRedirect = this.props.history.location.pathname.split('/')[2];
      if (channelRedirect != lastChannel) {
        let newPath = this.props.history.location.pathname.replace(`/${channelRedirect}/`, `/${lastChannel}/`);
        this.props.history.replace(newPath);
      }
    }
  }

  onStepBackPayway() {
    const currentStep = this.state.currentStep - 1;
    this.setState({ currentStep });
  }

  onCreditCardTypeChange(changeEvent) {

    //changeEvent.preventDefault();

    if (changeEvent.target && changeEvent.target.value) {

      let selectedValue = changeEvent.target.value;

      this.setState((prevState, props) => {
        return {
          values: {
            plazavipgate: {
              ...prevState.values.plazavipgate,
              cardType: selectedValue
            }
          }
        };
      });
    }
  }

  goValidateMail = (callback, userhash, resp) => {

    const modalProps = {
      onOmit: callback,
      userhash: userhash,
      phone: resp.userDetectWS && resp.userDetectWS.account ? resp.userDetectWS.account : '',
    };

    const modal = {
      modalType: MODAL_KEYBOARD,
      modalProps: {
        ...modalProps,
        from:'payment'
      }
    };
    this.props.showModal(modal);
  }

  getWorkflow(id) {
    if (id === constant.GETWAY_SENDPIN) id = constant.GETWAY_HUB;

    const workFlows = this.state.workflow.listBuyLinks;

    for (let workflow in workFlows) {
      if (workFlows[workflow].gateway === id) {
        return workFlows[workflow];
      }
    }

    return {};
  }

  getWorkFlowParams(id) {
    if (id === constant.GETWAY_SENDPIN) id = constant.GETWAY_HUB;

    let res = {};
    let resPOST = {};

    switch (id) {
      case constant.GETWAY_CREDITCARD:
        res = {
          address: this.state.values[id].address,
          cardNumber: this.state.values[id].cardNumber,
          cardType: this.state.values[id].cardType,
          city: this.state.values[id].city,
          dateOfBirth_DD: this.state.values[id].dateOfBirth_DD,
          dateOfBirth_MM: this.state.values[id].dateOfBirth_MM,
          dateOfBirth_YY: this.state.values[id].dateOfBirth_YY,
          expiryDate_MM: this.state.values[id].expiryDate_MM,
          expiryDate_YY: this.state.values[id].expiryDate_YY,
          name: this.state.values[id].name,
          securityCode: this.state.values[id].securityCode,
          states: this.state.values[id].states,
          telefono: this.state.values[id].telefono,
          zipCode: this.state.values[id].zipCode,
        }
        break;
      case constant.GETWAY_CLAROPAGO:
        res = {
          address: this.state.values[id].address,
          cardNumber: this.state.values[id].PAN,
          city: this.state.values[id].city,
          expiryDate_MM: this.state.values[id].expiryDate_MM,
          expiryDate_YY: this.state.values[id].expiryDate_YY,
          name: this.state.values[id].name,
          securityCode: this.state.values[id].CVV,
          states: this.state.values[id].states_claropagos,
          telefono: this.state.values[id].telefono,
          zipCode: this.state.values[id].zipCode,

          card_type: this.state.values[id].cardType,
          client_id: this.claroPagos.client_id,
          device_fingerprint: this.claroPagos.fingerprint,
          card_token: this.claroPagos.card_token,
        }

        break;
      case constant.GETWAY_CLAROCOLOMBIA:
        res = {
          document: this.state.values[id].document,
          documentType: this.state.values[id].documentTypeId,
          numberField: this.state.values[id].account,
          captcha: this.state.values[id].captcha,
        }
        break;
      case constant.GETWAY_HUB:
      case constant.GETWAY_TELMEX:
        if (id === constant.GETWAY_HUB) {
          res = {
            document: this.state.values[id].document,
            numberField: this.state.values[id].movil,
            pin: this.state.values[id].pinCode,
          }
        }
        else {
          res = {
            numberField: this.state.values.telmexmexicogate.movil
            // pin: this.state.values.telmexmexicogate.pinCode,
          }
        }

        break;
      case constant.GETWAY_HUBFIJO:
        res = {
          document: this.state.values[id].document,
          numberField: this.state.values[id].numberField,
        }
        break;
      case constant.GETWAY_HUBFACTURAFIJA:
        res = {
          claveServicio: this.state.values[id].claveservicio,
          cuentaServicio: this.state.values[id].cuentaservicio,
        }
        break;
      case constant.GETWAY_PROMO:
        res = {
          pincode: this.state.values[id].codigo,
        }
        break;
      case constant.GETWAY_HUBCORPORATIVOFIJO:
        res = {
        };
        //Esto debe ir por POST
        resPOST = {

        };
        break;
      default:
        break;
    }

    return res;

  }

  getHtml(currency, price, rentType, contentTitle, imgSrc) {
    return (
      <div className='payment'>
        <div className='left'>
          <img src={imgSrc} alt={contentTitle} />
        </div>
        <div className='rigth'>
          <div className='subtitle'>
            {Translator.get('payment_for_rent', 'Estas por alquilar')}
          </div>
          <div className='title'>
            {contentTitle}
          </div>
          <div className='text'>
            <span className='currency'>{currency}</span>
            <span className='price'>{price}</span>
            <span className='tax'>{Translator.get('payment_tax_include', 'IVA incluido')}</span>
            {rentType === 'Compra' ? null : <span className='icon-clock'></span>}
            {rentType === 'Compra' ? null : <span className='rentType'>{rentType}</span>}
          </div>
        </div>
        <div>
          <hr />
        </div>
      </div>

    )
  }

  getSuscriptionHtml(currency, price, oneofferdesc) {
    return null; //mensaje redundate en el mismo modal
    /*
    return (
        <div className='payment payment-suscription'>
            <div className='title'>
                {Translator.get('payments_get_suscription_label', 'Estás por adquirir')}
            </div>
            <div className='text'>
                <span className='price'>{`${currency}${price} `}</span>
                <span className='text'>{oneofferdesc}</span>
                <span className='note'>*{Translator.get('payment_not_ppe_incluided', 'No incluye Pago por evento')}</span>
            </div>
            <div>
                <hr />
            </div>
        </div>
    )
    */
  }

  redirectSuscription() {

    if (this.groupId === 'undefined' || isNaN(this.groupId)) {
      this.groupId = 0;
    }
    switch (this.groupId) {
      case 0:
      case "0":
        this.redirectHome();
        break;
      default:
        this.redirect(this.groupId);
        break;
    }
  }

  redirect(groupId) {
    if (this.backToLive) {
      this.redirectPlayer(groupId)
    } else {
      this.redirectVcard(groupId);
    }
  }

  redirectVcard(groupId) {
    this.props.history.replace(`/vcard/${groupId}`);
  }

  redirectHome() {
    this.props.history.replace('/');
  }

  redirectPlayer(gid) {

    let newChannel = {
      playerstate: 'PLAYING',
      source: {
        videoid: gid
      },
      size: {
        top: 0,
        left: 0,
        width: 1280,
        height: 720,
      },
      ispreview: false,
      islive: true,
      ispip: false
    };

    store.dispatch(playFullMedia(newChannel));
    this.redirectVcard(gid);

  }

  redirectPlayerOneClic(gid, islive = true) {

    const timeOutDelay = 8000;

    let newChannel = {
      playerstate: 'PLAYING',
      source: {
        videoid: gid
      },
      size: {
        top: 0,
        left: 0,
        width: 1280,
        height: 720,
      },
      ispreview: false,
      islive,
      ispip: false
    };

    store.dispatch(playFullMedia(newChannel));

    setTimeout(() => {
      this.redirectVcard(gid);
      this.setState({ isLoading: false });
    }, timeOutDelay);

  }

  setTextValue(value = '') {

    const key = this.state.currentKey;
    let values = this.state.values;
    let gateway = this.state.gateway;

    if (gateway === 'hubgate_pin' ) {
        gateway = 'hubgate'
    }

    if (values[gateway] && values[gateway][key] !== undefined) {

      if (this.validations.maxLength[gateway]
        && this.validations.maxLength[gateway][key]
        && value
        && value.length > this.validations.maxLength[gateway][key]) {
        value = value.substring(0, this.validations.maxLength[gateway][key])
      }

      values[gateway][key] = value;
      const errors = this.state.errors
      if (errors[gateway] && errors[gateway][key]) {
        errors[gateway][key] = false;
      }
      this.setState({ values, errors });
    }
  }

  setCurrentKey(key = '') {
    if (this.state.currentKey !== key) {
      this.setState({ currentKey: key });
    }
  }

  setRadioValue(key, value) {

    let gateway = this.state.gateway;
    if (gateway === constant.GETWAY_TELMEX) {
      gateway = constant.GETWAY_HUB;
    }

    let values = this.state.values;

    if (values[gateway] && values[gateway][key] !== undefined) {
      values[gateway][key] = value;
      this.setState({ values });
    }
  }

  render() {
    console.log("payment props", this.props)
    if (this.state.isLoading) return <Spinner className='payment' visible={true} />;


    const _gateway = !this.state.gateway ? '' : this.state.gateway === 'hubgate_pin' ? 'hubgate' : this.state.gateway;
    //const _gateway = this.state.gateway;
    const currentValue = this.state.gateway === '' || !this.state.values[_gateway] ? '' : this.state.values[_gateway][this.state.currentKey];

    return (
      <div id='payment'>
        <LeftPayment gateway={this.state.gateway} setTextValue={this.setTextValue} currentValue={currentValue} onCancel={this.onFormBack} />
        <RightPayment
          labels={this.labels}
          validations={this.validations}
          gateway={this.state.gateway}
          setCurrentKey={this.setCurrentKey}
          setRadioValue={this.setRadioValue}
          currentValues={this.state.values}
          currentStep={this.state.currentStep}
          errors={this.state.errors}
          payway={this.state.payway}
          workflow={this.state.workflow}
          onClick={this.onPaywaySelect}
          onFieldError={this.handleErrors}
          paywayChange={this.onPaywayChange}
          showDropDown={this.showDropDown}
          onAccept={this.onAcceptPayway}
          onCancel={this.onCancelPayway}
          onStepBack={this.onStepBackPayway}
          onCreditCardTypeChange={this.onCreditCardTypeChange}
          pbi={this.pbi}
          enableFocused={this.state.enableFocused}
        />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => { return { user: state.user } };
export default connect(mapStateToProps, { showModal, setMetricsEvent, receiveSubscription, fetchLinealChannels, })(withRouter(Payment))
