import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import MongoClient from '@core/infra/data/Mongo.client';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import { ProcessEventsEnum } from '@core/infra/start/processEvents.enum';
import EventsQueueHandler from '../handlers/EventsQueue.handler';
import dotenv from 'dotenv';
dotenv.config();


const eventsQueueName = process.env.AWS_SQS_EVENTS_QUEUE_NAME || 'eventsQueue.fifo';
const eventsQueueUrl = process.env.AWS_SQS_EVENTS_QUEUE_URL || 'http://localhost:4566/000000000000/eventsQueue.fifo';
@Injectable()
export default class EventsQueueConsumer {
	private readonly name: string;
	private readonly logger: Logger;

	constructor(
		private readonly sqsClient: SqsClient,
		private readonly mongoClient: MongoClient,
		private readonly eventsQueueHandler: EventsQueueHandler,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.name = EventsQueueConsumer.name;
		this.logger = this.loggerGenerator.getLogger();
		this.logger.debug(`Created ${this.name}`);
	}

	@SqsMessageHandler(eventsQueueName, true)
	public async handleMessageBatch(messages: Message[]): Promise<void> {
		for (const message of messages) {
			this.logger.info(`New message received from ${this.name}`);
			const wasProcessed = await this.eventsQueueHandler.execute(message);
			if (wasProcessed)
				await this.sqsClient.deleteMessage(eventsQueueUrl, message);
		}
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.PROCESSING_ERROR)
	public async onProcessingError(error: Error, message: Message): Promise<void> {
		this.logger.error(`Processing error from ${this.name} - MessageId: ${message?.MessageId}. Error: ${error.message}`);

		const datalake = this.mongoClient.databases.datalake;
		const unprocessedMessagesCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.unprocessedMessages);
		const wasStored = (await this.mongoClient.insertOne(unprocessedMessagesCollection, message)).insertedId;
		if (wasStored)
			await this.sqsClient.deleteMessage(eventsQueueUrl, message);
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.ERROR)
	public onError(error: Error): void {
		this.logger.error(`Event error from ${this.name}. Error: ${error.message}`);
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.TIMEOUT_ERROR)
	public onTimeoutError(error: Error): void {
		this.logger.error(`Timeout error from ${this.name}. Error: ${error.message}`);
	}
}
