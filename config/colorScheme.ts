import { mode, darken, whiten } from '@chakra-ui/theme-tools'

const buttonStyles = {
	// style object for base or default style
	baseStyle: {},
	// styles for different sizes ("sm", "md", "lg")
	sizes: {},
	// styles for different visual variants ("outline", "solid")
	variants: {
		mw_button: (props) => ({
			bg: mode('primary', 'secondary')(props),
			color: mode('black', 'white')(props),
			_hover: {
				bg: mode(darken('primary', 15), whiten('secondary', 25))(props),
				boxShadow: 'md',
				transform: 'scale(1.05)'
			}
		})
	},
	// default values for `size` and `variant`
	defaultProps: {}
}


export { buttonStyles }
