import React from 'react'
import clsx from 'clsx'
import { Link, withRouter } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import MailIcon from '@material-ui/icons/Mail'

import { withFocusable } from '@noriginmedia/react-spatial-navigation'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex'
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		})
	},
	appBarShift: {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		})
	},
	menuButton: {
		marginRight: 36
	},
	hide: {
		display: 'none'
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap'
	},
	drawerOpen: {
		width: drawerWidth,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		})
	},
	drawerClose: {
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		overflowX: 'hidden',
		width: theme.spacing(7) + 1,
		[theme.breakpoints.up('sm')]: {
			width: theme.spacing(9) + 1
		}
	},
	toolbar: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: theme.spacing(0, 1),
		...theme.mixins.toolbar
	}
}))

// const RETURN_KEY = 32
// const onPressKey = (event, setFocus) => {
// 	if (event.keyCode === RETURN_KEY) {
// 		console.log('jose enter', event)
// 	}
// }

const MenuItem = ({ text, index, to, focused }) => {
	return (
		<ListItem button key={text} component={Link} to={to} selected={focused}>
			<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
			<ListItemText primary={text} />
		</ListItem>
	)
}

const MenuItemFocusable = withFocusable()(MenuItem)

const Menu = props => {
	const obj = [
		{
			title: 'Inbox',
			to: '/inbox',
			name: '01'
		},
		{
			title: 'Starred',
			to: '/starred',
			name: '02'
		},
		{
			title: 'Send email',
			to: '/email',
			name: '03'
		},
		{
			title: 'Drafts',
			to: '/drafts',
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
						text={item.title}
						index={i}
						focusKey={`MENU-${item.name}`}
						onEnterPress={props.prueba}
						{...item}
					/>
				)
			})}
		</div>
	)
}

const MenuFocusable = withFocusable()(Menu)

const MiniDrawer = props => {
	const classes = useStyles()
	const theme = useTheme()
	const [open, setOpen] = React.useState(false)

	const setFocus = props.setFocus

	React.useEffect(() => {
		console.log('jose did')
		// window.addEventListener('keydown', e => onPressKey(e))
		setFocus('MENU-01')
	}, [setFocus])

	React.useEffect(() => {
		setOpen(true)
	}, [props.hasFocusedChild])

	const handleDrawerOpen = () => {
		setOpen(true)
	}

	const handleDrawerClose = () => {
		setOpen(false)
	}

	const prueba2 = e => {
		if (e.to) {
			props.history.push(e.to)
		}
	}

	return (
		<Drawer
			onFocus={handleDrawerOpen}
			onBlur={handleDrawerClose}
			variant='permanent'
			className={clsx(classes.drawer, {
				[classes.drawerOpen]: open,
				[classes.drawerClose]: !open
			})}
			classes={{
				paper: clsx({
					[classes.drawerOpen]: open,
					[classes.drawerClose]: !open
				})
			}}
			open={open}
		>
			<div className={classes.toolbar}>
				{open ? (
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
					</IconButton>
				) : (
					<IconButton onClick={handleDrawerOpen}>
						{theme.direction !== 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
					</IconButton>
				)}
			</div>
			<Divider />
			<List>
				<MenuFocusable prueba={prueba2} focusKey={'MENU'} />
			</List>
		</Drawer>
	)
}

export default withFocusable({ trackChildren: true })(withRouter(MiniDrawer))
