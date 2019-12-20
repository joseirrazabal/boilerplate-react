import React, { PureComponent } from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import Keyboard from './../Keyboard/Keyboard';
import FormGroup from './../FormGroup';
import Utils from "../../utils/Utils";
import UtilsIpTelmex from "../../utils/user/IpTelmex";
import './styles/keyboard.css';

const FormValidMail = ({ phone, setTextValue, values, errors, setCurrentKey, errorMessage}) => {

    const inputMail = 'email';

    return (
        <div id='iptelmex' >
            <div className='left'>
                <Keyboard
                    currentValue={values[inputMail]}
                    onClick={(text) => {
                        setTextValue(text);
                }}/>
        </div>
        <div className='right' >
            <div className='title'>
                <span>{Translator.get('ip_telmex_label_restore_mail', 'Para continuar completa tu perfil*')}</span>
            </div>
            <div className='subtitle'>
                    <i className="fa fa-phone" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;<span>{phone}</span>
            </div>
            <div className='text'>
                <span className='email'>{Translator.get('ip_telmex_mail_label', 'Ingresa correo electrónico')}</span>
            </div>
            <div>
                <FormGroup
                    id={inputMail}
                    value={values[inputMail]}
                    error={errors[inputMail]}
                    placeholder={Translator.get('ip_telmex_mail_placeholder', 'Correo electrónico')}
                    onFocused={() => {
                            setCurrentKey(inputMail);
                    }}
                />
            </div>
            <div className='text'>
                <span>{Translator.get('ip_telmex_message_restore_mail', 'Estos datos te servirán para iniciar sesión en cualquier dispositivo.')}</span>
                </div>
            <div className='errors'>
                    <span>{errorMessage}</span>
            </div>

        </div>
    </div>)
}



class ModalKeyboard extends PureComponent {
    constructor(props) {
        super(props)

        console.log('==> ModalKeyboard constructor');

        this.state = {
            values: {
                email: ''
            },
            errors: {
                email: false
            },
            errorMessage: '',
            currentKey: 'email',
            phone: this.props.phone
        };

        this.modalProps = {
            extraClass: 'iptelmex',
            buttons: [
                {
                    content: Translator.get('ip_telmex_skip_restore_mail', 'Omitir'),
                    props: {
                        onClick: (e) => props.handleClose(e, props.onOmit),
                    }
                },
                {
                    content: Translator.get('ip_telmex_accept_restore_mail', 'Aceptar'),
                    props: {
                        onClick: (e) => {

                            if (this.validateField('email')) {
                                UtilsIpTelmex.userModifyMail(this.state.values['email'], props.userhash).then(this.userModifySuccess, this.userModifyFail);
                            }

                            //props.handleClose(e, props.onOk);
                        },
                    }
                }
            ]
        }

        this.setKey = this.setKey.bind(this);
        this.setTextValue = this.setTextValue.bind(this);
        this.handleErrors = this.handleErrors.bind(this);
        this.userModifySuccess = this.userModifySuccess.bind(this);
        this.userModifyFail = this.userModifyFail.bind(this);

    }

    userModifySuccess(resp) {
        console.log('userModifySuccess ....')
        console.log(resp);

        if (resp.status !== '0') {
            const errorMessage = resp.error ? resp.error : '';
            let errors = {};
            errors.email = true;
            this.setState({ errorMessage, errors });
        }
        else
        {
            this.props.handleClose();
        }
    }

    userModifyFail(err) {

        const errorMessage = err.message ? err.message : '';
        let errors = {};
        errors.email = true;
        this.setState({ errorMessage, errors });
    }

    handleErrors(errors) {
        this.setState({ errors });
    }

    setKey(key) {
        this.setState({ currentKey: key });
    }

    setTextValue(value) {
        const key = this.state.currentKey;
        let values = this.state.values;

        if (values[key] !== undefined) {

            values[key] = value;
            const errors = this.state.errors
            if (errors[key]) {
                errors[key] = false;
            }
            this.setState({ values, errors });
        }
    }

    validateField(field) {

        let isValid = false;
        let errors = [];
        const value = this.state.values[field];

        if (value === '' || !Utils.isValidEmail(value)) {
            errors[field] = true;
        }
        else {
            errors[field] = false;
            isValid = true;
        }
        this.handleErrors(errors);
        return isValid;
    }

    componentDidMount() {
        window.SpatialNavigation.makeFocusable();
    }

    shouldComponentUpdate(nextProps, nextState) {
        //return nextState.values[this.state.currentKey] !== this.state.values[this.state.currentKey];
        return true;
    }

    render() {
        return (<ModalWrapper {...this.modalProps} test={this.state.values}>
            <FormValidMail phone={this.state.phone} values={this.state.values} errors={this.state.errors} errorMessage={this.state.errorMessage}
                setCurrentKey={this.setKey} setTextValue={this.setTextValue} />
        </ModalWrapper >);
    }
}

export default withOnClose(ModalKeyboard);
