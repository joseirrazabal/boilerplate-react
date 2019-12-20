import AbstractKeys from '../all/AbstractKeys'

class SonyKeys extends AbstractKeys {
    constructor() {
        super();
        this.keys = {
            UP: 38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39,
            OK: 13,
            RED:403,
            GREEN:404,
            YELLOW:405,
            BLUE:406,
            BACK:461,
            EXIT: null,

            ZERO: 48,
            ONE: 49,
            TWO: 50,
            THREE: 51,
            FOUR: 52,
            FIVE: 53,
            SIX: 54,
            SEVEN: 55,
            EIGHT: 56,
            NINE: 57,

            PLAY: 41,
            RWD: 412,
            FWD: 417,
            STOP: 413,
            PAUSE: 19,

            CH_UP: 427,
            CH_DOWN: 428,
        };
        if(navigator.userAgent.indexOf('Presto') !== -1 || navigator.userAgent.indexOf('Linux armv7l')  !== -1 )
          this.keys.BACK=8;
    }
}

export default SonyKeys;
