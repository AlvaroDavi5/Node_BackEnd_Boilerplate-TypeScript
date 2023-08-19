module.exports = {
	env: {
		es6: true,
		node: true,
		jest: true,
		browser: true,
	},
	extends: [
		'standard',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
		'prettier',
	],
	rules: {
		semi: ['error', 'always'],
		indent: ['error', 'tab'],
		'comma-spacing': ['error', { before: false, after: true }],
		quotes: ['error', 'single'],
		'object-curly-spacing': [
			1,
			'always',
		],
		camelcase: 'off',
		'arrow-parens': [
			'off',
			'always'
		],
		'brace-style': [
			'off',
			'off'
		],
		complexity: 'off',
		'constructor-super': 'warn',
		curly: 'off',
		'eol-last': 'off',
		eqeqeq: [
			'warn',
			'smart'
		],
		'guard-for-in': 'warn',
		'id-blacklist': 'off',
		'id-match': 'off',
		'import/order': 'off',
		'max-classes-per-file': 'off',
		'max-len': [
			'warn',
			{
				code: 150,
			}
		],
		'new-parens': 'warn',
		'no-bitwise': 'warn',
		'no-caller': 'warn',
		'no-cond-assign': 'warn',
		'no-console': 'warn',
		'no-debugger': 'warn',
		'no-empty': 'warn',
		'no-eval': 'warn',
		'no-fallthrough': 'warn',
		'no-invalid-this': 'warn',
		'no-new-wrappers': 'warn',
		'no-throw-literal': 'warn',
		'no-trailing-spaces': 'warn',
		'no-undef': 'error',
		'no-undef-init': 'warn',
		'no-underscore-dangle': 'warn',
		'no-unsafe-finally': 'warn',
		'no-unused-labels': 'warn',
		'no-var': 'warn',
		'object-shorthand': 'warn',
		'one-var': 'off',
		'prefer-const': 'warn',
		radix: 'warn',
		'spaced-comment': [
			'warn',
			'always',
			{
				markers: [
					'/'
				]
			}
		],
		'use-isnan': 'warn',
		'valid-typeof': 'off',
		'no-useless-constructor': 'warn',
		'@typescript-eslint/adjacent-overload-signatures': 'warn',
		'@typescript-eslint/array-type': 'off',
		'@typescript-eslint/ban-types': [
			'warn',
			{
				types: {
					Object: {
						message: 'Avoid using the `Object` type. Did you mean `object`?'
					},
					Function: {
						message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.'
					},
					Boolean: {
						message: 'Avoid using the `Boolean` type. Did you mean `boolean`?'
					},
					Number: {
						message: 'Avoid using the `Number` type. Did you mean `number`?'
					},
					String: {
						message: 'Avoid using the `String` type. Did you mean `string`?'
					},
					Symbol: {
						message: 'Avoid using the `Symbol` type. Did you mean `symbol`?'
					}
				},
			},
		],
		'@typescript-eslint/consistent-type-assertions': 'warn',
		'@typescript-eslint/explicit-member-accessibility': [
			'off',
			{
				accessibility: 'explicit'
			}
		],
		'@typescript-eslint/member-ordering': 'off',
		'@typescript-eslint/naming-convention': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-misused-new': 'warn',
		'@typescript-eslint/no-namespace': 'warn',
		'@typescript-eslint/no-parameter-properties': 'off',
		'@typescript-eslint/no-shadow': [
			'warn',
			{
				hoist: 'all'
			}
		],
		'@typescript-eslint/no-unused-expressions': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-var-requires': 'warn',
		'@typescript-eslint/prefer-for-of': 'warn',
		'@typescript-eslint/prefer-function-type': 'warn',
		'@typescript-eslint/prefer-namespace-keyword': 'warn',
		'@typescript-eslint/quotes': [
			'warn',
			'single',
		],
		'@typescript-eslint/unified-signatures': 'warn',
		'@typescript-eslint/triple-slash-reference': [
			'warn',
			{
				path: 'always',
				types: 'prefer-import',
				lib: 'always',
			}
		],
	},
	overrides: [
		{
			parser: '@typescript-eslint/parser',
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:import/typescript',
			],
			plugins: [
				'eslint-plugin-import',
				'eslint-plugin-jsdoc',
				'@typescript-eslint',
			],

			files: ['*.ts', '*.tsx', '*.js', '*.jsx'],

			rules: {},
		},
	],
};
