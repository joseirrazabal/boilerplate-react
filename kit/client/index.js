import React from 'react'
import { AppContainer } from 'react-hot-loader'
import { hydrate } from 'react-dom'
import { loadableReady } from '@loadable/component'
import { initializeServiceWorkers } from './registerServiceWorker'
import { initNavigation, setKeyMap } from '@noriginmedia/react-spatial-navigation'

import { client } from '../apollo/links'
import App from '../shared'
// import Device from './devices/device'

const supportsHistory = 'pushState' in window.history

if (process.env.NODE_ENV !== 'production') {
	// const whyDidYouRender = require('@welldone-software/why-did-you-render')
	// whyDidYouRender(React, {
	// 	onlyLogs: true,
	// 	include: [/^/]
	// })
}

initNavigation()
// const device = Device.getDevice().getPlatform();

setKeyMap({
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	enter: 13,
	RED: 118 // F7
	// GREEN: 119, // F8
	// YELLOW: 120, // F9
	// BLUE: 121, // F10
	// BACK: 8,
	// EXIT: 27 // escape
})

const render = Component => {
	hydrate(
		<AppContainer>
			<Component supportsHistory={supportsHistory} apolloClient={client} />
		</AppContainer>,
		document.getElementById('root')
	)
}

loadableReady(() => {
	render(App)
	initializeServiceWorkers()
})

if (module.hot) {
	module.hot.accept('../shared/index', () => {
		render(require('../shared/index').default)
	})
}
