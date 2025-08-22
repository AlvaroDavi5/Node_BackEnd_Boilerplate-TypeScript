import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import MongoClient from '@core/infra/data/Mongo.client';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import { ProcessEventsEnum } from '@common/enums/processEvents.enum';
import { QueueNamesEnum } from '@common/enums/queueNames.enum';
import AbstractQueueConsumer from './AbstractConsumer.consumer';
import type { Message } from '@aws-sdk/client-sqs';


const EVENTS_QUEUE_NAME = QueueNamesEnum.EVENTS_QUEUE;

@Injectable()
export default class EventsQueueConsumer extends AbstractQueueConsumer {
	constructor(
		eventsQueueHandler: EventsQueueHandler,
		configService: ConfigService,
		sqsClient: SqsClient,
		mongoClient: MongoClient,
		exceptions: Exceptions,
		logger: LoggerService,
	) {
		super(
			EventsQueueConsumer.name,
			'eventsQueue',
			eventsQueueHandler,
			configService,
			sqsClient,
			mongoClient,
			exceptions,
			logger,
		);
	}

	@SqsMessageHandler(EVENTS_QUEUE_NAME, true)
	public async handleMessageBatch(messages: Message[]): Promise<void> {
		for (const message of messages) {
			await this.handleMessage(message);
		}
	}

	@SqsConsumerEventHandler(EVENTS_QUEUE_NAME, ProcessEventsEnum.PROCESSING_ERROR)
	public async onProcessingError(error: Error, message: Message): Promise<void> {
		await this.handleProcessingError(error, message);
	}

	@SqsConsumerEventHandler(EVENTS_QUEUE_NAME, ProcessEventsEnum.ERROR)
	public onError(error: Error): void {
		this.handleError(error);
	}

	@SqsConsumerEventHandler(EVENTS_QUEUE_NAME, ProcessEventsEnum.TIMEOUT_ERROR)
	public onTimeoutError(error: Error): void {
		this.handleTimeoutError(error);
	}
}
