import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import EventsQueueHandler from '../handlers/EventsQueue.handler';
import dotenv from 'dotenv';
dotenv.config();


const eventsQueueName = process.env.AWS_SQS_EVENTS_QUEUE_NAME || 'eventsQueue.fifo';
@Injectable()
export default class EventsQueueConsumer {
	private readonly logger: Logger;
	private readonly sqsQueueName: string;

	constructor(
		private readonly loggerGenerator: LoggerGenerator,
		private readonly eventsQueueHandler: EventsQueueHandler,
	) {
		this.logger = this.loggerGenerator.getLogger();
		this.sqsQueueName = EventsQueueConsumer.name;
	}

	@SqsMessageHandler(eventsQueueName, true)
	public async handleMessageBatch(messages: Message[]): Promise<void> {
		for (const message of messages) {
			this.logger.info(`New message received from [${this.sqsQueueName}]`);
			this.eventsQueueHandler.execute(message);
		}
	}

	@SqsConsumerEventHandler(eventsQueueName, 'error')
	public onError(error: Error, message: Message): void {
		this.logger.error(`[${EventsQueueConsumer.name}] event error from [${this.sqsQueueName}] - MessageId: ${message?.MessageId}. Error: ${error.message}`);
	}

	@SqsConsumerEventHandler(eventsQueueName, 'processing_error')
	public onProcessingError(error: Error, message: Message): void {
		this.logger.error(`[${EventsQueueConsumer.name}] processing error from [${this.sqsQueueName}] - MessageId: ${message?.MessageId}. Error: ${error.message}`);
	}
}
