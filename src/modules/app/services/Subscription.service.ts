import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { ConfigsInterface } from '@configs/configs.config';
import RedisClient from '@infra/cache/Redis.client';
import WebSocketClient from '@modules/events/websocket/client/WebSocket.client';
import CacheAccessHelper from '@modules/utils/helpers/CacheAccess.helper';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import { CacheEnum } from '@modules/app/domain/enums/cache.enum';
import { WebSocketEventsEnum } from '@modules/app/domain/enums/webSocketEvents.enum';


@Injectable()
export default class SubscriptionService {
	private readonly logger: Logger;
	public readonly expirationTime: number;

	constructor(
		private readonly webSocketClient: WebSocketClient,
		private readonly redisClient: RedisClient,
		private readonly configService: ConfigService,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly cacheAccessHelper: CacheAccessHelper,
	) {
		this.logger = this.loggerGenerator.getLogger();
		const subscriptionsExpirationTime: ConfigsInterface['cache']['expirationTime']['subscriptions'] = this.configService.get<any>('cache.expirationTime.subscriptions');
		this.expirationTime = subscriptionsExpirationTime;
	}

	public async save(id: string, data: any): Promise<string> {
		const key: string = this.cacheAccessHelper.generateKey(id, CacheEnum.SUBSCRIPTIONS);
		const savedSubscription = await this.redisClient.set(key, data, this.expirationTime);
		return savedSubscription;
	}

	public async delete(id: string): Promise<number> {
		const key: string = this.cacheAccessHelper.generateKey(id, CacheEnum.SUBSCRIPTIONS);
		const deletedSubscription = await this.redisClient.delete(key);
		return deletedSubscription;
	}

	public emit(msg: any): void {
		this.logger.info('Emiting event');
		this.webSocketClient.send(WebSocketEventsEnum.EMIT_PRIVATE, msg);
	}

	public broadcast(msg: any): void {
		this.logger.info('Broadcasting event');
		this.webSocketClient.send(WebSocketEventsEnum.BROADCAST, msg);
	}
}
