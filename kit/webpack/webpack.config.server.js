const appRootDir = require('app-root-dir')
const webpack = require('webpack')
const path = require('path')
const jsonStableStringify = require('json-stable-stringify')
const xxHash = require('xxhashjs')
const nodeExternals = require('webpack-node-externals')
// const threadLoader = require('thread-loader')
const Dotenv = require('dotenv-webpack')
const LoadablePlugin = require('@loadable/webpack-plugin')

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const IS_PRODUCTION = NODE_ENV === 'production'
const IS_LOCAL = !!process.env.LOCAL
const PUBLIC_PATH = !IS_PRODUCTION || IS_LOCAL ? '/' : process.env.ASSETS_URL

const hash = str => xxHash.h32(jsonStableStringify(str), 0).toString(16)

var clusterWorkerSize = require('os').cpus().length

const DIST_NAME = 'dist'

const config = {
	mode: !IS_PRODUCTION ? 'development' : 'production',
	name: 'server',
	context: path.join(appRootDir.get()),
	// entry: { server: ["@babel/polyfill/noConflict", "./server/render.js"]},
	entry: { server: ['./kit/server/index.js'], api: ['./kit/api.js'] },
	output: {
		path: path.join(appRootDir.get(), DIST_NAME, 'server'),
		filename: '[name].js',
		sourceMapFilename: '[name].map.js',
		libraryTarget: 'commonjs2',
		publicPath: PUBLIC_PATH
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'thread-loader',
						options: {
							workers: clusterWorkerSize,
							poolTimeout: !IS_PRODUCTION ? Infinity : 2000
						}
					},
					{
						loader: 'babel-loader',
						options: {
							plugins: ['dynamic-import-node']
						}
					}
				]
			},
			{
				test: /\.(js|mjs)$/,
				include: '/node_modules/',
				exclude: /@babel(?:\/|\\{1,2})runtime/,
				loader: 'babel-loader',
				options: {
					babelrc: false,
					configFile: false,
					compact: false,
					presets: [[require.resolve('babel-preset-react-app/dependencies'), { helpers: true }]],
					cacheDirectory: true,
					cacheCompression: false,
					sourceMaps: !IS_PRODUCTION,
					inputSourceMap: !IS_PRODUCTION
				}
			},
			{
				test: /\.(scss|css)$/,
				include: [path.join(appRootDir.get(), 'src'), path.join(appRootDir.get(), 'css')],
				exclude: /node_modules/,
				use: [
					{
						loader: 'css-loader',
						options: {
							onlyLocals: true,
							importLoaders: 1,
							modules: {
								localIdentName: !IS_PRODUCTION
									? '[name]_[local]_[hash:base64:3]'
									: '[local]_[hash:base64:3]'
							}
						}
					},
					'sass-loader'
				]
			},
			{
				test: /\.(scss|css)$/,
				include: /node_modules/,
				use: [
					{
						loader: 'css-loader',
						options: {
							onlyLocals: true,
							importLoaders: 1,
							modules: {
								localIdentName: !IS_PRODUCTION
									? '[name]_[local]_[hash:base64:3]'
									: '[local]_[hash:base64:3]'
							}
						}
					},
					'sass-loader'
				]
			},
			{
				test: /.*\.(eot|woff|woff2|ttf|svg|png|jpg|jpeg|gif|ico|webp)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'images/[name].[hash].[ext]',
							limit: 10000
						}
					},
					({ resource }) => ({
						loader: 'image-webpack-loader',
						options: {
							bypassOnDebug: true,
							mozjpeg: {
								quality: 90
							},
							pngquant: {
								quality: '90-95',
								speed: 1
							},
							svgo: {
								plugins: [
									{
										cleanupIDs: {
											prefix: hash(path.relative(appRootDir.get(), resource)),
											minify: true,
											remove: true
										}
									}
								]
							}
						}
					})
				]
			},
			{
				test: /\.(graphql|gql)$/,
				exclude: /node_modules/,
				loader: 'graphql-tag/loader'
			},
			{
				test: /\.(mp4|webm)$/,
				loader: 'url-loader',
				options: {
					limit: 10000
				}
			},
			{
				test: /\.(aac|m4a|mp3|oga|ogg|wav)$/,
				loader: 'url-loader',
				options: {
					name: 'sounds/[name].[hash].[ext]',
					limit: 10000
				}
			}
		]
	},
	resolve: {
		modules: ['node_modules', path.join(appRootDir.get(), 'src')],
		extensions: ['.css', '.scss', '.mjs', '.js', '.jsx', '.json', '.gql'],
		alias: {
			'react-dom': !IS_PRODUCTION ? '@hot-loader/react-dom' : 'react-dom',
			kit: path.resolve(appRootDir.get(), 'kit'),
			src: path.resolve(appRootDir.get(), 'src'),
			public: path.resolve(appRootDir.get(), 'public')
		}
	},
	plugins: [
		new Dotenv(),
		new LoadablePlugin(),
		new webpack.LoaderOptionsPlugin({
			debug: true
		}),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
		new webpack.DefinePlugin({
			process: {},
			'process.env': {
				// NODE_ENV: JSON.stringify(NODE_ENV),
				// GRAPHQL_HOST: JSON.stringify(process.env.GRAPHQL_HOST),
				// GRAPHQL_PORT: JSON.stringify(process.env.GRAPHQL_PORT),
				VERSION: JSON.stringify(process.env.npm_package_version),
			  BROWSER: false
			},
			'process.browser': false
		}),
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1
		})
	],
	target: 'node',
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
		process: false
	},
	devtool: IS_PRODUCTION ? '' : 'eval',
	bail: IS_PRODUCTION,
	externals: [
		'@loadable/component',
		nodeExternals({
			whitelist: [/\.(css|scss)$/, /react-apollo/]
		})
	]
}

module.exports = config
