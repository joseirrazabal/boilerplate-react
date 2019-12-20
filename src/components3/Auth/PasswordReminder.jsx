
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spinner from './../../components/Spinner';
import { withKeyboard } from '../../components/FormGroup';
import Translator from './../../requests/apa/Translator';
import { sendPasswordReminder } from '../../requests/loader';
import { showModal, MODAL_ERROR, MODAL_SUCCESS } from '../../actions/modal';
import ShowCaptchaTask from '../../requests/tasks/user/ShowCaptchaTask';
import Utils from '../../utils/Utils';
import focusSettings from "../Focus/settings"
import './styles/login.css';

class PasswordReminder extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            captcha: this.getCaptchaUrl()
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.setCaptcha = this.setCaptcha.bind(this);
    }

    getErrors() {
        const formValues = this.props.formValues;
        const errors = {};
        //correo válido
        if (!Utils.isValidEmail(formValues.email)) errors['email'] = Translator.get('registro_valido_mail', 'Debes completar el campo con un correo electrónico válido');
        //captcha no vacío
        if (formValues.captcha.length <= 0) errors['captcha'] = Translator.get('suscripcion_captcha_vacio', 'Debes completar el campo');
        return errors;
    }

    getCaptchaUrl() {
        const showCaptchaTask = new ShowCaptchaTask();
        return `${showCaptchaTask.getImageUrl()}&rnd=${Math.random()}`;
    }

    setCaptcha() {
        const captcha = this.getCaptchaUrl();
        this.setState({ captcha });
    }

    async handleSubmit() {
        const errors = this.getErrors();
        if (Object.keys(errors).length) {
            return this.props.handleErrors(errors);
        }
        const params = Object.assign({}, this.props.formValues);
        const response = await this.performSendPasswordReminder(params);
        if (response.success) {
            const modal = {
                modalType: MODAL_SUCCESS,
                modalProps: {
                    callback: () => this.props.history.push('/login'),
                    replaces: {'{@EMAIL}': params.email},
                    content: Translator.get('reminder_sended', 'La información solicitada fue enviada a tu cuenta de correo electrónico')
                }
            }
            this.props.showModal(modal);
        } else {
            const modal = {
                modalType: MODAL_ERROR,
                modalProps: {
                    callback: () => this.props.handleFocus(),
                    replaces: {'{@EMAIL}': params.email},
                    content: response.error
                }
            }
            this.props.showModal(modal);
        }
    }

    async performSendPasswordReminder(params = {}) {
        const response = { success: false };
        this.setState({ isLoading: true });
        try {
            const result = await sendPasswordReminder(params);
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

    render() {
        return (
            <div className="form-group__container login">
                {/*<h1>{Translator.get('password_reminder', 'Olvidaste tu contraseña')}</h1>*/}
                <h2>{Translator.get('reminder_body', 'insira seu mail')}</h2>
                {this.props.renderGroup('email', Translator.get('ingresar_email', 'Correo electrónico'))}
                <h2>{Translator.get('reminder_captcha', 'Escreva os caracteres que voce ve na imagen')}</h2>
                <div className="captcha">
                    {this.props.renderGroup('captcha', Translator.get('captcha_place_holder', 'Captcha'))}
                   
                    <a className={`icon-refresh refresh-btn focusable icon-one`} onClick={this.setCaptcha} href="javascript:void(0)" />
                
                    <div className="div-captcha"><img src={this.state.captcha} alt="captcha" /></div>
                </div>
                <div className="btn-group input-btn-container">
                    <a
                        className="btn-login focusable"
                        href="javascript:void(0)"
                        onClick={this.handleSubmit}
                    >
                        {Translator.get('reminder_button', 'Siguiente')}
                    </a>
                    <a
                        className="btn-login focusable"
                        href="javascript:void(0)"
                        onClick={this.props.history.goBack}
                    >
                        {Translator.get('login_cancelar', 'Cancelar')}
                    </a>
                </div>
            </div>
        );
    }
}

const formValues = {
    email: '',
    captcha: ''
};
export default connect(null, { showModal })(withKeyboard(PasswordReminder, formValues));