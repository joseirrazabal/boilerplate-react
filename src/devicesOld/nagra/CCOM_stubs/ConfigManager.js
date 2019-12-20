/**
 * Stub for CCOM 2.0 ConfigManager, a singleton added since v5.0.0
 */

var CCOM = window.CCOM || {};

CCOM.ConfigManager = CCOM.ConfigManager || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.ConfigManager",
        ver = CCOM.stubs.getCurrentMWVersion(),
        _id = CCOM.stubs.uuid(),
        _EVENT_ON_VALUE_CHANGED = "onValueChanged",
        _supportedEvents = [_EVENT_ON_VALUE_CHANGED],
        testValues = {
            '/applications/shared/address': "Shanghai",
            '/applications/shared/zapping.banner.timeout': 3000,
            '/applications/shared/user.channel.usage': "[ {'39': '5', '160': '25'}]",
            '/applications/shared/serviceFavouriteFolders': "['fav1', 'fav2']",
            '/applications/shared/system.ca.disabled': 0,
            '/applications/shared/before.padding': 0,
            '/applications/shared/after.padding': 0,
            '/applications/shared/system.current.volume': 10,
            '/applications/shared/ca.modem.status': "Enabled",
            '/applications/shared/user.favEnabled': 'false',
            '/applications/shared/av.default.audio_format': 'stereo',
            '/applications/shared/av.default.aspect_ratio_hd': 'hdmiStretch',
            '/applications/shared/av.default.aspect_ratio_analogue': 'analogueStretch',
            '/applications/shared/av.default.audio_delay': 0,
            '/applications/shared/hard.of.hearing': 'false',
            '/applications/shared/audio.language': 'eng',
            '/applications/shared/subtitle.language.current': 'eng',
            '/applications/shared/subtitle.language.preferred': 'eng',
            '/applications/shared/tv.sort': 'channelNumberAsc',
            '/applications/shared/network.http.proxy': '0.0.0.0',
            '/system/opentv/mpm/mediaList': 'sdb',
            '/system/opentv/mpm/sdb/partitionList': 'sdb1',
            '/system/opentv/mpm/sdb/sdb1/mountPoint': '/mnt/sdb1',
            '/system/devices/tnrmgr/lnb-freq-lo-khz': '9750',
            '/system/devices/tnrmgr/lnb-freq-hi-khz': '10600',
            '/system/devices/tnrmgr/lnb-freq-sw-khz': '11700',
            '/system/devices/tnrmgr/lnb-power': 'true'
        },
        _obj = {};

    /*
     * The object exists since the beginning (v5.0.0)
     */
    if (ver >= CCOM.stubs.MW_VER_5_0_0) {
        _obj = {
            getValue: function (prefKey) {
                return {
                    keyValue: testValues[prefKey]
                };
            },
            setValue: function (prefKey, prefValue) {
                testValues[prefKey] = prefValue;
                return {};
            },
            unsetValue: function (prefKey) {
                delete testValues[prefKey];
                return {};
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
            },
            getSubtree: function (prefKey) {
                var ret = {},
                    property;
                for (property in testValues) {
                    if (testValues.hasOwnProperty(property)) {
                        if (property.indexOf(prefKey) === 0) {
                            ret[property] = testValues[property];
                        }
                    }
                }
                return ret;
            },
            addNotify: function (preKey) {
                return {};
            },
            createEncryptionKey: function (encryptionData) {
                return {
                    error: {
                        domain: "CCOM.ConfigManager",
                        name: "OperationFailed",
                        message: "Not supported"
                    }
                };
            },
            deleteEncryptionKey: function (encryptionID) {
                return {
                    error: {
                        domain: "CCOM.ConfigManager",
                        name: "OperationFailed",
                        message: "Not supported"
                    }
                };
            },
            getEntries: function (dirPath) {
                return {
                    error: {
                        domain: "CCOM.ConfigManager",
                        name: "NoMemory",
                        message: "Not supported"
                    }
                };
            },
            removeNotify: function (prefKey) {
                return {};
            },
            setEncryptedValue: function (keyPath, keyValue) {
                return {};
            }
        };
    }
    /*
     * No change in version 5.1.1 & 5.1.2
     */
    return _obj;
}());
