import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spinner from './../../components/Spinner';
import Translator from './../../requests/apa/Translator';
import Metadata from './../../requests/apa/Metadata';
import LoginSSOTask from './../../requests/tasks/sso/LoginSSOTask'
import Asset from '../../requests/apa/Asset';
import Utils from '../../utils/Utils';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import { register, CpfQuery } from '../../requests/loader';
import { showModal, MODAL_ERROR, MODAL_TERM_AND_COND, MODAL_SUCCESS, MODAL_UPDATE_EMAIL } from '../../actions/modal';
import { receiveIsLoggedIn } from '../../reducers/user';
import { withKeyboard } from '../../components/FormGroup';
import './styles/register.css';
import '../Payment/payment.css';
import {setMetricsEvent} from "../../actions/metrics";
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import store from './../../store';
import PlayerUtil from '../../devices/all/PlayerUtil';
import { playFullMedia } from "../../actions/playmedia";
import RequestManager from './../../requests/RequestManager';
import UtilsLoginRegister from '../../utils/LoginRegister';


const STEP_CPF = 'CPF';

class Register extends Component {

    constructor(props) {
        super(props);
        this.region = DeviceStorage.getItem('region');
        this.state = {
            isLoading: false,
            step: this.region === 'brasil' ? STEP_CPF : '',
        };
        this.form_type = 'register';
        this.lengthAndProvider = Utils.getLengthMovilAndProvider();

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCPF = this.handleCPF.bind(this);
        this.showTC= this.showTC.bind(this);
        this.defaultOpen = this.defaultOpen.bind(this);
        this.goToStart = this.goToStart.bind(this);
        this.sendCode = this.sendCode.bind(this);
        this.showModal = this.showModal.bind(this);
        this.successRegister = this.successRegister.bind(this);
        this.getBackActiveTab = this.getBackActiveTab.bind(this);

        this.isDefaultConfig = UtilsLoginRegister.isDefaultConfig();
    }

    componentDidMount() {
        let fromSuscTV = (this.props
                            && this.props.location
                            && this.props.location.state
                            && this.props.location.state.fromsusctv
        );

        this.setStyleTabDinamyc();
        this.defaultOpen();
        if(fromSuscTV && new PlayerUtil().isFullVideoPlayingLive()) {
            this.closeFullPlayer();
        }
    }

    setStyleTabDinamyc() {
        const formTabSesion = document.getElementById('form-tab-sesion');
        const tabsClass = {
            numberTabs: {
                1: ['once'],
                2: ['firts', 'second'],
                3: ['first third_tab', 'center third_tab', 'second third_tab']
            },
        };

        if(formTabSesion) {
            if(formTabSesion.childNodes.length > 0) {
                for(let i = 0; i < formTabSesion.childNodes.length; i++ ){
                    formTabSesion.childNodes[i].className = formTabSesion.childNodes[i].className + ' ' + tabsClass.numberTabs[formTabSesion.childNodes.length][i];
                };
            }
            formTabSesion.style.display = 'block';
        }
    }

    defaultOpen = () => {
        const defaultActive = `${this.form_type}_email`;
        UtilsLoginRegister.defaultTabOpen(this.form_type, defaultActive);
    }

    successRegister(response) {
        this.props.receiveIsLoggedIn(response);
        DeviceStorage.setItem('user_hash', response.session_userhash);
        // TODO lógica para dirigir a formulario de suscripción
        this.sendMetric('exitoso');
        if (this.props.location.state) {
            const pbi = this.props.location.state;

            if (pbi.oneoffertype === 'subscrition') {
                this.props.history.replace(`/payment/0/${pbi.offerid}`, pbi);
            } else {
                let requets = Utils.getRequest(pbi.linkworkflowstart);
                this.props.history.replace(`/payment/${requets.params.group_id}/${pbi.offerid}`, pbi);
            }
        } else {
            this.props.history.replace('/planSelector');
        }
    }

    async handleSubmit() {
        const errors = this.getErrors();
        if (Object.keys(errors).length) {
            return this.props.handleErrors(errors);
        }
        const params = Object.assign({}, this.props.formValues);
        params.includpaywayprofile=true;
        params.accepterms = params.accepterms ? 1 : 0;
        const response = await this.performRegister(params);
        if (response.success) {
           this.successRegister(response.data);
        } else {
            const code = response.error || response.error.code
            Utils.behaviorOfError(code, this.props.handleErrors, this.showModal);
            this.setStyleTabDinamyc();
            this.getBackActiveTab();
        }
    }

    getBackActiveTab() {
        const { currentTab } = this.state;

        if(currentTab) {
            const currentTabId = `${this.form_type}_${currentTab}`;
            UtilsLoginRegister.activeTabElement(currentTabId);
        }
    }

    async handleCPF() {

        const errors = this.getErrorsNet();

        if (Object.keys(errors).length) {
            return this.props.handleErrors(errors);
        }

        const params = Object.assign({}, this.props.formValues);

        const response = await this.performpfQuery(params);
        if (response.success) {

            if (response.data.exists) {
                //redireccion a login
                this.props.history.push(`/login/`);
            }
            else
            {
                this.setState({ step: '' });
            }

        } else {
            const modal = {
                modalType: MODAL_ERROR,
                modalProps: {
                    callback: () => this.props.handleFocus(),
                    content: response.error
                }
            }
            this.props.showModal(modal);
        }
    }

    async performpfQuery(params = {}) {

        const response = { success: false };
        this.setState({ isLoading: true });

        try {
            const result = await CpfQuery(params);
            if (result && result.status == '0') {
                response.success = true;
                response.data = result.response;
            }
        } catch (error) {
            response.error = error;
        }

        this.setState({ isLoading: false });
        return response;
    }

    async performRegister(params = {}) {
        const response = { success: false };
        this.setState({ isLoading: true });
        try {
            const result = await register(params);
            if (result && result.status == '0') {
                response.success = true;
                response.data = result.response;
            }
        } catch (error) {
            response.error = error;
        }
        this.setState({ isLoading: false });
        return response;
    }

    getErrorsTelcel(code) {
        //Campos no vacios
        const formValues = this.props.formValues;
        let errors = [];
        // campo vacio
        if(code && !formValues["otp"]){
            errors["otp"] = Translator.get('register_validation_phone_number_void_msg', 'Debes completar el campo con el codigo enviado');;
        }else if (code && formValues.otp.length <  this.lengthAndProvider.minlength_otp || formValues.otp.length > this.lengthAndProvider.maxlength_otp) {
            errors['otp'] = Translator.get('register_validation_otp_len_msg', 'Debe contener 8 dígitos');
        }

        if(!formValues["msisdn"]){
            errors["msisdn"] = Translator.get('register_validation_otp_void_msg', 'Debes completar el campo con un número válido');;
        }else{

            //numeroTelcel al menos de 6 caracteres
            if(formValues.msisdn.match(/^\d+$/) === null) {
                errors['msisdn'] = Translator.get('register_validation_phone_number_void_msg', 'Debes completar el campo con un número válido');
            } else if(formValues.msisdn.length < this.lengthAndProvider.minlength_phone_number || formValues.msisdn.length > this.lengthAndProvider.maxlength_phone_number) {
               errors['msisdn'] = Translator.get('register_validation_phone_number_len_msg', 'Debe contener 10 dígitos');
            }

        }

        return errors;
    }

    getErrors() {
        //Campos no vacios
        const formValues = this.props.formValues;
        const errors = Object.keys(formValues).reduce((errors, key) => {
            const value = formValues[key];
            if (!value && (key !== 'accepterms' && key !== 'otp' && key !== 'msisdn')) {
                errors[key] = true;
            }
            if (this.region !== 'brasil' && key === 'cpf') {
                delete errors.cpf
            }
            return errors;
        }, {});
        //correo válido
        if (!Utils.isValidEmail(formValues.email))
            errors['email'] = Translator.get('registro_valido_mail', 'Debes completar el campo con un correo electrónico válido');

        if (!Utils.isValidEmail(formValues.emailConfirm))
            errors['emailConfirm'] = Translator.get('registro_valido_mail', 'Debes completar el campo con un correo electrónico válido');

        //pasword al menos de 6 caracteres
        if (formValues.password.length < Metadata.get('password_min_length',6) || formValues.password.length > Metadata.get('password_max_length',25) )
            errors['password'] = Translator.get('registro_contrasena_validar', 'Debe tener entre 6 y 25 caracteres. Se permiten letras y/o números, sin caracteres especiales.');

        if (formValues.passwordConfirm.length < Metadata.get('password_min_length',6) || formValues.passwordConfirm.length > Metadata.get('password_max_length',25) )
            errors['passwordConfirm'] = Translator.get('registro_contrasena_validar', 'Debe tener entre 6 y 25 caracteres. Se permiten letras y/o números, sin caracteres especiales.');

        //correo/contraseñas iguales
        if (formValues.email !== formValues.emailConfirm)
            errors['emailConfirm'] = Translator.get('email_not_equal', 'Los correos ingresados no concuerdan. Por favor ingrésalos nuevamente.');

        if (formValues.password !== formValues.passwordConfirm)
            errors['passwordConfirm'] = Translator.get('registro_input_doesnt_match', 'Las contraseñas no concuerdan.');

        return errors;
    }


    sendDimension(){
      const payload=new AnalyticsDimensionSingleton().getPayload();
      this.props.setMetricsEvent(payload);
      this.props.setMetricsEvent({ type: 'executor'});
    }

    sendMetric(label){
      if(typeof this.props.setMetricsEvent==='function') {
        this.props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'registro',
          eventAction: 'click',
          eventLabel: label,
        });
        this.props.setMetricsEvent({type: 'executor'});
        this.sendDimension();
      }
    }


    showTC(){

      const modal = {
        modalType: MODAL_TERM_AND_COND,
        modalProps: {
          callback: () => this.props.handleFocus(),
          content: 'algo'
        }
      }
      this.props.showModal(modal);
    }

    getErrorsNet() {
        const formValues = this.props.formValues;
        const errors = Object.keys(formValues).reduce((errors, key) => {
            const value = formValues[key];
            return errors;
        }, {});
        //11 digitos
        const re = /^\d{11}$/;
        if (!re.test(formValues.cpf)) errors['cpf'] = true;

        return errors;
    }

    closeFullPlayer() {
      store.dispatch(playFullMedia({ src: null }));
    }

    goToStart(){
        this.props.history.push(`/login/`);
    }

    openTab(evt, partner) {
        this.setState({
            currentTab: partner
        });

        var i, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        }

        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        document.getElementById(partner).style.display = "block";
        evt.currentTarget.className += " active";

        UtilsLoginRegister.focusFromTab(partner);
    }

    async sendCode(e, code = ""){
        const errors = this.getErrorsTelcel(code);

        if (Object.keys(errors).length) {
            return this.props.handleErrors(errors);
        }
        //FIX numberfield en lugar de msisdn
        var params = {
            numberfield: this.props.formValues.msisdn
        }
        if(code){
            params.otp = this.props.formValues.otp;
        }
        const loginSSOTask = new LoginSSOTask(params);
        await RequestManager.addRequest(loginSSOTask).then((result) => {
          const response = result.response;
          if(response){
            if(response.sent == true) {
                this.setState({formCodeTelcel: true});
                const closeTime = Utils.getCloseTime(code);
                const msg = Translator.get('msg_modal_code_telcel', '¡Código de validación enviado correctamente a tu celular!')
                !code && this.showModal(MODAL_SUCCESS, msg, {noButton: true, closeTime});
            } else {
                this.successRegister(response);
                if(response.validEmail == false){
                  this.showModal(MODAL_UPDATE_EMAIL, "")
                }
            }
          }
        }, (error) => {
           Utils.behaviorOfError(error, this.props.handleErrors, this.showModal, {session: true})
        });
    }

    showModal(type, msg, props){
        let modalProps = {
            callback: () => this.props.handleFocus(),
            content: msg
        }
        if(props){
          Object.assign(modalProps, props);
        }
        const modal = {
            modalType: type,
            modalProps
        }
        this.props.showModal(modal);
    }

    render() {
        const { currentTab } = this.state;
        const isBrasil = this.region === 'brasil';
        const buttonRegister = Translator.get(isBrasil && this.state.step === STEP_CPF ? 'net_cpf_continuar':'register_button_value', 'Regístrame')
        const buttonSend = Translator.get('register_send_msisdn_button_value', 'Enviar');
        const buttonText = (currentTab === 'sso_mobile' && !this.state.formCodeTelcel) ? buttonSend : buttonRegister;

        const assetMobile = this.isDefaultConfig ? `default_${this.form_type}_sso_mobile_asset_off` : `${this.region}_${this.form_type}_sso_mobile_asset_off`;
        const assetMobile_active = this.isDefaultConfig ? `default_${this.form_type}_sso_mobile_asset_on` :`${this.region}_${this.form_type}_sso_mobile_asset_on`;

        const assetEmail = this.isDefaultConfig ? `default_${this.form_type}_email_asset_off` : `${this.region}_${this.form_type}_email_asset_off`;
        const assetEmail_active = this.isDefaultConfig ? `default_${this.form_type}_email_asset_on` :`${this.region}_${this.form_type}_email_asset_on`;

        const assetfacebook = this.isDefaultConfig ? `default_${this.form_type}_facebook_asset_off` : `${this.region}_${this.form_type}_facebook_asset_off`;
        const assetfacebook_active = this.isDefaultConfig ? `default_${this.form_type}_facebook_asset_on` :`${this.region}_${this.form_type}_facebook_asset_on`;

        const isAssetPhone = Asset.get(assetMobile).indexOf('http') > -1;
        const isAssetEmail = Asset.get(assetEmail).indexOf('http') > -1;

        const phoneLogin = <img  src={currentTab === 'sso_mobile' ? Asset.get(assetMobile_active) : Asset.get(assetMobile)} />;
        //const emailLogin = <img src={currentTab === 'email' ? Asset.get(assetEmail_active) : Asset.get(assetEmail)} />;
        //Se toma la imagen de default solo para el caso de e-mail
        const emailLogin = isAssetEmail ? <img src={currentTab === 'email' ? Asset.get(assetEmail_active) : Asset.get(assetEmail)} /> : <img src={currentTab === 'email' ? '/images/mail_off_aaf.png' : '/images/mail_on_aaf.png'} />;
        const facebookLogin = <img  src={currentTab === 'login_facebook' ? Asset.get(assetfacebook_active) : Asset.get(assetfacebook)} />;

        if (this.state.isLoading) return <Spinner visible={true} />;
        return (
            <div className="form-group__container register" >
                {
                    isBrasil && this.state.step === STEP_CPF &&
                    <div className='net_cpf'>
                        <h1>{Translator.get('net_cpf_header', 'Assinar Claro Video')}</h1>
                        <hr/>
                        <div className='net_cpf_instrucciones'>
                            <span>{Translator.get('net_cpf_instrucciones', 'O primeriro passo da compra é informar seu CPF')}</span>
                        </div>
                        <div className='net_cpf_hint'>
                            <span>{Translator.get('net_cpf_hint', 'Digite seu CPF')}</span>
                        </div>
                        {this.props.renderGroup('cpf', Translator.get('net_cpf_hint', 'Digite seu CPF'))}
                    </div>
                }
                {this.state.step === '' &&
                 <div>
                     <h1>{Translator.get('inicio_registro', 'Regístrate')}</h1>
                     <p className="form-group__title title_yellow">{Translator.get('register_select_option_label', 'Selecciona una opción')}</p>

                     <div className="form-group__input-tab-sesion" id="form-tab-sesion">
                        {UtilsLoginRegister.isTabEnable(this.form_type, 'sso_mobile') ?
                          <div>
                            <a className="btn tablinks tablinks--asset first focusable" id="register_sso_mobile"
                              onClick={(e) => this.openTab(e, 'sso_mobile')}
                              href="javascript:void(0)">
                              {phoneLogin}
                            </a>
                          </div>
                        :null}
                        {UtilsLoginRegister.isTabEnable(this.form_type, 'email') ?
                          <div className="" >
                            <a className="btn tablinks tablinks--asset seconds focusable" id="register_email"
                              onClick={(e) => this.openTab(e, 'email')}
                              href="javascript:void(0)">
                              {emailLogin}
                            </a>
                          </div>
                        :null}
                        {UtilsLoginRegister.isTabEnable(this.form_type, 'login_facebook') ?
                          <div className="" >
                            <a className="btn tablinks tablinks--asset third focusable" id="register_login_facebook"
                              onClick={(e) => this.openTab(e, 'login_facebook')}
                              href="javascript:void(0)">
                              {facebookLogin}
                            </a>
                          </div>
                        :null}
                     </div>
                    <div id="email" className="tabcontent">
                      {this.props.renderGroup('email', Translator.get('registro_mail', 'Correo electrónico'))}
                      {this.props.renderGroup('emailConfirm', Translator.get('registro_repetir_mail', 'Repetir correo electrónico'))}
                      {this.props.renderGroup('password', Translator.get('registro_contrasena', 'Contraseña'), 'password_hiden', null, null, "form-group__input-password")}
                      {this.props.renderGroup('passwordConfirm', Translator.get('registro_repetir_contrasena', 'Repetir contraseña'), 'password_hiden', null, null, "form-group__input-password")}
                    </div>

                    <div id="sso_mobile" className="tabcontent">
                      {this.props.renderGroup('msisdn', Translator.get('register_placeholder_msisdn', 'Ingresa tu número Claro a 10 dígitos'))}
                      {this.state.formCodeTelcel &&
                        <div>
                           {this.props.renderGroup('otp', Translator.get('register_placeholder_otp', 'Ingresa tú codigo de validación'))}
                           <div onClick = {this.sendCode} className = "resend_code">
                             <a href="javascript:void(0)" className = "focusable title_yellow form-group__title bold">{Translator.get('register_resend_otp_button_value', 'Reenviar Código')}</a>
                           </div>
                        </div>
                        }
                    </div>
                    <div id="login_facebook" className="tabcontent">
                        {/* AQUI VA EL CÓDIGO PARA FACEBOOK */}
                    </div>
                 </div>
                }
                <div className="form-group__register-telcel">
                    <div className="terms">
                        <span>{Translator.get('registro_terminos_condiciones1', 'Al registrarte aceptas los')+" "}</span>
                        <a className="btn focusable title_yellow"
                            onClick={this.showTC}
                            href="javascript:void(0)"
                        >
                            {Translator.get('registro_terminos_condiciones2', 'Voltar')}
                        </a>
                        <span>{" "+Translator.get('registro_terminos_condiciones3', 'Acepto')}</span>
                    </div>
                    <div className = "am_user">
                      <a className="focusable title_yellow form-group__title bold"
                        onClick={this.goToStart}
                        href="javascript:void(0)"
                      >
                        {Translator.get('already_registered_user_button_value', 'Ya soy Usuario')}
                      </a>
                    </div>
                    <div className="btn-group">
                        {
                            isBrasil && this.state.step === STEP_CPF &&
                            <a
                                className="btn focusable"
                                onClick={this.handleSubmit}
                                href="javascript:void(0)"
                            >
                                {Translator.get('registro_volver', 'Voltar')}
                            </a>
                        }
                        <a
                            className="btn focusable"
                            onClick={isBrasil && this.state.step === STEP_CPF ? this.handleCPF: (currentTab == "sso_mobile" ? (e) => this.sendCode(e,this.state.formCodeTelcel) : this.handleSubmit)}
                            href="javascript:void(0)"
                        >
                            {buttonText}
                        </a>
                    </div>
                    <div className="secure-msg">
                        <img alt="shield icon" src={Asset.get('register_shield_icon', 'http://clarovideocdn1.clarovideo.net/pregeneracion/cms/apa/a9028c58f218a7afd2d32ad11d0058e0/register_shield_icon.png?1517938388')} />
                        <span>{Translator.get('msg_secure_service', 'SERVICIO SEGURO')}</span>
                    </div>
                </div>
            </div>
        );
    }
}

let formValues = {
    email: '',
    emailConfirm: '',
    password: '',
    passwordConfirm: '',
    accepterms: true,
    cpf: '',
    msisdn: '',
    otp: ''
};
//if(DeviceStorage.getItem('region')==='brasil')
//{
//  formValues.cpf='';
//}
export default connect(null, { showModal, receiveIsLoggedIn,setMetricsEvent })(withKeyboard(Register, formValues));
