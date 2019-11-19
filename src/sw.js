/* eslint-disable no-undef */

// importScripts('/workbox-v3.6.3/workbox-sw.js')
// workbox.setConfig({ modulePathPrefix: '/workbox-v3.6.3' })

workbox.setConfig({ debug: false })
// workbox.core.setLogLevel(workbox.core.LOG_LEVELS.silent)

// workbox.precaching.suppressWarnings()
workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

workbox.routing.registerRoute(/images/, workbox.strategies.cacheFirst(), 'GET')
workbox.routing.registerRoute(
	/^https:\/\/fonts.(?:googleapis|gstatic).com\/(.*)/,
	workbox.strategies.cacheFirst(),
	'GET'
)

workbox.routing.registerRoute(/\.(?:js|css)$/, workbox.strategies.cacheFirst())

workbox.routing.registerRoute(/.*/, workbox.strategies.networkFirst(), 'GET')

self.addEventListener('message', event => {
	if (!event.data) {
		return
	}

	switch (event.data) {
		case 'skipWaiting':
			self.skipWaiting()
			break
		default:
			// NOOP
			break
	}
})
