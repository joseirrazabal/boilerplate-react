import axios from 'axios'
import get from 'lodash/get'

import PlayerTizen from './PlayerTizen'
import PlayerArris from './PlayerArris'

axios.interceptors.request.use(
	config => {
		return { ...config, params: { ...config.params, ...gralParams } }
	},
	error => {
		return Promise.reject(error)
	}
)

var gralParams = {}

const getTypePlayer = video => {
	const agent = navigator.userAgent.toLowerCase()

	if (agent.indexOf('android') !== -1) {
		return 'android'
	} else if (agent.indexOf('chrome') !== -1) {
		gralParams = {
			device_category: 'web',
			device_manufacturer: 'windows',
			device_model: 'html5',
			device_type: 'html5',
			stream_type: 'dashwv'
		}
		return new PlayerArris(video)
	} else if (agent.indexOf('hisense') !== -1) {
		return 'hisense'
	} else if (agent.indexOf('netcast') !== -1 && agent.indexOf('web0s') === -1) {
		return 'lg'
	} else if (agent.indexOf('opentv5') !== -1) {
		return 'nagra'
	} else if (agent.indexOf('opera') !== -1) {
		return 'opera'
	} else if (agent.indexOf('polaroid') !== -1) {
		return 'polaroid'
	} else if (agent.indexOf('playstation 4') !== -1) {
		return 'ps4'
	} else if (agent.indexOf('maple') !== -1) {
		return 'samsung'
	} else if (agent.indexOf('sony') !== -1) {
		return 'sony'
	} else if (agent.indexOf('stbcoship') !== -1) {
		return 'stbcoship'
	} else if (agent.indexOf('stbhuawei') !== -1) {
		return 'stbhuawei'
	} else if (agent.indexOf('stbkaon') !== -1) {
		return 'stbkaon'
	} else if (agent.indexOf('tizen') !== -1) {
		gralParams = {
			device_category: 'tv',
			device_manufacturer: 'samsung',
			device_model: 'tizen',
			device_type: 'tv',
			device_name: 'samsung',
			device_so: 'tizen',
			stream_type: 'smooth_streaming'
		}
		return new PlayerTizen(video)
	} else if (agent.indexOf('web0s') !== -1 || agent.indexOf('lg') !== -1) {
		return 'web0s'
	} else if (
		agent.indexOf('safari') !== -1 &&
		agent.indexOf('chrome') === -1 &&
		agent.indexOf('chromium') === -1
	) {
		return 'workstationChafari'
	}

	return 'arris'
}

const configGral = {
	abr: {
		bandwidthDowngradeTarget: 0.95,
		bandwidthUpgradeTarget: 0.85,
		defaultBandwidthEstimate: 500000,
		enabled: true,
		switchInterval: 8
	},
	streaming: {
		bufferingGoal: 10,
		retryParameters: {
			timeout: 4000,
			maxAttempts: 2,
			baseDelay: 700,
			backoffFactor: 2,
			fuzzFactor: 0.7
		}
	},
	preferredAudioLanguage: 'es-419',
	preferredTextLanguage: 'es-419'
}

const getConfig = async ({ groupId = '', deviceId }) => {
	const {
		challenge,
		privateData,
		manifest,
		serverUrl,
		certificateUrl,
		contentId,
		streamType,
		provider
	} = await getMedia({
		deviceId,
		groupId
	})

	const config = {
		...configGral,
		manifest: {
			dash: {
				clockSyncUri: manifest.replace('http', 'https')
			}
		},
		drm: {
			servers: {
				'com.widevine.alpha': serverUrl.replace('http:', 'https:'),
				'com.microsoft.playready': serverUrl.replace('http:', 'https:'),
				url_server: serverUrl.replace('http:', 'https:')
			},
			advanced: {
				// 'com.widevine.alpha': {}
				'com.widevine.alpha': {
					videoRobustness: 'SW_SECURE_CRYPTO',
					audioRobustness: 'SW_SECURE_CRYPTO'
				}
			}
		}
	}

	return {
		challenge,
		privateData,
		config,
		manifest,
		serverUrl,
		certificateUrl,
		contentId,
		streamType,
		provider
	}
}

const getMedia = async ({ groupId, deviceId }) => {
	try {
		const result = await axios.get('https://mfwktvnx1-api.clarovideo.net/services/player/getmedia', {
			params: {
				api_version: 'v5.86',
				HKS: 'zmda8lde6zheyvgn7w7io4785r',
				authpn: 'net',
				authpt: '5facd9d23d05bb83',
				device_id: deviceId,
				group_id: groupId,
				user_hash:
					'NDI3OTkzNjZ8MTU4OTM3Nzk0Mnw1MDFkMjhjODExMGEyYjJkMDQwZTIzNGEyZWMwZWJmNmIyOGFjY2E4ODgzZWFkNDc3NQ=='
			}
		})
		console.log('media', get(result, 'data.response'))

		let challenge = get(result, 'data.response.media.challenge')
		if (challenge) {
			challenge = JSON.parse(challenge)
		}

		return {
			privateData: challenge && challenge.token,
			provider: get(result, 'data.response.group.common.extendedcommon.media.proveedor.nombre'),
			streamType: get(result, 'data.response.media.streamType'),
			challenge: get(result, 'data.response.media.challenge'),
			certificateUrl: get(result, 'data.response.media.certificate_url'),
			manifest: get(result, 'data.response.media.video_url'),
			serverUrl: get(result, 'data.response.media.server_url'),
			contentId: get(result, 'data.response.media.content_id')
		}
	} catch (e) {
		console.log(`jose errors: ${e.message}`)
	}
}

export { getConfig, getMedia, getTypePlayer }
