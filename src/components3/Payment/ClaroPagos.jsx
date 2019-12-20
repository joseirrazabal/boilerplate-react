import React from 'react';
import * as constant from './constants';
import Button from './../Button';
import FormGroup from './../FormGroup';
import ConfirmButtons from './ConfirmButtons';

import DeviceStorage from './../DeviceStorage/DeviceStorage';
import Metadata from '../../requests/apa/Metadata';
import Asset from '../../requests/apa/Asset';
import Translator from './../../requests/apa/Translator';

import Utils from '../../utils/Utils';
import UtilsClaroPagos from "../../utils/payway/claroPagos";

export const ClaroPagoForm = ({ labels, paywayChange, setCurrentKey, setRadioValue, currentValues, errors, workflowInfo,
  onCreditCardTypeChange, onAccept, onCancel, onFieldError, validateForm,
  showDropDown }) => {

  const inputPAN = "PAN";
  const radioCardType = "cardType";
  const inputCity = "city";
  //const selectDateOfBirth_DD = "dateOfBirth_DD";
  //const selectDateOfBirth_MM = "dateOfBirth_MM";
  const selectExpiryDate_MM = "expiryDate_MM";
  const selectExpiryDate_YY = "expiryDate_YY";
  const inputName = "name";
  const inputCVV = "CVV";
  const selectStates = "states_claropagos";
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


  const visaImg = Asset.get('ic_creditcard_visa', '/images/visa.png');
  const mastercardImg = Asset.get('ic_creditcard_mastercard', '/images/mastercard.png');
  const amexImg = Asset.get('ic_creditcard_americanexpress', '/images/amex.png');

  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>  <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm claroPago'>
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
        <div className='row cardType'>
          {UtilsClaroPagos.getCreditCardByRegion().map((item) => {

            const assetName = `ic_creditcard_${item.code}`;
            const asset = Asset.get(assetName, `/images/${item.code}`);

            return (
              <div className='option' >
                <FormGroup
                  id={radioCardType + item.id}
                  type='checkbox'
                  className={radioCardType}
                  value={currentValues[radioCardType] == item.id}
                  onFocused={() => {
                    setRadioValue(radioCardType, item.id);
                  }} />

                <img className={item.code} src={asset} alt={item.code} />
              </div>
            )
          })
          }

          <div className={`footer ${errors[radioCardType] ? 'error' : ''}`}>
            <div className={`line ${(currentValues[radioCardType] === '' && errors[radioCardType]) ? 'error' : ''}`} />
            <div className={`msg  ${errors[radioCardType] ? 'error' : ''}`}>
              {(currentValues[radioCardType] === '' && errors[radioCardType]) ? errors[radioCardType] : ''}
            </div>
          </div>
        </div>

        <div className='row'>
          <FormGroup
            id={inputPAN}
            className={inputPAN}
            value={currentValues[inputPAN]}
            error={errors[inputPAN]}
            message={errors[inputPAN] ? errors[inputPAN] : ''}
            placeholder={Translator.get('suscripcion_numero_tc', 'Número de tarjeta')}
            onFocused={() => {
              setCurrentKey(inputPAN);
            }} />

        </div>

        <div className='row'>
          <FormGroup
            className={currentValues['CVV'] == '' ? 'CVV' : 'CVV security'}
            type='password'
            id={inputCVV}
            value={currentValues[inputCVV]}
            error={errors[inputCVV]}
            message={errors[inputCVV] ? errors[inputCVV] : ''}
            placeholder={Translator.get('suscripcion_cvv_tc', 'CVV')}
            onFocused={() => {
              setCurrentKey(inputCVV);
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
        okText={Translator.get('btn_register_creditcard_next', 'Siguiente')}
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors, ['statesDesc', 'address', 'city', 'dateOfBirth_DD', 'dateOfBirth_MM', 'dateOfBirth_YY', 'states_claropagos', 'telefono', 'zipCode'])) {
            onAccept(constant.GETWAY_CLAROPAGO);
          }
        }}
      />
    </div>

  )
}

export const ClaroPagoStep2Form = ({ labels, paywayChange, setCurrentKey, currentValues, errors, workflowInfo,
  onCreditCardTypeChange, onAccept, onCancel, onStepBack, onFieldError, validateForm,
  showDropDown, showStates }) => {

  const inputAdress = "address";
  const inputCity = "city";
  //const selectDateOfBirth_DD = "dateOfBirth_DD";
  //const selectDateOfBirth_MM = "dateOfBirth_MM";
  //const selectDateOfBirth_YY = "dateOfBirth_YY";
  const selectStates = "states_claropagos";
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
  //const monthDesc = currentValues[selectDateOfBirth_MM] === '' ?
  //  Translator.get('btn_change_payment', 'Mes') :
  //  Months[currentValues[selectDateOfBirth_MM] - 1];


  return (
    <div>
      <div className='gatewayTitle'>
        <span>{workflowInfo.gatewaytext}</span>  <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
      </div>
      <div className='gatewayForm claroPago'>
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
        </div>
        <div className='row'>
          <Button
            className={errors[selectStates] ? `select ${selectStates} error` : `select ${selectStates}`}
            text={currentValues[selectStates] === '' ? Translator.get('lbl_Estado', 'Estado') : currentValues['statesDesc']}
            iconClassName="icon-arrow-down"
            onClick={() => {
              showDropDown(selectStates)
            }} />
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
        </div>
        <div className='row'>
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
      </div>
      <ConfirmButtons
        cancelText={Translator.get('btn_register_creditcard_back', 'Paso anterior')}
        onCancel={() => {
          onStepBack();
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors, ['statesDesc'])) {
            onAccept(constant.GETWAY_CLAROPAGO);
          }
        }}
      />
    </div>

  )
}

export const ClaroPagoSavedForm = ({ labels, paywayChange, setCurrentKey, currentValues, errors, workflowInfo, pbi,
  onCreditCardTypeChange, onAccept, onCancel, onFieldError, validateForm,
  showDropDown, enableFocused }) => {

  const inputSecurityCode = "CVV";

  return (
    <div>
      <div className='claroPagoSubtitle'>
        <span>{`Estás por ${pbi.isSubscription ? 'suscribirte' : pbi.isRent ? 'rentar' : 'comprar'} `}</span>
      </div>
      <div className='claroPagoTitle'>
        <span>{!pbi.isSubscription ? workflowInfo.contentInfo.contentTitle : [<b className='credit-card-price'>{`${pbi.currency}${pbi.price}`} </b>, `*${pbi.oneofferdesc}`]}</span>
      </div>
      <div className='claroPagoSpecial'>
        <span>{!pbi.isSubscription ? ['$ ', <b> {workflowInfo.contentInfo.contentPrice} &nbsp;</b>, Translator.get('payment_tax_include', 'IVA incluido')] : Translator.get('payments_no_ppe_include', '*No incluye Pago por evento')}</span>
      </div>
      <hr />
      <div className='gatewayForm claroPago small'>
        <div className='row'>
          <div className='white-square'>
            <span className='highlight'>
              {workflowInfo.gatewaytext}
            </span>
            <span className='cardNumber info'>{workflowInfo.paymentMethodData &&
              workflowInfo.paymentMethodData.cardsData &&
              workflowInfo.paymentMethodData.cardsData[0] && workflowInfo.paymentMethodData.cardsData[0].pan ? workflowInfo.paymentMethodData.cardsData[0].pan : 'XXXX XXXXX XXXXX 0875'
            }</span>
          </div>
          <div className='normal-square'>
          <FormGroup
            className={currentValues['CVV'] == '' ? 'securityCode right' : 'securityCode right security'}
            type='password'
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
      </div>
      <ConfirmButtons
        okText='Confirmar'
        onCancel={() => {
          onCancel(this);
        }}
        onAccept={() => {
          if (validateForm(currentValues, errors, ['address', 'PAN', 'cardType', 'city', 'dateOfBirth_DD', 'dateOfBirth_MM', 'dateOfBirth_YY', 'expiryDate_MM', 'expiryDate_YY', 'name', 'states_claropagos', 'statesDesc', 'telefono', 'zipCode'])) {
            onAccept(constant.GETWAY_CLAROPAGO);
          }
        }}
      />
    </div>

  )
}
