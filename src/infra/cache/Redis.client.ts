import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { ScanStreamOptions } from 'ioredis/built/types';
import { ConfigsInterface } from '@configs/configs.config';
import Exceptions from '@infra/errors/Exceptions';
import DataParserHelper from '@modules/utils/helpers/DataParser.helper';


@Injectable()
export default class RedisClient {
	private readonly redisClient: IORedis;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const { host, port }: ConfigsInterface['cache']['redis'] = this.configService.get<any>('cache.redis');

		this.redisClient = new IORedis({
			host: String(host),
			port: Number(port),
			showFriendlyErrorStack: true,
		});

		if (!this.redisClient) {
			throw this.exceptions.integration({
				message: 'Error to instance redis client',
			});
		}
	}

	public getClient(): IORedis {
		return this.redisClient;
	}

	public async connect(): Promise<Boolean> {
		try {
			await this.redisClient.connect();
			return true;
		} catch (error) {
			this.exceptions.integration({
				message: 'Error to connect redis client',
			});
			return false;
		}
	}

	public isConnected(): boolean {
		return this.redisClient?.status === 'ready';
	}

	public async close(): Promise<String> {
		return await this.redisClient.quit();
	}

	public async listKeys(): Promise<string[]> {
		const result = await this.redisClient.keys('*');

		if (!result)
			return [];

		return result;
	}

	public async get(key: string): Promise<any> {
		const value = await this.redisClient.get(String(key));
		return value ? this.dataParserHelper.toObject(value) : null;
	}

	public async set(key: string, value: object, ttl = 30): Promise<string> {
		const result = await this.redisClient.set(String(key), this.dataParserHelper.toString(value));
		await this.redisClient.expire(String(key), Number(ttl)); // [key] expires in [ttl] seconds
		return result;
	}

	public async getByKeyPattern(pattern: string): Promise<PromiseSettledResult<any>[]> {
		const keys = await this.redisClient.keys(pattern);
		const getByKeyPromises = keys.map(
			async (key: string) => {
				const value = this.dataParserHelper.toObject(String(await this.redisClient.get(key)));

				return {
					key,
					value,
				};
			}
		);

		return Promise.allSettled(getByKeyPromises);
	}

	public async getValuesByKeyPattern(key: string): Promise<any[]> {
		const keys = await this.redisClient.keys(key);

		if (!keys || keys?.length < 1) {
			return [];
		}

		const caches = await this.redisClient.mget(keys);

		return caches.map((cache) => {
			return this.dataParserHelper.toObject(String(cache));
		});
	}

	public async delete(key: string): Promise<number> {
		const result = await this.redisClient.del(String(key));
		return result;
	}

	public async deleteAll(): Promise<string> {
		const result = await this.redisClient.flushall();

		return result;
	}

	public async remove(keyPattern: ScanStreamOptions | object | string): Promise<void> {
		const scanValue: string | any = `${keyPattern}:*`;
		const stream = this.redisClient.scanStream(scanValue);

		stream.on('data', (keys: string[]) => {
			if (keys.length) {
				const pipeline = this.redisClient.pipeline();

				keys.forEach((key: string) => {
					pipeline.del(String(key));
				});

				pipeline.exec();
			}
		});
	}
}
