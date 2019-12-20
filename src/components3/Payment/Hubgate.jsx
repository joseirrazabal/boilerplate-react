import React from 'react';
import * as constant from './constants';
import Button from './../Button';
import FormGroup from './../FormGroup';
import ConfirmButtons from './ConfirmButtons';

import DeviceStorage from './../DeviceStorage/DeviceStorage';
import Metadata from '../../requests/apa/Metadata';
import Translator from './../../requests/apa/Translator';

import UtilsPagos from "../../utils/payway/UtilsPagos";

const Hubgate = ({ labels, paywayChange, setCurrentKey, currentValues, onAccept, onCancel, onFieldError, errors, workflowInfo, gateway, validateForm }) => {

  const inputDocument = "document";
  const inputMovil = gateway === "hubfijogate" ? "numberField" : "movil";
  

  const hasDocument = UtilsPagos.hasDocument(gateway);

  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>  <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm'>
        {(hasDocument) &&
          <div className='row'>
            <FormGroup
              id={inputDocument}
              value={currentValues[inputDocument]}
              error={errors[inputDocument]}
              message={errors[inputDocument] ? errors[inputDocument] : ''}
              placeholder={labels.placeHolderDocument}
              onFocused={() => {
                setCurrentKey(inputDocument);
              }} />
          </div>
        }
        <div className='row'>
          <FormGroup
            id={inputMovil}
            value={currentValues[inputMovil]}
            error={errors[inputMovil]}
            message={errors[inputMovil] ? errors[inputMovil] : ''}
            placeholder={labels.placeHolderMovil}
            onFocused={() => {
              setCurrentKey(inputMovil);
            }} />
        </div>
      </div>
      <ConfirmButtons
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors, hasDocument ? ['pinCode'] : ['pinCode', inputDocument])) {
            onAccept(gateway);
          }
        }}
      />
    </div>
  )
}
export default Hubgate
