import { useState, useEffect } from 'react'
import axios from 'axios'
import get from 'lodash/get'

const useChannels = () => {
	const [channels, setChannels] = useState([])

	useEffect(() => {
		const getData = async () => {
			const channels = await getChannels()
			setChannels(channels)
		}

		getData()
	}, [])

	const getChannels = async () => {
		try {
			const result = await axios.get('https://mfwktvnx1-api.clarovideo.net/services/epg/lineup', {
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
		} catch (e) {
			console.log(`jose errors: ${e.message}`)
		}
		return null
	}

	return channels
}

export default useChannels
