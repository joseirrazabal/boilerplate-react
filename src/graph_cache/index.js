import { defaultDataIdFromObject } from 'apollo-cache-inmemory'
import merge from 'lodash/merge'
import typeDefs from './schema'

import prueba from './localState/prueba'

export const getCache = {
	dataIdFromObject: object => {
		switch (object.__typename) {
			case 'Location':
				return object.placeId
			case 'AutocompleteResult':
			case 'AvailabilityHotel':
				return object.code
			case 'Home':
				return `Home-${object.vert}`
			default:
				return defaultDataIdFromObject(object) // fall back to default handling
		}
	}
}

export const links = {
	...merge(prueba),
	typeDefs
}
