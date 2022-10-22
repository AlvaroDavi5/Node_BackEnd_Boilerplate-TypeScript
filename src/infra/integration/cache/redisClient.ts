import IORedis from 'ioredis';
import { ScanStreamOptions } from 'ioredis/built/types';
import { containerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
@param {import('configs/staticConfigs')} ctx.configs
@param {import('src/infra/errors/exceptions')} ctx.exceptions
**/
export default ({
	configs,
	exceptions,
}: containerInterface) => {
	const redisConfig = configs.integration.redis;

	const redis = new IORedis(redisConfig);

	if (!redis) {
		throw exceptions.integration({
			details: 'Error to connect on redis cache',
		});
	}

	return {
		lib: () => redis,

		list: async () => {
			const result = await redis.keys('*');

			return result;
		},

		get: async (key: string) => {
			const value = await redis.get(key);
			return value ? JSON.parse(value) : null;
		},

		set: async (key: string, value: object, ttl = -1) => {
			const result = await redis.set(key, JSON.stringify(value));
			await redis.expire(key, ttl);
			return result;
		},

		getByKeyPattern: async (pattern: string) => {
			const keys = await redis.keys(pattern);
			const getByKeyPromises = keys.map(async (key) => redis.get(key));

			return Promise.allSettled(getByKeyPromises);
		},

		delete: async (key: string) => {
			const result = await redis.del(key);
			return result;
		},

		deleteAll: async () => {
			const result = await redis.flushall();

			return result;
		},

		remove: async (keyPattern: ScanStreamOptions | object | string) => {
			const scanValue: string | any = `${keyPattern}:*`;
			const stream = redis.scanStream(scanValue);

			stream.on('data', (keys: string[]) => {
				if (keys.length) {
					const pipeline = redis.pipeline();

					keys.forEach((key: string) => {
						pipeline.del(key);
					});

					pipeline.exec();
				}
			});
		},
	};
};
