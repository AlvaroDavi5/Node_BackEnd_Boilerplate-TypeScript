import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import SubscriptionService from 'src/modules/app/services/SubscriptionService';
import LoggerGenerator from '@infra/logging/LoggerGenerator';
import Exceptions from '@infra/errors/Exceptions';
import eventSchema from '../schemas/eventSchema';
import { ConfigsInterface } from '@configs/configs';
import dotenv from 'dotenv';
dotenv.config();


const queueUrl = process.env.AWS_SQS_EVENTS_QUEUE_URL || 'http://localhost:4566/000000000000/eventsQueue.fifo';
@Injectable()
export default class EventsQueueConsumer {
	private readonly logger: Logger;
	private readonly sqsQueueName: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly subscriptionService: SubscriptionService,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly exceptions: Exceptions,
	) {
		this.logger = this.loggerGenerator.getLogger();
		const { queueName }: ConfigsInterface['integration']['aws']['sqs']['eventsQueue'] = this.configService.get<any>('integration.aws.sqs.eventsQueue');
		this.sqsQueueName = queueName || 'eventsQueue.fifo';
	}

	@SqsMessageHandler(queueUrl, true)
	public async handleMessageBatch(messages: Message[]) {
		for (const message of messages) {
			try {
				this.logger.info(`New message received from [${this.sqsQueueName}]`);

				if (message.Body) {
					const data = JSON.parse(message.Body);
					const { value, error } = eventSchema.validate(
						data,
						{ stripUnknown: false }
					);

					if (error)
						throw this.exceptions.contract({
							name: error.name,
							message: error.message,
							stack: error.stack,
						});

					this.subscriptionService.broadcast(value);
				}
			} catch (error) {
				this.logger.error(error);
			}
		}
	}

	@SqsConsumerEventHandler(queueUrl, 'error')
	public onError(error: Error, message: Message) {
		this.logger.error(`[${EventsQueueConsumer.name}] event error. QueueName: ${this.sqsQueueName} MessageId: ${message.MessageId} Error: ${error.message}`);
	}

	@SqsConsumerEventHandler(queueUrl, 'processing_error')
	public onProcessingError(error: Error, message: Message) {
		this.logger.error(`[${EventsQueueConsumer.name}] processing error. QueueName: ${this.sqsQueueName} MessageId: ${message.MessageId} Error: ${error.message}`);
	}
}
