import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import MongoClient from '@core/infra/data/Mongo.client';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import { ProcessEventsEnum } from '@common/enums/processEvents.enum';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import configs from '@core/configs/configs.config';


const appConfigs = configs();
const eventsQueueName = appConfigs.integration.aws.sqs.eventsQueue.queueName;
const eventsQueueUrl = appConfigs.integration.aws.sqs.eventsQueue.queueUrl;

@Injectable()
export default class EventsQueueConsumer {
	private readonly name: string;
	private readonly logger: Logger;
	private errorsCount = 0;

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
			this.errorsCount = 0;
		}
	}

	private checkError(error: Error): void {
		if (this.errorsCount < 20)
			return;

		const newError = new Error(error.message);
		newError.name = 'QueueError';
		newError.stack = error.stack;

		throw newError;
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.PROCESSING_ERROR)
	public async onProcessingError(error: Error, message: Message): Promise<void> {
		this.logger.error(`Processing error from ${this.name} - MessageId: ${message?.MessageId}. Error: ${error.message}`);

		const datalake = this.mongoClient.databases.datalake;
		const unprocessedMessagesCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.unprocessedMessages);
		const wasStored = (await this.mongoClient.insertOne(unprocessedMessagesCollection, message)).insertedId;
		if (wasStored)
			await this.sqsClient.deleteMessage(eventsQueueUrl, message);
		this.errorsCount += 1;
		this.checkError(error);
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.ERROR)
	public onError(error: Error): void {
		this.logger.error(`Event error from ${this.name}. Error: ${error.message}`);
		this.errorsCount += 1;
		this.checkError(error);
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.TIMEOUT_ERROR)
	public onTimeoutError(error: Error): void {
		this.logger.error(`Timeout error from ${this.name}. Error: ${error.message}`);
		this.errorsCount += 1;
		this.checkError(error);
	}
}
