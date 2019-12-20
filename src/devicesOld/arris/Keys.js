import AbstractKeys from '../all/AbstractKeys'

class ArrisKeys extends AbstractKeys {
    constructor() {
        super();
        this.keys = {
            UP: 38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39,
            OK: 13,
            RED: 118, // F7
            GREEN: 119, // F8
            YELLOW: 120, // F9
            BLUE: 121, // F10
            BACK: 8,
            EXIT: 27, // escape

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

            CH_UP: 81, //q
            CH_DOWN: 87, //w

            MUSIC: 90, //z
            VOD: 88, //x

            PLAY: 80, // p
            RWD: 82, // r
            FWD: 65, // a
            STOP: 83, // s
            REC: 71, // g

            PPV: 86, // v
            MOSAIC: 77, // m
            GUIDE: 78, // n

            MENU: 72, // h
            FAV: 70, // f
            PREV: 69, // e
            INFO: 73, //i

            LIST: 76, //l
            HELP: 226, //\
            HD: 72, //h
        };
    }
}

export default ArrisKeys;
