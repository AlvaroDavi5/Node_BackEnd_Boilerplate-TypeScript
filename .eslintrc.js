module.exports = {
	env: {
		'es6': true,
		'node': true,
	},
	extends: [
		'standard',
		'prettier',
	],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: ['prettier'],
	rules: {
		semi: ['error', 'always'],
		indent: ['error', 'tab'],
		'comma-spacing': ['error', { before: false, after: true }],
		quotes: ['error', 'single'],
		'object-curly-spacing': [
			1,
			'always',
		],
		'no-undef': 'off',
		'one-var': 'off',
		camelcase: 'off',
	},
	overrides: [
		{
			parser: '@typescript-eslint/parser',
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:import/typescript',
			],
			plugins: ['@typescript-eslint'],

			files: ['*.ts', '*.tsx'],

			rules: {},
		},
	],
};
