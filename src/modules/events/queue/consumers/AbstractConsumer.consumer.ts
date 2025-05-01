import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from '@aws-sdk/client-sqs';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import MongoClient from '@core/infra/data/Mongo.client';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import { ConfigsInterface } from '@core/configs/envs.config';


type queueCredentialsKeyType = Exclude<keyof ConfigsInterface['integration']['aws']['sqs'], 'apiVersion' | 'maxAttempts'>;

@Injectable()
export default abstract class AbstractQueueConsumer {
	protected messageHandler: { execute: (message: Message) => Promise<boolean> | boolean };
	protected configService: ConfigService;
	protected sqsClient: SqsClient;
	protected mongoClient: MongoClient;
	protected exceptions: Exceptions;
	protected logger: LoggerService;
	protected consumerName: string;
	protected queueName: string;
	protected queueUrl: string;
	private errorsCount = 0;

	constructor(
		consumerName: string,
		queueCredentialsKey: queueCredentialsKeyType,
		messageHandler: { execute: (message: Message) => Promise<boolean> | boolean },
		configService: ConfigService,
		sqsClient: SqsClient,
		mongoClient: MongoClient,
		exceptions: Exceptions,
		logger: LoggerService,
	) {
		this.messageHandler = messageHandler;
		this.configService = configService;
		this.sqsClient = sqsClient;
		this.mongoClient = mongoClient;
		this.exceptions = exceptions;
		this.logger = logger;

		const {
			[queueCredentialsKey]: { queueName, queueUrl }
		} = this.configService.get<ConfigsInterface['integration']['aws']['sqs']>('integration.aws.sqs')!;

		this.consumerName = consumerName;
		this.queueName = queueName;
		this.queueUrl = queueUrl;

		this.logger.debug(`Created ${this.consumerName} to consume ${this.queueName} queue`);
	}

	protected async handleMessage(message: Message): Promise<void> {
		this.logger.info(`New message received from ${this.queueName}`);
		const done = await this.messageHandler.execute(message);
		if (done)
			await this.deleteMessage(message);
		this.resetErrorsCount();
	}

	protected async handleProcessingError(error: Error, message: Message): Promise<void> {
		this.logger.error(`Processing error from ${this.queueName} - MessageId: ${message?.MessageId}. Error: ${error.message}`);
		await this.saveUnprocessedMessage(message);
		this.increaseError(error);
	}

	protected handleError(error: Error): void {
		this.logger.error(`Consume error from ${this.queueName}: ${error.message}`);
		this.increaseError(error);
	}

	protected handleTimeoutError(error: Error): void {
		this.logger.error(`Timeout error from ${this.queueName}: ${error.message}`);
		this.increaseError(error);
	}

	private async saveUnprocessedMessage(message: Message): Promise<void> {
		const { datalake } = this.mongoClient.databases;
		const unprocessedMessagesCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.unprocessedMessages);

		const wasStored = (await this.mongoClient.insertOne(unprocessedMessagesCollection, message)).insertedId;
		if (wasStored) {
			// REVIEW - behavior will change if DLQ is enabled
			await this.sqsClient.deleteMessage(this.queueUrl, message);
		}
	}

	private async deleteMessage(message: Message): Promise<boolean> {
		return await this.sqsClient.deleteMessage(this.queueUrl, message);
	}

	private increaseError(error: Error): void {
		this.errorsCount += 1;
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

	private resetErrorsCount(): void {
		this.errorsCount = 0;
	}
}
