import dotenv from 'dotenv';


// dotenv.config({ path: (process.cwd() + '/envs/.env.development.local') });
dotenv.config();

export interface ConfigsInterface {
	// ! Application Service
	application: {
		name: string | undefined, // app name
		environment: string | undefined, // app env
		port: string | undefined, // app port
		url: string | undefined, // app url
		socketEnv: string | undefined, // enable websocket
		stackErrorVisible: string | undefined, // enable app error stack
		logsPath: string | undefined, // logs file path
		logging: string | undefined, // enable third-party and backing services logging
	},
	// ? DataBase Backing-Service
	database: {
		database: string | undefined, // database name
		username: string | undefined, // database username
		password: string | undefined, // database password
		host: string | undefined, // database host
		port: string | undefined, // database port
		dialect: string | undefined, // database DBMS
		dialectOptions?: {
			ssl?: {
				rejectUnauthorized?: boolean, // to use SSL protocol (in production)
			}
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
			uri: string | undefined, // connection URI
			maxConnecting: number, // maximum number of connections concurrently the pool
			maxPoolSize: number, // maximum number of connections in pool
		},
		databases: {
			datalake: {
				name: string | undefined,
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
			port: string | undefined, // cache port
			host: string | undefined, // cache host
		},
		expirationTime: {
			subscriptions: number // 12h
		},
	},
	// ? Third-Party Services
	integration: {
		aws: {
			credentials: {
				region: string | undefined, // service region
				accessKeyId: string | undefined,
				secretAccessKey: string | undefined,
				sessionToken: string | undefined,
				apiVersion: string | undefined,
			},
			// * Authentication Service
			congito: {
				userPoolName: string | undefined,
				userPoolId: string | undefined,
				clientName: string | undefined,
				clientId: string | undefined,
				endpoint: string | undefined,
				apiVersion: string | undefined,
			},
			// * Message Queues Service
			sqs: {
				eventsQueue: {
					queueName: string | undefined,
					queueUrl: string | undefined,
				},
				endpoint: string | undefined,
				apiVersion: string | undefined,
			},
			// * Notification Topics Service
			sns: {
				defaultTopic: {
					topicName: string | undefined,
					topicArn: string | undefined,
					topicProtocol: string | undefined,
				},
				endpoint: string | undefined,
				apiVersion: string | undefined,
			},
			// * Storage Service
			s3: {
				bucketName: string | undefined,
				bucketUrl: string | undefined,
				endpoint: string | undefined,
				apiVersion: string | undefined,
			}
		},
		rest: {
			// * Another Service
			mockedService: {
				serviceName: string | undefined,
				baseUrl: string | undefined,
			},
		},
	},
	// ? Cryptography and Security
	security: {
		secretKey: string | undefined,
	}
}

export default (): ConfigsInterface => ({
	application: {
		name: process.env.APP_NAME,
		environment: process.env.NODE_ENV,
		port: process.env.APP_PORT,
		url: process.env.APP_URL,
		socketEnv: process.env.SOCKET_ENV,
		stackErrorVisible: process.env.SHOW_ERROR_STACK,
		logsPath: process.env.APP_LOGS_PATH,
		logging: process.env.SHOW_LOGS,
	},
	database: {
		database: process.env.DB_NAME,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		host: process.env.DB_HOST,
		charset: 'utf8',
		dialect: process.env.DB_DBMS_NAME,
		dialectOptions: {
			ssl: {
				rejectUnauthorized: false,
			}
		},
		port: process.env.DB_PORT,
		define: {
			underscored: false,
			timestamps: true,
			paranoid: true,
			freezeTableName: false,
		},
		pool: {
			min: 0,
			max: 5,
			acquire: 20000,
			idle: 20000,
		},
	},
	data: {
		mongo: {
			uri: process.env.MONGO_URI,
			maxConnecting: 2,
			maxPoolSize: 5,
		},
		databases: {
			datalake: {
				name: process.env.MONGO_DB_NAME_DATALAKE,
				collections: {
					subscriptions: 'subscriptions',
					unprocessedMessages: 'unprocessedMessages',
				},
			},
		},
	},
	cache: {
		redis: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
		},
		expirationTime: {
			subscriptions: 43200,
		},
	},
	integration: {
		aws: {
			credentials: {
				region: process.env.AWS_REGION,
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				sessionToken: process.env.AWS_SESSION_TOKEN,
				apiVersion: process.env.AWS_API_VERSION,
			},
			congito: {
				userPoolName: process.env.AWS_COGNITO_USER_POOL_NAME,
				userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
				clientName: process.env.AWS_COGNITO_USER_POOL_CLIENT_NAME,
				clientId: process.env.AWS_COGNITO_USER_POOL_CLIENT_ID,
				endpoint: process.env.AWS_ENDPOINT_URL,
				apiVersion: process.env.AWS_API_VERSION,
			},
			sqs: {
				eventsQueue: {
					queueName: process.env.AWS_SQS_EVENTS_QUEUE_NAME,
					queueUrl: process.env.AWS_SQS_EVENTS_QUEUE_URL,
				},
				endpoint: process.env.AWS_ENDPOINT_URL,
				apiVersion: process.env.AWS_API_VERSION,
			},
			sns: {
				defaultTopic: {
					topicName: process.env.AWS_SNS_DEFAULT_TOPIC_NAME,
					topicArn: process.env.AWS_SNS_DEFAULT_TOPIC_ARN,
					topicProtocol: process.env.AWS_TOPIC_PROTOCOL,
				},
				endpoint: process.env.AWS_ENDPOINT_URL,
				apiVersion: process.env.AWS_API_VERSION,
			},
			s3: {
				bucketName: process.env.AWS_S3_BUCKET_NAME,
				bucketUrl: process.env.LOCALSTACK_URL,
				endpoint: process.env.AWS_ENDPOINT_URL,
				apiVersion: process.env.AWS_API_VERSION,
			}
		},
		rest: {
			mockedService: {
				serviceName: process.env.MOCKED_SERVICE_NAME,
				baseUrl: process.env.MOCKED_SERVICE_URL,
			}
		},
	},
	security: {
		secretKey: process.env.SECRET,
	},
});
