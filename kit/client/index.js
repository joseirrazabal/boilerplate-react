import React from 'react'
import { AppContainer } from 'react-hot-loader'
import { hydrate } from 'react-dom'
import { loadableReady } from '@loadable/component'
import { initializeServiceWorkers } from './registerServiceWorker'

import { client } from '../apollo/links'
import App from '../shared'

const supportsHistory = 'pushState' in window.history

if (process.env.NODE_ENV !== 'production') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render')
	whyDidYouRender(React, {
		onlyLogs: true,
		include: [/^/]
	})
}

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
