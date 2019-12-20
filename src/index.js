import React from 'react'
import { Helmet } from 'react-helmet-async'
import { config } from '@fortawesome/fontawesome-svg-core'
import { initNavigation, setKeyMap } from '@noriginmedia/react-spatial-navigation'

import { getKeys } from './devices/keys'
import theme from './theme'
import Route from './route'

config.autoAddCss = false

// solo en el cliente
if (process.browser) {
	initNavigation()

	const keys = getKeys()
	if (keys) {
		console.log('keys', keys)
		setKeyMap(keys)
	} else {
		setKeyMap({
			left: 37,
			up: 38,
			right: 39,
			down: 40,
			enter: 13,
			RED: 118
		})
	}
}

const App = () => {
	return [
		<Helmet key={1} encodeSpecialCharacters titleTemplate='%s'>
			<title>Titulo123</title>
			<meta name='description' content='Descripcion' />
			<html lang='es' />
			<meta charSet='utf-8' />
			<meta httpEquiv='x-ua-compatible' content='ie=edge,chrome=1' />
			<meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=5' />
			<meta name='theme-color' content={theme.palette.primary.main} />
			<link rel='manifest' href='/manifest.json' />
		</Helmet>,
		<Route key={2} />
	]
}

export default App
