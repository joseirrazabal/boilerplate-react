class Tizen {
	detection(agent) {
		return agent.indexOf('tizen') !== -1
	}

	get keys() {
		return {
			UP: 38,
			DOWN: 40,
			LEFT: 37,
			RIGHT: 39,
			OK: 13,

			/**
			 * Color keys
			 */
			RED: 403,
			GREEN: 404,
			YELLOW: 405,
			BLUE: 406,

			/**
			 * Content Playing keys
			 */
			PLAY: 415,
			RWD: 412,
			FWD: 417,
			STOP: 413,
			PAUSE: 19,
			PREV_SKIP: 10232,
			NEXT_SKIP: 10233,

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

			CH_UP: 427,
			CH_DOWN: 428,

			BACK: 10009,
			EXIT: 10182
		}
	}
}

export default new Tizen()
