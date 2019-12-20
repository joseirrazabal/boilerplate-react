/**
 * Stub for CCOM 2.0 DRM (Digital Rights Management): CCOM.DRM
 * This singleton has been added since OTV5 v5.1.2
 */

var CCOM = window.CCOM || {};

CCOM.DRM = CCOM.DRM || (function () {
    "use strict";
    var _obj, _ver, _id, _ns, _supportedEvents;

    _ver = CCOM.stubs.getCurrentMWVersion();
    _id  = CCOM.stubs.uuid();
    _ns  = "CCOM.DRM";

    // currently, all events are supported
    _supportedEvents = [];


    if (_ver < CCOM.stubs.MW_VER_5_1_2) {
        return;
    }

    _obj = {
        //drmMethodReturnErrors
        DRM_METHOD_ERROR_FAILURE            : 1,
        DRM_METHOD_ERROR_NOT_SUPPORTED      : 2,
        DRM_METHOD_ERROR_INFO_NOT_AVAILABLE : 3,
        DRM_METHOD_ERROR_BAD_PARAM          : 4,

        //drmType
        DRM_TYPE_NATIVE : 0,
        DRM_TYPE_PRM    : 1,
        DRM_TYPE_END    : 2,

        getDrmInfo: function (type) {
            return {
                error: {
                    domain: "com.opentv.DRM",
                    name: "Method not supported",
                    message: type
                }
            };
        },
        getDrmList: function () {
            return [
                this.DRM_TYPE_NATIVE,
                this.DRM_TYPE_PRM,
                this.DRM_TYPE_END
            ];
        },
        addEventListener: function (event, callback) {
            if (_supportedEvents.indexOf(event) === -1) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }
            return CCOM.stubs.addEventListener(_id, _ns, event, callback);
        },
        removeEventListener: function (event, callback) {
            if (_supportedEvents.indexOf(event) === -1) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }
            return CCOM.stubs.removeEventListener(_id, _ns, event, callback);
        }
    };

    return _obj;
}());
