import React from 'react'

// const DUMMY_STREAM_URL = 'https://mnmedias.api.telequebec.tv/m3u8/29880.m3u8'
const DUMMY_STREAM_URL = 'https://www.w3schools.com/tags/movie'

const styles = {
	content: {
		flexDirection: 'column',
		display: 'flex',
		flex: 1,
		backgroundColor: '#fafafa'
	},
	playerWrapper: {
		flexDirection: 'column',
		display: 'flex',
		height: 600,
		alignItems: 'center',
		justifyContent: 'space-around'
	},
	playerText: {
		color: 'white'
	},
	player: {
		width: 320,
		height: 240
	},
	channelsWrapper: {
		maxHeight: 150
	}
}

const Player = () => {
	return (
		<div>
			<video style={styles.player} controls autoPlay>
				<source src={`${DUMMY_STREAM_URL}.mp4`} type='video/mp4' />
				<source src={`${DUMMY_STREAM_URL}.ogg`} type='video/ogg' />
				Your browser does not support the video tag.
			</video>
		</div>
	)
}

export default Player
