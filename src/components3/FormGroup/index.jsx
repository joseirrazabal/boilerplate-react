import './formGroup.css';
import '../../assets/css/simple-line-icons.css';
import focusSettings from './../Focus/settings';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Keyboard from '../../components/Keyboard/Keyboard';
import Translator from '../../requests/apa/Translator';
import HeaderLogin from '../Auth/HeaderLogin';

const INPUT_TEXT = 'text';
const INPUT_PASSWORD = 'password';
const INPUT_CHECKBOX = 'checkbox';
const INPUT_PASSWORD_HIDEN = 'password_hiden';


class FormGroup extends PureComponent {
  constructor(props) {
    super(props);

    this.firstLoad = false;

    this.state = {
      isHiddenPassword: true
    };
    
    this.handler = this.handler.bind(this);
    this.showPassword = this.showPassword.bind(this);
    this.hidePassword = this.hidePassword.bind(this);
    this.handleHideShowInput = this.handleHideShowInput.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = this.props.value !== nextProps.value || this.props.focused !== nextProps.focused;
    if (shouldUpdate && this.props.onChange) {
      this.props.onChange(nextProps.value);
    }
    return shouldUpdate || this.props.error !== nextProps.error || nextState.isHiddenPassword !== this.state.isHiddenPassword;
  }

  handler() {
    if (this.props.onFocused) {
      this.props.onFocused(this);
    }
    
    
    window.SpatialNavigation.focus('.keyboard .kbd-btn');

  }

  getLabelPassword() {
    return this.props.value.split('').reduce((label, current) => `${label}*`, '');
  }

  showPassword() {
    this.setState({
      isHiddenPassword: false
    });
  }

  hidePassword() {
    this.setState({
      isHiddenPassword: true
    });
  }

  handleHideShowInput() {
    const { value, placeholder } = this.props;
    const { isHiddenPassword } = this.state;

    const classNameGroup = value.length > 0 ? isHiddenPassword ? "form-group-text" : "form-group-text_show" : "form-group-placeholder";
    const classNamePwd = !isHiddenPassword ? "active" : null;
    const textValue = value.length > 0 ? isHiddenPassword ? this.getLabelPassword() : value : `${this.props.focused === true ? value : placeholder}`;
    const textButoon = isHiddenPassword ? Translator.get("register_show_pwd_button_value", "Mostrar") : Translator.get("register_hide_pwd_button_value", "Ocultar");
    const functionHandlePwd = isHiddenPassword ? this.showPassword : this.hidePassword;

    return (
      <React.Fragment>
        <div className={ classNameGroup }>
          { textValue }
        </div>
        <a 
          className={`focusable form-group__button-show-password password-input ${classNamePwd}`}
          href="javascript:void(0)"
          onClick={functionHandlePwd}
        >
          {textButoon}
        </a>
      </React.Fragment>
    );
  }

  renderFakeInput() {
    switch (this.props.type) {
      case INPUT_PASSWORD_HIDEN: 
        return this.handleHideShowInput();
        break;
      case INPUT_TEXT:
        return this.props.value.length
          ? <div className="form-group-text">{this.props.value}</div>
          : <div className="form-group-placeholder">{this.props.focused === true ? this.props.value : this.props.placeholder}</div>
      case INPUT_PASSWORD:
        return this.props.value.length
          ? <div className="form-group-text">{this.getLabelPassword()}</div>
          : <div className="form-group-placeholder">{this.props.placeholder}</div>
      case INPUT_CHECKBOX:
        return <div className={`form-group-checkbox ${this.props.value ? 'checked' : ''}`} />
      default:
        return null;
    }
  }

  render() {
    console.log("focusable_info", this.props.focused)
    if(!this.firstLoad && this.props.focused) {
      this.firstLoad = true;
      this.handler();
    }
    /*if(document.getElementsByClassName('contenidos').length){
      if (this.props.error) {
          document.getElementsByClassName('contenidos')[0].style.display = 'inline-block';
          document.getElementsByClassName('contenidos')[1].style.display = 'inline-block';
      } else {
          document.getElementsByClassName('contenidos')[0].style.display = 'none';
          document.getElementsByClassName('contenidos')[1].style.display = 'none';
      }
    }*/

    console.log("HOLA !!!!!!",this.props.error,'contenidos-'+ this.props.id, this.props.focused)
    console.log("HOLA",document.getElementsByClassName('contenidos-'+this.props.id)[0])

    
    //console.log("HOLA !!!!!!",this.props,'contenidos-'+this.props.id)
    if(document.getElementsByClassName('contenidos-'+ this.props.id).length){
      //console.log("HOLA !!!!!! 2",this.props,'contenidos-'+this.props.id)
      if (this.props.error) {
          document.getElementsByClassName('contenidos-'+ this.props.id)[0].style.display = 'inline-block';
      } else {
          document.getElementsByClassName('contenidos-'+ this.props.id)[0].style.display = 'none';
      }
    }

    
    /*if (this.props.onFocused) {
      document.getElementsByClassName('contenido')[0].style.display = 'none';
      document.getElementsByClassName('contenido')[1].style.display = 'none';
    }*/
    console.log("focused more", this.props.focused)
    return (
      <div
        className={`form-group ${this.props.className}`}
      >
        {
          (this.props.label)
            ? (<div className={`form-group-label label-${this.props.type}`}>{this.props.label}</div>)
            : null
        }
        <a className={(this.props.focused)
          ? `form-group-focus  ${focusSettings.className} form-group-focus-${this.props.type} form-control-focused ${this.props.error && "error"}`
          : `form-group-focus  ${focusSettings.className} form-group-focus-${this.props.type} ${this.props.error && "error"}`
        }
             onClick={this.handler}
             href="javascript:void(0)"
        >
          <div className={`form-group-value form-group-value-${this.props.type} `}>
            {this.renderFakeInput()}
            {
              (this.props.focused)
                ? (<div className="form-group-cursor to-blink" />)
                : null
            }
            {this.props.error && <div className="form-group-message-error ">{this.props.message}</div>}
           
          </div>
        </a>
      </div>
    );
  }
}

FormGroup.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]),
  message: PropTypes.string,
  onFocused: PropTypes.func,
  onChange: PropTypes.func,
  type: PropTypes.string,
  error: PropTypes.bool,
  focused: PropTypes.bool,
};

FormGroup.defaultProps = {
  className: '',
  label: '',
  placeholder: '',
  value: '',
  message: '',
  onFocused: () => { },
  onChange: null,
  type: 'text',
  error: false,
  focused: false,
};

export default FormGroup;

export const withKeyboard = (Component, formValues = {}) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = this.getInitialState();
      this.renderGroup = this.renderGroup.bind(this);
      this.handleErrors = this.handleErrors.bind(this);
      this.resetState = this.resetState.bind(this);
      this.handleFocus = this.handleFocus.bind(this);
      this.setMetricFlag=this.setMetricFlag.bind(this);
      this.getMetricFlag=this.getMetricFlag.bind(this);
    }

    getInitialState() {
      return {
        values: Object.assign({}, formValues),
        currentKey: null,
        errors: {},
        metricFlag: false,

      };
    }

    componentDidMount() {
      this.handleFocus();
    }

    resetState() {
      const state = this.getInitialState();
      this.setState(state);
      this.handleFocus();
    }

    handleFocus() {
   /*   window.SpatialNavigation.add({
        selector: `.form-col-right ${focusSettings.selector}`,
        restrict: 'self-first'
      });*/



      window.SpatialNavigation.makeFocusable();
      const keyValues = Object.keys(this.state.values);
      const firstElement = keyValues.length > 0 ? keyValues[0] : null;
      if (firstElement) {
        this.setCurrentKey(firstElement);
        window.SpatialNavigation.focus('.keyboard .kbd-btn .focusable');
      } else {
        window.SpatialNavigation.focus(`.form-col-right ${focusSettings.selector} .focusable`);
      }
    }

    setTextValue(value = '') {
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

    setCurrentKey(key = '') {
      this.setState({ currentKey: key });
    }

    setCheckBoxValue(key) {
      const values = this.state.values;
      if (values[key] !== undefined) {
        values[key] = !values[key];
        this.setState({ values, currentKey: null });
      }
    }

    renderGroup(id, placeholder, type = 'text', label = null, onChange = () => { }, className) {
      
      return (
        <FormGroup
          id={id}
          placeholder={placeholder}
          onFocused={() => {
            console.warn(`you will write in #${id} component`);
            if (type == INPUT_CHECKBOX) {
              this.setCheckBoxValue(id)
            } else {
              this.setCurrentKey(id);
            }
          }}
          type={type}
          label={label}
          focused={this.state.currentKey === id}
          value={this.state.values[id]}
          error={!!this.state.errors[id]}
          message={this.state.errors[id] ? this.state.errors[id] : ''}
          onChange={onChange}
          className={className}
        />
      );
    }

    handleErrors(errors) {
      this.setState({ errors });
    }

    setMetricFlag(value){
      this.state.metricFlag=value;
    }

    getMetricFlag(){
      return this.state.metricFlag;
    }

    render() {
      return (
        <div className="form-container" >
          {window.location.href.includes("/password-reminder/") === true || window.location.href.includes("/login") === true ? <HeaderLogin title={'Claro'}/>  : null}
          <div className="form-col-top">
            <Component
              {...this.props}
              formValues={this.state.values}
              setCurrentKey={this.setCurrentKey}
              renderGroup={this.renderGroup}
              handleErrors={this.handleErrors}
              handleFocus={this.handleFocus}
              resetValues={this.resetState}
              setMetricFlag={this.setMetricFlag}
              getMetricFlag={this.getMetricFlag}
            />
          </div>
          <div className="form-col-bottom">
              <Keyboard
                currentValue={this.state.values[this.state.currentKey]}
                onClick={(text) => {
                  this.setTextValue(text);
                }}
                setMetricsEvent={this.props.setMetricsEvent}
                setMetricFlag={this.setMetricFlag}
                getMetricFlag={this.getMetricFlag}
              />
          </div>
        </div>
      );
    }
  }
}
