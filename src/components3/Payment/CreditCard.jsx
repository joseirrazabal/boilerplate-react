import React from 'react';
import * as constant from './constants';
import Button from './../Button';
import FormGroup from './../FormGroup';
import ConfirmButtons from './ConfirmButtons';

import DeviceStorage from './../DeviceStorage/DeviceStorage';
import Metadata from '../../requests/apa/Metadata';
import Translator from './../../requests/apa/Translator';

export const CreditCardForm = ({ labels, paywayChange, setCurrentKey, setRadioValue, currentValues, errors, workflowInfo,
  onCreditCardTypeChange, onAccept, onCancel, onFieldError, validateForm,
  showDropDown }) => {

  const inputCardNumber = "cardNumber";
  const radioCardType = "cardType";
  const inputCity = "city";
  const selectDateOfBirth_DD = "dateOfBirth_DD";
  const selectDateOfBirth_MM = "dateOfBirth_MM";
  const selectExpiryDate_MM = "expiryDate_MM";
  const selectExpiryDate_YY = "expiryDate_YY";
  const inputName = "name";
  const inputSecurityCode = "securityCode";
  const selectStates = "states";
  const inputPhone = "telefono";
  const inputZipCode = "zipCode";
  let Months = Metadata.get('months');

  if (Months) {
    Months = JSON.parse(Months);
  }
  if (Months && Months[DeviceStorage.getItem('region')]) {
    Months = Months[DeviceStorage.getItem('region')];
  }
  else {
    Months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  }
  const monthDesc = currentValues[selectExpiryDate_MM] === '' ?
    Translator.get('btn_change_payment', 'Mes') :
    Months[currentValues[selectExpiryDate_MM] - 1];

  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>  <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm creditCard'>
        <div className='row'>
          <FormGroup
            id={inputName}
            value={currentValues[inputName]}
            error={errors[inputName]}
            message={errors[inputName] ? errors[inputName] : ''}
            placeholder={Translator.get('suscripcion_nombre', 'Nombre que figura en la tarjeta')}
            onFocused={() => {
              setCurrentKey(inputName);
            }} />
        </div>
        <div className='row'>
          <FormGroup
            id={radioCardType + 1}
            type='checkbox'
            className={radioCardType}
            value={currentValues[radioCardType] === 1}
            onFocused={() => {
              setRadioValue(radioCardType, 1);
            }} />
          <img className='visamaster' src='/images/visa.png' alt='visa' />
          <FormGroup
            id={radioCardType + 2}
            type='checkbox'
            className={radioCardType}
            value={currentValues[radioCardType] === 2}
            onFocused={() => {
              setRadioValue(radioCardType, 2);
            }} />
          <img className='visamaster' src='/images/mastercard.png' alt='mastercard' />
          <FormGroup
            id={inputCardNumber}
            className={inputCardNumber}
            value={currentValues[inputCardNumber]}
            error={errors[inputCardNumber]}
            message={errors[inputCardNumber] ? errors[inputCardNumber] : ''}
            placeholder={Translator.get('suscripcion_numero_tc', 'Número de tarjeta')}
            onFocused={() => {
              setCurrentKey(inputCardNumber);
            }} />
          <div className={`${radioCardType} ${(currentValues[radioCardType] === '' && errors[radioCardType]) ? 'error' : ''}`} />
          <div className={`form-group-card-type-msg  ${errors[radioCardType] ? 'error' : ''}`}>
            {(currentValues[radioCardType] === '' && errors[radioCardType]) ? errors[radioCardType] : ''}
          </div>


        </div>
        <div className='row'>
          <FormGroup
            className='securityCode'
            id={inputSecurityCode}
            value={currentValues[inputSecurityCode]}
            error={errors[inputSecurityCode]}
            message={errors[inputSecurityCode] ? errors[inputSecurityCode] : ''}
            placeholder={Translator.get('suscripcion_numero_seg_tc', 'Código de seguridad')}
            onFocused={() => {
              setCurrentKey(inputSecurityCode);
            }} />
          <Button
            className={errors[selectExpiryDate_MM] ? 'select error' : 'select'}
            iconClassName="icon-arrow-down"
            text={monthDesc}
            onClick={() => {
              showDropDown(selectExpiryDate_MM)
            }} />
          <Button
            className={errors[selectExpiryDate_YY] ? 'select error' : 'select'}
            iconClassName="icon-arrow-down"
            text={currentValues[selectExpiryDate_YY] === '' ? Translator.get('btn_change_payment', 'Año') : currentValues[selectExpiryDate_YY]}
            onClick={() => {
              showDropDown(selectExpiryDate_YY)
            }} />
        </div>
      </div>
      <ConfirmButtons
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors, ['statesDesc', 'address', 'city', 'dateOfBirth_DD', 'dateOfBirth_MM', 'dateOfBirth_YY', 'states', 'telefono', 'zipCode'])) {
            onAccept(constant.GETWAY_CREDITCARD);
          }
        }}
      />
    </div>

  )
}

export const CreditCardStep2Form = ({ labels, paywayChange, setCurrentKey, currentValues, errors, workflowInfo,
  onCreditCardTypeChange, onAccept, onCancel, onFieldError, validateForm,
  showDropDown, showStates }) => {

  const inputAdress = "address";
  const inputCity = "city";
  const selectDateOfBirth_DD = "dateOfBirth_DD";
  const selectDateOfBirth_MM = "dateOfBirth_MM";
  const selectDateOfBirth_YY = "dateOfBirth_YY";
  const selectStates = "states";
  const inputPhone = "telefono";
  const inputZipCode = "zipCode";
  let Months = Metadata.get('months');

  if (Months) {
    Months = JSON.parse(Months);
  }
  if (Months && Months[DeviceStorage.getItem('region')]) {
    Months = Months[DeviceStorage.getItem('region')];
  }
  else {
    Months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  }
  const monthDesc = currentValues[selectDateOfBirth_MM] === '' ?
    Translator.get('btn_change_payment', 'Mes') :
    Months[currentValues[selectDateOfBirth_MM] - 1];


  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>  <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm creditCard'>
        <div className='row'>
          <FormGroup
            id={inputAdress}
            value={currentValues[inputAdress]}
            error={errors[inputAdress]}
            message={errors[inputAdress] ? errors[inputAdress] : ''}
            placeholder={Translator.get('suscripcion_direccion_tc', 'Dirección')}
            onFocused={() => {
              setCurrentKey(inputAdress);
            }} />
        </div>
        <div className='row'>
          <FormGroup
            id={inputCity}
            className={inputCity}
            value={currentValues[inputCity]}
            error={errors[inputCity]}
            message={errors[inputCity] ? errors[inputCity] : ''}
            placeholder={Translator.get('suscripcion_ciudad', 'Ciudad')}
            onFocused={() => {
              setCurrentKey(inputCity);
            }} />
          <Button
            className={errors[selectStates] ? `select ${selectStates} error` : `select ${selectStates}`}
            text={currentValues[selectStates] === '' ? Translator.get('lbl_Estado', 'Estado') : currentValues['statesDesc']}
            iconClassName="icon-arrow-down"
            onClick={() => {
              showDropDown(selectStates)
            }} />
        </div>
        <div className='row'>
          <FormGroup
            className={inputZipCode}
            id={inputZipCode}
            value={currentValues[inputZipCode]}
            error={errors[inputZipCode]}
            message={errors[inputZipCode] ? errors[inputZipCode] : ''}
            placeholder={Translator.get('suscripcion_cp', 'Código Postal')}
            onFocused={() => {
              setCurrentKey(inputZipCode);
            }} />
          <FormGroup
            className={inputPhone}
            id={inputPhone}
            value={currentValues[inputPhone]}
            error={errors[inputPhone]}
            message={errors[inputPhone] ? errors[inputPhone] : ''}
            placeholder={Translator.get('suscripcion_telefono_tarjeta', 'Teléfono')}
            onFocused={() => {
              setCurrentKey(inputPhone);
            }} />

        </div>
        <div className='row thin'>
          <span>Fecha de nacimiento</span>
        </div>
        <div className='row'>
          <Button
            className={errors[selectDateOfBirth_YY] ? 'select error' : 'select'}
            text={currentValues[selectDateOfBirth_YY] === '' ? Translator.get('btn_change_payment', 'Año') : currentValues[selectDateOfBirth_YY]}
            iconClassName="icon-arrow-down"
            onClick={() => {
              showDropDown(selectDateOfBirth_YY)
            }} />
          <Button
            className={errors[selectDateOfBirth_MM] ? 'select error' : 'select'}
            text={currentValues[selectDateOfBirth_MM] === '' ? Translator.get('btn_change_payment', 'Mes') : Months[currentValues[selectDateOfBirth_MM] - 1]}
            iconClassName="icon-arrow-down"
            onClick={() => {
              showDropDown(selectDateOfBirth_MM)
            }} />
          <Button
            className={errors[selectDateOfBirth_DD] ? 'select error' : 'select'}
            text={currentValues[selectDateOfBirth_DD] === '' ? Translator.get('btn_change_payment', 'Dia') : currentValues[selectDateOfBirth_DD]}
            iconClassName="icon-arrow-down"
            onClick={() => {
              showDropDown(selectDateOfBirth_DD)
            }} />

        </div>
      </div>
      <ConfirmButtons
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors, ['statesDesc'])) {
            onAccept(constant.GETWAY_CREDITCARD);
          }
        }}
      />
    </div>

  )
}

export const CreditCardSavedForm = ({ labels, paywayChange, setCurrentKey, currentValues, errors, workflowInfo, pbi,
  onCreditCardTypeChange, onAccept, onCancel, onFieldError, validateForm,
  showDropDown, enableFocused  }) => {

  const inputSecurityCode = "securityCode";

  return (
    <div>
      <div className='creditCardSubtitle'>
        <span>{`Estás por ${pbi.isSubscription ? 'suscribirte' : pbi.isRent ? 'rentar' : 'comprar'} `}</span>
      </div>
      <div className='creditCardTitle'>
        <span>{!pbi.isSubscription ? workflowInfo.contentInfo.contentTitle : [<b className='credit-card-price'>{`${pbi.currency}${pbi.price}`} </b>, `*${pbi.oneofferdesc}`]}</span>
      </div>
      <div className='creditCardSpecial'>
        <span>{!pbi.isSubscription ? ['$ ', <b> {workflowInfo.contentInfo.contentPrice} &nbsp;</b>, Translator.get('payment_tax_include', 'IVA incluido')] : Translator.get('payments_no_ppe_include', '*No incluye Pago por evento')}</span>
      </div>
      <hr />
      <div className='gatewayForm creditCard small'>
        <div className='row'>
          <span className='highlight'>
            {workflowInfo.gatewaytext}
          </span>
        </div>
        <div className='row thin'>
          <span className='cardNumber label'>Número de tarjeta</span>
        </div>
        <div className='row'>
          <span className='cardNumber info'>{workflowInfo.cardNumber}</span>
          <FormGroup
            className='securityCode right'
            id={inputSecurityCode}
            value={currentValues[inputSecurityCode]}
            error={errors[inputSecurityCode]}
            focused={enableFocused}
            message={errors[inputSecurityCode] ? errors[inputSecurityCode] : ''}
            placeholder={Translator.get('suscripcion_numero_seg_tc', 'Código de seguridad')}
            onFocused={() => {
              setCurrentKey(inputSecurityCode);
            }} />
          {
            pbi.isSubscription &&
            <span className='cardNumber message' dangerouslySetInnerHTML={{ __html: workflowInfo.contentInfo.contentMessage }} />
          }
        </div>
      </div>
      <ConfirmButtons
        okText='Confirmar'
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors, ['address', 'cardNumber', 'cardType', 'city', 'dateOfBirth_DD', 'dateOfBirth_MM', 'dateOfBirth_YY', 'expiryDate_MM', 'expiryDate_YY', 'name', 'states', 'statesDesc', 'telefono', 'zipCode'])) {
            onAccept(constant.GETWAY_CREDITCARD);
          }
        }}
      />
    </div>

  )
}
