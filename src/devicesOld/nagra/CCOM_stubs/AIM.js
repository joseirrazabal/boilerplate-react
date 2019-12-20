/**
 * Stub for CCOM 2.0 AIM (Application Information Manager): CCOM.AppinfoManager
 *
 * This object has been added since OTV 5.1.1, for managing apps information
 */


var CCOM = window.CCOM || {};
CCOM.AppinfoManager = CCOM.AppinfoManager || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.AppinfoManager",
        _id = CCOM.stubs.uuid(),

        // events in xml
        _EVENT_ON_NEW = "onNew",
        _EVENT_ON_DELETE = "onDelete",
        _EVENT_ON_UPDATE = "onUpdate",

        // events from methods
        _EVENT_ADD_OK = "addOK",
        _EVENT_ADD_FAIL = "addFAIL",
        _EVENT_UPDATE_OK = "updateOK",
        _EVENT_UPDATE_FAIL = "updateFail",
        _EVENT_DELETE_OK = "deleteOK",
        _EVENT_DELETE_FAIL = "deleteFail",
        _EVENT_QUERY_OK = "queryOK",
        _EVENT_QUERY_FAIL = "queryFail",
        _EVENT_GET_APPINFO_OK = "getAppinfoByQueryOK",
        _EVENT_GET_APPINFO_FAIL = "getAppinfoByQueryFail",

        _supportedEvents = [ _EVENT_ON_NEW,
                             _EVENT_ON_DELETE,
                             _EVENT_ON_UPDATE,

                             _EVENT_ADD_OK,
                             _EVENT_ADD_FAIL,
                             _EVENT_UPDATE_OK,
                             _EVENT_UPDATE_FAIL,
                             _EVENT_DELETE_OK,
                             _EVENT_DELETE_FAIL,
                             _EVENT_QUERY_OK,
                             _EVENT_QUERY_FAIL,
                             _EVENT_GET_APPINFO_OK,
                             _EVENT_GET_APPINFO_FAIL
                           ],

        // each added app is an obj occupying one slice in this array
        _apps = [],

        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {};

    if (_ver < CCOM.stubs.MW_VER_5_1_1) {
        return;
    }

    _obj = {

        //o_aim_metadata_type_t
        O_AIM_METADATA_OPENTV5 : 1,
        O_AIM_METADATA_UNKNOWN : 2,

        /**
         * @method add
         * @param {String} source The location of the metadata, in subset form
         * @param {Number} subsetType The type of the metadata
         * @param {String} sig The signature for the metadata (if any)
         * @param {Boolean} runnable True if the metadata is runnable, False if temporary
         * @return {String} id Identify the entry in the database. This can be UUID or a temporary ID.
         */
        add: function (source, subsetType, sig, runnable) {

            var app_id;

            if (arguments.length < 4) {
                throw "usage: CCOM.AIM.add(source, subsetType, sig, runnable)";
            }
            if ((typeof source !== 'string') || source.constructor !== String) {
                throw "The first param should be string!";
            }
            if ((typeof subsetType !== 'number') || subsetType.constructor !== Number) {
                throw "The second parm should be number!";
            }
            if ((typeof sig !== 'string') || sig.constructor !== String) {
                throw "The third param should be string!";
            }
            if ((typeof runnable !== 'boolean') || runnable.constructor !== Boolean) {
                throw "The fourth param should be boolean!";
            }

            app_id = CCOM.stubs.uuid();
            _apps[_apps.length] = {
                id : app_id,
                source : source,
                subsetType : subsetType,
                sig : sig,
                runnable : runnable
            };

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_OK, {
                target : this,
                handle : app_id,
                id : app_id
            });

            return app_id;
        },

        /**
         * Delete apps from AIM
         * @method delete
         * @param {Array} idList An array of UUIDs (string)
         * @return {Array} invalid list of UUIDs (string)
         * note that JSlint is not happy with the name of this method as it is a reserved keyword, so it has to be quoted.
         */
        "delete" : function (idList) {
            var i, j, cloneList, hdl;

            if (arguments.length < 1) {
                throw "usage: CCOM.AIM.delete(idList)";
            }

            if ((typeof idList !== 'object') || idList.constructor !== Array) {
                throw "The first param should be an array!";
            }

            // clone the list, for emitting onDelete event
            cloneList = idList.filter(function () { return true; });

            for (i = 0; i < idList.length; i += 1) {
                for (j = 0; j < _apps.length; j += 1) {
                    if (idList[i] === _apps[j].id) {
                        _apps.splice(j, 1);
                        idList.splice(i, 1);
                        i -= 1;
                        break;
                    }
                }
            }

            hdl = CCOM.stubs.getHandle();

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_DELETE_OK, {
                target : this,
                handle : hdl,
                invalidIdList : idList
            });

            return hdl;
        },

        /**
         * @method getAppinfoByQuery
         * @param {String} properties The comma-separated metadata properties the client is interested in, e.g. UUID, UID, GID, APP_ID
         * @param {String} criteria The criteria for selecting the entry. If ther eare multiple criteria, they must be separated by 'AND'.
         * @param {String} orderby How to order the resultset
         * @param {Number} maxCount The maximum number of rows that can be returned.
         * @return {Object} applicationInfo An array consisting of hashtables with requested application data. The hashtable consists of metadata properties as keynames and their values.
         */
        getAppinfoByQuery: function (properties, criteria, orderby, maxCount) {
            var hdl = CCOM.stubs.getHandle();

            if (arguments.length < 4) {
                throw "usage: CCOM.AIM.getAppinfoByQuery(properties, criteria, orderby, maxCount)";
            }
            if (properties.constructor !== String) {
                throw "The first param should be string!";
            }
            if (criteria.constructor !== String) {
                throw "The second param should be string!";
            }
            if (orderby.constructor !== String) {
                throw "The third param should be string!";
            }
            if (maxCount.constructor !== Number) {
                throw "The fourth parm should be number!";
            }

            // FIXME: actually do the query

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_APPINFO_OK, {
                target: this,
                handle: hdl,
                applicationInfo: [{NAME: "test1", UUID: "1234"},
                                  {NAME: "test2", UUID: "1235"},
                                  {NAME: "Appstore", UUID: "1236"}]
            });

            return hdl;
        },

        /**
         * @method update
         * @param {String} source The metadata with update information
         * @param {Number} subsetType The type of the metadata
         * @param {String} sig The signature associated with the metadata, if any
         * @param {String} uuid The UUID that identifies the entry to be updated
         * @return no return (according to xml)
         */
        update: function (source, subsetType, sig, uuid) {
            var hdl = CCOM.stubs.getHandle();

            if (arguments.length < 4) {
                throw "usage: CCOM.AIM.update(source, subsetType, sig, uuid)";
            }
            if ((typeof source !== 'string') || source.constructor !== String) {
                throw "The first param should be string!";
            }
            if ((typeof subsetType !== 'number') || subsetType.constructor !== Number) {
                throw "The second parm should be number!";
            }
            if ((typeof sig !== 'string') || sig.constructor !== String) {
                throw "The third param should be string!";
            }
            if ((typeof uuid !== 'string') || uuid.constructor !== String) {
                throw "The fourth param should be string!";
            }

            // FIXME: actually do the update
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ON_UPDATE, {
                target : this,
                uuid : hdl
            });

            return hdl;
        },

        /**
         * @method query
         * @param {Array} fields The metadata fields in which the client is interested
         * @param {Array} filters The criteria used to select the entry
         * @param {String} sortBy How to order the resultset
         * @param {Number} firstNRs Send back te first n resultset data when returning from the call
         * @return ??
         */
        query : function (fields, filters, sortBy, firstNRs) {
            var hdl = CCOM.stubs.getHandle();

            if (arguments.length < 4) {
                return "usage: CCOM.AIM.query(fields,filters,sortBy, firstNRs)";
            }
            if ((typeof fields !== 'object') || fields.constructor !== Array) {
                return "The first param should be an array!";
            }
            if ((typeof filters !== 'object') || filters.constructor !== Array) {
                return "The second param should be an array!";
            }
            if ((typeof sortBy !== 'string') || sortBy.constructor !== String) {
                return "The third param should be string!";
            }
            if ((typeof firstNRs !== 'number') || firstNRs.constructor !== Number) {
                return "The fourth parm should be number!";
            }

            // FIXME: do the actual query
            // the function documentation is not consistent though...

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_QUERY_OK, {
                target : this,
                handle : hdl
            });

            return hdl;
        },

        /**
         * @method addEventListener
         * @param {String} eventName The name of the event to listen for
         * @param {Function} eventHandler The event handler function to be called when an event occurs
         * @return {Object} An empty object indicates success; otherwise failure.
         */
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

    // This is wierd: 5.1.2 deleted the query() method from 5.1.1!
    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {
        // remove two events from the _supportedEvents[]
        _supportedEvents.splice(_supportedEvents.indexOf(_EVENT_QUERY_OK), 1);
        _supportedEvents.splice(_supportedEvents.indexOf(_EVENT_QUERY_FAIL), 1);
        delete _obj.query;
    }
    return _obj;
}());
