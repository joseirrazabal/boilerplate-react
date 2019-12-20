/**
 * Stub for CCOM 2.0 CCOM.EPG, a singleton added since v5.0.0
 */

var CCOM = window.CCOM || {};

CCOM.EPG = CCOM.EPG || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.EPG",
        _id = CCOM.stubs.uuid(),
        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {},
        _EVENT_REMOVE_FAVORITE_LIST_OK = "removeFavoriteListOK",
        _EVENT_REMOVE_FAVORITE_LIST_FAILED = "removeFavoriteListFailed",
        _EVENT_SET_FAVORITE_LIST_OK = "setFavoriteListOK",
        _EVENT_SET_FAVORITE_LIST_FAILED = "setFavoriteListFailed",
        _EVENT_ADD_SERVICE_OK = "addServiceOK",
        _EVENT_ADD_SERVICE_FAILED = "addServiceFailed",
        _EVENT_ADD_EVENT_OK = "addEventOK",
        _EVENT_ADD_EVENT_FAILED = "addEventFailed",
        _EVENT_REMOVE_EVENT_OK = "removeEventOK",
        _EVENT_REMOVE_EVENT_FAILED = "removeEventFailed",
        _EVENT_REMOVE_SERVICE_OK = "removeServiceOK",
        _EVENT_REMOVE_SERVICE_FAILED = "removeServiceFailed",
        _EVENT_BEGIN_BATCH_OK = "beginBatchOK",
        _EVENT_BEGIN_BATCH_FAILED = "beginBatchFailed",
        _EVENT_CANCEL_BATCH_OK = "cancelBatchOK",
        _EVENT_CANCEL_BATCH_FAILED = "cancelBatchFailed",
        _EVENT_COMMIT_BATCH_OK = "commitBatchOK",
        _EVENT_COMMIT_BATCH_FAILED = "commitBatchFailed",
        _EVENT_REMOVE_EXPIRED_EVENTS_OK = "removeExpiredEventsOK",
        _EVENT_REMOVE_EXPIRED_EVENTS_FAILED = "removeExpiredEventsFailed",
        _EVENT_TAG_SERVICE_OK = "tagServiceOK",
        _EVENT_TAG_SERVICE_FAILED = "tagServiceFailed",
        _EVENT_UNTAG_EVENT_OK = "untagEventOK",
        _EVENT_UNTAG_EVENT_FAILED = "untagEventFailed",
        _EVENT_UNTAG_SERVICE_OK = "untagServiceOK",
        _EVENT_UNTAG_SERVICE_FAILED = "untagServiceFailed",
        _EVENT_TAG_EVENT_OK = "tagEventOK",
        _EVENT_TAG_EVENT_FAILED = "tagEventFailed",

        _supportedEvents = [_EVENT_REMOVE_FAVORITE_LIST_OK,
                            _EVENT_REMOVE_FAVORITE_LIST_FAILED,
                            _EVENT_SET_FAVORITE_LIST_OK,
                            _EVENT_SET_FAVORITE_LIST_FAILED,
                            _EVENT_ADD_SERVICE_OK,
                            _EVENT_ADD_SERVICE_FAILED,
                            _EVENT_ADD_EVENT_OK,
                            _EVENT_ADD_EVENT_FAILED,
                            _EVENT_REMOVE_EVENT_OK,
                            _EVENT_REMOVE_EVENT_FAILED,
                            _EVENT_REMOVE_SERVICE_OK,
                            _EVENT_REMOVE_SERVICE_FAILED,
                            _EVENT_BEGIN_BATCH_OK,
                            _EVENT_BEGIN_BATCH_FAILED,
                            _EVENT_CANCEL_BATCH_OK,
                            _EVENT_CANCEL_BATCH_FAILED,
                            _EVENT_COMMIT_BATCH_OK,
                            _EVENT_COMMIT_BATCH_FAILED,
                            _EVENT_REMOVE_EXPIRED_EVENTS_OK,
                            _EVENT_REMOVE_EXPIRED_EVENTS_FAILED,
                            _EVENT_TAG_SERVICE_OK,
                            _EVENT_TAG_SERVICE_FAILED,
                            _EVENT_UNTAG_EVENT_OK,
                            _EVENT_UNTAG_EVENT_FAILED,
                            _EVENT_UNTAG_SERVICE_OK,
                            _EVENT_UNTAG_SERVICE_FAILED,
                            _EVENT_TAG_EVENT_OK,
                            _EVENT_TAG_EVENT_FAILED
                           ],

        currentTime = new Date().getTime(),

        SERVICES_TEST_DATA = [
            {serviceId: '352', channelKey: 352, type: 1, name: 'BBC One', uri: "http: //18.19.20.21/bbc_one"},
            {serviceId: '353', channelKey: 353, type: 1, name: 'BBC Two', uri: "http: //18.19.20.21/bbc_two"},
            {serviceId: '480', channelKey: 480, type: 1, name: 'BBC Three', uri: "http: //18.19.20.21/bbc_three"},
            {serviceId: '681', channelKey: 681, type: 1, name: 'Sky News', uri: "http: //18.19.20.21/sny_news"},
            {serviceId: '1711', channelKey: 1711, type: 1, name: 'History Channel', uri: "http: //18.19.20.21/history_channel"},
            {serviceId: '1712', channelKey: 1712, type: 1, name: 'National Geographic', uri: "http: //18.19.20.21/national_geographic"}
        ],

        EVENT_TEST_DATA = [
            {eventId: '101', serviceId: '352', title: 'Grand Designs 1', shortDesc: "Presenter Kevin McCloud follows some of Britain's most ambitious self-building projects, as intrepid individuals attempt to design and construct the home of their dreams.", startTime: currentTime - 3600000, endTime: currentTime + 3600000},
            {eventId: '102', serviceId: '352', title: 'Three In a Bed 1', shortDesc: "B&B owners throw open their doors and take turns to stay with one another - and pay what they consider fair for their stay.", startTime: currentTime + 3600000, endTime: currentTime + 3600000 * 2},
            {eventId: '103', serviceId: '352', title: 'The Hotel 1', shortDesc: "Dan and Liz, a happy young couple from Essex, check in to the Damson Dene for a quiet break. What Liz doesn't know is that Dan has brought her here to ask for her hand in marriage.", startTime: currentTime + 3600000 * 2, endTime: currentTime + 3600000 * 4},
            {eventId: '104', serviceId: '352', title: 'One Under 1', shortDesc: "One under is the term Tube drivers and emergency services often use as shorthand for a person under their train.", startTime: currentTime + 3600000 * 4, endTime: currentTime + 3600000 * 5},
            {eventId: '105', serviceId: '352', title: 'The MI5 Hoaxer 1', shortDesc: "Nineteen-year-old Oxford jewellery shop assistant Leanne McCarthy found herself trapped in a modern nightmare of kidnap, fear and mind control when she met 23-year-old Wayne Gouveia, a sophisticated conman with a track record of duping young women.", startTime: currentTime + 3600000 * 5, endTime: currentTime + 3600000 * 6},
            {eventId: '106', serviceId: '352', title: 'The Story Of Film 1', shortDesc: "The explosive story of film in the late 50s and 60s. The great movie star Claudia Cardinale talks exclusively about Federico Fellini.", startTime: currentTime + 3600000 * 6, endTime: currentTime + 3600000 * 7},
            {eventId: '107', serviceId: '352', title: 'There Was A Girl 1', shortDesc: "Film a bout a girl that there once was.", startTime: currentTime + 3600000 * 7, endTime: currentTime + 3600000 * 8},
            {eventId: '201', serviceId: '353', title: 'Grand Designs 2', shortDesc: "Presenter Kevin McCloud follows some of Britain's most ambitious self-building projects, as intrepid individuals attempt to design and construct the home of their dreams.", startTime: currentTime - 3600000, endTime: currentTime + 3600000},
            {eventId: '202', serviceId: '353', title: 'Three In a Bed 2', shortDesc: "B&B owners throw open their doors and take turns to stay with one another - and pay what they consider fair for their stay.", startTime: currentTime + 3600000, endTime: currentTime + 3600000 * 2},
            {eventId: '203', serviceId: '353', title: 'The Hotel 2', shortDesc: "Dan and Liz, a happy young couple from Essex, check in to the Damson Dene for a quiet break. What Liz doesn't know is that Dan has brought her here to ask for her hand in marriage.", startTime: currentTime + 3600000 * 2, endTime: currentTime + 3600000 * 4},
            {eventId: '301', serviceId: '480', title: 'Grand Designs 3', shortDesc: "Presenter Kevin McCloud follows some of Britain's most ambitious self-building projects, as intrepid individuals attempt to design and construct the home of their dreams.", startTime: currentTime - 3600000, endTime: currentTime + 3600000},
            {eventId: '302', serviceId: '480', title: 'Three In a Bed 3', shortDesc: "B&B owners throw open their doors and take turns to stay with one another - and pay what they consider fair for their stay.", startTime: currentTime + 3600000, endTime: currentTime + 3600000 * 2},
            {eventId: '303', serviceId: '480', title: 'The Hotel 3', shortDesc: "Dan and Liz, a happy young couple from Essex, check in to the Damson Dene for a quiet break. What Liz doesn't know is that Dan has brought her here to ask for her hand in marriage.", startTime: currentTime + 3600000 * 2, endTime: currentTime + 3600000 * 4},
            {eventId: '401', serviceId: '681', title: 'One Under 1', shortDesc: "One under is the term Tube drivers and emergency services often use as shorthand for a person under their train.", startTime: currentTime - 3600000, endTime: currentTime + 3600000},
            {eventId: '402', serviceId: '681', title: 'One Under 2', shortDesc: "One under is the term Tube drivers and emergency services often use as shorthand for a person under their train.", startTime: currentTime + 3600000, endTime: currentTime + 3600000 * 2},
            {eventId: '403', serviceId: '681', title: 'One Under 3', shortDesc: "One under is the term Tube drivers and emergency services often use as shorthand for a person under their train.", startTime: currentTime + 3600000 * 2, endTime: currentTime + 3600000 * 4},
            {eventId: '501', serviceId: '1711', title: 'The MI5 Hoaxer 1', shortDesc: "Nineteen-year-old Oxford jewellery shop assistant Leanne McCarthy found herself trapped in a modern nightmare of kidnap, fear and mind control when she met 23-year-old Wayne Gouveia, a sophisticated conman with a track record of duping young women.", startTime: currentTime - 3600000, endTime: currentTime + 3600000},
            {eventId: '502', serviceId: '1711', title: 'The MI5 Hoaxer 2', shortDesc: "Nineteen-year-old Oxford jewellery shop assistant Leanne McCarthy found herself trapped in a modern nightmare of kidnap, fear and mind control when she met 23-year-old Wayne Gouveia, a sophisticated conman with a track record of duping young women.", startTime: currentTime + 3600000, endTime: currentTime + 3600000 * 2},
            {eventId: '503', serviceId: '1711', title: 'The MI5 Hoaxer 3', shortDesc: "Nineteen-year-old Oxford jewellery shop assistant Leanne McCarthy found herself trapped in a modern nightmare of kidnap, fear and mind control when she met 23-year-old Wayne Gouveia, a sophisticated conman with a track record of duping young women.", startTime: currentTime + 3600000 * 2, endTime: currentTime + 3600000 * 4},
            {eventId: '601', serviceId: '1712', title: 'The Story Of Film 1', shortDesc: "The explosive story of film in the late 50s and 60s. The great movie star Claudia Cardinale talks exclusively about Federico Fellini.", startTime: currentTime - 3600000, endTime: currentTime + 3600000},
            {eventId: '602', serviceId: '1712', title: 'The Story Of Film 2', shortDesc: "The explosive story of film in the late 50s and 60s. The great movie star Claudia Cardinale talks exclusively about Federico Fellini.", startTime: currentTime + 3600000, endTime: currentTime + 3600000 * 2},
            {eventId: '603', serviceId: '1712', title: 'The Story Of Film 3', shortDesc: "The explosive story of film in the late 50s and 60s. The great movie star Claudia Cardinale talks exclusively about Federico Fellini.", startTime: currentTime + 3600000 * 2, endTime: currentTime + 3600000 * 4},
            // 15min events:
            {eventId: '701', serviceId: '1712', title: 'There Was A Girl 1', shortDesc: "Film a bout a girl that there once was.", startTime: currentTime + 3600000, endTime: currentTime + 900000},
            {eventId: '702', serviceId: '1712', title: 'There Was A Girl 2', shortDesc: "Film a bout a girl that there once was.", startTime: currentTime + 900000, endTime: currentTime + 900000 * 2},
            {eventId: '703', serviceId: '1712', title: 'There Was A Girl 3', shortDesc: "Film a bout a girl that there once was.", startTime: currentTime + 900000 * 2, endTime: currentTime + 900000 * 4}
        ],

        FAV_TEST_DATA = [
            {listName: 'News', serviceIds: ['352', '353', '681']}
        ];

    _obj = {
        getServicesRSByQuery: function (fields, criteria, order) {
            var results = [], i, rs;
            if (criteria && criteria !== "") {
                if (criteria.substr(0, 12) === "servicesType") {
                    for (i = 0; i < SERVICES_TEST_DATA.length; i++) {
                        if (String(SERVICES_TEST_DATA[i].servicesType) === criteria.substring(13, criteria.length)) {
                            results.push(SERVICES_TEST_DATA[i]);
                        }
                    }
                } else if (criteria.substr(0, 9) === "serviceId") {
                    for (i = 0; i < SERVICES_TEST_DATA.length; i++) {
                        if (String(SERVICES_TEST_DATA[i].serviceId) === criteria.substring(10, criteria.length)) {
                            results.push(SERVICES_TEST_DATA[i]);
                        }
                    }
                } else {
                    CCOM.stubs.log("[CCOM.EPG.getServicesRSByQuery]Did not catch it in criteria parsing.");
                    results = SERVICES_TEST_DATA;
                }
            } else {
                results = SERVICES_TEST_DATA;
            }
            if (results.length === 0) {
                CCOM.stubs.log("[CCOM.EPG.getServicesRSByQuery]Did not catch it in the condition of RS.length==0.");
            }
            rs = new CCOM.ResultSet(results);
            return rs;
        },

        getEventsRSByQuery: function (fields, criteria, order) {
            var results = [],
                matchArray = [],
                matchArray2 = [],
                rs,
                i,
                serviceListArray = [],
                serviceList,
                startTime,
                endTime,
                j,
                pattern;
            if (criteria && criteria !== "") {
                // serviceId = '352' AND startTime <= 1367045620407 AND endTime > 1367045620407
                if (null !== (matchArray = new RegExp(/^serviceId = '(\d+)' AND startTime <= (\d+) AND endTime > (\d+)$/g).exec(criteria))) {
                    for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                        if (String(EVENT_TEST_DATA[i].serviceId) === matchArray[1]) {
                            results.push(EVENT_TEST_DATA[i]);
                        }
                    }

                    // eventId = '101'
                } else if (null !== (matchArray = new RegExp(/^eventId = '(\d+)'/g).exec(criteria))) {
                    for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                        if (String(EVENT_TEST_DATA[i].eventId) === matchArray[1]) {
                            results.push(EVENT_TEST_DATA[i]);
                        }
                    }

                    // criteria: (serviceId='352' OR serviceId='353' OR serviceId='480' OR serviceId='681' OR serviceId='1711' OR serviceId='1712') AND startTime <= '1367056110082' AND endTime >= '1367056110082'"
                    // fields: "DISTINCT serviceId, title"
                } else if ((null !== (matchArray = new RegExp(/^\(([\w\s=']+)\) AND startTime <= '(\d+)' AND endTime >= '(\d+)'/g).exec(criteria))) ||
                    // criteria: "serviceId IN ( '352','353','480','681','1711','1712') AND startTime <= '1402576425030' AND endTime >= '1402576425030'"
                          (null !== (matchArray2 = new RegExp(/^serviceId IN \(([\s\S]*)\) AND startTime <= '(\d+)' AND endTime >= '(\d+)'/g).exec(criteria)))) {

                    if (matchArray) {
                        serviceList = matchArray[1];
                        startTime = matchArray[2];
                        endTime = matchArray[3];
                        pattern = /serviceId='(\d+)'/g;
                    } else {
                        serviceList = matchArray2[1];
                        startTime = matchArray2[2];
                        endTime = matchArray2[3];
                        pattern = /'(\d+)'/g;
                    }

                    while ((matchArray = pattern.exec(serviceList)) !== null) {
                        serviceListArray.push(matchArray[1]);
                    }

                    for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                        for (j = 0; j < serviceListArray.length; j++) {
                            if (String(EVENT_TEST_DATA[i].serviceId) === serviceListArray[j] &&
                                    EVENT_TEST_DATA[i].startTime <= startTime &&
                                    EVENT_TEST_DATA[i].endTime >= endTime) {
                                results.push(EVENT_TEST_DATA[i]);
                            }
                        }
                    }
                    // criteria: "serviceId IN ('352') AND endTime > 1367919907170 AND startTime < 1368458999000"
                } else if (null !== (matchArray = new RegExp(/^serviceId IN \('(\d+)'\) /g).exec(criteria))) {
                    for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                        if (String(EVENT_TEST_DATA[i].serviceId) === matchArray[1]) {
                            results.push(EVENT_TEST_DATA[i]);
                        }
                    }

                    // criteria: serviceId = '352' AND ...
                } else if (null !== (matchArray = new RegExp(/^serviceId = '(\d+)' /).exec(criteria))) {
                    for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                        if (String(EVENT_TEST_DATA[i].serviceId) === matchArray[1]) {
                            results.push(EVENT_TEST_DATA[i]);
                        }
                    }
                } else {
                    CCOM.stubs.log("Did not catch it in CCOM.EPG.getEventsRSByQuery, criteria parsing.");
                }
            } else {
                results = EVENT_TEST_DATA;
            }
            if (results.length === 0) {
                CCOM.stubs.log("Did not catch it in CCOM.EPG.getEventsRSByQuery, RS.length==0.");
                CCOM.stubs.log("criteria: " + criteria);
                CCOM.stubs.log("fields: " + fields);
            }
            rs = new CCOM.ResultSet(results);
            return rs;
        },

        getEventById: function (id) {
            var i;
            for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                if (EVENT_TEST_DATA[i].eventId === id) {
                    return EVENT_TEST_DATA[i];
                }
            }
            return null;
        },

        getEventCurrent: function (serviceId) {
            var i,
                curTime = new Date().getTime();
            for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                if (String(EVENT_TEST_DATA[i].serviceId) === String(serviceId) &&
                        EVENT_TEST_DATA[i].startTime < curTime &&
                        EVENT_TEST_DATA[i].endTime > curTime) {
                    return EVENT_TEST_DATA[i];
                }
            }
            return null;
        },

        getEventNext: function (eventId) {
            var i,
                event = this.getEventById(eventId);
            if (!event) {
                return null;
            }

            /* Assumes that next event start's time equals the specified event's end time */
            for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                if (String(EVENT_TEST_DATA[i].serviceId) === String(event.serviceId) &&
                        EVENT_TEST_DATA[i].startTime === event.endTime) {
                    return EVENT_TEST_DATA[i];
                }
            }
            return null;
        },

        getEventPrevious: function (eventId) {
            var i,
                event = this.getEventById(eventId);
            if (!event) {
                return null;
            }

            /* Assumes that previous event's end time equals the specified event's start time */
            for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                if (String(EVENT_TEST_DATA[i].serviceId) === String(event.serviceId) &&
                        EVENT_TEST_DATA[i].endTime === event.startTime) {
                    return EVENT_TEST_DATA[i];
                }
            }
            return null;
        },

        //Notice:input parameter serviceIds is a array.
        getEventsByWindow: function (serviceIds, start, end) {
            var i, j, events = [];

            for (i = 0; i < serviceIds.length; i++) {
                for (j = 0; j < EVENT_TEST_DATA.length; j++) {
                    if (String(EVENT_TEST_DATA[j].serviceId) === String(serviceIds[i]) &&
                            EVENT_TEST_DATA[j].startTime < end &&
                            EVENT_TEST_DATA[j].endTime > start) {
                        events.push(EVENT_TEST_DATA[j]);
                    }
                }
            }
            return events;
        },

        getEventsRSByExtInfo: function (properties, extInfo, criteria, orderBy) {
            CCOM.stubs.log("[CCOM.EPG.getEventsRSByExtInfo] Unimplemented!");
            return {
                error: {
                    domain: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            };
        },

        getEventsRSByGenre: function (properties, genre, criteria, orderBy) {
            CCOM.stubs.log("[CCOM.EPG.getEventsRSByGenre] Unimplemented!");
            return {
                error: {
                    domain: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            };
        },

        getEventsRSByTag: function (properties, tag, criteria, orderBy) {
            CCOM.stubs.log("[CCOM.EPG.getEventsRSByTag] Unimplemented!");
            return {
                error: {
                    domain: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            };
        },

        getExtInfoByEventId: function (eventId, language, maxCount) {
            CCOM.stubs.log("[CCOM.EPG.getExtInfoByEventId] Unimplemented!");
            return {
                error: {
                    domain: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            };
        },

        getFavoriteLists: function () {
            var favList = [],
                i,
                fav_list_len = FAV_TEST_DATA.length,
                err = {domain: "com.opentv.EPG", name: "", message: "no favorite list"};

            if (fav_list_len === 0) {
                return [];
            }


            for (i = 0; i < fav_list_len; i++) {
                favList[i] = FAV_TEST_DATA[i].listName;
            }

            return favList;

        },

        getGenresByEventId: function (eventId) {
            CCOM.stubs.log("[CCOM.EPG.getGenresByEventId] Unimplemented!");
            return {
                error: {
                    domain: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            };
        },

        getGenresByServiceId: function (serviceId) {
            CCOM.stubs.log("[CCOM.EPG.getGenresByServiceId] Unimplemented!");
            return {
                error: {
                    domain: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            };
        },

        getServicesRSByGenre: function (properties, genre, criteria, orderBy) {
            CCOM.stubs.log("[CCOM.EPG.getServicesRSByGenre] Unimplemented!");
            return {
                error: {
                    domain: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            };
        },
        getServicesRSByTag: function (properties, tag, criteria, order) {
            CCOM.stubs.log("[CCOM.EPG.getServicesRSByTag] Unimplemented!");
            return {
                error: {
                    domain: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            };
        },
        getServicesRSByFavoriteList: function (properties, listName) {
            var i,
                fav_list_len = FAV_TEST_DATA.length,
                err = {domain: "com.opentv.EPG", name: "TBD", message: "can not find favorite service list!"},
                results = [],
                rs,
                services_index,
                fav_services_index;

            for (i = 0; i < fav_list_len; i++) {
                if (String(FAV_TEST_DATA[i].listName) === String(listName)) {

                    if (FAV_TEST_DATA[i].serviceIds.length <= 0) {

                        //return result is empty
                        break;
                    }

                    for (services_index = 0; services_index < SERVICES_TEST_DATA.length; services_index++) {
                        for (fav_services_index = 0; fav_services_index < FAV_TEST_DATA[i].serviceIds.length; fav_services_index++) {

                            if (String(SERVICES_TEST_DATA[services_index].serviceId) === String(FAV_TEST_DATA[i].serviceIds[fav_services_index])) {
                                results.push(SERVICES_TEST_DATA[services_index]);
                            }
                        }
                    }

                    break;
                }
            }

            if (results.length === 0) {
                CCOM.stubs.log("[CCOM.EPG.getServicesRSByFavoriteList] no matching result");
            }

            rs = new CCOM.ResultSet(results);
            return rs;
        },

        removeFavoriteList: function (listName) {
            var i,
                _handle = CCOM.stubs.getHandle(),
                fav_list_len = FAV_TEST_DATA.length;

            for (i = 0; i < fav_list_len; i++) {
                if (String(FAV_TEST_DATA[i].listName) === String(listName)) {
                    FAV_TEST_DATA.splice(i, 1);
                    break;
                }
            }

            if (i < fav_list_len) {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REMOVE_FAVORITE_LIST_OK, {
                    handle: _handle
                });
                return _handle;
            } else {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REMOVE_FAVORITE_LIST_FAILED, {
                    handle: _handle,
                    error: {
                        domin: "com.opentv.EPG",
                        name: "TBD",
                        message: "The listName favlist can't be removed!"
                    }
                });
                return _handle;

            }
        },

        setFavoriteList: function (newListName, newServiceIds) {
            var i, newFav,
                _handle = CCOM.stubs.getHandle(),
                fav_list_len = FAV_TEST_DATA.length;

            for (i = 0; i < fav_list_len; i++) {
                if (String(FAV_TEST_DATA[i].listName) === String(newListName)) {
                    //fav list has been existed
                    FAV_TEST_DATA[i].serviceIds = newServiceIds;
                    break;
                }
            }

            if (i === fav_list_len) {
                newFav = {listName: newListName, serviceIds: newServiceIds };
                FAV_TEST_DATA.push(newFav);
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_FAVORITE_LIST_OK, {
                handle: _handle
            });
            return _handle;
        },

        // 5.0 doc do not include this function, but if it is not defined, gravity can not be run.
        getTagsByServiceId: function (serviceId) {
            var i,
                _handle = CCOM.stubs.getHandle();

            for (i = 0; i < SERVICES_TEST_DATA.length; i++) {
                if (SERVICES_TEST_DATA[i].serviceId === serviceId) {
                    if (!SERVICES_TEST_DATA[i].tags) {
                        return [];
                    } else {
                        return SERVICES_TEST_DATA[i].tags;
                    }
                }
            }
            return [];
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
        _obj.getTagsByEventId = function (eventId) {
            var i,
                _handle = CCOM.stubs.getHandle();

            for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                if (EVENT_TEST_DATA[i].eventId === eventId) {
                    if (!EVENT_TEST_DATA[i].tags) {
                        return [];
                    } else {
                        return EVENT_TEST_DATA[i].tags;
                    }
                }
            }
            return [];
        };

        _obj.addService = function (service, update) {
            var i,
                _handle = CCOM.stubs.getHandle(),
                ori_services_data_len = SERVICES_TEST_DATA.length,
                property;

            for (i = 0; i < ori_services_data_len; i++) {
                if (String(SERVICES_TEST_DATA[i].serviceId) === String(service.serviceId)) {
                    if (update === 0) {
                        CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_SERVICE_FAILED, {
                            handle: _handle,
                            error: {
                                domin: "com.opentv.EPG",
                                name: "Duplicate",
                                message: "service entry has already existed and update=0!"
                            }
                        });
                        return _handle;
                    } else {
                        //update the exist event entry
                        for (property in SERVICES_TEST_DATA[i]) {
                            if (SERVICES_TEST_DATA[i].hasOwnProperty(property) && service.hasOwnProperty(property)) {
                                SERVICES_TEST_DATA[i][property] = service[property];

                            }
                            //else the property of service data will not be changed
                        }
                        CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_SERVICE_OK, {
                            handle: _handle
                        });
                        return _handle;
                    }
                }
            }

            // add a new event entry
            if (String(service.uri) && String(service.serviceId)) {

                SERVICES_TEST_DATA.push(service);
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_SERVICE_OK, {
                    handle: _handle
                });
                return _handle;
            } else {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_SERVICE_FAILED, {
                    handle: _handle,
                    error: {
                        domin: "com.opentv.EPG",
                        name: "Database",
                        message: "The required service content(uri or serviceID) doesn't exist when add new event entry!"
                    }
                });
                return _handle;
            }
        };

        _obj.removeExpiredEvents = function (retentionTime) {
            CCOM.stubs.log("[CCOM.EPG.removeExpiredEvents] Unimplemented!");
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REMOVE_EXPIRED_EVENTS_FAILED, {
                handle: _handle,
                error: {
                    domin: "com.opentv.EPG",
                    name: "Unimplemented",
                    message: ""
                }
            });
            return _handle;
        };

        _obj.tagEvent =  function (eventId, tagId, tagValue) {
            var i, j,
                _handle = CCOM.stubs.getHandle();

            for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                if (EVENT_TEST_DATA[i].eventId === eventId) {
                    if (!EVENT_TEST_DATA[i].tags) {
                        EVENT_TEST_DATA[i].tags = [];
                    }

                    /* Check if the tag already exists */
                    for (j = 0; j < EVENT_TEST_DATA[i].tags.length; j++) {
                        if (EVENT_TEST_DATA[i].tags[j].tagId === tagId) {
                            EVENT_TEST_DATA[i].tags[j].tagValue = tagValue;

                            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_TAG_EVENT_OK, {
                                handle: _handle
                            });
                            return _handle;
                        }
                    }

                    EVENT_TEST_DATA[i].tags.push({tagId: tagId, tagValue: tagValue});

                    CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_TAG_EVENT_OK, {
                        handle: _handle
                    });
                    return _handle;
                }
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_TAG_EVENT_FAILED, {
                handle: _handle,
                error: {
                    domin: "com.opentv.EPG",
                    name: "NotFound",
                    message: ""
                }
            });
            return _handle;
        };

        _obj.tagService = function (serviceId, tagId, tagValue) {
            var i, j,
                _handle = CCOM.stubs.getHandle();

            for (i = 0; i < SERVICES_TEST_DATA.length; i++) {
                if (SERVICES_TEST_DATA[i].serviceId === serviceId) {
                    if (!SERVICES_TEST_DATA[i].tags) {
                        SERVICES_TEST_DATA[i].tags = [];
                    }

                    /* Check if the tag already exists */
                    for (j = 0; j < SERVICES_TEST_DATA[i].tags.length; j++) {
                        if (SERVICES_TEST_DATA[i].tags[j].tagId === tagId) {
                            SERVICES_TEST_DATA[i].tags[j].tagValue = tagValue;

                            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_TAG_SERVICE_OK, {
                                handle: _handle
                            });
                            return _handle;
                        }
                    }

                    SERVICES_TEST_DATA[i].tags.push({tagId: tagId, tagValue: tagValue});

                    CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_TAG_SERVICE_OK, {
                        handle: _handle
                    });
                    return _handle;
                }
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_TAG_SERVICE_FAILED, {
                handle: _handle,
                error: {
                    domin: "com.opentv.EPG",
                    name: "NotFound",
                    message: ""
                }
            });
            return _handle;

        };

        _obj.untagEvent = function (eventId, tagId) {
            var i, j,
                _handle = CCOM.stubs.getHandle();

            for (i = 0; i < EVENT_TEST_DATA.length; i++) {
                if (EVENT_TEST_DATA[i].eventId === eventId) {
                    if (!EVENT_TEST_DATA[i].tags) {
                        break;
                    }

                    for (j = 0; j < EVENT_TEST_DATA[i].tags.length; j++) {
                        if (EVENT_TEST_DATA[i].tags[j].tagId === tagId) {
                            EVENT_TEST_DATA[i].tags.splice(j, 1);

                            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UNTAG_EVENT_OK, {
                                handle: _handle
                            });

                            return _handle;
                        }
                    }
                    break;
                }
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UNTAG_EVENT_FAILED, {
                handle: _handle,
                error: {
                    domin: "com.opentv.EPG",
                    name: "NotFound",
                    message: ""
                }
            });
            return _handle;
        };

        _obj.untagService = function (serviceId, tagId) {
            var i, j,
                _handle = CCOM.stubs.getHandle();

            for (i = 0; i < SERVICES_TEST_DATA.length; i++) {
                if (SERVICES_TEST_DATA[i].serviceId === serviceId) {
                    if (!SERVICES_TEST_DATA[i].tags) {
                        break;
                    }

                    for (j = 0; j < SERVICES_TEST_DATA[i].tags.length; j++) {
                        if (SERVICES_TEST_DATA[i].tags[j].tagId === tagId) {
                            SERVICES_TEST_DATA[i].tags.splice(j, 1);

                            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UNTAG_SERVICE_OK, {
                                handle: _handle
                            });

                            return _handle;
                        }
                    }
                    break;
                }
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_UNTAG_SERVICE_FAILED, {
                handle: _handle,
                error: {
                    domin: "com.opentv.EPG",
                    name: "NotFound",
                    message: ""
                }
            });
            return _handle;
        };

        _obj.addEvent = function (event, update) {
            var i, property,
                _handle = CCOM.stubs.getHandle(),
                ori_event_data_len = EVENT_TEST_DATA.length;

            for (i = 0; i < ori_event_data_len; i++) {
                if (String(EVENT_TEST_DATA[i].eventId) === String(event.eventId)) {
                    if (update === 0) {
                        CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_EVENT_FAILED, {
                            handle: _handle,
                            error: {
                                domin: "com.opentv.EPG",
                                name: "Duplicate",
                                message: "event entry has already existed and update=0!"
                            }
                        });
                        return _handle;
                    } else {
                        //update the exist event entry
                        for (property in EVENT_TEST_DATA[i]) {
                            if (EVENT_TEST_DATA[i].hasOwnProperty(property) && event.hasOwnProperty(property)) {
                                EVENT_TEST_DATA[i][property] = event[property];
                            }
                            //else the property of event data will not be changed
                        }
                        CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_EVENT_OK, {
                            handle: _handle
                        });
                        return _handle;
                    }
                }
            }

            // add a new event entry
            if (String(event.eventId) &&
                    String(event.serviceId) &&
                    String(event.startTime) &&
                    String(event.endTime)) {

                //if seviceid is not identified by sevice database, the event will not be filled

                for (i = 0x0; i < SERVICES_TEST_DATA.length; i++) {
                    if (String(SERVICES_TEST_DATA[i].serviceId) === String(event.serviceId)) {
                        EVENT_TEST_DATA.push(event);
                        CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_EVENT_OK, {
                            handle: _handle
                        });
                        return _handle;
                    }
                }
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_EVENT_FAILED, {
                    handle: _handle,
                    error: {
                        domin: "com.opentv.EPG",
                        name: "Database",
                        message: "The services id is not existed !"
                    }
                });
                return _handle;
            } else {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_ADD_EVENT_FAILED, {
                    handle: _handle,
                    error: {
                        domin: "com.opentv.EPG",
                        name: "Database",
                        message: "The required event content doesn't exist when add new event entry!"
                    }
                });
                return _handle;
            }
        };

        _obj.removeEvent = function (eventId) {
            var i,
                _handle = CCOM.stubs.getHandle(),
                ori_event_data_len = EVENT_TEST_DATA.length;

            for (i = 0; i < ori_event_data_len; i++) {
                if (String(EVENT_TEST_DATA[i].eventId) === String(eventId)) {
                    EVENT_TEST_DATA.splice(i, 1);
                    CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REMOVE_EVENT_OK, {
                        handle: _handle
                    });

                    return _handle;
                }
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REMOVE_EVENT_FAILED, {
                handle: _handle,
                error: {
                    domin: "com.opentv.EPG",
                    name: "NotFound",
                    message: "The event doesn't exist!"
                }
            });
            return _handle;
        };

        _obj.removeService = function (serviceId) {
            var i,
                _handle = CCOM.stubs.getHandle(),
                ori_service_data_len = SERVICES_TEST_DATA.length;

            for (i = 0; i < ori_service_data_len; i++) {
                if (String(SERVICES_TEST_DATA[i].serviceId) === String(serviceId)) {
                    SERVICES_TEST_DATA.splice(i, 1);

                    CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REMOVE_SERVICE_OK, {
                        handle: _handle
                    });
                    return _handle;
                }
            }

            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REMOVE_SERVICE_FAILED, {
                handle: _handle,
                error: {
                    domin: "com.opentv.EPG",
                    name: "NotFound",
                    message: "The service doesn't exist!"
                }
            });
            return _handle;
        };

        _obj.beginBatch = function () {
            CCOM.stubs.log("[CCOM.EPG.getEventsRSByExtInfo] Unimplemented!");
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_BEGIN_BATCH_OK, {
                handle: _handle
            });
            return _handle;
        };

        _obj.cancelBatch = function () {
            CCOM.stubs.log("[CCOM.EPG.getEventsRSByExtInfo] Unimplemented!");
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CANCEL_BATCH_OK, {
                handle: _handle
            });
            return _handle;
        };

        _obj.commitBatch = function () {
            CCOM.stubs.log("[CCOM.EPG.getEventsRSByExtInfo] Unimplemented!");
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_COMMIT_BATCH_OK, {
                handle: _handle
            });
            return _handle;
        };
    }

    /*
     * There is no changes introduced in v5.1.2
     */

    return _obj;
}());

