import { Injectable } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import SubscriptionService from 'src/modules/app/services/Subscription.service';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import Exceptions from '@infra/errors/Exceptions';
import eventSchema from './schemas/event.schema';


@Injectable()
export default class EventsQueueHandler {
	private readonly logger: Logger;

	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly exceptions: Exceptions,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public async execute(message: Message): Promise<void> {
		try {
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
