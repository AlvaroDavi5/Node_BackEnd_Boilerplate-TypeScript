import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	SQSClient, SQSClientConfig, Message,
	ListQueuesCommand, CreateQueueCommand, DeleteQueueCommand,
	SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand,
	CreateQueueCommandInput, SendMessageCommandInput, ReceiveMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { ConfigsInterface } from '@core/configs/envs.config';
import CryptographyService from '@core/security/Cryptography.service';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


@Injectable()
export default class SqsClient {
	private readonly awsConfig: SQSClientConfig;
	private readonly messageGroupId: string;
	private readonly sqsClient: SQSClient;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const awsConfigs = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		const logging = this.configService.get<ConfigsInterface['application']['logging']>('application.logging')!;
		const {
			region, endpoint, sessionToken,
			accessKeyId, secretAccessKey,
		} = awsConfigs.credentials;
		const { apiVersion } = awsConfigs.sqs;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId: String(accessKeyId),
				secretAccessKey: String(secretAccessKey),
				sessionToken,
			},
			logger: logging ? this.logger : undefined,
		};
		this.messageGroupId = 'DefaultGroup';
		this.sqsClient = new SQSClient(this.awsConfig);
	}


	private formatMessageBeforeSend(message: unknown = {}): string {
		return this.dataParserHelper.toString(message);
	}

	private createParams(queueName: string): CreateQueueCommandInput {
		const isFifoQueue: boolean = queueName?.includes('.fifo');

		const params: CreateQueueCommandInput = {
			QueueName: queueName,
			Attributes: {
				FifoQueue: String(isFifoQueue),
				DelaySeconds: '10', // Unused in FIFO queues
				MessageRetentionPeriod: '3600',
			}
		};

		return params;
	}

	private msgParams(queueUrl: string, message: unknown, title: string, author: string): SendMessageCommandInput {
		const isFifoQueue: boolean = queueUrl?.includes('.fifo');
		const messageBody = this.formatMessageBeforeSend(message);

		return {
			QueueUrl: queueUrl,
			MessageBody: messageBody,
			MessageAttributes: {
				title: {
					DataType: 'String',
					StringValue: String(title)
				},
				author: {
					DataType: 'String',
					StringValue: String(author)
				},
			},
			MessageDeduplicationId: isFifoQueue ? this.cryptographyService.generateUuid() : undefined,
			MessageGroupId: isFifoQueue ? this.messageGroupId : undefined, // Required for FIFO queues
		};
	}

	private receiveParam(queueUrl: string): ReceiveMessageCommandInput {
		return {
			QueueUrl: queueUrl,
			AttributeNames: [
				'CreatedTimestamp'
			],
			MaxNumberOfMessages: 10,
			MessageAttributeNames: [
				'All'
			],
			VisibilityTimeout: 20,
			WaitTimeSeconds: 0,
		};
	}

	public getClient(): SQSClient {
		return this.sqsClient;
	}

	public destroy(): void {
		this.sqsClient.destroy();
	}

	public async listQueues(): Promise<string[]> {
		let list: string[] = [];

		try {
			const result = await this.sqsClient.send(new ListQueuesCommand({
				MaxResults: 200,
			}));
			if (result?.QueueUrls)
				list = result.QueueUrls;
		} catch (error) {
			this.logger.error('List Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return list;
	}

	public async createQueue(queueName: string): Promise<string> {
		let queueUrl = '';

		try {
			const result = await this.sqsClient.send(new CreateQueueCommand(
				this.createParams(queueName)
			));
			if (result?.QueueUrl)
				queueUrl = result.QueueUrl;
		} catch (error) {
			this.logger.error('Create Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return queueUrl;
	}

	public async deleteQueue(queueUrl: string): Promise<boolean> {
		let isDeleted = false;

		try {
			const result = await this.sqsClient.send(new DeleteQueueCommand({
				QueueUrl: queueUrl,
			}));
			if (result.$metadata?.httpStatusCode && String(result.$metadata?.httpStatusCode)[2] === '2')
				isDeleted = true;
		} catch (error) {
			this.logger.error('Delete Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return isDeleted;
	}

	public async sendMessage(queueUrl: string, title: string, author: string, message: unknown): Promise<string> {
		let messageId = '';

		try {
			const result = await this.sqsClient.send(new SendMessageCommand(
				this.msgParams(queueUrl, message, title, author)
			));
			if (result?.MessageId)
				messageId = result.MessageId;
		} catch (error) {
			this.logger.error('Send Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return messageId;
	}

	public async getMessages(queueUrl: string): Promise<Message[]> {
		const messages: Message[] = [];

		try {
			const result = await this.sqsClient.send(new ReceiveMessageCommand(
				this.receiveParam(queueUrl)
			));
			if (result?.Messages) {
				for (const message of result?.Messages) {
					messages.push(message);
					this.deleteMessage(queueUrl, message);
				}
			}
		} catch (error) {
			this.logger.error('Receive Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return messages;
	}

	public async deleteMessage(queueUrl: string, message: Message): Promise<boolean> {
		let isDeleted = false;

		try {
			const result = await this.sqsClient.send(new DeleteMessageCommand({
				QueueUrl: queueUrl,
				ReceiptHandle: `${message?.ReceiptHandle}`,
			}));
			if (result.$metadata?.httpStatusCode && String(result.$metadata?.httpStatusCode)[2] === '2')
				isDeleted = true;
		} catch (error) {
			this.logger.error('Error to Delete Message:', error);
			throw this.exceptions.integration(error as Error);
		}

		return isDeleted;
	}
}
