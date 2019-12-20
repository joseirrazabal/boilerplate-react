import React from 'react';
import * as constant from './constants';
import HubgateForm from './Hubgate';
import CodigoPromocionalForm from './CodigoPromocional';
import { CreditCardForm, CreditCardStep2Form, CreditCardSavedForm } from './CreditCard';
import { ClaroPagoForm, ClaroPagoStep2Form, ClaroPagoSavedForm } from './ClaroPagos';
import ClaroColombiaGateForm from './ClaroColombiaGate';
import HubCorporativoFijoGateForm from './HubCorporativoFijoGate';
import PinCodeForm from './PinCode';
import HubFacturaFijaGateForm from './HubFacturaFijaGate';
import DeviceStorage from './../DeviceStorage/DeviceStorage';
import Asset from "../../requests/apa/Asset";
import Keyboard from './../Keyboard/Keyboard';
import Button from './../Button';
import ImageButton from './../Button/ImageButton';
import ConfirmButtons from './ConfirmButtons';

import Translator from './../../requests/apa/Translator';

export const LeftPayment = ({ gateway, setTextValue, currentValue, onCancel }) => {

  let cssWidth = gateway === "" ? gateway : "half";

  return (
    <div id='leftPayment' className={cssWidth}>
      {getBtnBack({ showBack: gateway !== "" }, onCancel)}
      <LeftPaymentKeyBoard gateway={gateway} setTextValue={setTextValue} currentValue={currentValue} />
    </div>
  );
};

const LeftPaymentKeyBoard = ({ gateway, setTextValue, currentValue }) => {

  if (gateway !== "")
    return <Keyboard
      currentValue={currentValue}
      onClick={(text) => {
        setTextValue(text);
      }} />;
  else
    return null;
};

export const RightPayment = ({ labels, validations, errors, gateway, workflow, pbi, payway, isSavedPayway,
  onClick, onAccept, onCancel, onStepBack, onFieldError, onCreditCardTypeChange, paywayChange,
  showDropDown, setCurrentKey, setRadioValue, currentValues, currentStep, enableFocused }) => {

  let cssWidth = gateway === "" ? gateway : "half";

  const creditCards = [constant.GETWAY_CREDITCARD, constant.GETWAY_CLAROPAGO];

  return (
    <div id='rightPayment' className={cssWidth}>      

      {!(creditCards.includes(gateway) && currentStep === 0) &&
        <Header pbi={pbi} workflow={workflow} />}
      <Body labels={labels} workflow={workflow} validations={validations}
        onClick={onClick} onFieldError={onFieldError} paywayChange={paywayChange}
        setCurrentKey={setCurrentKey} setRadioValue={setRadioValue}
        gateway={gateway} payway={payway} currentValues={currentValues} pbi={pbi} onAccept={onAccept} onCancel={onCancel} onStepBack={onStepBack} onCreditCardTypeChange={onCreditCardTypeChange}
        errors={errors} showDropDown={showDropDown} currentStep={currentStep} enableFocused={enableFocused} />
    </div>
  );
};

const Header = ({ pbi, workflow }) => {

  const price = pbi ? `${pbi.currency} ${pbi.price}` : '';
  const paymentSubtitleText = () => {
    if (pbi.isRent) {
      return Translator.get('rent_payment_to_rent', 'Estás por alquilar');
    } else if (pbi.isBuy) {
      return Translator.get('rent_payment_to_buy', 'Estás por comprar');
    }
  }
  
  return (
    <div>
      <div className='top'>
        {pbi.isSubscription &&
          <div className='subscription'>
            <div>
              <span className='price'>{`${price}`}</span>&nbsp;
                    <span className='asterisk'>*</span>&nbsp;&nbsp;&nbsp;
                    <span className='plan'>{pbi ? pbi.oneofferdesc : ''}</span>
            </div>
            <div className='row'>
              <span className='note'>{Translator.get('payment_not_ppe_incluided', 'No incluye Pago por evento')}</span>
            </div>
          </div>}
        {!pbi.isSubscription && workflow.contentInfo &&
          <div className='rent'>
            <div className='middle'>
              <img src={workflow.contentInfo.contentImageSmall} alt='' />
            </div>
            <div className='middle'>
              <div className='subtitle'>
              <span>{ paymentSubtitleText() }</span>
              </div>
              <div className='title'>
                <span>{workflow.contentInfo.contentTitle}</span>
              </div>
              <div className='special'>
                <span>{[pbi.currency, <b> {workflow.contentInfo.contentPrice}&nbsp;</b>, Translator.get('payment_tax_include', 'IVA incluido')]}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {pbi.isRent &&
                              <span className='icon-clock'>&nbsp;</span>
                            }
                          {/*
                           * Se elimina la leyenda comprar
                           * https://dlatvarg.atlassian.net/wiki/spaces/RAF/pages/952042537/REQS-3709+Venta+de+series+por+temporada+M+xico+-+Fase+1+MX+-+STV
                          */
                            pbi.isRent && <span className='rentType'>{pbi.oneofferdesc}</span>
                          }
              </div>
            </div>
          </div>
        }
      </div>
      <hr />
    </div>
  );
};


const Body = ({ labels, errors, workflow, validations,
  onClick, onAccept, onCancel, onStepBack, onFieldError, onResendPin, onCreditCardTypeChange,
  showDropDown, setCurrentKey, setRadioValue,
  gateway, payway, paywayChange, currentValues, currentStep, pbi, enableFocused }) => {

  let that = this;

  const getWorkFlowInfo = (gateway) => {

    let _gateway = gateway === constant.GETWAY_PIN ? constant.GETWAY_HUB : gateway;

    for (var i = 0; i < workflow.listBuyLinks.length; i++) {
      if (workflow.listBuyLinks[i].gateway === _gateway) {
        let gatewayinfo = workflow.listBuyLinks[i];
        gatewayinfo.cardNumber = workflow.cardNumber || '';
        gatewayinfo.email = workflow.email || '';
        gatewayinfo.rentaComprobanteMail = workflow.rentaComprobanteMail || '';
        gatewayinfo.rentaDescripcionContent = workflow.rentaDescripcionContent || '';
        gatewayinfo.renttype = workflow.renttype || '';
        gatewayinfo.contentInfo = workflow.contentInfo || {};
        gatewayinfo.statusCreditCard = workflow.statusCreditCard || false;
        return gatewayinfo;
      }
    }
    return {};
  }


  const validateForm = (currentValues, errors, excludeFields = []) => {

    let isValid = true;
    let newErrors = errors;

    for (let field in currentValues) {

      if (excludeFields.indexOf(field) === -1) {
        if (!validateField(field)) {
          isValid = false;
          newErrors[field] = true;
          let message = '';

          switch (field) {
            case 'address':
              message = Translator.get('error_direccion_vacia', 'Debes completar el campo dirección');
              break;
            case 'cardNumber':
            case 'PAN':
              message = Translator.get('invalid_cc_number', 'El número de tarjeta debe ser de 15 o 16 dígitos. Utiliza solo números.');
              break;
            case 'cardType':
              message = Translator.get('invalid_cc_type', 'Elige un tipo de tarjeta');
              break;
            case 'city':
              message = Translator.get('error_ciudad_vacia', 'Debes completar el campo ciudad');
              break;
            case 'dateOfBirth_DD':
            case 'dateOfBirth_MM':
            case 'dateOfBirth_YY':
              message = Translator.get('invalid_birth_date', 'Fecha incorrecta');
              break;
            case 'expiryDate_MM':
            case 'expiryDate_YY':
              message = Translator.get('error_fecha_invalida_tc', 'La fecha de expiración es inválida');
              break;
            case 'name':
              message = Translator.get('error_nombre_vacio', 'Debes completar el campo');
              break;
            case 'securityCode':            
              message = Translator.get('erro_codigo_seg_tc_vacio', 'Código de seguridad invalido');
              break;
            case 'CVV':
              message = Translator.get('error_cvv_invalido', 'CVV inválido');
              break;
            case 'states':
              message = Translator.get('error_estado_vacio', 'Debes seleccionar un estado');
              break;
            case 'telefono':
              message = Translator.get('error_telefono_vacio', 'Ingrese un teléfono válido');
              break;
            case 'zipCode':
              message = Translator.get('invalid_postcode', 'Código postal incorrecto (utiliza sólo números)');
              break;
            case 'codigo':
              message = Translator.get('medio_de_pago_pin_vacio', 'Completa el campo');
              break;
            case 'documentTypeId':
            case 'document':
              message = Translator.get('invalid_document', 'Documento incorrecto');
              break;
            case 'account':
              message = Translator.get('error_cp_vacio', 'Debes completar el campo');
              break;
            case 'captcha':
              message = Translator.get('reminder_captcha_vacio', 'Debes completar el campo');
              break;
            case 'movil':
              message = Translator.get('error_telefono_vacio', 'Ingrese un teléfono válido');
              break;
            case 'pinCode':
              message = Translator.get('medio_de_pago_pin_vacio', 'Completa el campo');
              break;
            case 'numberField':
              message = Translator.get('recibo_telmex_numero_erroneo', 'Número inválido');
              break;
            case 'claveservicio':
            case 'cuentaservicio':
              message = Translator.get('hubfactura_selecciona_servicio_error', 'Debes seleccionar un servicio.');
              break;
            default:
              message = '';
              break;
          }
          newErrors[field] = message;
        }
      }
    }

    onFieldError(newErrors);
    return isValid;

  };

  const validateField = (field) => {
    //let validateGateway = gateway === constant.GETWAY_TELMEX ? constant.GETWAY_HUB : gateway;
    let validateGateway = gateway;

    if (currentValues[validateGateway] && currentValues[validateGateway][field] === '')
      return false;

    if (currentValues[validateGateway]
      && currentValues[validateGateway][field]
      && validations.regexp[validateGateway]
      && validations.regexp[validateGateway][field])
      return validations.regexp[validateGateway][field].test(currentValues[validateGateway][field]);

    return true;
  }

  const workflowInfo = getWorkFlowInfo(gateway);

  const isNoggin = pbi.producttype.indexOf("NOGGIN") !== -1;
  const isCrackle = pbi.producttype.indexOf("CRACKLE") !== -1;
  const nogginNoticeText = Translator.get('subscription_notice_text', 'Servicio con renovación automática.\n' +
    'El costo de la suscripción mensual se verá reflejado en tu factura de Claro.');
  const nogginNotice = (isNoggin || isCrackle) ? <div style={{ marginTop: 20 }}>* {nogginNoticeText}</div> : null;
  
  switch (gateway) {
    case constant.NO_GETWAY:
      return (
        <div className='paymentBody'>
          <div className='title'>
            <span> {Translator.get('payment_select_payway', 'Selecciona tu medio de pago')}</span>
          </div>
          {workflow.listBuyLinks.map((paywayButton, paywayIndex) => {
            const region = DeviceStorage.getItem('region');            
            const changeImageBackground = (selected, status) => {              
              const selector = `#payment #rightPayment a img#${selected}`;
              const imageList = document.querySelectorAll(selector);
              if (imageList && imageList[0]) {
                const imageButton = imageList[0];                
                const gateway = selected;
                const imgAsset = `img_${gateway}_${region}_${status}`;
                const image = Asset.get(imgAsset)

                if (image != imgAsset) {
                  imageButton.src = image;
                }
              }
            };
            const imgAsset = `img_${paywayButton.gateway}_${region}_off`
            const image = Asset.get(imgAsset)            
            const imgSrc = image === imgAsset ? false : image;            
            const className = `button ${imgSrc ? 'gateway' : ''} ${paywayButton.gateway}`;

            return (
              <div className='row'>
                {imgSrc ?
                  <ImageButton
                    imgSrc={imgSrc}
                    className={className}
                    imgId={paywayButton.gateway}
                    imgClassName='gateway'
                    onClick={() => onClick(paywayButton)}                    
                    onFocus={(e) => {
                      changeImageBackground(paywayButton.gateway, 'on');
                    }}
                    onBlur={(e, par) => {
                      changeImageBackground(paywayButton.gateway, 'off')
                    }}                                        
                  /> :
                  <Button className={className} key={paywayIndex} text={paywayButton.gatewaytext} onClick={() => onClick(paywayButton)} />
                }
              </div>
            )
          })}
          <div className='row'></div>

          {pbi && pbi.isSubscription &&
          <div>
              <div className='row'>
                <Button className='button' text={Translator.get('payment_skip_step', 'Saltar este paso')} onClick={() => onClick({
                  gateway: 'saltar'
                })} />
              </div>
          </div>
          }

          {nogginNotice}
        </div>
      );
      break;
    case constant.GETWAY_PROMO:
      return <CodigoPromocionalForm
        labels={labels.promogate}
        validateForm={validateForm}
        paywayChange={paywayChange}
        setCurrentKey={setCurrentKey}
        currentValues={currentValues.promogate}
        errors={errors.promogate}
        onFieldError={onFieldError}
        onAccept={onAccept}
        onCancel={onCancel}
        workflowInfo={workflowInfo}
        enableFocused={enableFocused}
      />;
      break;
    case constant.GETWAY_CREDITCARD:
      if (currentStep === 0) {
        return <CreditCardSavedForm
          labels={labels[gateway]}
          validateForm={validateForm}
          paywayChange={paywayChange}
          setCurrentKey={setCurrentKey}
          currentValues={currentValues[gateway]}
          errors={errors[gateway]}
          onFieldError={onFieldError}
          onAccept={onAccept}
          onCancel={onCancel}
          onCreditCardTypeChange={onCreditCardTypeChange}
          showDropDown={showDropDown}
          workflowInfo={workflowInfo}
          pbi={pbi}
          enableFocused={enableFocused}
        />;
      } else if (currentStep === 1) {
        return <CreditCardForm
          labels={labels[gateway]}
          validateForm={validateForm}
          paywayChange={paywayChange}
          setCurrentKey={setCurrentKey}
          setRadioValue={setRadioValue}
          currentValues={currentValues[gateway]}
          errors={errors[gateway]}
          onFieldError={onFieldError}
          onAccept={onAccept}
          onCancel={onCancel}
          onCreditCardTypeChange={onCreditCardTypeChange}
          showDropDown={showDropDown}
          workflowInfo={workflowInfo}
        />;
      }
      else {
        return <CreditCardStep2Form
          labels={labels[gateway]}
          validateForm={validateForm}
          paywayChange={paywayChange}
          setCurrentKey={setCurrentKey}
          currentValues={currentValues[gateway]}
          errors={errors[gateway]}
          onFieldError={onFieldError}
          onAccept={onAccept}
          onCancel={onCancel}
          onCreditCardTypeChange={onCreditCardTypeChange}
          showDropDown={showDropDown}
          workflowInfo={workflowInfo}
        />;
      }
      break;
    case constant.GETWAY_CLAROPAGO:     
      if (currentStep === 0) {
        return <ClaroPagoSavedForm
          labels={labels[gateway]}
          validateForm={validateForm}
          paywayChange={paywayChange}
          setCurrentKey={setCurrentKey}
          currentValues={currentValues[gateway]}
          errors={errors[gateway]}
          onFieldError={onFieldError}
          onAccept={onAccept}
          onCancel={onCancel}         
          onCreditCardTypeChange={onCreditCardTypeChange}
          showDropDown={showDropDown}
          workflowInfo={workflowInfo}
          pbi={pbi}
          enableFocused={enableFocused}
        />;
      } else if (currentStep === 1) {
        return <ClaroPagoForm
          labels={labels[gateway]}
          validateForm={validateForm}
          paywayChange={paywayChange}
          setCurrentKey={setCurrentKey}
          setRadioValue={setRadioValue}
          currentValues={currentValues[gateway]}
          errors={errors[gateway]}
          onFieldError={onFieldError}
          onAccept={onAccept}
          onCancel={onCancel}
          onCreditCardTypeChange={onCreditCardTypeChange}
          showDropDown={showDropDown}
          workflowInfo={workflowInfo}
        />;
      }
      else {
        return <ClaroPagoStep2Form
          labels={labels[gateway]}
          validateForm={validateForm}
          paywayChange={paywayChange}
          setCurrentKey={setCurrentKey}
          currentValues={currentValues[gateway]}
          errors={errors[gateway]}
          onFieldError={onFieldError}
          onAccept={onAccept}
          onCancel={onCancel}
          onStepBack={onStepBack}
          onCreditCardTypeChange={onCreditCardTypeChange}
          showDropDown={showDropDown}
          workflowInfo={workflowInfo}
        />;
      }
      break;
    case constant.GETWAY_CLAROCOLOMBIA:
      return <ClaroColombiaGateForm
        labels={labels.clarocolombiagate}
        validateForm={validateForm}
        paywayChange={paywayChange}
        showDropDown={showDropDown}
        setCurrentKey={setCurrentKey}
        currentValues={currentValues.clarocolombiagate}
        errors={errors.clarocolombiagate}
        onFieldError={onFieldError}
        onAccept={onAccept}
        onCancel={onCancel}
        workflowInfo={workflowInfo}
      />;
      break;
    case constant.GETWAY_TELMEX:
    case constant.GETWAY_HUB:
    case constant.GETWAY_HUBFIJO:
      return <HubgateForm
        labels={labels[gateway === constant.GETWAY_TELMEX ? gateway : constant.GETWAY_HUB]}
        validateForm={validateForm}
        paywayChange={paywayChange}
        setCurrentKey={setCurrentKey}
        currentValues={currentValues[gateway]}
        errors={errors[gateway === 'telmexmexicogate' ? 'hubgate' : gateway]}
        onFieldError={onFieldError}
        onAccept={onAccept}
        onCancel={onCancel}
        workflowInfo={workflowInfo}
        gateway={gateway}
      />;
      break;
    case constant.GETWAY_PIN:
      return <PinCodeForm
        onResendPin={onResendPin}
        labels={labels.hubgate_pin}
        validateForm={validateForm}
        paywayChange={paywayChange}
        setCurrentKey={setCurrentKey}
        currentValues={currentValues.hubgate}
        errors={errors.hubgate}
        onFieldError={onFieldError}
        onAccept={onAccept}
        onCancel={onCancel}
        workflowInfo={workflowInfo}
      />;
      break;
    case constant.GETWAY_HUBFACTURAFIJA:
      return <HubFacturaFijaGateForm
        labels={labels[gateway]}
        validateForm={validateForm}
        paywayChange={paywayChange}
        setCurrentKey={setCurrentKey}
        currentValues={currentValues[gateway]}
        errors={errors[gateway]}
        onFieldError={onFieldError}
        onAccept={onAccept}
        onCancel={onCancel}
        workflowInfo={workflowInfo}
        gateway={gateway}
      />;
      break;
    case constant.GETWAY_HUBCORPORATIVOFIJOFORM:
      return <HubCorporativoFijoGateForm
        labels={labels.hubcorporativofijogate}
        validateForm={validateForm}
        paywayChange={paywayChange}
        showDropDown={showDropDown}
        setCurrentKey={setCurrentKey}
        currentValues={currentValues.hubcorporativofijogate}
        errors={errors.hubcorporativofijogate}
        onFieldError={onFieldError}
        onAccept={onAccept}
        onCancel={onCancel}
        workflowInfo={workflowInfo}
        gateway={gateway}
      />;
      break;
    default:
      return (
        <div>
          <div className='gatewayTitle'>
            <span>{workflowInfo.gatewaytext}</span>  <Button className='button' text={Translator.get('btn_change_payment', 'Cambiar')} onClick={paywayChange} />
          </div>
        </div>
      );
      break;
  }
};

function getBtnBack(props, goBack) {

  const backText = Translator.get("btn_menu_back", "Volver");

  const btnBack = (
    <div className={`payment-back`}>
      <Button
        text={backText}
        iconClassName="fa fa-undo back"
        onClick={(e) => {
          goBack();
        }}
      />
    </div>
  );

  return props.showBack ? btnBack : null;
}
