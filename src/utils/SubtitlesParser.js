
const regexWebvttClassTagOpen = /<\/?c\.[a-z]+>/; // matches <c.color> tag
const regexWebvttClassTagClose = /<\/c>/; // matches </c> tag

class SubtitlesParser {

    //[line:78%, position:50%, align:middle... etc] to css styles
    static parseStyleConfig(style, defaultStyle) {
        let key = style.split(":")[0];
        let value = style.split(":")[1].trim();
        let newStyles = {};

        switch (key) {
            // For crackle :/
            // Example: 00:08:15.210 --> 00:08:17.120 A:end T:10% L:75%
            case "T":
            newStyles.top = defaultStyle.top;
            newStyles.bottom = defaultStyle.bottom;
            newStyles.line = defaultStyle.line;
            break;
            case "L":
            newStyles.left = defaultStyle.left;
            break;
            case "A":
            newStyles.textAlign = defaultStyle.textAlign;
            break;

            case "line":          
                let offset = 0;
                const line = parseInt(value);

                if (value.indexOf('%') != -1) {
                    offset = (line > parseInt(defaultStyle.line)) ? defaultStyle.line : value;
                } else {
                    offset = (line * 100) / 16;
                    offset = `${offset}%`;
                }

                if (line > 0) {
                    newStyles.top = offset;
                    newStyles.bottom = defaultStyle.bottom;
                } else {
                    newStyles.bottom = offset;
                    newStyles.top = 'initial';
                }

                newStyles.line = "" + value;
                break;
            case "align":
                if (value === "middle") value = 'center';
                newStyles.textAlign = value;
                break;

            case "position":
                let pos = 0;                  
                if (value.indexOf('%') != -1) {
                    pos = parseInt(value);
                    if (pos == 50)
                        pos = 0;
                    else if (pos > 50)
                        pos = 100 - pos;
                    else
                        pos = (50 - pos) * -1;
                }
                else
                    pos = value;

                newStyles.left = pos;
                break;

            case "size":
                newStyles.width = value;
                break;

            default:
                // Nothing to do
                break;
        }

        return newStyles;
    }
    
    static parseStyles(vttStyles) {
        const defaultStyle = {
            top: '80%',
            bottom: 'initial',
            line: '80%',
            left: '0',
            textAlign: 'center'
        };
        let newStyles = Object.assign({}, defaultStyle);
        
        if(vttStyles.length > 0) {
            vttStyles.forEach(style => {
                let newStyleConfig = this.parseStyleConfig(style, defaultStyle);
                newStyles = Object.assign({}, newStyles, {
                    ...newStyleConfig,
                });
            });
        }

        return newStyles;
    }

    //00:02:03.100 to milliseconds
    static timeString2ms(timeString) {
        const arrTime = timeString.split('.');
        const ms = arrTime[1] * 1 || 0;
        const hms = arrTime[0].split(':'); //array hh mm ss

        let calculatedMs = 0;
        if (hms[2]) {
            calculatedMs = hms[0] * 3600 + hms[1] * 60 + hms[2] * 1;
        } else if (hms[1]) {
            calculatedMs = hms[0] * 60 + hms[1] * 1;
        } else {
            calculatedMs = hms[0] * 1;
        }

        return ms + calculatedMs * 1e3;
    }

    /**
    * Checks if a string has <c.color> and </c> tags
    *
    * @param {string} string the string to check
    */
    static hasWebVttClassObject(string) {
        return regexWebvttClassTagOpen.test(string) && regexWebvttClassTagClose.test(string);
    }

    /**
        * Replaces <c.color> and </c> with <span class="color"> and </span> tags
        *
        * @param {string} string the string to parse
        * @return {string} the parsed string
    */
    static parseWebVttClassObject(string) {
        // replaces WebVtt class object (<c.color></c>) (color is variable)
        // https://w3c.github.io/webvtt/#webvtt-class-object

        const openningTag = string.match(regexWebvttClassTagOpen)[0];
        let color = openningTag.split(".")[1]; // color>
        color = color.substring(0, color.length - 1); // remove the >

        let parsed = string
            .replace(regexWebvttClassTagOpen, '<span class="' + color + '">')
            .replace(regexWebvttClassTagClose, '</span>');

        return parsed;
    }

    static isHBOEndVTTFile(line) {
        return line.indexOf('*END') > -1;
    }

    static convertVttToArray(vttString) {
        if (typeof vttString !== 'string') return [];

        // Se definen variables
        let start = false;
        let current = {};
        let sections = [];
        let styles = [];
        let isBlankLine = false;
        let isEndVTT = false;

        const vttArray = vttString.split('\n');
        const _this = this;
    
        vttArray.forEach(function (line, index) {
            if (line.trim().length === 0) {
                // For End VTT on Crackle Subtitles
                if(isBlankLine && (vttArray.length -1) === index && current){
                    if(current.start && !isEndVTT){
                        sections = [...sections, current];
                    }
                }
                isBlankLine = true;
            } 

            if (index === 2 && /position|line/.test(line)) { //ignorar la primera linea porque viene mal
                // ...
            } else if(_this.isHBOEndVTTFile(line)) {
                // For End VTT on HBO Subtitles
                if(current && current.start)
                    isEndVTT = true;
                    sections = [...sections, current];
            } else if (line.replace(/<\/?[^>]+(>|$)/g, "") === " ") {
                // ...
            } else if (line.replace(/<\/?[^>]+(>|$)/g, "") == "") {
                // ...
            } else if (line.replace(/<\/?[^>]+(>|$)/g, "") === "") {
                // ...
            } else if (line.replace(/<\/?[^>]+(>|$)/g, "") === " ") {
                // ...
            } else if (!isNaN(line)) {
                // ...
            } else if (line.indexOf('-->') !== -1) {
                start = true;

                if (current.start) {
                    sections = [...sections, current];
                    isBlankLine = false;
                }

                const times = line.split(" --> "); // ["00:00:00.000 ", " 00:0000:334 align:start position:10% line:-11"]
                const startTime = times.shift(); // "00:00:00.000"
                const endTimeWithStylesMaybe = times.shift().split(" "); // ["00:00:00.334", "align:start", "position:10%", line:-11]" or maybe ["00:00:00.334"]
                const endTime = endTimeWithStylesMaybe.shift(); // "00:00:00.334"
                styles = endTimeWithStylesMaybe.slice(0); // ["align:start", "position:10%", "line:-11"] (may be empty or less/more elements)

                try {
                    current = {
                        // start: timeString2ms(line.split(" --> ")[0]),
                        // end: timeString2ms(line.split(" --> ")[1]),
                        // part: ''
                        start: _this.timeString2ms(startTime),
                        end: _this.timeString2ms(endTime),
                        part: '',
                        styles: _this.parseStyles(styles)
                    };
                } catch (e) {
                    console.error('[MULTIAUDIO]: line ' + line);
                    console.error(e);
                }

            } else {
                if (start) {
                    if (_this.hasWebVttClassObject(line)) { // si contiene los tags <c.color> y </c>...
                        // reemplaza <c.color> y </c> por <span class="color"> y </span> (color is variable)
                        line = _this.parseWebVttClassObject(line);
                    }
                    if (current.part.length === 0) {
                        current = Object.assign({}, current, {
                            part: line
                        });
                    } else {
                        current = Object.assign({}, current, {
                            part: `${current.part}<br/>${line}`,
                        });
                    }
                    // If it's the last line of the subtitles
                    if (index === vttArray.length - 1) {
                        sections = [...sections, current];
                        isBlankLine = false;
                    }
                }
            }
        });

        return sections;
    }

}

export default SubtitlesParser;
