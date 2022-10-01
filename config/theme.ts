import { extendTheme } from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'
import { buttonStyles as Button } from "./colorScheme"
import light from "./colors/light"
import dark from "./colors/dark"


/**
* * Color Palette
* @const colors
* ! DO NOT USE AS DEFINITIVE THEME
**/
const colors = {
	primary: dark.colors.primary,
	secondary: dark.colors.secondary,
	clear_lake: light.colors.background,
	dark_forest: dark.colors.background,
	marine: light.colors.primary,
	feather: light.colors.secondary,
	sleek_grey: "#a5a5af",
	highlight: "#d885db",
	accent: "#0901a7",
	success: "#2ddf00",
	danger: "#e60e0e",
	alert: "#e9bd09",
	calm: "#0a9ef3"
}

const fonts = { mono: `'Menlo', monospace` }

const breakpoints = createBreakpoints(
	{
		sm: "40em",
		md: "52em",
		lg: "64em",
		xl: "80em"
	}
)

const theme = extendTheme(
	{
		useSystemColorMode: true,
		//initialColorMode: 'light',
		colors: colors,
		fonts,
		breakpoints: breakpoints,
		components: {
			Button
		},
		icons: {
			logo: {},
			add: {},
			remove: {},
			search: {}
		}
	}
)

export default theme
