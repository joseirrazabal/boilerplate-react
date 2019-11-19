const manager = app => {
	app.get('/hola/:hola', (req, res, next) => {
		// return res.status(303).send('final') // prueba
		if (req.params.hola !== 'bien') {
			res.set('Location', '/')
			return res.status(303).send()
		}
		next()
	})

	return app
}

export default manager
