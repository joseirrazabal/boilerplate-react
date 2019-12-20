/**
  * Stub for CCOM 2.0 CCOM.WindowManager, a singleton added since v5.0.0
  */

var CCOM = window.CCOM || {};
CCOM.WindowManager = CCOM.WindowManager || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.WindowManager",
        _id = CCOM.stubs.uuid(),
        _obj = {},

        // events in xml
        _EVENT_ON_INPUT_EVENT_OCCURRED = "inputEventOccurred",

        // events from methods
        _EVENT_REGISTER_INPUT_EVNETS_OK = "registerInputEventsOK",
        _EVENT_REGISTER_INPUT_EVNETS_FAIL = "registerInputEventsFailed",

        _supportedEvents = [ _EVENT_ON_INPUT_EVENT_OCCURRED,
                             _EVENT_REGISTER_INPUT_EVNETS_OK,
                             _EVENT_REGISTER_INPUT_EVNETS_FAIL
                           ];
   /*
    * The object exists since the beginning (v5.0.0)
    */
    _obj = {
        //inputEventSignalTypes
        INPUT_EVENT_TYPE_STEAL_KEY: 1,

        //winmanInputEventTypes
        KEY_PRESS: 1,
        KEY_RELEASE: 2,

        registerInputEvents: function (winInputEvent) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REGISTER_INPUT_EVNETS_FAIL, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.WindowManager",
                    name: "OperationFailed",
                    message: "error"
                }
            });
            return _handle;
        },

        addEventListener: function (event, callback) {
            if (-1 === _supportedEvents.indexOf(event)) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }
            return CCOM.stubs.addEventListener(_id, _MY_NAME_SPACE, event, callback);
        },

        removeEventListener: function (event, callback) {
            if (-1 === _supportedEvents.indexOf(event)) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }
            return CCOM.stubs.removeEventListener(_id, _MY_NAME_SPACE, event, callback);
        }
    };

    /*
     * No change in 5.1.1 & 5.1.2
     */

    return _obj;
}());
