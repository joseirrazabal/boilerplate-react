import './planSelector.css'
import '../../assets/css/simple-line-icons.css';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Asset from './../../requests/apa/Asset';
import Metadata from '../../requests/apa/Metadata';
import Translator from './../../requests/apa/Translator';

import focusSettings from './../Focus/settings';

import RequestManager from '../../requests/RequestManager';
import PBIFromRegisterTask from '../../requests/tasks/payway/PBIFromRegisterTask';

import Button from './../Button';
import Card from './../Card';

import Spinner from '../../components/Spinner';

import Utils from "../../utils/Utils";

import Device from "../../devices/device";

import ModalConductor from '../../containers/Modal';
import { showModal, MODAL_ERROR, MODAL_SUCCESS} from '../../actions/modal';
import { connect } from 'react-redux';
import {setMetricsEvent} from "../../actions/metrics";
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import LayersControl from "../../utils/LayersControl";

class PlanSelector extends Component {
    constructor(props) {
        super(props);

        let purchase = {
            count: 0,
            url: "http://microfwk-tv2sony.clarovideo.net/services/payway/workflowstart?object_type=A",
        }

        this.purchase = purchase;
        this.state = {
            isLoading: false,
            list: []
        }
        this.keys = Device.getDevice().getKeys();
        this.onClick = this.onClick.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keypress', this.keyPressHandler, false); //Listener
        window.SpatialNavigation.makeFocusable();
        let that = this;
        let promisePBI;

        let requets = Utils.getRequest(this.purchase.url);
        const pbiFromRegisterTask = new PBIFromRegisterTask(requets.params);
        promisePBI = RequestManager.addRequest(pbiFromRegisterTask);

        promisePBI.then(function (res) {            
            that.setState(
                {
                    isLoading: false,
                    list: res.response.listButtons ? res.response.listButtons.button : [],
                });
        }, function (err) {
            that.setState({ isLoading: false });
            if (err.message) {
                const modal = {
                    modalType: MODAL_ERROR,
                    modalProps: {
                        callback: () => {
                            //that.props.history.goBack();
                        },
                        content: err
                    }
                }
                that.props.showModal(modal);
            }
        });

    }

    onClick(pbi) {
        this.sendMetric(pbi.oneofferdesc);
        let requets = Utils.getRequest(pbi.linkworkflowstart);
        // Si se cambia el default de abajo, group_id = 0, 
        // cambiarlo también en Payment/index > redirectSuscription method
        let groupid = requets.params.group_id ? requets.params.group_id : '0';
        let offerid = requets.params.offer_id ? requets.params.offer_id : '0';

        this.props.history.push(`/payment/${groupid}/${offerid}`, pbi);
    }

    sendDimension(){
      const payload=new AnalyticsDimensionSingleton().getPayload();
      this.props.setMetricsEvent(payload);
      this.props.setMetricsEvent({ type: 'executor'});
    }

    sendMetric(label){
      if(typeof this.props.setMetricsEvent==='function'){
        this.props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'registro',
          eventAction: 'seleccion de plan',
          eventLabel: label,
        });
        this.props.setMetricsEvent({ type: 'executor'});
        this.sendDimension();
      }
    }

    /*
        Nota: Retirar el siguiente handler componentWillUnmount lifecycle y Listener de la linea 49
              Si hay alguna falla respecto al bloqueo de la tecla 'BACK'
    */

    keyPressHandler = (e) => {
      if(LayersControl.isPlayerVisible())
        return;
        e.preventDefault();
        const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
        console.log('Listening PlanSelector, currentKey:',currentKey);
            switch (currentKey) {
                case 'BACK':
                    return false;
                break;
                default:
                break;
            }
    };

    componentWillUnmount() {
        document.removeEventListener('keypress', this.keyPressHandler, false);
    }

    textButton(text, price){
        return <span className="text-span-content"><span className="text">{text}</span><span className="price">{price}</span></span>;
    }

    render() {
        if (this.state.isLoading) return <Spinner visible={true} />;
        const defaultAsset = 'data:;base64,RXN0YSBlcyBsYSBub3RhIGRlIGVzdGEgcOFnaW5h';
        return(
            <div id='planSelector'>
                <div className='container'>
                <div className='row'>
                    <div className='title'>
                          {Translator.get('suscripcion_plan_titulo', 'Selecciona tu plan')}
                    </div>
                </div>
                {this.state.list.length > 0 && this.state.list.map((pbi, rowIndex) => {

                        let btnTxtIzq = pbi.producttype ? pbi.producttype.indexOf("CV_") !== -1 ? pbi.oneofferdesc : pbi.oneofferdesc.split(" ")[0] : '';

                        let btnCurrency = pbi.currency ? pbi.currency : '';
                        let btnPrice = pbi.price ? pbi.price : '';

                        let assetName = `${pbi.bannerpromo && pbi.bannerpromo !== ''? pbi.bannerpromo : ''}_planselector`;

                        let textButton = this.textButton(btnTxtIzq, btnCurrency + btnPrice);
                    return (
                        <div className='row'>
                            <div className='col'>
                                <div className='item'>
                                    <Card
                                        id={rowIndex}
                                        cover={Asset.get(assetName, `/images/${pbi.producttype}.PNG`)}
                                        focusHandler={() => {
                                            console.log('focusHandler ...');
                                        }}
                                        focusable={false}
                                        clickHandler={() => {

                                            const modal = {
                                                modalType: MODAL_SUCCESS,
                                                modalProps: {
                                                    callback: () => {
                                                        console.log('=> Close modal ....');
                                                    },
                                                    content: pbi.producttype
                                                }
                                            }

                                            //this.props.showModal(modal);
                                        }
                                        }

                                    />
                                    <Button className='button'
                                        text={textButton}
                                        onClick={() => {
                                        this.onClick(pbi)
                                    }} />
                                </div>
                            </div>
                        </div>
                    )
                })}
              </div>
          </div>
        )
    }
}

export default connect(null, { showModal,setMetricsEvent })(withRouter(PlanSelector))
