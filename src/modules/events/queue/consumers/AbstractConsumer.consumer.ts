import { Injectable } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import MongoClient from '@core/infra/data/Mongo.client';
import Exceptions from '@core/errors/Exceptions';


@Injectable()
export default abstract class AbstractQueueConsumer {
	protected sqsClient: SqsClient;
	protected mongoClient: MongoClient;
	protected exceptions: Exceptions;

	constructor(
		sqsClient: SqsClient,
		mongoClient: MongoClient,
		exceptions: Exceptions,
	) {
		this.sqsClient = sqsClient;
		this.mongoClient = mongoClient;
		this.exceptions = exceptions;
	}

	private errorsCount = 0;

	protected async deleteMessage(queueUrl: string, message: Message): Promise<boolean> {
		return await this.sqsClient.deleteMessage(queueUrl, message);
	}

	protected async saveUnprocessedMessage(queueUrl: string, message: Message): Promise<void> {
		const { datalake } = this.mongoClient.databases;
		const unprocessedMessagesCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.unprocessedMessages);

		const wasStored = (await this.mongoClient.insertOne(unprocessedMessagesCollection, message)).insertedId;
		if (wasStored) {
			// REVIEW - behavior will change if DLQ is enabled
			await this.sqsClient.deleteMessage(queueUrl, message);
		}
	}

	protected resetErrorsCount(): void {
		this.errorsCount = 0;
	}

	protected increaseError(error: Error): void {
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
}
