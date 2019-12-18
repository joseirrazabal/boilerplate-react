import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { withFocusable } from '@noriginmedia/react-spatial-navigation'

const useStyles = makeStyles(theme => ({
	menuItem: {
		width: 100,
		height: 100,
		backgroundColor: '#f8f258'
	},
	focusedBorder: {
		borderWidth: 6,
		borderColor: 'red',
		backgroundColor: 'white'
	}
}))

const MenuItem = props => {
	const classes = useStyles()

	return (
		<div
			className={clsx(classes.menuItem, {
				[classes.focusedBorder]: props.focused
			})}
		>
			{props.focusKey}
		</div>
	)
}

const MenuItemFocusable = withFocusable()(MenuItem)

const Carousel = props => {
	const obj = [
		{
			name: '01'
		}
	]

	return (
		<div
			style={{
				display: 'flex'
			}}
		>
			{obj.map((item, i) => {
				return (
					<MenuItemFocusable
						key={i}
						focusKey={`${props.focusKey}-${item.name}`}
						onArrowPress={(direction, props02) => {
							// vuelve al inicio
							console.log('jose arrow ', props.focusKey, direction, props02)
							if (direction === 'right' && i === obj.length - 1) {
								props.setFocus(`${props.focusKey}-${obj[0].name}`)
								return false
							} else if (direction === 'RED') {
								console.log('jose prisiono red')
							}
						}}
						onEnterPress={props.prueba}
						{...item}
					/>
				)
			})}
		</div>
	)
}

const CarouselFocusable = withFocusable()(Carousel)

const Home = props => {
	const setFocus = props.setFocus

	React.useEffect(() => {
		console.log('ultimo')
		setFocus('HOME')
	}, [])

	const prueba2 = e => {
		console.log('jose prueba02', e.name)
	}

	return (
		<div>
			<CarouselFocusable prueba={prueba2} focusKey={'HOME'} />
		</div>
	)
}

// Home.defaultProps = {}

// Home.propTypes = {}

// export default Home
export default withFocusable({
	trackChildren: true,
	forgetLastFocusedChild: true
})(Home)
