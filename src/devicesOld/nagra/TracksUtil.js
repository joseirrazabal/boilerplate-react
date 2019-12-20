class TracksUtil {

    constructor(player) { 
        this.player = player;
        this.audioTracks = [];
        this.textTracks = [];

        this.defaultAudioTrack = null;
        this.defaultTextTrack = null;

        //console.log('/system/devices/audmgr/pcmAttenuation> ', window.CCOM.ConfigManager.getValue("/system/devices/audmgr/pcmAttenuation"));
        //console.log("/applications/shared/system.current.volume", window.CCOM.ConfigManager.getValue("/applications/shared/system.current.volume"));
        //console.log('CCOM.System.volume', window.CCOM.System.volume);
        //console.log('getBoxDefaultAudioLanguage: ', this.getBoxDefaultAudioLanguage());
        //console.log('getBoxDefaultTextLanguage: ', this.getBoxDefaultTextLanguage());
        //window.CCOM.ConfigManager.setValue("/system/devices/audmgr/pcmAttenuation", 50);
        //window.CCOM.ConfigManager.setValue("/applications/shared/system.current.volume", '50');
        //window.CCOM.System.volume = 50;
    }

    resetAudioTracks() {
        this.audioTracks = [];
    
    }
    resetTextTracks() {
        this.textTracks = [];
    }

    getAudioTracks() {
        return this.audioTracks;
    }

    getTextTracks() {
        return this.textTracks;
    }

    getBoxDefaultAudioLanguage() {
        return window.CCOM.ConfigManager.getValue("/applications/shared/audio.language");
    }   

    getBoxDefaultTextLanguage() {
        return window.CCOM.ConfigManager.getValue("/applications/shared/subtitle.language");
    }

    getAvailableTracks(info, STREAM_TYPE_VIDEO, STREAM_TYPE_AUDIO, STREAM_TYPE_SUBTITLE) {
        console.log('------------------------------> TracksUtil init getAvailableTracks');
        let i;
        let streamType;
        this.resetAudioTracks();
        this.resetTextTracks();

        if (info && info.streamsAvailableInfo && info.streamsAvailableInfo.streamInfo) {
            for (i = 0; i < info.streamsAvailableInfo.streamInfo.length; i++) {
                streamType = info.streamsAvailableInfo.streamInfo[i].type;
                console.log('------------------------------> Nagra TracksUtil streamTracks');
                switch (streamType) {
                    case STREAM_TYPE_VIDEO:
                    // Nothing for video
                    break;
                    case STREAM_TYPE_AUDIO:
                        if(!info.streamsAvailableInfo.streamInfo[i].iaudio.InvalidStreamFormat) {
                            let oneAudioTrack = info.streamsAvailableInfo.streamInfo[i];
                            oneAudioTrack.originalIndex = i;
                            this.audioTracks.push(oneAudioTrack);
                            if(info.streamsAvailableInfo.streamInfo[i].isDefault === true) {
                                this.defaultAudioTrack = info.streamsAvailableInfo.streamInfo[i].iaudio.language;        
                            }
                        }
                        break;
                    case STREAM_TYPE_SUBTITLE:
                        let oneTextTrack = info.streamsAvailableInfo.streamInfo[i];
                        oneTextTrack.originalIndex = i;
                        this.textTracks.push(oneTextTrack);
                        if(info.streamsAvailableInfo.streamInfo[i].isDefault === true) {
                            this.defaultTextTrack = info.streamsAvailableInfo.streamInfo[i].iscteSubtitle.language;        
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
    
    /*
        language is in an iso format: eng, spa
    */
    getAudioTrackIndex(language) {
        let index = null;
        
        if(this.audioTracks.length > 0) {
            let i;
            for(i = 0; i < this.audioTracks.length; i++) {
                if(this.audioTracks[i].iaudio.language === language) {
                    index = i;
                    break;
                }       
            }
        }

        return index;
    }   
    
    /*
        language is in an iso format: eng, spa
    */
    getTextTrackIndex(language) {
        let index = null;
        
        if(this.textTracks.length > 0) {
            let i;
            for(i = 0; i < this.textTracks.length; i++) {
                if(this.textTracks[i].iscteSubtitle.language === language) {
                    index = i;
                    break;
                }       
            }
        }

        return index;
    }

    // lang = 'spa'
    setAudioTrack(lang, nagraPlayer) {
        console.log('------------------------------> Nagra TracksUtil setAudioTrack: ', lang);
        let trackIndex = this.getAudioTrackIndex(lang);
        let nextAudioTrack = null;
        if(this.audioTracks[trackIndex]) {
            nextAudioTrack = this.audioTracks[trackIndex];
        }
        
        if(nextAudioTrack) {
            nagraPlayer.startStreams([{
                "specType": nagraPlayer.STREAM_SPEC_TYPE_JUST_ID,
				"id": nextAudioTrack.id
            }]);
        }
    }
    
    /*
    showSubtitles() {
        console.log('------------------------------> TracksUtil ishowSubtitles');

        //console.log('------------------------------> '  + window.userAgent);
        
        let res =  this.player.nagraPlayerInst.setStreamControl("subtitle-hide", {hide: false});
        if(res.error)
            console.log("Failed to enable stream control:" + res.error.domain + " " + res.error.name + " "+ res.error.message);
        else
            console.log("Success calling setStreamControl()");
    }
    */

}

export default TracksUtil;