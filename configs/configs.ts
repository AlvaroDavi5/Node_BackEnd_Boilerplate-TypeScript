import staticConfigs from './staticConfigs.json';
import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: __dirname + "/../.env.development.local" });
dotenv.config();


export interface ConfigsInterface {
	application: {
		name: string,
		environment: string,
		port: string,
		url: string,
		socketEnv: string,
		stackErrorVisible: string,
		logsPath: string,
	},
	database: {
		database: string,
		username: string,
		password: string,
		host: string,
		port: string,
		dialect: string,
		charset: string,
		define: {
			underscored: boolean,
			timestamps: boolean,
			paranoid: boolean,
			freezeTableName: boolean,
		},
		logging: string,
	},
	cache: {
		redis: {
			port: string,
			host: string,
		}
	},
	integration: {
		aws: {
			credentials: {
				region: string,
				accessKeyId: string,
				secretAccessKey: string,
				sessionToken: string,
				messageDeduplicationId: string,
				messageGroupId: string,
				apiVersion: string,
			},
			congito: {
				userPoolName: string,
				userPoolId: string,
				clientName: string,
				clientId: string,
				endpoint: string,
				apiVersion: string,
			},
			sqs: {
				defaultQueue: {
					queueName: string,
					queueUrl: string,
				},
				endpoint: string,
				apiVersion: string,
			},
			sns: {
				defaultTopic: {
					topicName: string,
					topicArn: string,
					topicProtocol: string,
				},
				endpoint: string,
				apiVersion: string,
			},
			s3: {
				bucketName: string,
				bucketUrl: string,
				endpoint: string,
				apiVersion: string,
			}
		},
		rest: {
			mockedService: {
				serviceName: string,
				baseUrl: string,
			},
		},
	},
	security: {
		cryptoAlgorithm: string,
		secretKey: string,
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
				value = process.env[key];
			}
			else {
				value = undefined;
			}
		}

		result[name] = value;
	});

	return result;
}

export default convert(staticConfigs);
