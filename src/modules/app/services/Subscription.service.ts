import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongodb';
import { Logger } from 'winston';
import { ConfigsInterface } from '@configs/configs.config';
import WebSocketClient from '@modules/events/websocket/client/WebSocket.client';
import MongoClient from '@infra/data/Mongo.client';
import RedisClient from '@infra/cache/Redis.client';
import CacheAccessHelper from '@modules/utils/helpers/CacheAccess.helper';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import { CacheEnum } from '@modules/app/domain/enums/cache.enum';
import { WebSocketEventsEnum } from '@modules/app/domain/enums/webSocketEvents.enum';


@Injectable()
export default class SubscriptionService {
	private readonly logger: Logger;
	public readonly expirationTime: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly webSocketClient: WebSocketClient,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly cacheAccessHelper: CacheAccessHelper,
	) {
		this.logger = this.loggerGenerator.getLogger();
		const subscriptionsExpirationTime: ConfigsInterface['cache']['expirationTime']['subscriptions'] = this.configService.get<any>('cache.expirationTime.subscriptions');
		this.expirationTime = subscriptionsExpirationTime;
	}

	public async get(id: string): Promise<any> {
		const datalake = this.mongoClient.databases.datalake;
		const subscriptionsCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.subscriptions);

		let subscription: any = await this.getFromCache(id);
		if (!subscription) {
			const findedSubscription = await this.mongoClient.findOne(subscriptionsCollection, {
				subscriptionId: id,
			});
			subscription = findedSubscription;
		}
		await this.saveOnCache(id, subscription);

		return subscription;
	}

	public async save(id: string, data: any): Promise<any> {
		const datalake = this.mongoClient.databases.datalake;
		const subscriptionsCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.subscriptions);

		let findedSubscription = await this.mongoClient.findOne(subscriptionsCollection, {
			subscriptionId: id,
		});
		let findedSubscriptionId: ObjectId | null | undefined = findedSubscription?._id;

		if (!findedSubscriptionId) {
			const savedSubscription = await this.mongoClient.insertOne(subscriptionsCollection, data);
			findedSubscriptionId = savedSubscription.insertedId;
		}
		else
			await this.mongoClient.updateOne(subscriptionsCollection, findedSubscriptionId, data);

		if (findedSubscriptionId) {
			findedSubscription = await this.mongoClient.get(subscriptionsCollection, findedSubscriptionId);
			await this.saveOnCache(id, findedSubscription);
		}

		return findedSubscription;
	}

	public async delete(id: string): Promise<boolean> {
		const datalake = this.mongoClient.databases.datalake;
		const subscriptionsCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.subscriptions);

		let deletedSubscription = false;
		const findedSubscription = await this.mongoClient.findOne(subscriptionsCollection, {
			subscriptionId: id,
		});

		if (findedSubscription?._id) {
			await this.deleteFromCache(id);
			deletedSubscription = (await this.mongoClient.deleteOne(subscriptionsCollection, findedSubscription._id)).deletedCount > 0;
		}

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

	private async getFromCache(id: string): Promise<any> {
		const key = this.cacheAccessHelper.generateKey(id, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.get(key);
	}

	private async saveOnCache(id: string, data: any): Promise<string> {
		const key = this.cacheAccessHelper.generateKey(id, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.set(key, data, this.expirationTime);
	}

	private async deleteFromCache(id: string): Promise<number> {
		const key = this.cacheAccessHelper.generateKey(id, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.delete(key);
	}
}
