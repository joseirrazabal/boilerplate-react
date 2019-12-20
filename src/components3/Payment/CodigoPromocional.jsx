import React from 'react';
import * as constant from './constants';
import Button from './../Button';
import FormGroup from './../FormGroup';
import ConfirmButtons from './ConfirmButtons';

import Translator from './../../requests/apa/Translator';

const CodigoPromocional = ({ labels, paywayChange, onCancel, setCurrentKey, errors, onFieldError, currentValues, onAccept, workflowInfo, validateForm, enableFocused }) => {

  const inputPromoCodeId = "codigo";

  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>  <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm promoGate'>
        <FormGroup
          id={inputPromoCodeId}
          value={currentValues[inputPromoCodeId]}
          error={errors[inputPromoCodeId]}
          message={errors[inputPromoCodeId] ? errors[inputPromoCodeId] : ''}
          placeholder={labels.placeHolderPromoCode}
          onFocused={() => {
            setCurrentKey(inputPromoCodeId);
          }}
          focused={enableFocused}
        />
      </div>
      <ConfirmButtons
        okText='Confirmar'
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors)) {
            onAccept(constant.GETWAY_PROMO);
          }
        }}
      />
    </div>

  )
}

export default CodigoPromocional
