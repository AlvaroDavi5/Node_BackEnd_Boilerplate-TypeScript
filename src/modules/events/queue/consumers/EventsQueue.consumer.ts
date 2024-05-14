import { Injectable, Inject } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import MongoClient from '@core/infra/data/Mongo.client';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.provider';
import { LoggerInterface } from '@core/logging/logger';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import { ProcessEventsEnum } from '@common/enums/processEvents.enum';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import configs from '@core/configs/configs.config';
import Exceptions from '@core/errors/Exceptions';


const appConfigs = configs();
const { queueName: eventsQueueName, queueUrl: eventsQueueUrl } = appConfigs.integration.aws.sqs.eventsQueue;

@Injectable()
export default class EventsQueueConsumer {
	private readonly name: string;
	private readonly logger: LoggerInterface;
	private errorsCount = 0;

	constructor(
		private readonly sqsClient: SqsClient,
		private readonly mongoClient: MongoClient,
		private readonly eventsQueueHandler: EventsQueueHandler,
		private readonly exceptions: Exceptions,
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.name = EventsQueueConsumer.name;
		this.logger = this.loggerProvider.getLogger(this.name);
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

		const newError = this.exceptions.integration({
			name: error.name,
			message: error.message,
			stack: error.stack,
		});
		newError.name = `${newError.name}.QueueError`;

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
		this.logger.error(`Event error from queue. Error: ${error.message}`);
		this.errorsCount += 1;
		this.checkError(error);
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.TIMEOUT_ERROR)
	public onTimeoutError(error: Error): void {
		this.logger.error(`Timeout error from queue. Error: ${error.message}`);
		this.errorsCount += 1;
		this.checkError(error);
	}
}
