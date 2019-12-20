import React, { PureComponent } from 'react';
import Parser from '../../utils/SubtitlesParser';
import './styles/subtitles.css';
import Metadata from '../../requests/apa/Metadata';

class VirtualSubtitles extends PureComponent {

    constructor(props) {
        super(props);
        //configs
        //this._timeToChange = 300; //MS
        //this._timerSubtitles = null;
        this._chunkSize = 2;
        this.subtitleArray = Parser.convertVttToArray(props.subtitle);
        this.handleChange = this.handleChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleScreenPosition = this.handleScreenPosition.bind(this);
    }

    handleScreenPosition(e) {
        if(this.refs.virtualSubtitlesContainer) {
            if(e.detail.isShowed) {
                if(!this.refs.virtualSubtitlesContainer.classList.contains(e.detail.className)) {
                    this.refs.virtualSubtitlesContainer.classList.add(e.detail.className);
                }
            }
            else {
                if(this.refs.virtualSubtitlesContainer.classList.contains(e.detail.className)) {
                    this.refs.virtualSubtitlesContainer.classList.remove(e.detail.className);
                }
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const shouldUpdate = this.props.subtitle !== nextProps.subtitle || this.props.className !== nextProps.className;

        if (shouldUpdate) {
            if(this.props.subtitle !== nextProps.subtitle) {
                //this.clean();
                let subtitlesData = Parser.convertVttToArray(nextProps.subtitle);

                // IMPORTANTE: Se resta tiempo en milisegundos por dispositivo para evitar el desfase de los subtitulos
                let lag_range = parseInt(Metadata.get('lag_range', '0'));

                if (lag_range 
                    && typeof subtitlesData !== 'undefined'
                    && subtitlesData.length > 0
                    && typeof subtitlesData[0].start !== 'undefined'
                    && typeof subtitlesData[0].start === 'number'
                    && subtitlesData[0].start > lag_range){
                        this.subtitleArray = subtitlesData.map(item => ({
                            start: item.start - lag_range,
                            end: item.end - lag_range,
                            part: item.part,
                            styles: item.styles,
                        }));
                    
                } else {
                    this.subtitleArray = subtitlesData;
                }

            }
        }

        return shouldUpdate;
    }

    componentDidMount() {
        this.props.setHandleChangeSubtitle(this.handleChange); //Aqui seteamos la funcion que se llamara en video component
        document.removeEventListener('handlesubtitlesscreenposition', this.handleScreenPosition);
        document.addEventListener('handlesubtitlesscreenposition', this.handleScreenPosition);
    }

    componentDidUpdate() {
        document.removeEventListener('handlesubtitlesscreenposition', this.handleScreenPosition);
        document.addEventListener('handlesubtitlesscreenposition', this.handleScreenPosition);
    }

    componentWillUnmount() {
        document.removeEventListener('handlesubtitlesscreenposition', this.handleScreenPosition);
        //this.clean();
    }

    getChunkSubtitle(currentTime) {
        let currentTimeParse = this.getCurrentTime(currentTime);
        let subtitleChunk = this.subtitleArray.filter(subtitle => (currentTimeParse >= subtitle.start  && currentTimeParse <= subtitle.end));
        return subtitleChunk;
    }

    //Just for test current time
    currentTimeToMinutesAndSeconds() {
        const millis = this.currentTime;
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    /*
    clean() {
        if (this._timerSubtitles) clearInterval(this._timerSubtitles);
    }
    */

    getSubtitle(currentTime) {
        return new Promise((resolve, reject) => {
            let defaultSubtitle = { text: '', style: {} };
            let subtitle = this.getChunkSubtitle(currentTime);
            
            if(subtitle.length > 0) {
                defaultSubtitle = Object.assign({}, defaultSubtitle, {
                    text: `${''} ${subtitle[0].part}`,
                    style: subtitle[0].styles
                });
            }
            
            resolve(defaultSubtitle);
        });
    }

    handleChange(currentTime) {
        //console.log('[PARSER] handleChange en VirtualSubtitle');
        this.getSubtitle(currentTime).then(subtitle => {
            //console.log('[VirtualSubtitles] subtitle,currentTime',subtitle,currentTime);
            if (this.container && subtitle) {
                this.container.innerHTML = subtitle.text;
                const styles = Object.keys(subtitle.style)
                    .reduce((styles, property) => {
                        return `${styles} ${property}:${subtitle.style[property]};`;
                    }, '');
                this.container.style.cssText = styles;
            }
        });
    }

    getCurrentTime(currentTime) {
        //console.log('[PARSER] en subtitle getCurrentTime: ', Math.floor(this.props.getCurrentTime() * 1000));
        return Math.floor(currentTime * 1000);
    }

    render() {
        if (!Array.isArray(this.subtitleArray) || this.subtitleArray.length == 0) {
            return null;
        }
        /* Se cambio la implementacion, ahora handleChange se manda a llamar desde el video component en setCurrentTime
        const _this = this;

        this._timerSubtitles = setInterval(() => {

             //console.log('[virtualsubs] Pasa por el interval: ', this.getCurrentTime());

            _this.handleChange();
        }, this._timeToChange);
        */
        return (
            <div ref='virtualSubtitlesContainer' className={`subtitles ${this.props.className ? this.props.className : ''}`}>
                <div className="subtitles-container" ref={div => { this.container = div }} />
            </div>
        );
    }
}

export default VirtualSubtitles;
