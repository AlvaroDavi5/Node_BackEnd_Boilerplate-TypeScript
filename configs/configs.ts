import staticConfigs from './staticConfigs.json';
import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: __dirname + "/../.env.development.local" });
dotenv.config();


export interface ConfigsInterface {
	// ! Application Service
	application: {
		name: string, // app name
		environment: string, // app env
		port: string, // app port
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
		dialect: string, // one of 'mysql' | 'mariadb' | 'postgres' | 'mssql'
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
	// ? Caching Backing-Service
	cache: {
		redis: {
			port: string, // cache port
			host: string, // cache host
		},
		expirationTime: {
			connections: number // 1 day
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
				messageDeduplicationId: string,
				messageGroupId: string,
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
				defaultQueue: {
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
				bucketUrl: string,
				endpoint: string,
				apiVersion: string,
			}
		},
		rest: {
			// * Another Service
			mockedService: {
				serviceName: string,
				baseUrl: string,
			},
		},
	},
	// ? Cryptography and Security
	security: {
		cryptoAlgorithm: string, // cryptography algorithm
		secretKey: string, // JWT secret key
	}
}

function convert(config: object | any): ConfigsInterface {
	const result: any = {};

	Object.keys(config).forEach(name => {
		let value = config[name];

		// if is a object
		if (typeof (value) === 'object' && value !== null) {
			value = convert(value); // recursion
		}

		// if is a environment variable key
		if (typeof (value) === 'string' && value.indexOf('$') > -1) {
			const key = value.replace(/\$/g, '');

			if (process.env[key]) {
				value = process.env[key]; // string
			}
			else {
				value = undefined;
			}
		}

		result[name] = value; // fixed value
	});

	return result;
}

export default convert(staticConfigs);
