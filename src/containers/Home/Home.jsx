import React, { useRef, useEffect } from 'react'
import get from 'lodash/get'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

import useChannels from '../Player/useChannels'
import { getConfig, getMedia, getTypePlayer } from '../Player/getMedia'

const useStyles = makeStyles(theme => ({
	container: {
		width: '100%',
		height: '100%'
	}
}))

const deviceId = '57c53492-8b80-bc98-e066-963477ce3b71'

const Home = () => {
	const classes = useStyles()

	const player = useRef(null)
	const VideoContainerTv = useRef(null)

	const channels = useChannels()

	useEffect(() => {
		player.current = getTypePlayer(VideoContainerTv.current)
	}, [])

	useEffect(() => {
		if (channels.length) {
			const groupId = get(channels, '1.group_id')

			initPlayer({ groupId, deviceId })
		}
	}, [channels])

	const initPlayer = async ({ groupId, deviceId }) => {
		const data = await getConfig({
			deviceId,
			groupId
		})

		player.current.loadMedia({ ...data, deviceId, getMedia })
	}

	const changeChannel = ({ groupId }) => {
		initPlayer({ deviceId, groupId })
	}

	return (
		<div className={classes.container}>
			<div
				id='HTML5VideoWrapperTv'
				ref={VideoContainerTv}
				style={{
					width: '100%',
					height: '100%'
				}}
			>
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
		</div>
	)
}

export default Home
