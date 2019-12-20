import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';

import storage from '../DeviceStorage/DeviceStorage';
import Device from "../../devices/device";


const ModalAccionesLenguaje = (props) => {
    let arrayButtons = [];

    const defaultLanguage = storage.getItem('default_lang') || false;
    const title = props.title || '';
    const content= props.content || '';
    props.options.map(function(json){
      const content = Translator.get(
        json.option,
        `${json.acronym} - ${json.option}`
      );
        arrayButtons.push({
            content,
            selected: json.active ? true : false,
            props: {
                onClick: (e) => {
                    switch (props.type) {
                        case 'lang':
                            storage.setItem('default_lang', json.value);
                            break;
                        case 'class':
                            console.log('le di click a', json.value);
                            break;
                    }
                    if(props.type !== 'lang') {
                        props.handleClose(e, props.service(json.value));
                    }
                    else {
                        props.handleClose(e, props.service(json.value));
                    }
                }
            }
        });
    });
    arrayButtons.push({
      content: 'Cerrar',
      props: {
        //enlazar acción a ver contenido
        onClick: (e) => props.handleClose(e,)
      }
    });


    const closeApp = () => {
        const system = Device.getDevice().getSystem();
        console.warn('Attemping to close the app...');
        system.exit();
    }

    const p = {
        buttonsAlign: 'vertical',
        buttons: arrayButtons,
        scrollable: props.scrollable ? props.scrollable : false,
        title: title,
        content:content,
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalAccionesLenguaje);
