import React, { Component } from 'react';
import { connect } from 'react-redux';
import RequestManager from "../../../requests/RequestManager";
import ModalConductor from '../../../containers/Modal';
import ButtonComponent from '../../../components/Button';
import { showModal, MODAL_LANGUAGES } from '../../../actions/modal';
import focusSettings from "../../Focus/settings";
import storage from '../../DeviceStorage/DeviceStorage';
import Device from "../../../devices/device";
import Translator from "../../../requests/apa/Translator";

class ContentLanguage extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
            options: []
        }
    this.jsonLangs=[
        {
          label_large: Translator.get('subtitled_in_spanish', 'Subtitulada al español'),
            option_id:"S-ES",
        },
        {
          label_large: Translator.get('subtitled_in_portuguese', 'Subtitulada al portugués'),
          option_id:"S-PT",
        },
        {
          label_large: Translator.get('original_language', 'Idioma Original'),
          option_id:"Ori",
        },
        {
          label_large: Translator.get('portuguese_language', 'Doblada al portugués'),
          option_id:"D-PT",
        },
        {
          label_large: Translator.get('spanish_language', 'Doblada al español'),
          option_id:"D-ES",
        }
    ];
        this.device = Device.getDevice().getPlatform();
        this.focusHandler = this.focusHandler.bind(this);
    }

    componentWillMount() {
        const that = this;
        let option,
            value;
//        RequestManager.addRequest(this.rememeberRequest).then((resp) => {
//            if (resp.response.groups) {
//                this.setState({data: JSON.parse(JSON.stringify(resp.response.groups))});
//            }
//        }).catch((err) => {
//            console.error(err);
//        });
        if (storage.getItem('default_lang')) {
            value = storage.getItem('default_lang');
        }

      if(!value || value && value.indexOf('O-')>-1) {
        storage.setItem('default_lang','Ori');
        value = 'Ori';
      }

      this.jsonLangs.map((json)=>{
            if (json.option_id == value) {
                that.setState({options: {option: json.label_large, value: json.option_id}});
            }
        });
    }

    componentDidMount() {
        window.SpatialNavigation.makeFocusable();
    }

    focusHandler(data) {
    }

    stateHandler(value) {
        const that = this;
//        RequestManager.addRequest(this.rememeberRequest).then((resp) => {
//            if (resp.response.groups) {
//                this.setState({data: JSON.parse(JSON.stringify(resp.response.groups))});
//            } else{
//                this.setState({data: []});
//            }
//        }).catch((err) => {
//            console.error(err);
//        });

        this.jsonLangs.map((json)=>{
            if (json.option_id == value.option_id) {
              storage.setItem('default_lang',json.option_id);
                that.setState({options: {option: json.label_large, value: json.option_id}});
            }
        });
    }

    keyActions(key) {
        const showModal = this.props.showModal;
        const modal =  document.getElementsByClassName('modal-overlay');

        switch (key) {
            case 'OK':
                if (modal.length === 0) {
                    console.log('muestra modal')
                    showModal({ modalType: MODAL_LANGUAGES, modalProps: { languages: this.jsonLangs, type: 'lang', callback: (a) => { this.stateHandler(a) } } });
                }
                break;
        }
    }

    render() {
        this.focusable = typeof this.focusable === "undefined" ? true : this.focusable;
        return(
            <div id="" className="ContentLanguage">
                <p>{ this.props.text }</p>
                <small>{this.props.notApply}</small>
                <div className="fromVMenu frameLanguage">

                   <div className="content">
                     {/* {Translator.get('choose_language_settings', 'Seleccione su idioma')} */}
                        <ButtonComponent href="javascript:void(0)" 
                        width={250}
                        onClick={ ()=>{ this.keyActions('OK') } } 
                        id="language-button" 
                        className={`fromVMenu ${this.focusable
                        ? focusSettings.className
                        : ""}`}
                        text={this.state.options.option}
                        >
                            {/* { this.state.options.option } <i className="fa fa-angle-down fa-lg" aria-hidden="true"></i> */}
                        </ButtonComponent>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(null,{showModal})(ContentLanguage);
