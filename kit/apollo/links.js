import 'isomorphic-unfetch'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { withClientState } from 'apollo-link-state'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { ApolloLink } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { createPersistedQueryLink } from 'apollo-link-persisted-queries'
import { setContext } from 'apollo-link-context'

import { getToken } from 'kit/utils/token'

const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		graphQLErrors.map(({ message, location, path }) => {
			// if (process.env.NODE_ENV !== 'production') {
			console.log(`[GraphQL error]: Message: ${message}, Location: ${location}, Path: ${path}`)
			// }
		})
	}
	if (networkError) {
		// if (process.env.NODE_ENV !== 'production') {
		console.log(`[Network error]: ${networkError}`)
		// }
	}
})

const subscriptionLink = (config = {}) =>
	new WebSocketLink({
		uri: `ws://${process.env.GRAPHQL_HOST}:${process.env.GRAPHQL_PORT}/subscriptions`,
		options: { reconnect: false },
		...config
	})

const queryOrMutationLink = (config = {}) =>
	createPersistedQueryLink({ useGETForHashedQueries: true }).concat(
		new HttpLink({
			...config,
			credentials: 'same-origin'
		})
	)

const requestLink = ({ queryOrMutationLink, subscriptionLink }) =>
	ApolloLink.split(
		({ query }) => {
			const { kind, operation } = getMainDefinition(query)
			return kind === 'OperationDefinition' && operation === 'subscription'
		},
		subscriptionLink,
		queryOrMutationLink
	)

// export const request = async operation => {
// 	const token = (await localStorage.getItem('token')) || null
// 	operation.setContext({
// 		headers: {
// 			authorization: token
// 		}
// 	})
// }

const cache = () => {
	// const localLink = { link: withClientState(), cache: new InMemoryCache() }
	const localLink = { cache: new InMemoryCache() }

	try {
		// const resolver = require('src/graph_cache')
		// localLink.cache = new InMemoryCache(resolver.getCache)
		// localLink.link = withClientState(resolver.links)
	} catch (e) {
		console.log('No se cargo graph cache')
	}

	return localLink
}

const authLink = setContext(async (req, { headers }) => {
	const token = await getToken()
	let auth = {}

	if (token) {
		auth = { authorization: `Bearer ${token}` }
	}

	return {
		headers: {
			...headers,
			...auth
		}
	}
})

const linksClient = () => {
	const links = []

	if (process.browser) {
		// subcripciones
		// 	links.push(
		// 		requestLink({
		// 			queryOrMutationLink: queryOrMutationLink(),
		// 			subscriptionLink: subscriptionLink()
		// 		})
		// 	)
		// links.push(cache().link)
		links.push(authLink)
		links.push(errorLink)
		links.push(
			queryOrMutationLink({
				fetch,
				// uri: `${process.env.GRAPHQL_HOST}:${process.env.GRAPHQL_PORT}/graphql`
				uri: `/graphql`
			})
		)
	}
	return links
}

// saca el __typename cuando guardas
const middleWareLink = new ApolloLink((operation, forward) => {
	if (operation.variables) {
		const omitTypename = (key, value) => (key === '__typename' ? undefined : value)
		// eslint-disable-next-line no-param-reassign
		operation.variables = JSON.parse(JSON.stringify(operation.variables), omitTypename)
	}
	return forward(operation)
})

const client = new ApolloClient({
	ssrForceFetchDelay: 100,
	connectToDevTools: process.env.NODE_ENV !== 'production' && process.browser,
	ssrMode: false,
	cache: cache().cache.restore(process.browser ? window.__APOLLO_STATE__ : {}),
	link: ApolloLink.from([middleWareLink, ...linksClient()])
})

const linksServer = [
	errorLink,
	queryOrMutationLink({
		fetch,
		uri: `${process.env.APP_HOST}:${process.env.APP_PORT}/graphql`
	})
]

// if (process.env.NODE_ENV === 'production') {
linksServer.unshift(createPersistedQueryLink())
// }

export {
	linksServer,
	errorLink,
	subscriptionLink,
	queryOrMutationLink,
	requestLink,
	cache,
	middleWareLink,
	client
}
