class Lg {
	detection(agent) {
		return agent.indexOf('netcast') !== -1 && agent.indexOf('web0s') === -1
	}

	get keys() {
		return {
			RED: 403, // "red";
			GREEN: 404, // "green";
			YELLOW: 405, // "yellow";
			BLUE: 406, // "blue";
			EXIT: null,

			BACK: 461, // "back";
			PLAY: 415, // "play";
			PUSE: 19, // "pause";
			STOP: 413, // "stop";
			FF: 417, // "ff";
			RW: 412, // "rw";

			OK: 13,
			UP: 38,
			DOWN: 40,
			LEFT: 37,
			RIGHT: 39,

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

			CH_UP: 33,
			CH_DOWN: 34
		}
	}
}

export default new Lg()
