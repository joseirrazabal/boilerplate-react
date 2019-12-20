import Utils from '../../utils/Utils';
class PlayeBaserHtml5 {
    constructor(container) {

        this._playerTag = null;
        this._playerContainer = null;

        this.onBindedError = null;
        this.onBindedCanplay = null;
        this.onBindedLoadedmetadata = null;
        this.onBindedTimeupdate = null;
        this.onBindedPause = null;
        this.onBindedPlaying = null;
        this.onBindedVolumechange = null;
        this.onBindedLoadstart = null;
        this.onBindedLoadeddata = null;
        this.onBindedEnded = null;
        this.onBindedEmptied = null;
        this.onBindedStalled = null;
        this.onBindedWaiting = null;
        this.onBindedProgress = null;
        this.onBindedDurationchange = null;
        this.onBindedCanplaythrough = null;

        this.middlewarePlayer = null;


        this.externalListeners={};

    }

    init() {

    }

    configure(config = null) {

        // Se configura el contendor para el tag de video.
        if (config.video&&config.video.container && Utils.isHtmlElement(config.video.container)) {
            this._playerContainer = config.video.container;
        }
        else {
            this._playerContainer = document.getElementsByTagName("body")[0];
        }

        this._playerTag = document.createElement("video");

        this.bindEvents();
        this.setListenners();

        this._playerContainer.appendChild(this._playerTag);

    }

    bindEvents() {

        this.onBindedError = this.onError.bind(this)
        this.onBindedCanplay = this.onCanplay.bind(this)
        this.onBindedLoadedmetadata = this.onLoadedmetadata.bind(this)
        this.onBindedTimeupdate = this.onTimeupdate.bind(this)
        this.onBindedPause = this.onPause.bind(this)
        this.onBindedPlaying = this.onPlaying.bind(this)
        this.onBindedVolumechange = this.onVolumechange.bind(this)
        this.onBindedLoadstart = this.onLoadstart.bind(this)
        this.onBindedLoadeddata = this.onLoadeddata.bind(this)
        this.onBindedEnded = this.onEnded.bind(this)
        this.onBindedEmptied = this.onEmptied.bind(this)
        this.onBindedStalled = this.onStalled.bind(this)
        this.onBindedWaiting = this.onWaiting.bind(this)
        this.onBindedProgress = this.onProgress.bind(this)
        this.onBindedDurationchange = this.onDurationchange.bind(this)
        this.onBindedCanplaythrough = this.onCanplaythrough.bind(this)

    }

    onError(evt = null) {

        if( this.externalListeners.onBindedError)
        {
            this.externalListeners.onBindedError(evt);
        }

        //console.log('AMCO player' + 'onError', evt);
    }

    onCanplay(evt = null) {
        if( this.externalListeners.onBindedCanplay)
        {
            this.externalListeners.onBindedCanplay(evt);
        }
        //console.log('AMCO player' + 'onCanplay', evt);
    }

    onLoadedmetadata(evt = null) {
        if( this.externalListeners.onBindedLoadedmetadata)
        {
            this.externalListeners.onBindedLoadedmetadata(evt);
        }

        //console.log('AMCO player' + 'onLoadedmetadata', evt);
    }

    onTimeupdate(evt = null) {
        if( this.externalListeners.onBindedTimeupdate)
        {
            this.externalListeners.onBindedTimeupdate(evt);
        }

        //console.log('AMCO player' + 'onTimeupdate', evt);
    }

    onPause(evt = null) {

        if( this.externalListeners.onBindedPause)
        {
            this.externalListeners.onBindedPause(evt);
        }

        //console.log('AMCO player' + 'onPause', evt);
    }

    onPlaying(evt = null) {
        if( this.externalListeners.onBindedPlaying)
        {
            this.externalListeners.onBindedPlaying(evt);
        }

        //console.log('AMCO player' + 'onPlaying', evt);
    }

    onVolumechange(evt = null) {
        if( this.externalListeners.onBindedVolumechange)
        {
            this.externalListeners.onBindedVolumechange(evt);
        }

        //console.log('AMCO player' + 'onVolumechange', evt);
    }

    onLoadstart(evt = null) {
        if( this.externalListeners.onBindedLoadstart)
        {
            this.externalListeners.onBindedLoadstart(evt);
        }

        //console.log('AMCO player' + 'onLoadstart', evt);
    }

    onLoadeddata(evt = null) {

        if( this.externalListeners.onBindedLoadeddata)
        {
            this.externalListeners.onBindedLoadeddata(evt);
        }

        //console.log('AMCO player' + 'onLoadeddata', evt);
    }

    onEnded(evt = null) {

        if( this.externalListeners.onBindedEnded)
        {
            this.externalListeners.onBindedEnded(evt);
        }

        //console.log('AMCO player' + 'onEnded', evt);
    }

    onEmptied(evt = null) {
        if( this.externalListeners.onBindedEmptied)
        {
            this.externalListeners.onBindedEmptied(evt);
        }

        //console.log('AMCO player' + 'onEmptied', evt);
    }

    onStalled(evt = null) {
        if( this.externalListeners.onBindedStalled)
        {
            this.externalListeners.onBindedStalled(evt);
        }

        //console.log('AMCO player' + 'onStalled', evt);
    }

    onWaiting(evt = null) {
        if( this.externalListeners.onBindedWaiting)
        {
            this.externalListeners.onBindedWaiting(evt);
        }

        //console.log('AMCO player' + 'onWaiting', evt);
    }

    onProgress(evt = null) {

        if( this.externalListeners.onBindedProgress)
        {
            this.externalListeners.onBindedProgress(evt);
        }

        //console.log('AMCO player' + 'onProgress', evt);
    }

    onDurationchange(evt = null){
        if( this.externalListeners.onBindedDurationchange)
        {
            this.externalListeners.onBindedDurationchange(evt);
        }

        //console.log('AMCO player' + 'onDurationchange', evt);
    }

    onCanplaythrough(evt = null) {
        if( this.externalListeners.onBindedCanplaythrough)
        {
            this.externalListeners.onBindedCanplaythrough(evt);
        }

        //console.log('AMCO player' + 'onCanplaythrough', evt);
    }

    setExternalListener(externalListeners)
    {
        this.externalListeners=externalListeners;
    }

    setListenners() {
        this._playerTag.addEventListener("error",
            this.onBindedError
            , true);

        this._playerTag.addEventListener("canplay",
            this.onBindedCanplay
            , false);

        this._playerTag.addEventListener("loadedmetadata",
            this.onBindedLoadedmetadata
            , false);


        this._playerTag.addEventListener("timeupdate",
            this.onBindedTimeupdate
            , false);

        this._playerTag.addEventListener("pause",
            this.onBindedPause
            , false);

        this._playerTag.addEventListener("playing",
            this.onBindedPlaying
            , false);

        this._playerTag.addEventListener("volumechange",
            this.onBindedVolumechange
            , false);

        this._playerTag.addEventListener("loadstart",
            this.onBindedLoadstart
            , false);
        this._playerTag.addEventListener("loadeddata",
            this.onBindedLoadeddata
            , false);

        this._playerTag.addEventListener("ended",
            this.onBindedEnded
            , false);

        this._playerTag.addEventListener("emptied",
            this.onBindedEmptied
            , false);

        this._playerTag.addEventListener("stalled",
            this.onBindedStalled
            , false);
        this._playerTag.addEventListener("waiting",
            this.onBindedWaiting
            , false);
        this._playerTag.addEventListener("progress",
            this.onBindedProgress
            , false);
        this._playerTag.addEventListener("durationchange",
            this.onBindedDurationchange
            , false);
        this._playerTag.addEventListener("canplaythrough",
            this.onBindedCanplaythrough
            , false);
    }

    unSetlisteners() {


        this._playerTag.removeEventListener("error",
            this.onBindedError
            , true);

        this._playerTag.removeEventListener("canplay",
            this.onBindedCanplay
            , false);

        this._playerTag.removeEventListener("loadedmetadata",
            this.onBindedLoadedmetadata
            , false);


        this._playerTag.removeEventListener("timeupdate",
            this.onBindedTimeupdate
            , false);

        this._playerTag.removeEventListener("pause",
            this.onBindedPause
            , false);

        this._playerTag.removeEventListener("playing",
            this.onBindedPlaying
            , false);

        this._playerTag.removeEventListener("volumechange",
            this.onBindedVolumechange
            , false);

        this._playerTag.removeEventListener("loadstart",
            this.onBindedLoadstart
            , false);
        this._playerTag.removeEventListener("loadeddata",
            this.onBindedLoadeddata
            , false);

        this._playerTag.removeEventListener("ended",
            this.onBindedEnded
            , false);

        this._playerTag.removeEventListener("emptied",
            this.onBindedEmptied
            , false);

        this._playerTag.removeEventListener("stalled",
            this.onBindedStalled
            , false);
        this._playerTag.removeEventListener("waiting",
            this.onBindedWaiting
            , false);
        this._playerTag.removeEventListener("progress",
            this.onBindedProgress
            , false);
        this._playerTag.removeEventListener("durationchange",
            this.onBindedDurationchange
            , false);
        this._playerTag.removeEventListener("canplaythrough",
            this.onBindedCanplaythrough
            , false);

    }
    pause(){
        this._playerTag.pause();
    }

    play(){

        this._playerTag.play();
    }
    stop(){

    }

    resume() {
        this._playerTag.play();
    }

    skip(seconds){
        if(seconds && Utils.isInteger(seconds) ) {
            this._playerTag.currentTime += seconds;

        }
    }


    seek(seconds) {

        if(seconds && Utils.isInteger(seconds) ) {
            this._playerTag.currentTime = seconds;
        }
    }


    getcurrentTime() {
        return this._playerTag.currentTime;
    }

    getDuration(){
        return this._playerTag.duration;
    }

    show () {
        if(this._playerTag && this._playerTag.style )
            this._playerTag.style.visibility = "visible";
    }

    hide () {
        if(this._playerTag && this._playerTag.style )
            this._playerTag.style.visibility = "hidden";
    }

    load(source){
        this._playerTag.setAttribute("src", source);
        this._playerTag.load();
    }
    resize(newsize={type:'percent',width:'100',height:'100',top:0,left:0, class:'',position:'static'})
    {
        switch (newsize.type)
        {
            case 'class':

                this._playerTag.className=newsize.class;
                break;

            case 'absolute':
                if(this._playerTag&&this._playerTag.style) {
                    this._playerTag.style.width = newsize.width + "px";
                    this._playerTag.style.height = newsize.height + "px";
                    this._playerTag.style.left = newsize.left + "px";
                    this._playerTag.style.top = newsize.top + "px";
                    this._playerTag.style.position=newsize.position?newsize.position:'initial';
                }
                break;

            case 'percent':
                if(this._playerTag&&this._playerTag.style) {
                    this._playerTag.style.width = newsize.width;
                    this._playerTag.style.height = newsize.height;
                }
                break;
           default:
                break;
        }
    }
}
export default PlayeBaserHtml5;
