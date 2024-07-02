import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import { SINGLETON_LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.service';
import { LoggerInterface } from '@core/logging/logger';
import CryptographyService from '@core/security/Cryptography.service';
import { ConfigsInterface } from '@core/configs/envs.config';
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
	private readonly logger: LoggerInterface;
	private readonly credentials: {
		queueName: string,
		queueUrl: string,
	};

	private readonly applicationName: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly sqsClient: SqsClient,
		@Inject(SINGLETON_LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
		private readonly dateGeneratorHelper: DateGeneratorHelper,
	) {
		this.logger = this.loggerProvider.getLogger(EventsQueueProducer.name);
		const { queueName, queueUrl } = this.configService.get<ConfigsInterface['integration']['aws']['sqs']['eventsQueue']>('integration.aws.sqs.eventsQueue')!;
		this.credentials = {
			queueName,
			queueUrl,
		};
		const appName = this.configService.get<ConfigsInterface['application']['name']>('application.name')!;
		this.applicationName = String(appName);
	}

	private buildMessageBody({ payload, schema }: { payload: any, schema?: string }): EventSchemaInterface {
		return {
			id: this.cryptographyService.generateUuid(),
			schema: schema || 'EVENTS',
			schemaVersion: 1.0,
			payload,
			source: 'BOILERPLATE',
			timestamp: this.dateGeneratorHelper.getDate(new Date(), 'jsDate', true),
		};
	}

	public async dispatch({ payload, schema, author, title }: EventDispatchInterface): Promise<string | null> {
		const message = this.buildMessageBody({ payload, schema });

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
