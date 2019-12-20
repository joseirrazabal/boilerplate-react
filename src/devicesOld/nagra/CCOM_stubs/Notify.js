/**
 * Stub for CCOM 2.0 CCOM.NotifyService, a singleton added since v5.1.2
 */
var CCOM = window.CCOM || {};

CCOM.NotifyService = CCOM.NotifyService || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.NotifyService",
        _id = CCOM.stubs.uuid(),
        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {},

        // events in xml
        _EVENT_ON_NOTIFY_MESSAGE = "onNotifyMessage",
        _supportedEvents = [ _EVENT_ON_NOTIFY_MESSAGE ];

    /*
     * The object does not exist  in v5.0.0 & v5.1.1
     */
    if (_ver < CCOM.stubs.MW_VER_5_1_2) {
        return;
    }

    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {
        _obj = {
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
    }

    return _obj;
}());
