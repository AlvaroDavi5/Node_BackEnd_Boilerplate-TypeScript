import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, ObjectId } from 'mongodb';
import { Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/configs.config';
import WebSocketClient from '@events/websocket/client/WebSocket.client';
import MongoClient from '@core/infra/data/Mongo.client';
import RedisClient from '@core/infra/cache/Redis.client';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';
import SubscriptionEntity, { SubscriptionInterface } from '@domain/entities/Subscription.entity';
import { CacheEnum } from '@domain/enums/cache.enum';
import { WebSocketEventsEnum } from '@domain/enums/webSocketEvents.enum';


@Injectable()
export default class SubscriptionService implements OnModuleInit {
	private webSocketClient!: WebSocketClient;
	private readonly logger: Logger;
	public readonly subscriptionsTimeToLive: number;
	public readonly datalakeDatabase: Db;
	public readonly subscriptionsCollection: Collection;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly configService: ConfigService,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
		private readonly cacheAccessHelper: CacheAccessHelper,
	) {
		const { datalake: { db, collections: { subscriptions } } } = this.mongoClient.databases;
		this.datalakeDatabase = db;
		this.subscriptionsCollection = this.mongoClient.getCollection(this.datalakeDatabase, subscriptions);

		this.logger = this.loggerProvider.getLogger(SubscriptionService.name);
		const subscriptionsExpirationTime: ConfigsInterface['cache']['expirationTime']['subscriptions'] = this.configService.get<any>('cache.expirationTime.subscriptions');
		this.subscriptionsTimeToLive = subscriptionsExpirationTime;
	}

	public onModuleInit(): void {
		this.webSocketClient = this.moduleRef.get(WebSocketClient, { strict: false });
	}

	public async get(subscriptionId: string): Promise<SubscriptionEntity | null> {
		let subscription = await this.getFromCache(subscriptionId);
		if (!subscription) {
			const findedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
				subscriptionId,
			});
			subscription = findedSubscription;
		}
		if (!subscription)
			return null;

		await this.saveOnCache(subscriptionId, subscription);

		return new SubscriptionEntity(subscription);
	}

	public async save(subscriptionId: string, data: SubscriptionInterface): Promise<SubscriptionEntity | null> {
		let findedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
			subscriptionId,
		});
		let subscriptionDatabaseId: ObjectId | null | undefined = findedSubscription?._id;

		if (!subscriptionDatabaseId) {
			// ? create
			const savedSubscription = await this.mongoClient.insertOne(this.subscriptionsCollection, data);
			subscriptionDatabaseId = savedSubscription.insertedId;
		}
		else
			// ? update
			await this.mongoClient.updateOne(this.subscriptionsCollection, subscriptionDatabaseId, data);

		if (subscriptionDatabaseId) {
			findedSubscription = await this.mongoClient.get(this.subscriptionsCollection, subscriptionDatabaseId);
			await this.saveOnCache(subscriptionId, findedSubscription);
		}
		else
			return null;

		return new SubscriptionEntity(findedSubscription);
	}

	public async delete(subscriptionId: string): Promise<boolean> {
		let deletedSubscription = false;
		const findedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
			subscriptionId,
		});

		if (findedSubscription?._id) {
			await this.deleteFromCache(subscriptionId);
			deletedSubscription = (await this.mongoClient.deleteOne(this.subscriptionsCollection, findedSubscription._id)).deletedCount > 0;
		}

		return deletedSubscription;
	}

	public async list(useCache = true): Promise<SubscriptionEntity[]> {
		let findedSubscriptions = await this.listFromCache();

		if (!useCache || !findedSubscriptions.length)
			findedSubscriptions = await this.mongoClient.findMany(this.subscriptionsCollection, {});

		return findedSubscriptions.map((subscription: any) => {
			return new SubscriptionEntity(subscription);
		});
	}

	public emit(msg: unknown, socketIdsOrRooms: string | string[]): void {
		this.logger.info('Emiting event');
		this.webSocketClient.send(WebSocketEventsEnum.EMIT_PRIVATE, {
			...msg as any,
			socketIdsOrRooms,
		});
	}

	public broadcast(msg: unknown): void {
		this.logger.info('Broadcasting event');
		this.webSocketClient.send(WebSocketEventsEnum.BROADCAST, msg);
	}

	private async listFromCache(): Promise<any[]> {
		const pattern = `${CacheEnum.SUBSCRIPTIONS}:*`;
		return await this.redisClient.getByKeyPattern(pattern);
	}

	private async getFromCache(subscriptionId: string): Promise<any> {
		const key = this.cacheAccessHelper.generateKey(subscriptionId, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.get(key);
	}

	private async saveOnCache(subscriptionId: string, data: any): Promise<string> {
		const key = this.cacheAccessHelper.generateKey(subscriptionId, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.set(key, data, this.subscriptionsTimeToLive);
	}

	private async deleteFromCache(subscriptionId: string): Promise<number> {
		const key = this.cacheAccessHelper.generateKey(subscriptionId, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.delete(key);
	}
}
