import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import SubscriptionService from 'src/modules/app/services/SubscriptionService';
import LoggerGenerator from '@infra/logging/LoggerGenerator';
import Exceptions from '@infra/errors/Exceptions';
import eventSchema from '../schemas/eventSchema';
import dotenv from 'dotenv';
dotenv.config();


const eventsQueueName = process.env.AWS_SQS_EVENTS_QUEUE_NAME || 'eventsQueue.fifo';
@Injectable()
export default class EventsQueueConsumer {
	private readonly logger: Logger;
	private readonly sqsQueueName: string;

	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly exceptions: Exceptions,
	) {
		this.logger = this.loggerGenerator.getLogger();
		this.sqsQueueName = EventsQueueConsumer.name;
	}

	@SqsMessageHandler(eventsQueueName, true)
	public async handleMessageBatch(messages: Message[]): Promise<void> {
		for (const message of messages) {
			try {
				this.logger.info(`New message received from [${this.sqsQueueName}]`);

				if (message.Body) {
					const data = JSON.parse(message.Body);
					const { value, error } = eventSchema.validate(
						data,
						{ stripUnknown: false }
					);

					if (error) {
						throw this.exceptions.contract({
							name: error.name,
							message: error.message,
							stack: error.stack,
						});
					}
					else {
						this.subscriptionService.broadcast(value);
					}
				}
			} catch (error) {
				this.logger.error(error);
			}
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
