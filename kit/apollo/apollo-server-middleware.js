import { HttpLink } from 'apollo-link-http'
import fetch from 'isomorphic-unfetch'
import {
	addMockFunctionsToSchema,
	makeExecutableSchema,
	mergeSchemas,
	makeRemoteExecutableSchema,
	introspectSchema
} from 'apollo-server'
import appRootDir from 'app-root-dir'
import path from 'path'
import { setContext } from 'apollo-link-context'
import { ApolloServer } from 'apollo-server-express'

/**
 *
 * @param {*} links
 */
const getRemoteSchemas = async links => {
	const schemas = []
	for (const index in links) {
		const http = new HttpLink({ uri: links[index], fetch })

		const link = setContext(async (req, { graphqlContext }) => {
			if (graphqlContext && graphqlContext.authorization) {
				return {
					headers: {
						authorization: `${graphqlContext && graphqlContext.authorization}`
					}
				}
			}
		}).concat(http)

		schemas.push(
			await introspectSchema(link)
				.then(schema =>
					makeRemoteExecutableSchema({
						schema,
						link
					})
				)
				.catch(e => [])
		)
	}
	return schemas
}

const getSchema = async () => {
	let schema = ''
	if (process.env.NODE_ENV !== 'production' && process.env.MOCKS === true) {
		const typeDefs = require(path.join(appRootDir.get(), 'mocks/schema')).default

		schema = makeExecutableSchema({
			typeDefs
		})

		const mocks = require(path.join(appRootDir.get(), 'mocks/resolvers')).default
		addMockFunctionsToSchema({ schema, mocks })
	} else {
		const LINKS = process.env.LINKS && process.env.LINKS.split(',').map(x => x.trim())
		if (!LINKS) {
			console.log('No hay links de schemas en la variable de entorno')
		}

		const Links = Array.isArray(LINKS) ? LINKS : [LINKS]
		const schemas = await getRemoteSchemas(Links)
		schema = mergeSchemas({
			schemas
		})
	}
	return schema
}

/**
 *
 */
const applyApolloMiddleware = async app => {
	const schema = await getSchema()

	const server = new ApolloServer({
		schema,
		debug: false,
		tracing: true,
		introspection: true,
		cacheControl: true,
		context: async ({ req }) => ({
			...req.headers
		})
		// formatError: error => {
		// 	return {
		// 		message: 'Prueba',
		// 		extensions: { code: 'PERSISTED_QUERY_NOT_FOUND' }
		// 	}
		// return new Error('Internal server error')
		// delete error.extensions.exception
		// return error
		// }
	})

	return server.applyMiddleware({ app })
}

export { applyApolloMiddleware as default, getSchema }
