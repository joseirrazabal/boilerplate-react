/**
 * Stub for CCOM 2.0 Software Upgrade Manager, which was added in v5.0.0
 */

var CCOM = window.CCOM || {};

CCOM.SoftwareUpgradeManager = CCOM.SoftwareUpgradeManager || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.SoftwareUpgradeManager",
        _id = CCOM.stubs.uuid(),
        _obj = {},

        // events in xml
        _EVENT_UPGRADE_STATUS_NOITFYCATION = "upgradeStatusNotification",

        // events from methods
        _EVENT_GET_UPGRADE_STATUS_OK = "getUpgradeStatusOK",
        _EVENT_GET_UPGRADE_STATUS_FAILED = "getUpgradeStatusFailed",
        _EVENT_REQUEST_UPGRADE_OK = "requestUpgradeOK",
        _EVENT_REQUEST_UPGRADE_FAILED = "requestUpgradeFailed",

        _supportedEvents = [ _EVENT_UPGRADE_STATUS_NOITFYCATION,
                             _EVENT_GET_UPGRADE_STATUS_OK,
                             _EVENT_GET_UPGRADE_STATUS_FAILED,
                             _EVENT_REQUEST_UPGRADE_OK,
                             _EVENT_REQUEST_UPGRADE_FAILED
                           ];
    /*
     * The object exists since the beginning (v5.0.0)
     */
    _obj = {
        //o_sum_error_t
        O_SUM_ERROR_DOWNLOAD_FAILED: 0,
        O_SUM_ERROR_FAILED: 1,
        O_SUM_ERROR_INVALID_IMAGE: 2,
        O_SUM_ERROR_INVALID_PARAMS: 3,
        O_SUM_ERROR_NO_UPGRADE_REQUESTED: 4,
        O_SUM_ERROR_PERMISSION_DENIED: 5,
        O_SUM_ERROR_SCHEDULE_FAILED: 6,
        O_SUM_ERROR_UPGRADE_PENDING: 7,
        O_SUM_ERROR_USER_CANCELLED: 8,

        //o_sum_state_t
        O_SUM_STATE_DOWNLOAD_COMPLETE: 9,
        O_SUM_STATE_DOWNLOAD_PROGRESS: 10,
        O_SUM_STATE_DOWNLOAD_SCHEDULED: 11,
        O_SUM_STATE_ERROR: 12,
        O_SUM_STATE_IDLE: 13,
        O_SUM_STATE_IMAGE_AVAILABLE: 14,
        O_SUM_STATE_REBOOT_SCHEDULED: 15,
        O_SUM_STATE_STOPPING: 16,
        O_SUM_STATE_UPDATE_COMPLETE: 17,

        //o_sum_upgrade_type_t
        SUM_UPGRADE_TYPE_FORCED: 21,
        SUM_UPGRADE_TYPE_MANUAL: 22,
        SUM_UPGRADE_TYPE_STANDBY: 23,

        getUpgradeStatus: function () {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_UPGRADE_STATUS_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domin: "com.opentv.SoftwareUpgradeManager",
                    name: "OperationFailed",
                    message: "not supported"
                }
            });

            return _handle;
        },

        requestUpgrade: function (isCancel, upgradeInfo) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REQUEST_UPGRADE_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domin: "com.opentv.SoftwareUpgradeManager",
                    name: "OperationFailed",
                    message: "not supported"
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
     * There is no change of this object in v5.1.1 and v5.1.2
     */

    return _obj;
}());


