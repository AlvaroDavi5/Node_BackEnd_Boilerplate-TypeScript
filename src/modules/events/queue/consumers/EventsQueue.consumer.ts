import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { SqsConsumerOptions } from '@ssut/nestjs-sqs/dist/sqs.types';
import { Message } from '@aws-sdk/client-sqs';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import MongoClient from '@core/infra/data/Mongo.client';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import envsConfig from '@core/configs/envs.config';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import { ProcessEventsEnum } from '@common/enums/processEvents.enum';
import { secondsToMilliseconds } from '@common/utils/dates.util';
import SqsClientMock from '@dev/localstack/queues/SqsClient';
import { configServiceMock, cryptographyServiceMock, dataParserHelperMock, loggerProviderMock } from '@dev/mocks/mockedModules';


const appConfigs = envsConfig();
const { region: awsRegion } = appConfigs.integration.aws.credentials;
const { queueName: eventsQueueName, queueUrl: eventsQueueUrl } = appConfigs.integration.aws.sqs.eventsQueue;
const sqsClientMock = new SqsClientMock(
	configServiceMock as unknown as ConfigService,
	cryptographyServiceMock,
	loggerProviderMock,
	dataParserHelperMock,
);

export const eventsQueueConsumerConfigs: SqsConsumerOptions = {
	name: eventsQueueName,
	queueUrl: eventsQueueUrl,
	sqs: sqsClientMock.getClient(),
	region: awsRegion,
	batchSize: 10,
	shouldDeleteMessages: false,
	// suppressFifoWarning: true,
	pollingWaitTimeMs: 10,
	waitTimeSeconds: 20,
	visibilityTimeout: 20,
	handleMessageTimeout: secondsToMilliseconds(1),
	authenticationErrorTimeout: secondsToMilliseconds(10),
};

@Injectable()
export default class EventsQueueConsumer {
	private readonly name: string;
	private errorsCount = 0;

	constructor(
		private readonly sqsClient: SqsClient,
		private readonly mongoClient: MongoClient,
		private readonly eventsQueueHandler: EventsQueueHandler,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) {
		this.name = eventsQueueName;
		this.logger.debug(`Created ${this.name} consumer`);
	}

	@SqsMessageHandler(eventsQueueName, true)
	public async handleMessageBatch(messages: Message[]): Promise<void> {
		for (const message of messages) {
			this.logger.info(`New message received from ${this.name}`);
			const done = await this.eventsQueueHandler.execute(message);
			if (done)
				await this.sqsClient.deleteMessage(eventsQueueUrl, message);
			this.errorsCount = 0;
		}
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
		this.logger.error(`Consume error from ${this.name}: ${error.message}`);
		this.errorsCount += 1;
		this.checkError(error);
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.TIMEOUT_ERROR)
	public onTimeoutError(error: Error): void {
		this.logger.error(`Timeout error from ${this.name}: ${error.message}`);
		this.errorsCount += 1;
		this.checkError(error);
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
}
