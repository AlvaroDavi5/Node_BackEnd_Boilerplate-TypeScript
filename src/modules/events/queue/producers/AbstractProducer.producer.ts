import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import LoggerService from '@core/logging/Logger.service';
import CryptographyService from '@core/security/Cryptography.service';
import { ConfigsInterface } from '@core/configs/envs.config';
import { QueueSchemasEnum } from '@domain/enums/events.enum';
import { EventPayloadInterface } from '@events/queue/handlers/schemas/eventPayload.schema';
import { captureException } from '@common/utils/sentryCalls.util';
import { cloneObject, checkFieldsExistence, replaceFields } from '@common/utils/objectRecursiveFunctions.util';
import { getDateTimeNow, fromDateTimeToISO } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';


interface EventDispatchInterface {
	payload: Record<string, unknown>,
	schema: QueueSchemasEnum,
	author?: string,
	title?: string,
}
type queueCredentialsKeyType = Exclude<keyof ConfigsInterface['integration']['aws']['sqs'], 'apiVersion' | 'maxAttempts'>;

@Injectable()
export default abstract class AbstractQueueProducer {
	protected configService: ConfigService;
	protected cryptographyService: CryptographyService;
	protected sqsClient: SqsClient;
	protected logger: LoggerService;
	protected producerName: string;
	protected queueName: string;
	protected queueUrl: string;
	private readonly applicationName: string;

	constructor(
		producerName: string,
		queueCredentialsKey: queueCredentialsKeyType,
		configService: ConfigService,
		cryptographyService: CryptographyService,
		sqsClient: SqsClient,
		logger: LoggerService,
	) {
		this.configService = configService;
		this.cryptographyService = cryptographyService;
		this.sqsClient = sqsClient;
		this.logger = logger;

		const appName = this.configService.get<ConfigsInterface['application']['name']>('application.name');
		this.applicationName = String(appName);
		const {
			[queueCredentialsKey]: { queueName, queueUrl }
		} = this.configService.get<ConfigsInterface['integration']['aws']['sqs']>('integration.aws.sqs')!;

		this.producerName = producerName;
		this.queueName = queueName;
		this.queueUrl = queueUrl;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private buildMessageBody(payload: any, schema: QueueSchemasEnum): EventPayloadInterface {
		return {
			id: this.cryptographyService.generateUuid(),
			payload,
			schema,
			schemaVersion: 1.0,
			source: this.producerName,
			timestamp: fromDateTimeToISO(getDateTimeNow(TimeZonesEnum.America_SaoPaulo)),
		};
	}

	private maskSensitiveData(data: object = {}) {
		const sensitiveDataFields: string[] = ['password', 'newPassword', 'cvv', 'pin'];

		const hasSensitiveData: boolean = checkFieldsExistence(data, sensitiveDataFields as (keyof object)[]);
		if (hasSensitiveData) {
			const newData = cloneObject(data);
			return replaceFields(newData, sensitiveDataFields as (keyof object)[], '***');
		}

		return data;
	}

	public async dispatch({ payload, schema, author, title }: EventDispatchInterface): Promise<string | null> {
		const message = this.buildMessageBody(payload, schema);

		try {
			const messageId = await this.sqsClient.sendMessage(
				this.queueUrl,
				title ?? 'New Message',
				`${author ?? this.producerName}, ${this.applicationName}`,
				message,
			);
			this.logger.info(`Sended message to queue ${this.queueName} - MessageId: ${messageId}`);
			return messageId;
		} catch (error) {
			this.logger.error(`Error to send message to queue ${this.queueName}`, error);
			const { payload: messagePayload, ...messageData } = message;
			captureException(error, {
				data: { ...this.maskSensitiveData(messagePayload), ...messageData },
				user: { title, author },
			});
			return null;
		}
	}
}
