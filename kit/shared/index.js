import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { HelmetProvider } from 'react-helmet-async'
import { ApolloProvider } from '@apollo/react-hooks'
import { StaticRouter, BrowserRouter } from 'react-router-dom'
import { StylesProvider, createGenerateClassName, ThemeProvider } from '@material-ui/styles'
import { jss } from 'react-jss'

import theme from 'src/theme'
import App from 'src/'

const generateClassName = createGenerateClassName({
	productionPrefix: 'jl-'
})

const Shared = ({ server, apolloClient, supportsHistory, context, helmetContext, url }) => {
	useEffect(() => {
		const jssStyles = document.querySelector('#styleServer')
		if (jssStyles) {
			jssStyles.parentNode.removeChild(jssStyles)
		}
	}, [])

	const renderApp = ({ apolloClient }) => {
		return (
			<ApolloProvider client={apolloClient}>
				<StylesProvider jss={jss} generateClassName={generateClassName}>
					<ThemeProvider theme={theme}>
						<App />
					</ThemeProvider>
				</StylesProvider>
			</ApolloProvider>
		)
	}

	if (server) {
		return (
			<HelmetProvider context={helmetContext}>
				<StaticRouter location={url} context={context}>
					{renderApp({ apolloClient })}
				</StaticRouter>
			</HelmetProvider>
		)
	}

	return (
		<HelmetProvider>
			<BrowserRouter forceRefresh={!supportsHistory}>{renderApp({ apolloClient })}</BrowserRouter>
		</HelmetProvider>
	)
}

Shared.defaultProps = {
	supportsHistory: false,
	server: false,
	url: '',
	context: {},
	contextHelmet: {}
}

Shared.propTypes = {
	apolloClient: PropTypes.object.isRequired,
	supportsHistory: PropTypes.bool,
	server: PropTypes.bool,
	url: PropTypes.string,
	context: PropTypes.object,
	contextHelmet: PropTypes.object
}

export default Shared
