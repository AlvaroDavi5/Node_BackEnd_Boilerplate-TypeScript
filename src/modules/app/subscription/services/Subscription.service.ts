import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, ObjectId } from 'mongodb';
import { ConfigsInterface } from '@core/configs/envs.config';
import WebSocketClient from '@events/websocket/client/WebSocket.client';
import MongoClient from '@core/infra/data/Mongo.client';
import RedisClient from '@core/infra/cache/Redis.client';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import LoggerService from '@core/logging/Logger.service';
import Exceptions from '@core/errors/Exceptions';
import SubscriptionEntity, { ICreateSubscription, IUpdateSubscription } from '@domain/entities/Subscription.entity';
import { CacheEnum } from '@domain/enums/cache.enum';
import { WebSocketEventsEnum } from '@domain/enums/webSocketEvents.enum';


@Injectable()
export default class SubscriptionService implements OnModuleInit {
	private webSocketClient!: WebSocketClient;
	public readonly subscriptionsTimeToLive: number;
	public readonly datalakeDatabase: Db;
	public readonly subscriptionsCollection: Collection;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly configService: ConfigService,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
		private readonly cacheAccessHelper: CacheAccessHelper,
	) {
		const { datalake: { db, collections: { subscriptions } } } = this.mongoClient.databases;
		this.datalakeDatabase = db;
		this.subscriptionsCollection = this.mongoClient.getCollection(this.datalakeDatabase, subscriptions);

		const subscriptionsExpirationTime = this.configService
			.get<ConfigsInterface['cache']['expirationTime']['subscriptions']>('cache.expirationTime.subscriptions')!;
		this.subscriptionsTimeToLive = subscriptionsExpirationTime;
	}

	public onModuleInit(): void {
		this.webSocketClient = this.moduleRef.get(WebSocketClient, { strict: false });
	}

	public async get(subscriptionId: string): Promise<SubscriptionEntity> {
		let savedSubscription = await this.getFromCache(subscriptionId);
		if (!savedSubscription) {
			const foundedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
				subscriptionId,
			});
			savedSubscription = foundedSubscription;
		}

		if (!savedSubscription)
			throw this.exceptions.notFound({
				message: 'Subscription not found!',
			});
		const subscription = new SubscriptionEntity(savedSubscription);

		await this.saveOnCache(subscriptionId, subscription.getAttributes());

		return subscription;
	}

	public async save(subscriptionId: string, data: ICreateSubscription | IUpdateSubscription): Promise<SubscriptionEntity> {
		let foundedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
			subscriptionId,
		});
		let subscriptionDatabaseId: ObjectId | null | undefined = foundedSubscription?._id;

		const subscriptionData = new SubscriptionEntity(data).getAttributes();
		if (!subscriptionDatabaseId) {
			// ? create
			const savedSubscription = await this.mongoClient.insertOne(this.subscriptionsCollection, subscriptionData);
			subscriptionDatabaseId = savedSubscription.insertedId;
		} else
			// ? update
			await this.mongoClient.updateOne(this.subscriptionsCollection, subscriptionDatabaseId, subscriptionData);

		if (subscriptionDatabaseId) {
			foundedSubscription = await this.mongoClient.get(this.subscriptionsCollection, subscriptionDatabaseId);
			await this.saveOnCache(subscriptionId, new SubscriptionEntity(foundedSubscription).getAttributes());
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
			deletedSubscription = (await this.mongoClient.deleteOne(this.subscriptionsCollection, foundedSubscription._id)).deletedCount > 0;
		}
		await this.deleteFromCache(subscriptionId);

		return deletedSubscription;
	}

	public async list(useCache = true): Promise<SubscriptionEntity[]> {
		let foundedSubscriptions = await this.listFromCache();

		if (!useCache || !foundedSubscriptions.length)
			foundedSubscriptions = await this.mongoClient.findMany(this.subscriptionsCollection, {});

		return foundedSubscriptions.map((subscription) => new SubscriptionEntity(subscription));
	}

	public emit(msg: unknown, socketIdsOrRooms: string | string[]): void {
		this.logger.info('Emiting event');
		this.webSocketClient.send(WebSocketEventsEnum.EMIT_PRIVATE, {
			...(msg as object),
			socketIdsOrRooms,
		});
	}

	public broadcast(msg: unknown): void {
		this.logger.info('Broadcasting event');
		this.webSocketClient.send(WebSocketEventsEnum.BROADCAST, msg);
	}

	private async listFromCache(): Promise<unknown[]> {
		const pattern = `${CacheEnum.SUBSCRIPTIONS}:*`;
		return await this.redisClient.getByKeyPattern(pattern);
	}

	private async getFromCache(subscriptionId: string): Promise<unknown> {
		const key = this.cacheAccessHelper.generateKey(subscriptionId, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.get(key);
	}

	private async saveOnCache(subscriptionId: string, data: unknown): Promise<string> {
		const key = this.cacheAccessHelper.generateKey(subscriptionId, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.set(key, data, this.subscriptionsTimeToLive);
	}

	private async deleteFromCache(subscriptionId: string): Promise<number> {
		const key = this.cacheAccessHelper.generateKey(subscriptionId, CacheEnum.SUBSCRIPTIONS);
		return await this.redisClient.delete(key);
	}
}
