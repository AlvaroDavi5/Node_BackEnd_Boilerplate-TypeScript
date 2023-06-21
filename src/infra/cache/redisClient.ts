import IORedis from 'ioredis';
import { ScanStreamOptions } from 'ioredis/built/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@configs/configs';
import Exceptions from '@infra/errors/exceptions';


@Injectable()
export default class RedisClient {
	private redis: IORedis;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
	) {
		const { host, port }: ConfigsInterface['cache']['redis'] = this.configService.get<any>('cache.redis');

		this.redis = new IORedis({
			host: String(host),
			port: Number(port),
			showFriendlyErrorStack: true,
		});

		if (!this.redis) {
			throw this.exceptions.integration({
				message: 'Error to instance redis client',
			});
		}
	}


	private _toString(value: object | string | null): string {
		let val = '';

		if (typeof (value) === 'object')
			val = JSON.stringify(value);
		else if (typeof (value) === 'string')
			val = String(value);

		return val;
	}

	private _toValue(value: string): any {
		let val = null;

		try {
			val = JSON.parse(value);
		} catch (error) {
			val = value;
		}

		return val;
	}

	public lib(): IORedis {
		return this.redis;
	}

	public isConnected(): boolean {
		return this.redis?.status === 'ready';
	}

	public async listKeys(): Promise<string[]> {
		const result = await this.redis.keys('*');

		if (!result)
			return [];

		return result;
	}

	public async get(key: string): Promise<any> {
		const value = await this.redis.get(String(key));
		return value ? this._toValue(value) : null;
	}

	public async set(key: string, value: object, ttl = 30): Promise<string> {
		const result = await this.redis.set(String(key), this._toString(value));
		await this.redis.expire(String(key), Number(ttl)); // [key] expires in [ttl] seconds
		return result;
	}

	public async getByKeyPattern(pattern: string): Promise<PromiseSettledResult<any>[]> {
		const keys = await this.redis.keys(pattern);
		const getByKeyPromises = keys.map(
			async (key: string) => {
				const value = this._toValue(String(await this.redis.get(key)));

				return {
					key,
					value,
				};
			}
		);

		return Promise.allSettled(getByKeyPromises);
	}

	public async getValuesByKeyPattern(key: string): Promise<any[]> {
		const keys = await this.redis.keys(key);

		if (!keys || keys?.length < 1) {
			return [];
		}

		const caches = await this.redis.mget(keys);

		return caches.map((cache) => {
			return this._toValue(String(cache));
		});
	}

	public async delete(key: string): Promise<number> {
		const result = await this.redis.del(String(key));
		return result;
	}

	public async deleteAll(): Promise<string> {
		const result = await this.redis.flushall();

		return result;
	}

	public async remove(keyPattern: ScanStreamOptions | object | string): Promise<void> {
		const scanValue: string | any = `${keyPattern}:*`;
		const stream = this.redis.scanStream(scanValue);

		stream.on('data', (keys: string[]) => {
			if (keys.length) {
				const pipeline = this.redis.pipeline();

				keys.forEach((key: string) => {
					pipeline.del(String(key));
				});

				pipeline.exec();
			}
		});
	}
}
