import 'regenerator-runtime/runtime'
import { createServer } from 'http'
import express from 'express'
import expressStaticGzip from 'express-static-gzip'
import bodyParser from 'body-parser'
import appRootDir from 'app-root-dir'
import path from 'path'
import compression from 'compression'
import dotenv from 'dotenv'

// import { SubscriptionServer } from 'subscriptions-transport-ws'
// import { execute, subscribe } from 'graphql'
// import withApolloMiddleware, { getSchema } from './apollo/apollo-server-middleware'
import withApolloMiddleware from './apollo/apollo-server-middleware'

dotenv.config({ path: `${appRootDir.get()}/.env` })

const isDevelopment = process.env.NODE_ENV !== 'production'

const app = express()
const server = createServer(app)

const checkForHTML = req => {
	const url = req.url.split('.')
	const extension = url[url.length - 1]

	if (['/'].indexOf(extension) > -1 || ['html'].indexOf(extension) > -1) {
		// compress only .html files sent from server
		return true
	}

	return false
}

const start = async () => {
	await withApolloMiddleware(app)

	app.disable('x-powered-by')

	// app.use(compression())
	app.use(compression({ filter: checkForHTML }))
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(bodyParser.json())

	app.use('/sw.js', express.static('public/sw.js', { maxAge: 0 }))
	app.use(express.static('public', { maxAge: '1y' }))

	if (isDevelopment) {
		try {
			const api = require(path.join(appRootDir.get(), 'src/server')).default
			api(app)
		} catch (e) {
			console.log(e)
		}

		const webpackConfig = require(path.join(appRootDir.get(), 'kit/webpack'))
		const withDevMiddleware = require(path.join(appRootDir.get(), 'kit/webpack/middleware')).default
		await withDevMiddleware(app, webpackConfig)
	} else {
		// app.use(express.static('client', { maxAge: '7d' }))
		app.use('/', expressStaticGzip('client'))

		try {
			const api = require(path.join(appRootDir.get(), 'server/api')).default
			api(app)
		} catch (e) {
			console.log(e)
		}

		const serverRender = require(path.join(appRootDir.get(), 'server/server')).default
		app.use(serverRender({ clientStats: require(path.join(appRootDir.get(), 'client-stats.json')) }))
	}

	// cliente
	app.use((err, req, res, next) => {
		if (req.xhr) {
			res.status(500).send({ error: 'Something failed!' })
		} else {
			next(err)
		}
	})

	app.use((err, req, res, next) => {
		console.error(err.stack)
		res.status(500).send('Hubo un error!')
	})

	server.listen(process.env.APP_PORT, () => {
		// subcripciones
		// new SubscriptionServer(
		// 	{
		// 		execute,
		// 		subscribe,
		// 		schema: getSchema()
		// 	},
		// 	{
		// 		server: server,
		// 		path: '/subscriptions'
		// 	}
		// )
		if (!isDevelopment) {
			console.log(`🚀  Server listening at port ${process.env.APP_PORT}  🚀`)
		}
	})
}

start().catch(err => {
	console.log(err)
})
