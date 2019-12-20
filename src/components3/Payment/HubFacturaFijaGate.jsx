import React from 'react';

import Button from './../Button';
import FormGroup from './../FormGroup';
import ConfirmButtons from './ConfirmButtons';

import Translator from './../../requests/apa/Translator';

const HubFacturaFijaGate = ({ labels, paywayChange, setCurrentKey, currentValues, onAccept, onCancel, onFieldError, errors, workflowInfo, gateway, validateForm }) => {

  const inputClave = "claveservicio";
  const inputCuenta = "cuentaservicio";

  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>  <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm'>
        <div className='row'>
          <FormGroup
            id={inputCuenta}
            value={currentValues[inputCuenta]}
            error={errors[inputCuenta]}
            message={errors[inputCuenta] ? errors[inputCuenta] : ''}
            placeholder={labels.placeHolderCuenta}
            onFocused={() => {
              setCurrentKey(inputCuenta);
            }} />
        </div>
        <div className='row'>
          <FormGroup
            id={inputClave}
            type='password'
            value={currentValues[inputClave]}
            error={errors[inputClave]}
            message={errors[inputClave] ? errors[inputClave] : ''}
            placeholder={labels.placeHolderClave}
            onFocused={() => {
              setCurrentKey(inputClave);
            }} />
        </div>
      </div>
      <ConfirmButtons
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors, [])) {
            onAccept(gateway);
          }
        }}
      />
    </div>
  )
}

export default HubFacturaFijaGate
