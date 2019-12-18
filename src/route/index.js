import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import Layout from 'src/components/Layout'

import Home from 'src/containers/HomePrueba'
import Email from 'src/containers/Email'

const routes = [
	{
		path: '/email',
		Component: Email, // pageNotFound
		Props: { vert: 'air' },
		useLayout: true,
		isPrivate: false
	},
	{
		path: '/search',
		Component: Home, // pageNotFound
		Props: { vert: 'air' },
		useLayout: true,
		isPrivate: false
	},
	{
		path: '*',
		Component: Home, // pageNotFound
		Props: { vert: 'air' },
		useLayout: true,
		isPrivate: false
	}
]

const AppRoute = ({ path, props: props01, component: Component, isPrivate }) => {
	return (
		<Route
			path={path}
			render={props => (
				<Layout>
					<Component {...props} {...props01} />
				</Layout>
			)}
		/>
	)
}

export const MainRoutes = () => (
	<Switch>
		{routes.map(({ path, useLayout, Component, isPrivate, Props }) => {
			const RouteCustom = useLayout ? AppRoute : Route
			if (!useLayout) {
				return (
					<RouteCustom
						key={path}
						path={path}
						render={props => <Component {...props} {...Props} />}
						isPrivate={isPrivate}
					/>
				)
			}

			return (
				<RouteCustom key={path} path={path} component={Component} isPrivate={isPrivate} props={Props} />
			)
		})}
		<Redirect from='/' to='/paquetes' />
	</Switch>
)

export default MainRoutes
