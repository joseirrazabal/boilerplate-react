/**
 * Stub for CCOM 2.0 UserAuth, a singleton added since v5.0.0, for user authentications (PIN code, e.g.)
 */
var CCOM = window.CCOM || {};

CCOM.UserAuth = CCOM.UserAuth || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.UserAuth",
        _id = CCOM.stubs.uuid(),
        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {},

        // events in xml

        // events from methods
        _EVENT_REGISTER_INPUT_EVNETS_OK = "registerInputEventsOK",
        _EVENT_REGISTER_INPUT_EVNETS_FAIL = "registerInputEventsFailed",
        _EVENT_CHANGE_MASTER_PIN_OK = "changeMasterPinOK",
        _EVENT_CHANGE_MASTER_PIN_FAILED = "changeMasterPinFailed",
        _EVENT_CREATE_MASTER_PIN_OK = "createMasterPinOK",
        _EVENT_CREATE_MASTER_PIN_FAILED = "createMasterPinFailed",
        _EVENT_DELETE_MASTER_PIN_OK = "deleteMasterPinOK",
        _EVENT_DELETE_MASTER_PIN_FAILED = "deleteMasterPinFailed",
        _EVENT_DISABLE_SYSTEM_OK = "disableSystemOK",
        _EVENT_DISABLE_SYSTEM_FAILED = "disableSystemFailed",
        _EVENT_ENABLE_SYSTEM_OK = "enableSystemOK",
        _EVENT_ENABLE_SYSTEM_FAILED = "enableSystemFailed",
        _EVENT_GET_CURRENT_USER_PROFILE_OK = "getCurrentUserProfileOK",
        _EVENT_GET_CURRENT_USER_PROFILE_FAILED = "getCurrentUserProfileFailed",
        _EVENT_GET_POLICY_MODIFIER_OK = "getPolicyModifierOK",
        _EVENT_GET_POLICY_MODIFIER_FAILED = "getPolicyModifierFailed",
        _EVENT_GET_USER_PROFILE_OK = "getUserProfileOK",
        _EVENT_GET_USER_PROFILE_FAILED = "getUserProfileFailed",
        _EVENT_MODIFY_USER_PROFILE_OK = "modifyUserProfileOK",
        _EVENT_MODIFY_USER_PROFILE_FAILED = "modifyUserProfileFailed",
        _EVENT_SET_CURRENT_USER_PROFILE_OK = "setCurrentUserProfileOK",
        _EVENT_SET_CURRENT_USER_PROFILE_FAILED = "setCurrentUserProfileFailed",
        _EVENT_SET_POLICY_MODIFIER_OK = "setPolicyModifierOK",
        _EVENT_SET_POLICY_MODIFIER_FAILED = "setPolicyModifierFailed",
        _EVENT_RESET_DEFAULT_PROFILE_OK = "resetDefaultProfileOK",
        _EVENT_RESET_DEFAULT_PROFILE_FAILED = "resetDefaultProfileFailed",
        _EVENT_ADD_RESTRICTED_CHANNEL_OK = "addRestrictedChannelOK",
        _EVENT_ADD_RESTRICTED_CHANNEL_FAILED = "addRestrictedChannelFailed",
        _EVENT_ADD_TIME_WINDOW_OK = "addTimeWindowOK",
        _EVENT_ADD_TIME_WINDOW_FAILED = "addTimeWindowFailed",
        _EVENT_DISABLE_LOCKER_OK = "disableLockerOK",
        _EVENT_DISABLE_LOCKER_FAILED = "disableLockerFailed",
        _EVENT_ENABLE_LOCKER_OK = "enableLockerOK",
        _EVENT_ENABLE_LOCKER_FAILED = "enableLockerFailed",
        _EVENT_GET_ALL_RESTRICTED_CHANNELS_OK = "getAllRestrictedChannelsOK",
        _EVENT_GET_ALL_RESTRICTED_CHANNELS_FAILED = "getAllRestrictedChannelsFailed",
        _EVENT_GET_ALL_TIMEWINDOWS_OK = "getAllTimeWindowsOK",
        _EVENT_GET_ALL_TIMEWINDOWS_FAILED = "getAllTimeWindowsFailed",
        _EVENT_REMOVE_ALL_RESTRICTED_CHANNELS_OK = "removeAllRestrictedChannelsOK",
        _EVENT_REMOVE_ALL_RESTRICTED_CHANNELS_FAILED = "removeAllRestrictedChannelsFailed",
        _EVENT_REMOVE_ALL_TIME_WINDOWS_OK = "removeAllTimeWindowsOK",
        _EVENT_REMOVE_ALL_TIME_WINDOWS_FAILED = "removeAllTimeWindowsFailed",
        _EVENT_REMOVE_RESTRICTED_CHANNEL_OK = "removeRestrictedChannelOK",
        _EVENT_REMOVE_RESTRICTED_CHANNEL_FAILED = "removeRestrictedChannelFailed",
        _EVENT_REMOVE_TIME_WINDOW_OK = "removeTimeWindowOK",
        _EVENT_REMOVE_TIME_WINDOW_FAILED = "removeTimeWindowFailed",
        _EVENT_RESET_USER_PROFILE_OK = "resetUserProfileOK",
        _EVENT_RESET_USER_PROFILE_FAILED = "resetUserProfileFailed",
        _EVENT_SET_ALL_RESTRICTED_CHANNELS_OK = "setAllRestrictedChannelsOK",
        _EVENT_SET_ALL_RESTRICTED_CHANNELS_FAILED = "setAllRestrictedChannelsFailed",
        _EVENT_SET_ALL_TIME_WINDOWS_OK = "setAllTimeWindowsOK",
        _EVENT_SET_ALL_TIME_WINDOWS_FAILED = "setAllTimeWindowsFailed",

        _supportedEvents = [ _EVENT_REGISTER_INPUT_EVNETS_OK,
                             _EVENT_REGISTER_INPUT_EVNETS_FAIL,
                             _EVENT_CHANGE_MASTER_PIN_OK,
                             _EVENT_CHANGE_MASTER_PIN_FAILED,
                             _EVENT_CREATE_MASTER_PIN_OK,
                             _EVENT_CREATE_MASTER_PIN_FAILED,
                             _EVENT_DELETE_MASTER_PIN_OK,
                             _EVENT_DELETE_MASTER_PIN_FAILED,
                             _EVENT_DISABLE_SYSTEM_OK,
                             _EVENT_DISABLE_SYSTEM_FAILED,
                             _EVENT_ENABLE_SYSTEM_OK,
                             _EVENT_ENABLE_SYSTEM_FAILED,
                             _EVENT_GET_CURRENT_USER_PROFILE_OK,
                             _EVENT_GET_CURRENT_USER_PROFILE_FAILED,
                             _EVENT_GET_POLICY_MODIFIER_OK,
                             _EVENT_GET_POLICY_MODIFIER_FAILED,
                             _EVENT_GET_USER_PROFILE_OK,
                             _EVENT_GET_USER_PROFILE_FAILED,
                             _EVENT_MODIFY_USER_PROFILE_OK,
                             _EVENT_MODIFY_USER_PROFILE_FAILED,
                             _EVENT_SET_CURRENT_USER_PROFILE_OK,
                             _EVENT_SET_CURRENT_USER_PROFILE_FAILED,
                             _EVENT_SET_POLICY_MODIFIER_OK,
                             _EVENT_SET_POLICY_MODIFIER_FAILED,
                             _EVENT_RESET_DEFAULT_PROFILE_OK,
                             _EVENT_RESET_DEFAULT_PROFILE_FAILED,
                             _EVENT_ADD_RESTRICTED_CHANNEL_OK,
                             _EVENT_ADD_RESTRICTED_CHANNEL_FAILED,
                             _EVENT_ADD_TIME_WINDOW_OK,
                             _EVENT_ADD_TIME_WINDOW_FAILED,
                             _EVENT_DISABLE_LOCKER_OK,
                             _EVENT_DISABLE_LOCKER_FAILED,
                             _EVENT_ENABLE_LOCKER_OK,
                             _EVENT_ENABLE_LOCKER_FAILED,
                             _EVENT_GET_ALL_RESTRICTED_CHANNELS_OK,
                             _EVENT_GET_ALL_RESTRICTED_CHANNELS_FAILED,
                             _EVENT_GET_ALL_TIMEWINDOWS_OK,
                             _EVENT_GET_ALL_TIMEWINDOWS_FAILED,
                             _EVENT_REMOVE_ALL_RESTRICTED_CHANNELS_OK,
                             _EVENT_REMOVE_ALL_RESTRICTED_CHANNELS_FAILED,
                             _EVENT_REMOVE_ALL_TIME_WINDOWS_OK,
                             _EVENT_REMOVE_ALL_TIME_WINDOWS_FAILED,
                             _EVENT_REMOVE_RESTRICTED_CHANNEL_OK,
                             _EVENT_REMOVE_RESTRICTED_CHANNEL_FAILED,
                             _EVENT_REMOVE_TIME_WINDOW_OK,
                             _EVENT_REMOVE_TIME_WINDOW_FAILED,
                             _EVENT_RESET_USER_PROFILE_OK,
                             _EVENT_RESET_USER_PROFILE_FAILED,
                             _EVENT_SET_ALL_RESTRICTED_CHANNELS_OK,
                             _EVENT_SET_ALL_RESTRICTED_CHANNELS_FAILED,
                             _EVENT_SET_ALL_TIME_WINDOWS_OK,
                             _EVENT_SET_ALL_TIME_WINDOWS_FAILED
                             ],

        _isUserAuthEnabled = false,
        _users = [],
        _USER_TYPES = {
            MASTER: 1,
            CUSTOM: 2,
            DEFAULT: 3
        },
        _currentUser = null,
        _DEFAULT_USER_AGE = 18,
        _DEFAULT_RESTRICTED_CHANNELS = [];

    function _addUser(type, pin, property) {
        var userObj = {
            type: type,
            pin: pin,
            property: property
        };
        _users.push(userObj);
    }

    function _getMasterPin() {
        var i;
        for (i = 0; i < _users.length; i += 1) {
            if (_users[i].type === _USER_TYPES.MASTER) {
                return _users[i].pin;
            }
        }
    }

    function _getDefaultUser() {
        var i;
        for (i = 0; i < _users.length; i += 1) {
            if (_users[i].type === _USER_TYPES.DEFAULT) {
                return _users[i];
            }
        }
    }

    function _getDefaultUserIndex() {
        var i;
        for (i = 0; i < _users.length; i += 1) {
            if (_users[i].type === _USER_TYPES.DEFAULT) {
                return i;
            }
        }
    }

    function _getUserForPin(pin) {
        var i;
        for (i = 0; i < _users.length; i += 1) {
            if (_users[i].pin === pin) {
                return _users[i];
            }
        }
    }

    function _getUserIndexForPin(pin) {
        var i;
        for (i = 0; i < _users.length; i += 1) {
            if (_users[i].pin === pin) {
                return i;
            }
        }
    }

   /*
    * The object exists since the beginning (v5.0.0)
    */
    _obj = {
        //PolicyType
        POLICY_NONE: 1,
        POLICY_UNTIL_MAX_TIMEOUT: 2,
        POLICY_UNTIL_NEXT_CHANNEL: 3,
        POLICY_UNTIL_NEXT_EVENT: 4,
        POLICY_UNTIL_TIMEOUT: 5,

        changeMasterPin: function (masterPin, newPin) {
            var index,
                _handle = CCOM.stubs.getHandle();
            if (masterPin === _getMasterPin()) {
                index = _getUserIndexForPin(masterPin);
                _users[index].pin = newPin;
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CHANGE_MASTER_PIN_OK, {
                    target: this,
                    handle: _handle
                });
                return _handle;
            }
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CHANGE_MASTER_PIN_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "InvalidParameter",
                    message: "error"
                }
            });
            return _handle;
        },

        createMasterPin: function (masterPin) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CREATE_MASTER_PIN_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "InvalidParameter",
                    message: "error"
                }
            });
            return _handle;

        },

        deleteMasterPin: function (masterPin) {
            var _handle = CCOM.stubs.getHandle(),
                storedMasterPin = _getMasterPin();
            if (masterPin === storedMasterPin) {
                this.setCurrentUserProfile(masterPin);
                _users = [];
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DELETE_MASTER_PIN_OK, {
                    target: this,
                    handle: _handle
                });
                return _handle;
            }
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DELETE_MASTER_PIN_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "InvalidParameter",
                    message: "error"
                }
            });
            return _handle;
        },

        disableSystem: function (masterPin) {
            var storedMasterPin = _getMasterPin(),
                _handle = CCOM.stubs.getHandle();
            if (masterPin === storedMasterPin) {
                this.setCurrentUserProfile(storedMasterPin);
                _isUserAuthEnabled = false;

                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DISABLE_SYSTEM_OK,  {
                    target: this,
                    handle: _handle
                });
                return _handle;
            }
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DISABLE_SYSTEM_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "InvalidParameter",
                    message: "error"
                }
            });
            return _handle;
        },

        enableSystem: function () {
            var _handle = CCOM.stubs.getHandle();
            _addUser(_USER_TYPES.MASTER, "1234", {userAge: 100, restrictedChannels: []});
            _addUser(_USER_TYPES.DEFAULT, "1111", {userAge: _DEFAULT_USER_AGE, restrictedChannels: _DEFAULT_RESTRICTED_CHANNELS});
            this.setCurrentUserProfile("1111");
            _isUserAuthEnabled = true;
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ENABLE_SYSTEM_OK, {
                target: this,
                handle: _handle
            });
            return _handle;
        },

        getCurrentUserProfile: function () {
            var i,
                _handle = CCOM.stubs.getHandle();
            if (_isUserAuthEnabled === false) {

                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_CURRENT_USER_PROFILE_FAILED, {
                    target: this,
                    handle: _handle,
                    error: {
                        domain: "com.opentv.UserAuth",
                        name: "SystemNotAuth",
                        message: "error"
                    }
                });
                return _handle;
            }
            for (i = 0; i < _users.length; i += 1) {
                if (_users[i].pin === _currentUser) {
                    CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_CURRENT_USER_PROFILE_OK, {
                        target: this,
                        handle: _handle,
                        property: _users[i].property
                    });
                    return _handle;
                }
            }
        },

        getPolicyModifier: function () {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_POLICY_MODIFIER_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;

        },

        getUserProfile: function (userPin) {
            var retrievedUser,
                eventRaised = false,
                _handle = CCOM.stubs.getHandle();
            if (!userPin) {
                retrievedUser = _getDefaultUser();
            } else {
                if (userPin === _getMasterPin()) {
                    eventRaised = true;
                    CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_USER_PROFILE_FAILED, {
                        target: this,
                        handle: _handle,
                        error: {
                            domain: "com.opentv.UserAuth",
                            name: "InvalidParameter",
                            message: "error"
                        }
                    });
                    return _handle;
                }
                retrievedUser = _getUserForPin();
            }

            if (retrievedUser) {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_USER_PROFILE_OK, {
                    target: this,
                    handle: _handle
                });
                return _handle;
            }
            if (!eventRaised) {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_USER_PROFILE_FAILED, {
                    target: this,
                    handle: _handle,
                    error: {
                        domain: "com.opentv.UserAuth",
                        name: "InvalidParameter",
                        message: "error"
                    }
                });
                return _handle;
            }
        },

        modifyUserProfile: function (masterPin, userPin, profileObj) {
            var retrievedUserIndex,
                prop,
                _handle = CCOM.stubs.getHandle();
            if (masterPin === _getMasterPin()) {
                if (!userPin) {
                    retrievedUserIndex = _getDefaultUserIndex();
                } else {
                    retrievedUserIndex = _getUserIndexForPin(userPin);
                }
                for (prop in profileObj) {
                    if (profileObj.hasOwnProperty(prop)) {
                        _users[retrievedUserIndex].property[prop] = profileObj[prop];
                    }
                }
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_MODIFY_USER_PROFILE_OK, {
                    target: this,
                    handle: _handle
                });
                return _handle;
            }
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_MODIFY_USER_PROFILE_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "InvalidParameter",
                    message: "error"
                }
            });

            return _handle;
        },

        setCurrentUserProfile: function (pin) {
            var _handle = CCOM.stubs.getHandle();
            _currentUser = pin;
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_CURRENT_USER_PROFILE_OK, {
                target: this,
                handle: _handle
            });
            return _handle;
        },

        setPolicyModifier: function (masterPin, policies) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_POLICY_MODIFIER_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "InvalidParameter",
                    message: "error"
                }
            });

            return _handle;
        },

        resetDefaultProfile: function () {
            var _handle = CCOM.stubs.getHandle();
            _users = [];
            _currentUser = null;
            _DEFAULT_USER_AGE = 18;
            _DEFAULT_RESTRICTED_CHANNELS = [];

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_RESET_DEFAULT_PROFILE_OK, {
                target: this,
                handle: _handle
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
     * Changes are introduced in 5.1.1
     */
    if (_ver >= CCOM.stubs.MW_VER_5_1_1) {
        _obj.addRestrictedChannel = function (masterPin, serviceId) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_ADD_RESTRICTED_CHANNEL_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.addTimeWindow = function (masterPin, timeWindow) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_ADD_TIME_WINDOW_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.disableLocker = function (masterPin, lockType) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_DISABLE_LOCKER_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.enableLocker = function (lockType) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_ENABLE_LOCKER_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.getAllRestrictedChannels = function () {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_GET_ALL_RESTRICTED_CHANNELS_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.getAllTimeWindows = function () {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_GET_ALL_TIMEWINDOWS_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.removeAllRestrictedChannels = function (masterPin) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_REMOVE_ALL_RESTRICTED_CHANNELS_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.removeAllTimeWindows = function (masterPin) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_REMOVE_ALL_TIME_WINDOWS_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.removeRestrictedChannel = function (masterPin, serviceId) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_REMOVE_RESTRICTED_CHANNEL_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.removeTimeWindow = function (masterPin, twName) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_REMOVE_TIME_WINDOW_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.resetUserProfile = function () {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_RESET_USER_PROFILE_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.setAllRestrictedChannels = function (masterPin, channelList) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE,  _EVENT_SET_ALL_RESTRICTED_CHANNELS_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });
            return _handle;
        };

        _obj.setAllTimeWindows = function (masterPin, timeWindowList) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_ALL_TIME_WINDOWS_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.UserAuth",
                    name: "GenericError",
                    message: "error"
                }
            });

            return _handle;
        };
    }

    /*
     * No changes in 5.1.2
     */

    return _obj;
}());

