export const registerServiceWorkers = () => {
	if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('sw.js')
			.then(reg => {
				if (!navigator.serviceWorker.controller) {
					// The window client isn't currently controlled so it's a new service
					// worker that will activate immediately
					return
				}

				// When the user asks to refresh the UI, we'll need to reload the window
				var preventDevToolsReloadLoop
				navigator.serviceWorker.addEventListener('controllerchange', event => {
					console.log('Controller loaded')
					// Ensure refresh is only called once.
					// This works around a bug in "force update on reload".
					if (preventDevToolsReloadLoop) return
					preventDevToolsReloadLoop = true
					window.location.reload()
				})

				// onNewServiceWorker(reg, () => {
				// 	showRefreshUI(reg)
				// })

				// reg.update()
				console.log('Service worker is started')
			})
			.catch(error => {
				console.log('Service worker registration failed with ' + error)
			})
	}
}

export const unregisterServiceWorkers = () => {
	// eslint-disable-next-line
	if ('serviceWorker' in navigator) {
		// eslint-disable-next-line
		navigator.serviceWorker.ready.then(registration => {
			registration.unregister()
		})
	}
}

export const initializeServiceWorkers = () => {
	const IS_DEVELOP = process.env.NODE_ENV !== 'production'
	if (IS_DEVELOP) {
		unregisterServiceWorkers()
	} else {
		registerServiceWorkers()
	}
}
