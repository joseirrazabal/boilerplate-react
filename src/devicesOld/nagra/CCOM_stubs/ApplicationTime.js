/**
 * Stub for CCOM 2.0 CCOM.AppTimeSource singleton, which was added since OTV5 v5.1.1
 */


var CCOM = window.CCOM || {};

CCOM.AppTimeSource = CCOM.AppTimeSource || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.AppTimeSource",
        _ver = CCOM.stubs.getCurrentMWVersion(),
        _id = CCOM.stubs.uuid(),
        _obj = {},
        _supportedEvents = [];

    /*
     * The object does not exist before v5.1.1
     */
    if (_ver < CCOM.stubs.MW_VER_5_1_1) {
        return;
    }

    if (_ver >= CCOM.stubs.MW_VER_5_1_1) {
        _obj = {
            setTimeData: function (remoteUTC, systemUTC) {
                if (arguments.length < 2) {
                    throw "usage: CCOM.ApplicationTime(remoteUTC, systemUTC)";
                }
                if ((typeof remoteUTC !== 'number') || remoteUTC.constructor !== Number) {
                    throw "The first parm should be number!";
                }
                if ((typeof systemUTC !== 'number') || systemUTC.constructor !== Number) {
                    throw "The second parm should be number!";
                }
                return {
                    error: {
                        domain: "com.opentv.AppTimeSource",
                        name: "InvalidData",
                        message: "Set time data failed!"
                    }
                };
            },
            addEventListener: function (event, callback) {
                if (_supportedEvents.indexOf(event) === -1) {
                    return CCOM.stubs.ERROR_INVALID_EVENT;
                }
                return CCOM.stubs.addEventListener(_id, _MY_NAME_SPACE, event, callback);
            },
            removeEventListener: function (event, callback) {
                if (_supportedEvents.indexOf(event) === -1) {
                    return CCOM.stubs.ERROR_INVALID_EVENT;
                }
                return CCOM.stubs.removeEventListener(_id, _MY_NAME_SPACE, event, callback);
            }
        };
    }

    /*
     * No change in version 5.1.2
     */

    return _obj;
}());
