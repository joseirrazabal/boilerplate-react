import React from 'react'
// import 'video-react/dist/video-react.css' // import css
// import 'video-react/styles/scss/video-react.scss'

import { Player, ControlBar } from 'video-react'
import Prueba from './control'

const sources = {
	sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
	bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
	bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
	test: 'http://media.w3.org/2010/05/video/movie_300.webm'
}

const AppPlayer = () => {
	let objPlayer

	const play = () => {
		objPlayer.play()
	}
	const pause = () => {
		objPlayer.pause()
	}

	return (
		<div>
			<Player
				ref={player => {
					objPlayer = player
				}}
				// playsInline
				// autoPlay
			>
				<source src='https://media.w3.org/2010/05/sintel/trailer_hd.mp4' />
				<ControlBar>
					<Prueba order={7} />
				</ControlBar>
			</Player>
			<div className='py-3'>
				<button onClick={play} className='mr-3'>
					play
				</button>
				<button onClick={pause} className='mr-3'>
					pause
				</button>
			</div>
		</div>
	)
}

export default AppPlayer
