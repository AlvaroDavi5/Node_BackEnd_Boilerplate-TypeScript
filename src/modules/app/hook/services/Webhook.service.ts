import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/configs.config';
import CryptographyService from '@core/infra/security/Cryptography.service';
import RestMockedServiceClient, { requestMethodType } from '@core/infra/integration/rest/RestMockedService.client';
import RedisClient from '@core/infra/cache/Redis.client';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import { RegisterEventHookInputDto } from '@app/hook/api/dto/HookInput.dto';
import { CacheEnum } from '@domain/enums/cache.enum';


@Injectable()
export default class WebhookService {
	public readonly hooksTimeToLive: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly restMockedServiceClient: RestMockedServiceClient,
		private readonly redisClient: RedisClient,
		private readonly cacheAccessHelper: CacheAccessHelper,
	) {
		const hooksExpirationTime: ConfigsInterface['cache']['expirationTime']['hooks'] = this.configService.get<any>('cache.expirationTime.hooks');
		this.hooksTimeToLive = hooksExpirationTime;
	}

	public async pullHook(hookSchema: string, data: unknown): Promise<any> {
		const hookSchemaList = await this.list(hookSchema);

		hookSchemaList.forEach(async ({ value }) => {
			const responseEndpoint = value?.responseEndpoint ?? this.configService.get<any>('integration.rest.mockedService.baseUrl');
			const responseMethod = value?.responseMethod?.toLowerCase() as requestMethodType;

			await this.restMockedServiceClient.requestHook(responseEndpoint, responseMethod, data);
		});
	}

	public async get(hookId: string, hookSchema: string): Promise<any> {
		const key = this.cacheAccessHelper.generateKey(`${hookSchema}:${hookId}`, CacheEnum.HOOKS);

		return await this.redisClient.get(key);
	}

	public async save(hookSchema: string, data: any): Promise<string> {
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
		value: RegisterEventHookInputDto | null;
	}[]> {
		const pattern = `${CacheEnum.HOOKS}:${additionalPattern}*`;
		return await this.redisClient.getByKeyPattern<RegisterEventHookInputDto>(pattern);
	}
}
