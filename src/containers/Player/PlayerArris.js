import shaka from 'shaka-player'

class ArrisPlayer {
	constructor(parentWrapper) {
		if (!shaka.Player.isBrowserSupported()) {
			return 'Browser not supported!'
		}
		shaka.polyfill.installAll()

		this.createMedia(parentWrapper)
	}

	createMedia(parentWrapper) {
		const playerContainer = window.document.createElement('div')
		playerContainer.style.width = '100%'
		playerContainer.style.height = '100%'
		playerContainer.style.position = 'absolute'
		playerContainer.style.backgroundColor = 'transparent'

		const playerHTMLTag = window.document.createElement('video')
		playerHTMLTag.style.width = '100%'
		playerHTMLTag.style.height = '100%'
		playerHTMLTag.style.position = 'absolute'

		this.video = playerHTMLTag
		this.player = new shaka.Player(this.video)

		playerContainer.appendChild(playerHTMLTag)

		const vWrapper = document.getElementById(parentWrapper.id)
		vWrapper.insertBefore(playerContainer, vWrapper.firstChild)
	}

	setRequest = ({ player, groupId, privateData, deviceId, getMedia }) => {
		let token = privateData

		setTimeout(() => {
			token = null
		}, 3000)

		var networkingEngine = player.getNetworkingEngine()
		networkingEngine.clearAllRequestFilters()
		networkingEngine.clearAllResponseFilters()

		networkingEngine.registerRequestFilter(async (type, request) => {
			if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
				const getPrivateData = async () => {
					const { privateData } = await getMedia({ groupId })
					return privateData
				}

				request['Access-Control-Allow-Origin'] = '*'
				// request.headers['Content-Type'] = 'application/octect-stream'
				request.headers['deviceUniqueId'] = deviceId
				request.headers['privateData'] = token || (await getPrivateData())
				request.body
			}
		})
	}

	loadMedia({ privateData, config, manifest, deviceId, groupId, getMedia }) {
		this.setRequest({ player: this.player, groupId, privateData, deviceId, getMedia })
		this.player.configure(config)
		this.player
			.load(manifest)
			.then(() => {
				this.play()
				console.log('The video has now been loaded!')
			})
			.catch(this.onError)

		this.player.addEventListener('error', this.onErrorEvent)
	}

	onErrorEvent = event => {
		this.onError(event.detail)
	}

	onError = error => {
		console.error('Error code', error.code, 'object', error)
	}

	play() {
		this.video.play()
	}

	stop() {
		this.video.stop()
	}

	destroy() {
		this.video.stop()
	}
}

export default ArrisPlayer
