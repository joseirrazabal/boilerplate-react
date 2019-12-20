/**
 * Stub for CCOM 2.0 CCOM.Scheduler, a singleton added since v5.0.0
 */

var CCOM = window.CCOM || {};

CCOM.Scheduler = CCOM.Scheduler || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.Scheduler",
        _id = CCOM.stubs.uuid(),
        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {},

        // events in xml
        _EVENT_ON_ADD_JOB_COMPLETED = "onAddJobCompleted",
        _EVENT_ON_ADD_TASK_FAILED = "onAddTaskFailed",
        _EVENT_ON_JOB_NOTIFY = "onJobNotify",
        _EVENT_ON_JOB_STARTED = "onJobStarted",
        _EVENT_ON_JOBS_MODIFIED = "onJobsModified",
        _EVENT_ON_JTM_READY = "onJtmReady",
        _EVENT_ON_TASK_DOWNLOAD_PROGRESS = "onTaskDownloadProgress",
        _EVENT_ON_TASK_DOWNLOAD_STATUS = "onTaskDownloadStatus",
        _EVENT_ON_TASK_STARTED = "onTaskStarted",
        _EVENT_ON_TASK_STOPPED = "onTaskStopped",
        _EVENT_ON_TASK_VP_ALERT = "onTaskVPAlert",
        _EVENT_ON_TASKS_CHANGED = "onTasksChanged",
        _EVENT_ON_TASKS_MODIFIED = "onTasksModified",

        // events from methods
        _EVENT_ADD_JOB_OK = "addJobOK",
        _EVENT_ADD_JOB_FAILED = "addJobFailed",
        _EVENT_DELETE_JOB_OK = "deleteJobOK",
        _EVENT_DELETE_JOB_FAILED = "deleteJobFailed",
        _EVENT_GET_TASK_ALL_OPTIONS_OK = "getTaskAllOptionsOK",
        _EVENT_GET_TASK_ALL_OPTIONS_FAILED = "getTaskAllOptionsFailed",
        _EVENT_GET_TASK_OVERLAPS_OK = "getTaskOverlapsOK",
        _EVENT_GET_TASK_OVERLAPS_FAILED = "getTaskOverlapsFailed",
        _EVENT_GET_TASK_OVERLAPS_OPTIONS_OK = "getTaskOverlapsOptionsOK",
        _EVENT_GET_TASK_OVERLAPS_OPTIONS_FAILED = "getTaskOverlapsOptionsFailed",
        _EVENT_GETPROGRESS_TASK_OK = "getprogressTaskOK",
        _EVENT_GETPROGRESS_TASK_FAILED = "getprogressTaskFailed",
        _EVENT_JOB_CREATE_OK = "jobCreateOK",
        _EVENT_JOB_CREATE_FAILED = "jobCreateFailed",
        _EVENT_JOB_DELETE_OK = "jobDeleteOK",
        _EVENT_JOB_DELETE_FAILED = "jobDeleteFailed",
        _EVENT_JOB_REGISTER_OK = "jobRegisterOK",
        _EVENT_JOB_REGISTER_FAILED = "jobRegisterFailed",
        _EVENT_PAUSE_TASK_OK = "pauseTaskOK",
        _EVENT_PAUSE_TASK_FAILED = "pauseTaskFailed",
        _EVENT_PRIORITIZE_TASKS_OK = "prioritizeTasksOK",
        _EVENT_PRIORITIZE_TASKS_FAILED = "prioritizeTasksFailed",
        _EVENT_REORDER_JOBS_OK = "reorderJobsOK",
        _EVENT_REORDER_JOBS_FAILED = "reorderJobsFailed",
        _EVENT_REORDER_TASKS_OK = "reorderTasksOK",
        _EVENT_REORDER_TASKS_FAILED = "reorderTasksFailed",
        _EVENT_STOP_TASK_OK = "stopTaskOK",
        _EVENT_STOP_TASK_FAILED = "stopTaskFailed",
        _EVENT_UNPAUSE_TASK_OK = "unpauseTaskOK",
        _EVENT_UNPAUSE_TASK_FAILED = "unpauseTaskFailed",
        _EVENT_UPDATE_JOB_OK = "updateJobOK",
        _EVENT_UPDATE_JOB_FAILED = "updateJobFailed",
        _EVENT_UPDATE_TASK_OK = "updateTaskOK",
        _EVENT_UPDATE_TASK_FAILED = "updateTaskFailed",

        _supportedEvents = [
            // events in xml
            _EVENT_ON_ADD_JOB_COMPLETED,
            _EVENT_ON_ADD_TASK_FAILED,
            _EVENT_ON_JOB_NOTIFY,
            _EVENT_ON_JOB_STARTED,
            _EVENT_ON_JOBS_MODIFIED,
            _EVENT_ON_JTM_READY,
            _EVENT_ON_TASK_DOWNLOAD_PROGRESS,
            _EVENT_ON_TASK_DOWNLOAD_STATUS,
            _EVENT_ON_TASK_STARTED,
            _EVENT_ON_TASK_STOPPED,
            _EVENT_ON_TASK_VP_ALERT,
            _EVENT_ON_TASKS_CHANGED,
            _EVENT_ON_TASKS_MODIFIED,
            // events from methods
            _EVENT_ADD_JOB_OK,
            _EVENT_ADD_JOB_FAILED,
            _EVENT_DELETE_JOB_OK,
            _EVENT_DELETE_JOB_FAILED,
            _EVENT_GET_TASK_ALL_OPTIONS_OK,
            _EVENT_GET_TASK_ALL_OPTIONS_FAILED,
            _EVENT_GET_TASK_OVERLAPS_OK,
            _EVENT_GET_TASK_OVERLAPS_FAILED,
            _EVENT_GET_TASK_OVERLAPS_OPTIONS_OK,
            _EVENT_GET_TASK_OVERLAPS_OPTIONS_FAILED,
            _EVENT_GETPROGRESS_TASK_OK,
            _EVENT_GETPROGRESS_TASK_FAILED,
            _EVENT_JOB_CREATE_OK,
            _EVENT_JOB_CREATE_FAILED,
            _EVENT_JOB_DELETE_OK,
            _EVENT_JOB_DELETE_FAILED,
            _EVENT_JOB_REGISTER_OK,
            _EVENT_JOB_REGISTER_FAILED,
            _EVENT_PAUSE_TASK_OK,
            _EVENT_PAUSE_TASK_FAILED,
            _EVENT_PRIORITIZE_TASKS_OK,
            _EVENT_PRIORITIZE_TASKS_FAILED,
            _EVENT_REORDER_JOBS_OK,
            _EVENT_REORDER_JOBS_FAILED,
            _EVENT_REORDER_TASKS_OK,
            _EVENT_REORDER_TASKS_FAILED,
            _EVENT_STOP_TASK_OK,
            _EVENT_STOP_TASK_FAILED,
            _EVENT_UNPAUSE_TASK_OK,
            _EVENT_UNPAUSE_TASK_FAILED,
            _EVENT_UPDATE_JOB_OK,
            _EVENT_UPDATE_JOB_FAILED,
            _EVENT_UPDATE_TASK_OK,
            _EVENT_UPDATE_TASK_FAILED
        ],

        JOBS = [],
        TASKS = [],

        taskOverlapsHandle = 0,
        taskAllOptionsHandle = 0,
        jobPriority = 10,
        taskPriority = 1;

    function _createTask(taskType, jobType, jobObject) {
        var time = new Date().getTime(),
            taskObject = {};
        taskObject.jobId = jobObject.jobId;
        taskObject.taskId = TASKS.length + 1;
        taskObject.taskType = taskType;
        taskObject.eventId = jobObject.eventId;
        taskObject.startTime = jobObject.startTime || jobObject.timeOfDay;
        taskObject.endTime = jobObject.endTime || jobObject.startTime + jobObject.duration;
        taskObject.unscheduled = jobObject.unscheduled;
        taskObject.taskOpState = taskObject.startTime < time && taskObject.endTime > time ? 5 : 0;
        taskObject.objectState = 0; // Scheduled
        taskObject.serviceId = jobObject.serviceId || jobObject.eventId + "s";
        taskObject.duration = jobObject.duration;
        taskObject.title = jobObject.title;
        taskObject.softPostpaddingDuration = jobObject.softPostpaddingDuration;
        taskObject.softPrepaddingDuration = jobObject.softPrepaddingDuration;
        taskObject.keep = jobObject.keep;
        taskObject.toSource = function () {
            return "";
        };
        taskObject.scheduleType = jobType;
        taskObject.cumulativeStatus = 0; //normal
        taskObject.currentStatus = 0; //normal
        taskObject.priority = jobObject.priority + taskPriority++;
        if (time < taskObject.startTime) {
            taskObject.objectState = 0; // Scheduled
            taskObject.completeStatus = 1;
        } else if (time > taskObject.endTime) {
            taskObject.objectState = 5; // Recorded
            taskObject.completeStatus = 3;
        } else {
            taskObject.objectState = 1; // Active
            taskObject.completeStatus = 1;
        }
        return taskObject;
    }

    function _getFulfillmentStatusObjForTask(task, fulfillmentStatus) {
        return {
            taskId: task.taskId,
            jobId: task.jobId,
            taskType: task.taskType,
            startTime: task.startTime,
            duration: task.endTime,
            fulfillmentStatus: fulfillmentStatus
        };
    }

    _obj = {

        //AddTaskFailedReason
        SYSTEM_ERROR: 1,
        TOO_MANY_TASKS: 2,
        DUPLICATE_TASK: 3,
        EXPIRATION_EARLIER_THAN_START: 4,
        INVALID_EVENT_ID: 5,
        OUT_OF_MEMORY: 6,
        TYPE_INVALID: 7,
        TOO_MANY_JOBS: 8,
        BAD_PARAM: 9,
        DUPLICATE_JOB: 10,
        BAD_STATE: 11,

        //CompleteStatus
        SUCCESS_COMPLETE: 0,
        BAD_PARAMETERS: 2,

        //FulfillmentStatus
        INVALID: 0,
        NONE: 1,
        PARTIAL: 2,
        FULL: 3,

        getCurrentTasksStatus: function () {
            var i,
                taskLen = TASKS.length,
                time = new Date().getTime(),
                status = {},
                tasksStatus = [],
                curTaskList = [],
                curTasksLen;

            for (i = 0; i < taskLen; i++) {
                if ((TASKS[i].startTime - TASKS[i].softPrepaddingDuration) < time &&
                        (TASKS[i].endTime + TASKS[i].softPostpaddingDuration) > time) {
                    curTaskList.push(TASKS[i]);
                }
            }

            curTasksLen = curTaskList.length;
            for (i = 0; i < curTasksLen; i++) {
                status = {};
                status.taskId = curTaskList[i].taskId;
                status.cumulativeStatus = curTaskList[i].cumulativeStatus;
                status.currentStatus = curTaskList[i].currentStatus;
                status.duration = curTaskList[i].duration;
                status.startTime = curTaskList[i].startTime;
                status.taskType = curTaskList[i].taskType;

                tasksStatus.push(status);
            }

            return tasksStatus;
        },

        getJobsPriority: function (jobIdArray) {
            var i,
                jobLen = jobIdArray.length,
                jobPriorityList = [];

            for (i = 0; i < jobLen; i++) {
                if (JOBS[i]) {
                    jobPriorityList.push(JOBS[i].priority);
                }
            }

            return jobPriorityList;
        },

        getTaskOverlapsOptions: function (taskId, expandWindow, showAllOptions) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_TASK_OVERLAPS_OPTIONS_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.Scheduler",
                    name: "Failed",
                    message: ""
                }
            });

            return _handle;
        },

        getTaskStateInfo: function (taskId) {
            return {
                objState: 0,
                currentStatus: 0,
                cumulativeStatus: 0
            };
        },

        getprogressTask: function (taskId) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GETPROGRESS_TASK_OK, {
                target: this,
                handle: _handle,
                DownloadStatus: 0
            });

            return _handle;

        },

        jobCreate: function (taskType, scheduleType, addInfo, clientCB, clientData) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_JOB_CREATE_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.Scheduler",
                    name: "Failed",
                    message: ""
                }
            });

            return _handle;
        },

        jobDelete: function (jobId) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_JOB_DELETE_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.Scheduler",
                    message: ""
                }
            });
            return _handle;
        },

        jobRegister: function (taskType, scheduleType, jobId, clientCB, clientData) {
            return {
                domain: "com.opentv.Scheduler",
                name: "Failed",
                message: ""
            };
        },

        pauseTask: function (taskId) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_PAUSE_TASK_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.Scheduler",
                    message: ""
                }
            });
            return _handle;
        },

        prioritizeTasks: function (prioritizeTaskIds, allTaskIds) {
            return {
                domain: "com.opentv.Scheduler",
                name: "Failed",
                message: ""
            };
        },

        reorderJobs: function (jobIdArray) {
            var i,
                j,
                taskLen = TASKS.length,
                conflictJobLen = jobIdArray.length,
                time = new Date().getTime(),
                idxOfReorderTask = [],
                newOrderTask = [];

            for (i = 0; i < conflictJobLen; i++) {
                for (j = 0; j < taskLen; j++) {
                    if ((TASKS[j].jobId === jobIdArray[i]) && (time > TASKS[j].startTime)) {
                        idxOfReorderTask[i] = j;
                        newOrderTask.push(TASKS[j]);
                    }
                }
            }

            for (i = 0; i < idxOfReorderTask.length; i++) {
                TASKS.splice(idxOfReorderTask[i], 1, newOrderTask[i]);
            }

            return null;
        },

        reorderTasks: function (taskIdArray) {
            var i,
                j,
                taskLen = TASKS.length,
                conflictTaskLen = taskIdArray.length,
                time = new Date().getTime(),
                idxOfReorderTask = [],
                newOrderTask = [];

            for (i = 0; i < conflictTaskLen; i++) {
                for (j = 0; j < taskLen; j++) {
                    if (TASKS[j].taskId === taskIdArray[i] &&
                            ((String(TASKS[i].taskType) === "REC") || (String(TASKS[i].taskType) === "RMDR")) &&
                            (time > TASKS[j].startTime)) {
                        idxOfReorderTask[i] = j;
                        newOrderTask.push(TASKS[j]);
                    }
                }
            }


            for (i = 0; i < idxOfReorderTask.length; i++) {
                TASKS.splice(idxOfReorderTask, 1, newOrderTask[i]);
            }

            return null;
        },

        unpauseTask: function (taskId) {
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UNPAUSE_TASK_FAILED, {
                error: {
                    domain: "com.opentv.Scheduler",
                    name: "Failed",
                    message: ""
                }
            });
            return null;
        },

        updateJob: function (jobId, updateInfo) {
            var i,
                jobLen = JOBS.length,
                property,
                _handle = CCOM.stubs.getHandle();
            for (i = 0; i < jobLen; i++) {
                if (JOBS[i].jobId === jobId) {
                    for (property in updateInfo) {
                        if (updateInfo.hasOwnProperty(property)) {
                            JOBS[i][property] = updateInfo[property];
                        }
                    }
                }
            }
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UPDATE_JOB_OK, {
                target: this,
                handle: _handle
            });

            return _handle;
        },

        getTasksRSByWindow: function (properties, criteria, startTime, endTime) {
            return {
                error: {
                    domain: "com.opentv.Scheduler",
                    name: "OperationFailed",
                    message: ""
                }
            };
        },

        getJobsRSByQuery: function (fields, criteria, order) {
            var results = [],
                i,
                titleEndPosition,
                rs;
            if (criteria.substr(0, 5) === "jobId") {
                for (i = 0; i < JOBS.length; i++) {
                    if (String(JOBS[i].jobId) === criteria.substring(7, criteria.length - 1)) {
                        results.push(JOBS[i]);
                    }
                }
            } else if (criteria.substr(0, 7) === "eventId") {
                for (i = 0; i < JOBS.length; i++) {
                    if (String(JOBS[i].eventId) === criteria.substring(9, criteria.length - 1)) {
                        results.push(JOBS[i]);
                    }
                }
            }
            rs = new CCOM.ResultSet(results);
            return rs;
        },

        getTasksRSByQuery: function (fields, criteria, order) {
            var results = [],
                titleEndPosition,
                i,
                rs;
            if (criteria.substr(0, 6) === "taskId") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].taskId) === criteria.substring(8, criteria.length - 1)) {
                        results.push(TASKS[i]);
                    }
                }
            } else if (criteria.substr(0, 5) === "jobId") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].jobId) === criteria.substring(7, criteria.length - 1)) {
                        results.push(TASKS[i]);
                    }
                }
            } else if (criteria.substr(0, 7) === "eventId") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].eventId) === criteria.substring(9, criteria.length - 1)) {
                        results.push(TASKS[i]);
                    }
                }
            } else if (criteria.substr(0, 5) === "title") {
                if (criteria.substr(6, 7) === "LIKE '%") {
                    titleEndPosition = criteria.indexOf("%", 13);
                    for (i = 0; i < TASKS.length; i++) {
                        if (String(TASKS[i].title).toLowerCase().indexOf(criteria.substring(13, titleEndPosition).toLowerCase()) !== -1) {
                            results.push(TASKS[i]);
                        }
                    }
                } else {
                    titleEndPosition = criteria.indexOf("'", 12);
                    for (i = 0; i < TASKS.length; i++) {
                        if (String(TASKS[i].title).toLowerCase() === criteria.substring(12, titleEndPosition).toLowerCase()) {
                            results.push(TASKS[i]);
                        }
                    }
                }
            } else if (criteria.substr(0, 31) === "taskType='REC' AND objectState=") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].objectState) === criteria.substring(33, criteria.length - 1)) {
                        results.push(TASKS[i]);
                    }
                }
            } else if (criteria.substr(0, 50) === "taskType='REC' AND unscheduled=0 AND (objectState=") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].objectState) === criteria.substring(51, criteria.length - 2)) {
                        results.push(TASKS[i]);
                    }
                }
            }
            rs = new CCOM.ResultSet(results);
            return rs;
        },

        getEntryRSByQuery: function (fields, criteria, order) {
            var results = [],
                i,
                rs;
            if (criteria.substr(0, 34) === "taskType='REC' AND completeStatus=" && criteria.substr(35, 18) === " AND (objectState=" && criteria.substr(54, 16) === " OR objectState=") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].completeStatus) === criteria.substr(34, 1) && (String(TASKS[i].objectState) === criteria.substr(53, 1) || String(TASKS[i].objectState) === criteria.substr(70, 1))) {
                        results.push(TASKS[i]);
                    }
                }
            } else if (criteria.substr(0, 31) === "taskType='REC' AND objectState<" && criteria.substr(32, 56) === " AND (scheduleType='ONE_TIME' OR scheduleType='RPT_TIME'") {
                for (i = 0; i < TASKS.length; i++) {
                    if (TASKS[i].objectState < parseInt(criteria.substr(31, 1), 10) && (TASKS[i].scheduleType === "ONE_TIME" || TASKS[i].scheduleType === "RPT_TIME")) {
                        results.push(TASKS[i]);
                    }
                }
            } else if (criteria.substr(0, 32) === "taskType='REC' AND (objectState=" && criteria.substr(33, 16) === " OR objectState=") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].objectState) === criteria.substr(34, 1) || String(TASKS[i].objectState) === criteria.substr(49, 1)) {
                        results.push(TASKS[i]);
                    }
                }
            } else if (criteria.substr(0, 31) === "taskType='REC' AND objectState=") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].objectState) === criteria.substring(33, criteria.length - 1)) {
                        results.push(TASKS[i]);
                    }
                }
            } else if (criteria.substr(0, 50) === "taskType='REC' AND unscheduled=0 AND (objectState=") {
                for (i = 0; i < TASKS.length; i++) {
                    if (String(TASKS[i].objectState) === criteria.substring(51, criteria.length - 2)) {
                        results.push(TASKS[i]);
                    }
                }
            } else {
                results = TASKS;
            }
            rs = new CCOM.ResultSet(results);
            return rs;
        },

        addJob: function (taskType, jobType, jobObject) {
            var jobId = JOBS.length + 1,
                taskObject = {},
                now = new Date(),
                currentDayIndex = now.getDay() - 1 < 0 ? 6 : now.getDay() - 1,
                startTime,
                hours,
                mins,
                taskStartDate,
                i,
                daysDifferenceFromNow,
                MS_PER_DAY = 86400000,
                evt,
                _handle = CCOM.stubs.getHandle();

            jobObject.jobId = jobId;
            jobObject.type = jobType;
            jobObject.taskType = taskType;
            jobObject.toSource = function () {
                return "";
            };
            jobObject.priority = jobPriority;
            jobPriority += 10;
            JOBS.push(jobObject);

            if (jobType === "RPT_TIME" && jobObject.repeatDaysArray && jobObject.timeOfDay) {
                i = 0;
                hours = Math.floor(jobObject.timeOfDay / 3600);
                mins = (jobObject.timeOfDay - (hours * 3600)) / 60;

                for (i = 0; i < jobObject.repeatDaysArray.length; i++) {
                    if (jobObject.repeatDaysArray[i]) {
                        daysDifferenceFromNow = i - currentDayIndex < 0 ? 6 - currentDayIndex + i + 1 : i - currentDayIndex;
                        taskStartDate = new Date(now.getTime() + daysDifferenceFromNow * MS_PER_DAY);
                        taskStartDate.setHours(hours);
                        taskStartDate.setMinutes(mins);
                        taskStartDate.setMilliseconds(0);
                        jobObject.startTime = taskStartDate.getTime();
                        jobObject.endTime = jobObject.startTime + jobObject.duration;
                        jobObject.softPostpaddingDuration = 0;
                        jobObject.softPrepaddingDuration = 0;
                        jobObject.duration = 3600000 * 2;
                        taskObject = _createTask(taskType, jobType, jobObject);
                        TASKS.push(taskObject);
                    }
                }
            } else {
                evt = CCOM.EPG.getEventById(jobObject.eventId);
                if (evt) {
                    jobObject.startTime = evt.startTime;
                    jobObject.endTime = evt.endTime;
                    jobObject.title = evt.title;
                    jobObject.serviceId = evt.serviceId;
                    jobObject.softPostpaddingDuration = 0;
                    jobObject.softPrepaddingDuration = 0;
                    jobObject.duration = 3600000 * 2;
                }
                taskObject = _createTask(taskType, jobType, jobObject);
                TASKS.push(taskObject);
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_JOB_OK, {
                target: this,
                handle: _handle,
                jobId: jobId
            });

            return _handle;
        },

        stopTask: function (taskId) {
            var i,
                _handle = CCOM.stubs.getHandle();
            for (i = 0; i < TASKS.length; i++) {
                if (TASKS[i].taskId === taskId) {
                    TASKS[i].objectState = 5;
                    TASKS[i].completeStatus = 2;
                    break;
                }
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_STOP_TASK_OK, {
                target: this,
                handle: _handle
            });

            return _handle;
        },

        deleteJob: function (id) {
            var i,
                _handle = CCOM.stubs.getHandle();
            for (i = 0; i < JOBS.length; i++) {
                if (JOBS[i].jobId === id) {
                    JOBS.splice(i, 1);
                }
            }
            for (i = TASKS.length - 1; i >= 0; i--) {
                if (TASKS[i].jobId === id) {
                    TASKS.splice(i, 1);
                }
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_JOB_DELETE_OK, {
                target: this,
                handle: _handle
            });

            return _handle;
        },

        resetTasksAndJobs: function () {
            JOBS = [];
            TASKS = [];
        },

        updateTask: function (taskId, metaData) {
            var i,
                property,
                _handle = CCOM.stubs.getHandle();
            for (i = 0; i < TASKS.length; i++) {
                if (TASKS[i].taskId === taskId) {
                    for (property in metaData) {
                        if (metaData.hasOwnProperty(property)) {
                            TASKS[i][property] = metaData[property];
                        }
                    }
                    break;
                }
            }
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UPDATE_TASK_OK, {
                target: this,
                handle: _handle
            });

            return _handle;
        },

        getTaskOverlaps: function (taskId) {
            var fulfillmentStatus,
                /*task = $N.platform.btv.PVRManager.getTask(taskId),*/
                task = {},
                conflictingTasks = [_getFulfillmentStatusObjForTask(task, 3)],
                i;
            taskOverlapsHandle++;
            for (i = 0; i < TASKS.length; i++) {
                if (TASKS[i].taskId === taskId) {
                    task.push(TASKS[i]);
                }
            }
            for (i = 0; i < TASKS.length; i++) {
                if (TASKS[i].taskId !== taskId && ((TASKS[i].startTime >= task.startTime && TASKS[i].startTime < task.endTime) || (TASKS[i].endTime > task.startTime && TASKS[i].endTime < task.endTime) || (TASKS[i].startTime <= task.startTime && TASKS[i].endTime >= task.endTime))) {
                    fulfillmentStatus = conflictingTasks.length > 1 ? 1 : 3;
                    conflictingTasks.push(_getFulfillmentStatusObjForTask(TASKS[i], fulfillmentStatus));
                }
            }
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_TASK_OVERLAPS_OK, {
                taskOverlaps: conflictingTasks,
                handle: taskOverlapsHandle
            });
            return taskOverlapsHandle;
        },

        getTaskAllOptions: function (time, candidateIds, unscheduledTaskIds) {
            var fulfillmentStatus,
                conflictingTasks = [],
                i;
            taskAllOptionsHandle++;
            for (i = 0; i < TASKS.length; i++) {
                if (TASKS[i].startTime <= time && TASKS[i].endTime > time) {
                    fulfillmentStatus = conflictingTasks.length > 1 ? 1 : 3;
                    conflictingTasks.push(_getFulfillmentStatusObjForTask(TASKS[i], fulfillmentStatus));
                }
            }
            conflictingTasks = conflictingTasks.length > 1 ? conflictingTasks : [];
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_TASK_ALL_OPTIONS_OK, {
                target: this,
                handle: taskAllOptionsHandle,
                taskOptions: null,
                allTaskIds: conflictingTasks,
                allTaskTypes: null
            });
            return taskAllOptionsHandle;
        },

        getLastAddedTask: function () {
            return TASKS[TASKS.length - 1];
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
        //JTMActionInfo
        _obj.CREATED = 0;
        _obj.DELETED = 1;
        _obj.PROPERTY_CHANGED = 2;
        _obj.ACTIVATED = 3;
        _obj.DEACTIVATED = 4;
    }

    /*
     * Changes introduced in v5.1.2
     */
    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {
        /*
         * backgroundTaskIds and taskPriorityNames properties now returend by the getTaskAllOptionsOK event.
         */
        _obj.getTaskAllOptions = function (time, candidateIds, unscheduledTaskIds) {
            var fulfillmentStatus,
                conflictingTasks = [],
                i;
            taskAllOptionsHandle++;
            for (i = 0; i < TASKS.length; i++) {
                if (TASKS[i].startTime <= time && TASKS[i].endTime > time) {
                    fulfillmentStatus = conflictingTasks.length > 1 ? 1 : 3;
                    conflictingTasks.push(_getFulfillmentStatusObjForTask(TASKS[i], fulfillmentStatus));
                }
            }
            conflictingTasks = conflictingTasks.length > 1 ? conflictingTasks : [];
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_TASK_ALL_OPTIONS_OK, {
                target: this,
                handle: taskAllOptionsHandle,
                taskOptions: null,
                allTaskIds: conflictingTasks,
                allTaskTypes: null,
                backgroundTaskIds: null,
                taskPriorityNames: null
            });
            return taskAllOptionsHandle;
        };
    }

    return _obj;
}());