/**

 * Stub for CCOM 2.0 DVB Network: CCOM.SINetwork, a singleton added since v5.0.0

 */



var CCOM = window.CCOM || {};



CCOM.SINetwork = CCOM.SINetwork || (function () {

    //"use strict";

    var _obj = {},

        _ver = CCOM.stubs.getCurrentMWVersion(),

        _id  = CCOM.stubs.uuid(),

        _ns  = "CCOM.SINetwork",



        // supported events

        _EVENT_ON_SCAN_PROGRESS           = "onScanProgress",

        _EVENT_ON_SCAN_COMPLETE           = "onScanComplete",

        _EVENT_ON_SCAN_ERROR              = "onScanError",



        _EVENT_LOCK_CONFIGURATION_OK      = "lockConfigurationOK",

        _EVENT_LOCK_CONFIGURATION_FAILED  = "lockConfigurationFailed",



        _EVENT_GET_CONNECTION_INFO_OK     = "getConnectionInfoOK",

        _EVENT_GET_CONNECTION_INFO_FAILED = "getConnectionInfoFailed",



        _EVENT_GET_SCAN_PROGRESS_OK       = "getScanProgressOK",

        _EVENT_GET_SCAN_PROGRESS_FAILED   = "getScanProgressFailed",



        _supportedEvents = [

            _EVENT_ON_SCAN_PROGRESS,

            _EVENT_ON_SCAN_COMPLETE,

            _EVENT_ON_SCAN_ERROR,



            _EVENT_LOCK_CONFIGURATION_OK,

            _EVENT_LOCK_CONFIGURATION_FAILED,



            _EVENT_GET_CONNECTION_INFO_OK,

            _EVENT_GET_CONNECTION_INFO_FAILED,



            _EVENT_GET_SCAN_PROGRESS_OK,

            _EVENT_GET_SCAN_PROGRESS_FAILED

        ];



    /*

     * this object exists since the begining (v5.0.0)

     */

    _obj = {

        //ScanErrorCondition

        UNKNOWN_ERROR        : -1,

        RESOURCE_UNAVAILABLE : -2,

        BUSY                 : -3,

        CONNECTION_ERROR     : -4,

        SI_ERROR             : -5,

        DATABASE_FULL        : -6,

        TIMEOUT_OCCURRED     : -7,

        SCAN_CANCELED        : -8,

        CONFIGURATION_LOCKED : -9,



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

        },

        lockConfiguration: function () {

            var _handle = CCOM.stubs.getHandle(),

                evt = {

                    target: this,

                    handle: _handle

                };

            CCOM.stubs.raiseEvent(_id, _ns, _EVENT_LOCK_CONFIGURATION_OK, evt, 0);

            return evt.handle;

        },

        unlockConfiguration: function () {

            return {};  // success

        },

        scan: function (svlScanProfileName) {

            var _handle = CCOM.stubs.getHandle(),

                evt = [

                    { // onScanProgress

                        target       : this,

                        progressInfo : {

                            BER                     : 0,

                            SNR                     : 0,

                            onid                    : 1,

                            radioServicesFoundCount : 0,

                            scanHandle              : 1,

                            scannedPercent          : 10,

                            scannedTSCount          : 1,

                            signalStrength          : 100,

                            totalServicesFoundCount : 2,

                            tsid                    : 1,

                            tvServicesFoundCount    : 2

                        }

                    },

                    { // onScanComplete

                        target       : this,

                        scanHandle   : _handle

                    }

                ];



            CCOM.stubs.raiseEvent(_id, _ns, _EVENT_ON_SCAN_PROGRESS, evt[0], 0);

            CCOM.stubs.raiseEvent(_id, _ns, _EVENT_ON_SCAN_COMPLETE, evt[1], 2000);



            // return scanHandle

            return evt[1].scanHandle;

        },

        cancelScan: function (scanHandle) {

            return;

        },



        getConnectionInfo: function (sourceUri) {

            var _handle = CCOM.stubs.getHandle(),

                evt = {

                    target         : this,

                    handle         : _handle,

                    connectionInfo : {

                        signalStrength : 100,

                        SNR            : 0,

                        BER            : 0,

                        onid           : 1,

                        tsid           : 1,

                        svcid          : 1,

                        tunerType      : 0,

                        frequency      : 11953000,

                        symbolRate     : 27500,

                        fec            : 0,

                        lnbPolarization: 0

                    }

                };



            CCOM.stubs.raiseEvent(_id, _ns, _EVENT_GET_CONNECTION_INFO_OK, evt, 0);

            return evt.handle;

        },

        getScanProgress: function (scanHandle) {

            var _handle = CCOM.stubs.getHandle(),

                evt = {

                    target       : this,

                    handle       : _handle,

                    progressInfo : {

                        scanHandle              : scanHandle,

                        scannedPercent          : 50,

                        scannedTSCount          : 1,

                        totalServicesFoundCount : 2,

                        tvServicesFoundCount    : 2,

                        radioServicesFoundCount : 0,

                        onid                    : 1,

                        tsid                    : 1,

                        signalStrength          : 100,

                        SNR                     : 0,

                        BER                     : 0

                    }

                };



            CCOM.stubs.raiseEvent(_id, _ns, _EVENT_ON_SCAN_PROGRESS, evt, 0);

            return evt.handle;

        }

    };



    /*

     * There is no change introduced in v5.1.1

     */



    /*

     * Changes introduced in v5.1.2

     */

    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {

        _obj.getConnectionInfo = function (sourceUri) {

            var _handle = CCOM.stubs.getHandle(),

                evt = {

                    target         : this,

                    handle         : _handle,

                    connectionInfo : {

                        signalStrength : 100,

                        SNR            : 0,

                        BER            : 0,

                        onid           : 1,

                        tsid           : 1,

                        svcid          : 1,

                        tunerType      : 0,

                        frequency      : 11953000,

                        symbolRate     : 27500,

                        fec            : 0,

                        lnbPolarization: 0,

                        modulation     : 1   // new property added in v5.1.2

                    }

                };



            CCOM.stubs.raiseEvent(_id, _ns, _EVENT_GET_CONNECTION_INFO_OK, evt, 0);

            return evt.handle;

        };

    }



    return _obj;

}());

