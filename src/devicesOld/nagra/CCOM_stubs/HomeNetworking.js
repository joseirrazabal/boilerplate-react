/**
 * Stub for CCOM 2.0 Home Networking, CCOM.HomeNetworking, a singleton added since v5.0.0
 */

var CCOM = window.CCOM || {};

CCOM.HomeNetworking = CCOM.HomeNetworking || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.HomeNetworking",
        _id = CCOM.stubs.uuid(),
        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {},
        _EVENT_ON_DEVICE_FOUND = "onDeviceFound",
        _EVENT_ON_DEVICE_LOST = "onDeviceLost",
        _EVENT_ON_SUBSCRIBED_EVENT = "onSubscribedEvent",
        _EVENT_ON_DISPLAY_PICTURE = "onDisplayPicture",
        _EVENT_ON_PLAY_REQUESTED = "onPlayRequested",

        _EVENT_BROWSE_CONTAINER_OK = "browseContainerOK",
        _EVENT_BROWSE_CONTAINER_FAILED = "browseContainerFailed",
        _EVENT_CANCEL_SUBSCRIBED_SERVICE_OK = "cancelSubscribedServiceOK",
        _EVENT_CANCEL_SUBSCRIBED_SERVICE_FAILED = "cancelSubscribedServiceFailed",
        _EVENT_DELETE_OBJECT_OK = "deleteObjectOK",
        _EVENT_DELETE_OBJECT_FAILED = "deleteObjectFailed",
        _EVENT_CREATE_OBJECT_OK = "createObjectOK",
        _EVENT_CREATE_OBJECT_FAILED = "createObjectFailed",
        _EVENT_GET_DEVICES_OK = "getDevicesOK",
        _EVENT_GET_DEVICES_FAILED = "getDevicesFailed",
        _EVENT_GET_SEARCH_CAPABILITIES_OK = "getSearchCapabilitiesOK",
        _EVENT_GET_SEARCH_CAPABILITIES_FAILED = "getSearchCapabilitiesFailed",
        _EVENT_GET_SORT_CAPABILITIES_OK = "getSortCapabilitiesOK",
        _EVENT_GET_SORT_CAPABILITIES_FAILED = "getSortCapabilitiesFailed",
        _EVENT_GET_SYSTEM_UPDATE_ID_OK = "getSystemUpdateIdOK",
        _EVENT_GET_SYSTEM_UPDATE_ID_FAILED = "getSystemUpdateIdFailed",
        _EVENT_SUBSCRIBE_SERVICE_OK = "subscribeServiceOK",
        _EVENT_SUBSCRIBE_SERVICE_FAILED = "subscribeServiceFailed",
        _EVENT_BROWSE_OBJECT_OK = "browseObjectOK",
        _EVENT_BROWSE_OBJECT_FAILED = "browseObjectFailed",
        _EVENT_DELETE_BOOKMARK_OK = "deleteBookmarkOK",
        _EVENT_DELETE_BOOKMARK_FAILED = "deleteBookmarkFailed",
        _EVENT_SEARCH_CONTAINER_OK = "searchContainerOK",
        _EVENT_SEARCH_CONTAINER_FAILED = "searchContainerFailed",
        _EVENT_UPDATE_BOOKMAK_OK = "updateBookmarkOK",
        _EVENT_UPDATE_BOOKMARK_FAILED = "updateBookmarkFailed",
        _EVENT_GET_VALUE_BY_STRING_OK = "getValueByStringOK",
        _EVENT_GET_VALUE_BY_STRING_FAILED = "getValueByStringFailed",
        _EVENT_SET_VALUE_BY_STRING_OK = "setValueByStringOK",
        _EVENT_SET_VALUE_BY_STRING_FAILED = "setValueByStringFailed",
        _EVENT_RELEASE_INSTANCE_OK = "releaseInstanceOK",
        _EVENT_RELEASE_INSTANCE_FAILED = "releaseInstanceFailed",
        _EVENT_UPDATE_OBJECT_OK = "updateObjectOK",
        _EVENT_UPDATE_OBJECT_FAILED = "updateObjectFailed",

        _supportedEvents = [
            _EVENT_ON_DEVICE_FOUND,
            _EVENT_ON_DEVICE_LOST,
            _EVENT_ON_SUBSCRIBED_EVENT,

            _EVENT_BROWSE_CONTAINER_OK,
            _EVENT_BROWSE_CONTAINER_FAILED,
            _EVENT_CANCEL_SUBSCRIBED_SERVICE_OK,
            _EVENT_CANCEL_SUBSCRIBED_SERVICE_FAILED,
            _EVENT_DELETE_OBJECT_OK,
            _EVENT_DELETE_OBJECT_FAILED,
            _EVENT_CREATE_OBJECT_OK,
            _EVENT_CREATE_OBJECT_FAILED,
            _EVENT_GET_DEVICES_OK,
            _EVENT_GET_DEVICES_FAILED,
            _EVENT_GET_SEARCH_CAPABILITIES_OK,
            _EVENT_GET_SEARCH_CAPABILITIES_FAILED,
            _EVENT_GET_SORT_CAPABILITIES_OK,
            _EVENT_GET_SORT_CAPABILITIES_FAILED,
            _EVENT_GET_SYSTEM_UPDATE_ID_OK,
            _EVENT_GET_SYSTEM_UPDATE_ID_FAILED,
            _EVENT_SUBSCRIBE_SERVICE_OK,
            _EVENT_SUBSCRIBE_SERVICE_FAILED
        ],
        _obsoletedEvents = [],
        _newSupportedEvents = [],

        dlnaServers = ' {"devices": [ {"modelDescription": "Synology DLNA/UPnP Media Server","upc": "","type": "urn: schemas-upnp-org: device: MediaServer: 1","manufacturer": "Synology Inc","friendlyName": "NinjaNAS","presentationUrl": "http: //10.8.1.35: 5000/","serialNumber": "D3KON12466","dlnaUploadProfile": "","modelUrl": "http: //www.synology.com/","iconCount": 4,"modelNumber": "","modelName": "DS212j","udn": "uuid: 0011321e-7644-0011-4476-44761e321100","iconData": [ {"width": 120,"depth": 24,"mimeType": "image/jpeg","url": "http: //10.8.1.35: 50001/tmp_icon/dmsicon120.jpg","height": 120}, {"width": 48,"depth": 24,"mimeType": "image/jpeg","url": "http: //10.8.1.35: 50001/tmp_icon/dmsicon48.jpg","height": 48}, {"width": 120,"depth": 24,"mimeType": "image/png","url": "http: //10.8.1.35: 50001/tmp_icon/dmsicon120.png","height": 120}, {"width": 48,"depth": 24,"mimeType": "image/png","url": "http: //10.8.1.35: 50001/tmp_icon/dmsicon48.png","height": 48}],"manufacturerUrl": "http: //www.synology.com/","dlnaCapabilities": ""}, {"modelDescription": "DVBLink Home Server","upc": "123456789","type": "urn: schemas-upnp-org: device: MediaServer: 1","manufacturer": "DVBLogic","friendlyName": "DVBLink DLNA TV Server (NinjaNAS)","presentationUrl": "http: //10.8.1.35: 39876/","serialNumber": "123456789002","dlnaUploadProfile": "","modelUrl": "http: //www.dvblogic.com/","iconCount": 4,"modelNumber": "1.0","modelName": "DVBLink Home Server","udn": "uuid: 5AFEF00D-BABE-DADA-FA5A-0011321E7644","iconData": [ {"width": 48,"depth": 24,"mimeType": "image/png","url": "http: //10.8.1.35: 49153/dvblink_48_48.png","height": 48}, {"width": 120,"depth": 24,"mimeType": "image/png","url": "http: //10.8.1.35: 49153/dvblink_120_120.png","height": 120}, {"width": 48,"depth": 24,"mimeType": "image/jpeg","url": "http: //10.8.1.35: 49153/dvblink_48_48.jpeg","height": 48}, {"width": 120,"depth": 24,"mimeType": "image/jpeg","url": "http: //10.8.1.35: 49153/dvblink_120_120.jpeg","height": 120}],"manufacturerUrl": "http: //www.dvblogic.com","dlnaCapabilities": ""}, {"modelDescription": "OpenTV 5 Gateway","upc": "012345678901","type": "urn: schemas-upnp-org: device: MediaServer: 1","manufacturer": "Nagra","friendlyName": "OpenTV 5 DMS ","presentationUrl": "http: //10.8.1.44: 8080/","serialNumber": "0","dlnaUploadProfile": "","modelUrl": "http: //www.nagra.com/","iconCount": 4,"modelNumber": "OpenTV 5","modelName": "Gateway","udn": "uuid: 0000001A-0001-3EC0-67C6-FFFFFFFFFFFF","iconData": [ {"width": 120,"depth": 8,"mimeType": "image/png","url": "http: //10.8.1.44: 8080/home/otv_system/hn/icons/Nagra120.png","height": 120}, {"width": 48,"depth": 8,"mimeType": "image/png","url": "http: //10.8.1.44: 8080/home/otv_system/hn/icons/Nagra48.png","height": 48}, {"width": 120,"depth": 24,"mimeType": "image/jpeg","url": "http: //10.8.1.44: 8080/home/otv_system/hn/icons/Nagra120.jpg","height": 120}, {"width": 48,"depth": 24,"mimeType": "image/jpeg","url": "http: //10.8.1.44: 8080/home/otv_system/hn/icons/Nagra48.jpg","height": 48}],"manufacturerUrl": "http: //www.nagra.com","dlnaCapabilities": ""}],"handle": 6}',
        dlnaContentString1 = ' {"content": [ {"resource": [],"childCount": 56,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "TVChannels","title": "TV Channels","objectType": 1,"parentId": "0","searchable": true}, {"resource": [],"childCount": 4,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "4e9e47d6-4b3c-4ea7-b148-537821d50b94: ","title": "Recorded TV","objectType": 1,"parentId": "0","searchable": true}],"totalMatches": 2,"handle": 2691}',
        dlnaContentString2 = ' {"content": [ {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "21","title": "Music","objectType": 1,"parentId": "0","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "37","title": "Photo","objectType": 1,"parentId": "0","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "44","storageMaxPartition": -1,"title": "Video","objectType": 1,"parentId": "0","searchable": false}],"totalMatches": 3,"handle": 2692}',
        dlnaContentString3 = ' {"content": [ {"resource": [],"childCount": 156,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "live","title": "Live TV Channels","objectType": 1,"parentId": "0","searchable": true}, {"resource": [],"childCount": 4,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Video","title": "Video","objectType": 1,"parentId": "0","searchable": false}, {"resource": [],"childCount": 3,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Image","title": "Image","objectType": 1,"parentId": "0","searchable": false}, {"resource": [],"childCount": 5,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Audio","title": "Audio","objectType": 1,"parentId": "0","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "epg","title": "TV EPG","objectType": 1,"parentId": "0","searchable": true}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": false,"id": "pvr","title": "PVR Recordings","objectType": 1,"parentId": "0","searchable": true}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "nowPlaying","title": "Now Playing","objectType": 1,"parentId": "0","searchable": false}],"totalMatches": 7,"handle": 2664}',
        dlnaContentString3_Video = ' {"content": [ {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Video.All Video","title": "All Video","objectType": 1,"parentId": "Video","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Video.By Date","title": "By Date","objectType": 1,"parentId": "Video","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Video.Genre","title": "Genre","objectType": 1,"parentId": "Video","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Video.By Folder","title": "By Folder","objectType": 1,"parentId": "Video","searchable": false}],"totalMatches": 4,"handle": 2676}',
        dlnaContentString3_Image = ' {"content": [ {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Image.All Photos","title": "All Photos","objectType": 1,"parentId": "Image","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Image.By Date","title": "By Date","objectType": 1,"parentId": "Image","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Image.By Folder","title": "By Folder","objectType": 1,"parentId": "Image","searchable": false}],"totalMatches": 3,"handle": 2679}',
        dlnaContentString3_Audio = ' {"content": [ {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Audio.All Music","title": "All Music","objectType": 1,"parentId": "Audio","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Audio.By Date","title": "By Date","objectType": 1,"parentId": "Audio","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Audio.Album","title": "Album","objectType": 1,"parentId": "Audio","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Audio.Genre","title": "Genre","objectType": 1,"parentId": "Audio","searchable": false}, {"resource": [],"childCount": 0,"durationSecs": 0,"type": 1,"refId": "","restricted": true,"id": "Audio.By Folder","title": "By Folder","objectType": 1,"parentId": "Audio","searchable": false}],"totalMatches": 5,"handle": 2680}';


    _obj = {
        HN_CONTENT_TYPE_CONTAINER: 1,
        HN_CONTENT_TYPE_ITEM: 2,
        hnNumDevices: 0,
        browseContainer: function (deviceUdn, containerId, sortCriteria, filter, startIndex, maxResults) {
            var data = null, switchString = deviceUdn + ", " + containerId, hdl = CCOM.stubs.getHandle();

            switch (switchString) {
            case "uuid: 5AFEF00D-BABE-DADA-FA5A-0011321E7644, 0":
                data = JSON.parse(dlnaContentString1);
                break;
            case "uuid: 0011321e-7644-0011-4476-44761e321100, 0":
                data = JSON.parse(dlnaContentString2);
                break;
            case "uuid: 0000001A-0001-3EC0-67C6-FFFFFFFFFFFF, 0":
                data = JSON.parse(dlnaContentString3);
                break;
            case "uuid: 0000001A-0001-3EC0-67C6-FFFFFFFFFFFF, Video":
                data = JSON.parse(dlnaContentString3_Video);
                break;
            case "uuid: 0000001A-0001-3EC0-67C6-FFFFFFFFFFFF, Image":
                data = JSON.parse(dlnaContentString3_Image);
                break;
            case "uuid: 0000001A-0001-3EC0-67C6-FFFFFFFFFFFF, Audio":
                data = JSON.parse(dlnaContentString3_Audio);
                break;
            default:
                // ignore
                break;
            }

            if (data) {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_BROWSE_CONTAINER_OK, {
                    target: this,
                    handle: hdl,
                    content: data,
                    totalMatches: 0
                });
            } else {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_BROWSE_CONTAINER_FAILED, {
                    target: this,
                    handle: hdl,
                    error: {
                        domain: "com.opentv.HomeNetworking",
                        name: "HnStatusInvalid",
                        message: "error"
                    }
                });
            }

            return hdl;
        },
        cancelSubscribedService: function (deviceUdn, serviceType) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CANCEL_SUBSCRIBED_SERVICE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusInvalid",
                    message: "error"
                }
            });
            return hdl;
        },

        createObject: function (deviceUdn, cds) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CREATE_OBJECT_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusInvalid",
                    message: "error"
                }
            });
            return hdl;
        },
        deleteObject: function (deviceUdn, objectId) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DELETE_OBJECT_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusInvalid",
                    message: "error"
                }
            });
            return hdl;
        },

        getDevices: function () {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_DEVICES_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusInvalid",
                    message: "error"
                }
            });
            return hdl;
        },

        getSearchCapabilities: function (deviceUdn) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_SEARCH_CAPABILITIES_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusInvalid",
                    message: "error"
                }
            });
            return hdl;
        },

        getSortCapabilities: function (deviceUdn) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_SORT_CAPABILITIES_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusInvalid",
                    message: "error"
                }
            });
            return hdl;
        },

        getSystemUpdateId: function (deviceUdn) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_SYSTEM_UPDATE_ID_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusInvalid",
                    message: "error"
                }
            });
            return hdl;
        },

        subscribeService: function (deviceUdn, serviceType) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SUBSCRIBE_SERVICE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusInvalid",
                    message: "error"
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
        }
    };

    /*
     * Changes introduced in v5.1.1
     */

    if (_ver >= CCOM.stubs.MW_VER_5_1_1) {
        _obsoletedEvents = [];
        _newSupportedEvents = [
            _EVENT_ON_DISPLAY_PICTURE
        ];

        //Remove obsoleted items from the event array
        _supportedEvents = _supportedEvents.filter(function (x) {
            return (-1 === _obsoletedEvents.indexOf(x));
        });

        //Concatenate the newly supported event array with the old one
        _supportedEvents = _supportedEvents.concat(_newSupportedEvents);
    }

    /* 
     * Changes introduced in v5.1.2
     */
    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {
        _obsoletedEvents = [
            _EVENT_CREATE_OBJECT_OK,
            _EVENT_CREATE_OBJECT_FAILED
        ];

        _newSupportedEvents = [
            _EVENT_BROWSE_OBJECT_OK,
            _EVENT_BROWSE_OBJECT_FAILED,
            _EVENT_DELETE_BOOKMARK_OK,
            _EVENT_DELETE_BOOKMARK_FAILED,
            _EVENT_SEARCH_CONTAINER_OK,
            _EVENT_SEARCH_CONTAINER_FAILED,
            _EVENT_UPDATE_BOOKMAK_OK,
            _EVENT_UPDATE_BOOKMARK_FAILED,
            _EVENT_GET_VALUE_BY_STRING_OK,
            _EVENT_GET_VALUE_BY_STRING_FAILED,
            _EVENT_SET_VALUE_BY_STRING_OK,
            _EVENT_SET_VALUE_BY_STRING_FAILED,
            _EVENT_RELEASE_INSTANCE_OK,
            _EVENT_RELEASE_INSTANCE_FAILED,
            _EVENT_UPDATE_OBJECT_OK,
            _EVENT_UPDATE_OBJECT_FAILED,

            _EVENT_ON_PLAY_REQUESTED
        ];

        //Remove obsoleted items from the event array
        _supportedEvents = _supportedEvents.filter(function (x) {
            return (-1 === _obsoletedEvents.indexOf(x));
        });

        //Concatenate the newly supported event array with the old one
        _supportedEvents = _supportedEvents.concat(_newSupportedEvents);

        _obj.getInstance = function (createArgs) {
            var ret;

            ret.error = {
                domain: "com.opentv.HomeNetworking",
                name: "HnStatusInvalid",
                message: "error"
            };

            return ret;
        };

        _obj.releaseInstance = function (objectPath) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_RELEASE_INSTANCE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusError",
                    message: "error"
                }
            });
            return hdl;
        };

        _obj.browseObject =  function (deviceUdn, objectId, filter) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_BROWSE_OBJECT_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusError",
                    message: "error"
                }
            });
            return hdl;
        };

        _obj.deleteBookmark = function (deviceUdn, objectId, all) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DELETE_BOOKMARK_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusError",
                    message: "error"
                }
            });
            return hdl;
        };

        _obj.getValueByString = function (deviceUdn, stringId, result) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_VALUE_BY_STRING_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusError",
                    message: "error"
                }
            });
            return hdl;
        };

        _obj.searchContainer = function (deviceUdn, containerId, searchCriteria, sortCriteria, filter, startIndex, maxResults) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SEARCH_CONTAINER_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusError",
                    message: "error"
                }
            });
            return hdl;
        };

        _obj.setValueByString = function (deviceUdn, stringId, stringIdValue, result) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_VALUE_BY_STRING_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusError",
                    message: "error"
                }
            });
            return hdl;
        };

        _obj.updateBookmark = function (deviceUdn, objectId, time, allowDuplicates) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent("updateBookmarkFailed", {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusError",
                    message: "error"
                }
            });
            return hdl;
        };

        _obj.updateObject = function (deviceUdn, currentCds, newCds) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UPDATE_OBJECT_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: "com.opentv.HomeNetworking",
                    name: "HnStatusError",
                    message: "error"
                }
            });
            return hdl;
        };

        //delete createObject method
        delete _obj.createObject;
    }

    return _obj;
}());
