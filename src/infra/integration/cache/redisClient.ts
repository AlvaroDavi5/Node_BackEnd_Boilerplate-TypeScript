/**
 @param {Object} ctx - Dependency Injection (container)
**/
import IORedis from 'ioredis';
import { ScanStreamOptions } from 'ioredis/built/types';
import { containerInterface } from 'src/types/_containerInterface';


export default ({ config }: containerInterface) => {
	const redisConfig = config.integration.redis.sessionManager;

	const redis = new IORedis(redisConfig);

	return {
		lib: () => redis,

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
