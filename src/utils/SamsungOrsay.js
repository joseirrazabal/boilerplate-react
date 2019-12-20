import Utils from './Utils';
import { WSASERVICE_NOT_FOUND } from 'constants';

class SamsungOrsay {

  constructor() {
    this.device = this.init();

    this.PLUGIN = null;
    this.WIDGET = null;
    this.TVKEY  = null;

    this.orsaySetup = this.orsaySetup.bind(this);
    this.registerKeys = this.registerKeys.bind(this);
  }

  init() {
    let samsungOrsay = document.getElementById("samsungDeviceObject");
    
    if(!samsungOrsay) {

      samsungOrsay = document.createElement("div");
      samsungOrsay.id = "samsungDeviceObject";
      document.body.appendChild(samsungOrsay);

      samsungOrsay.innerHTML = "\
        <object id='pluginNetwork' border=0 classid='clsid:SAMSUNG-INFOLINK-NETWORK'></object>\
        <object id='pluginObjectAudio' border=0 classid='clsid:SAMSUNG-INFOLINK-AUDIO' style='opacity:0.0;background-color:#000000;width:0px;height:0px;'></object>\
        <object id='pluginObjectTVMW' border=0 classid='clsid:SAMSUNG-INFOLINK-TVMW'></object>\
        <object id='pluginObjectNNavi' border=0 classid='clsid:SAMSUNG-INFOLINK-NNAVI'></object>\
        <object id='pluginObjectAppCommon' border=0 classid='clsid:SAMSUNG-INFOLINK-APPCOMMON'></object>\
        <div id='InfolinkContainer' class='playerContainer'><object id='infolinkPlayer' border=0 classid='clsid:SAMSUNG-INFOLINK-PLAYER' style='position:absolute;'></object></div>\
        <object id='pluginObjectTV' border=0 classid='clsid:SAMSUNG-INFOLINK-TV'></object>\
        <object id='pluginObjectExternal' border=0 classid='clsid:SAMSUNG-INFOLINK-EXTERNALWIDGETINTERFACE'></object>\
        <object id='TimePlugin' border=0 classid='clsid:SAMSUNG-INFOLINK-TIME'></object>\
        <object id='pluginObjectWindow' border=0 classid='clsid:SAMSUNG-INFOLINK-WINDOW'></object>\
        <object id='pluginObjectTaskManager' border=0 classid='clsid:SAMSUNG-INFOLINK-TASKMANAGER'></object>\
        <object id='pluginObjectScreen3D' border=0 classid='clsid:SAMSUNG-INFOLINK-SCREEN'></object>\
        <div id='SefPlayerContainer' class='playerContainer'><object id='pluginSef' border=0 classid='clsid:SAMSUNG-INFOLINK-SEF' style='position:absolute;width:0px;height:0px'></object></div>\
        <object id='pluginSefDownload' border=0 classid='clsid:SAMSUNG-INFOLINK-SEF' style='position:absolute;width:0px;height:0px'></object>\
      ";

      this.loadSamsungLibs();
    }
    else {

        this.interlval=
        setInterval( x => {
                            if(!window.Common)
                              return null;
                            clearInterval(this.interlval);
                            this.PLUGIN = new window.Common.API.Plugin();
                            this.WIDGET = new window.Common.API.Widget();
                            this.TVKEY = new window.Common.API.TVKeyValue();
                              return null;
                          },
          50);
    }

      let device = {
        appCommon: document.getElementById("pluginObjectAppCommon"),
        NNaviPlugin: document.getElementById("pluginObjectNNavi"),
        mwPlugin: document.getElementById("pluginObjectTVMW"),
        mwPlugin2: document.getElementById("pluginObjectWindow"),
        tvPlugin: document.getElementById("pluginObjectTV"),
        networkPlugin: document.getElementById("pluginNetwork"),
        taskManagerPlugin: document.getElementById("pluginObjectTaskManager"),
        audioPlugin: document.getElementById("pluginObjectAudio"),
        pluginObject3D: document.getElementById("pluginObjectScreen3D"),
        widevinePlugin: document.getElementById("pluginObjectExternal"),
        //widevine ID
        timePlugin: document.getElementById("TimePlugin"),
        //TV channel
        sefPlugin: document.getElementById("pluginSef"),
        infolinkPlayer: document.getElementById("infolinkPlayer"),
        webapis: null,
        //download
        download: document.getElementById("pluginSefDownload")
      };

    return device;
  }

  getESN(esntype = 'WIDEVINE') {
    if(this.device.widevinePlugin) {
      return this.device.widevinePlugin.GetESN(esntype); 
    }
    return null;
  }

  orsaySetup() {
    this.PLUGIN = new window.Common.API.Plugin();
    this.WIDGET = new window.Common.API.Widget();
    this.TVKEY  = new window.Common.API.TVKeyValue();

    this.orsayOnshow = this.orsayOnshow.bind(this);
    this.fload = this.fload.bind(this);

    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", this.fload, false);
      window.addEventListener("load", this.fload, false); // SEEEEE
      window.addEventListener("show", this.fload, false);
      window.onShow = this.orsayOnshow;
    } else if (window.attachEvent) {
      window.attachEvent("onload", this.orsayOnshow);
    }
  }

  fload() {
    console.log('REGISTERSAMSUNG fload');
    this.WIDGET.sendReadyEvent();
  }

  orsayOnshow() {
    console.log('REGISTERSAMSUNG dummyOrsayAppLoaded');
    this.orsayAppLoaded();
  }

  orsayAppLoaded() {
    // Let samsung initializa their plugins, otherwise we could be ignored
    //Utils.sleep(1).then(() => {
    this.device.NNaviPlugin.SetBannerState(1);

    //DOCS: http://developer.samsung.com/tv/develop/legacy-platform-library/ref00006/Plugin_Objects
    //The setOffIdleEvent() method sets idle OFF, which disables the closing of the application even if there is no input for a certain amount of time.
    this.PLUGIN.setOffIdleEvent();

    // DOC: http://developer.samsung.com/tv/develop/legacy-platform-library/ref00006/Plugin_Objects
    //The registPartWidgetKey() method lets the Application Manager register a specific key group.
    this.PLUGIN.registPartWidgetKey();

    // DOC: http://developer.samsung.com/tv/develop/legacy-platform-library/ref00006/Plugin_Objects
    //The registFullWidgetKey() method let the Application Manager register a specific key group.
    this.PLUGIN.registFullWidgetKey();

    this.registerKeys();
    //});
  }

  /*
  From samsung doc: If the functions registering or unregistering keys do not work in your application, 
                    the most probable cause is a timing issue. In order to make sure that all keys are 
                    registered in a proper way.

    http://developer.samsung.com/tv/develop/legacy-platform-library/tec00114/index                    
  */
  registerKeys() {
    let appcommon = this.device.appCommon;

    appcommon.RegisterKey(this.TVKEY.KEY_PANEL_CH_UP);
    appcommon.RegisterKey(this.TVKEY.KEY_PANEL_CH_DOWN);
    appcommon.RegisterKey(this.TVKEY.KEY_PANEL_VOL_UP);
    appcommon.RegisterKey(this.TVKEY.KEY_PANEL_VOL_DOWN);
    appcommon.RegisterKey(this.TVKEY.KEY_PANEL_ENTER);
    appcommon.RegisterKey(this.TVKEY.KEY_PANEL_SOURCE);
    appcommon.RegisterKey(this.TVKEY.KEY_PANEL_MENU);
    appcommon.RegisterKey(this.TVKEY.KEY_EXIT);

    // 2013 this.pluginAPI.registKey(this.TVKEY.KEY_TOOLS);

    appcommon.RegisterKey(this.TVKEY.KEY_CH_DOWN);
    appcommon.RegisterKey(this.TVKEY.KEY_CH_UP);

    /*
    if (year <= 2012) {
      if (type === IId.HARDWARE_TYPE.TV && year <= 2010) {
        appcommon.UnregisterKey(global.tvKey.KEY_WLINK); // Smart-hub key another version
      } else {
        appcommon.RegisterKey(global.tvKey.KEY_WLINK); // Smart-hub key another version
      }
      ac.RegisterKey(global.tvKey.KEY_CONTENT); // Smart-hub key
      ac.RegisterKey(global.tvKey.KEY_INFOLINK); // Smart-hub key another version
    } else {
      ac.UnregisterKey(global.tvKey.KEY_INFOLINK);
      ac.UnregisterKey(global.tvKey.KEY_CONTENT);
      //ac.UnregisterKey(global.tvKey.KEY_WLINK); //2013 will unregister tools key
    }
    */

    appcommon.UnregisterKey(this.TVKEY.KEY_INFOLINK);
    appcommon.UnregisterKey(this.TVKEY.KEY_CONTENT);

    //To Ensure the following keys are not registered to use the default behaviour.
    appcommon.UnregisterKey(this.TVKEY.KEY_VOL_UP);
    appcommon.UnregisterKey(this.TVKEY.KEY_VOL_DOWN);
    appcommon.UnregisterKey(this.TVKEY.KEY_MUTE);
    appcommon.UnregisterKey(this.TVKEY.KEY_POWER);
    appcommon.UnregisterKey(this.TVKEY.KEY_SOURCE);
    appcommon.UnregisterKey(this.TVKEY.KEY_MENU);

    //only handle keydown in ss, for testing
    /*
    document.addEventListener('keypress',(evt) => {
      console.log('[SAMG] [Orsay key down] quitar este ');
      console.log(evt);
    });
    */  
  }

  loadSamsungLibs() {
    // Yes...we know is "scripts" but we prefer "escripts" :D
    // If you want more samsung orsay scripts, add to array below...
    let escripts = ['$MANAGER_WIDGET/Common/API/Plugin.js', '$MANAGER_WIDGET/Common/API/Widget.js', '$MANAGER_WIDGET/Common/API/TVKeyValue.js'];

    Utils.loadScript(escripts).then((responses) => {
        this.orsaySetup();
    }).catch((e) => {console.log(e);console.log('ERRRR arriba leer ');});
  }

  setScreenSaver(onOff) {
    console.log('Orsay set screenSaver: ' + onOff);
    if (!this.PLUGIN)
      this.PLUGIN = new window.Common.API.Plugin();

    // DOC http://developer.samsung.com/tv/develop/legacy-platform-library/ref00006/Plugin_Objects
    // The setOnScreenSaver() sets the screen saver on.
    // The setOffScreenSaver() method sets off the screen saver.
    return onOff ? this.PLUGIN.setOnScreenSaver() : this.PLUGIN.setOffScreenSaver();
  }

}

export default SamsungOrsay;

/*
const samsungOrsay = new SamsungOrsay();
export default samsungOrsay;
*/
