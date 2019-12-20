class Samsung {
	detection(agent) {
		return agent.indexOf('maple') !== -1
	}

	get keys() {
		return {
			UP: 29460,
			DOWN: 29461,
			LEFT: 4,
			RIGHT: 5,
			OK: 29443,
			RED: 108,
			GREEN: 20,
			YELLOW: 21,
			BLUE: 22,
			BACK: 88,
			EXIT: 45,
			MOSAIC: 651,

			PLAY: 71,
			PAUSE: 74,
			RWD: 69,
			FWD: 72,
			STOP: 70,
			REC: 192,

			ZERO: 17,
			ONE: 101,
			TWO: 98,
			THREE: 6,
			FOUR: 8,
			FIVE: 9,
			SIX: 10,
			SEVEN: 12,
			EIGHT: 13,
			NINE: 14,
			CH_UP: 68,
			CH_DOWN: 65,
			// vol up y vol down no son necesarios, porque los controla
			// la smarttv, y no la app, sólo se agregan para debug
			VOL_DOWN: 11,
			VOL_UP: 7
		}
	}
}

export default new Samsung()
