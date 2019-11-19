const AUTH_TOKEN = 'AUTH_TOKEN'

let token

export const getToken = async () => {
	if (token) {
		return Promise.resolve(token)
	}

	if (process.browser) {
		token = await localStorage.getItem(AUTH_TOKEN)
	}
	return token
}

export const signIn = newToken => {
	token = newToken
	return localStorage.setItem(AUTH_TOKEN, newToken) || null
}

export const signOut = () => {
	token = undefined
	return localStorage.removeItem(AUTH_TOKEN) || null
}
