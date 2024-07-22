import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, ObjectId } from 'mongodb';
import { ConfigsInterface } from '@core/configs/envs.config';
import WebSocketClient from '@events/websocket/client/WebSocket.client';
import MongoClient from '@core/infra/data/Mongo.client';
import RedisClient from '@core/infra/cache/Redis.client';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import { SINGLETON_LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.service';
import { LoggerInterface } from '@core/logging/logger';
import Exceptions from '@core/errors/Exceptions';
import SubscriptionEntity, { CreateSubscriptionInterface, UpdateSubscriptionInterface } from '@domain/entities/Subscription.entity';
import { CacheEnum } from '@domain/enums/cache.enum';
import { WebSocketEventsEnum } from '@domain/enums/webSocketEvents.enum';


@Injectable()
export default class SubscriptionService implements OnModuleInit {
	private webSocketClient!: WebSocketClient;
	private readonly logger: LoggerInterface;
	public readonly subscriptionsTimeToLive: number;
	public readonly datalakeDatabase: Db;
	public readonly subscriptionsCollection: Collection;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly configService: ConfigService,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		@Inject(SINGLETON_LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
		private readonly exceptions: Exceptions,
		private readonly cacheAccessHelper: CacheAccessHelper,
	) {
		const { datalake: { db, collections: { subscriptions } } } = this.mongoClient.databases;
		this.datalakeDatabase = db;
		this.subscriptionsCollection = this.mongoClient.getCollection(this.datalakeDatabase, subscriptions);

		this.logger = this.loggerProvider.getLogger(SubscriptionService.name);
		const subscriptionsExpirationTime = this.configService
			.get<ConfigsInterface['cache']['expirationTime']['subscriptions']>('cache.expirationTime.subscriptions')!;
		this.subscriptionsTimeToLive = subscriptionsExpirationTime;
	}

	public onModuleInit(): void {
		this.webSocketClient = this.moduleRef.get(WebSocketClient, { strict: false });
	}

	public async get(subscriptionId: string): Promise<SubscriptionEntity> {
		let subscription = await this.getFromCache(subscriptionId);
		if (!subscription) {
			const foundedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
				subscriptionId,
			});
			subscription = foundedSubscription;
		}
		if (!subscription)
			throw this.exceptions.notFound({
				message: 'Subscription not found!',
			});

		await this.saveOnCache(subscriptionId, subscription);

		return new SubscriptionEntity(subscription);
	}

	public async save(subscriptionId: string, data: CreateSubscriptionInterface | UpdateSubscriptionInterface): Promise<SubscriptionEntity> {
		let foundedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
			subscriptionId,
		});
		let subscriptionDatabaseId: ObjectId | null | undefined = foundedSubscription?._id;

		if (!subscriptionDatabaseId) {
			// ? create
			const savedSubscription = await this.mongoClient.insertOne(this.subscriptionsCollection, data);
			subscriptionDatabaseId = savedSubscription.insertedId;
		} else
			// ? update
			await this.mongoClient.updateOne(this.subscriptionsCollection, subscriptionDatabaseId, data);

		if (subscriptionDatabaseId) {
			foundedSubscription = await this.mongoClient.get(this.subscriptionsCollection, subscriptionDatabaseId);
			await this.saveOnCache(subscriptionId, foundedSubscription);
		} else
			throw this.exceptions.conflict({
				message: 'Subscription not created or updated!',
			});

		return new SubscriptionEntity(foundedSubscription);
	}

	public async delete(subscriptionId: string): Promise<boolean> {
		let deletedSubscription = false;
		const foundedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
			subscriptionId,
		});

		if (foundedSubscription?._id) {
			await this.deleteFromCache(subscriptionId);
			deletedSubscription = (await this.mongoClient.deleteOne(this.subscriptionsCollection, foundedSubscription._id)).deletedCount > 0;
		}

		return deletedSubscription;
	}

	public async list(useCache = true): Promise<SubscriptionEntity[]> {
		let foundedSubscriptions = await this.listFromCache();

		if (!useCache || !foundedSubscriptions.length)
			foundedSubscriptions = await this.mongoClient.findMany(this.subscriptionsCollection, {});

		return foundedSubscriptions.map((subscription: any) => new SubscriptionEntity(subscription));
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
