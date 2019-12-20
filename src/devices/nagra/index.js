class Nagra {
	detection(agent) {
		return agent.indexOf('opentv5') !== -1
	}

	get keys() {
		return {
			/**
			 * Number keys
			 */
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

			BACK: 166, // Previous channel
			TV_AV: null,
			GUIDE: 458, // channel Guide
			INFO: 457,
			HELP: 47,
			SUB_AUD: 61495, // Subtitles/Audio options

			/**
			 * Navigation
			 */
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,
			OK: 13,
			PREV: 601,
			EXIT: null,

			FAV: 171,
			PPV: 62720,
			VOD: 62722,
			HD: 62723,
			MENU: 93,
			LIST: 61501,

			CH_UP: 427,
			CH_DOWN: 428,
			VOL_DOWN: 174,
			VOL_UP: 175,
			MUTE: 173,

			/**
			 * Color keys
			 */
			YELLOW: 405,
			BLUE: 406,
			RED: 403,
			GREEN: 404,

			/**
			 * Content Playing keys
			 */
			PLAY: 179,
			RWD: 412,
			FWD: 417,
			STOP: 178,

			REC: 416, // Record key
			MOSAIC: 62724,
			ON_OFF: 409,

			MUSIC: 61487
			// CV:8989,
			// fake
		}
	}
}

export default new Nagra()
