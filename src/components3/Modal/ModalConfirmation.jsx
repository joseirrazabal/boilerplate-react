import React from 'react';
import ModalWrapperNew, { withOnClose } from './ModalWrapper';
import CheckCircleOutline from '@material-ui/icons/DeleteSharp';
import { connect } from "react-redux";
import { showButtonOffer } from "../../actions/butttonOffer";
import { playFullMedia } from "../../actions/playmedia";
import { bindActionCreators } from "redux";
import { setResumeData } from "../../actions/resume";
import * as api from "../../requests/loader";
import { showPlayer } from "../../actions/player";
import Translator from "../../requests/apa/Translator";
import Asset from '../../requests/apa/Asset';
import './styles/modalReintento.css';
import Button from "../Button";
const ModalConfirmation = (props) => {
    props.showPlayer(false)
    let groupId = props.offeramco.entry.content_id;
    let tooglePlay = false;
    let is_trailer = false;

    const defaultAsset = Asset.get("net_vcard_renta_exito");
    const asset = props.asset || defaultAsset;

    const p = {
        className: 'retry confirm-buy',
        asset: Asset.get(asset, defaultAsset),
        content: Translator.get("net_compra_exitosa", "Tu compra fue exitosa."),
        buttons: [
            {
                content: Translator.get("net_ver_ahora", "Ver ahora"),
                props: {
                    onClick: async (e) => { 
                        props.showButtonOffer(true)
                        let recommendations = await api.contentRecomendations(groupId);
                        let OfferAMCO_Purchase = await api.GetOffersZUP({ groupId })
                        console.log("OfferAMCO_Purchase_test OfferAMCO_Purchase", OfferAMCO_Purchase)

                        //
                        let info_payway_token;
                        if (typeof OfferAMCO_Purchase === "object") {
                           info_payway_token = OfferAMCO_Purchase.response.offers.filter(e => {
                            if (e.purchase_data.payway_token_play !== undefined) {
                                return e.purchase_data.payway_token_play
                            } else {
                              return e.purchase_data
                            }
                })
                        }
                        
                        //

                     // ACTUALIZAR EL BOTTON
                        function getPlayButton() {
                            let playText = Translator.get("npvr_confirm_play", ".Ver ahora");
                            return <Button
                                className="elementopredeterminado"
                                textBottom={playText}
                                iconClassName={"fa fa-play"}
                                onClick={() => {
                             tooglePlay = !tooglePlay
                            let options={
                              playerstate: "PLAYING",
                              source: {
                                videoid: groupId
                              },
                              size: {
                                top: 0,
                                left: 0,
                                width: 1280,
                                height: 720
                              },
                              ispreview: is_trailer,
                              islive: false,
                              ispip: false,
                              recommendations: recommendations,
                              tooglePlay: tooglePlay,
                            };
                            if (typeof info_payway_token === "object") {
                            console.log("info_payway_token", info_payway_token[0].purchase_data.payway_token_play)
                            options['timeshifttoken']=info_payway_token[0].purchase_data.payway_token_play;
                            localStorage.setItem('payway_token',  options['timeshifttoken'])
                            console.log("info_payway_token 2", options)
                            props.playFullMedia(options);
                            }
                        }}
                 />
                     }

                        let test_resume = props.resume;
                        console.log("test_resume", test_resume.purchaseButtonInfo);
                         test_resume.purchaseButtonInfo = OfferAMCO_Purchase;                   
                         test_resume.playButton = null;
                         test_resume.playButton = getPlayButton()

                          console.log("test_playButton", test_resume.playButton)
                         test_resume.purchaseButtonInfo = OfferAMCO_Purchase;
                         props.setResumeData(test_resume)
                        
                       // IR AL PLAYER
                       if (typeof info_payway_token === "object" && info_payway_token[0].purchase_data !== undefined) {
                       function sendToPlay () {
                        tooglePlay = !tooglePlay
                        let options={
                          playerstate: "PLAYING",
                          source: {
                            videoid: groupId
                          },
                          size: {
                            top: 0,
                            left: 0,
                            width: 1280,
                            height: 720
                          },
                          ispreview: is_trailer,
                          islive: false,
                          ispip: false,
                          recommendations: recommendations,
                          tooglePlay: tooglePlay,
                        };
                        console.log("info_payway_token", info_payway_token[0].purchase_data.payway_token_play)
                        options['timeshifttoken']=info_payway_token[0].purchase_data.payway_token_play;
                        localStorage.setItem('payway_token',  options['timeshifttoken'])
                        console.log("info_payway_token 2", options)
                        
                        return options
                      };

                        
                          let test_prueba_1 =  sendToPlay();
                          
                          props.playFullMedia(test_prueba_1);

                          return props.handleClose(e, props.onReject)    
                    }

                        },
                }
            },
            {
                content: Translator.get("net_ver_mas_tarde", "Ver mas tarde"),
                props: {
                    onClick: async (e) => {
                        props.showButtonOffer(true)
                        let recommendations = await api.contentRecomendations(groupId);
                        let OfferAMCO_Purchase = await api.GetOffersZUP({ groupId })
                        console.log("OfferAMCO_Purchase_test OfferAMCO_Purchase", OfferAMCO_Purchase)
                        let info_payway_token;
                        if (typeof OfferAMCO_Purchase === "object") {
                           info_payway_token = OfferAMCO_Purchase.response.offers.filter(e => {
                            if (e.purchase_data.payway_token_play !== undefined) {
                                return e.purchase_data.payway_token_play
                            } else {
                              return e.purchase_data
                            }
                })
                        }
                        function getPlayButton() {

                            let playText = Translator.get("detail_play", "Ver ahora");
                            return <Button
                                className="elementopredeterminado"
                                textBottom={playText}
                                iconClassName={"fa fa-play"}
                                //colorCode={config_remote_control ? "blue" : null}
                                onClick={() => {
                            console.log("OfferAMCO_Purchase_test init") 
                             tooglePlay = !tooglePlay
                            let options={
                              playerstate: "PLAYING",
                              source: {
                                //videoid: 764423
                                videoid: groupId
                              },
                              size: {
                                top: 0,
                                left: 0,
                                width: 1280,
                                height: 720
                              },
                              ispreview: is_trailer,
                              islive: false,
                              ispip: false,
                              recommendations: recommendations,
                              tooglePlay: tooglePlay,
                            };
                            if (typeof info_payway_token === "object") {
                              console.log("info_payway_token", info_payway_token[0].purchase_data.payway_token_play)
                              options['timeshifttoken']=info_payway_token[0].purchase_data.payway_token_play;
                              console.log("info_payway_token 2", options)
                              props.playFullMedia(options);
                            }
                        }}
                              />
                          }

                        let test_resume = props.resume;
    
                        console.log("test_resume", test_resume.purchaseButtonInfo);
                         test_resume.purchaseButtonInfo = OfferAMCO_Purchase;
                          test_resume.playButton = null;
                          test_resume.playButton = getPlayButton()
                          console.log("test_playButton", test_resume.playButton)
                         test_resume.purchaseButtonInfo = OfferAMCO_Purchase;
                         props.setResumeData(test_resume)
                         return props.handleClose(e, props.onReject)   
                    },
                }
            }
        ]
    }

    return <ModalWrapperNew {...p} />;
}
const mapStateToProps = state => ({ 
    price: state.price.showPriceProps, 
    lastDigits: state.lastDigits.showLastDigitsProps,
    offeramco: state.pay.showPayProps,
    offerzup: state.zuppay.showPayZupProps,
    cardCredit: state.lastDigits.showLastDigitsProps,
    contentGroup: state.contentData.showContentDataProps,
    player: state.player,
    resume: state.resume
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      showButtonOffer,
      playFullMedia,
      setResumeData,
      showPlayer
    },
    dispatch
  );
export default withOnClose(connect(mapStateToProps, mapDispatchToProps)(ModalConfirmation));
