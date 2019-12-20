import React from 'react';

import Button from './../Button';

import Translator from './../../requests/apa/Translator';

const ConfirmButtons = ({ okText, cancelText, onAccept, onCancel }) => {

  const btOkText = okText ? okText : Translator.get('btn_confirm_payment_ok', 'Aceptar');
  const btnCancelText = cancelText ? cancelText : Translator.get('btn_confirm_payment_cancel', 'Cancelar');

  return (
    <div className='confirmButtons'>
      <div>
        <Button className='button' text={btnCancelText} onClick={onCancel} />
        <div className='space' />
        <Button className='button' text={btOkText} onClick={onAccept} />
      </div>
      <div className="pay-sure">
        <div className='icon-shield'></div> <span className='ss'> {Translator.get('payment_secure_service', 'SERVICIO SEGURO')}</span>
      </div>
    </div>
  )
}

export default ConfirmButtons
