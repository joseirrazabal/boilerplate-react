import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'
import 'typeface-roboto/index.css'

// import emmaterialTheme from '@upate/emmaterial/theme/DefaultTheme'
// import '@upate/emmaterial/scss/storybook.scss'

// Create a theme instance.
const theme = createMuiTheme({
	// ...emmaterialTheme,
	// typography: {
	// 	fontFamily: `'sans-serif'`
	// },
	palette: {
		primary: {
			main: '#556cd6'
		},
		secondary: {
			main: '#19857b'
		},
		error: {
			main: red.A400
		},
		background: {
			default: '#fff'
		}
	}
})

export default theme
