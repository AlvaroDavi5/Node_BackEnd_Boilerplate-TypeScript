import { Injectable, OnModuleInit, ArgumentMetadata } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Message } from '@aws-sdk/client-sqs';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import WebhookService from '@app/hook/services/Webhook.service';
import MongoClient from '@core/infra/data/Mongo.client';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import LoggerService from '@core/logging/Logger.service';
import Exceptions from '@core/errors/Exceptions';
import { EventsEnum } from '@domain/enums/events.enum';
import { WebSocketRoomsEnum } from '@domain/enums/webSocketEvents.enum';
import eventSchema, { EventSchemaInterface } from './schemas/event.schema';


@Injectable()
export default class EventsQueueHandler implements OnModuleInit {
	private subscriptionService!: SubscriptionService;
	private webhookService!: WebhookService;
	private readonly schemaValidator: SchemaValidator;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly mongoClient: MongoClient,
		private readonly dataParserHelper: DataParserHelper,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) {
		this.schemaValidator = new SchemaValidator(this.exceptions, this.logger);
	}

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
		this.webhookService = this.moduleRef.get(WebhookService, { strict: false });
	}

	public async execute(message: Message): Promise<boolean> {
		const bodyMetadata: ArgumentMetadata = { type: 'custom', data: message.Body, metatype: String };

		try {
			if (message.Body) {
				const { data } = this.dataParserHelper.toObject(message.Body);
				const value = this.schemaValidator.validate<EventSchemaInterface>(data, bodyMetadata, eventSchema);

				if (value.payload.event === EventsEnum.NEW_CONNECTION) {
					this.subscriptionService.emit(value, WebSocketRoomsEnum.NEW_CONNECTIONS);
					await this.webhookService.pullHook(value.payload.event, value.payload);
				} else
					this.subscriptionService.broadcast(value);

				return true;
			}
		} catch (error) {
			this.logger.error(error);

			const { datalake } = this.mongoClient.databases;
			const unprocessedMessagesCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.unprocessedMessages);
			await this.mongoClient.insertOne(unprocessedMessagesCollection, message);

			return true;
		}

		return false;
	}
}
