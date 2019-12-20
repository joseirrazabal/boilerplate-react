import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Metadata from '../../requests/apa/Metadata';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import Device from "../../devices/device";

import './styles/iframe.css';

const ModalIFrame = (props) => {
    //Opciones de scroll
    var height_iframe=getheightIframe(Device.getDevice().getPlatform());

    const defaultTile = 'Claro video - Condiciones de uso para México';        
    let defaultContent = '<div id="div_iframe"><iframe id="ifterms" src="{src}" style="height:{iframe_height}"></iframe></div>';

    //TODO: Esta etiqueta debe traer la url de terminos y condiciones a mostrar, se harcodea hasta que venga.
    //let iFrameurl = Translator.get('ip_telmex_tyc_label2', 'https://www.clarovideo.com/fe/sitesplus/sk_telmex/html/esp/terminos_condiciones.html');

     defaultContent = defaultContent.replace('{src}', 'http://www.clarovideo.com/fe/sitesplus/sk_telmex/html/esp/terminos_condiciones.html');
     defaultContent = defaultContent.replace('{iframe_height}',height_iframe);
    const region = DeviceStorage.getItem('region');

    let messageModal = props.messageModal ? props.messageModal : null;

    let content = defaultContent;
    
    
    if(typeof props.setMetricsEvent === 'function'){
      const sendDimension=()=>{
        const payload=new AnalyticsDimensionSingleton().getPayload();
        props.setMetricsEvent(payload);
        props.setMetricsEvent({ type: 'executor'});
      };
      const sendMetric=()=>{
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'errores',
          eventAction: defaultTile,
          eventLabel: content,
        });
        props.setMetricsEvent({type:'executor'});
        sendDimension();
      };
      sendMetric();
    }

    const getArrows = () => {

     
        function handleClick(val, e) {
            try {
                e.preventDefault();                
                document.getElementById('div_iframe').scrollTop += val;
                
                console.log('==> se ejecuto el evento ...' + val)
            } catch (e) {
                console.log('==> Error :(')
            }
            

        }

        return (
            <div className='arrows'>                
                <a id="upTermAndCond" href="#" className="input-up" onClick={(e) => handleClick(-25, e)}>
                    <i className="fa fa-chevron-up fa-3" aria-hidden="true"></i>
                </a>
                <a id="downTermAndCond" href="#" className="input-down" onClick={(e) => handleClick(25, e)}>
                    <i className="fa fa-chevron-down fa-3" aria-hidden="true"></i>
                </a>
                
            </div>
        );
    }

    function handleOnKeyDown(e) {        
        
        const keys = Device.getDevice().getKeys();
        const currentKey = keys ? keys.getPressKey(e.keyCode) : null;
        let idElement = '';

        if (currentKey === 'UP') {
            e.preventDefault();
            e.stopPropagation();
            idElement = 'upTermAndCond';
            document.getElementById('div_iframe').scrollTop += -25;            
        }
        else if (currentKey === 'DOWN') {
            e.preventDefault();
            e.stopPropagation();
            idElement = 'downTermAndCond';
            document.getElementById('div_iframe').scrollTop += 25;
        }

        let domElement = document.getElementById(idElement);

        if (domElement) {
            domElement.classList.add("activated")
            setTimeout(function () {
                domElement.classList.remove("activated");
            }, 100)
        }
    
    }

    function getheightIframe(platform){
        if(platform==='sony'){
            return '2280%';
        }else if(platform==='tizen'){
            return '2360%';
        }else
            return '2350%';
    }
    
       
    const p = {
        content,
        className: 'iframe',
        buttons: [           
            {
                content: Translator.get('btn_modal_back', 'Volver'),
                props: {
                    onClick: (e) => props.handleClose(e, props.callback),
                    onKeyDown: handleOnKeyDown,
                }
            }
        ],
        children: getArrows(),
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalIFrame);
