import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Spinner from './../../components/Spinner';
import { withKeyboard } from '../../components/FormGroup';
import Button from '../../components/Button';
import Translator from './../../requests/apa/Translator';
import Asset from './../../requests/apa/Asset';
import LoginSSOTask from './../../requests/tasks/sso/LoginSSOTask'
import { login, login360, loginNET, setTermsAndConditions, workflowstart, paywayConfirm } from '../../requests/loader';
import { showModal, MODAL_ERROR, MODAL_ACCEPT_TERM, MODAL_TERM_AND_COND, MODAL_SUCCESS, MODAL_UPDATE_EMAIL} from '../../actions/modal';
import { receiveIsLoggedIn } from '../../reducers/user';
import ShowCaptchaTask from '../../requests/tasks/user/ShowCaptchaTask';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import Utils from '../../utils/Utils';
import Metadata from '../../requests/apa/Metadata';
import './styles/login.css';
import {setMetricsEvent} from "../../actions/metrics";
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import { fetchLinealChannels } from '../../actions/payway';
import channelBlockedUtil from "../../utils/ChannelBlockedUtil";
import BlockedChannels from "../../utils/BlockedChannels";
import RequestManager from './../../requests/RequestManager';
import UtilsLoginRegister from '../../utils/LoginRegister';

const VENDOR_CV = 'Claro video';
const VENDOR_360 = 'Claro 360';
const VENDOR_NET = 'NET Brasil';
const VENDOR_HDTV = 'Claro Hdtv';
const NO_VENDOR = 'none';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.form_type = 'login';
        this.lengthAndProvider = Utils.getLengthMovilAndProvider();

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNet = this.handleNet.bind(this);
        this.setCaptcha = this.setCaptcha.bind(this);
        this.showAcceptTerm = this.showAcceptTerm.bind(this);
        this.acceptTermAndCond = this.acceptTermAndCond.bind(this);
        this.onShowTermAndCond = this.onShowTermAndCond.bind(this);
        this.setVendor = this.setVendor.bind(this);
        this.workflowstartSuccess = this.workflowstartSuccess.bind(this);
        this.workflowstartFail = this.workflowstartFail.bind(this);
        this.paywayConfirmSuccess = this.paywayConfirmSuccess.bind(this);
        this.paywayConfirmFail = this.paywayConfirmFail.bind(this);
        this.region = DeviceStorage.getItem('region');
        this.userLoged = this.props.user.is_user_logged_in;
        this.updateBlockedChannels = this.updateBlockedChannels.bind(this);
        this.sendCode = this.sendCode.bind(this);
        this.showModal = this.showModal.bind(this);
        this.getBackActiveTab = this.getBackActiveTab.bind(this);

        this.isDefaultConfig = UtilsLoginRegister.isDefaultConfig();
    }

    componentDidMount() {
        this.setStyleTabDinamyc();
        this.defaultOpen();
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

    getInitialState() {
        return {
            isLoading: false,
            vendor: VENDOR_CV,
            captcha: {
                show: false,
                url: ''
            }
        };
    }

    getErrors() {
        const formValues = this.props.formValues;
        const errors = {};

        if (this.isNetVendor()) {
            if (!formValues.email)
                errors['email'] = Translator.get('registro_valido_mail', 'Debes completar el campo con un correo electrónico válido');
        }
        else
        {
            //correo válido
            if (!Utils.isValidEmail(formValues.email))
                errors['email'] = Translator.get('registro_valido_mail', 'Debes completar el campo con un correo electrónico válido');
        }
        //pasword al menos de 6 caracteres
        if (formValues.password.length < 6)
            errors['password'] = Translator.get('invalid_password_length', 'La longitud de la contraseña no debe ser inferior a 6 caracteres');
        //Si hay captcha que no vaya vacío
        if (this.state.captcha.show && formValues.captcha.length <= 0)
            errors['captcha'] = Translator.get('suscripcion_captcha_vacio', 'Debes completar el campo');
        return errors;
    }

    setCaptcha() {
        const showCaptchaTask = new ShowCaptchaTask();
        const url = `${showCaptchaTask.getImageUrl()}&rnd=${Math.random()}`;
        const captcha = {
            url,
            show: true
        }
        this.setState({ captcha });
    }

    showAcceptTerm() {
        this.getConfigRemoteControl();
        const modal = {
            modalType: MODAL_ACCEPT_TERM,
            modalProps: {
                onAccept: () => this.acceptTermAndCond(),
                onShowTermAndCond: () => this.onShowTermAndCond(),
            }
        }
        this.props.showModal(modal);
    }

    updateBlockedChannels(){
        let blockedChannelsList = new BlockedChannels();
        blockedChannelsList.checkBlockedChannels().then((response) => {
          channelBlockedUtil.set('blockedChannels', response);
        });
    }

    async acceptTermAndCond() {

        this.setState({ isLoading: true });

        try {
            const params = Object.assign({ 'terminos': 1 }, this.props.formValues);
            const response = await setTermsAndConditions(params);

            if (response && response.status == '0') {
                this.handleSubmit();
            }
            else {
                const modal = {
                    modalType: MODAL_ERROR,
                    modalProps: {
                        callback: () => this.props.handleFocus(),
                        content: response.error
                    }
                }
                this.props.showModal(modal);
                this.setState({ isLoading: false });
            }
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }

    }

    async onShowTermAndCond() {

        const modal = {
            modalType: MODAL_TERM_AND_COND,
            modalProps: {
                onShowAcceptTerm: () => this.showAcceptTerm(),
            }
        }
        this.props.showModal(modal);

    }

    successLogin(response){
        this.sendMetric('exitoso');
        
        // goose -- se saca youbora
        /*
        // Youbora
        if(window.youboraTrackingPlugin){
            if(window.youboraTrackingPlugin.storage){
                if(window.youboraTrackingPlugin.storage.removeLocal
                    && typeof window.youboraTrackingPlugin.storage.removeLocal === "function"){
                    window.youboraTrackingPlugin.storage.removeLocal('data');
                }
                if(window.youboraTrackingPlugin.storage.removeSession
                    && typeof window.youboraTrackingPlugin.storage.removeSession === "function"){
                    window.youboraTrackingPlugin.storage.removeSession('data');
                }
            }
            if(window.youboraTrackingPlugin.restartViewTransform
                && typeof window.youboraTrackingPlugin.restartViewTransform === "function"){
                window.youboraTrackingPlugin.restartViewTransform();
            }
        };
        
        if(window.youboraAnalyticsPlugin){
            if(window.youboraAnalyticsPlugin.infinity){
                if(window.youboraAnalyticsPlugin.infinity.fireSessionStop
                    && typeof window.youboraAnalyticsPlugin.infinity.fireSessionStop === "function"){
                    window.youboraAnalyticsPlugin.infinity.fireSessionStop();
                }
                if(window.youboraAnalyticsPlugin.infinity.fireSessionStart
                    && typeof window.youboraAnalyticsPlugin.infinity.fireSessionStart === "function"){
                    window.youboraAnalyticsPlugin.infinity.fireSessionStart();
                    
                }
            }
        }
        */

        // Actualizar lista de suscripciones/paquetes que el user ha comprado/tiene acceso
        this.props.fetchLinealChannels(response.user_id);

        this.props.receiveIsLoggedIn(response);

        const region = DeviceStorage.getItem('region');
        DeviceStorage.setItem('user_hash', response.session_userhash);

        // Actualizar lista de canales bloqueados si el PIN está activo y si existen canales bloqueados
        this.updateBlockedChannels();

        if(region !== response.region) {
          DeviceStorage.setItem('region', response.region);
          window.location.href = '/';
        }
        else
          this.props.history.push('/');
           this.getConfigRemoteControl();
    }

    async handleSubmit() {
        const errors = this.getErrors();
        if (Object.keys(errors).length) {
            return this.props.handleErrors(errors);
        }
        const params = Object.assign({}, this.props.formValues);
        params.password=encodeURIComponent(params.password);
        params.includpaywayprofile=true;
        params.username = params.email;
        const response = await this.performLogin(params);

        if (!response) {
            return;
        }

        if (response && response.success) {
            this.successLogin(response.data);
        } else {
            if (response && response.error && response.error.code === 'accept_terms') {
                this.showAcceptTerm();
                return;
            } else if (response && response.error && response.error.code === 'user_login_captcha_required') {
                this.setCaptcha();
            }

            this.setStyleTabDinamyc();
            this.getBackActiveTab();
            Utils.behaviorOfError(response.error, this.props.handleErrors, this.showModal);
        }
    }

    getBackActiveTab() {
        const { currentTab } = this.state;

        if(currentTab) {
            const currentTabId = `${this.form_type}_${currentTab}`;
            UtilsLoginRegister.activeTabElement(currentTabId);
        }
    }

    async handleNet() {
        this.setState({ vendor: NO_VENDOR });
    }

    getErrorsTelcel(code) {
        //Campos no vacios
        const formValues = this.props.formValues;
        const errors = [];
        // campo vacio
        if(code && !formValues["otp"]){
            errors["otp"] = Translator.get('login_validation_phone_number_void_msg', 'Debes completar el campo con el codigo enviado');;
        }else if (code && formValues.otp.length <  this.lengthAndProvider.minlength_otp || formValues.otp.length > this.lengthAndProvider.maxlength_otp) {
            errors['otp'] = Translator.get('login_validation_otp_len_msg', 'Debe contener 8 dígitos');
        }

        if(!formValues["msisdn"]){
            errors["msisdn"] = Translator.get('login_validation_otp_void_msg', 'Debes completar el campo con un número válido');;
        }else{
         //numeroTelcel al menos de 6 caracteres
           if(formValues.msisdn.match(/^\d+$/) === null) {
                errors['msisdn'] = Translator.get('login_validation_phone_number_void_msg', 'Debes completar el campo con un número válido');
           } else if (formValues.msisdn.length <  this.lengthAndProvider.minlength_phone_number || formValues.msisdn.length > this.lengthAndProvider.maxlength_phone_number) {
                errors['msisdn'] = Translator.get('login_validation_phone_number_len_msg', 'Debe contener 10 dígitos');;
           }

        }
          
        return errors;
    }

    async performLogin(params = {}) {
        const response = { success: false };
        this.setState({ isLoading: true });
        let loginFunction = login;

        switch (this.state.vendor) {
            case VENDOR_360:
                loginFunction = login360;
                break;
            case VENDOR_NET:
            case VENDOR_HDTV:
                loginFunction = loginNET;
                delete params['captcha'];
                break;
        }

        try {
            const result = await loginFunction(params);
            if (result && result.status == '0') {
                response.success = true;
                response.data = result.response;
                if (this.isNetVendor()) {
                    if (response.data.hasUserSusc === 0 && response.data.purchase && response.data.purchase.url) {
                        let requets = Utils.getRequest(response.data.purchase.url);
                        let params = {};
                        params.linkworkflowstartParams = requets.params;
                        const netSubscriptionSuccess = await workflowstart(params).then(this.workflowstartSuccess, this.workflowstartFail);

                        if (!netSubscriptionSuccess)
                        {
                            return;
                        }

                        //Se realizo la suscripcion exitosamente, actualizar los datos para el dispatch para redux
                        response.data.hasSavedPayway = 1;
                        response.data.hasUserSusc = 1;
                        response.data.subscriptions = {
                            "AMCO": true
                        };
                    }
                }
            }
        } catch (error) {
            response.error = error;
        }
        this.setState({ isLoading: false });
        return response;
    }

    async workflowstartSuccess(resp) {

        if (resp && resp.status == "0") {
            resp = resp.response;
            var methods = resp.list;

            for (var i = 0; i < methods.length; i++) {
                var method = methods[i];
                if (method.gateway === "netgate" && method.buyLink) {
                    let requets = Utils.getRequest(method.buyLink);
                    return await paywayConfirm(requets.uri, requets.params).then(this.paywayConfirmSuccess, this.paywayConfirmFail);
                }
            }
        }

        return false;
    }

    async workflowstartFail(error) {

        this.setState({ isLoading: false });

        console.error(error);

        const modal = {
            modalType: MODAL_ERROR,
            modalProps: {
                callback: () => this.props.handleFocus(),
                content: error
            }
        }

        this.props.showModal(modal);
        return false;
    }

    async paywayConfirmSuccess(resp) {

        if (resp && resp.status == '0' && resp.response && resp.response.success && resp.response.success === 1) {
            return true;
        }

        return false;

    }

    async paywayConfirmFail(error) {

        this.setState({ isLoading: false });

        console.error(error);

        const modal = {
            modalType: MODAL_ERROR,
            modalProps: {
                callback: () => this.props.handleFocus(),
                content: error
            }
        }

        this.props.showModal(modal);
        return false;
    }

    setVendor(vendor) {
        const state = this.getInitialState();
        state.vendor = vendor;
        this.props.resetValues();
        this.setState(state);
    }

    sendDimension(){
      const payload=new AnalyticsDimensionSingleton().getPayload();
      this.props.setMetricsEvent(payload);
      this.props.setMetricsEvent({ type: 'executor'});
    }

    sendMetric(label){
      if(typeof this.props.setMetricsEvent==='function'){
        if(label==='exitoso')
          label+=`-${this.state.vendor}`;
        this.props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'login',
          eventAction: 'click',
          eventLabel: label,
        });
        this.props.setMetricsEvent({ type: 'executor'});
        this.sendDimension();
      }
    }

    renderVendorButton(vendor, apa_image) {
        const imgKey = this.state.vendor == vendor ? `${apa_image}_selected` : apa_image;
        const image = Asset.get(imgKey);
        return (
            // <button
            //     onClick={e => this.setVendor(vendor)}
            //     className={`btn focusable ${this.state.vendor == vendor ? 'btn-selected' : ''}`}>
            //   {imgKey===image?<div>{Translator.get('login360_01_cp','ingresa con ')+' '+vendor}</div>:<img src={image} alt={imgKey} />}
            // </button>
            <a
            href="javascript:void(0)"
            onClick={e => this.setVendor(vendor)}
            className={`btn focusable ${this.state.vendor == vendor ? 'btn-selected' : ''}`}
            >
               {imgKey===image?<div>{Translator.get('login360_01_cp','ingresa con ')+' '+vendor}</div>:<img src={image} alt={imgKey} />}
            </a>
        );
    }

    isNetVendor() {
        const netProviders = [VENDOR_NET, VENDOR_HDTV];
        return netProviders.includes(this.state.vendor);
    }

    openTab = (evt, partner) => {
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

    defaultOpen = () => {
        const defaultActive = `${this.form_type}_email`;
        UtilsLoginRegister.defaultTabOpen(this.form_type, defaultActive);
    }

    getConfigRemoteControl(){
      let rcConfigControl = DeviceStorage.getItem('config_remote_control', rcConfigControl);
      if(!rcConfigControl) {
        rcConfigControl = Utils.getRegionaliazedMetadata('rc_default_config','{"default":{"enable":false,"config":"full"}}').config;
        if (!rcConfigControl)
          rcConfigControl = 'full';
      }
      DeviceStorage.setItem('config_remote_control', rcConfigControl);
    }

    goToRegister = () => {
        this.props.history.push(`/register/`);
    }

    goToHome = () => {
        this.props.history.push('/');
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
                 this.successLogin(response);
                if(response.validEmail == false){
                  this.showModal(MODAL_UPDATE_EMAIL, "",this.goToHome)
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
            content: msg,
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
        const { currentTab, formCodeTelcel } = this.state;
        const buttonSubmitText = (currentTab === 'sso_mobile' && !this.state.formCodeTelcel) ? Translator.get('login_send_msisdn_button_value', 'Enviar') : Translator.get('login_btn_lbl', 'Iniciar sesión');

        const assetMobile = this.isDefaultConfig ? `default_${this.form_type}_sso_mobile_asset_off` : `${this.region}_${this.form_type}_sso_mobile_asset_off`;
        const assetMobile_active = this.isDefaultConfig ? `default_${this.form_type}_sso_mobile_asset_on` :`${this.region}_${this.form_type}_sso_mobile_asset_on`;
        
        const assetEmail = this.isDefaultConfig ? `default_${this.form_type}_email_asset_off` : `${this.region}_${this.form_type}_email_asset_off`;
        const assetEmail_active = this.isDefaultConfig ? `default_${this.form_type}_email_asset_on` :`${this.region}_${this.form_type}_email_asset_on`;
        
        const isAssetPhone = Asset.get(assetMobile).indexOf('http') > -1;
        const isAssetEmail = Asset.get(assetEmail).indexOf('http') > -1;

        const phoneLogin =  <img  src={currentTab === 'sso_mobile' ? Asset.get(assetMobile_active) : Asset.get(assetMobile)} />;
        //const emailLogin =  <img  src={currentTab === 'email' ? Asset.get(assetEmail_active) : Asset.get(assetEmail)} /> ;
        //Se toma la imagen de default solo para el caso de e-mail
        const emailLogin = isAssetEmail ? <img src={currentTab === 'email' ? Asset.get(assetEmail_active) : Asset.get(assetEmail)} /> : <img src={currentTab === 'email' ? '/images/mail_off_aaf.png' : '/images/mail_on_aaf.png'} />;

        if(this.userLoged && window.location.pathname === '/login')
          this.props.history.push('/');
        if (this.state.isLoading) return <Spinner visible={true} />;
        else
        return (
            <div className="form-group__container login">
                <h1>{Translator.get('inicio_sesion', 'Ingresa')}</h1>                
                <p className="form-group__title title_yellow">{Translator.get('login_select_option_label', 'Selecciona una opción')}</p>
               
                <div className="form-group__input-tab-sesion" id="form-tab-sesion">
                {UtilsLoginRegister.isTabEnable(this.form_type, 'sso_mobile') &&
                  <div>
                    <a className="btn tablinks tablinks--asset first focusable" id="login_sso_mobile"
                      onClick={(e) => this.openTab(e, 'sso_mobile')}
                      href="javascript:void(0)">
                      {phoneLogin}
                    </a>
                  </div>
                }
                {UtilsLoginRegister.isTabEnable(this.form_type, 'email') &&
                  <div>
                    <a className="btn tablinks tablinks--asset seconds focusable" id="login_email"
                      onClick={(e) => this.openTab(e, 'email')}
                      href="javascript:void(0)">
                      {emailLogin}
                    </a> 
                  </div>
                }
              </div>

                {
                    this.region === 'brasil' &&
                    <div className="netMessage">
                        <span>{Translator.get('net_operadora')}</span>
                    </div>
                }
                {
                    false &&
                    <div className="btn-vendor">
                        {this.renderVendorButton(VENDOR_CV, 'login_cv_logo')}
                        {this.renderVendorButton(VENDOR_360, 'login_360_logo')}
                    </div>
                }
                {
                    this.region === 'brasil' &&
                    <div className="btn-vendor net">
                        {this.renderVendorButton(VENDOR_CV, 'login_cv_logo')}
                        {this.renderVendorButton(VENDOR_NET, 'login_net_logo')}
                        {this.renderVendorButton(VENDOR_HDTV, 'login_hdtv_logo')}
                    </div>
                }
                {
                    this.region === 'brasil' &&
                    <div className="netMessage">
                        <div className='net_client' dangerouslySetInnerHTML={{ __html: Translator.get('net_cliente_claro') }}></div>
                        <Button className={`btn ${this.state.vendor === NO_VENDOR ? 'checked' : ''}`} text={Translator.get('net_click_login')} onClick={this.handleNet} />
                    </div>
                }
                <div id="email" className="tabcontent">
                    {this.props.renderGroup('email', this.isNetVendor() ? 'Login':  Translator.get('ingresar_email', 'Correo electrónico'))}
                    {this.props.renderGroup('password', Translator.get('ingresar_password', 'Contraseña'), 'password_hiden', null, null, "form-group__input-password")}
                </div>
                <div id="sso_mobile" className="tabcontent">
                {UtilsLoginRegister.isTabEnable(this.form_type, 'sso_mobile') && this.props.renderGroup('msisdn', Translator.get('login_placeholder_msisdn', 'Ingresa tu número Claro a 10 dígitos'))}
                    {this.state.formCodeTelcel && 
                    <div>
                        {this.props.renderGroup('otp', Translator.get('login_placeholder_otp', 'Ingresa tú codigo de validación'))}
                    </div>
                    }
                </div>
                {
                    this.state.captcha.show &&
                    <div className="captcha">
                        <span>{Translator.get('reminder_captcha', 'Escribe los caracteres que ves en la imagen')}</span>
                        {this.props.renderGroup('captcha', Translator.get('captcha_place_holder', 'Captcha'))}
                        <span className="icon-refresh refresh-btn focusable" onClick={this.setCaptcha} />
                        <img src={this.state.captcha.url} alt="captcha" />
                    </div>
                }
                {this.isNetVendor() &&
                    <div className="netMessage">
                    <span>{Translator.get('net_best_experience')}</span>
                    </div>
                }
                <div className="form-group__register-telcel">
                    {
                        currentTab === "email" ?
                        <Link
                            to="/password-reminder"
                            className="focusable title_yellow form-group__title bold form-group__space-between"
                        >
                            {Translator.get('password_reminder', '¿Olvidaste tu Contraseña?')}
                        </Link>
                        : null
                    }
                    {
                        (this.state.vendor !== VENDOR_360 && !this.isNetVendor()) && this.state.formCodeTelcel &&
                        <div className="margin-bottom--20">
                            {   currentTab === "sso_mobile" ?
                                    <a
                                        className="focusable title_yellow form-group__title bold"
                                        href="javascript:void(0)"
                                        onClick={this.sendCode}
                                    >
                                        {Translator.get('login_resend_otp_button_vaiue', 'Reenviar Código')}
                                    </a>
                                :
                                    <Link
                                        to="/password-reminder"
                                        className="focusable title_yellow form-group__title bold"
                                    >
                                        {Translator.get('password_reminder', '¿Olvidaste tu Contraseña?')}
                                    </Link>
                            }
                           
                        </div>
                    }

                    <div className="terms margin-bottom--20">
                        <span className="form-group__title">{Translator.get('loign_new_user_label', '¿Nuevo en clarovideo?') + " "}</span> 
                        <a className="btn focusable title_yellow form-group__title bold "
                            onClick={this.goToRegister}
                            href="javascript:void(0)" 
                        >
                            {Translator.get('loign_new_user_button_value', 'Registrate')}
                        </a>
                    </div>

                    <div className="btn-group">
                        <a
                            className="btn focusable float--right"
                            onClick={(currentTab == "sso_mobile") ? (e) => this.sendCode(e,this.state.formCodeTelcel) : this.handleSubmit}
                            href="javascript:void(0)"
                        >
                            {buttonSubmitText}
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

const formValues = {
    email: '',
    password: '',
    captcha: '',
    msisdn: '',
    otp: ''
};

function mapStateToProps(state) {
    return {
      user: state.user ? { ...state.user } : {},
    }
}
export default connect(mapStateToProps, { showModal, receiveIsLoggedIn, setMetricsEvent, fetchLinealChannels} )(withKeyboard(Login, formValues));
