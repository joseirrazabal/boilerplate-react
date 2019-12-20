import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Metadata from '../../requests/apa/Metadata';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import Device from "../../devices/device";

import './styles/termAndCond.css';

const ModalTermAndCond = (props) => {

    const defaultTile = 'Claro video - Condiciones de uso para México';
    const defaultContent = '{"language":{"mexico":"<div class=\"titulo\"><h2> CLAROVIDEO - CONDICIONES DE USO PARA MEXICO </h2></div><div class=\"cuerpo\"><p> Fecha Efectiva: 16 de Noviembre, 2012</p><h3>1. INTRODUCCIÓN AL SERVICIO Y ACEPTACIÓN DE LAS CONDICIONES DE USO.</h3><h3>1.1 Introducción </h3><p>DLA, Inc. (\"DLA\", \"nosotros\"), una compañía debidamente incorporada en el Estado de Delaware de los Estados Unidos de América, ofrece el servicio de video bajo demanda en línea vía streaming (“VOD” por sus siglas en inglés), el cual brinda una selección de películas, programas, videoclips y otros contenidos audiovisuales (de manera conjunta, el \"Contenido\") a través del sitio web www.clarovideo.com (el “Sitio”), nuestro software de reproductor de video para ver el Contenido (el “Reproductor de Video”), y ciertas aplicaciones que le permiten acceder al Contenido (de manera conjunta, el “Servicio” o los “Servicios”). Estos términos y condiciones detallados, que incluyen la Política de Privacidad que se encuentra en <a href=\"https://www.clarovideo.com/politicas_de_privacidad-esp.html\">https://www.clarovideo.com/politicas_de_privacidad-esp.html</a> y la Licencia de Usuario Final (el “LUF”) que se encuentra en <a href=\"https://www.clarovideo.com/licencia_usuario_final-esp.html\">https://www.clarovideo.com/licencia_usuario_final-esp.html</a> (de manera conjunta, las “Condiciones de Uso” o el “Contrato”), regulan el uso de los Servicios (incluyendo el acceso al Contenido), por lo tanto, es importante que los lea y entienda.<br></p><h3>1.2 Aceptación de las Condiciones de Uso</h3><p>Para acceder y disfrutar los Servicios, debe aceptar y en todo momento seguir las disposiciones que se establecen en estos Términos. Al usar los Servicios (incluyendo el acceso al Contenido), usted acepta cumplir con las Condiciones de Uso, por lo que le pedimos dedique un tiempo a revisarlas cuidadosamente, y si no está de acuerdo con las mismas, no debería utilizar el Servicio.<br></p><h3>1.3 Cuenta y Registro</h3><p>DLA requiere que usted se registre para acceder al Servicio. Toda la información de registro que proporcione debe ser exacta y actualizada. Mantenga la confidencialidad de su contraseña. Si revela a otros su contraseña o comparte su cuenta y/o dispositivos con otras personas, deberá asumir toda la responsabilidad derivada de las acciones de dichas personas. Usted es responsable de todo uso en su cuenta, incluyendo el uso no autorizado de terceros, por lo que le pedimos sea muy cuidadoso para proteger la seguridad de su contraseña. Notifíquenos inmediatamente si llega a saber o sospechar de usos no autorizados de su cuenta, a soporte@clarovideo.com. Asimismo, asegúrese de mantener actualizada la información de registro (por ejemplo, dirección de correo electrónico), visitando la página “Mi Cuenta”, por si necesitamos ponernos en contacto con usted. Cuando sea posible, los usuarios de dispositivos públicos o compartidos deben cerrar la cesión al concluir cada visita. Si usted vende o devuelve una computadora o dispositivo, antes deberá cerrar la cesión y desactivar el dispositivo. En caso de no hacerlo, los usuarios posteriores podrían acceder a la información de su cuenta. A fin de facilitarle el acceso a su cuenta y optimizar la administración del Servicio, DLA puede implementar tecnología que nos permita reconocerlo como el titular de la cuenta y darle acceso directo a la misma sin pedirle que vuelva a escribir su contraseña u otras identificaciones de usuario cuando visite nuevamente el Servicio. Usted puede elegir no aprovechar esta característica en su computadora cuando entre al Sitio.<br></p><h3> 1.4 El Servicio</h3><p>Una vez registrado, ofrecemos los servicios de suscripción de VOD disponibles con un catalogo de Contenido para ver libremente, así como servicios transaccionales de VOD a través del cual se puede acceder a un programa individual, mediante el pago de una tarifa individual por dicho programa. Las referencias a los “Servicios” o el “Servicio” a lo largo de estas Condiciones de Uso tienen como finalidad incluir todos los Servicios.</p><h3>2. MODIFICACIÓN DE LAS CONDICIONES DE USO POR DLA</h3><p>DLA puede modificar las Condiciones de Uso (incluyendo la Política de Privacidad y el LUF) en cualquier momento, a su discreción, las cuales surtirán efectos en el momento en que se publiquen las Condiciones de Uso modificadas en nuestro Sitio. La versión más actual de las<br> Condiciones de Uso prevalecerá sobre todas las versiones previas. También se le podría solicitar que confirme y acepte una vez más este Contrato después de la incor…la disposición de Arbitraje seguirá siendo obligatoria para ambas partes.</p><h3>15. DISPOSICIONES GENERALES<br></h3><h3>15.1 Comunicaciones Electrónicas</h3><p><br> Al utilizar el Servicio, usted aprueba recibir comunicaciones electrónicas de DLA, las cuales pueden incluir notificaciones acerca de su cuenta, correos electrónicos de confirmación e información de operaciones de otro tipo, así como información concerniente o relativa a nuestro Servicio, y puede incluir boletines y comunicaciones promocionales de nosotros si usted ha elegido recibirlas durante la subscripción y no ha sido cancelarlas. Usted acuerda que las notificaciones, acuerdos, divulgaciones u otras comunicaciones que le enviemos electrónicamente cumplirán con las disposiciones legales sobre comunicaciones, incluso que sean por escrito; asimismo, acuerda en actualizar su información personal inmediatamente de que haya un cambio en la dirección de su correo electrónico.</p><h3><br> 15.2 Regulaciones de Control de Exportaciones y Control de Activos Extranjeros de Estados Unidos</h3><p>DLA no declara que los materiales incluidos en los Servicios son apropiados o que su uso está disponible en lugares específicos. Quienes elijan acceder a los Servicios lo harán por su propia iniciativa y serán responsables del cumplimiento de todas las leyes aplicables. Usted declara y garantiza que no: (a) se ubica, ni es nacional o residente, de países que están sujetos a<br> sanciones comerciales de EE.UU., o (b) es una persona o entidad incluida en la lista de Nacionales Especialmente Designados y Personas Bloqueadas del Departamento de Tesoro de EE.UU., y que no actúa por cuenta de personas o entidades en esa lista. Usted se obliga a cumplir con todas las leyes aplicables relativas a software y la transmisión de datos técnicos exportados de los Estados Unidos o el país en el que reside.<br></p><h3>15.3 Pruebas del Servicio</h3><p>En cualquier momento, realizamos pruebas de diversos aspectos de nuestro servicio,<br> incluyendo el sitio web, interfaces de usuario, niveles de servicio, planes, promociones, funciones, disponibilidad de películas y programas, entregas y precios, y nos reservamos el derecho a incluirlo o excluirlo de dichas pruebas sin notificación.<br></p><h3>15.4 Integración, Modificación y Divisibilidad</h3><p>Por favor tome en cuenta que estas Condiciones de Uso, incluyendo la Política de Privacidad que se encuentra en <a href=\"https://www.clarovideo.com/politicas_de_privacidad-esp.html\">https://www.clarovideo.com/politicas_de_privacidad-esp.html</a> y el Contrato de<br> Licencia de Usuario Final de DLA que se encuentra en <a href=\"https://www.clarovideo.com/licencia_usuario_final-esp.html\">https://www.clarovideo.com/licencia_usuario_final-esp.html</a> las cuales se incorporan en estos Términos, constituyen el acuerdo legal integro entre usted y DLA y que rigen el uso de los<br> Servicios (incluyendo el uso del Contenido) (pero excluye servicios, si los hubiere, que DLA pudiese proporcionarle conforme a un contrato escrito firmado por separado), y sustituyen en su totalidad cualquier acuerdo previo entre usted y DLA en relación con los Servicios. Estas Condiciones de Uso operan en la medida más amplia permitida por la ley. Si alguna disposición de estos Términos se considera ilícita, nula o inexigible, usted y nosotros convenimos en que dicha disposición se considerará sin efecto y no afectará la validez y exigibilidad de las demás disposiciones de estos Terminos. En caso de terminación, ya sea por usted o por nosotros, las Secciones 1.3, 3.3-3.5, 4.2, 4.5, 5-7, 9.3, 10.3, 11, 12, 14 y 15 de estas Condiciones de Uso prevalecerán y continuarán vigentes.</p><h3>Términos y Condiciones para la promoción 6 meses de Clarovideo incluídos en la compra de un equipo* adquirido en la Tienda Telmex/ Telnor</h3><p>Esta promoción requiere comprar de contado o con financiamiento un equipo participante* en la Tienda Telmex/Telnor. Aplica para clientes Nuevos y existentes de Clarovideo México con cargo a Recibo Telmex/Telnor. Vigencia del 6 de Diciembre 2013 al 7 de Enero de 2014. No incluyen Pago por Evento. Los 6 meses es por el valor de $414 pesos (precio total). Al término de la promoción, se realizará el cargo recurrente de $69 pesos (precio total) al mes al Recibo Telmex/Telnor. No hay plazo forzoso para permanecer con el servicio. Esta promoción no convive con otras promociones de Clarovideo, y no aplica si el cliente tiene la promoción de “12 meses que Telmex paga por ti”<br><br><strong>*Equipo participante: Laptop HP Pavilion SKU:1041152, TV LG Led Direct SKU:1039775, TV Samsung Led SKU:1039783, TV Samsung Led SKU:1039785</strong></p></div>"}}';

    const region = DeviceStorage.getItem('region');

    let messageModal = props.messageModal ? props.messageModal : null;

    let content = Metadata.get('disclaimer', defaultContent);
    content = JSON.parse(content);
    content = content.language[region];

    if(typeof props.setMetricsEvent === 'function'){
      const sendDimension=()=>{
        const payload=new AnalyticsDimensionSingleton().getPayload();
        props.setMetricsEvent(payload);
        props.setMetricsEvent({ type: 'executor'});
      };
      const sendMetric=()=>{
        props.setMetricsEvent({
          hitType: 'event',
          eventCategory: 'errores',
          eventAction: defaultTile,
          eventLabel: content,
        });
        props.setMetricsEvent({type:'executor'});
        sendDimension();
      };
      sendMetric();
    }

    const getArrows = () => {

     
        function handleClick(val, e) {
            e.preventDefault();
            document.getElementsByClassName('modal-content')[0].scrollTop += val;
        }

        return (
            <div className='arrows'>
                <a id="upTermAndCond" href="#" className="input-up" onClick={(e) => handleClick(-25, e)}>
                    <i className="fa fa-chevron-up fa-3" aria-hidden="true"></i>
                </a>
                <a id="downTermAndCond" href="#" className="input-down" onClick={(e) => handleClick(25, e)}>
                    <i className="fa fa-chevron-down fa-3" aria-hidden="true"></i>
                </a>
            </div>
        );
    }

    function handleOnKeyDown(e) {
        
        const keys = Device.getDevice().getKeys();
        const currentKey = keys ? keys.getPressKey(e.keyCode) : null;
        let idElement = '';

        if (currentKey === 'UP') {
            e.preventDefault();
            e.stopPropagation();
            idElement = 'upTermAndCond';
            document.getElementsByClassName('modal-content')[0].scrollTop += -25;            
        }
        else if (currentKey === 'DOWN') {
            e.preventDefault();
            e.stopPropagation();
            idElement = 'downTermAndCond';
            document.getElementsByClassName('modal-content')[0].scrollTop += 25;
        }

        let domElement = document.getElementById(idElement);

        if (domElement) {
            domElement.classList.add("activated")
            setTimeout(function () {
                domElement.classList.remove("activated");
            }, 100)
        }
    
    }
    
       
    const p = {
        content,
        className: 'termAndCond',
        buttons: [           
            {
                content: Translator.get('btn_modal_back', 'Volver'),
                props: {
                    onClick: (e) => props.handleClose(e, props.onShowAcceptTerm),
                    onKeyDown: handleOnKeyDown,
                }
            }
        ],
        children: getArrows(),
    }

    return <ModalWrapper {...p} />;
}

export default withOnClose(ModalTermAndCond);
