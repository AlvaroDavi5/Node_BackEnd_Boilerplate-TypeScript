/* eslint-disable import/no-extraneous-dependencies */
import globals from 'globals';
import { Linter, ESLint } from 'eslint';
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import security from 'eslint-plugin-security';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import typescriptParser from '@typescript-eslint/parser';
import typescript from '@typescript-eslint/eslint-plugin';
/* eslint-enable import/no-extraneous-dependencies */


// ? Base configuration for all files
const defaultConfigs: Linter.Config = {
	name: 'DefaultConfigs',
	basePath: '.',
	files: ['**/*.{js,ts}'],
	ignores: [
		'node_modules',
		'build',
		'coverage',
		'.scannerwork',
	],
	languageOptions: {
		ecmaVersion: 2024,
		sourceType: 'module',
		parser: typescriptParser,
		globals: {
			...globals.node,
			...globals.es2024,
			...globals.jest,
			...globals.browser,
		},
	},
	linterOptions: {},
	plugins: {
		'@typescript-eslint': typescript as unknown as ESLint.Plugin,
		prettier,
		import: importPlugin,
		security,
		jsdoc,
	},
	settings: {
		'import/resolver': {
			node: {
				paths: ['src'],
			},
		},
	},
	rules: {
		...js.configs.recommended.rules,
		indent: [
			'error',
			'tab',
			{
				SwitchCase: 1,
				ignoredNodes: [
					'PropertyDefinition'
				]
			}
		],
		quotes: [
			'error',
			'single'
		],
		'jsx-quotes': [
			'error',
			'prefer-single'
		],
		'comma-dangle': 'off',
		'comma-style': [
			'error',
			'last'
		],
		semi: [
			'error',
			'always'
		],
		'semi-style': [
			'error',
			'last'
		],
		'max-len': [
			'warn',
			160
		],
		'eol-last': 'error',
		'no-multiple-empty-lines': [
			'error',
			{
				max: 2,
				maxEOF: 1,
				maxBOF: 1
			}
		],
		'operator-linebreak': [
			'error',
			'none',
			{
				overrides: {
					'?': 'before',
					':': 'before',
					'&&': 'before',
					'||': 'before'
				}
			}
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		camelcase: 'warn',
		'no-underscore-dangle': 'off',
		'no-trailing-spaces': 'error',
		'block-spacing': [
			'error',
			'always'
		],
		'comma-spacing': [
			'error',
			{
				before: false,
				after: true
			}
		],
		'semi-spacing': 'error',
		'array-bracket-spacing': [
			'error',
			'never'
		],
		'switch-colon-spacing': [
			'error',
			{
				after: true,
				before: false
			}
		],
		'object-curly-spacing': [
			'error',
			'always'
		],
		'template-curly-spacing': [
			'error',
			'never'
		],
		'template-tag-spacing': [
			'error',
			'never'
		],
		'keyword-spacing': [
			'error',
			{
				before: true,
				after: true
			}
		],
		'key-spacing': [
			'error',
			{
				beforeColon: false,
				afterColon: true,
				mode: 'strict'
			}
		],
		'rest-spread-spacing': [
			'error',
			'never'
		],
		'func-call-spacing': 'off',
		'yield-star-spacing': [
			'error',
			{
				before: false,
				after: true
			}
		],
		'computed-property-spacing': 'error',
		'space-in-parens': [
			'error',
			'never'
		],
		'space-unary-ops': [
			'error',
			{
				words: true,
				nonwords: false
			}
		],
		'space-infix-ops': [
			'error'
		],
		'space-before-blocks': [
			'error',
			{
				functions: 'always',
				keywords: 'always',
				classes: 'always'
			}
		],
		'space-before-function-paren': [
			'error',
			{
				named: 'never',
				anonymous: 'always',
				asyncArrow: 'always'
			}
		],
		'max-classes-per-file': [
			'error',
			1
		],
		complexity: 'error',
		eqeqeq: [
			'error',
			'always'
		],
		'wrap-regex': [
			'error'
		],
		'wrap-iife': [
			'error',
			'inside',
			{
				functionPrototypeMethods: true
			}
		],
		'no-compare-neg-zero': 'error',
		'constructor-super': 'error',
		'no-array-constructor': 'warn',
		'no-useless-constructor': 'off',
		'no-invalid-this': 'error',
		'no-new-wrappers': 'error',
		'no-throw-literal': 'error',
		'no-fallthrough': 'error',
		'no-unsafe-finally': 'error',
		'guard-for-in': 'error',
		'default-case': 'error',
		'default-case-last': 'error',
		'no-case-declarations': 'error',
		'default-param-last': 'error',
		curly: 'off',
		'brace-style': 'error',
		'object-shorthand': 'warn',
		'new-parens': 'error',
		'arrow-parens': 'error',
		'arrow-body-style': 'off',
		'id-denylist': [
			'error',
			'e',
			'a',
			'b',
			'cb'
		],
		'id-match': 'error',
		'no-bitwise': 'error',
		'no-caller': 'warn',
		radix: 'warn',
		'valid-typeof': 'error',
		'one-var': 'off',
		'prefer-const': 'warn',
		'prefer-template': 'error',
		'prefer-destructuring': 'error',
		'prefer-spread': 'error',
		'prefer-rest-params': 'error',
		yoda: [
			'error',
			'never',
			{
				exceptRange: true,
				onlyEquality: false
			}
		],
		'no-cond-assign': 'error',
		'no-constant-condition': 'error',
		'no-undef': 'off',
		'no-undef-init': 'warn',
		'no-return-assign': [
			'error',
			'always'
		],
		'no-empty': 'error',
		'no-template-curly-in-string': 'warn',
		'for-direction': 'error',
		'implicit-arrow-linebreak': 'warn',
		'function-call-argument-newline': 'off',
		'lines-around-directive': [
			'error',
			'always'
		],
		'dot-location': [
			'error',
			'property'
		],
		'dot-notation': [
			'error',
			{
				allowKeywords: true,
				allowPattern: 'throws'
			}
		],
		'quote-props': [
			'error',
			'as-needed',
			{
				keywords: false
			}
		],
		'no-extra-boolean-cast': 'off',
		'no-extra-parens': 'warn',
		'no-unused-vars': 'off',
		'no-redeclare': 'error',
		'use-isnan': 'warn',
		'no-eval': 'error',
		'no-var': 'error',
		'no-labels': 'error',
		'no-unused-labels': 'error',
		'no-debugger': 'error',
		'no-console': 'error',
		'unicode-bom': [
			'error',
			'never'
		],
		'spaced-comment': [
			'warn',
			'always',
			{
				line: {
					markers: [
						'/'
					],
					exceptions: [
						'_',
						'-',
						'+',
						'*'
					]
				},
				block: {
					markers: [
						'!'
					],
					exceptions: [
						'*'
					],
					balanced: true
				}
			}
		]
	},
},

	advancedConfigs: Linter.Config = {
		name: 'AdvancedConfigs',
		files: ['**/*.{js,ts}'],
		plugins: {
			'@typescript-eslint': typescript as unknown as ESLint.Plugin,
			import: importPlugin,
			security,
			jsdoc,
		},
		rules: {
			'security/detect-possible-timing-attacks': 'error',
			'security/detect-object-injection': 'error',
			'security/detect-non-literal-fs-filename': 'warn',
			'security/detect-non-literal-regexp': 'warn',
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
						'object',
						'type'
					],
					'newlines-between': 'never',
					distinctGroup: true,
					pathGroups: [
						{
							pattern: '@core/**',
							group: 'internal',
							position: 'before'
						},
						{
							pattern: '@domain/**',
							group: 'internal',
							position: 'before'
						},
						{
							pattern: '@app/**',
							group: 'internal',
							position: 'before'
						},
						{
							pattern: '@api/**',
							group: 'internal',
							position: 'before'
						},
						{
							pattern: '@graphql/**',
							group: 'internal',
							position: 'before'
						},
						{
							pattern: '@events/**',
							group: 'internal',
							position: 'before'
						},
						{
							pattern: '@common/**',
							group: 'internal',
							position: 'before'
						},
						{
							pattern: '@dev/**',
							group: 'internal',
							position: 'before'
						},
						{
							pattern: '@shared/**',
							group: 'internal',
							position: 'after'
						},
						{
							pattern: 'tests/**',
							group: 'internal',
							position: 'before'
						}
					],
					pathGroupsExcludedImportTypes: [],
					alphabetize: {
						order: 'ignore',
						caseInsensitive: true
					}
				}
			],
			'import/default': 'error',
			'import/unambiguous': 'error',
			'import/no-extraneous-dependencies': [
				'error',
				{
					devDependencies: [
						'src/dev/**',
						'scripts/**',
						'tests/**'
					],
					peerDependencies: true,
					optionalDependencies: false,
					bundledDependencies: false
				}
			],
			'@typescript-eslint/ban-ts-comment': 'error',
			'@typescript-eslint/no-restricted-types': [
				'error',
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
					}
				}
			],
			'@typescript-eslint/array-type': 'error',
			'@typescript-eslint/consistent-type-assertions': 'error',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-empty-function': 'error',
			'@typescript-eslint/no-empty-interface': 'error',
			'@typescript-eslint/no-use-before-define': 'error',
			'@typescript-eslint/no-unused-expressions': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-var-requires': 'error',
			'@typescript-eslint/no-misused-new': 'error',
			'@typescript-eslint/no-namespace': 'error',
			'@typescript-eslint/prefer-namespace-keyword': 'error',
			'@typescript-eslint/prefer-function-type': 'error',
			'@typescript-eslint/prefer-for-of': 'error',
			'@typescript-eslint/unified-signatures': 'error',
			'@typescript-eslint/adjacent-overload-signatures': 'error',
			'@typescript-eslint/member-ordering': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-parameter-properties': 'off',
			'@typescript-eslint/no-shadow': [
				'error',
				{
					hoist: 'all'
				}
			],
			'@typescript-eslint/triple-slash-reference': [
				'error',
				{
					path: 'always',
					types: 'prefer-import',
					lib: 'always'
				}
			],
			'@typescript-eslint/explicit-member-accessibility': [
				'off',
				{
					accessibility: 'explicit'
				}
			]
		},
	},

	// ? Override for development, scripts, and test files
	developmentOverrideConfigs: Linter.Config = {
		files: ['src/dev/**', 'scripts/**', 'tests/**'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},

	// * $schema: 'https://json.schemastore.org/eslintrc',
	configs: Linter.Config[] = [
		defaultConfigs,
		advancedConfigs,
		developmentOverrideConfigs,
	];

export default configs;
