import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/envs.config';
import CryptographyService from '@core/security/Cryptography.service';
import RestMockedServiceProvider from '@core/infra/providers/RestMockedService.provider';
import RedisClient from '@core/infra/cache/Redis.client';
import { CacheEnum } from '@domain/enums/cache.enum';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import { fromDateTimeToEpoch, fromJSDateToDateTime, getDateTimeNow } from '@common/utils/dates.util';
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

	public async pullHook(hookSchema: string, data: { [key: string]: unknown; }): Promise<void> {
		const hookSchemaList = await this.list(hookSchema);
		const mockedServiceBaseUrl = this.configService
			.get<ConfigsInterface['integration']['rest']['mockedService']['baseUrl']>('integration.rest.mockedService.baseUrl')!;

		const hooksToPull: Promise<unknown>[] = [];
		const hooksToDelete: Promise<unknown>[] = [];
		const epochDateNow = fromDateTimeToEpoch(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), false, false);

		for (const { key, value: hook } of hookSchemaList) {
			const epochSentAt = hook?.sendAt
				? fromDateTimeToEpoch(fromJSDateToDateTime(hook.sendAt, TimeZonesEnum.America_SaoPaulo), false, false)
				: 0;

			if (epochDateNow > epochSentAt) {
				const responseEndpoint = hook?.responseEndpoint ?? mockedServiceBaseUrl;
				const responseMethod = hook?.responseMethod?.toLowerCase() as requestMethodType;

				hooksToPull.push(this.restMockedServiceProvider.requestHook<void>(
					responseMethod, responseEndpoint,
					{}, data
				));

				const hookId = this.cacheAccessHelper.getId(
					this.cacheAccessHelper.getId(key, CacheEnum.HOOKS),
					hookSchema);
				hooksToDelete.push(this.delete(hookId, hookSchema));
			}
		}

		await Promise.all(hooksToDelete);
		await Promise.all(hooksToPull);
	}

	public async get(hookId: string, hookSchema: string): Promise<RegisterEventHookInterface> {
		const key = this.cacheAccessHelper.generateKey(`${hookSchema}:${hookId}`, CacheEnum.HOOKS);

		const result = await this.redisClient.get<RegisterEventHookInterface>(key);
		return this.payloadBuilder(result as RegisterEventHookInterface);
	}

	public async save(hookSchema: string, data: RegisterEventHookInterface): Promise<string> {
		const hookId = this.cryptographyService.generateUuid();
		const key = this.cacheAccessHelper.generateKey(`${hookSchema}:${hookId}`, CacheEnum.HOOKS);

		data = this.payloadBuilder(data);

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
		const result = await this.redisClient.getByKeyPattern<RegisterEventHookInterface>(pattern);
		return result.map(({ key, value }) => ({ key, value: this.payloadBuilder(value as RegisterEventHookInterface) }));
	}

	private payloadBuilder(data: RegisterEventHookInterface): RegisterEventHookInterface {
		if (data?.sendAt && typeof data.sendAt === 'string')
			data.sendAt = new Date(data.sendAt);

		return data;
	}
}
