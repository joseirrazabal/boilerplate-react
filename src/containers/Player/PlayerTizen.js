import { SS, SS_MA } from './constants'

class TizenPlayer {
	constructor(parentWrapper) {
		this.loadTizenLibs()

		this.webapis = window.webapis || null

		if (!this.webapis) {
			throw new Error('Tizen webapis is nos available...')
		}

		this.createMedia(parentWrapper)
	}

	loadTizenLibs = () => {
		this.loadScript('$WEBAPIS/webapis/webapis.js')
			.then(() => {
				this.tizenSetup()
			})
			.catch(e => {
				console.log(e)
			})
	}

	loadScript(url) {
		return new Promise((resolve, reject) => {
			const pageScripts = document.getElementsByTagName('script')[0]
			const newScript = document.createElement('script')

			newScript.type = 'text/javascript'
			newScript.src = url

			newScript.onload = () => {
				resolve()
			}
			newScript.onerror = newScript.onabort = reject
			pageScripts.parentNode.insertBefore(newScript, pageScripts)
		})
	}

	tizenSetup() {
		// http://developer.samsung.com/tv/develop/guides/user-interaction/remote-control
		const tvkeys = [
			'ColorF0Red',
			'ColorF1Green',
			'ColorF2Yellow',
			'ColorF3Blue',
			'0',
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'ChannelUp',
			'ChannelDown',
			'MediaPlayPause',
			'MediaRewind',
			'MediaFastForward',
			'MediaPlay',
			'MediaPause',
			'MediaStop',
			'MediaRecord',
			'MediaTrackPrevious',
			'MediaTrackNext',
			'PreviousChannel'
		]

		for (let i = 0; i < tvkeys.length; i++) {
			try {
				window.tizen.tvinputdevice.registerKey(tvkeys[i])
			} catch (error) {
				console.log('failed to register ' + tvkeys[i] + ': ' + error)
			}
		}
	}

	createMedia(parentWrapper) {
		this._playerContainer = document.createElement('div')
		this._playerContainer.style.width = '100%'
		this._playerContainer.style.height = '100%'
		this._playerContainer.style.position = 'absolute'
		this._playerContainer.style.backgroundColor = 'transparent'

		this._playerContainer.innerHTML =
			"<OBJECT id='av_player_full' type='application/avplayer' ></OBJECT>"

		const vWrapper = document.getElementById(parentWrapper.id)
		vWrapper.insertBefore(this._playerContainer, vWrapper.firstChild)
	}

	loadMedia({
		streamType = 'smooth_streaming',
		privateData,
		challenge = {},
		config,
		manifest,
		contentId,
		certificateUrl,
		serverUrl = null,
		deviceId,
		provider
	}) {
		this.addEventsListeners()

		if (manifest) {
			if (streamType === SS || streamType === SS_MA) {
				let drmParams = null
				let finalServerUrl = serverUrl

				if (this.options && this.options.provider !== 'AMCO') {
					finalServerUrl = `https://proxy.claro03.uat.verspective.net/amco-uat/playready?privatedata=${privateData}&deviceuniqueid=${deviceId}`
				}

				if (true) {
					// si es now
					var parserServerUrl = document.createElement('a')
					var qs = `privatedata=${privateData}&deviceuniqueid=${deviceId}`
					finalServerUrl = finalServerUrl + (parserServerUrl.search ? '&' : '?') + qs
				} else {
					// ver en shura-player
					drmParams = {
						CustomData: btoa('{"customdata":' + challenge + ',"device_id": "' + deviceId + '"}'),
						LicenseServer: finalServerUrl
					}
				}

				try {
					this.webapis.avplay.open(finalServerUrl)
					this.webapis.avplay.open(
						'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest'
					)
				} catch (e) {
					this._onError('Error open URL to play: ' + JSON.stringify(e))
				}

				if (drmParams) {
					try {
						this.webapis.avplay.setDrm('PLAYREADY', 'SetProperties', JSON.stringify(drmParams))
					} catch (e) {
						configGral
						this._onError('Error setDrm: ' + JSON.stringify(e))
					}
				}
			}

			this.play()
		} else {
			this.destroy()
		}
	}

	setPlayerFull() {
		this.setPlayerSize(0, 0, 1920, 1080)
		// this.setPlayerSize(0, 0, 1280, 720)
	}

	setPlayerSize(top, left, width, height) {
		this.webapis.avplay.setDisplayRect(left, top, width, height)
		this.webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN')
	}

	play() {
		this.setPlayerFull()
		this.addEventsListeners()

		this.webapis.avplay.prepareAsync(
			() => {
				try {
					this.webapis.avplay.play()
				} catch (e) {
					this._onError('Error on play: ' + JSON.stringify(e))
				}
			},
			e => {
				this._onError(JSON.stringify(e))
			}
		)
	}

	stop() {
		this.webapis.avplay.stop()
	}

	destroy() {
		this.stop()
		this.webapis.avplay.close()
	}

	getCurrentTime() {
		return Math.floor(this.currentTime / 1000)
	}

	addEventsListeners() {
		const listeners = {
			onbufferingstart: () => {
				this._onBufferingStart()
			},
			onbufferingprogress: percent => {
				this._onBufferingProgress(percent)
			},
			onbufferingcomplete: () => {
				this._onBufferingComplete()
			},
			oncurrentplaytime: currentTime => {
				this._onTimeUpdate(currentTime)
			},
			onevent: (eventType, eventData) => {
				console.log('[TIZEN PLAYER] onevent: ' + eventType + ', data: ' + eventData)
			},
			onerror: eventId => {
				let errMsg = 'Unknown error'
				if (eventId && eventId.name) {
					if (eventId.name === 'PLAYER_ERROR_NONE') {
						return
					}
					switch (eventId.name) {
						case 'PLAYER_ERROR_INVALID_PARAMETER':
							errMsg = 'Unable to find parameters'
							break
						case 'PLAYER_ERROR_NO_SUCH_FILE':
							errMsg = 'Unable to find the specified media content'
							break
						case 'PLAYER_ERROR_INVALID_OPERATION':
							errMsg = 'Failed to create the player'
							break
						case 'PLAYER_ERROR_SEEK_FAILED':
							errMsg =
								'Failed to perform seek operation, or seek operation called during an invalid state'
							break
						case 'PLAYER_ERROR_INVALID_STATE':
							errMsg = 'AVPlay API method was called during an invalid state'
							break
						case 'PLAYER_ERROR_NOT_SUPPORTED_FILE':
							errMsg = 'Multimedia file format not supported'
							break
						case 'PLAYER_ERROR_INVALID_URI':
							errMsg = 'Input URI is in an invalid format'
							break
						case 'PLAYER_ERROR_CONNECTION_FAILED':
							errMsg = 'Failed multiple attempts to connect to the specified content server'
							break
						case 'PLAYER_ERROR_GENEREIC':
							errMsg = 'Failed to create the display window'
							break
						default:
							errMsg = 'Unknown error'
					}
				}
				this._onError(errMsg)
			},
			onsubtitlechange: (duration, text, data3, data4) => {
				console.log('Subtitle Changed.')
			},
			ondrmevent: (drmEvent, drmData) => {
				console.log('DRM callback: ' + drmEvent + ', data: ' + drmData)
			},
			onstreamcompleted: () => {
				this.stop()
				this._onFinished()
			},
			ondrmcallback: e => {
				this._onDRMError(e)
			}
		}

		this.webapis.avplay.setListener(listeners)
	}

	_onDRMError(e) {
		console.log('[TIZEN PLAYER] DRM ERROR ' + e)
	}

	_onLoad() {
		if (this.options.events.onLoad) {
			this.options.events.onLoad()
		}
	}

	_onBufferingStart() {
		this.onPlayerStateBuffer()
		if (this.options.events.onBufferingStart) {
			this.options.events.onBufferingStart()
		}
	}

	_onBufferingComplete() {
		if (this.options.events.onBufferingFinish) {
			this.options.events.onBufferingFinish()
		}
	}

	_onBufferingProgress(percent) {
		if (this.options.events.onBufferingProgress) {
			this.options.events.onBufferingProgress(percent)
		}
	}

	_onWaiting() {
		if (this.options.events.onWaiting) {
			this.options.events.onWaiting()
		}
	}

	_onTimeUpdate(currentTime) {
		this.currentTime = currentTime
		if (this.options.events.onTimeUpdate) {
			this.options.events.onTimeUpdate(this.getCurrentTime())
		}
	}

	_onPlaying() {
		if (this.options.events.onPlaying) {
			this.options.events.onPlaying()
		}
	}

	_onError(errorCode, errorMessage) {
		console.log(errorMessage)
		this.stop()
		this.webapis.avplay.close()

		if (this.options.events.onError) {
			this.options.events.onError(errorMessage, errorCode)
		}
	}

	_onFinished() {
		this.destroy()
		// We dont need to send the stop state to the player here, it was sending in stop method that executes before this onfinish
		if (this.options.events.onFinished) {
			this.options.events.onFinished()
		}
	}

	_onCanPlay() {
		if (this.options.events.onCanPlay) {
			this.options.events.onCanPlay()
		}
	}

	_onDurationChange() {
		if (this.options.events.onDurationChange) {
			this.options.events.onDurationChange()
		}
	}
}

export default TizenPlayer
