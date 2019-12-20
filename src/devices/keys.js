const supportedDevices = [
	'stbcoship',
	'stbkaon',
	'stbhuawei',
	'android',
	'polaroid',
	'hisense',
	'lg',
	'nagra',
	'ps4',
	'samsung',
	'sony',
	'tizen',
	'web0s',
	'opera',
	'workstationChafari',
	'arris'
]

const getKeys = () => {
	var agent = navigator.userAgent.toLowerCase()

	let keys = false
	for (let i = 0; i < supportedDevices.length; i++) {
		const sdevice = supportedDevices[i]
		try {
			const Obj = require(`../devices/${sdevice}`).default
			if (Obj.detection(agent)) {
				keys = Obj.keys
				break
			}
		} catch (e) {
			console.error('Error', e)
		}
	}

	if (!keys) {
		const DefObj = require(`../devices/workstation/index.js`).default
		keys = DefObj.keys
	}

	return keys
}

export { getKeys }
