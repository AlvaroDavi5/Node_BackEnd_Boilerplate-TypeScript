import { Injectable, OnModuleInit, ArgumentMetadata } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Message } from '@aws-sdk/client-sqs';
import MongoClient from '@core/infra/data/Mongo.client';
import LoggerService from '@core/logging/Logger.service';
import Exceptions from '@core/errors/Exceptions';
import { EventsEnum } from '@domain/enums/events.enum';
import { WebSocketRoomsEnum } from '@domain/enums/webSocketEvents.enum';
import WebhookService from '@app/hook/services/Webhook.service';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
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

	private getMessageData(message: Message): unknown {
		if (!message?.Body)
			throw this.exceptions.internal({
				message: 'Invalid message body',
				details: { messageId: message?.MessageId },
			});

		const { data, error } = this.dataParserHelper.toObject(message.Body);
		if (!data && !!error)
			throw this.exceptions.internal({
				message: 'Invalid message parsing',
				details: { ...error },
			});

		return data;
	}

	public async execute(message: Message): Promise<boolean> {
		const { datalake } = this.mongoClient.databases;

		try {
			const data = this.getMessageData(message);
			const bodyMetadata: ArgumentMetadata = { type: 'custom', data: message.Body, metatype: String };
			const value = this.schemaValidator.validate<EventSchemaInterface>(data, bodyMetadata, eventSchema);

			if (value.payload.event === EventsEnum.NEW_CONNECTION) {
				this.subscriptionService.emit(value, WebSocketRoomsEnum.NEW_CONNECTIONS);
			} else {
				this.subscriptionService.broadcast(value);
				await this.webhookService.pullHook(value.payload.event, value.payload)
					.catch((err: unknown) => this.logger.error(err));
			}

			return true;
		} catch (error) {
			this.logger.error(error);

			const unprocessedMessagesCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.unprocessedMessages);
			const saved = await this.mongoClient.insertOne(unprocessedMessagesCollection, message)
				.then(() => { return true; })
				.catch(() => { return false; });

			return saved;
		}
	}
}
