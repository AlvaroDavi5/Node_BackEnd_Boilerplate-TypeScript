import type { Config } from 'jest';

const config: Config = {
	// The root directory that Jest should scan for tests and modules within
	rootDir: '../',

	// A list of paths to directories that Jest should use to search for files in
	roots: [
		'<rootDir>/tests/unit',
	],

	// The paths to modules that run some code to configure or set up the testing environment before each test
	setupFiles: [
		'dotenv/config',
		'<rootDir>/tests/unit/support/setup.ts',
	],

	// Stop running tests after `n` failures
	// bail: 0,

	// The directory where Jest should store its cached dependency information
	// cacheDirectory: '/private/var/folders/03/rn7ssyv96ybffs82bbssjs0w0000gn/T/jest_dx',

	// Indicates whether the coverage information should be collected while executing the test
	collectCoverage: false,

	// The directory where Jest should output its coverage files
	coverageDirectory: 'coverage/unit',

	// An array of glob patterns indicating a set of files for which coverage information should be collected
	collectCoverageFrom: [
		'src/**/*.{ts,tsx,js,jsx}'
	],

	// An array of regexp pattern strings used to skip coverage collection
	coveragePathIgnorePatterns: [
		'.d.ts',
		'src/dev/',
		'src/shared/',
		'.module.ts',
		'src/main.ts',
		'src/modules/api/',
		'src/modules/app/(.*)/api/',
		'src/modules/app/(.*)/services/',
		'src/modules/app/(.*)/repositories/',
		'src/modules/common/classes/',
		'src/modules/core/configs/',
		'src/modules/core/cron/',
		'src/modules/core/infra/',
		'src/modules/core/logging/',
		'src/modules/core/start/',
		'src/modules/events/',
		'src/modules/graphql/',
	],

	// Indicates which provider should be used to instrument code for coverage
	coverageProvider: 'babel',

	// A list of reporter names that Jest uses when writing coverage reports
	coverageReporters: [
		'json',
		'text',
		'lcov',
		'clover'
	],

	// An object that configures minimum threshold enforcement for coverage results
	coverageThreshold: {
		global: {
			statements: 90,
			branches: 80,
			functions: 80,
			lines: 70
		}
	},

	// A path to a custom dependency extractor
	// dependencyExtractor: undefined,

	// Make calling deprecated APIs throw helpful error messages
	// errorOnDeprecated: false,

	// Force coverage collection from ignored files using an array of glob patterns
	// forceCoverageMatch: [],

	// A path to a module which exports an async function that is triggered once before all test suites
	// globalSetup: undefined,

	// A path to a module which exports an async function that is triggered once after all test suites
	// globalTeardown: undefined,

	// A set of global variables that need to be available in all test environments
	// globals: {},

	// The maximum amount of workers used to run your tests. Can be specified as % or a number.
	// E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
	// maxWorkers: '50%',

	// An array of directory names to be searched recursively up from the requiring module's location
	moduleDirectories: [
		'node_modules',
		'src',
	],

	// An array of file extensions your modules use
	moduleFileExtensions: [
		'ts',
		'tsx',
		'js',
		'jsx',
		'json',
	],

	// A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
	moduleNameMapper: {
		'~/(.*)': '<rootDir>/$1',
		'@dev/(.*)': '<rootDir>/src/dev/$1',
		'@core/(.*)': '<rootDir>/src/modules/core/$1',
		'@common/(.*)': '<rootDir>/src/modules/common/$1',
		'@domain/(.*)': '<rootDir>/src/modules/domain/$1',
		'@app/(.*)': '<rootDir>/src/modules/app/$1',
		'@api/(.*)': '<rootDir>/src/modules/api/$1',
		'@graphql/(.*)': '<rootDir>/src/modules/graphql/$1',
		'@events/(.*)': '<rootDir>/src/modules/events/$1',
		'@shared/(.*)': '<rootDir>/src/shared/$1',
	},

	// An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
	// modulePathIgnorePatterns: [],

	// Automatically clear mock calls and instances between every test
	clearMocks: true,

	// Automatically reset mock state between every test
	resetMocks: false,

	// Reset the module registry before running each individual test
	resetModules: false,

	// Automatically restore mock state between every test
	restoreMocks: true,

	// All imported modules in your tests should be mocked automatically
	automock: false,

	// Activates notifications for test results
	// notify: true,

	// An enum that specifies notification mode. Requires { notify: true }
	// notifyMode: 'failure-change',

	// Allows you to use a custom runner instead of Jest's default test runner
	// runner: 'jest-runner',

	// This option allows use of a custom test runner
	// testRunner: 'jasmine2',

	// This option allows the use of a custom results processor
	testResultsProcessor: 'jest-sonar-reporter',

	// A preset that is used as a base for Jest's configuration
	preset: 'ts-jest',

	// Run tests from one or more projects
	// projects: undefined,

	// Use this configuration option to add custom reporters to Jest
	reporters: undefined,

	// A path to a custom resolver
	// resolver: undefined,
	slowTestThreshold: 2,
	testEnvironment: 'node',
	testRegex: [
		'.*\\.test\\.ts$',
		'.*\\.spec\\.ts$',
	],
	testPathIgnorePatterns: [
		'node_modules/',
	],
	transform: {
		'^.+\\.(t|j)s$': '@swc/jest',
	},
	transformIgnorePatterns: [
		'<rootDir>/node_modules/'
	],
	verbose: undefined,
};

export default config;
