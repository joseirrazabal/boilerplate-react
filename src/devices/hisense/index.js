class Hisense {
	detection(agent) {
		return agent.indexOf('hisense') !== -1
	}

	get keys() {
		return {
			UP: 38,
			DOWN: 40,
			LEFT: 37,
			RIGHT: 39,
			OK: 13,
			RED: 403,
			GREEN: 404,
			YELLOW: 405,
			BLUE: 406,
			BACK: 8,
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
			CH_DOWN: 428
		}
	}
}

export default new Hisense()
