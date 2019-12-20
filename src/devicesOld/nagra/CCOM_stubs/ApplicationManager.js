/**
 * Stub for CCOM 2.0 Application Manager
 */

var CCOM = window.CCOM || {};

CCOM.ApplicationManager = CCOM.ApplicationManager || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.ApplicationManager",
        ver = CCOM.stubs.getCurrentMWVersion(),
        _id = CCOM.stubs.uuid(),
        _obj = {},
        _EVENT_DESTROY_APPLICATION_OK = "destroyApplicationOK",
        _EVENT_DESTROY_APPLICATION_FAILED = "destroyApplicationFailed",
        _EVENT_GET_APP_PERMISSION_INFO_OK = "getAppPermissionInfoOK",
        _EVENT_GET_APP_PERMISSION_INFO_FAILED = "getAppPermissionInfoFailed",
        _EVENT_IS_APPLICATION_RUNNING_OK = "isApplicationRunningOK",
        _EVENT_IS_APPLICATION_RUNNING_FAILED = "isApplicationRunningFailed",
        _EVENT_LAUNCH_APPLICATION_OK = "launchApplicationOK",
        _EVENT_LAUNCH_APPLICATION_FAILED = "launchApplicationFailed",
        _EVENT_LIST_RUNNING_APPLICATIONS_OK = "listRunningApplicationsOK",
        _EVENT_LIST_RUNNING_APPLICATIONS_FAILED = "listRunningApplicationsFailed",
        _EVENT_REQUEST_APPLICATION_ACTION_OK = "requestApplicationActionOK",
        _EVENT_REQUEST_APPLICATION_ACTION_FAILED = "requestApplicationActionFailed",
        _EVENT_SEND_MESSAGE_OK = "sendMessageOK",
        _EVENT_SEND_MESSAGE_FAILED = "sendMessageFailed",
        _EVENT_SUSPEND_ALL_APPLICATIONS_OK = "suspendAllApplicationsOK",
        _EVENT_SUSPEND_ALL_APPLICATIONS_FAILED = "suspendAllApplicationsFailed",
        _EVENT_APPLICATION_DESTROYED = "applicationDestroyed",
        _EVENT_APPLICATIONS_LAUNCHED = "applicationLaunched",

        _supportedEvents = [_EVENT_DESTROY_APPLICATION_OK,
                            _EVENT_DESTROY_APPLICATION_FAILED,
                            _EVENT_GET_APP_PERMISSION_INFO_OK,
                            _EVENT_GET_APP_PERMISSION_INFO_FAILED,
                            _EVENT_IS_APPLICATION_RUNNING_OK,
                            _EVENT_IS_APPLICATION_RUNNING_FAILED,
                            _EVENT_LAUNCH_APPLICATION_OK,
                            _EVENT_LAUNCH_APPLICATION_FAILED,
                            _EVENT_LIST_RUNNING_APPLICATIONS_OK,
                            _EVENT_LIST_RUNNING_APPLICATIONS_FAILED,
                            _EVENT_REQUEST_APPLICATION_ACTION_OK,
                            _EVENT_REQUEST_APPLICATION_ACTION_FAILED,
                            _EVENT_SEND_MESSAGE_OK,
                            _EVENT_SEND_MESSAGE_FAILED,
                            _EVENT_SUSPEND_ALL_APPLICATIONS_OK,
                            _EVENT_SUSPEND_ALL_APPLICATIONS_FAILED,
                            _EVENT_APPLICATION_DESTROYED,
                            _EVENT_APPLICATIONS_LAUNCHED
                            ];
    /*
     * The object exists since the beginning (v5.0.0)
     */
    _obj = {
        //o_appman_action_type_t
        REQUEST_TYPE_SHOW: 1,
        //o_appman_exit_reason_t
        APP_EXIT_ABNORMAL: 102,
        APP_EXIT_APP_CORRUPTED: 103,
        APP_EXIT_APP_DELETED: 104,
        APP_EXIT_FROM_REQUEST: 105,
        APP_EXIT_LOW_ON_RESOURCES: 106,
        APP_EXIT_NORMAL: 107,
        APP_EXIT_NO_MEMORY: 108,
        APP_EXIT_PERMISSION_DENIED: 109,
        APP_EXIT_SERVICE_NOT_FOUND: 110,
        APP_EXIT_SUSPENDED: 111,
        APP_EXIT_UNKNOWN: 112,
        //o_appman_launch_reason_t
        APP_LAUNCH_FROM_BOOT: 213,
        APP_LAUNCH_FROM_REQUEST: 214,
        APP_LAUNCH_FROM_SUSPEND: 215,
        APP_LAUNCH_UNKNOWN: 216,

        destroyApplication: function (appIdentifierInfo) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DESTROY_APPLICATION_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.ApplicationManager",
                    name: "OperationFailed",
                    message: "not supported"
                }
            });
            return hdl;
        },
        getAppPermissionInfo: function (appIdentifierInfo) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_APP_PERMISSION_INFO_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.ApplicationManager",
                    name: "not supported",
                    message: "not supported"
                }
            });
            return hdl;
        },
        isApplicationRunning: function (appIdentifierInfo) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_IS_APPLICATION_RUNNING_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.ApplicationManager",
                    name: "OperationFailed",
                    message: "not supported"
                }
            });
            return hdl;
        },
        launchApplication: function (appIdentifierInfo) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_LAUNCH_APPLICATION_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.ApplicationManager",
                    name: "OperationFailed",
                    message: "not supported"
                }
            });
            return hdl;
        },
        listRunningApplications: function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_LIST_RUNNING_APPLICATIONS_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.ApplicationManager",
                    name: "OperationFailed",
                    message: "not supported"
                }
            });
            return hdl;
        },
        requestApplicationAction: function (appIdentifierInfo, actionType, playload) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REQUEST_APPLICATION_ACTION_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.ApplicationManager",
                    name: "OperationFailed",
                    message: "not supported"
                }
            });
            return hdl;
        },
        sendMessage: function (appIdentifierInfo, data) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SEND_MESSAGE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.ApplicationManager",
                    name: "OperationFailed",
                    message: "not supported"
                }
            });
            return hdl;
        },
        suspendAllApplications: function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SUSPEND_ALL_APPLICATIONS_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.ApplicationManager",
                    name: "OperationFailed",
                    message: "not supported"
                }
            });
            return hdl;
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

    /*
     * Changes introduced in 5.1.1
     */
    if (ver >= CCOM.stubs.MW_VER_5_1_1) {
        _obj.REQUEST_LPM_DELAY = 2;
    }

    /*
     * No change in version 5.1.2
     */

    return _obj;
}());

