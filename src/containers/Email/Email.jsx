import React from 'react'
// import PropTypes from 'prop-types'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { withFocusable } from '@noriginmedia/react-spatial-navigation'
import Typography from '@material-ui/core/Typography'

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

const Email = props => {
	const setFocus = props.setFocus

	React.useEffect(() => {
		console.log('jose did')
		// window.addEventListener('keydown', e => onPressKey(e))
		setFocus('SERIES-01')
	}, [setFocus])

	const prueba2 = e => {
		console.log('jose prueba02', e.name)
	}

	return (
		<div>
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
			<Typography paragraph>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Rhoncus dolor purus non enim praesent elementum facilisis leo vel.
				Risus at ultrices mi tempus imperdiet. Semper risus in hendrerit gravida rutrum quisque non
				tellus. Convallis convallis tellus id interdum velit laoreet id donec ultrices. Odio morbi quis
				commodo odio aenean sed adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies integer
				quis. Cursus euismod quis viverra nibh cras. Metus vulputate eu scelerisque felis imperdiet proin
				fermentum leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat
				vivamus at augue. At augue eget arcu dictum varius duis at consectetur lorem. Velit sed
				ullamcorper morbi tincidunt. Lorem donec massa sapien faucibus et molestie ac.
			</Typography>
		</div>
	)
}

export default withFocusable()(Email)
