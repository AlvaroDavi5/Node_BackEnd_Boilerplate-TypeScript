import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, Document as MongoDocument, ObjectId, WithId } from 'mongodb';
import { Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/configs.config';
import WebSocketClient from '@events/websocket/client/WebSocket.client';
import MongoClient from '@core/infra/data/Mongo.client';
import RedisClient from '@core/infra/cache/Redis.client';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import { CacheEnum } from '@app/domain/enums/cache.enum';
import { WebSocketEventsEnum } from '@app/domain/enums/webSocketEvents.enum';


@Injectable()
export default class SubscriptionService implements OnModuleInit {
	private webSocketClient!: WebSocketClient;
	private readonly logger: Logger;
	public readonly expirationTime: number;
	public readonly datalakeDatabase: Db;
	public readonly subscriptionsCollection: Collection;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly configService: ConfigService,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly cacheAccessHelper: CacheAccessHelper,
	) {
		const { datalake: { db, collections: { subscriptions } } } = this.mongoClient.databases;
		this.datalakeDatabase = db;
		this.subscriptionsCollection = this.mongoClient.getCollection(this.datalakeDatabase, subscriptions);

		this.logger = this.loggerGenerator.getLogger();
		const subscriptionsExpirationTime: ConfigsInterface['cache']['expirationTime']['subscriptions'] = this.configService.get<any>('cache.expirationTime.subscriptions');
		this.expirationTime = subscriptionsExpirationTime;
	}

	public onModuleInit(): void {
		this.webSocketClient = this.moduleRef.get(WebSocketClient, { strict: false });
	}

	public async get(id: string): Promise<any> {
		let subscription: any = await this.getFromCache(id);
		if (!subscription) {
			const findedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
				subscriptionId: id,
			});
			subscription = findedSubscription;
		}
		await this.saveOnCache(id, subscription);

		return subscription;
	}

	public async save(id: string, data: any): Promise<any> {
		let findedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
			subscriptionId: id,
		});
		let findedSubscriptionId: ObjectId | null | undefined = findedSubscription?._id;

		if (!findedSubscriptionId) {
			const savedSubscription = await this.mongoClient.insertOne(this.subscriptionsCollection, data);
			findedSubscriptionId = savedSubscription.insertedId;
		}
		else
			await this.mongoClient.updateOne(this.subscriptionsCollection, findedSubscriptionId, data);

		if (findedSubscriptionId) {
			findedSubscription = await this.mongoClient.get(this.subscriptionsCollection, findedSubscriptionId);
			await this.saveOnCache(id, findedSubscription);
		}

		return findedSubscription;
	}

	public async delete(id: string): Promise<boolean> {
		let deletedSubscription = false;
		const findedSubscription = await this.mongoClient.findOne(this.subscriptionsCollection, {
			subscriptionId: id,
		});

		if (findedSubscription?._id) {
			await this.deleteFromCache(id);
			deletedSubscription = (await this.mongoClient.deleteOne(this.subscriptionsCollection, findedSubscription._id)).deletedCount > 0;
		}

		return deletedSubscription;
	}

	public async list(): Promise<WithId<MongoDocument>[]> {
		const findedSubscriptions = await this.mongoClient.findMany(this.subscriptionsCollection, {});

		return findedSubscriptions;
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
