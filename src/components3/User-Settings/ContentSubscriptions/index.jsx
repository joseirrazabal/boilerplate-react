import React, { Component } from "react";
import { connect } from "react-redux";

import Subscription from "./subscription";
import Translator from "../../../requests/apa/Translator";
import Utils from "../../../utils/Utils";

import RequestManager from "../../../requests/RequestManager";
import PaywayDataTask from "../../../requests/tasks/payway/PaywayDataTask";
import PBIFromRegisterTask from "../../../requests/tasks/payway/PBIFromRegisterTask";
import UnSuscribe from "./unsubscription";
import Scrollable from './../../Scrollable';


class ContentSubscriptions extends Component {


  constructor(props, context) {
    super(props, context);
    this.processData=this.processData.bind(this);
    this.errorGettingData=this.errorGettingData.bind(this);
    this.state = {
      subscriptions: []
    };
  }


  componentWillMount() {
    let Data = new PaywayDataTask();
    const pbiFromRegisterTask = new PBIFromRegisterTask({object_type:'A'});
    let promisePBI = RequestManager.addRequest(pbiFromRegisterTask);
    promisePBI.then(
      x=> {  this.PBI=x.response;RequestManager.addRequest(Data).then(this.processData).catch(x=>{console.log('error getting PaywayData',x)})}
    ).catch(x=>{
      if(x.code=='already_with_susc')
      {

        RequestManager.addRequest(Data).then(this.processData).catch(x=>{console.log('error getting PaywayData',x)});
      }
      console.log('error en PBI',x);})
  }



  componentDidMount() {

  }

  componentDidUpdate() {
    window.SpatialNavigation.makeFocusable();
  }

  focusHandler(data) {

  }

  processData(data) {

    let myAccount=Utils.getRegionaliazedMetadata('myaccount_configuration',"{\"mexico\":{\"suscription\":[{\"provider\":\"CV_SEMANAL\",\"title\":\"profile_suscription_title\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_weekly\",\"not_purchased\":\"profile_suscription_invite\",\"in_process_canceled\":\"profile_suscription_canceled\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice\",\"not_purchased\":\"profile_suscription_renew_advice\",\"in_process_canceled\":\"profile_suscription_canceled_advice_amco\"},\"cancellation_dialog\":{\"dialog_title\":\"modal_cancel_title_request\",\"dialog_icon\":\"\",\"dialog_description\":\"modal_cancel_body_request\",\"dialog_button_yes\":\"modal_ok_btn_request\",\"dialog_button_no\":\"modal_back_btn_cancel\"}}}},{\"provider\":\"CV_MENSUAL\",\"title\":\"profile_suscription_title\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased\",\"not_purchased\":\"profile_suscription_invite\",\"in_process_canceled\":\"profile_suscription_canceled\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice\",\"not_purchased\":\"profile_suscription_renew_advice\",\"in_process_canceled\":\"profile_suscription_canceled_advice_amco\"},\"cancellation_dialog\":{\"dialog_title\":\"modal_cancel_title_request\",\"dialog_icon\":\"\",\"dialog_description\":\"modal_cancel_body_request\",\"dialog_button_yes\":\"modal_ok_btn_request\",\"dialog_button_no\":\"modal_back_btn_cancel\"}},\"itunesgate\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased\",\"not_purchased\":\"profile_suscription_invite\",\"in_process_canceled\":\"profile_suscription_canceled\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_itunes\",\"not_purchased\":\"profile_suscription_renew_advice_itunes\",\"in_process_canceled\":\"profile_suscription_canceled_advice_amco\"},\"cancellation_dialog\":{\"dialog_title\":\"modal_cancel_title_request\",\"dialog_icon\":\"\",\"dialog_description\":\"modal_cancel_body_request\",\"dialog_button_yes\":\"modal_ok_btn_request\",\"dialog_button_no\":\"modal_back_btn_cancel\"}}}},{\"provider\":\"FOX\",\"keys\":[\"Telmexmexico_abono_FOX\"],\"title\":\"profile_suscription_title_fox\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_fox\",\"not_purchased\":\"profile_suscription_invite_fox\",\"in_process_canceled\":\"profile_suscription_canceled_fox\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_fox\",\"not_purchased\":\"profile_suscription_renew_advice_fox\",\"in_process_canceled\":\"profile_suscription_canceled_advice_fox\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_fox_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_fox_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_fox_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_fox_nobtn\"}}}},{\"provider\":\"FOX\",\"keys\":[\"Telmexmexico_abono_FOX_PLUS\",\"Telmexmexico_abono_FOX_PLUS_PROMO\"],\"title\":\"profile_suscription_title_fox_plus\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_fox_plus\",\"not_purchased\":\"profile_suscription_invite_fox_plus\",\"in_process_canceled\":\"profile_suscription_canceled_fox_plus\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_fox_plus\",\"not_purchased\":\"profile_suscription_renew_advice_fox_plus\",\"in_process_canceled\":\"profile_suscription_canceled_advice_fox_plus\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_fox_plus_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_fox_plus_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_fox_plus_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_fox_plus_nobtn\",\"dialog_button_downsell\":\"profile_cancel_suscription_fox_plus_downsell\",\"key\":\"Telmexmexico_abono_FOX\",\"parameters\":\"forzar_siempre_vis_desde_app=1\"}}}},{\"provider\":\"HBO\",\"title\":\"profile_suscription_title_hbo\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_hbo\",\"not_purchased\":\"profile_suscription_invite_hbo\",\"in_process_canceled\":\"profile_suscription_canceled_hbo\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_hbo\",\"not_purchased\":\"profile_suscription_renew_advice_hbo\",\"in_process_canceled\":\"profile_suscription_canceled_advice_hbo\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_hbo_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_hbo_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_hbo_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_hbo_nobtn\"}}}},{\"provider\":\"NOGGIN\",\"title\":\"profile_suscription_title_noggin\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_noggin\",\"not_purchased\":\"profile_suscription_invite_noggin\",\"in_process_canceled\":\"profile_suscription_canceled_noggin\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_noggin\",\"not_purchased\":\"profile_suscription_renew_advice_noggin\",\"in_process_canceled\":\"profile_suscription_renew_advice_noggin\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_noggin_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_noggin_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_noggin_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_noggin_nobtn\"}}}},{\"provider\":\"CRACKLE\",\"title\":\"profile_suscription_title_crackle\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_crackle\",\"not_purchased\":\"profile_suscription_invite_crackle\",\"in_process_canceled\":\"profile_suscription_canceled_crackle\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_crackle\",\"not_purchased\":\"profile_suscription_renew_advice_crackle\",\"in_process_canceled\":\"profile_suscription_canceled_advice_crackle\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_crackle_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_crackle_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_crackle_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_crackle_nobtn\"}}}}]},\"default\":{\"suscription\":[{\"provider\":\"CV_SEMANAL\",\"title\":\"profile_suscription_title\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_weekly\",\"not_purchased\":\"profile_suscription_invite\",\"in_process_canceled\":\"profile_suscription_canceled\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice\",\"not_purchased\":\"profile_suscription_renew_advice\",\"in_process_canceled\":\"profile_suscription_canceled_advice_amco\"},\"cancellation_dialog\":{\"dialog_title\":\"modal_cancel_title_request\",\"dialog_icon\":\"\",\"dialog_description\":\"modal_cancel_body_request\",\"dialog_button_yes\":\"modal_ok_btn_request\",\"dialog_button_no\":\"modal_back_btn_cancel\"}}}},{\"provider\":\"CV_MENSUAL\",\"title\":\"profile_suscription_title\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased\",\"not_purchased\":\"profile_suscription_invite\",\"in_process_canceled\":\"profile_suscription_canceled\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice\",\"not_purchased\":\"profile_suscription_renew_advice\",\"in_process_canceled\":\"profile_suscription_canceled_advice_amco\"},\"cancellation_dialog\":{\"dialog_title\":\"modal_cancel_title_request\",\"dialog_icon\":\"\",\"dialog_description\":\"modal_cancel_body_request\",\"dialog_button_yes\":\"modal_ok_btn_request\",\"dialog_button_no\":\"modal_back_btn_cancel\"}},\"itunesgate\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased\",\"not_purchased\":\"profile_suscription_invite\",\"in_process_canceled\":\"profile_suscription_canceled\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_itunes\",\"not_purchased\":\"profile_suscription_renew_advice_itunes\",\"in_process_canceled\":\"profile_suscription_canceled_advice_amco\"},\"cancellation_dialog\":{\"dialog_title\":\"modal_cancel_title_request\",\"dialog_icon\":\"\",\"dialog_description\":\"modal_cancel_body_request\",\"dialog_button_yes\":\"modal_ok_btn_request\",\"dialog_button_no\":\"modal_back_btn_cancel\"}}}},{\"provider\":\"FOX\",\"title\":\"profile_suscription_title_fox\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_fox\",\"not_purchased\":\"profile_suscription_invite_fox\",\"in_process_canceled\":\"profile_suscription_canceled_fox\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_fox\",\"not_purchased\":\"profile_suscription_renew_advice_fox\",\"in_process_canceled\":\"profile_suscription_canceled_advice_fox\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_fox_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_fox_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_fox_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_fox_nobtn\"}}}},{\"provider\":\"HBO\",\"title\":\"profile_suscription_title_hbo\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_hbo\",\"not_purchased\":\"profile_suscription_invite_hbo\",\"in_process_canceled\":\"profile_suscription_canceled_hbo\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_hbo\",\"not_purchased\":\"profile_suscription_renew_advice_hbo\",\"in_process_canceled\":\"profile_suscription_canceled_advice_hbo\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_hbo_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_hbo_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_hbo_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_hbo_nobtn\"}}}},{\"provider\":\"NOGGIN\",\"title\":\"profile_suscription_title_noggin\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_noggin\",\"not_purchased\":\"profile_suscription_invite_noggin\",\"in_process_canceled\":\"profile_suscription_canceled_noggin\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_noggin\",\"not_purchased\":\"profile_suscription_renew_advice_noggin\",\"in_process_canceled\":\"profile_suscription_renew_advice_noggin\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_noggin_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_noggin_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_noggin_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_noggin_nobtn\"}}}},{\"provider\":\"CRACKLE\",\"title\":\"profile_suscription_title_crackle\",\"texts\":{\"default\":{\"offer_description\":{\"purchased\":\"profile_suscription_purchased_crackle\",\"not_purchased\":\"profile_suscription_invite_crackle\",\"in_process_canceled\":\"profile_suscription_canceled_crackle\"},\"offer_message\":{\"purchased\":\"profile_suscription_renew_advice_crackle\",\"not_purchased\":\"profile_suscription_renew_advice_crackle\",\"in_process_canceled\":\"profile_suscription_canceled_advice_crackle\"},\"cancellation_dialog\":{\"dialog_title\":\"profile_cancel_suscription_crackle_title\",\"dialog_icon\":\"\",\"dialog_description\":\"profile_cancel_suscription_crackle_desc\",\"dialog_button_yes\":\"profile_cancel_suscription_crackle_ysbtn\",\"dialog_button_no\":\"profile_cancel_suscription_crackle_nobtn\"}}}}]}}");
    let suscFromData=data.response ? data.response:[]
    let suscModules=[];

    if(myAccount && myAccount.suscription)
    {
      myAccount=myAccount.suscription;
    }
    else {
      myAccount = null
    }
    if (myAccount && suscFromData) {
      suscModules = myAccount.reduce((suscs, oferta) => {
        const dataToComponent = oferta;
        dataToComponent.PBI=this.PBI
        suscFromData.forEach(suscripcion => {
          const isClaro = oferta.provider.toLowerCase().indexOf('cv_') >= 0;
          if (oferta.provider == suscripcion.producttype && suscripcion.waspurchase ) {
            if(Array.isArray(oferta.keys)){
              if(oferta.keys.indexOf(suscripcion.key) !== -1){
                dataToComponent.payway = suscripcion;
                //Hard para asegurar que no se muestren 2 ofertas de Claro video
                if (isClaro) suscs = suscs.filter(component => component.props.extradata.provider.toLowerCase().indexOf('cv_') >= 0);

                //Hard para el UnsuscribeDeITunes
                suscs.push(<UnSuscribe key={suscripcion.offer_id} extradata={dataToComponent} user ={{paywayData:suscFromData}} producttype = {suscripcion.producttype} />);
              }
            }else{
              dataToComponent.payway = suscripcion;
              //Hard para asegurar que no se muestren 2 ofertas de Claro video
              if (isClaro) suscs = suscs.filter(component => component.props.extradata.provider.toLowerCase().indexOf('cv_') >= 0);

              //Hard para el UnsuscribeDeITunes
              suscs.push(<UnSuscribe key={suscripcion.offer_id} extradata={dataToComponent} user ={{paywayData:suscFromData}} producttype = {suscripcion.producttype} />);
            }
          } else if (oferta.provider == suscripcion.producttype && !suscripcion.waspurchase) {
            if(Array.isArray(oferta.keys)){
              if(oferta.keys.indexOf(suscripcion.key) !== -1) {
                dataToComponent.selectedOfferid = suscripcion.offer_id;

                if (!(isClaro && suscs.find(component => component.props.extradata.provider.toLowerCase().indexOf('cv_') >= 0))){
                  if (!isClaro && !oferta.default_offer_id) {
                    dataToComponent.default_offer_id = Utils.getExternalProviderOffers(oferta.provider, suscFromData).join(',');
                  }
                  suscs.push(<Subscription key={suscripcion.offer_id} extradata={dataToComponent} user ={{paywayData:suscFromData}} />);
                }
              }
            }else{
              dataToComponent.selectedOfferid = suscripcion.offer_id;

              if (!(isClaro && suscs.find(component => component.props.extradata.provider.toLowerCase().indexOf('cv_') >= 0))){
                if (!isClaro && !oferta.default_offer_id) {
                  dataToComponent.default_offer_id = Utils.getExternalProviderOffers(oferta.provider, suscFromData).join(',');
                }
                suscs.push(<Subscription key={suscripcion.offer_id} extradata={dataToComponent} user ={{paywayData:suscFromData}} />);
              }
            }
          }
        });
        return suscs;
      }, []);
    };


    this.setState({subscriptions:suscModules});
 }
  errorGettingData(error){

  }


  render() {

    if (this.state.subscriptions.length==0){
     return <div className="message-box" dangerouslySetInnerHTML= {{__html:Translator.get('profile_suscription_getting_data','Estamos obteniendo la informacion de tus suscriciones.<br> Por favor ten paciencia.')}}/>
    }

    if (this.state.subscriptions.length> 0) {

      return <Scrollable className="ContentSuscriptions" height={'410px'}>{this.state.subscriptions}</Scrollable>
      return <div className="ContentSuscriptions">{this.state.subscriptions}</div>
    }
  }
}

export default connect(null, {  })(ContentSubscriptions);
