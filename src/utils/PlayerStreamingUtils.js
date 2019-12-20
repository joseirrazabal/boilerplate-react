import Device from './../devices/device';
import settings from './../devices/all/settings';
import store from '../store';
import Utils from './../utils/Utils';
import * as playerConstant from './../utils/playerConstants';
import ChannelSingleton from "../components/Epg/ChannelsSingleton";
import * as api from "../requests/loader";
import Translator from "../requests/apa/Translator";
import {HIDE_MODAL, MODAL_ACTION, showModal} from "../actions/modal";
import LayersControl from "./LayersControl";
import Metadata from '../requests/apa/Metadata';
import m from 'moment';
import storage from '../components/DeviceStorage/DeviceStorage';
import {AAFPLAYER_STOP} from '../AAFPlayer/constants'
import {playFullMedia} from "../actions/playmedia";

class PlayerStreamingUtils {

    constructor() {
        this.getLangCombo = this.getLangCombo.bind(this);
        this.resolveStreamType = this.resolveStreamType.bind(this);
        this.ifMultipleAudio = this.ifMultipleAudio.bind(this);
        this.isMultipleStreamType = this.isMultipleStreamType.bind(this);
        this.getLangIDByOptionID = this.getLangIDByOptionID.bind(this);
        this.getEncodesByContentID = this.getEncodesByContentID.bind(this);
        this.getLangIDByContentID = this.getLangIDByContentID.bind(this);
        this.getLangOptionIDByContentID = this.getLangOptionIDByContentID.bind(this);
        this.getSubtitleForSelectedLang = this.getSubtitleForSelectedLang.bind(this);
        this.getAudioForSelectedLang = this.getAudioForSelectedLang.bind(this);
        this.replaceSourceMedia = this.replaceSourceMedia.bind(this);
        this.checkSusc = this.checkSusc.bind(this);
        this.getPBI = this.getPBI.bind(this);
        this.canGoToPastEPGCard = this.canGoToPastEPGCard.bind(this);
        this.pUtils = Device.getDevice().getPlayerUtil();
        this.setChangePath =this.setChangePath.bind(this);
        this.changePath=null;
    }

    setChangePath(func){
      this.changePath=func;
    }

    /*
        get an object of lang options
        @param Object language attr from pgm common extendedcommon.....language.....options.option

            options: [
                {
                    is_current: true,
                    group_id: "733079",
                    content_id: "702214",
                    option_id: "O-ES",
                    label_short: "Audio 1",
                    label_large: "Audio 1",
                    encodes: [
                        "smooth_streaming",
                        "dashwv",
                        "widevine_classic"
                    ]
                },
                {
                    is_current: false,
                    group_id: "733079",
                    content_id: "702216",
                    option_id: "S-ES",
                    label_short: "Audio 2",
                    label_large: "Audio 2",
                    encodes: [
                        "smooth_streaming",
                        "dashwv",
                        "widevine_classic"
                    ]
                }
            ]
     */

    async getPBI(groupId) {
      return await api.purchaseButtonInfo(groupId);
    }

    showModalSusc(provider, groupId, offerButtons,pbi) {
      let pbiButtons = [];
      let default_susc_button_text = '';
      offerButtons.forEach((button) => {
        default_susc_button_text = button.oneofferdesc;
        let button_text = Translator.get(provider + '_forced_label', 'NOTEXT');

        const userLoggedIn = store.getState().user.isAnonymous === false;
        button.fromsusctv = userLoggedIn ? 'susctvregistrado' : 'susctvanonimo'; // Para back desde payment

        if(button_text === 'NOTEXT') {
          button_text = default_susc_button_text;
        }

        let oneButton = {
          content: button_text,
          props: {
            onClick: (e) => {
              const userLoggedIn = store.getState().user.isAnonymous === false;
              if(userLoggedIn) {
                store.dispatch(playFullMedia({   
                    playerstate: AAFPLAYER_STOP,
                    source: null,
                    ispreview: false,
                    islive: true,
                    ispip: false
                }));
                setTimeout(()=>{
                    this.changePath(`/payment/${groupId}/${button.offerid}`,button);
                },1500);
              }
              else {
                this.changePath(`/register`);
              }
              store.dispatch(showModal({
                modalType: HIDE_MODAL,
              }));
            },
          }
        };
        pbiButtons.push(oneButton);
      });

      const modalProps = {
        proveedorName: provider,
        buttons: pbiButtons,
        callback: () => {
          /*
          if(this.props.history.length < 0) {
            this.props.history.replace('/');
          }
          else {
            this.props.history.goBack();
          }*/
        },
        format_type: 'susc',
      }

      store.dispatch(showModal({
        modalType: MODAL_ACTION,
        modalProps: modalProps
      }));
    }

    canPlayChannel(group_id) {
       let channel = null;
       const linealChannels = store.getState().linealChannels;
       console.log('linealChannels',linealChannels);
       if (Array.isArray(linealChannels)) {
           channel = linealChannels.find(tchannel => tchannel.id == group_id);
       }
       return channel && channel.play ? channel : false;
   }
   
    async checkSusc(pgm,group_id){
        // hace chequeo para canal en vivo
        //
        // HACK SACAMOS EL CHEQUEO DE COMPRADO -- TODO !!
        if(this.canPlayChannel(group_id)) {

        const platform = Device.getDevice().getPlatform();
        const config = Device.getDevice().getConfig();
        let purchaseButtonInfo =  await this.getPBI(group_id);
        let offerButtons = (purchaseButtonInfo && purchaseButtonInfo.listButtons && purchaseButtonInfo.listButtons.button);
        if (!Array.isArray(offerButtons)) {
          offerButtons = [];
        }
        if (platform === 'android' && config.device_manufacturer === 'huawei' && config.device_type === 'ptv') {
          offerButtons = [];
        }

        let provider = pgm.group ? pgm.group.common.extendedcommon.media.proveedor.nombre : (pgm.media.proveedor ? pgm.media.proveedor.nombre: '');
        this.showModalSusc(provider, group_id, offerButtons,purchaseButtonInfo);

        return false;
      }
      // Entra a este else y reproduce el canal... del if estaba así if(!this.canPlayChannel(group_id))
      else return true;
    }


    getLangCombo(contentLanguages) {

        let y = contentLanguages;
        let options = [];
        let i;
        for (i = 0; i < contentLanguages.length; i++) {
            options.push(contentLanguages[i]);
        }

        return options;
    }

    resolveStreamType(encodes, provider, isLive) {
        return this.pUtils.resolveStreamType(encodes, provider, isLive);
    }

    // @param streamType is in "single form", i.e. SS and here we compare with "_MA"
    ifMultipleAudio(streamType, isLive) {
        return this.pUtils.ifMultipleAudio(streamType, isLive);
    }

    isMultipleStreamType(streamType) {
        console.log('[INDEXOF] -- isMultipleStreamType a = ',streamType,settings.prepend_multiple);
        let ret = false
        if(streamType){
            ret = streamType.indexOf(settings.prepend_multiple) != -1;
        }else{
            console.error('[INDEXOF] -- isMultipleStreamType NULL = ');
            ret = true;
        }
        console.log('[INDEXOF] -- isMultipleStreamType b = ',ret);
        return ret;
    }

    /*
        optionId is a option_id from lang options, i.e. S-ES
        return language id, i.e. ES, PT
    */
    getLangIDByOptionID(optionId, langOptions) {
        let i;
        let lang_id;
        // TODO change to find/filter ES6 syntax
        for (i = 0; i < langOptions.length; i++) {
            if (langOptions[i].option_id === optionId) {
                lang_id = langOptions[i].id;
                break;
            }
        }

        return lang_id;
    }

    /*
        contentId is a content_id from lang options
        return encodes array
    */
    getEncodesByContentID(contentId, langOptions) {
        let i;
        let encodes = null;
        // TODO change to find/filter ES6 syntax
        for (i = 0; i < langOptions.length; i++) {
            if (langOptions[i].content_id === contentId) {
                encodes = langOptions[i].encodes;
                break;
            }
        }

        return encodes;
    }

    /*
        contentId is a content_id from lang options
        return language id, i.e. ES, PT
    */
    getLangIDByContentID(contentId, langOptions) {
        let i;
        let lang_id;
        // TODO change to find/filter ES6 syntax
        for (i = 0; i < langOptions.length; i++) {
            if (langOptions[i].content_id === contentId) {
                lang_id = langOptions[i].id;
                break;
            }
        }

        return lang_id;
    }

    /*
        contentId is a content_id from lang options
        return language option_id, i.e. D-ES, S-PT
    */
    getLangOptionIDByContentID(contentId, langOptions) {
        let i;
        let lang_id;
        // TODO change to find/filter ES6 syntax
        for (i = 0; i < langOptions.length; i++) {
            if (langOptions[i].content_id === contentId) {
                lang_id = langOptions[i].option_id;
                break;
            }
        }

        return lang_id;
    }

    /*
        @param lang_id = ORIGINAL, PT, ES, etc. from PGM response
        @param (from PGM) multiple = {
            options: {
                PT: {
                    internal: "por",
                    external: "http://tvuspss2qro.clarovideo.com/multimediav81/plataforma_vod/MP4/201706/MAH000034_full/MAH000034_full_T0000_SUBT_POR.VTT"
                },
                ES: {
                    internal: "spa",
                    external: "http://tvuspss2qro.clarovideo.com/multimediav81/plataforma_vod/MP4/201706/MAH000034_full/MAH000034_full_T0000_SUBT_SPA.VTT"
                }
            },
            selected: "ES"
        }

        getSubtitle from lang options
        return url for VTT
    */
    getSubtitleForSelectedLang(lang_id, multiple) {


        console.log('[RESOLVEEEEED subtitle]', lang_id, multiple);

        let vtt_url = null;
        if (!lang_id)
            return null;
        if (!multiple)
            return null;

        if (multiple.options[lang_id]) {
            if (multiple.options[lang_id].external) {
                vtt_url = multiple.options[lang_id].external;
            }
        }

        return vtt_url;
    }

    /*
        @param lang_id = ORIGINAL, PT, ES, etc. from PGM response
        @param (from PGM) multiple = {
            options: {
                PT: "por",
                ORIGINAL: "ori",
                ES: "spa"
            },
            selected: "ORIGINAL"
            }
        }

        getSubtitle from lang options
        return id of audioTrack: por, ori, spa
    */
    getAudioForSelectedLang(lang_id, multiple) {
        console.log('[RESOLVEEEEED] audio', lang_id, multiple);
        let id_audiotrack = null;
        if (!lang_id)
            return null;
        if (!multiple)
            return null;

        console.log('[RESOLVEEEEED] audio multiple.options', multiple.options);
        console.log('[RESOLVEEEEED] audio multiple.options.ES', multiple.options[lang_id]);
        if (multiple.options[lang_id]) {

            id_audiotrack = multiple.options[lang_id];
            console.log('[RESOLVEEEEED] found! ', id_audiotrack);
        }
        console.log('[RESOLVEEEEED] resolved: ', id_audiotrack);

        return id_audiotrack;
    }

    getAudioToPlay(option_id, options) {
        console.log('[INDEXOF] -- ',option_id, options);
        let audio_id = null;
        let y;
        for (y = 0; y < options.length; y++) {
            if (options[y].option_id === option_id) {
                console.log('[INDEXOF] -- loop ',options[y].audio);
                if (options[y].audio) {
                    audio_id = options[y].audio;
                }
            }
        }

        return audio_id;
    }

    getSubtitleToPlay(option_id, options) {
        let subtitle_id = null;
        let y;
        for (y = 0; y < options.length; y++) {
            if (options[y].option_id === option_id) {
                if (options[y].subtitle) {
                    subtitle_id = options[y].subtitle;
                }
            }
        }

        return subtitle_id;
    }

    getSingleSubtitleToPlay(contentId, options) {
        let subtitle_id = null;
        let y;
        for (y = 0; y < options.length; y++) {
            if (options[y].content_id === contentId) {
                if (options[y].subtitle) {
                    subtitle_id = options[y].subtitle;
                }
            }
        }

        return subtitle_id;
    }

    async replaceSourceMedia(pgm, streamType, provider = null, providerCode = null, isLive = false) {
        return await this.pUtils.replaceSourceMedia(pgm, streamType, provider, providerCode, isLive);
    }

    /**
     * Casos particulares de no-playing aquí, por ejemplo crackle en samsung,
     * hisense, HBO en hisense, CRACKLE en samsung 2013, etc.
     *
     * @param {*} pgm
     * @param {*} streamType puede ser null
     */
    canPlayPGM(pgm, streamType) {
        if (Utils.isFunction(this.pUtils.canPlayPGM)) {
            return this.pUtils.canPlayPGM(pgm, streamType);
        }

        return true;
    }

    /**
     *
     */
    canGoToPastEPGCard() {
        let ret_region = false;
        let timeshift_npvr_configuration = Metadata.get('timeshift_npvr_configuration');
        //let timeshift_npvr_configuration ='{"default": {"timeshift": {"enable": true},"vcard_past_epg_event": {"enable": true},"npvr_button_record": {"enable": true}},"argentina": {"timeshift": {"enable": false},"vcard_past_epg_event": {"enable": true},"npvr_button_record": {"enable": true}}}';
        if (timeshift_npvr_configuration != 'timeshift_npvr_configuration') {
        //if (true) {
            timeshift_npvr_configuration = JSON.parse(timeshift_npvr_configuration);
            let region = storage.getItem('region');
            let tocheck = null;

            if(timeshift_npvr_configuration) {
                if(timeshift_npvr_configuration[region]) {
                    tocheck = timeshift_npvr_configuration[region];
                }
                if(tocheck === null) {
                    if(timeshift_npvr_configuration['default']) {
                        tocheck = timeshift_npvr_configuration['default'];
                    }
                }
                if(tocheck !== null) {
                    if(tocheck && tocheck['vcard_past_epg_event']) {
                        ret_region = tocheck['vcard_past_epg_event'].enable;
                    }
                }
            }
        }

        return ret_region;
    }

    // Return a moment object
    getStarttimeTimeshift(groupId) {

        /*
        A las 13:01pm de hoy 29 mayo:
            STARTIME TIMESHIFT]  now:  1527617022 PlayerStreamingUtils.js:431
            [STARTIME TIMESHIFT] ChannelSingleton.getTimeshift timeshift de linnealChannels  24 ChannelsSingleton.js:217
            [STARTIME TIMESHIFT] ChannelSingleton.getTimeshift timeshift de timeshiftContentList  6 ChannelsSingleton.js:228
            [STARTIME TIMESHIFT] ChannelSingleton.getTimeshift:  21600 PlayerStreamingUtils.js:434
            [STARTIME TIMESHIFT] nowDiff:  1527595422 PlayerStreamingUtils.js:439
            [STARTIME TIMESHIFT]  2018/05/29 07:04:00 PlayerStreamingUtils.js:454
            ######## 
        */
        // in seconds
        const now = Utils.now(true).unix();
        let channel_timeshift = ChannelSingleton.getTimeshift(groupId, true);
        channel_timeshift = channel_timeshift + this.getSafeTime();

        //const now = m().unix();
        let nowDiff = now - channel_timeshift;
        console.log('[STARTIME TIMESHIFT] nowDiff: ', nowDiff);

        let startTimeTimeshift = m.unix(nowDiff);
        let seconds = startTimeTimeshift.seconds();
        let addSeconds = 0;
        if(seconds > 30) {
          addSeconds = 60 - seconds;
        }
        // Incluye segs en cero
        if(seconds < 30) {
          addSeconds = 30 - seconds;
        }
        if(addSeconds > 0) {
          startTimeTimeshift.add(addSeconds, 's');
        }
        console.log('[STARTIME TIMESHIFT] ', startTimeTimeshift.format("YYYY/MM/DD hh:mm:ss"));

        return startTimeTimeshift;
      }

      getSafeTime(){
        const region = storage.getItem('region');
        let safeTime = Metadata.get('epg_event_safe_time', null);
        if(typeof safeTime !== 'Object') {
          if (safeTime !== 'epg_event_safe_time')
            safeTime = JSON.parse(safeTime);
          else 
            return 0;
        }
        const safeTimeRegionExists = (safeTime[region] && safeTime[region].timeshift && safeTime[region].timeshift.start);
        if (safeTimeRegionExists)
          return safeTime[region].timeshift.start;
        else {
          const safeTimeDefaultExists = (safeTime['default'] && safeTime['default'].timeshift && safeTime['default'].timeshift.start);
          if (safeTimeDefaultExists)
            return safeTime['default'].timeshift.start;
          else 
            return 0;
        }
      }

      getMaxTimeshiftAllowed(groupId) {
          return ChannelSingleton.getTimeshift(groupId, true);
      }

}

export default PlayerStreamingUtils;
