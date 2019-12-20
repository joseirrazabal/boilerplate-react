import Utils from './../../utils/Utils';
/**
 * Receive all ps4 notificacions here
 */
const __from_playstation_callback = (callbackData) => { 
  PlaystationWebmaf.playstationCallback(callbackData);
};
window.accessfunction = __from_playstation_callback;
/**
 * Contains callbacks 
 */
window.__playstation_callbacks = (window.__playstation_callbacks || []);

/**
 * Contains callbacks that are called once 
 */
window.__playstation_callbacks_once = (window.__playstation_callbacks_once || []);


class PlaystationWebmaf {

  static playstationCallback(callbackData) {
    
    if (Utils.isString(callbackData)) {
      callbackData = JSON.parse(callbackData);
    }

    if(callbackData.command !== 'getPlaybackTime') {
      console.debug("[PS4] getting callback ", callbackData);
    }
    if(!Utils.isUndefined(callbackData.command)) {
        if(callbackData.command === 'playerError') {
            console.error('Error code, error code exa, error info> ', callbackData.error_code, callbackData.error_code_hexa, callbackData.error.info);
        }
    }

    let callbacks;
    let callbacks_once;
    let i;
    //let calledOnce = false;

    if (callbackData && callbackData.command) {      
      callbacks = window.__playstation_callbacks[callbackData.command];
      callbacks_once = window.__playstation_callbacks_once[callbackData.command];
      
      if (callbacks && callbacks.length > 0) {
          for (i = 0; i < callbacks.length; i++) {
            if(callbackData.command !== 'getPlaybackTime') {
              console.debug("[PS4] Run callback of ", callbackData.command);
            }
            callbacks[i](callbackData);
          }
      }

      if (callbacks_once && callbacks_once.length > 0) {
        for (i = 0; i < callbacks_once.length; i++) {
          if(callbackData.command !== 'getPlaybackTime') {
            console.debug("[PS4] Run callback once of ", callbackData.command);
          }
          callbacks_once[i](callbackData);
        }
        delete window.__playstation_callbacks_once[callbackData.command];
      }
    }
  }

  static sendCommand(commandName, args, callbackFunction, once) {
    let obj;
    let p;
    // Just in case...
    PlaystationWebmaf.addEventListener(commandName, callbackFunction, once);

    obj = {
        "command": commandName
    };
    if (args) {
        for (p in args) {
            obj[p] = args[p];
        }
    }
    if (window.external && window.external.user) {
      if(commandName !== 'getPlaybackTime') {
        console.debug("[PS4] send the PS4 command" + JSON.stringify(obj));
      }
      window.external.user(JSON.stringify(obj));
    }
  }

  static addEventListener(commandName, callbackFunction, once) {
    if(commandName !== 'getPlaybackTime') {
      console.debug("[PS4] addEventListener of the command", commandName);
    }

    if (!callbackFunction || !Utils.isFunction(callbackFunction)) {
      if(commandName !== 'getPlaybackTime') {
        console.debug("[PS4] no callback for the command, nothing to do", commandName);
      }
      return;
    }
    // All ps4 callbacks
    let callbackList;
    // Only callbacks for this commandName
    let callbacks;

    // Where to save listener?
    if (once) {
      callbackList = window.__playstation_callbacks_once;
    } 
    else {
      callbackList = window.__playstation_callbacks;
    }
    console.debug('[PS4] Pila de eventos en callbacks ANTES>' , callbackList);
    // Already exists?
    callbacks = callbackList[commandName];
    
    // First time this listener is setted, init in callbacks
    if (!callbacks) {
      callbacks = [];
      callbackList[commandName] = callbacks;
    }
    callbacks.push(callbackFunction);
    console.debug('[PS4] Pila de eventos> ', window.__playstation_callbacks);
    console.debug('[PS4] Pila de eventos once>' , window.__playstation_callbacks_once);
    console.log('[PS4] Pila de eventos en callbacks DESPUES>' , callbacks);
  }

  static removeEventListener(commandName, callbackFunction) {
    console.debug('[PS4] removeEventListener de ', commandName);
    let callbacks;
    let callbacks_once;
    let i;
    //let calledOnce = false;

    callbacks = window.__playstation_callbacks[commandName];
    callbacks_once = window.__playstation_callbacks_once[commandName];

    if (callbacks && callbacks.length > 0) {
      console.debug('[PS4] ENTER for(i) removeEventListener de ', commandName);
      for (i = 0; i < callbacks.length; i++) {
        if (callbacks[i] === callbackFunction) {
            callbacks.splice(i, 1);
            break;
        }
      }
    }

    if (callbacks_once && callbacks_once.length > 0) {
      console.debug('[PS4] ENTER for(i) removeEventListener once de ', commandName);
      for (i = 0; i < callbacks_once.length; i++) {
        if (callbacks_once[i] === callbackFunction) {
          callbacks_once.splice(i, 1);
          break;
        }
      }
    }
  }
}

export default PlaystationWebmaf;