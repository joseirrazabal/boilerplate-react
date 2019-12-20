/**
 * Stub for CCOM 2.0 Power Manager: CCOM.Pwrmgr, a singleton introduced in v5.1.2
 */

var CCOM = window.CCOM || {};

CCOM.Pwrmgr = CCOM.Pwrmgr || (function () {
    "use strict";
    var _obj, _ver, _id, _ns, _supportedEvents, _EVENT_ON_PWRMGR_MODE_CHANGED,
        _STANDBY_OFF_MODE, _STANDBY_ON_MODE, _LOW_POWER_MODE, _currentMode;

    _ver = CCOM.stubs.getCurrentMWVersion();
    _id  = CCOM.stubs.uuid();
    _ns  = "CCOM.Pwrmgr";

    _EVENT_ON_PWRMGR_MODE_CHANGED = "onPwrmgrModeChanged";
    _supportedEvents = [
        _EVENT_ON_PWRMGR_MODE_CHANGED
    ];

    _STANDBY_OFF_MODE = 0;
    _STANDBY_ON_MODE = 1;
    _LOW_POWER_MODE = 2;
    _currentMode = _LOW_POWER_MODE;

    if (_ver < CCOM.stubs.MW_VER_5_1_2) {
        return;
    }

    _obj = {
        //PwrmgrMode
        STANDBY_OFF : _STANDBY_OFF_MODE,
        STANDBY_ON  : _STANDBY_ON_MODE,
        LOW_POWER   : _LOW_POWER_MODE,

        //system_wake_reason
        STB_WAKE_REASON_BOOTUP    : 0,
        STB_WAKE_REASON_KEYPRESS  : 1,
        STB_WAKE_REASON_SCHEDULED : 2,
        STB_WAKE_REASON_WOL       : 4,


        userModeGet: function () {
            return _currentMode;
        },
        userModeSet: function (pwrmgr_mode) {
            switch (pwrmgr_mode) {
            case _LOW_POWER_MODE:
            case _STANDBY_OFF_MODE:
            case _STANDBY_ON_MODE:
                _currentMode = pwrmgr_mode;
                // TODO: emit an event "onPwrmgrModeChanged", if it's different from the current mode.
                return _currentMode;

            default:
                return {
                    error: {
                        domain  : "com.opentv.Pwrmgr",
                        name    : "Failed",
                        message : "Unknown power status"
                    }
                };
            }
        },
        userReboot: function (force_reboot) {
            return {
                error: {
                    domain  : "com.opentv.Pwrmgr",
                    name    : "Failed",
                    message : "Not implemented yet"
                }
            };
        },
        userWakeReasonGet: function () {
            return {
                error: {
                    domain  : "com.opentv.Pwrmgr",
                    name    : "Failed",
                    message : "Not implemented yet"
                }
            };
        },
        addEventListener: function (event, callback) {
            if (_supportedEvents.indexOf(event) === -1) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }
            return CCOM.stubs.addEventListener(_id, _ns, event, callback);
        },
        removeEventListener : function (event, callback) {
            if (_supportedEvents.indexOf(event) === -1) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }
            return CCOM.stubs.removeEventListener(_id, _ns, event, callback);
        }
    };


    return _obj;
}());
