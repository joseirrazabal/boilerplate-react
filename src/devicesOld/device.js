import DeviceDetection from '../utils/DeviceDetection'

class Device {
	static getDevice() {
		if (Device.device) {
			return Device.device
		}
		let y = new DeviceDetection().detect()

		// Después del detect, lanzar el device setup si aplica
		// let defClass = require(`./${y.platform}/DeviceSetup`).default;
		// let objClass = new (defClass)(); // goose -- se agregan parentesis por warning

		// objClass.setup();

		// Device.device = y;

		return Device.device
	}
}

export default Device
