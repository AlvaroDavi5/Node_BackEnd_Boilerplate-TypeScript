// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	// The root directory that Jest should scan for tests and modules within
	rootDir: './',

	// A list of paths to directories that Jest should use to search for files in
	roots: [
		'<rootDir>/tests/e2e',
	],

	// The paths to modules that run some code to configure or set up the testing environment before each test
	setupFiles: [
		'dotenv/config',
		'<rootDir>/tests/e2e/support/setup.ts',
	],

	// Stop running tests after `n` failures
	// bail: 0,

	// The directory where Jest should store its cached dependency information
	// cacheDirectory: '/private/var/folders/03/rn7ssyv96ybffs82bbssjs0w0000gn/T/jest_dx',

	// Indicates whether the coverage information should be collected while executing the test
	collectCoverage: true,

	// The directory where Jest should output its coverage files
	coverageDirectory: 'coverage/e2e',

	// An array of glob patterns indicating a set of files for which coverage information should be collected
	collectCoverageFrom: [
		'src/**/*.{ts,tsx,js,jsx}'
	],

	// An array of regexp pattern strings used to skip coverage collection
	coveragePathIgnorePatterns: [
		'src/dev/',
		'src/modules/core/configs/',
		'src/modules/core/infra/cron/tasks/',
		'src/modules/core/infra/errors/',
		'src/modules/core/infra/logging/',
		'src/modules/core/infra/security/',
		'src/modules/api/decorators/',
		'src/modules/api/guards/',
		'src/modules/api/middlewares/',
		'src/modules/api/pipes/',
		'src/modules/api/schemas/',
		'src/modules/domain/',
		'src/modules/app/(.*)/operations/',
		'src/modules/app/(.*)/services/',
		'src/modules/app/(.*)/strategies/',
		'src/modules/events/queue/handlers/',
		'src/modules/events/websocket/client/',
		'src/modules/common/',
		'src/shared/',
		'.d.ts',
		'.module.ts',
		'src/main.ts',
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
	// coverageThreshold: undefined,

	// A path to a custom dependency extractor
	// dependencyExtractor: undefined,

	// Make calling deprecated APIs throw helpful error messages
	// errorOnDeprecated: false,

	// Force coverage collection from ignored files using an array of glob patterns
	// forceCoverageMatch: [],

	// A path to a module which exports an async function that is triggered once before all test suites
	globalSetup: '<rootDir>/tests/e2e/support/jestInit.ts',

	// A path to a module which exports an async function that is triggered once after all test suites
	globalTeardown: '<rootDir>/tests/e2e/support/jestFinish.ts',

	// A set of global variables that need to be available in all test environments
	// globals: {},

	// The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
	// maxWorkers: '50%',

	// An array of directory names to be searched recursively up from the requiring module's location
	moduleDirectories: [
		__dirname,
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

	// A list of paths to modules that run some code to configure or set up the testing framework before each test
	// setupFilesAfterEnv: [],

	// The number of seconds after which a test is considered as slow and reported as such in the results.
	slowTestThreshold: 2,

	// A list of paths to snapshot serializer modules Jest should use for snapshot testing
	// snapshotSerializers: [],

	// The test environment that will be used for testing
	testEnvironment: 'node',

	// Options that will be passed to the testEnvironment
	// testEnvironmentOptions: {},

	// Adds a location field to test results
	// testLocationInResults: false,

	// The glob patterns Jest uses to detect test files
	// testMatch: [
	//   '**/__tests__/**/*.[jt]s?(x)',
	//   '**/?(*.)+(spec|test).[tj]s?(x)'
	// ],

	// The regexp pattern or array of patterns that Jest uses to detect test files
	testRegex: [
		'.*\\.test\\.ts$',
		'.*\\.spec\\.ts$',
	],

	// An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
	testPathIgnorePatterns: [
		'node_modules/',
	],

	// This option sets the URL for the jsdom environment. It is reflected in properties such as location.href
	// testURL: 'http://localhost',

	// Setting this value to 'fake' allows the use of fake timers for functions such as 'setTimeout'
	// timers: 'real',

	// A map from regular expressions to paths to transformers
	transform: {
		'^.+\\.(t|j)s$': [
			'@swc/jest', // 'ts-jest'
			/*
			{
				diagnostics: false,
				tsconfig: 'tsconfig.test.json',
			},
			*/
		],
	},

	// An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
	transformIgnorePatterns: [
		'<rootDir>/node_modules/'
	],

	// An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
	// unmockedModulePathPatterns: undefined,

	// Indicates whether each individual test should be reported during the run
	verbose: undefined,

	// An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
	// watchPathIgnorePatterns: [],

	// Whether to use watchman for file crawling
	// watchman: true,
};
