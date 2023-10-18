import { Injectable } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { Logger } from 'winston';
import SubscriptionService from '@modules/app/services/Subscription.service';
import MongoClient from '@infra/data/Mongo.client';
import SchemaValidator from '@modules/utils/common/validators/SchemaValidator.validator';
import DataParserHelper from '@modules/utils/helpers/DataParser.helper';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import eventSchema, { EventSchemaInterface } from './schemas/event.schema';


@Injectable()
export default class EventsQueueHandler {
	private readonly logger: Logger;

	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly mongoClient: MongoClient,
		private readonly schemaValidator: SchemaValidator<EventSchemaInterface>,
		private readonly dataParserHelper: DataParserHelper,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public async execute(message: Message): Promise<boolean> {
		try {
			if (message.Body) {
				const data = this.dataParserHelper.toObject(message.Body);
				const value = this.schemaValidator.validate(data, eventSchema);

				this.subscriptionService.broadcast(value);

				return true;
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
