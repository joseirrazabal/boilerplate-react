import React from 'react'
import { Helmet } from 'react-helmet-async'
import theme from './theme'
import Route from './route'

import { config } from '@fortawesome/fontawesome-svg-core'

config.autoAddCss = false

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
