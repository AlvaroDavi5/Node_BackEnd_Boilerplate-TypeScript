import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import { ProcessEventsEnum } from '@infra/start/processEvents.enum';
import EventsQueueHandler from '../handlers/EventsQueue.handler';
import dotenv from 'dotenv';
dotenv.config();


const eventsQueueName = process.env.AWS_SQS_EVENTS_QUEUE_NAME || 'eventsQueue.fifo';
@Injectable()
export default class EventsQueueConsumer {
	private readonly name: string;
	private readonly logger: Logger;

	constructor(
		private readonly loggerGenerator: LoggerGenerator,
		private readonly eventsQueueHandler: EventsQueueHandler,
	) {
		this.name = EventsQueueConsumer.name;
		this.logger = this.loggerGenerator.getLogger();
		this.logger.debug(`Created ${this.name}`);
	}

	@SqsMessageHandler(eventsQueueName, true)
	public async handleMessageBatch(messages: Message[]): Promise<void> {
		for (const message of messages) {
			this.logger.info(`New message received from ${this.name}`);
			await this.eventsQueueHandler.execute(message);
		}
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.ERROR)
	public onError(error: Error, message: Message): void {
		this.logger.error(`Event error from ${this.name} - MessageId: ${message?.MessageId}. Error: ${error.message}`);
	}

	@SqsConsumerEventHandler(eventsQueueName, ProcessEventsEnum.PROCESSING_ERROR)
	public onProcessingError(error: Error, message: Message): void {
		this.logger.error(`Processing error from ${this.name} - MessageId: ${message?.MessageId}. Error: ${error.message}`);
	}
}
