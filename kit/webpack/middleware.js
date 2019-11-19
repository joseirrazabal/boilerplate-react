import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackHotServerMiddleware from 'webpack-hot-server-middleware'

export default (app, webpackConfig) => {
	const multiCompiler = webpack(webpackConfig)

	app.use(
		webpackDevMiddleware(multiCompiler, {
			stats: 'none',
			logLevel: 'silent',
			writeToDisk: filePath => {
				return /dist\/server\//.test(filePath) || /loadable-stats/.test(filePath)
			}
		})
	)

	app.use(
		webpackHotMiddleware(multiCompiler.compilers.find(compiler => compiler.name === 'client'), {
			log: false
		})
	)
	// app.use(webpackHotServerMiddleware(multiCompiler, { chunkName: 'server', serverRendererOptions: { app } }))
	app.use(webpackHotServerMiddleware(multiCompiler, { chunkName: 'server' }))
}
