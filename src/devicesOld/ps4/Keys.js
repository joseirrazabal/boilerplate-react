import AbstractKeys from '../all/AbstractKeys'

class Ps4Keys extends AbstractKeys {
    constructor() {
        super();
        this.keys = {
            OK:13,
            UP:38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39,

            /*
            RED:403,
            GREEN:404,
            YELLOW:405,
            BLUE:406,
            */

            // R1 como YELLOW?
            //R1: 117,
            YELLOW: 117,

            // R2 como RED?
            //R2: 119,
            RED: 119,

            // L1 como GREEN?
            //L1: 116,
            GREEN: 116,
        
            // L2 como BLUE?
            //L2: 118,
            BLUE: 118,
        
            R3: 121,
            L3: 120,
            
            TRIANGLE: 112,
            SQUARE: 32,


            // CIRCLE es back
            BACK: 8, 

            START: 114,
            SELECT: 115,

            PLAY: 128, 
            PAUSE: 130,
            STOP: 129, 
            
            //Scan rewind (BD Remote only)
            RW: 127,
            //Slow rewind (BD Remote only)
            RW: 125,
            
            // Scan forward (BD Remote only) 
            FF: 126,
            //Slow forward (BD Remote only)
            FF: 124,

            PREV: 112,
            NEXT: 123
        }
    }
}

export default Ps4Keys;
