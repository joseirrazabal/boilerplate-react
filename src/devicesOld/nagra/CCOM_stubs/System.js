/**
 * Stub for CCOM 2.0 CCOM.System, a singleton added since v5.0.0
 */

var CCOM = window.CCOM || {};

CCOM.System = CCOM.System || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.System",
        _id = CCOM.stubs.uuid(),
        _ver = CCOM.stubs.getCurrentMWVersion(),
        _hdmiConnected = true,
        _videoFormat = 5,
        _aspectMode = 1,
        _audioDelay = 0,
        _audioType = 1,
        _3DFormat = 1,
        _videoColorEncoding = 1,
        _analogueConnected = true,
        _analogueAspectMode = 1,
        _aspectRatio = 1,
        //evnet from xml
        _EVENT_ON_3D_MODE = "on3dModeEvent",
        _EVENT_ON_HDMI_CEC = "onHdmiCecEvent",
        _EVENT_HDMI = "onHdmiEvent",
        _EVENT_SYSTEM_STANDBY = "onSystemStandby",
        _EVENT_SYSTEM_WAKE = "onSystemWake",

        _supportedEvents = [ _EVENT_ON_3D_MODE,
                             _EVENT_ON_HDMI_CEC,
                             _EVENT_HDMI,
                             _EVENT_SYSTEM_STANDBY,
                             _EVENT_SYSTEM_WAKE
                           ],
        _obj = {};

   /*
    * The object exists since the beginning (v5.0.0)
    */
    _obj = {
        //analogue_cci
        ANALOGUE_CCI_COPY_FREELY: 0,
        ANALOGUE_CCI_COPY_NO_MORE: 1,
        ANALOGUE_CCI_COPY_ONCE: 2,
        ANALOGUE_CCI_COPY_NEVER: 4,

        //analogue_video_aspect_mode
        ANALOGUE_VIDEO_ASPECT_MODE_LETTER_BOX: 0,
        ANALOGUE_VIDEO_ASPECT_MODE_PAN_SCAN: 1,
        ANALOGUE_VIDEO_ASPECT_MODE_CENTER_CUT: 2,
        ANALOGUE_VIDEO_ASPECT_MODE_STRETCH: 4,

        //analogue_video_aspect_ratio
        ANALOGUE_VIDEO_ASPECT_RATIO_4_3: 0,
        ANALOGUE_VIDEO_ASPECT_RATIO_16_9: 1,

        //front_panel_capabilities
        FPCHAR_CAPABILITY_BLINK: 1,
        FPCHAR_CAPABILITY_FADE: 2,
        FPCHAR_CAPABILITY_7SEG: 4,
        FPCHAR_CAPABILITY_ASCII: 8,
        FPCHAR_CAPABILITY_UTF8: 16,

        //hdmi_3d_format
        HDMI_3D_FORMAT_FRAME_PACKING: 1,
        HDMI_3D_FORMAT_TOP_AND_BOTTOM: 2,
        HDMI_3D_FORMAT_SIDE_BY_SIDE_HALF: 4,

        //hdmi_audio_type
        HDMI_AUDIO_TYPE_PCM: 1,
        HDMI_AUDIO_TYPE_AC3: 2,
        HDMI_AUDIO_TYPE_DDPLUS: 4,

        //hdmi_event
        HDMI_EVENT_SINK_CONNECTED: 0,
        HDMI_EVENT_SINK_DISCONNECTED: 1,
        HDMI_EVENT_SINK_AUTHENTICATION_FAILED: 2,
        HDMI_EVENT_SINK_AUTHENTICATED: 4,
        HDMI_EVENT_SINK_REVOKED: 8,

        //hdmi_video_aspect_mode
        HDMI_VIDEO_ASPECT_MODE_PILLAR_BOX: 0,
        HDMI_VIDEO_ASPECT_MODE_STRETCH: 1,

        //hdmi_video_color_type
        HDMI_VIDEO_COLOR_TYPE_RGB: 1,
        HDMI_VIDEO_COLOR_TYPE_YCC_422: 2,
        HDMI_VIDEO_COLOR_TYPE_YCC_444: 4,

        //hdmi_video_format
        HDMI_VIDEO_FORMAT_480I: 1,
        HDMI_VIDEO_FORMAT_480P: 2,
        HDMI_VIDEO_FORMAT_576I: 4,
        HDMI_VIDEO_FORMAT_576P: 8,
        HDMI_VIDEO_FORMAT_720P: 16,
        HDMI_VIDEO_FORMAT_1080I: 32,
        HDMI_VIDEO_FORMAT_1080P: 64,

        //led_capabilities
        LED_CAPABILITY_BLINK: 1,
        LED_CAPABILITY_SPIN: 2,
        LED_CAPABILITY_FADE: 4,
        LED_CAPABILITY_BI_COLOUR: 8,

        //led_state
        LED_STATE_OFF: 0,
        LED_STATE_ON: 1,
        LED_STATE_BI_COLOUR_RED: 2,
        LED_STATE_BI_COLOUR_GREEN: 4,

        //scart_video_format
        SCART_VIDEO_FORMAT_CVBS: 0,
        SCART_VIDEO_FORMAT_RGB: 1,

        //system_info_type
        PI_STB_INFO_TYPE_STRING: 0,
        PI_STB_INFO_TYPE_VALUE: 1,
        PI_STB_INFO_TYPE_DATA: 2,

        //system_standby_mode
        STB_STANDBY_OFF: 0,
        STB_STANDBY_ON: 1,
        STB_STANDBY_SUSPEND: 2,

        //system_wake_reason
        STB_WAKE_REASON_BOOTUP: 0,
        STB_WAKE_REASON_KEYPRESS: 1,
        STB_WAKE_REASON_SCHEDULED: 2,

        //3D Mode
        STEREOSCOPIC_3D_MODE_OFF: 0,
        STEREOSCOPIC_3D_MODE_ON: 1,

        //hdmi_state
        HDMI_STATE_DISCONNECTED: 0,
        HDMI_STATE_CONNECTED: 1,

        //hdcp_state
        HDCP_STATE_NOT_AUTHENTICATED: 0,
        HDCP_STATE_AUTHENTICATED: 1,

        //properties
        bootloaderVersion: 'testBootloaderVersion',
        firmwareVersion: 'testFirmwareVersion',
        frontPanelAttribute: 'frontPanelAttribute',
        hardwareVersion: 'testModel',
        hdmi3dFormat: 1,//HDMI_3D_FORMAT_FRAME_PACKING,
        hdmiAudioType: 2,//.HDMI_AUDIO_TYPE_AC3,
        hdmiVideoColor: 4,//HDMI_VIDEO_COLOR_TYPE_YCC_444,
        hdmiVideoFormat: 16, //HDMI_VIDEO_FORMAT_720P,
        ledAttribute: 1,//LED_CAPABILITY_BLINK,
        ledNumber: 1,
        manufacturer: 'OpenTVRefOS',
        muteAudio: false,
        scartNumber: 1,
        softwareVersion: 'testSoftwareVersion',
        volume: 21,

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
        },


        getHdmiVideoSettings: function () {
            if (_hdmiConnected) {
                return {videoFormat: _videoFormat, videoColorEncoding: _videoColorEncoding};
            } else {
                return {error: "error"};
            }
        },

        setHdmiVideoSettings: function (res, type) {
            if (_hdmiConnected) {
                _videoFormat = res;
                return {};
            } else {
                return {error: "error"};
            }
        },

        getHdmiVideoAspectMode: function () {
            if (_hdmiConnected) {
                return {aspectMode: _aspectMode};
            } else {
                return {error: "error"};
            }
        },

        setHdmiVideoAspectMode: function (mode) {
            if (_hdmiConnected) {
                _aspectMode = mode;
                return {};
            } else {
                return {error: "error"};
            }
        },

        getHdmiAudioDelay: function () {
            if (_hdmiConnected) {
                return {delayMs: _audioDelay};
            } else {
                return {error: "error"};
            }
        },

        setHdmiAudioDelay: function (delay) {
            if (_hdmiConnected) {
                _audioDelay = delay;
                return {};
            } else {
                return {error: "error"};
            }
        },

        getHdmiAudioType: function () {
            if (_hdmiConnected) {
                return {audioType: _audioType};
            } else {
                return {error: "error"};
            }
        },

        setHdmiAudioType: function (type) {
            if (_hdmiConnected) {
                _audioType = type;
                return {};
            } else {
                return {error: "error"};
            }
        },

        getHdmi3dFormat: function () {
            if (_hdmiConnected) {
                return {format: _3DFormat};
            } else {
                return {error: "error"};
            }
        },

        setHdmi3dFormat: function (format) {
            if (_hdmiConnected) {
                _3DFormat = format;
                return {};
            } else {
                return {error: "error"};
            }
        },


        getAnalogueVideoSettings: function () {
            if (_analogueConnected) {
                return {};
            } else {
                return {error: "error"};
            }
        },

        getAnalogueVideoAspectMode: function () {
            if (_analogueConnected) {
                return {aspectMode: _analogueAspectMode};
            } else {
                return {error: "error"};
            }
        },

        setAnalogueVideoAspectMode: function (mode) {
            if (_analogueConnected) {
                _analogueAspectMode = mode;
                return {};
            } else {
                return {error: "error"};
            }
        },

        getAnalogueVideoAspectRatio: function () {
            if (_analogueConnected) {
                return {aspectRatio: _aspectRatio};
            } else {
                return {error: "error"};
            }
        },

        setAnalogueVideoAspectRatio: function (ratio) {
            if (_analogueConnected) {
                _aspectRatio = ratio;
                return {};
            } else {
                return {error: "error"};
            }
        },

        reboot: function () {
            return true;
        },

        frontPanelControl: function (on) {

        },

        getAnalogueCCI: function () {
            return {error: "error"};
        },

        getLedState: function (ledName) {
            // 0 means off
            return 0;
        },

        getScartVideoFormat: function () {
            return this.SCART_VIDEO_FORMAT_CVBS;
        },

        getStandby: function () {
            return false;
        },

        setStandby: function (standby) {

        },

        getStringById: function (id) {
            return {error: "error"};
        },

        getValueById: function (id) {
            return {error: "error"};
        },

        setAnalogueCCI: function (cgi) {

        },

        setFrontPanelConfiguration: function (blinkPeriodMs, fadePeriodMs) {

        },

        setFrontPanelString: function (string) {

        },

        setLedSpinState: function (spinPeriodMs) {

        },

        setLedState: function (ledName, state) {

        },

        setScartVideoFormat: function (format) {

        },

        setSoftwareUpgradeData: function (upgradeData) {

        },

        setVcrScartRecord: function (record) {

        },

        blankAnalogue: function (blank) {

        },

        getLedConfig: function (ledName) {
            return {error: "error"};
        },

        setLedConfig: function (ledName, blinkPeriodMs, fadePeriodMs) {

        },

        wakeReasonGet: function () {
            return {error: "error"};
        },

        set3dMode: function () {

        }
    };

    /*
     * Changes introduced in v5.1.1
     */
    if (_ver >= CCOM.stubs.MW_VER_5_1_1) {

        // Removing objects should not happen for backward-compatibility, but...
        delete _obj.stbModeCapsGet;
        delete _obj.dualMonoControl;
        delete _obj.wakeReasonGet;
        delete _obj.setFrontPanelConfiguration;
        delete _obj.blankAnalogue;

        _obj.setFrontPanelBlinkPeriod = function (blinkPeriodMs) {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.setFrontPanelFadePeriod = function (fadePeriodMs) {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.setFrontPanelIntensityLevel = function (level) {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.applyConfigSettings = function (modules) {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.dualMonoControl = function (dual_mono_mode) {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.set3dMode = function (mode) {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.get3dMode = function () {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.getHdmiCecConnectedDevices = function () {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.sendHdmiCecCommand = function (logicAddress, command, parameters, dataLen) {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };

        _obj.stbModeCapsGet = function () {
            return {
                error: {
                    domain: "com.opentv.System",
                    name: "OperationFailed",
                    message: "error"
                }
            };
        };
    }

    /*
     * No change in v5.1.2
     */

    return _obj;
}());
