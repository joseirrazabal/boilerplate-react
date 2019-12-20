/**

 * Stub for CCOM 2.0 CCOM.ConditionalAccess, an singleton added in v5.0.0

 */



var CCOM = window.CCOM || {};



CCOM.ConditionalAccess = CCOM.ConditionalAccess || (function () {

    "use strict";

    var _obj, _supportedEvents, _obsoletedEvents, _newEvents,

        _ver = CCOM.stubs.getCurrentMWVersion(),

        _id  = CCOM.stubs.uuid(),

        _ns  = "CCOM.ConditionalAccess",



        // events in v5.0.0 and v5.1.1

        _EVENT_ON_IRD_MAIL_NEW       = "onIrdMailNew",

        _EVENT_ON_IRD_POPUP_NEW      = "onIrdPopupNew",

        _EVENT_ON_IRD_POPUP_REMOVE   = "onIrdPopupRemove",

        _EVENT_ON_SMARTCARD_INSERTED = "onSmartcardInsered",

        _EVENT_ON_SMARTCARD_REMOVED  = "onSmartcardRemoved",

        _EVENT_ON_SMARTCARD_UPDATED  = "onSmartcardUpdated",

        _EVENT_ON_IRD_SOFTWARE_DOWNLOAD = "onIrdSoftwareDownload",  // this one is removed from v5.1.2



        // events added in v5.1.2

        _EVENT_ON_IRD_CMD            = "onIrdCmd";





    _supportedEvents = [

        _EVENT_ON_IRD_MAIL_NEW,

        _EVENT_ON_IRD_POPUP_NEW,

        _EVENT_ON_IRD_POPUP_REMOVE,

        _EVENT_ON_SMARTCARD_INSERTED,

        _EVENT_ON_SMARTCARD_REMOVED,

        _EVENT_ON_SMARTCARD_UPDATED,

        _EVENT_ON_IRD_SOFTWARE_DOWNLOAD

    ];



    _obj = {

        // smartcardState

        OK                              : 0,

        ERROR                           : 1,

        MUTE                            : 2,

        INVALID                         : 3,

        BLACKLISTED                     : 4,

        SUSPENDED                       : 5,

        NEVER_PAIRED                    : 6,

        NOT_PAIRED                      : 7,

        EXPIRED                         : 8,

        NOT_CERTIFIED                   : 9,

        INCOMPATIBLE                    : 10,



        // smartcardFlags

        CLEAN                           : 1,

        VIRGIN                          : 2,

        DLST_OBSERVED                   : 4,

        PROCESSED_EMM_UN                : 8,



        // systemFlags

        SOFTWARE_UPGRADE_RECOMMENDED    : 1,

        SOFTWARE_UPGRADE_REQUIRED       : 2,



        // mailPriority

        normal                          : 0,

        high                            : 1,

        emergency                       : 2,



        // popupPersistence

        // normal                       : 0,  // the same value as for mailPriority

        timeout                         : 1,

        userAck                         : 2,



        // caAccess

        CLEAR                           : 0,

        GRANTED                         : 1,

        FREE                            : 2,

        DENIED                          : 100,

        NO_VALID_SECURE_DEVICE          : 101,

        BLACKED_OUT                     : 104,

        DENIED_NO_VALID_CREDIT          : 105,

        DENIED_COPY_PROTECTED           : 106,

        DENIED_PARENTAL_CONTROL         : 107,

        DENIED_DIALOG_REQUIRED          : 108,

        DENIED_PAIRING_REQUIRED         : 109,

        DENIED_CHIPSET_PAIRING_REQUIRED : 110,

        EMI_UNSUPPORTED                 : 111,



        // productType

        UNDEFINED                       : 0,

        EVENT                           : 1,

        SERVICE                         : 2,

        SERVICE_PACKAGE                 : 3,

        EVENT_PACKAGE                   : 4,

        N_OF_M_SHOWINGS                 : 5,

        N_OF_M_EVENTS                   : 6,

        N_OF_M_CHANNELS                 : 7,

        PAY_PER_TIME                    : 8,

        PPT_BY_POINTS                   : 11,

        FREE_PREVIEW                    : 16,

        VOD_RENTAL                      : 17,

        VOD_PACKAGE                     : 18,

        VOD_SUBSCRIPTION                : 19,

        RENTAL_SUBSCRIPTION             : 20,



        // productFlags

        PURCHASABLE                     : 1,

        PURCHASED                       : 2,

        NOT_LOADED                      : 4,

        IMPULSIVE                       : 8,

        OFFLINE_PURCHASE                : 8,

        ONLINE_PURCHASE                 : 16,

        SMS_PURCHASE                    : 32,

        MULTIPLE_PURCHASE               : 64,

        OFFLINE_CONSUMPTION             : 128,



        // properties: none for v5.0.0



        // methods: 10 methods for v5.0.0

        getEventInfo: function (eventId) {

            return {

                caAccess: this.CLEAR,

                previewTime: 0,

                products: {}

            };

        },

        getIrdAllMail: function () {

            return {

                mailInfo: {}

            };

        },

        getIrdMail: function (mailId) {

            return {

                message: ""

            };

        },

        getIrdPopupMessage: function () {

            return {

                popupInfo: {}

            };

        },

        getServiceAccess: function (serviceId) {

            return {

                //FREE

                caAccess: this.FREE

            };

        },

        getSmartcardInfo: function () {

            return {

                smartcardInfo: {

                    // serialNumber: "00142883428",
                    serialNumber: "245705069313",

                    version: "1.0",

                    setId: 0



                }

                // cardinfo: {

                //     smartcardSlotId: 0,

                //     smartcardStatus: "SC_OK",

                //     smartcardNum: "00142773428"

                // }

            };

        },

        getSystemInfo: function () {

            return {

                systemInfo: {

                    chipsetPairingSaId: 0x1d,

                    projectInformation: "Conax",

                    chipsetRevision: "1.0",

                    chipsetType: "Fake",

                    nuid: 123,

                    flags: 987,

                    version : "1.0"

                }



                // systeminfo: {

                //       caSystemId: 0,

                //       name: "Conax",

                //       softwareVersion: "1.0",

                //       interfaceVersion: "1.1",

                //       chipsetId: 123,

                //       deviceId: 987

                // }

            };

        },



        removeIrdMail: function (mailId) {

            return {

                error: {

                    domain: "com.opentv.ConditionalAccess",

                    name: "OperationFailed",

                    message: "The operation has failed because the mail ID does not exist."

                }

            };

        },



	    //5.0 and 5.1.1 doc do not include this function, but if it is not defined, gravity can not be run.

        getPinCodeList: function () {

            return {

                error: {

                    domain: "com.opentv.ConditionalAccess",

                    name: "OperationFailed",

                    message: "The operation has failed"

                }

            };

        },



	    //5.0 and 5.1.1 doc do not include this function, but if it is not defined, gravity can not be run.

        getPurchaseHistoryList: function () {

            return {

                error: {

                    domain: "com.opentv.ConditionalAccess",

                    name: "OperationFailed",

                    message: "The operation has failed"

                }

            };

        },



        addEventListener: function (event, callback) {

            if (_supportedEvents.indexOf(event) === -1) {

                return CCOM.stubs.ERROR_INVALID_EVENT;

            }

            return CCOM.stubs.addEventListener(_id, _ns, event, callback);

        },

        removeEventListener : function (event, callback) {

            if (_supportedEvents.indexOf(event) === -1) {

                return CCOM.stubs.ERROR_INVALID_EVENT;

            }

            return CCOM.stubs.removeEventListener(_id, _ns, event, callback);

        }

    };



    /*

     * There is no changes in v5.1.1

     */



    /*

     * Changes introduced in v5.1.2

     */



    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {



        /*

         * added enums

         */

        // creditFlags

        // SUSPENDED                    : 1,  smartcardState:SUSPENDED

        // EXPIRED                      : 2,  smartcardState:EXPIRED



        // pinCodeFlags

        // SUSPENDED                    : 1,  smartcardState:SUSPENDED

        _obj.BLOCKED = 2;

        _obj.UNLIMITED = 4;



        // stringEncodingFormat

        _obj.NUMERIC = 0;

        _obj.BCD = 1;

        _obj.ASCII = 2;



        // rechargeReason

        _obj.USER_REQUEST = 0;

        _obj.PROMOTION = 1;

        _obj.REFUND = 2;



        // purchaseFlags

        _obj.WATCHED = 1;

        _obj.REFUNDED = 2;

        // PENDED                       : 4,  creditFlags:SUSPENDED

        // note: there is no item for values for 8 and 32!

        _obj.USED_CARD_CREDIT = 16;

        _obj.CONDITIONAL = 64;

        _obj.COLLECTED = 128;

        _obj.WATCHED_TO_REPORT = 256;



        // purchaseMode

        _obj.OFFLINE = 0;

        _obj.ONLINE = 1;

        _obj.SMS = 2;

        _obj.UNKNOWN = 3;

        _obj.FREE_PRELOADED = 4;



        // consumptionMode

        _obj.CONTINUOUS = 0;

        _obj.ONE_SHOT = 1;



        /*

         * events: obsoleted and newly added

         */

        _obsoletedEvents = [ _EVENT_ON_IRD_SOFTWARE_DOWNLOAD ];

        _supportedEvents = _supportedEvents.filter(function (x) {

            return (-1 === _obsoletedEvents.indexOf(x));

        });



        _newEvents = [ _EVENT_ON_IRD_CMD ];

        _supportedEvents = _supportedEvents.concat(_newEvents);





        /*

         * methods

         */

        _obj.changePinCode          = function (pinCodeId, newPinCodeData, currentPinCodeData, encodingFormat) {

            //An empty return object indicates success

            return {};

        };

        _obj.getCreditList          = function () {

            return [];

        };

        _obj.validatePinCode        = function (pinCodeId, currentPinCodeData, encodingFormat) {

            //An empty return object indicates success

            return {};

        };

        _obj.enableConsumption      = function (consumptionRequestInfo) {

            //An empty return object indicates success

            return {};

        };

        _obj.getRechargeHistoryList = function () {

            return [];

        };

        _obj.purchaseProduct        = function (purchaseRequestInfo) {

            //An empty return object indicates success

            return {};

        };

    }



    return _obj;

}());

