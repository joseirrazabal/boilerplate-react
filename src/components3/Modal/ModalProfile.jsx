import './styles/social.css';
import React from 'react';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import Metadata from '../../requests/apa/Metadata';
import RequestManager from "../../requests/RequestManager";
// import LogoutTask from '../../requests/tasks/user/LogoutTask'
// import { playFullMedia } from '../../actions/playmedia'; // goose: marcado como que no se usa
// import store from './../../store'; // goose: marcado como que no se usa

import { Logout } from '../../requests/loader'; // opcion de logout

import DeviceStorage from '../../components/DeviceStorage/DeviceStorage'

const doLogout=()=>{

  console.log('[LOGOUT] -- Llamado desde la opcion de logout(!)',)
  Logout();
  return;  

  /**
   * Esta funcion se paso al loader general (!!)
   */
  // const service = new LogoutTask();
  // RequestManager.addRequest(service).then((resp) => {
  //   if (resp.response) {
  //     let ui=DeviceStorage.getItem('__UUID__');
  //     //let xdk = DeviceStorage.getItem('xdk');  //Ahora al hacer logout en aaf La bandera se limpia y redirige una vez mas a XDK
  //     store.dispatch(playFullMedia({ src: null }));
  //     DeviceStorage.clear();
  //     DeviceStorage.setItem('__UUID__', ui);
  //     DeviceStorage.setItem('IsLogOut', true);
  //     //DeviceStorage.setItem('xdk', xdk);
  //     window.location.href='/';
  //     // Youbora
  //     if(window.youboraTrackingPlugin){
  //       if(window.youboraTrackingPlugin.storage){
  //           if(window.youboraTrackingPlugin.storage.removeLocal
  //               && typeof window.youboraTrackingPlugin.storage.removeLocal === "function"){
  //                 window.youboraTrackingPlugin.storage.removeLocal('data');
  //           }
  //           if(window.youboraTrackingPlugin.storage.removeSession
  //               && typeof window.youboraTrackingPlugin.storage.removeSession === "function"){
  //                 window.youboraTrackingPlugin.storage.removeSession('data');
  //           }
  //       }
  //       if(window.youboraTrackingPlugin.restartViewTransform
  //           && typeof window.youboraTrackingPlugin.restartViewTransform === "function"){
  //             window.youboraTrackingPlugin.restartViewTransform();
  //       }
  //       if(window.youboraTrackingPlugin.setOptions
  //         && typeof window.youboraTrackingPlugin.setOptions === "function"){
  //           window.youboraTrackingPlugin.setOptions();
  //       }
  //     };
  //     if(window.youboraAnalyticsPlugin
  //       && window.youboraAnalyticsPlugin.infinity
  //       && typeof window.youboraAnalyticsPlugin.infinity.fireSessionStop === "function"){
  //         window.youboraAnalyticsPlugin.infinity.fireSessionStop();
  //     }
  //   }
  // }).catch((err) => {
  //   console.error(err);
  // });
};

const ModalProfile = (props = {}) => {

  const buttons = [{
    content: Translator.get('btn_modal_cancel', 'Cancelar'),
    props: {
      //onClick: (e) => props.handleClose(e, props.callback('user-settings/idioma')),
      onClick: (e) => props.handleClose(e, props.onRetry),
    }
  }];
/*   if(LogOutButton) {
    buttons.push({
      content: Translator.get('social_close_session', 'Cerrar Sesion'),
      props: {
        onClick: (e) => doLogout(),
      }
    });
  } */
  //let enableAbout = false; // Valor por defecto en caso de no tenerlo definido desde propiedades
  /* if(typeof props.enableAbout != 'undefined' && props.enableAbout !== null){
    enableAbout = props.enableAbout;
  } */

/*   if (enableAbout) {
    buttons.push({
      content: Translator.get('about_card_header', 'Acerca de'),
      props: {
        onClick: (e) => {
          props.handleClose(e, props.callback('about'))
        }
      }
    });
  } */

  /*
   if (props.enableSocialProfile) {
     buttons.unshift({
       content: Translator.get("social_profile_card_header", "Mi Perfil"),
       props: {
         onClick: (e) => {
           props.handleClose(e, props.callback(`socialProfile/${props.gamificationId}`))
         }
       }
     });
   }
  * */

/*   if (props.enableSessionRefresh) {
    buttons.unshift({
      content: Translator.get('btn_session_refresh', 'Refrescar sesión'),
      props: {
        onClick: (e) => {
          props.handleClose(e, props.callback(null, true))
        }
      }
    });
  } */

  let LogOutButton=Metadata.get('is_logout_visible','{"default":true, "argentina":false}');
  LogOutButton=JSON.parse(LogOutButton);
  if(LogOutButton)
  {
    let region= DeviceStorage.getItem('region');
    if(LogOutButton[region]!==undefined)
    {
      LogOutButton=LogOutButton[region];

    }
      else if(LogOutButton['default'])
    {
      LogOutButton=LogOutButton['default'];
    }
    else
      LogOutButton=true;
  }
  if(LogOutButton) {
    buttons.push({
      content: Translator.get('social_close_session', 'Cerrar Sesion'),
      props: {
        onClick: (e) => doLogout(),
      }
    });
  }


    const p = {
      className: 'modal-social',
      buttonsAlign: 'vertical',
      buttons ,
      children: props.children,
    };

    return <ModalWrapper {...p} />;
};

export default withOnClose(ModalProfile);
