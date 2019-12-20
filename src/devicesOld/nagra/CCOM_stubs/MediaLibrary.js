/**
 * Stub for CCOM 2.0 CCOM.MediaLibrary, a singleton introduced since v5.0.0
 */
var CCOM = window.CCOM || {};

CCOM.MediaLibrary = CCOM.MediaLibrary || (function () {
    "use strict";
    var _TOTAL_HARD_DRIVE_SPACE = 1024,  // in bytes. FIXME: shall it be more meaningful (i.e. bigger)?
        _FREE_HARD_DRIVE_SPACE = 512,
        _MY_NAME_SPACE = "CCOM.MediaLibrary",
        _id = CCOM.stubs.uuid(),
        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {},

        // events in xml
        _EVENT_ON_AUTHORIZATION = "onAuthorization",
        _EVENT_ON_CONTENT_MODIFIED = "onContentModified",
        _EVENT_ON_DISK_SPACE_ALERT = "onDiskSpaceAlert",
        _EVENT_ON_CHANGED = "onMediaChanged",
        _EVENT_ON_HANDLED = "onMediaHandled",
        _EVENT_ON_SCANNED = "onMediaScanned",
        _EVENT_ON_PROVISION = "onProvision",

        // events from methods
        _EVENT_DELETE_CONTENT_OK = "deleteContentOK",
        _EVENT_DELETE_CONTENT_FAILED = "deleteContentFailed",
        _EVENT_GET_ASSOCIATED_MEDIA_OK = "getAssociatedMediaOK",
        _EVENT_GET_ASSOCIATED_MEDIA_FAILED = "getAssociatedMediaFailed",

        _EVENT_GET_STB_MODE_OK = "getStbModeOK",
        _EVENT_GET_STB_MODE_FAILED = "getStbModeFailed",
        _EVENT_GET_TOTAL_PARTITION_SPACE_OK = "getTotalPartitionSpaceOK",
        _EVENT_GET_TOTAL_PARTITION_SPACE_FAILED = "getTotalPartitionSpaceFailed",
        _EVENT_GET_FREE_PARTITION_SPACE_OK = "getFreePartitionSpaceOK",
        _EVENT_GET_FREE_PARTITION_SPACE_FAILED = "getFreePartitionSpaceFailed",
        _EVENT_UPDATE_ENTRY_OK = "updateEntryOK",
        _EVENT_UPDATE_ENTRY_FAILED = "updateEntryFailed",
        _EVENT_ASSOCIATE_MEDIA_OK = "associateMediaOK",
        _EVENT_ASSOCIATE_MEDIA_FAILED = "associateMediaFailed",
        _EVENT_REGISTER_MEDIA_EVENT_OK = "registerMediaEventOK",
        _EVENT_REGISTER_MEDIA_EVENT_FAILED = "registerMediaEventFailed",

        _EVENT_ASSOCIATE_MEDIUM_OK = "associateMediumOK",
        _EVENT_ASSOCIATE_MEDIUM_FAILED = "associateMediumFailed",
        _EVENT_DISASSOCIATE_MEDIUM_OK = "disassociateMediumOK",
        _EVENT_DISASSOCIATE_MEDIUM_FAILED = "disassociateMediumFailed",
        _EVENT_GET_ALL_CONNECTED_MEDIA_OK = "getAllConnectedMediaOK",
        _EVENT_GET_ALL_CONNECTED_MEDIA_FAILED = "getAllConnectedMediaFailed",
        _EVENT_GET_ASSOCIATED_MEDIA_ID_OK = "getAssociatedMediaIdOK",
        _EVENT_GET_ASSOCIATED_MEDIA_ID_FAILED = "getAssociatedMediaIdFailed",
        _EVENT_LOAD_MEDIUM_OK = "loadMediumOK",
        _EVENT_LOAD_MEDIUM_FAILED = "loadMediumFailed",
        _EVENT_UNLOAD_MEDIUM_OK = "unloadMediumOK",
        _EVENT_UNLOAD_MEDIUM_FAILED = "unloadMediumFailed",
        _EVENT_AUTHORIZE_CONTENT_OK = "authorizeContentOK",
        _EVENT_AUTHORIZE_CONTENT_FAILED = "authorizeContentFailed",
        _EVENT_GET_AUTHORIZATION_STATUS_OK = "getAuthorizationStatusOK",
        _EVENT_GET_AUTHORIZATION_STATUS_FAILED = "getAuthorizationStatusFailed",
        _EVENT_GET_PROVISION_STATUS_OK = "getProvisionStatusOK",
        _EVENT_GET_PROVISION_STATUS_FAILED = "getProvisionStatusFailed",
        _EVENT_INITIATE_PROVISIONING_OK = "initiateProvisioningOK",
        _EVENT_INITIATE_PROVISIONING_FAILED = "initiateProvisioningFailed",
        _EVENT_REMOVE_MEDIUM_OK = "removeMediumOK",
        _EVENT_REMOVE_MEDIUM_FAILED = "removeMediumFailed",
        _EVENT_TAG_MEDIUM_OK = "tagMediumOK",
        _EVENT_TAG_MEDIUM_FAILED = "tagMediumFailed",
        _EVENT_UNTAG_MEDIUM_OK = "untagMediumOK",
        _EVENT_UNTAG_MEDIUM_FAILED = "untagMediumFailed",

        _supportedEvents = [ _EVENT_ON_AUTHORIZATION,
                             _EVENT_ON_CONTENT_MODIFIED,
                             _EVENT_ON_DISK_SPACE_ALERT,
                             _EVENT_ON_CHANGED,
                             _EVENT_ON_HANDLED,
                             _EVENT_ON_SCANNED,
                             _EVENT_ON_PROVISION,
                             _EVENT_DELETE_CONTENT_OK,
                             _EVENT_DELETE_CONTENT_FAILED,
                             _EVENT_GET_ASSOCIATED_MEDIA_OK,
                             _EVENT_GET_ASSOCIATED_MEDIA_FAILED,
                             _EVENT_REGISTER_MEDIA_EVENT_OK,
                             _EVENT_REGISTER_MEDIA_EVENT_FAILED,
                             _EVENT_GET_STB_MODE_OK,
                             _EVENT_GET_STB_MODE_FAILED,
                             _EVENT_GET_TOTAL_PARTITION_SPACE_OK,
                             _EVENT_GET_TOTAL_PARTITION_SPACE_FAILED,
                             _EVENT_GET_FREE_PARTITION_SPACE_OK,
                             _EVENT_GET_FREE_PARTITION_SPACE_FAILED,
                             _EVENT_UPDATE_ENTRY_OK,
                             _EVENT_UPDATE_ENTRY_FAILED,
                             _EVENT_ASSOCIATE_MEDIA_OK,
                             _EVENT_ASSOCIATE_MEDIA_FAILED,
                             _EVENT_ASSOCIATE_MEDIUM_OK,
                             _EVENT_ASSOCIATE_MEDIUM_FAILED,
                             _EVENT_DISASSOCIATE_MEDIUM_OK,
                             _EVENT_DISASSOCIATE_MEDIUM_FAILED,
                             _EVENT_GET_ALL_CONNECTED_MEDIA_OK,
                             _EVENT_GET_ALL_CONNECTED_MEDIA_FAILED,
                             _EVENT_GET_ASSOCIATED_MEDIA_ID_OK,
                             _EVENT_GET_ASSOCIATED_MEDIA_ID_FAILED,
                             _EVENT_LOAD_MEDIUM_OK,
                             _EVENT_LOAD_MEDIUM_FAILED,
                             _EVENT_UNLOAD_MEDIUM_OK,
                             _EVENT_UNLOAD_MEDIUM_FAILED,
                             _EVENT_AUTHORIZE_CONTENT_OK,
                             _EVENT_AUTHORIZE_CONTENT_FAILED,
                             _EVENT_GET_AUTHORIZATION_STATUS_OK,
                             _EVENT_GET_AUTHORIZATION_STATUS_FAILED,
                             _EVENT_GET_PROVISION_STATUS_OK,
                             _EVENT_GET_PROVISION_STATUS_FAILED,
                             _EVENT_INITIATE_PROVISIONING_OK,
                             _EVENT_INITIATE_PROVISIONING_FAILED,
                             _EVENT_REMOVE_MEDIUM_OK,
                             _EVENT_REMOVE_MEDIUM_FAILED,
                             _EVENT_TAG_MEDIUM_OK,
                             _EVENT_TAG_MEDIUM_FAILED,
                             _EVENT_UNTAG_MEDIUM_OK,
                             _EVENT_UNTAG_MEDIUM_FAILED
                            ];
    /*
     * The object exists since the beginning (v5.0.0)
     */
    _obj = {
        //ContentModifyType
        AVAILABLE: 1,
        DELETED: 2,
        UNKNOWN: 3,
        //DiskSpaceEventType
        RED_ALERT_EXCEEDED: 1,
        //FsCode
        INVALID: 1,
        FAT16_UPTO_32M: 4,
        FAT16_OVER_32M: 6,
        NTFS: 7,
        FAT32X: 11,
        SFS: 13,

        //SFS
        ASSOCIATE: 1,
        MOUNT: 2,
        MediumCommand: 4,

        //MediumMode
        ZAPPER0: 1,
        ZAPPER1: 2,
        PVR: 3,

        //PartitionStatus
        UNMOUNTING: 3,
        UNMOUNT_FAILED: 4,
        UNMOUNTED: 5,
        BUSY: 6,
        MOUNTED: 7,
        MOUNT_FAILED: 8,
        FORMAT_REQUIRED: 9,
        FSCK_STARTED: 10,
        FORMAT_FAILED: 11,
        NOT_IN_HOME_DOMAIN: 12,
        //mediaScanReason
        databaseFull: 1,
        diskError: 2,
        internalError: 3,
        normal: 4,
        //mediaScanState
        scanFailed: 1,
        scanStarted: 2,
        scanStopped: 3,
        //AuthorizationStatus
        AUTHORIZATION_SUCCESS: 0,
        AUTHORIZATION_FAILURE: 1,
        AUTHORIZATION_NOT_HOME_DOMAIN: 2,
        AUTHORIZATION_NETWORK_ERROR: 3,
        AUTHORIZATION_CONNECTION_ERROR: 4,
        AUTHORIZATION_STATUS_PENDING: 5,

        //MediumAction
        DISASSOCIATE: 1,
        //MediumReason
        CANNOT_DETERMINE_HOME_DOMAIN: 1,
        FAILED_TO_READ_METADATA: 2,
        FORCED_REMOVAL: 3,
        NONE: 4,
        TOO_MANY_DRIVES: 5,
        USER_REQUESTED_REMOVAL: 6,
        NOT_HOME_DOMAIN: 7,
        //ProvisionStatus
        PROVISION_CONNECTION_ERROR: 0,
        PROVISION_FAILURE: 1,
        PROVISION_NETWORK_ERROR: 2,
        PROVISION_NOT_HOME_DOMAIN: 3,
        PROVISION_STATUS_PENDING: 4,
        PROVISION_SUCCESS: 5,
        //WhiteListStatus
        DO_NOT_CARE: 0,
        IN_LIST: 1,
        NOT_IN_LIST: 2,
        //MediumEvent
        PLUGGED: 1,
        UNPLUGGED: 2,
        SAFESHUTDOWNCOMPLETE: 3,
        MEDIUM_READY: 4,
        MEDIUM_REJECTED: 5,
        MEDIUM_WAITING_FOR_EVENT: 6,

        deleteContent: function (medialibId, purgeMetaData) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DELETE_CONTENT_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        },
        getAssociatedMedia: function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_ASSOCIATED_MEDIA_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        },
        getStbMode: function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_STB_MODE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        },
        getTotalPartitionSpace: function (partitionName) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_TOTAL_PARTITION_SPACE_OK, {
                target: this,
                handle: hdl,
                totalSpace: _TOTAL_HARD_DRIVE_SPACE
            });
            return hdl;
        },
        getFreePartitionSpace: function (partitionName) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_FREE_PARTITION_SPACE_OK, {
                target: this,
                handle: hdl,
                freeSpace: _FREE_HARD_DRIVE_SPACE
            });
            return hdl;
        },
        updateEntry: function (medialibId, mediaInfo) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UPDATE_ENTRY_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        },
        associateMedia: function (command, mediumName) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ASSOCIATE_MEDIA_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        },
        registerMediaEvent: function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REGISTER_MEDIA_EVENT_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
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
        },

        getEntryRSByQuery: function (properties, criteria, mediaType, orderBy) {
            return CCOM.Scheduler.getEntryRSByQuery(properties, criteria, orderBy);
        }
    };

    /*
     * Changes introduced in 5.1.1
     */
    if (_ver >= CCOM.stubs.MW_VER_5_1_1) {
        _obj.associateMedium = function (command, mediumName) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ASSOCIATE_MEDIUM_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.disassociateMedium = function (mediumID, force, flags) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DISASSOCIATE_MEDIUM_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.getAllConnectedMedia = function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_ALL_CONNECTED_MEDIA_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.getAssociatedMediaId = function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_ASSOCIATED_MEDIA_ID_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.loadMedium = function (mediumID, recursive, force) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_LOAD_MEDIUM_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.unloadMedium = function (mediumID) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UNLOAD_MEDIUM_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        delete _obj.associateMedia;
        delete _obj.registerMediaEvent;
    }

    /*
     * Changes introduced in 5.1.2
     */
    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {
        _obj.authorizeContent = function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_AUTHORIZE_CONTENT_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.getAuthorizationStatus = function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_AUTHORIZATION_STATUS_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.getProvisionStatus = function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_PROVISION_STATUS_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.initiateProvisioning = function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_INITIATE_PROVISIONING_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.removeMedium = function (mediumID) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REMOVE_MEDIUM_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.tagMedium = function (mediumId, tagId, value) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_TAG_MEDIUM_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
        _obj.untagMedium = function (mediumId, tagId) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UNTAG_MEDIUM_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.MediaLibrary",
                    name: "GenericError",
                    message: ""
                }
            });
            return hdl;
        };
    }

    return _obj;
}());
