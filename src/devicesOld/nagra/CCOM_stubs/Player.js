/**
 * This file defines the PlayerManager singleton object and the Player non-singleton objects. 
 * These objects exist since the beginning (v5.0.0).
 */

var CCOM = window.CCOM || {};

/* 
 * CCOM.Player is a constructor, not a singleton
 */
CCOM.Player = CCOM.Player || (function () {
    "use strict";
    var _Player = function () {
        this.id = CCOM.stubs.uuid();

        this.position = 1e5;
        this.speed = 100;
        this.realTimePosition = {};
        this.tracks = {};
        this.sourceUri = "http: //testuri";
        this.duration = 3e6;

        this.activeStreams = [ { id: 2, type: 1 },
                               { id: 3, type: 3 }
                             ];
        this.availableStreams = [ { id: 1,
                                    type: 1,
                                    iaudio: { language: "spa", dualMono: true }
                                  },
                                  { id: 2,
                                    type: 1,
                                    iaudio: { language: "eng" }
                                  },
                                  { id: 3,
                                    type: 3
                                  },
                                  { id: 4,
                                    type: 2,
                                    idvbSubtitle: { language: "eng" }
                                  },
                                  { id: 5,
                                    type: 4
                                  }
                                ];
        this.audioDetails = {};
        this.videoDetails = {};
        this.bufferingLevel = 60;
        this.destUri = "http: //test.destUri";
        this.videoBlankStatus = false;
    };

    _Player.prototype =  {
        //contentErrorReason
        CONTENT_ERROR_REASON_CA_ACCESS_BLACKED_OUT: 2,
        CONTENT_ERROR_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED: 3,
        CONTENT_ERROR_REASON_CA_ACCESS_DENIED: 4,
        CONTENT_ERROR_REASON_CA_ACCESS_DENIED_COPY_PROTECTED: 5,
        CONTENT_ERROR_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT: 6,
        CONTENT_ERROR_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL: 7,
        CONTENT_ERROR_REASON_CA_ACCESS_DIALOG_REQUIRED: 8,
        CONTENT_ERROR_REASON_CA_ACCESS_PAIRING_REQUIRED: 9,
        CONTENT_ERROR_REASON_CA_NO_VALID_SECURE_DEVICE: 10,
        CONTENT_ERROR_REASON_DISK_ERROR: 11,
        CONTENT_ERROR_REASON_DISK_REMOVED: 12,
        CONTENT_ERROR_REASON_GENERIC: 13,
        CONTENT_ERROR_REASON_GST_CORE_ERROR: 14,
        CONTENT_ERROR_REASON_GST_CORE_MISSING_PLUGIN: 15,
        CONTENT_ERROR_REASON_GST_CORE_SEEK: 16,
        CONTENT_ERROR_REASON_GST_LIB_ENCODE: 17,
        CONTENT_ERROR_REASON_GST_LIB_ERROR: 18,
        CONTENT_ERROR_REASON_GST_LIB_INIT: 19,
        CONTENT_ERROR_REASON_GST_LIB_SETTINGS: 20,
        CONTENT_ERROR_REASON_GST_LIB_SHUTDOWN: 21,
        CONTENT_ERROR_REASON_INTERNAL_ERROR: 22,
        CONTENT_ERROR_REASON_LACK_OF_RESOURCE: 23,
        CONTENT_ERROR_REASON_PMT_UPDATED: 24,
        CONTENT_ERROR_REASON_REQUESTED: 25,
        CONTENT_ERROR_REASON_RESOURCES_LOST: 1,
        CONTENT_ERROR_REASON_RESOURCE_BUSY: 26,
        CONTENT_ERROR_REASON_RESOURCE_CLOSE: 27,
        CONTENT_ERROR_REASON_RESOURCE_FAILED: 28,
        CONTENT_ERROR_REASON_RESOURCE_NOT_FOUND: 29,
        CONTENT_ERROR_REASON_RESOURCE_NO_SPACE_LEFT: 30,
        CONTENT_ERROR_REASON_RESOURCE_OPEN_READ: 31,
        CONTENT_ERROR_REASON_RESOURCE_OPEN_READ_WRITE: 32,
        CONTENT_ERROR_REASON_RESOURCE_OPEN_WRITE: 33,
        CONTENT_ERROR_REASON_RESOURCE_READ: 34,
        CONTENT_ERROR_REASON_RESOURCE_SEEK: 35,
        CONTENT_ERROR_REASON_RESOURCE_SETTINGS: 36,
        CONTENT_ERROR_REASON_RESOURCE_SYNC: 37,
        CONTENT_ERROR_REASON_RESOURCE_TRANSITION: 38,
        CONTENT_ERROR_REASON_RESOURCE_WRITE: 39,
        CONTENT_ERROR_REASON_SIGNAL_LOSS: 40,
        CONTENT_ERROR_REASON_STREAM_CODEC_NOT_FOUND: 41,
        CONTENT_ERROR_REASON_STREAM_DECODE: 42,
        CONTENT_ERROR_REASON_STREAM_DECRYPT: 43,
        CONTENT_ERROR_REASON_STREAM_DECRYPT_NOKEY: 44,
        CONTENT_ERROR_REASON_STREAM_DEMUX: 45,
        CONTENT_ERROR_REASON_STREAM_ENCODE: 46,
        CONTENT_ERROR_REASON_STREAM_FAILED: 47,
        CONTENT_ERROR_REASON_STREAM_FORMAT: 48,
        CONTENT_ERROR_REASON_STREAM_MUX: 49,
        CONTENT_ERROR_REASON_STREAM_NOT_IMPLEMENTED: 50,
        CONTENT_ERROR_REASON_STREAM_TYPE_NOT_FOUND: 51,
        CONTENT_ERROR_REASON_STREAM_WRONG_TYPE: 52,
        CONTENT_ERROR_REASON_TUNER_ERROR: 53,
        //contentStartFailedReason
        CONTENT_PLAY_FAILED_REASON_BAD_LOCATION: 101,
        CONTENT_PLAY_FAILED_REASON_BAD_PARAM: 102,
        CONTENT_PLAY_FAILED_REASON_BAD_URI: 103,
        CONTENT_PLAY_FAILED_REASON_CA_ACCESS_BLACKED_OUT: 104,
        CONTENT_PLAY_FAILED_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED: 105,
        CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED: 106,
        CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_COPY_PROTECTED: 107,
        CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT: 108,
        CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL: 109,
        CONTENT_PLAY_FAILED_REASON_CA_ACCESS_DIALOG_REQUIRED: 110,
        CONTENT_PLAY_FAILED_REASON_CA_ACCESS_PAIRING_REQUIRED: 111,
        CONTENT_PLAY_FAILED_REASON_CA_NO_VALID_SECURE_DEVICE: 112,
        CONTENT_PLAY_FAILED_REASON_CONFLICT: 113,
        CONTENT_PLAY_FAILED_REASON_DUPLICATE_URI: 114,
        CONTENT_PLAY_FAILED_REASON_GENERIC: 115,
        CONTENT_PLAY_FAILED_REASON_INTERNAL_ERROR: 116,
        CONTENT_PLAY_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE: 117,
        CONTENT_PLAY_FAILED_REASON_LACK_OF_RESOURCES: 118,
        CONTENT_PLAY_FAILED_REASON_NOT_SUPPORTED: 119,
        CONTENT_PLAY_FAILED_REASON_NO_LOCK: 120,
        CONTENT_PLAY_FAILED_REASON_OUT_OF_MEMORY: 121,
        CONTENT_PLAY_FAILED_REASON_OVERRIDDEN_BY_NEW_REQUEST: 122,
        CONTENT_PLAY_FAILED_REASON_PMT_UPDATED: 123,
        CONTENT_PLAY_FAILED_REASON_REQUESTED: 124,
        CONTENT_PLAY_FAILED_REASON_RESOURCE_LOST: 125,
        CONTENT_PLAY_FAILED_REASON_RESOURCE_TRANSITION: 126,
        CONTENT_PLAY_FAILED_REASON_TUNER_ERROR: 127,
        //contentStopFailedReason
        CONTENT_STOP_FAILED_REASON_ALREADY_STOPPED: 1,
        CONTENT_STOP_FAILED_REASON_GENERIC: 2,
        CONTENT_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE: 3,
        //jumpToLiveFailedReason
        JUMP_TO_LIVE_FAILED_INVALID_PLAY_SESSION_HANDLE: 1,
        JUMP_TO_LIVE_FAILED_REASON_GENERIC: 2,
        JUMP_TO_LIVE_FAILED_REASON_NOT_SUPPORTED: 3,
        //playControlCommandType
        PLAY_CONTROL_CMD_DONT_START_STREAMS: 1,
        PLAY_CONTROL_CMD_POSITION: 2,
        PLAY_CONTROL_CMD_EXT_SUBTITLE_INFO: 3,
        PLAY_CONTROL_CMD_PLAY_MODE: 4,
        PLAY_CONTROL_CMD_INVALID: 5,
        //playerMethodReturnErrors
        PLAYER_METHOD_ERROR_BAD_PARAM: 1,
        PLAYER_METHOD_ERROR_BAD_STREAM: 2,
        PLAYER_METHOD_ERROR_BAD_URI: 3,
        PLAYER_METHOD_ERROR_DUPLICATE_URI: 4,
        PLAYER_METHOD_ERROR_FAILURE: 5,
        PLAYER_METHOD_ERROR_GENERIC: 6,
        PLAYER_METHOD_ERROR_INACTIVE: 7,
        PLAYER_METHOD_ERROR_INVALID_NO_OF_PARAMS: 8,
        PLAYER_METHOD_ERROR_NOT_SUPPORTED: 9,
        PLAYER_METHOD_ERROR_STREAM_ALREADY_STARTED: 10,
        PLAYER_METHOD_ERROR_STREAM_ALREADY_STOPPED: 11,
        //positionChangeFailedReason
        POSITION_CHANGE_FAILED_REASON_BAD_PARAM: 1,
        POSITION_CHANGE_FAILED_REASON_GENERIC: 2,
        POSITION_CHANGE_FAILED_REASON_INACTIVE: 3,
        POSITION_CHANGE_FAILED_REASON_INVALID_NO_OF_IP_PARAMS: 4,
        POSITION_CHANGE_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE: 5,
        POSITION_CHANGE_FAILED_REASON_NOT_SUPPORTED: 6,
        POSITION_CHANGE_FAILED_REASON_OUT_OF_BOUNDS: 7,
        POSITION_CHANGE_FAILED_REASON_TRICK_PLAY_NOT_SUPPORTED: 8,
        //positionType
        POSITION_TYPE_INVALID: 1,
        POSITION_TYPE_TIME_BASED: 2,
        //seekWhence
        SEEK_CUR: 1,
        SEEK_END: 2,
        SEEK_INVALID: 3,
        SEEK_SET: 4,
        //speedChangeFailedReason
        SPEED_CHANGE_FAILED_REASON_GENERIC: 1,
        SPEED_CHANGE_FAILED_REASON_INACTIVE: 2,
        SPEED_CHANGE_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE: 3,
        SPEED_CHANGE_FAILED_REASON_NOT_SUPPORTED: 4,
        SPEED_CHANGE_FAILED_REASON_TRICK_PLAY_NOT_SUPPORTED: 5,
        //streamAspectRatio
        ASPECT_RATIO_16_9: 1,
        ASPECT_RATIO_2_21_1: 2,
        ASPECT_RATIO_4_3: 3,
        ASPECT_RATIO_HIGH_DEFINITION: 4,
        ASPECT_RATIO_NONE: 5,
        //streamAudioDualMonoChannelType
        AUDIO_CHANNEL_DUAL_MONO_LEFT: 1,
        AUDIO_CHANNEL_DUAL_MONO_RIGHT: 2,
        AUDIO_CHANNEL_NO_DUAL_MONO: 3,
        //streamAudioType
        AUDIO_TYPE_CLEAN_EFFECTS: 1,
        AUDIO_TYPE_HEARING_IMPAIRED: 2,
        AUDIO_TYPE_UNDEFINED: 3,
        AUDIO_TYPE_VISUAL_IMPAIRED_COMMENTARY: 4,
        //streamCustomInfoType
        STREAM_CUSTOM_TYPE_ARIB: 1,
        STREAM_CUSTOM_TYPE_DVB: 2,
        STREAM_CUSTOM_TYPE_NONE: 3,
        //streamDisabledReason
        STREAM_DISABLED_REASON_CA_ACCESS_BLACKED_OUT: 4,
        STREAM_DISABLED_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED: 5,
        STREAM_DISABLED_REASON_CA_ACCESS_DENIED: 6,
        STREAM_DISABLED_REASON_CA_ACCESS_DENIED_COPY_PROTECTED: 7,
        STREAM_DISABLED_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT: 8,
        STREAM_DISABLED_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL: 9,
        STREAM_DISABLED_REASON_CA_ACCESS_DIALOG_REQUIRED: 10,
        STREAM_DISABLED_REASON_CA_ACCESS_PAIRING_REQUIRED: 11,
        STREAM_DISABLED_REASON_CA_NO_VALID_SECURE_DEVICE: 12,
        STREAM_DISABLED_REASON_GENERIC: 13,
        //streamDualMonoChannel
        STREAM_DUAL_MONO_LEFT_CHANNEL: 1,
        STREAM_DUAL_MONO_RIGHT_CHANNEL: 2,
        //streamErrorReason
        STREAM_ERROR_REASON_CA_ACCESS_BLACKED_OUT: 1,
        STREAM_ERROR_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED: 2,
        STREAM_ERROR_REASON_CA_ACCESS_DENIED: 3,
        STREAM_ERROR_REASON_CA_ACCESS_DENIED_COPY_PROTECTED: 4,
        STREAM_ERROR_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT: 5,
        STREAM_ERROR_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL: 6,
        STREAM_ERROR_REASON_CA_ACCESS_DIALOG_REQUIRED: 7,
        STREAM_ERROR_REASON_CA_ACCESS_PAIRING_REQUIRED: 8,
        STREAM_ERROR_REASON_CA_NO_VALID_SECURE_DEVICE: 9,
        STREAM_ERROR_REASON_DISK_ERROR: 10,
        STREAM_ERROR_REASON_DISK_REMOVED: 11,
        STREAM_ERROR_REASON_GENERIC: 12,
        STREAM_ERROR_REASON_INVALID_PLAY_SESSION_HANDLE: 13,
        STREAM_ERROR_REASON_OVERRIDDEN_BY_NEW_REQUEST: 14,
        STREAM_ERROR_REASON_RESOURCES_LOST: 15,
        STREAM_ERROR_REASON_SIGNAL_LOSS: 16,
        STREAM_ERROR_REASON_STREAM_LIST_CHANGED: 17,
        //streamFormat
        STREAM_FORMAT_AUDIO_AAC: 1,
        STREAM_FORMAT_AUDIO_AC2: 2,
        STREAM_FORMAT_AUDIO_AC3: 3,
        STREAM_FORMAT_AUDIO_AIFF: 4,
        STREAM_FORMAT_AUDIO_DTS: 5,
        STREAM_FORMAT_AUDIO_ENHANCED_AC3: 6,
        STREAM_FORMAT_AUDIO_G729: 7,
        STREAM_FORMAT_AUDIO_HE_AAC: 8,
        STREAM_FORMAT_AUDIO_INVALID: 9,
        STREAM_FORMAT_AUDIO_LPCM: 10,
        STREAM_FORMAT_AUDIO_MP3: 11,
        STREAM_FORMAT_AUDIO_MP4: 12,
        STREAM_FORMAT_AUDIO_MPEG1: 13,
        STREAM_FORMAT_AUDIO_MPEG2: 14,
        STREAM_FORMAT_AUDIO_PCM: 15,
        STREAM_FORMAT_AUDIO_WAVE: 16,
        STREAM_FORMAT_AUDIO_WMA: 17,
        STREAM_FORMAT_DATA_AIT: 18,
        STREAM_FORMAT_DATA_DSMCC: 19,
        STREAM_FORMAT_DATA_INVALID: 20,
        STREAM_FORMAT_DATA_OTV_MODULE: 21,
        STREAM_FORMAT_MUSIC_INFO_INVALID: 22,
        STREAM_FORMAT_MUSIC_INFO_MUSIC_INFO: 23,
        STREAM_FORMAT_SUBTITLE_ARIB_CLOSED_CAPTION: 24,
        STREAM_FORMAT_SUBTITLE_DVB_SUBTITLE: 25,
        STREAM_FORMAT_SUBTITLE_DVB_TLTXT_SUBTITLE: 26,
        STREAM_FORMAT_SUBTITLE_EIT_608_CLOSED_CAPTION: 27,
        STREAM_FORMAT_SUBTITLE_INVALID: 28,
        STREAM_FORMAT_SUBTITLE_SCTE27: 29,
        STREAM_FORMAT_VIDEO_DIVX: 30,
        STREAM_FORMAT_VIDEO_H264: 31,
        STREAM_FORMAT_VIDEO_INDEPENDENT_PAGE_ARIB_SUPERIMPOSE: 32,
        STREAM_FORMAT_VIDEO_INDEPENDENT_PAGE_DVB_TLTXT_TELETEXT: 33,
        STREAM_FORMAT_VIDEO_INDEPENDENT_PAGE_INVALID: 34,
        STREAM_FORMAT_VIDEO_INVALID: 35,
        STREAM_FORMAT_VIDEO_MPEG1: 36,
        STREAM_FORMAT_VIDEO_MPEG2: 37,
        STREAM_FORMAT_VIDEO_MPEG4P2: 38,
        STREAM_FORMAT_VIDEO_VC1: 39,
        STREAM_FORMAT_SUBTITLE_SRT: 40,
        //streamOtvDefault
        STREAM_OTV_DEFAULT: 1,
        STREAM_OTV_NEVER_DEFAULT: 2,
        STREAM_OTV_NONE: 3,
        STREAM_OTV_NOT_DEFAULT: 4,
        //streamPageDisplayTiming
        PAGE_DISPLAY_ASYNC: 5,
        PAGE_DISPLAY_PROGRAM_SYNC: 6,
        PAGE_DISPLAY_TIME_SYNC: 7,
        //streamSpecType
        STREAM_SPEC_TYPE_JUST_ID: 1,
        //streamStartFailedReason
        STREAM_START_FAILED_REASON_ALREADY_STARTED: 1,
        STREAM_START_FAILED_REASON_BAD_PARAM: 2,
        STREAM_START_FAILED_REASON_BAD_REQUEST: 3,
        STREAM_START_FAILED_REASON_BAD_STREAM: 4,
        STREAM_START_FAILED_REASON_BAD_TAG: 5,
        STREAM_START_FAILED_REASON_CA_ACCESS_BLACKED_OUT: 6,
        STREAM_START_FAILED_REASON_CA_ACCESS_CHIPSET_PAIRING_REQUIRED: 7,
        STREAM_START_FAILED_REASON_CA_ACCESS_DENIED: 8,
        STREAM_START_FAILED_REASON_CA_ACCESS_DENIED_COPY_PROTECTED: 9,
        STREAM_START_FAILED_REASON_CA_ACCESS_DENIED_NO_VALID_CREDIT: 10,
        STREAM_START_FAILED_REASON_CA_ACCESS_DENIED_PARENTAL_CONTROL: 11,
        STREAM_START_FAILED_REASON_CA_ACCESS_DIALOG_REQUIRED: 12,
        STREAM_START_FAILED_REASON_CA_ACCESS_PAIRING_REQUIRED: 13,
        STREAM_START_FAILED_REASON_CA_NO_VALID_SECURE_DEVICE: 14,
        STREAM_START_FAILED_REASON_GENERIC: 15,
        STREAM_START_FAILED_REASON_INACTIVE: 16,
        STREAM_START_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE: 17,
        STREAM_START_FAILED_REASON_LACK_OF_RESOURCES: 18,
        STREAM_START_FAILED_REASON_NOT_AVAILABLE_IN_PMT: 19,
        STREAM_START_FAILED_REASON_NOT_SUPPORTED: 20,
        STREAM_START_FAILED_REASON_OVERRIDDEN_BY_NEW_REQUEST: 21,
        STREAM_START_FAILED_REASON_BUSY: 22,
        //streamStopFailedReason
        STREAM_STOP_FAILED_REASON_ALREADY_STOPPED: 1,
        STREAM_STOP_FAILED_REASON_BAD_PARAM: 2,
        STREAM_STOP_FAILED_REASON_BAD_REQUEST: 3,
        STREAM_STOP_FAILED_REASON_BAD_STREAM: 4,
        STREAM_STOP_FAILED_REASON_GENERIC: 5,
        STREAM_STOP_FAILED_REASON_INACTIVE: 6,
        STREAM_STOP_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE: 7,
        STREAM_STOP_FAILED_REASON_BUSY: 8,
        //streamTeletextType
        ADDITIONAL_INFORMATION_PAGE: 1,
        PROGRAMM_SCHEDULE_PAGE: 2,
        TELETEXT_PAGE: 3,
        //streamType
        STREAM_TYPE_ANY: 5,
        STREAM_TYPE_AUDIO: 1,
        STREAM_TYPE_DATA: 4,
        STREAM_TYPE_END: 6,
        STREAM_TYPE_MUSIC_INFO: 7,
        STREAM_TYPE_SUBTITLE: 2,
        STREAM_TYPE_VIDEO: 3,
        STREAM_TYPE_VIDEO_INDEPENDENT_PAGE: 8,
        //uriRenovateFailedReason
        PLAYER_URI_RENOVATE_FAILED_REASON_BAD_PARAM: 1,
        PLAYER_URI_RENOVATE_FAILED_REASON_GENERIC: 2,
        PLAYER_URI_RENOVATE_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE: 3,
        //videoScanType
        VIDEO_SCAN_TYPE_ENDDEF: 1,
        VIDEO_SCAN_TYPE_INTERLACED: 2,
        VIDEO_SCAN_TYPE_PROGRESSIVE: 3,
        //playModeType
        PLAY_MODE_BY_SERVICE: 101,
        PLAY_MODE_BY_STREAM: 102,
        PLAY_MODE_INVALID: 103,
        //rbOpFailureReason
        RB_STATE_CHANGE_FAILED_CONFIG_DISABLED: 201,
        RB_STATE_CHANGE_FAILED_ONLY_ONE_INSTANCE_ALLOWED: 202,
        RB_STATE_CHANGE_FAILED_REASON_BUSY: 203,
        RB_STATE_CHANGE_FAILED_REASON_GENERIC: 204,
        RB_STATE_CHANGE_FAILED_REASON_INVALID_PLAY_SESSION_HANDLE: 205,
        RB_STATE_CHANGE_FAILED_REASON_MEDIA_NOT_SUPPORTED: 206,
        RB_STATE_CHANGE_FAILED_REASON_NOT_SUPPORTED: 207,
        RB_STATE_CHANGE_FAILED_REASON_PLAYER_INACTIVE: 208,
        //videoLayerZorder
        VIDEO_LAYER_ZORDER_BOTTOM: 301,
        VIDEO_LAYER_ZORDER_MIDDLE: 302,
        VIDEO_LAYER_ZORDER_TOP: 303,
        //properties


        _MY_NAME_SPACE: "CCOM.Player",

        _EVENT_SET_POSITION_OK: "setPositionOK",
        _EVENT_SET_POSITION_FAILED: "setPositionFailed",
        _EVENT_SET_SPEED_OK: "setSpeedOK",
        _EVENT_SET_SPEED_FAILED: "setSpeedFailed",
        _EVENT_START_STREAMS_OK: "startStreamsOK",
        _EVENT_START_STREAMS_FAILED: "startStreamsFailed",
        _EVENT_STOP_STREAMS_OK: "stopStreamsOK",
        _EVENT_STOP_STREAMS_FAILED: "stopStreamsFailed",
        _EVENT_PLAY_OK: "playOK",
        _EVENT_PLAY_FAILED: "playFailed",
        _EVENT_STOP_OK: "stopOK",
        _EVENT_STOP_FAILED: "stopFailed",
        _EVENT_RENOVATE_URI_OK: "renovateUriOK",
        _EVENT_RENOVATE_URI_FAILED: "renovateUriFailed",
        _EVENT_SET_STREAM_CONTROL_OK: "setStreamControlOK",
        _EVENT_SET_STREAM_CONTROL_FAILED: "setStreamControlFailed",
        _EVENT_SET_POSITION_WITH_SEQ_NUM_OK: "setPositionWithSeqNumOK",
        _EVENT_SET_POSITION_WITH_SEQ_NUM_FAILED: "setPositionWithSeqNumFailed",

        setPosition: function (command) {
            var pos,
                _handle = CCOM.stubs.getHandle();
            if (command.whence === this.SEEK_CUR) {
                pos = this.position += command.timePosition;
                this.position = pos < 0 ? 0 : pos;
            } else {
                pos = this.position = command.timePosition;
                this.position = pos < 0 ? 0 : pos;
            }
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_SET_POSITION_OK, {
                target: this,
                handle: _handle
            });
            return _handle;
        },
        setSpeed: function (speed) {
            var _handle = CCOM.stubs.getHandle();
            this.speed = speed;
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_SET_SPEED_OK, {
                target: this,
                handle: _handle
            });
            return _handle;
        },
        setReviewBuffer: function (reviewBufferObj) {
            this.realTimePosition = reviewBufferObj;
        },
        addEventListener: function (event, callback) {
            if (-1 === this._supportedEvents.indexOf(event)) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }

            return CCOM.stubs.addEventListener(this.id, this._MY_NAME_SPACE, event, callback);
        },
        removeEventListener: function (event, callback) {
            if (-1 === this._supportedEvents.indexOf(event)) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }

            return CCOM.stubs.removeEventListener(this.id, this._MY_NAME_SPACE, event, callback);
        },

        startStreams: function (context) {
            var contextCount, i, stream,
                _handle = CCOM.stubs.getHandle();
            for (contextCount = 0; contextCount < context.length; contextCount++) {
                for (i = 0; i < this.availableStreams.length; i++) {
                    if (context[contextCount].id === this.availableStreams[i].id) {
                        stream = this.availableStreams[i];
                        break;
                    }
                }
                if (stream) {
                    for (i = 0; i < this.activeStreams.length; i++) {
                        if (this.activeStreams[i].type === stream.type) {
                            this.activeStreams.splice(i, 1);
                            break;
                        }
                    }
                    this.activeStreams.push({
                        id: stream.id,
                        type: stream.type
                    });
                }
            }
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_START_STREAMS_OK, {
                target: this,
                handle: _handle
            });
            return _handle;
        },
        stopStreams: function (context) {
            var newActiveStreams = [], contextCount, i,
                _handle = CCOM.stubs.getHandle();
            for (contextCount = 0; contextCount < context.length; contextCount++) {
                for (i = 0; i < this.activeStreams.length; i++) {
                    if (context[contextCount].stopStreamTypes !== this.activeStreams[i].type) {
                        newActiveStreams.push(this.activeStreams[i]);
                    }
                }
            }
            this.activeStreams = newActiveStreams;
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_STOP_STREAMS_OK, {
                target: this,
                handle: _handle
            });
            return _handle;
        },
        play: function (sourceUri, controlCommands) {
            var _handle = CCOM.stubs.getHandle(),
                video_obj = document.getElementsByTagName("video")[0],
                scripts = document.getElementsByTagName("script"),
                path,
                i;
            if (sourceUri !== this.sourceUri) {
                this.sourceUri = sourceUri;
                //Just for html browser supported video tag.
                if (video_obj) {
                    video_obj.loop = true;
                    video_obj.autoplay = true;
                    for (i = 0; i < scripts.length; i++) {
                        if (scripts[i].src.indexOf("stub") >= 0 && scripts[i].src.indexOf("Player.js") >= 0) {
                            path = scripts[i].src.substr(0, scripts[i].src.indexOf("Player.js"));
                            break;
                        }
                    }
                    if (path) {
                        if (video_obj.src.indexOf("1.ogv") > 0) {
                            video_obj.src = path + "video/2.ogv";
                        } else {
                            video_obj.src = path + "video/1.ogv";
                        }
                    }
                }
            }
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_PLAY_OK, {
                target: this,
                handle: _handle
            });
            return _handle;
        },
        stop: function () {
            var _handle = CCOM.stubs.getHandle(),
                video_obj = document.getElementsByTagName("video")[0];
            if (video_obj) {
                video_obj.pause();
            }
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_STOP_OK, {
                target: this,
                handle: _handle
            });
            return _handle;
        },
        blankVideo: function () {
            this.videoBlankStatus = true;
            var video_obj = document.getElementsByTagName("video")[0];
        },
        unblankVideo: function () {
            this.videoBlankStatus = false;
        },
        jumpToLive: function () {
            //jump from playback
            var video_obj = document.getElementsByTagName("video")[0],
                path,
                scripts = document.getElementsByTagName("script"),
                i;
            if (video_obj) {
                video_obj.loop = true;
                video_obj.autoplay = true;
                for (i = 0; i < scripts.length; i++) {
                    if (scripts[i].src.indexOf("stub") >= 0 && scripts[i].src.indexOf("Player.js") >= 0) {
                        path = scripts[i].src.substr(0, scripts[i].src.indexOf("Player.js"));
                        break;
                    }
                }
                if (path) {
                    if (video_obj.src.indexOf("1.ogv") > 0) {
                        video_obj.src = path + "video/1.ogv";
                    } else {
                        video_obj.src = path + "video/2.ogv";
                    }
                }
            }
        },
        renovateUri: function (renovatedUri) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_RENOVATE_URI_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.Player",
                    message: ""
                }
            });
            return _handle;
        },
        getStreamControl: function (command) {
            return {
                streamCommandControlData: {}
            };
        },
        setStreamControl: function (command, data) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_SET_STREAM_CONTROL_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.Player",
                    message: ""
                }
            });
            return _handle;
        }
    };

    _Player.prototype._supportedEvents = [ _Player.prototype._EVENT_SET_POSITION_OK,
                                           _Player.prototype._EVENT_SET_POSITION_FAILED,
                                           _Player.prototype._EVENT_SET_SPEED_OK,
                                           _Player.prototype._EVENT_SET_SPEED_FAILED,
                                           _Player.prototype._EVENT_START_STREAMS_OK,
                                           _Player.prototype._EVENT_START_STREAMS_FAILED,
                                           _Player.prototype._EVENT_STOP_STREAMS_OK,
                                           _Player.prototype._EVENT_STOP_STREAMS_FAILED,
                                           _Player.prototype._EVENT_PLAY_OK,
                                           _Player.prototype._EVENT_PLAY_FAILED,
                                           _Player.prototype._EVENT_STOP_OK,
                                           _Player.prototype._EVENT_STOP_FAILED,
                                           _Player.prototype._EVENT_RENOVATE_URI_OK,
                                           _Player.prototype._EVENT_RENOVATE_URI_FAILED,
                                           _Player.prototype._EVENT_SET_STREAM_CONTROL_OK,
                                           _Player.prototype._EVENT_SET_STREAM_CONTROL_FAILED,
                                           _Player.prototype._EVENT_SET_POSITION_WITH_SEQ_NUM_OK,
                                           _Player.prototype._EVENT_SET_POSITION_WITH_SEQ_NUM_FAILED
                                         ];

    /*
     * There is no changes in v5.1.1
     */

    /*
     * Changes introduced in v5.1.2
     */
    if (CCOM.stubs.getCurrentMWVersion() >= CCOM.stubs.MW_VER_5_1_2) {
        _Player.prototype.setPositionWithSeqNum = function (position, sequenceNumber) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(this.id, this._MY_NAME_SPACE, this._EVENT_SET_POSITION_WITH_SEQ_NUM_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.Player",
                    message: ""
                }
            });
            return _handle;
        };
    }

    return _Player;

}());


/* 
 * PlayerManager is a singleton, existing from the beginning (v5.0.0) 
 */
CCOM.PlayerManager = CCOM.PlayerManager || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.PlayerManager",
        _id = CCOM.stubs.uuid(),
        _obj = {},
        // events in xml
        // events from methods
        _EVENT_SET_PLAYER_INSTANCE_PRIORITIES_OK = "setPlayerInstancePrioritiesOK",
        _EVENT_SET_PLAYER_INSTANCE_PRIORITIES_FAILED = "setPlayerInstancePrioritiesFailed",
        _EVENT_SET_REVIEW_BUFFER_STATE_OK = "setReviewBufferStateOK",
        _EVENT_SET_REVIEW_BUFFER_STATE_FAILED = "setReviewBufferStateFailed",

        _supportedEvents = [ _EVENT_SET_PLAYER_INSTANCE_PRIORITIES_OK,
                             _EVENT_SET_PLAYER_INSTANCE_PRIORITIES_FAILED,
                             _EVENT_SET_REVIEW_BUFFER_STATE_OK,
                             _EVENT_SET_REVIEW_BUFFER_STATE_FAILED
                           ];

    _obj = {
        //  PlayerManagerMethodErrors in 5.1.2 replace getInstanceErrors
        PLAYER_MANAGER_METHOD_ERROR_BAD_URI: 1,
        PLAYER_MANAGER_METHOD_ERROR_GENERIC: 2,
        PLAYER_MANAGER_METHOD_ERROR_DUPLICATE_URI: 3,
        PLAYER_MANAGER_METHOD_ERROR_INVALID_IP_PARAMS: 4,
        PLAYER_MANAGER_METHOD_ERROR_NOT_SUPPORTED: 5,
        //AudioOutVal
        AUD_OUT_VAL_FALSE: 101,
        AUD_OUT_VAL_TRUE: 102,
        AUD_OUT_VAL_UNDEFINED: 103,
        //InstancePriority
        INSTANCE_PRIORITY_HIGH: 201,
        INSTANCE_PRIORITY_LOW: 202,
        INSTANCE_PRIORITY_MEDIUM: 203,
        //properties
        getInstance: function (createArgs) {
            var playerObj = {};
            playerObj.instance = new CCOM.Player();
            return playerObj;
        },
        releaseInstance: function (objectPath) {},
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

    /*
     * There is no change in v5.1.1
     */

    /*
     * Changes introduced in v5.1.2
     */
    if (CCOM.stubs.getCurrentMWVersion() >= CCOM.stubs.MW_VER_5_1_2) {
        _obj.setAudioStatus = function (instanceHandle, status) {
            return {
                error: {
                    domain: "com.opentv.PlayerManager",
                    name: "PLAYER_MANAGER_METHOD_ERROR_NOT_SUPPORTED",
                    message: "error"
                }
            };
        };
        _obj.setPlayerInstancePriorities = function (priorityInfo) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_PLAYER_INSTANCE_PRIORITIES_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.PlayerManager",
                    name: "PLAYER_MANAGER_METHOD_ERROR_NOT_SUPPORTED",
                    message: "error"
                }
            });
            return _handle;
        };
        _obj.setReviewBufferState = function (instanceHandle, state) {
            var _handle = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_REVIEW_BUFFER_STATE_FAILED, {
                target: this,
                handle: _handle,
                error: {
                    domain: "com.opentv.PlayerManager",
                    name: "PLAYER_MANAGER_METHOD_ERROR_NOT_SUPPORTED",
                    message: "error"
                }
            });
            return _handle;
        };
    }

    return _obj;
}());
