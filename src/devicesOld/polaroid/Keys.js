/**
 * 
 */

import AbstractKeys from '../all/AbstractKeys'

class PolaroidKeys extends AbstractKeys {
    constructor() {
        super();
        this.keys = {
    		RED: 118,
            GREEN:119,
            YELLOW:120,
            BLUE:1210,
 
            EXIT: null,

            BACK: 8, //"back";
            PLAY: 380, //"play";
            RWD: 412,
            FWD: 417,
            STOP: 178,
            REC: 416,
            CH_UP: 427,
            CH_DOWN: 428,
            
            INFO:0,

            UP: 38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39,
            OK: 13,

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
            KEYS:229
        };
        this.valueKeyMap = {};
        for (var keyName in this.keys) {
          let value = this.keys[keyName];
          this.valueKeyMap[value] = keyName;
        }
    }
    /*
     * Event key press
     * @override
     */
     getPressKey(keyPress) {
    	 console.log("[PolaroidKeys]:" +this.valueKeyMap[keyPress] +"=>"+keyPress +"");
       return this.valueKeyMap[keyPress] || 'UNKNOW_KEY';
     }
}

export default PolaroidKeys;
