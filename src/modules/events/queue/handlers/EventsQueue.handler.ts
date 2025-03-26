import { ModuleRef } from '@nestjs/core';
import { Injectable, OnModuleInit, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from '@aws-sdk/client-sqs';
import { ConfigsInterface } from '@core/configs/envs.config';
import CryptographyService from '@core/security/Cryptography.service';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import MongoClient from '@core/infra/data/Mongo.client';
import { EmitterEventsEnum, QueueDomainEventsEnum, QueueSchemasEnum, WebSocketRoomsEnum } from '@domain/enums/events.enum';
import WebhookService from '@app/hook/services/Webhook.service';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import EventEmitterClient from '@events/emitter/EventEmitter.client';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import eventPayloadSchema, { EventPayloadInterface } from './schemas/eventPayload.schema';


@Injectable()
export default class EventsQueueHandler implements OnModuleInit {
	private subscriptionService!: SubscriptionService;
	private webhookService!: WebhookService;
	private readonly schemaValidator: SchemaValidator;
	private readonly envSecretHash: string | null;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly mongoClient: MongoClient,
		private readonly eventEmitterClient: EventEmitterClient,
		private readonly dataParserHelper: DataParserHelper,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) {
		const { environment } = this.configService.get<ConfigsInterface['application']>('application')!;
		const { secretKey } = this.configService.get<ConfigsInterface['security']>('security')!;

		this.schemaValidator = new SchemaValidator(this.exceptions, this.logger);
		this.envSecretHash = this.cryptographyService.hashing(`${environment}${secretKey}`, 'utf8', 'sha256', 'base64');
	}

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
		this.webhookService = this.moduleRef.get(WebhookService, { strict: false });
	}

	private getMessageBody(message: Message): unknown {
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
			const data = this.getMessageBody(message);
			const bodyMetadata: ArgumentMetadata = { type: 'custom', data: message.Body, metatype: String };
			const payload = this.schemaValidator.validate<EventPayloadInterface>(data, bodyMetadata, eventPayloadSchema);

			await this.handleBySchema(payload);

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

	private async handleBySchema(value: EventPayloadInterface): Promise<void> {
		switch (value.schema) {
			case QueueSchemasEnum.DOMAIN_EVENT:
				await this.handleByDomainEvent(value);
				break;
			case QueueSchemasEnum.BROADCAST:
				this.subscriptionService.broadcast(value);
				break;
			case QueueSchemasEnum.NEW_CONNECTION:
				this.subscriptionService.emit(value, WebSocketRoomsEnum.NEW_CONNECTIONS);
				break;
			case QueueSchemasEnum.DISABLE_ALL_ROUTES:
				if (this.validatedBeforeEmitEvent(value))
					this.eventEmitterClient.send(EmitterEventsEnum.DISABLE_ALL_ROUTES, value?.payload?.disable);
				break;
			case QueueSchemasEnum.DISABLE_LOGIN:
				if (this.validatedBeforeEmitEvent(value))
					this.eventEmitterClient.send(EmitterEventsEnum.DISABLE_LOGIN, value?.payload?.disable);
				break;
			default:
				this.logger.warn('Unhandled event:', value);
				throw this.exceptions.internal({ message: 'Unhandled event', details: value });
		}
	}

	private async handleByDomainEvent(value: EventPayloadInterface): Promise<void> {
		switch (value.payload.event) {
			case QueueDomainEventsEnum.NEW_HOOK:
				await this.webhookService.pullHook(value.payload.event, value.payload);
				break;
			default:
				this.logger.warn('Unhandled event:', value);
				throw this.exceptions.internal({ message: 'Unhandled event', details: value });
		}
	}

	private validatedBeforeEmitEvent(value: EventPayloadInterface): boolean {
		return value?.payload?.envSecretHash === this.envSecretHash;
	}
}
