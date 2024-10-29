import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import LoggerService from '@core/logging/Logger.service';
import CryptographyService from '@core/security/Cryptography.service';
import { ConfigsInterface } from '@core/configs/envs.config';
import { EventSchemaInterface } from '@events/queue/handlers/schemas/event.schema';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { fromDateTimeToISO, getDateTimeNow } from '@common/utils/dates.util';


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
	private readonly credentials: {
		queueName: string,
		queueUrl: string,
	};

	private readonly applicationName: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly sqsClient: SqsClient,
		private readonly logger: LoggerService,
	) {
		const { sqs: { eventsQueue } } = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		this.credentials = eventsQueue;

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
			timestamp: fromDateTimeToISO(getDateTimeNow(TimeZonesEnum.America_SaoPaulo)),
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
