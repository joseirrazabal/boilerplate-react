import React from 'react'
import { Link } from 'react-router-dom'

const Logo = () => (
	<a href={'/'} aria-label="home">
		<div style={{ display: 'flex', alignItems: 'center' }}>
			{/* <Link to="/" style={{ display: 'flex', alignItems: 'center' }}> */}
			<img alt="logo" src="/images/logo.png" style={{ height: 30 }} /> {/* </Link> */}
		</div>
	</a>
)

export default Logo
