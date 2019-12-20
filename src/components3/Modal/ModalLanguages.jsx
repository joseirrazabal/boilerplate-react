import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Asset from '../../requests/apa/Asset';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';

const ModalLanguages = (props = {}) => {
    const defaultAsset = 'https://testcvcdn4-a.akamaihd.net/pregeneracion//cms/apa/531eed59e4b050ea818ae755/SC_Nivel0_EstudianteDeActuacion.png';
    const defaultTile = '¡Éxito!';
    const defaultContent = 'Para continuar selecciona Aceptar';

    const asset = props.asset || defaultAsset;
    const title = props.title || defaultTile;
    const content = props.content || defaultContent;

    let parseButton = [];
    const defaultLanguage = DeviceStorage.getItem('default_lang') || false;
    if(props.languages){
      props.languages.map((it, i) => {
        parseButton.push({
          content: it.label_large,
          selected: defaultLanguage && defaultLanguage == it.option_id ? true : false,
          props: {
            onClick: (e) => props.handleClose(e, props.callback(it)),
          }
        });

      })
    }
    else {
      parseButton.push({ //ToDo Harcodeo para caso de nvrp, ya que getmedia no nos da ningun lenguaje
        content: 'Idioma Original',
        selected: true,
        props: {
          onClick: (e) => props.handleClose(e),
        }
      });
    }

    const p = {
        buttonsAlign: 'vertical',
        buttons: parseButton,
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalLanguages);
