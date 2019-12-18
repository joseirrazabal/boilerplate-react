import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { withFocusable } from '@noriginmedia/react-spatial-navigation'

const RETURN_KEY = 32

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

const onPressKey = (event, setFocus) => {
	// console.log('jose pressKey', event.keyCode)
	if (event.keyCode === RETURN_KEY) {
		console.log('jose enter', event)
		// setFocus()
	}
}

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

const Menu = props => {
	const obj = [
		{
			name: '01'
		},
		{
			name: '02'
		},
		{
			name: '03'
		},
		{
			name: '04'
		}
	]

	return (
		<div
			style={{
				order: '1',
				flex: '1 1 auto',
				alignSelf: 'auto',
				minWidth: '0',
				minHeigth: '300px'
			}}
		>
			{obj.map((item, i) => {
				return (
					<MenuItemFocusable
						key={i}
						focusKey={`MENU-${item.name}`}
						onEnterPress={props.prueba}
						{...item}
					/>
				)
			})}
		</div>
	)
}

Menu.propTypes = {
	setFocus: PropTypes.func.isRequired,
	hasFocusedChild: PropTypes.bool.isRequired
}

const MenuFocusable = withFocusable()(Menu)

const Carousel = props => {
	const obj = [
		{
			name: '01'
		},
		{
			name: '02'
		},
		{
			name: '03'
		},
		{
			name: '04'
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
							// console.log('jose arrow ', props.focusKey, direction, props02)
							if (direction === 'right' && i === obj.length - 1) {
								props.setFocus(`${props.focusKey}-${obj[0].name}`)
								return false
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

const Spatial = props => {
	const setFocus = props.setFocus

	React.useEffect(() => {
		console.log('jose did')
		window.addEventListener('keydown', e => onPressKey(e))
		setFocus('MENU-01')
	}, [setFocus])

	const prueba2 = e => {
		console.log('jose prueba02', e.name)
	}

	return (
		<div
			style={{
				display: 'flex',
				flexFlow: 'row nowrap',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center'
			}}
		>
			<MenuFocusable prueba={prueba2} focusKey={'MENU'} />
			<div
				style={{
					order: '1',
					flex: '1 1 auto',
					alignSelf: 'auto',
					minWidth: '0',
					minHeigth: '300px'
				}}
			>
				<CarouselFocusable prueba={prueba2} focusKey={'SERIES'} />
				<CarouselFocusable prueba={prueba2} focusKey={'MOVIES'} />
			</div>
		</div>
	)
}

export default withFocusable()(Spatial)
