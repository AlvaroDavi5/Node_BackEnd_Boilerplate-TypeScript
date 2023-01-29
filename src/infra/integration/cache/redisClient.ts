import IORedis from 'ioredis';
import { ScanStreamOptions } from 'ioredis/built/types';
import { ContainerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
@param {import('configs/configs')} ctx.configs
@param {import('src/infra/errors/exceptions')} ctx.exceptions
**/
export default ({
	configs,
	exceptions,
}: ContainerInterface) => {
	const redisConfig = configs.cache.redis;

	const redis = new IORedis(redisConfig);

	if (!redis) {
		throw exceptions.integration({
			details: 'Error to connect on redis cache',
		});
	}

	const _toString = (value: object | string | null) => {
		let val = '';

		if (typeof (value) === 'object')
			val = JSON.stringify(value);
		else if (typeof (value) === 'string')
			val = String(value);

		return val;
	};
	const _toValue = (value: string) => {
		let val = null;

		try {
			val = JSON.parse(value);
		} catch (error) {
			val = value;
		}

		return val;
	};

	return {
		lib: () => redis,

		list: async () => {
			const result = await redis.keys('*');

			return result;
		},

		get: async (key: string) => {
			const value = await redis.get(String(key));
			return value ? _toValue(value) : null;
		},

		set: async (key: string, value: object, ttl = -1) => {
			const result = await redis.set(String(key), _toString(value));
			await redis.expire(String(key), Number(ttl)); // [key] expires in [ttl] seconds
			return result;
		},

		getByKeyPattern: async (pattern: string) => {
			const keys = await redis.keys(pattern);
			const getByKeyPromises = keys.map(
				async (key) => {
					const value = _toValue(String(await redis.get(key)));

					return {
						key,
						...value,
					};
				}
			);

			return Promise.allSettled(getByKeyPromises);
		},

		getValuesByKeyPattern: async (key: string) => {
			const keys = await redis.keys(key);

			if (!keys || keys?.length < 1) {
				return [];
			}

			const caches = await redis.mget(keys);

			return caches.map((cache) => {
				return _toValue(String(cache));
			});
		},

		delete: async (key: string) => {
			const result = await redis.del(String(key));
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
						pipeline.del(String(key));
					});

					pipeline.exec();
				}
			});
		},
	};
};
