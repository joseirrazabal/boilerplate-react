import React from 'react'
import { renderToString } from 'react-dom/server'
import { renderToStringWithData } from '@apollo/react-ssr'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { ServerStyleSheets } from '@material-ui/core/styles'
import { ChunkExtractor } from '@loadable/server'
import appRootDir from 'app-root-dir'
import path from 'path'

import { cache, linksServer } from '../apollo/links'
import Html from './html'
import App from '../shared'

const render = async (url, context) => {
	const webStats = path.join(
		appRootDir.get(),
		process.env.NODE_ENV === 'production' ? 'client' : 'dist/client',
		'loadable-stats.json'
	)

	const server = new ApolloClient({
		ssrMode: true,
		cache: cache().cache,
		link: ApolloLink.from(linksServer)
	})

	const webExtractor = new ChunkExtractor({
		statsFile: webStats,
		entrypoints: ['client']
	})

	const sheets = new ServerStyleSheets()
	const helmetContext = {}

	const html = await renderToStringWithData(
		webExtractor.collectChunks(
			sheets.collect(
				<App server url={url} context={context} helmetContext={helmetContext} apolloClient={server} />
			)
		)
	)

	const { helmet } = helmetContext

	return renderToString(
		<Html
			head={helmet}
			html={html}
			material={sheets.toString()}
			apolloState={server.extract()}
			loadableState={webExtractor}
		/>
	)
}

const serverRenderMiddleware = ({ clientStats }) => async (req, res, next) => {
	const url = req.url

	let html
	const context = {}

	try {
		html = await render(url, context)
		if (context.url) {
			res.redirect(301, context.url)
		} else {
			res.status(200).send(`<!doctype html>${html}`)
		}
	} catch (ex) {
		return next(ex)
	}
}

export default serverRenderMiddleware
