import React, { useState } from 'react'
// import Prueba from '@upate/emmaterial'
import useForm from 'react-hook-form'

// import { Redirect } from 'react-router-dom'
// import { withStyles } from '@material-ui/styles'
// import classNames from 'classnames'
// import get from 'lodash/get'
// import Grid from '@material-ui/core/Grid'
// import HOME from 'gql/home/home.gql'

import classes from './styles.scss'

const Home = props => {
	const [hookState, setHookState] = useState({ num: 0 })

	const { register, handleSubmit, errors } = useForm()
	const onSubmit = data => console.log(data)
	console.log('err', errors)

	return (
		<>
			{/* <Prueba /> */}
			<form onSubmit={handleSubmit(onSubmit)}>
				<input type='text' placeholder='name' name='name' ref={register({ required: true, max: 10 })} />

				<input type='submit' />
			</form>

			<div className={classes.prueba}>prueba de estilos</div>
			<button onClick={() => setHookState({ num: 0 })}>Prueba</button>
			<p>
				{'Will cause a re-render since previous hookState !== new hookState, or {num: 0} !== {num: 0}'}
			</p>
			<code>{JSON.stringify({ hookState })}</code>
		</>
	)
}

// Home.defaultProps = {}

// Home.propTypes = {}

export default Home
