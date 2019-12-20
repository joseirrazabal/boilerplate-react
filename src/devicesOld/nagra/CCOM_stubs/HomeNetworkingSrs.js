/**
 * Stub for CCOM 2.0 Home Networking SRS (Schedule Recording Service) class, which is introduced in v5.1.2.
 *
 * Note that this is not a singleton object. An instance of such an object must be created by 
 * calling CCOM.HomeNetworking.getInstance()
 */

var CCOM = window.CCOM || {};

(function initHomeNetworkingSrs() {
    "use strict";
    // constructor, must be called with 'new'
    CCOM.HomeNetworkingSrs = function (createArgs) {
        this._id = CCOM.stubs.uuid();
        this._createArgs = createArgs;
    };

    CCOM.HomeNetworkingSrs.prototype = {
        _MY_NAME_SPACE: "CCOM.HomeNetworkingSrc",
        /*
         * events
         */
        _EVENT_ON_SCHEDULE_ADDED               : "onScheduleAdded",
        _EVENT_ON_TASK_ADDED                   : "onTaskAdded",
        _EVENT_ON_SCHEDULE_UPDATED             : "onScheduleUpdated",
        _EVENT_ON_TASK_UPDATED                 : "onTaskUpdated",
        _EVENT_ON_SCHEDULE_REMOVED             : "onScheduleRemoved",
        _EVENT_ON_TASK_REMOVED                 : "onTaskRemoved",
        _EVENT_ON_CONFLICT_IMMINENT            : "onConflictImminent",

        _EVENT_CREATE_SCHEDULE_OK              : "createScheduleOK",
        _EVENT_CREATE_SCHEDULE_FAILED          : "createScheduleFailed",
        _EVENT_DELETE_SCHEDULE_OK              : "deleteScheduleOK",
        _EVENT_DELETE_SCHEDULE_FAILED          : "deleteScheduleFailed",
        _EVENT_DELETE_TASK_OK                  : "deleteTaskOK",
        _EVENT_DELETE_TASK_FAILED              : "deleteTaskFailed",
        _EVENT_GET_SCHEDULE_CONFLICTS_OK       : "getScheduleConflictsOK",
        _EVENT_GET_SCHEDULE_CONFLICTS_FAILED   : "getScheduleConflictsFailed",
        _EVENT_GET_SCHEDULES_OK                : "getSchedulesOK",
        _EVENT_GET_SCHEDULES_FAILED            : "getSchedulesFailed",
        _EVENT_GET_TASK_OK                     : "getTaskOK",
        _EVENT_GET_TASK_FAILED                 : "getTaskFailed",
        _EVENT_GET_TASK_CONFLICTS_OK           : "getTaskConflictsOK",
        _EVENT_GET_TASK_CONFLICTS_FAILED       : "getTaskConflictsFailed",
        _EVENT_GET_TASKS_FROM_SCHEDULE_OK      : "getTasksFromScheduleOK",
        _EVENT_GET_TASKS_FROM_SCHEDULE_FAILED  : "getTasksFromScheduleFailed",
        _EVENT_UPDATE_SCHEDULE_PRIORITY_OK     : "updateSchedulePriorityOK",
        _EVENT_UPDATE_SCHEDULE_PRIORITY_FAILED : "updateSchedulePriorityFailed",

        /*
         * enums
         */
        //ScheduleType
        MANUAL                                : 1,
        CDS_SERVICE                           : 2,
        CDS_EVENT                             : 3,
        BY_MATCHING_NAME                      : 4,
        BY_MATCHING_ID                        : 5,

        //MatchingIdType
        PROGRAM_ID                            : 1,
        SERIES_ID                             : 2,

        //MatchingNameType
        PROGRAM                               : 1,
        SERIES                                : 2,

        //MatchingEpisodeType
        ALL                                   : 1,
        FIRST_RUN                             : 2,
        REPEAT                                : 3,

        //ScheduleState
        SCHEDULE_STATE_OPERATIONAL            : 1,
        SCHEDULE_STATE_COMPLETED              : 2,
        SCHEDULE_STATE_ERROR                  : 3,

        //TaskState
        TASK_STATE_WAITING_FOR_START          : 1,
        TASK_STATE_RECORDING                  : 2,
        TASK_STATE_COMPLETED                  : 3,
        TASK_STATE_ERROR                      : 4,
        TASK_STATE_FATAL_ERROR                : 5,

        // ScheduleError
        SCHEDULE_ERROR_NONE                   : 1,
        SCHEDULE_ERROR_GENERAL                : 2,
        SCHEDULE_ERROR_MAX_TASK_COUNT_REACHED : 3,
        SCHEDULE_ERROR_EPG_INFO_UNAVAILABLE   : 4,
        SCHEDULE_ERROR_RS_DISABLED            : 5,
        SCHEDULE_ERROR_INSUFFICIENT_MEMORY    : 6,
        SCHEDULE_ERROR_RESOURCE_ERROR         : 7,

        /*
         * methods
         */
        createSchedule: function (details) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_CREATE_SCHEDULE_FAILED, evt, 0);
            return hdl;
        },

        deleteSchedule: function (scheduleId) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_DELETE_SCHEDULE_FAILED, evt, 0);
            return hdl;
        },

        deleteTask: function (taskId) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_DELETE_TASK_FAILED, evt, 0);
            return hdl;
        },

        getScheduleConflicts: function (scheduleId) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_GET_SCHEDULE_CONFLICTS_FAILED, evt, 0);
            return hdl;
        },

        getSchedules: function (scheduleId, startingIndex, requestCount) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_GET_SCHEDULES_FAILED, evt, 0);
            return hdl;
        },

        getTask: function (taskId) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_GET_TASK_FAILED, evt, 0);
            return hdl;
        },

        getTaskConflicts: function (taskId) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_GET_TASK_CONFLICTS_FAILED, evt, 0);
            return hdl;
        },

        getTasksFromSchedule: function (scheduleId, startingIndex, requestCount) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_GET_TASKS_FROM_SCHEDULE_FAILED, evt, 0);
            return hdl;
        },

        updateSchedulePriority: function (scheduleId, priority) {
            var hdl, evt;
            hdl = CCOM.stubs.getHandle();
            evt = {
                target : this,
                handle : hdl,
                error  : {
                    domin   : "com.opentv.HomeNetworkingSrs",
                    name    : "HnStatusError",
                    message : "not supported"
                }
            };

            CCOM.stubs.raiseEvent(this._id, this._MY_NAME_SPACE, this._EVENT_UPDATE_SCHEDULE_PRIORITY_FAILED, evt, 0);
            return hdl;
        },

        addEventListener: function (event, callback) {
            if (this._supportedEvents.indexOf(event) === -1) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }
            return CCOM.stubs.addEventListener(this._id, this._NS, event, callback);
        },
        removeEventListener: function (event, callback) {
            if (this._supportedEvents.indexOf(event) === -1) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }
            return CCOM.stubs.removeEventListener(this._id, this._NS, event, callback);
        }
    };


    CCOM.HomeNetworkingSrs.prototype._supportedEvents = [
        CCOM.HomeNetworkingSrs.prototype._EVENT_ON_SCHEDULE_ADDED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_ON_TASK_ADDED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_ON_SCHEDULE_UPDATED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_ON_TASK_UPDATED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_ON_SCHEDULE_REMOVED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_ON_TASK_REMOVED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_ON_CONFLICT_IMMINENT,
        CCOM.HomeNetworkingSrs.prototype._EVENT_CREATE_SCHEDULE_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_CREATE_SCHEDULE_FAILED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_DELETE_SCHEDULE_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_DELETE_SCHEDULE_FAILED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_DELETE_TASK_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_DELETE_TASK_FAILED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_SCHEDULE_CONFLICTS_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_SCHEDULE_CONFLICTS_FAILED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_SCHEDULES_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_SCHEDULES_FAILED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_TASK_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_TASK_FAILED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_TASK_CONFLICTS_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_TASK_CONFLICTS_FAILED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_TASKS_FROM_SCHEDULE_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_GET_TASKS_FROM_SCHEDULE_FAILED,
        CCOM.HomeNetworkingSrs.prototype._EVENT_UPDATE_SCHEDULE_PRIORITY_OK,
        CCOM.HomeNetworkingSrs.prototype._EVENT_UPDATE_SCHEDULE_PRIORITY_FAILED
    ];
}());

