import React from 'react';
import * as constant from './constants';
import Button from './../Button';
import FormGroup from './../FormGroup';
import ConfirmButtons from './ConfirmButtons';

import Translator from './../../requests/apa/Translator';

import Captcha from './../Captcha';

const ClaroColombiaGate = ({ labels, paywayChange, showDropDown, setCurrentKey, currentValues, errors, onFieldError, onAccept, onCancel, workflowInfo, validateForm }) => {

  const inputDocumentTypeKey = "documentTypeId";
  const inputDocumentTypeDesc = "documentTypeDesc";
  const inputDocument = "document";
  const inputAccount = "account";
  const inputCaptcha = "captcha";

  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span> <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm clarocolombiagate'>
        <div className='row'>
          <Button className={errors[inputDocumentTypeKey] ? 'button error' : 'button'}
            text={currentValues[inputDocumentTypeDesc]}
            iconClassName="icon-arrow-down"
            onClick={() => {
              showDropDown('document')
            }} />

          <FormGroup
            id={inputDocument}
            className="document"
            placeholder={labels.placeHolderDocument}
            value={currentValues[inputDocument]}
            error={errors[inputDocument]}
            message={errors[inputDocument] ? errors[inputDocument] : ''}
            onFocused={() => {
              setCurrentKey(inputDocument);
            }} />
        </div>
        <div className='row'>
          <FormGroup
            id={inputAccount}
            className="account"
            placeholder={labels.placeHolderAccount}
            value={currentValues[inputAccount]}
            error={errors[inputAccount]}
            message={errors[inputAccount] ? errors[inputAccount] : ''}
            onFocused={() => {
              setCurrentKey(inputAccount);
            }} />
        </div>

        <div className='row'>
          <Captcha id={inputCaptcha} value={currentValues[inputCaptcha]} title={labels.captchaTitle}
            error={errors[inputCaptcha]}
            focusedHandler={setCurrentKey} placeHolder={labels.placeHolderCaptcha} />
        </div>
      </div>
      <ConfirmButtons
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors)) {
            onAccept(constant.GETWAY_CLAROCOLOMBIA);
          }
        }}
      />
    </div>

  )
}

export default ClaroColombiaGate
