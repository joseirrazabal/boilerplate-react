class Device {
	static getKeys() {
		const supported_devices = [
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

		var agent = navigator.userAgent.toLowerCase()

		let keys = false
		for (let i = 0; i < supported_devices.length; i++) {
			const sdevice = supported_devices[i]
			try {
				const detection = require(`../devices/${sdevice}/detection`).default
				if (detection(agent)) {
					const Class = require(`../devices/${sdevice}/Keys`).default
					const Obj = new Class()
					keys = Obj.keys
					break
				}
			} catch (e) {
				console.error('Error', e)
			}
		}

		if (!keys) {
			const DefClassDefault = require(`../devices/workstation/Keys`).default
			const objClassDefault = new DefClassDefault()
			keys = objClassDefault.keys
		}

		return keys
	}
}

export default Device
