/**
 * Stub for CCOM 2.0: CCOM.Application
 *
 * This object has been added since OTV 5.1.1, for representing application instances.
 */


var CCOM = window.CCOM || {};
CCOM.Application = CCOM.Application || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.Application",
        _id = CCOM.stubs.uuid(),

        // events in headline of html doc
        // FIXME: these two events are not use here, probably it should be moved to
        // Appman object.
        _EVENT_REQUEST_ACTION_SIGNAL = "requestActionSignal",
        _EVENT_SEND_MESSAGE_SIGNAL = "sendMessageSignal",

        // method events
        _EVENT_DELAY_LOW_POWER_OK = "delayLowPowerOK",
        _EVENT_DELAY_LOW_POWER_FAILED = "delayLowPowerFailed",

        _supportedEvents = [ _EVENT_REQUEST_ACTION_SIGNAL,
                             _EVENT_SEND_MESSAGE_SIGNAL,

                             _EVENT_DELAY_LOW_POWER_OK,
                             _EVENT_DELAY_LOW_POWER_FAILED
                           ],

        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {};

    if (_ver < CCOM.stubs.MW_VER_5_1_1) {
        return;
    }

    _obj = {
        //o_appman_action_type_t
        REQUEST_LOW_POWER : 1,
        REQUEST_TYPE_SHOW : 2,

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

    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {
        _obj.delayLowPower = function (delay) {
            // the uuid for identifying this call
            var hdl = CCOM.stubs.getHandle();

            // note: so far we just raise an OK event here
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DELAY_LOW_POWER_OK, {
                target : this,
                handle : hdl
            }, delay);
            return hdl;
        };
    }

    return _obj;
}());

