/**
 * CCOM2.0 Stubs
 *
 * The CCOM.stubs object is the extra object only exists in CCOM Stubs.
 *
 * jslint browser: true, nomen: true, sloppy: true, vars: true, indent: 4
 */

window.gc = function () {};

var CCOMStub = window.CCOM || {};

CCOMStub.stubs = CCOMStub.stubs || (function () {
    "use strict";
    var _CCOM_STUBS_VERSION = "1.1",
        _MW_VER_5_0_0 = "5.0",
        _MW_VER_5_1_1 = "5.1.1",
        _MW_VER_5_1_2 = "5.1.2",

        _supportedMWVersions = [ _MW_VER_5_0_0,
                                 _MW_VER_5_1_1,
                                 _MW_VER_5_1_2
                               ],

        // by default we emulate the latest MW version
        _currentMWVersion = _MW_VER_5_1_2,

        // default delay for raising events, in milliseconds
        _EVENT_DELAY_MS = 2000,


        _ERROR_NOT_REGISTERED = {
            error: {
                domain: "com.opentv.ccom",
                name: "HandlerNotRegistered",
                message: "The handler is not registered."
            }
        },

        _ERROR_INVALID_CALLBACK = {
            error: {
                domain: "com.opentv.ccom",
                name: "InvalidArguments",
                message: "The callback is invalid."
            }
        },

        _ERROR_INVALID_EVENT = {
            error: {
                domain: "com.opentv.ccom",
                name: "InvalidArguments",
                message: "The event is invalid."
            }
        },

        _SUCCESS = {},

        /**
         * The internal object _eventListeners is a single container for all event listeners on all CCOM stubs objects.
         * In the container, each event-emitting object is a key-value pair, where the "key" is a string identifing the
         * object, and the "value" is an one-dimensional array of registered callback functions. e.g., the container may
         * look like:
         *
         *  {
         *    "1234.CCOM.AIM.addOK"    : [callback1, callback2],
         *    "1234.CCOM.AIM.deleteOK" : [callback]
         *  }
         *
         * The "key" is composed of 3 parts:
         * - the object uuid, e.g., "1234"
         * - the object name space, e.g.: "CCOM.AIM"
         * - the event name, e.g., "addOk"
         *
         * The "uuid" is used to handle cases where multiple instances (e.g., players) may exist at the same time (although most
         * of the CCOM objects are singletons).
         * This implies that each object in CCOM stubs has its own uuid. The uuid is private to each object, and CCOM.stubs.uuid()
         * is supposed to return one once called.
         */
        _eventListeners = {},
        _getPropName = function (uuid, namespace, event) {
            return uuid + "." + namespace + "." + event;
        },

        /**
         * utilities
         */

        // get universal unique id (in string)
        _uuid = (function (init) {
            var _id = init;
            return function () { _id += 1; return _id.toString(); };
        }(2014)),

       // get universal unique handle 
        _getHandle = (function () {
            var _handle = 0;
            return function () { _handle += 1; return _handle; };
        }()),

        CCOM_stub_files = [
            "AIM.js",
            "Application.js",
            "ApplicationManager.js",
            "ApplicationTime.js",
            "ConditionalAccess.js",
            "ConfigManager.js",
            "EPG.js",
            "HomeNetworking.js",
            "IpNetwork.js",
            "MediaLibrary.js",
            "Player.js",
            "ResultSet.js",
            "Scheduler.js",
            "SINetwork.js",
            "SoftwareUpgradeManager.js",
            "System.js",
            "UserAuth.js",
            "WindowManager.js",
            "DRM.js",
            "HomeNetworkingSrs.js",
            "Notify.js",
            "PowerManager.js"
        ];

    /**
     * This is a CCOM stubs internal function to be called by each objects, not to be called by applications.
     * @param {String} event The event name prefixed with object's name space. e.g., "CCOM.AIM.onNew"
     * @param {String} uuid The uuid of the object listening to
     * @param {String} namespace The name space of the object
     * @param {Function} callback The callback function of the event from the object
     * @return ???
     */
    function _addEventListener(uuid, namespace, event, callback) {
        /**
         * note: each individual object should check the "event" parameter before call this one,
         * as the object knows the exact details of the events it suports. it's also assumed that
         * each object has its own proper uuid and namespace.
         * i.e., we don't check "uuid", "namespace", and "event" parameters here.
         */
        var prop = _getPropName(uuid, namespace, event);

        // "callback" parameter is checked here in common
        if (!callback) {
            return _ERROR_INVALID_CALLBACK;
        }

        if (_eventListeners[prop] === undefined) {
            _eventListeners[prop] = [];
        }
        _eventListeners[prop].push(callback);

        /**
         * The CCOM document said three ways for return:
         * a. No return, unless an error is generated
         * b. Returns:
         *    0 - Success
         *    1 - Unsupported event
         *    2 - Bad argument (eventHandler is null, or eventName is null)
         * c. RETURN DETAILS:
         *    ......
         *    An empty return object indicates success
         *
         * WHICH ONE WHOULD WE FOLLOW?
         */
        return _SUCCESS;
    }

    function _removeEventListener(uuid, namespace, event, callback) {

        var i, hit = false,
            prop = _getPropName(uuid, namespace, event),
            listeners = _eventListeners[prop];

        // "callback" parameter is checked here in common
        if (!callback) {
            return _ERROR_INVALID_CALLBACK;
        }

        if (!listeners) {
            return _ERROR_NOT_REGISTERED;
        }

        for (i = 0; i < listeners.length; i += 1) {
            if (listeners[i] === callback) {
                listeners.splice(i, 1);
                hit = true;
            }
        }

        if (!hit) {
            return _ERROR_NOT_REGISTERED;
        }

        return _SUCCESS;
    }

    function _raiseEvent(uuid, namespace, event, parameter, delay) {
        window.setTimeout(function () {
            var prop = _getPropName(uuid, namespace, event),
                listeners = _eventListeners[prop];
            if (listeners) {
                listeners.forEach(function (hook) { hook(parameter); });
            }
        }, delay || _EVENT_DELAY_MS);
    }

    return {
        // mw versions
        MW_VER_5_0_0: _MW_VER_5_0_0,
        MW_VER_5_1_1: _MW_VER_5_1_1,
        MW_VER_5_1_2: _MW_VER_5_1_2,

        /**
         * Load CCOM stub files one by one synchronously
         * @method loadStubs
         * @param {String} path for loading the CCOM stubs files
         * @param {Function} callback function when done
         */
        loadStubs: function (path, doneCallback) {
            var index = 0,
                load_file_synchronously = function () {
                    if (index < CCOM_stub_files.length) {
                        var script = document.createElement("script");
                        script.type = "text/javascript";
                        script.src = path + CCOM_stub_files[index];
                        script.onload = load_file_synchronously;
                        index++;
                        document.getElementsByTagName('head')[0].appendChild(script);
                    } else if (doneCallback) {
                        doneCallback();
                    }
                };

            load_file_synchronously();
        },

        log : function (msg) {
            if (window.console && window.console.log) {
                window.console.log("[CCOM.stub.log] " + msg);
            }
        },

        getVersion: function () {
            return _CCOM_STUBS_VERSION;
        },

        getSupportedMWVersions: function () {
            return _supportedMWVersions;
        },

        getCurrentMWVersion: function () {
            return _currentMWVersion;
        },

        require: function (ver) {
            if (-1 === _supportedMWVersions.indexOf(ver)) {
                return false;
            }
            _currentMWVersion = ver;
            return true;
        },

        // error/success objects for global methods: add/removeEventListener()
        ERROR_INVALID_CALLBACK : _ERROR_INVALID_CALLBACK,
        ERROR_INVALID_EVENT    : _ERROR_INVALID_EVENT,
        ERROR_NOT_REGISTERED   : _ERROR_NOT_REGISTERED,
        SUCCESS                : _SUCCESS,

        addEventListener    : _addEventListener,
        removeEventListener : _removeEventListener,
        raiseEvent          : _raiseEvent,

        // utilities
        getHandle: _getHandle,
        uuid : _uuid
    };
}());

window.CCOM = CCOMStub;

require("./AIM");
require("./Application");
require("./ApplicationManager");
require("./ApplicationTime");
require("./ConditionalAccess");
require("./ConfigManager");
require("./EPG");
require("./HomeNetworking");
require("./IpNetwork");
require("./MediaLibrary");
require("./Player");
require("./ResultSet");
require("./Scheduler");
require("./SINetwork");
require("./SoftwareUpgradeManager");
require("./System");
require("./UserAuth");
require("./WindowManager");
require("./DRM");
require("./HomeNetworkingSrs");
require("./Notify");
require("./PowerManager");

export default CCOMStub;
