import React from 'react'
import shaka from 'shaka-player'
import axios from 'axios'
import get from 'lodash/get'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

const deviceId = 'a98a5964-3b14-b978-f2ad-6988ff11a163'

const config = {
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

const Home = () => {
	const [channels, setChannels] = React.useState([])

	React.useEffect(() => {
		const getData = async () => {
			const channels = await getChannels()
			setChannels(channels)

			if (shaka.Player.isBrowserSupported()) {
				initPlayer({ deviceId, groupId: get(channels, '0.group_id') })
			} else {
				console.error('Browser not supported!')
			}
		}

		var video = document.getElementById('video')
		var player = new shaka.Player(video)
		window.player = player
		player.addEventListener('error', onErrorEvent)

		shaka.polyfill.installAll()

		getData()
	}, [])

	const initPlayer = async ({ deviceId, groupId = '' }) => {
		const { privateData, manifest, certificate } = await getMedia({ groupId })

		let privateDataTmp = privateData

		setTimeout(() => {
			privateDataTmp = null
		}, 3000)

		player.configure({
			...config,
			manifest: {
				dash: {
					clockSyncUri: manifest
				}
			},
			drm: {
				servers: {
					'com.widevine.alpha': certificate,
					'com.microsoft.playready': certificate,
					url_server: certificate
				},
				advanced: {
					// 'com.widevine.alpha': {}
					'com.widevine.alpha': {
						videoRobustness: 'SW_SECURE_CRYPTO',
						audioRobustness: 'SW_SECURE_CRYPTO'
					}
				}
			}
		})
		var networkingEngine = player.getNetworkingEngine()
		networkingEngine.clearAllRequestFilters()

		networkingEngine.registerRequestFilter(async (type, request) => {
			if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
				const getPrivateData = async () => {
					const { privateData } = await getMedia({ groupId })
					return privateData
				}

				request['Access-Control-Allow-Origin'] = '*'
				request.headers['Content-Type'] = 'application/octect-stream'
				request.headers['deviceUniqueId'] = deviceId
				request.headers['privateData'] = privateDataTmp || (await getPrivateData())
				request.body
			}
		})

		player
			.load(manifest)
			.then(function() {
				console.log('jose', player.getVariantTracks())
				console.log('The video has now been loaded!')
			})
			.catch(onError)
				console.log('jose', player.getVariantTracks())
	}

	const onErrorEvent = event => {
		onError(event.detail)
	}

	const onError = error => {
		console.error('Error code', error.code, 'object', error)
	}

	const getMedia = async ({ groupId }) => {
		const result = await axios.get('http://mfwktvnx1-api.clarovideo.net/services/player/getmedia', {
			params: {
				api_version: 'v5.86',
				HKS: 'zmda8lde6zheyvgn7w7io4785r',
				authpn: 'net',
				authpt: '5facd9d23d05bb83',
				device_category: 'web',
				device_manufacturer: 'windows',
				device_model: 'html5',
				device_type: 'html5',
				device_id: deviceId,
				group_id: groupId,
				stream_type: 'dashwv'
				// preview: 0,
				// region: 'brasil',
				// format: 'json',
			}
		})

		console.log('media', get(result, 'data.response'))

		let challenge = get(result, 'data.response.media.challenge')
		if (challenge) {
			challenge = JSON.parse(challenge)
		}

		return {
			privateData: challenge && challenge.token,
			manifest: get(result, 'data.response.media.video_url') || '',
			certificate: get(result, 'data.response.media.server_url') || ''
		}
	}

	const getChannels = async () => {
		const result = await axios.get('http://mfwktvnx1-api.clarovideo.net/services/epg/lineup', {
			params: {
				api_version: 'v6',
				HKS: 'zmda8lde6zheyvgn7w7io4785r',
				authpn: 'net',
				authpt: '5facd9d23d05bb83',
				device_category: 'web',
				device_manufacturer: 'windows',
				device_model: 'html5',
				device_type: 'html5',
				format: 'json',
				region: 'brasil'
			}
		})

		return get(result, 'data.response.channels') || []
	}

	const changeChannel = ({ groupId }) => {
		initPlayer({ deviceId, groupId })
	}

	return (
		<div>
			<video
				id='video'
				width='640'
				poster='//shaka-player-demo.appspot.com/assets/poster.jpg'
				controls
				autoPlay
			></video>
			<Grid container spacing={2} style={{ marginTop: '30px' }}>
				{channels.map(ch => {
					return (
						<Grid item xs={3} key={ch.id}>
							<Button variant='contained' onClick={() => changeChannel({ groupId: ch.group_id })}>
								{ch.number} {ch.name}
							</Button>
						</Grid>
					)
				})}
			</Grid>
		</div>
	)
}

export default Home
