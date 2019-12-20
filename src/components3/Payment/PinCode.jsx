import React from 'react';
import * as constant from './constants';
import Button from './../Button';
import FormGroup from './../FormGroup';
import ConfirmButtons from './ConfirmButtons';

import Translator from './../../requests/apa/Translator';

const PinCode = ({ onResendPin, currentValues, errors, workflowInfo, onFieldError, onCancel, onAccept, validateForm, setCurrentKey }) => {

  const inputPinCode = "pinCode";
  setCurrentKey(inputPinCode);

  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>
      </div>
      <div className='row'>
        <span className='left'>Hemos enviado un mensaje de texto a tu celular con tu código</span>
      </div>
      <div className='gatewayForm'>
        <div className='row'>
          <FormGroup
            id={inputPinCode}
            value={currentValues[inputPinCode]}
            error={errors[inputPinCode]}
            message={errors[inputPinCode] ? errors[inputPinCode] : ''}
            placeholder={Translator.get('validar_telefono_hubgate_ingresepin', 'Ingresar PIN de autorización')}
            onFocused={() => {
              setCurrentKey(inputPinCode);
            }} />
        </div>
        <div className='row gray'>
          <span> Si aun no recibes el PIN, podemos enviártelo nuevamente </span>
          <Button className='button' text='Enviar PIN' onClick={() => {
            onAccept(constant.GETWAY_SENDPIN);
          }} />
        </div>
      </div>
      <ConfirmButtons
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors)) {
            //TODO:REVISAR ESTE FLUJO constant.GETWAY_HUB
            onAccept(constant.GETWAY_HUB);
          }
        }}
      />
    </div>
  )
}

export default PinCode
