import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

// import Menu from 'src/components/Menu/Menu'

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex'
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3)
	}
}))

const Layout = ({ children }) => {
	const classes = useStyles()

	return (
		<div className={classes.root}>
			{/* <Menu /> */}
			{children}
		</div>
	)
}

Layout.propTypes = {
	children: PropTypes.node.isRequired
}

export default Layout
