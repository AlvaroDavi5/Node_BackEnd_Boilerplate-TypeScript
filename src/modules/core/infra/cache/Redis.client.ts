import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


@Injectable()
export default class RedisClient {
	private readonly redisClient: IORedis;

	public isConnected: boolean;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const { host, port } = this.configService.get<ConfigsInterface['cache']['redis']>('cache.redis')!;
		const showExternalLogs = this.configService.get<ConfigsInterface['application']['showExternalLogs']>('application.showExternalLogs')!;

		this.redisClient = new IORedis({
			host: String(host),
			port: Number(port),
			showFriendlyErrorStack: showExternalLogs,
			maxRetriesPerRequest: 3,
		});

		const connectingStatus = ['wait', 'reconnecting', 'connecting', 'connect', 'ready'];
		if (!connectingStatus.includes(this.redisClient.status)) {
			throw this.exceptions.internal({
				message: 'Error to instance redis client',
			});
		}

		this.isConnected = true;
	}

	private parseValue<VT = unknown>(strValue: string): VT | null {
		const { data } = this.dataParserHelper.toObject<VT>(strValue);
		return data;
	}

	public getClient(): IORedis {
		return this.redisClient;
	}

	public async connect(): Promise<boolean> {
		const connectedStatus = ['connect', 'ready'];

		try {
			await this.redisClient.connect();
			this.isConnected = connectedStatus.includes(this.redisClient.status);
		} catch (error) {
			this.isConnected = false;
			throw this.exceptions.integration({
				message: 'Error to connect redis client',
				details: (error as Error)?.message,
			});
		}
		return this.isConnected;
	}

	public async disconnect(): Promise<boolean> {
		const disconnectedStatus = ['wait', 'close', 'end'];

		try {
			const wasClosed = await this.redisClient.quit() === 'OK' || disconnectedStatus.includes(this.redisClient.status);

			if (wasClosed)
				this.isConnected = false;

			return wasClosed;
		} catch (error) {
			return false;
		}
	}

	public async listKeys(): Promise<string[]> {
		const result = await this.redisClient.keys('*');

		if (!result)
			return [];

		return result;
	}

	public async get<VT = unknown>(key: string): Promise<VT | null> {
		const value = await this.redisClient.get(String(key));
		const result = value ? this.parseValue(value) : null;

		return result as (VT | null);
	}

	/**
	@brief [key] expires in [ttl] seconds
	@param key string
	@param value unknown
	@param ttl number
	@return 'OK'
	**/
	public async set(key: string, value: unknown, ttl = 30): Promise<string> {
		const result = await this.redisClient.set(String(key), this.dataParserHelper.toString(value));
		await this.redisClient.expire(String(key), Number(ttl));
		return result;
	}

	public async getByKeyPattern<VT = unknown>(pattern: string): Promise<{
		key: string,
		value: VT | null,
	}[]> {
		const keys = await this.redisClient.keys(pattern);
		const getByKeyPromises = keys.map(
			async (key: string) => {
				const value = this.parseValue<VT>(String(await this.redisClient.get(key)));

				return {
					key,
					value,
				};
			}
		);
		const result = await Promise.allSettled(getByKeyPromises);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return result.map(({ status: _, ...args }) => ({ ...((args as any)?.value ?? {}) }));
	}

	public async getValuesByKeyPattern<VT = unknown>(key: string): Promise<(VT | null)[]> {
		const keys = await this.redisClient.keys(key);

		if (!keys || keys?.length < 1) {
			return [];
		}

		const caches = await this.redisClient.mget(keys);

		return caches.map((cache) => {
			return this.parseValue<VT>(String(cache));
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

	public async remove(keyPattern: string): Promise<void> {
		const scanValue = `${keyPattern}:*`;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const stream = this.redisClient.scanStream(scanValue as any);

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
