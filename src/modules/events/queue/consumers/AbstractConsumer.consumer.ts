import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from '@aws-sdk/client-sqs';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import MongoClient from '@core/infra/data/Mongo.client';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import { ConfigsInterface } from '@core/configs/envs.config';
import { captureException } from '@common/utils/sentryCalls.util';
import { QueueNamesEnum } from '@common/enums/queueNames.enum';


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
	protected queueName: QueueNamesEnum;
	protected queueUrl: string;
	private errorsCount = 0;
	private disabled = false;

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

		this.logger.debug(`Starting to consume ${this.queueName} queue`);
	}

	public disable(): void {
		this.logger.warn(`Disabling consumer ${this.consumerName}`);
		this.disabled = true;
	}

	public enable(): void {
		this.logger.info(`Enabling consumer ${this.consumerName}`);
		this.disabled = false;
	}

	protected async handleMessage(message: Message): Promise<void> {
		if (message.MessageId) this.logger.setMessageId(message.MessageId);
		this.logger.info(`New message received from ${this.queueName}`);

		if (this.disabled) {
			throw this.exceptions.internal({
				message: `Consumer ${this.consumerName} is disabled`,
				details: `MessageId: ${message.MessageId}`,
			});
		}

		const done = await this.messageHandler.execute(message);
		if (done)
			await this.deleteMessage(message);
		this.resetErrorsCount();
	}

	protected async handleProcessingError(error: Error, message: Message): Promise<void> {
		if (message.MessageId) this.logger.setMessageId(message.MessageId);
		this.logger.error(`Processing error from ${this.queueName}. Error: ${error.message}`);

		const messageData = { originalPayload: message.Body, messageId: message.MessageId };
		const consumerData = { consumer: this.consumerName, queueUrl: this.queueUrl };
		try {
			captureException(error, { data: messageData, user: consumerData });
			await this.saveUnprocessedMessage(message);
		} catch (err) {
			captureException(err, { data: messageData, user: consumerData });
		}
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
			await this.deleteMessage(message);
		}
	}

	private async deleteMessage(message: Message): Promise<boolean> {
		return await this.sqsClient.deleteMessage(this.queueUrl, message);
	}

	private increaseError(error: Error): void {
		this.errorsCount += 1;
		if (this.errorsCount < 10)
			return;

		captureException(error, { user: { consumer: this.consumerName, queueUrl: this.queueUrl } });
		throw error;
	}

	private resetErrorsCount(): void {
		this.errorsCount = 0;
	}
}
