class Stbhuawei {
	detection(agent) {
		return agent.indexOf('stbhuawei') !== -1
	}

	get keys() {
		return {
			UP: 38,
			DOWN: 40,
			LEFT: 37,
			RIGHT: 39,
			OK: 13,

			RED: 118,
			GREEN: 119,
			YELLOW: 120,
			BLUE: 1210,

			PLAY: 380,

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

			LIST: 131,
			MSG: 132,
			PPV: 133,
			FAV: 134,
			HD: 135,
			PREV: 136,
			SUB_AUD: 137,
			MOSAIC: 138,
			HELP: 142,

			BACK: 8,

			EXIT: 145,
			GUIDE: 458,
			INFO: 457,

			VOD: 62722,
			MENU: 93,
			CH_UP: 427,
			CH_DOWN: 428,
			VOL_DOWN: 174,
			VOL_UP: 175,
			MUTE: 173,
			RWD: 412,
			FWD: 417,
			STOP: 178,
			REC: 416,
			ON_OFF: 409,
			MUSIC: 61487
		}
	}
}

export default new Stbhuawei()
