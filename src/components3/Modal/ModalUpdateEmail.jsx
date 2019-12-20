import React, { Component } from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import Keyboard from './../Keyboard/Keyboard';
import { connect } from 'react-redux';
import { showModal } from '../../actions/modal';
import FormGroup from './../FormGroup';
import Utils from "../../utils/Utils";
import Button from './../Button';
import ModifyUserTask from '../../requests/tasks/user/ModifyUserTask';
import RequestManager from '../../requests/RequestManager';
import store from '../../store';

class ModalUpdateEmail extends Component{
    
    constructor(props){
        super(props);

        this.handleKeyFromKeyboard = this.handleKeyFromKeyboard.bind(this);
        this.modifyUser = this.modifyUser.bind(this);

        const user = store.getState().user;

        this.formValues = {
           email: "",
           name: user.firstname,
           lastName: user.lastname
        } 
        this.state = this.getInitialState();

    }

    getInitialState() {
        return {
          values: Object.assign({}, this.formValues),
          currentKey: null,
          errors: {},
        };
      }

    handleKeyFromKeyboard(value) {
      const key = this.state.currentKey;
      const values = this.state.values;
      if (values[key] !== undefined) {
        values[key] = value;
        const errors = this.state.errors
        if (errors[key]) {
          errors[key] = false;
        }
        this.setState({ values, errors });
      }
    }

    handleErrors(errors) {
        this.setState({ errors });
    }

    validateField(field) {
        let isValid = false;
        let errors = [];
        const value = this.state.values[field];

        if (value === '' || !Utils.isValidEmail(value)) {
            errors[field] = Translator.get('email_wrong', 'Email incorrecto');
        }
        else {
            errors[field] = false;
            isValid = true;
        }
        this.handleErrors(errors);
        return isValid;
    }

    async modifyUser() {
        const params = {
            firstname: this.state.values['name'],
            lastname: this.state.values['lastName'],
            email: this.state.values['email']
        };
        const userModify = new ModifyUserTask(params);
        await RequestManager.addRequest(userModify).then((result) => {
            const resp = result.response;
        if (resp.status !== '0') {
            const errorMessage = resp.error ? resp.error : '';
            let errors = {};
            errors.email = Translator.get(resp.code, errorMessage);;
            this.setState({ errors });
        } else {
            this.props.handleClose();
            if(typeof this.props.callback === "function"){
                this.props.callback();
            }
        }},(err) => {    
            const errorMessage = err.message ? err.message : '';
            let errors = {};
            errors.email = Translator.get(err.code, errorMessage);
            this.setState({ errors });
        });
    }

   render(){
    const placeholderEmail = `${Translator.get('change_placeholder_email', 'Correo electrónico')}`

    return (<ModalWrapper >
        <div id='updateEmailKeyboard' >
            <div className='left'>
                <Keyboard
                    currentValue={this.state.values[this.state.currentKey]}
                    onClick={(character) => {
                        this.handleKeyFromKeyboard(character);
                    }}
                />
            </div>
            <div className='right' >
                <div className='title'>
                    <span>{Translator.get("change_personal_data_title", "Completa tus Datos")}</span>
                </div>
                <div>
                <FormGroup
                    id = "email"
                    value = {this.state.values['email']}
                    error={!!this.state.errors['email']}
                    message={this.state.errors['email'] ? this.state.errors['email'] : ''}
                    placeholder = {placeholderEmail}
                    onFocused = {() => { this.setState({currentKey: 'email'}) }}
                    focused = {this.state.currentKey === 'email'}
                />
                 <FormGroup
                    id = "name"
                    value = {this.state.values['name']}
                    error={!!this.state.errors['name']}
                    message={this.state.errors['name'] ? this.state.errors['name'] : ''}
                    placeholder = {Translator.get('change_placeholder_name', 'Nombre')}
                    onFocused = {() => { this.setState({currentKey: 'name'}) }}
                    focused = {this.state.currentKey === 'name'}
                />
                 <FormGroup
                     id = "lastName"
                     value = {this.state.values['lastName']}
                     error={!!this.state.errors['lastName']}
                     message={this.state.errors['lastName'] ? this.state.errors['namlastNamee'] : ''}
                     placeholder = {Translator.get('change_placeholder_lastname', 'Apellido')}
                     onFocused = {() => { this.setState({currentKey: 'lastName'}) }}
                     focused = {this.state.currentKey === 'lastName'}
                />
                 <div className = "force_email">
                   <span className = "text">{Translator.get('change_mandatory_email_disclaimer', 'El correo electrónico es obligatorio')}</span>
                 </div>
                 
                 <div className = "btn">
                    <Button
                     className = "buttonNext"
                     text = {Translator.get('registro_siguiente', 'Siguiente')}
                     onClick={() => {
                         if(this.validateField('email')){
                            this.modifyUser()
                         }
                     }} />
                 </div> 
            </div>
            </div>
        </div>
      </ModalWrapper>);
   }
}

const mapStateToProps = state => {
    return {
      user: state.user
    };
  };
  
export default connect(mapStateToProps, { showModal})(withOnClose(ModalUpdateEmail));
