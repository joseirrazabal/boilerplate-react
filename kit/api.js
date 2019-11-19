const api = app => {
	try {
		const routes = require('src/server').default
		return routes(app)
	} catch (e) {
		return false
	}
}

export default api
