import React from 'react';

import Button from './../Button';
//import FormGroup from './../FormGroup';
import ConfirmButtons from './ConfirmButtons';

import Translator from './../../requests/apa/Translator';

const HubCorporativoFijoGate = ({ labels, paywayChange, setCurrentKey, currentValues, onAccept, onCancel, onFieldError, errors, workflowInfo, gateway, validateForm }) => {

  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>
        <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm hubcorporativofijogate'>
        <div className='row'>
          <span className='description'>
            {labels.description}
          </span>
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

export default HubCorporativoFijoGate
