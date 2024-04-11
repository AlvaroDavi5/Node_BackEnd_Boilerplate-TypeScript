import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import WebhookService from '@app/hook/services/Webhook.service';
import MongoClient from '@core/infra/data/Mongo.client';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';
import eventSchema, { EventSchemaInterface } from './schemas/event.schema';
import { EventsEnum } from '@domain/enums/events.enum';
import { WebSocketRoomsEnum } from '@domain/enums/webSocketEvents.enum';


@Injectable()
export default class EventsQueueHandler implements OnModuleInit {
	private subscriptionService!: SubscriptionService;
	private webhookService!: WebhookService;
	private readonly logger: Logger;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly mongoClient: MongoClient,
		private readonly schemaValidator: SchemaValidator<EventSchemaInterface>,
		private readonly dataParserHelper: DataParserHelper,
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(EventsQueueHandler.name);
	}

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
		this.webhookService = this.moduleRef.get(WebhookService, { strict: false });
	}

	public async execute(message: Message): Promise<boolean> {
		try {
			if (message.Body) {
				const data = this.dataParserHelper.toObject(message.Body);
				const value = this.schemaValidator.validate(data, eventSchema);

				if (value.payload.event === EventsEnum.NEW_CONNECTION) {
					this.subscriptionService.emit(value, WebSocketRoomsEnum.NEW_CONNECTIONS);
					await this.webhookService.pullHook(value.payload.event, value.payload);
				}
				else
					this.subscriptionService.broadcast(value);

				return true;
			}
		} catch (error) {
			this.logger.error(error);

			const datalake = this.mongoClient.databases.datalake;
			const unprocessedMessagesCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.unprocessedMessages);
			await this.mongoClient.insertOne(unprocessedMessagesCollection, message);

			return true;
		}

		return false;
	}
}
