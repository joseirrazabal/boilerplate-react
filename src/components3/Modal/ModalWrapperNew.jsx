import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './styles/wrapper.css';
import { connect } from 'react-redux';
import { SHOW_MODAL, HIDE_MODAL, MODAL_SUCCESS, MODAL_KEYBOARD, MODAL_UPDATE_EMAIL } from '../../actions/modal';
import Scrollable from '../Scrollable';
import FocusSettings from '../Focus/settings';
import Device from "../../devices/device";
import Utils from '../../utils/Utils';


class ModalWrapperNew extends PureComponent {

    constructor(props) {
        super(props);
        this.defaultFocusableSelector = FocusSettings.selector;
        this.prevElementFoucused = { target: null, className: 'modalPrevElementFocused' };
        this.isFirstFocus = true;
        this.buttonsAlign = props.buttonsAlign ? props.buttonsAlign : 'horizontal';
        this.extraClass = props.extraClass ? props.extraClass : '';
        this.keys = Device.getDevice().getKeys();
        this.willUnFocusHandler = this.willUnFocusHandler.bind(this);
        this.handleBackKey = this.handleBackKey.bind(this);
        this.defaultItem = 'modal-default-item';
    }

    willUnFocusHandler({ target }) {
        if (this.isFirstFocus) {
            if (!this.props.alwaysEnabled) {
                target.classList.add(this.prevElementFoucused.className);
            }
            this.prevElementFoucused.target = target;
            this.isFirstFocus = !this.isFirstFocus;
        }
    }

      handleBackKey(e) {
        const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
        console.log('Listening ModalWrapper, currentKey:',currentKey);

        switch(currentKey){
          case "BACK":
            e.preventDefault();
            e.stopPropagation();
            if((Utils.modalType()===MODAL_SUCCESS || Utils.modalType()===MODAL_KEYBOARD)&& !Utils.isModalHide() && Utils.modalFrom()==='payment'){
                if(this.props.buttons[0] && typeof this.props.buttons[0].props.onClick=='function'){
                    this.props.buttons[0].props.onClick();
                }
            }
            if(Utils.modalType() !== MODAL_UPDATE_EMAIL){
                this.props.handleClose(e);
            }
            if(this.props.extraClass &&this.props.extraClass.includes("pinKeyboard") &&
              this.props.buttons && this.props.buttons[0] &&
              this.props.buttons[0].content &&
              this.props.buttons[0].content.includes("Cancelar")
            ){
              this.props.buttons[0].props.onClick && this.props.buttons[0].props.onClick(e);
            }
            break;
          case "UP":
          case "DOWN":
          case "LEFT":
          case "RIGHT":
          case "OK":
          case "ZERO":
          case "ONE":
          case "TWO":
          case "THREE":
          case "FOUR":
          case "FIVE":
          case "SIX":
          case "SEVEN":
          case "EIGHT":
          case "NINE":
              break;
          default:
            e.preventDefault();
            e.stopPropagation();
        }
    }

    componentDidMount() {
        document.addEventListener('sn:willunfocus', this.willUnFocusHandler);
        document.addEventListener('keydown', this.handleBackKey, true);
        window.SpatialNavigation.focus('modal-area');
    }

    componentWillUnmount() {
        document.removeEventListener('sn:willunfocus', this.willUnFocusHandler);
        document.removeEventListener('keydown', this.handleBackKey, true);
        const { className, target } = this.prevElementFoucused;
        if (target) {
            const classToFocus = target.classList.contains('modal-button') ? this.defaultFocusableSelector : `.${className}`;
            window.SpatialNavigation.focus(classToFocus);
            this.prevElementFoucused.target.classList.remove(className);
        } else {
            window.SpatialNavigation.focus(this.defaultFocusableSelector);
        }

    }

    renderButtons(buttons = []) {
        const _this = this;
        return buttons.map(button => {
            const extraClass = button.extraClass ? button.extraClass : '';
            return <a
              style={button.styles}
                className={`modal-button focusable ${extraClass} ${button.selected ? this.defaultItem : ''}`}
                key={button.content}
                {...button.props}
                href="javascript:void(0)"
            >
                {button.content} {button.selected && <i className="fa fa-check" aria-hidden="true" />}
            </a>
        })
    }

    renderOptionalChild(propName, content) {
        const key = propName.split('-')[0];
        if (!key || !this.props[key]) return null;
        return (
            <div key={propName} className={`modal-${propName}`} >
                {content}
            </div>
        )
    }

    getHtml(htmlString = '') {
        const html = htmlString && htmlString.replace(/(<*script )/gi, 'illegalscript');
        return { __html: html };
    }

    render() {

        const content = [];
        const type =typeof this.props.content;
        content.push(this.renderOptionalChild('asset', <img src={this.props.asset} alt={this.props.asset} />));
        content.push(this.renderOptionalChild('title', <h3 dangerouslySetInnerHTML={this.getHtml(this.props.title)} />));
        const replaces = this.props.replaces;
        // Optimizar el replace, independiente de si viene o no un mensaje largo (en texto)
        let msg = this.props.content;
        let urlRegExp = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)/;
        let containsMail = false;
        let dataMail;
        let acronym = /[A-Z]{1}[.][A-Z]{1}[.]/;

        if (type == "string" && this.props.content.includes(".") && this.props.content.length > 60 && !urlRegExp.test(this.props.content) && !acronym.test(this.props.content)) {
            
            containsMail = Utils.checkIfEmailInString(msg);
            //Primero validamos si existe un email dentro del msg
            if(containsMail){
                // Extraemos el email y lo guardamos temporalmente
                dataMail =  Utils.extractEmails(msg);
                // Reemplazamos por un valor generico para que el resto del proceso haga los saltos de linea si contiene puntos
                msg = msg.replace(/[a-zA-Z0-9-_.]+@[a-zA-Z0-9-_.]+/,'{@EMAIL}');
            }
            
            // Antes del reemplazo, se hacen los saltos de línea
            msg = msg.split(".").join(". <br/>");

            // Si el modal no contiene replaces pero el mensaje contiene email, se reeemplaza el valor de mail.
            if(containsMail){
                // Cerificamos que exista el valor y sea un array para poder hacer split
                if(dataMail && (dataMail instanceof Array)){
                    msg = msg.replace('{@EMAIL}',dataMail.join('')); 
                }
            }

            // Luego el reemplazo
            if(replaces) {
                for(var i in replaces) {
                    msg = msg.replace(i, replaces[i]);
                }
            }
            content.push(this.renderOptionalChild('content', <p dangerouslySetInnerHTML={this.getHtml(msg)} />));
        }
        else {
            // Si le length no es demasiado, pero aún viene con replaces
            if(replaces) {
                for(var i in replaces) {
                    msg = msg.replace(i, replaces[i]);
                }
            }
            content.push(this.renderOptionalChild('content', <p dangerouslySetInnerHTML={this.getHtml(msg)} />));
        }

        if (this.props.children) content.push(<div className="modal-children" style={{width: '70%'}} key={this.props.children} >{this.props.children}</div>);
        content.push(this.renderOptionalChild(`buttons-${this.buttonsAlign} ${this.extraClass}`, this.renderButtons(this.props.buttons)));

        return (
            <div className="modal-overlay">
                <div className={`modal-container-new ${this.props.className}`}>
                    {this.props.image}
                    {content} 
                </div>
            </div>
        )
    }
}

ModalWrapperNew.propTypes = {
    asset: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes,
    image: PropTypes.object,
    replaces: PropTypes.object,
    buttons: PropTypes.array,
    className: PropTypes.string,
}

ModalWrapperNew.defaultProps = {
    className: '',
    replaces: null,
    image: null
}

const closeable = (ModalComponent) => {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.handleClose = this.handleClose.bind(this);
            this.handleSecondModal = this.handleSecondModal.bind(this);
        }
        handleClose(e, cb) {
            e && e.preventDefault();
            this.props.dispatch({ type: HIDE_MODAL });
            if (typeof cb === 'function') return cb(this);
        }
        handleSecondModal(e, modal, props) {
            e.preventDefault();
            this.props.dispatch({ modalType: modal, type: SHOW_MODAL, modalProps: props });
        }
        render() {
            return <ModalComponent {...this.props} handleClose={this.handleClose} handleSecondModal={this.handleSecondModal}/>
        }
    }
}
const mapStateToProps = state => ({ 
    subcriptions: state.subscriptions.showSubscriptionsProps
});
export const withOnClose = (component) => connect(mapStateToProps, null)(closeable(component));
export default withOnClose(ModalWrapperNew);
