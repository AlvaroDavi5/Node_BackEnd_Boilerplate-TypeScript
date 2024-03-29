import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import CryptographyService from '@core/infra/security/Cryptography.service';
import { ConfigsInterface } from '@core/configs/configs.config';
import { EventSchemaInterface } from '@events/queue/handlers/schemas/event.schema';


interface EventDispatchInterface {
	payload: {
		[key: string]: any,
	},
	schema: string,
	author?: string,
	title?: string,
}

@Injectable()
export default class EventsQueueProducer {
	private readonly logger: Logger;
	private readonly credentials: {
		queueName: string,
		queueUrl: string,
	};

	private readonly applicationName: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly sqsClient: SqsClient,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly dateGeneratorHelper: DateGeneratorHelper,
	) {
		this.logger = this.loggerGenerator.getLogger();
		const { queueName, queueUrl }: ConfigsInterface['integration']['aws']['sqs']['eventsQueue'] = this.configService.get<any>('integration.aws.sqs.eventsQueue');
		this.credentials = {
			queueName,
			queueUrl,
		};
		const appName: ConfigsInterface['application']['name'] = this.configService.get<any>('application.name');
		this.applicationName = String(appName);
	}

	private _buildMessageBody({ payload, schema }: { payload: any, schema?: string }): EventSchemaInterface {
		return {
			id: this.cryptographyService.generateUuid(),
			schema: schema || 'EVENTS',
			schemaVersion: 1.0,
			payload,
			source: 'BOILERPLATE',
			timestamp: this.dateGeneratorHelper.getDate(),
		};
	}

	public async dispatch({ payload, schema, author, title }: EventDispatchInterface): Promise<string | null> {
		const message = this._buildMessageBody({ payload, schema });

		try {
			const messageId = await this.sqsClient.sendMessage(
				this.credentials.queueUrl,
				title || 'New Event',
				author || this.applicationName,
				message,
			);
			this.logger.info(`Sended message to queue ${this.credentials.queueName}`);
			return messageId;
		} catch (error) {
			this.logger.error(`Error to send message to queue ${this.credentials.queueName}: ${error}`);
			return null;
		}
	}
}
