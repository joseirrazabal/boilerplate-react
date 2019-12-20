class Opera {
	detection(agent) {
		return agent.indexOf('opera') !== -1
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
			BLUE: 121,
			BACK: 8,
			EXIT: 145,

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

			CH_UP: 81, // q
			CH_DOWN: 87 // w
		}
	}
}

export default new Opera()
