import dotenv from 'dotenv';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { daysToSeconds, hoursToSeconds, minutesToSeconds, secondsToMilliseconds } from '@common/utils/dates.util';


// dotenv.config({ path: (process.cwd() + '/envs/.env.development') });
dotenv.config();

export interface ConfigsInterface {
	// ? Application Service
	application: {
		name: string, // app name
		environment: string, // app env
		appPort: number, // app port
		nestDevToolsPort: number, // dev tools port
		sentryDsn: string, // error tracker DSN
		url: string, // app url
		socketEnv: boolean, // enable websocket
		showDetailedLogs: boolean, // enable app error stack and debug levels logging
		showExternalLogs: boolean, // enable third-party and backing services logging
		logsPath: string, // logs file path
	},
	// ? DataBase Backing-Service
	database: {
		database: string, // database name
		username: string, // database username
		password: string, // database password
		host: string, // database host
		port: string, // database port
		dialect: string, // database DBMS
		dialectOptions?: {
			ssl?: {
				rejectUnauthorized?: boolean, // to use SSL protocol (in production)
			},
		},
		charset: string, // database charset encoding
		timezone: string, // database timezone
		define: {
			underscored: boolean, // to force underscore on name of fields
			timestamps: boolean, // to createdAt and updatedAt
			paranoid: boolean, // to deletedAt
			freezeTableName: boolean, // to set table names on plural
		},
		pool: {
			min: number, // minimum number of connections in pool
			max: number, // maximum number of connections in pool
			fifo: boolean, // the oldest resources will be first to be allocated (First-In-First-Out)
			acquire: number, // maximum time, in milliseconds, that pool will try to get connection before throwing error
			idle: number, // maximum time, in milliseconds, that a connection can be idle before being released
		},
	},
	// ? Data Backing-Service
	data: {
		mongo: {
			uri: string, // connection URI
			maxConnecting: number, // maximum number of connections concurrently the pool
			maxPoolSize: number, // maximum number of connections in pool
		},
		databases: {
			datalake: {
				name: string,
				collections: {
					subscriptions: string,
					unprocessedMessages: string,
				},
			},
		},
	},
	// ? Caching Backing-Service
	cache: {
		redis: {
			port: string, // cache port
			host: string, // cache host
		},
		expirationTime: {
			subscriptions: number, // expiration in seconds
			hooks: number,
		},
	},
	// ? Third-Party Services
	integration: {
		aws: {
			credentials: {
				region: string, // service region
				accessKeyId: string,
				secretAccessKey: string,
				sessionToken: string,
				endpoint?: string,
			},
			// * Authentication Service
			congito: {
				userPoolName: string,
				userPoolId: string,
				clientName: string,
				clientId: string,
				apiVersion: string,
				maxAttempts: number,
			},
			// * Message Queues Service
			sqs: {
				eventsQueue: {
					queueName: string,
					queueUrl: string,
				},
				apiVersion: string,
				maxAttempts: number,
			},
			// * Notification Topics Service
			sns: {
				defaultTopic: {
					topicName: string,
					topicArn: string,
					topicProtocol: string,
				},
				apiVersion: string,
				maxAttempts: number,
			},
			// * Storage Service
			s3: {
				bucketName: string,
				filesExpiration: number, // files expiration in seconds
				apiVersion: string,
				maxAttempts: number,
			},
		},
		rest: {
			// * Another Service
			mockedService: {
				serviceName: string,
				baseUrl: string,
				timeout: number, // request timeout in milliseconds
				maxRedirects: number, // maximum redirections
				maxRetries: number, // maximum retries
			},
		},
	},
	// ? Cryptography and Security
	security: {
		secretKey: string,
	},
	// ? NPM Package
	package: {
		name?: string,
		description?: string,
		version?: string,
		license?: string,
		author?: string,
		repository?: string,
		private?: boolean,
		engines?: {
			node?: string,
			npm?: string,
			yarn?: string,
		},
	},
}

// eslint-disable-next-line complexity
export default (): ConfigsInterface => ({
	application: {
		name: process.env.APP_NAME ?? 'Node Boilerplate',
		environment: process.env.NODE_ENV ?? 'dev',
		appPort: parseInt(process.env.APP_PORT ?? '3000', 10),
		nestDevToolsPort: parseInt(process.env.NESTDEV_PORT ?? '8000', 10),
		sentryDsn: process.env.SENTRY_DSN ?? '',
		url: process.env.APP_URL ?? 'http://localhost:3000/',
		socketEnv: process.env.SOCKET_ENV === 'enabled',
		showDetailedLogs: process.env.SHOW_DETAILED_LOGS === 'true',
		showExternalLogs: process.env.SHOW_EXTERNAL_LOGS === 'true',
		logsPath: process.env.APP_LOGS_PATH ?? './logs/logs.log',
	},
	database: {
		database: process.env.DB_NAME ?? 'db_postgres',
		username: process.env.DB_USERNAME ?? 'postgres',
		password: process.env.DB_PASSWORD ?? 'pass',
		host: process.env.DB_HOST ?? 'database',
		charset: 'utf8',
		timezone: TimeZonesEnum.America_SaoPaulo,
		dialect: process.env.DB_DBMS_NAME ?? 'postgres',
		dialectOptions: {
			ssl: {
				rejectUnauthorized: false,
			},
		},
		port: process.env.DB_PORT ?? '5432',
		define: {
			underscored: false,
			timestamps: true,
			paranoid: true,
			freezeTableName: false,
		},
		pool: {
			min: 0,
			max: 5,
			fifo: true,
			acquire: secondsToMilliseconds(2),
			idle: secondsToMilliseconds(2),
		},
	},
	data: {
		mongo: {
			uri: process.env.MONGO_URI ?? 'mongodb://admin:pass@data:27017/?authSource=admin',
			maxConnecting: 2,
			maxPoolSize: 5,
		},
		databases: {
			datalake: {
				name: process.env.MONGO_DB_NAME_DATALAKE ?? 'datalake',
				collections: {
					subscriptions: 'subscriptions',
					unprocessedMessages: 'unprocessedMessages',
				},
			},
		},
	},
	cache: {
		redis: {
			host: process.env.REDIS_HOST ?? 'cache',
			port: process.env.REDIS_PORT ?? '6379',
		},
		expirationTime: {
			subscriptions: hoursToSeconds(12),
			hooks: daysToSeconds(1),
		},
	},
	integration: {
		aws: {
			credentials: {
				region: process.env.AWS_REGION ?? 'us-east-1',
				accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'mock',
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'mock',
				sessionToken: process.env.AWS_SESSION_TOKEN ?? 'mock',
				endpoint: process.env.AWS_ENDPOINT_URL,
			},
			congito: {
				userPoolName: process.env.AWS_COGNITO_USER_POOL_NAME ?? 'defaultPool',
				userPoolId: process.env.AWS_COGNITO_USER_POOL_ID ?? 'xxx',
				clientName: process.env.AWS_COGNITO_USER_POOL_CLIENT_NAME ?? 'defaultClient',
				clientId: process.env.AWS_COGNITO_USER_POOL_CLIENT_ID ?? 'xxx',
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
				maxAttempts: 3,
			},
			sqs: {
				eventsQueue: {
					queueName: process.env.AWS_SQS_EVENTS_QUEUE_NAME ?? 'eventsQueue.fifo',
					queueUrl: process.env.AWS_SQS_EVENTS_QUEUE_URL ?? 'http://sqs.us-east-1.Cloud_LocalStack.localstack.cloud:4566/0000/eventsQueue.fifo',
				},
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
				maxAttempts: 2,
			},
			sns: {
				defaultTopic: {
					topicName: process.env.AWS_SNS_DEFAULT_TOPIC_NAME ?? 'defaultTopic',
					topicArn: process.env.AWS_SNS_DEFAULT_TOPIC_ARN ?? 'arn:aws:sns:us-east-1:000000000000:defaultTopic',
					topicProtocol: process.env.AWS_TOPIC_PROTOCOL ?? 'email',
				},
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
				maxAttempts: 2,
			},
			s3: {
				bucketName: process.env.AWS_S3_BUCKET_NAME ?? 'defaultbucket',
				filesExpiration: minutesToSeconds(5),
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
				maxAttempts: 3,
			},
		},
		rest: {
			mockedService: {
				serviceName: process.env.MOCKED_SERVICE_NAME ?? 'Mocked Service',
				baseUrl: process.env.MOCKED_SERVICE_URL ?? 'http://localhost:4000/',
				timeout: secondsToMilliseconds(30),
				maxRedirects: 2,
				maxRetries: 3,
			},
		},
	},
	security: {
		secretKey: process.env.SECRET ?? 'pass_phrase',
	},
	// ? NPM Package
	package: {
		name: process.env.npm_package_name,
		description: process.env.npm_package_description,
		version: process.env.npm_package_version,
		license: process.env.npm_package_license,
		author: `${process.env.npm_package_author_name} - ${process.env.npm_package_author_email}`,
		repository: process.env.npm_package_repository_url,
		private: process.env.npm_package_private === 'true',
		engines: {
			node: process.env.npm_package_engines_node,
			npm: process.env.npm_package_engines_npm,
			yarn: process.env.npm_package_engines_yarn,
		},
	},
});
