import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/envs.config';
import CryptographyService from '@core/security/Cryptography.service';
import RestMockedServiceProvider from '@core/infra/providers/RestMockedService.provider';
import RedisClient from '@core/infra/cache/Redis.client';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import { CacheEnum } from '@domain/enums/cache.enum';
import { requestMethodType } from '@shared/internal/types/restClientTypes';
import { RegisterEventHookInterface } from '../api/schemas/registerEventHook.schema';


@Injectable()
export default class WebhookService {
	public readonly hooksTimeToLive: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly restMockedServiceProvider: RestMockedServiceProvider,
		private readonly redisClient: RedisClient,
		private readonly cacheAccessHelper: CacheAccessHelper,
	) {
		const hooksExpirationTime = this.configService.get<ConfigsInterface['cache']['expirationTime']['hooks']>('cache.expirationTime.hooks')!;
		this.hooksTimeToLive = hooksExpirationTime;
	}

	public async pullHook(hookSchema: string, data: unknown): Promise<any> {
		const hookSchemaList = await this.list(hookSchema);
		const mockedServiceBaseUrl = this.configService
			.get<ConfigsInterface['integration']['rest']['mockedService']['baseUrl']>('integration.rest.mockedService.baseUrl')!;

		for (const { value: hook } of hookSchemaList) {
			const responseEndpoint = hook?.responseEndpoint ?? mockedServiceBaseUrl;
			const responseMethod = hook?.responseMethod?.toLowerCase() as requestMethodType;

			await this.restMockedServiceProvider.requestHook(responseEndpoint, responseMethod, data);
		}
	}

	public async get(hookId: string, hookSchema: string): Promise<RegisterEventHookInterface> {
		const key = this.cacheAccessHelper.generateKey(`${hookSchema}:${hookId}`, CacheEnum.HOOKS);

		return await this.redisClient.get(key);
	}

	public async save(hookSchema: string, data: RegisterEventHookInterface): Promise<string> {
		const hookId = this.cryptographyService.generateUuid();
		const key = this.cacheAccessHelper.generateKey(`${hookSchema}:${hookId}`, CacheEnum.HOOKS);

		return await this.redisClient.set(key, data, this.hooksTimeToLive);
	}

	public async delete(hookId: string, hookSchema: string): Promise<boolean> {
		const key = this.cacheAccessHelper.generateKey(`${hookSchema}:${hookId}`, CacheEnum.HOOKS);

		const deleted = await this.redisClient.delete(key);

		return !!deleted;
	}

	public async list(additionalPattern = ''): Promise<{
		key: string;
		value: RegisterEventHookInterface | null;
	}[]> {
		const pattern = `${CacheEnum.HOOKS}:${additionalPattern}*`;
		return await this.redisClient.getByKeyPattern<RegisterEventHookInterface>(pattern);
	}
}
