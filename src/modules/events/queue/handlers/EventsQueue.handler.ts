import { Injectable } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import SubscriptionService from '@modules/app/services/Subscription.service';
import MongoClient from '@infra/data/Mongo.client';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import Exceptions from '@infra/errors/Exceptions';
import eventSchema from './schemas/event.schema';


@Injectable()
export default class EventsQueueHandler {
	private readonly logger: Logger;

	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly mongoClient: MongoClient,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly exceptions: Exceptions,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public async execute(message: Message): Promise<boolean> {
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
					return true;
				}
			}
		} catch (error) {
			this.logger.error(error);

			const datalake = this.mongoClient.databases.datalake;
			const unprocessedMessagesCollection = this.mongoClient.getCollection(datalake.db, datalake.collections.unprocessedMessages);
			await this.mongoClient.insertOne(unprocessedMessagesCollection, message);

			return true;
		}

		return false;
	}
}
