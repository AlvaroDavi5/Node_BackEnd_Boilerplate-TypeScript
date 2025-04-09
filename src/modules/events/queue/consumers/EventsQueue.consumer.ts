import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import MongoClient from '@core/infra/data/Mongo.client';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import envsConfig from '@core/configs/envs.config';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import { ProcessEventsEnum } from '@common/enums/processEvents.enum';
import AbstractQueueConsumer from './AbstractConsumer.consumer';


const appConfigs = envsConfig();
const { queueName: eventsQueueName, queueUrl: eventsQueueUrl } = appConfigs.integration.aws.sqs.eventsQueue;

export const EVENTS_QUEUE_NAME = eventsQueueName ?? 'EVENTS_QUEUE_NAME';

@Injectable()
export default class EventsQueueConsumer extends AbstractQueueConsumer {
	private readonly name: string;

	constructor(
		sqsClient: SqsClient,
		mongoClient: MongoClient,
		exceptions: Exceptions,
		private readonly logger: LoggerService,
		private readonly eventsQueueHandler: EventsQueueHandler,
	) {
		super(sqsClient, mongoClient, exceptions);
		this.name = EVENTS_QUEUE_NAME;
		this.logger.debug(`Created ${this.name} consumer`);
	}

	@SqsMessageHandler(EVENTS_QUEUE_NAME, true)
	public async handleMessageBatch(messages: Message[]): Promise<void> {
		for (const message of messages) {
			this.logger.info(`New message received from ${this.name}`);
			const done = await this.eventsQueueHandler.execute(message);
			if (done)
				await this.deleteMessage(eventsQueueUrl, message);
			this.resetErrorsCount();
		}
	}

	@SqsConsumerEventHandler(EVENTS_QUEUE_NAME, ProcessEventsEnum.PROCESSING_ERROR)
	public async onProcessingError(error: Error, message: Message): Promise<void> {
		this.logger.error(`Processing error from ${this.name} - MessageId: ${message?.MessageId}. Error: ${error.message}`);
		await this.saveUnprocessedMessage(eventsQueueUrl, message);
		this.increaseError(error);
	}

	@SqsConsumerEventHandler(EVENTS_QUEUE_NAME, ProcessEventsEnum.ERROR)
	public onError(error: Error): void {
		this.logger.error(`Consume error from ${this.name}: ${error.message}`);
		this.increaseError(error);
	}

	@SqsConsumerEventHandler(EVENTS_QUEUE_NAME, ProcessEventsEnum.TIMEOUT_ERROR)
	public onTimeoutError(error: Error): void {
		this.logger.error(`Timeout error from ${this.name}: ${error.message}`);
		this.increaseError(error);
	}
}
