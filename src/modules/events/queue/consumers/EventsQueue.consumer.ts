import { Injectable, Inject } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { SqsConsumerOptions } from '@ssut/nestjs-sqs/dist/sqs.types';
import { Message } from '@aws-sdk/client-sqs';
import MongoClient from '@core/infra/data/Mongo.client';
import { SINGLETON_LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.service';
import { LoggerInterface } from '@core/logging/logger';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import { ProcessEventsEnum } from '@common/enums/processEvents.enum';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import envsConfig from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import SqsClientMock from '@dev/localstack/queues/SqsClient';
import { configServiceMock, cryptographyServiceMock, dataParserHelperMock, loggerProviderMock } from '@dev/mocks/mockedModules';


const appConfigs = envsConfig();
const { region: awsRegion } = appConfigs.integration.aws.credentials;
const { queueName: eventsQueueName, queueUrl: eventsQueueUrl } = appConfigs.integration.aws.sqs.eventsQueue;
const sqsClient = new SqsClientMock(
	configServiceMock as any,
	cryptographyServiceMock,
	loggerProviderMock,
	dataParserHelperMock,
).getClient();

export const eventsQueueConsumerConfigs: SqsConsumerOptions = {
	name: eventsQueueName,
	queueUrl: eventsQueueUrl,
	sqs: sqsClient,
	region: awsRegion,
	batchSize: 10,
	shouldDeleteMessages: false,
	pollingWaitTimeMs: 10,
	waitTimeSeconds: 20,
	handleMessageTimeout: (1 * 1000),
	authenticationErrorTimeout: (10 * 1000),
};

@Injectable()
export default class EventsQueueConsumer {
	private readonly logger: LoggerInterface;
	private readonly name: string;
	private errorsCount = 0;

	constructor(
		private readonly sqsClient: SqsClient,
		private readonly mongoClient: MongoClient,
		private readonly eventsQueueHandler: EventsQueueHandler,
		private readonly exceptions: Exceptions,
		@Inject(SINGLETON_LOGGER_PROVIDER)
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

		const { datalake } = this.mongoClient.databases;
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
