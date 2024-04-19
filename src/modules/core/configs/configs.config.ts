import dotenv from 'dotenv';


// dotenv.config({ path: (process.cwd() + '/envs/.env.development.local') });
dotenv.config();

export interface ConfigsInterface {
	// ? Application Service
	application: {
		name: string, // app name
		environment: string, // app env
		appPort: number, // app port
		nestDevToolsPort: number, // dev tools port
		url: string, // app url
		socketEnv: string, // enable websocket
		stackErrorVisible: string, // enable app error stack
		logsPath: string, // logs file path
		logging: string, // enable third-party and backing services logging
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
		define: {
			underscored: boolean, // to force underscore on name of fields
			timestamps: boolean, // to createdAt and updatedAt
			paranoid: boolean, // to deletedAt
			freezeTableName: boolean, // to set table names on plural
		},
		pool: {
			min: number, // minimum number of connections in pool
			max: number, // maximum number of connections in pool
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
				apiVersion: string,
			},
			// * Authentication Service
			congito: {
				userPoolName: string,
				userPoolId: string,
				clientName: string,
				clientId: string,
				endpoint: string,
				apiVersion: string,
			},
			// * Message Queues Service
			sqs: {
				eventsQueue: {
					queueName: string,
					queueUrl: string,
				},
				endpoint: string,
				apiVersion: string,
			},
			// * Notification Topics Service
			sns: {
				defaultTopic: {
					topicName: string,
					topicArn: string,
					topicProtocol: string,
				},
				endpoint: string,
				apiVersion: string,
			},
			// * Storage Service
			s3: {
				bucketName: string,
				endpoint: string,
				filesExpiration: number, // files expiration in seconds
				apiVersion: string,
			},
		},
		rest: {
			// * Another Service
			mockedService: {
				serviceName: string,
				baseUrl: string,
				port: string,
			},
		},
	},
	// ? Cryptography and Security
	security: {
		secretKey: string,
	},
}

export default (): ConfigsInterface => ({
	application: {
		name: process.env.APP_NAME ?? 'Node Boilerplate',
		environment: process.env.NODE_ENV ?? 'dev',
		appPort: parseInt(process.env.APP_PORT ?? '3000'),
		nestDevToolsPort: parseInt(process.env.NESTDEV_PORT ?? '8000'),
		url: process.env.APP_URL ?? 'http://localhost:3000/',
		socketEnv: process.env.SOCKET_ENV ?? 'enabled',
		stackErrorVisible: process.env.SHOW_ERROR_STACK ?? 'true',
		logsPath: process.env.APP_LOGS_PATH ?? './logs/logs.log',
		logging: process.env.SHOW_LOGS ?? 'false',
	},
	database: {
		database: process.env.DB_NAME ?? 'db_postgres',
		username: process.env.DB_USERNAME ?? 'postgres',
		password: process.env.DB_PASSWORD ?? 'pass',
		host: process.env.DB_HOST ?? 'database',
		charset: 'utf8',
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
			acquire: (2 * 1000),
			idle: (2 * 1000),
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
			subscriptions: (12 * 60 * 60),
			hooks: (5 * 60),
		},
	},
	integration: {
		aws: {
			credentials: {
				region: process.env.AWS_REGION ?? 'us-east-1',
				accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'mock',
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'mock',
				sessionToken: process.env.AWS_SESSION_TOKEN ?? 'mock',
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
			},
			congito: {
				userPoolName: process.env.AWS_COGNITO_USER_POOL_NAME ?? 'defaultPool',
				userPoolId: process.env.AWS_COGNITO_USER_POOL_ID ?? 'xxx',
				clientName: process.env.AWS_COGNITO_USER_POOL_CLIENT_NAME ?? 'defaultClient',
				clientId: process.env.AWS_COGNITO_USER_POOL_CLIENT_ID ?? 'xxx',
				endpoint: process.env.AWS_ENDPOINT_URL ?? 'http://Cloud_LocalStack:4566/',
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
			},
			sqs: {
				eventsQueue: {
					queueName: process.env.AWS_SQS_EVENTS_QUEUE_NAME ?? 'eventsQueue.fifo',
					queueUrl: process.env.AWS_SQS_EVENTS_QUEUE_URL ?? 'http://sqs.us-east-1.Cloud_LocalStack.localstack.cloud:4566/000000000000/eventsQueue.fifo',
				},
				endpoint: process.env.AWS_ENDPOINT_URL ?? 'http://Cloud_LocalStack:4566/',
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
			},
			sns: {
				defaultTopic: {
					topicName: process.env.AWS_SNS_DEFAULT_TOPIC_NAME ?? 'defaultTopic',
					topicArn: process.env.AWS_SNS_DEFAULT_TOPIC_ARN ?? 'arn:aws:sns:us-east-1:000000000000:defaultTopic',
					topicProtocol: process.env.AWS_TOPIC_PROTOCOL ?? 'email',
				},
				endpoint: process.env.AWS_ENDPOINT_URL ?? 'http://Cloud_LocalStack:4566/',
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
			},
			s3: {
				bucketName: process.env.AWS_S3_BUCKET_NAME ?? 'defaultbucket',
				filesExpiration: (5 * 60),
				endpoint: process.env.AWS_ENDPOINT_URL ?? 'http://Cloud_LocalStack:4566/',
				apiVersion: process.env.AWS_API_VERSION ?? 'latest',
			},
		},
		rest: {
			mockedService: {
				serviceName: process.env.MOCKED_SERVICE_NAME ?? 'Mocked Service',
				baseUrl: process.env.MOCKED_SERVICE_URL ?? 'http://localhost:4000/',
				port: process.env.MOCKED_SERVERS_APP_PORT ?? '4000',
			},
		},
	},
	security: {
		secretKey: process.env.SECRET ?? 'pass_phrase',
	},
});
