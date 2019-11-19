import React from 'react'
import PropTypes from 'prop-types'

const Layout = ({ children }) => {
	return (
		<div>
			<header>123</header>
			{children}
			<footer>footer</footer>
		</div>
	)
}

Layout.propTypes = {
	children: PropTypes.node.isRequired
}

export default Layout
