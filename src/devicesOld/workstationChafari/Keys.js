import AbstractKeys from '../all/AbstractKeys'

class WorkstationKeys extends AbstractKeys {
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
        };
    }
}

/**
 *
 backspace 	    8
 tab 	          9
 enter 	        13
 shift 	        16
 ctrl 	        17
 alt 	          18
 pause/break 	  19
 caps lock 	    20
 escape 	      27
 page up 	      33
 page down 	    34
 end 	          35
 home 	        36
 left arrow 	  37
 up arrow 	    38
 right arrow 	  39
 down arrow 	  40
 insert 	      45
 delete 	      46
 subtitles      137

 a 	            65
 b 	            66
 c 	            67
 d 	            68
 e 	            69
 f 	            70
 g 	            71
 h 	            72
 i 	            73
 j 	            74
 k 	            75
 l 	            76
 m 	            77
 n 	            78
 o 	            79
 p 	            80
 q 	            81
 r 	            82
 s 	            83
 t 	            84
 u 	            85
 v 	            86
 w 	            87
 x 	            88
 y 	            89
 z 	            90

 f1 	         112
 f2 	         113
 f3 	         114
 f4 	         115
 f5 	         116
 f6 	         117
 f7 	         118
 f8 	         119
 f9 	         120
 f10 	         121
 f11 	         122
 f12 	         123

 comma 	       188
 dash 	       189
 period 	     190
 single quote  222
 *
 */

export default WorkstationKeys;
