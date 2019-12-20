import AbstractKeys from '../all/AbstractKeys'

class AndroidKeys extends AbstractKeys {
    constructor() {
        super();
        this.keys = {
            UP: 38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39,
            OK: 13,
            RED:118,
            GREEN:119,
            YELLOW:120,
            BLUE:1210,
            BACK:8,
            EXIT:145,

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
        };
        this.valueKeyMap = {};
        for (let keyName in this.keys) {
          let value = this.keys[keyName];
          this.valueKeyMap[value] = keyName;
        }
    }

    /*
    * Event key press
    * @override
    */
    getPressKey(keyPress) {
      return this.valueKeyMap[keyPress] || 'UNKNOW_KEY';
    }
}

export default AndroidKeys;
