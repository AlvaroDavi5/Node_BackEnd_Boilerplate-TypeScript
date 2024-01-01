import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import {
	SQSClient, SQSClientConfig, Message,
	ListQueuesCommand, CreateQueueCommand, DeleteQueueCommand,
	SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand,
	CreateQueueCommandInput, SendMessageCommandInput, ReceiveMessageCommandInput, DeleteMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { ConfigsInterface } from '@core/configs/configs.config';
import CryptographyService from '@core/infra/security/Cryptography.service';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


@Injectable()
export default class SqsClient {
	private readonly awsConfig: SQSClientConfig;
	private readonly messageGroupId: string;
	private readonly sqsClient: SQSClient;
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly dataParserHelper: DataParserHelper,
	) {
		this.logger = this.loggerGenerator.getLogger();
		const awsConfigs: ConfigsInterface['integration']['aws'] = this.configService.get<any>('integration.aws');
		const logging: ConfigsInterface['application']['logging'] = this.configService.get<any>('application.logging');
		const {
			region, sessionToken,
			accessKeyId, secretAccessKey,
		} = awsConfigs.credentials;
		const { endpoint, apiVersion } = awsConfigs.sqs;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId: String(accessKeyId),
				secretAccessKey: String(secretAccessKey),
				sessionToken,
			},
			logger: logging === 'true' ? this.logger : undefined,
		};
		this.messageGroupId = 'DefaultGroup';
		this.sqsClient = new SQSClient(this.awsConfig);
	}


	private formatMessageBeforeSend(message: any = {}): string {
		return this.dataParserHelper.toString(message) ?? '{}';
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

	private msgParams(queueUrl: string, message: any, title: string, author: string): SendMessageCommandInput {
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
		}

		return isDeleted;
	}

	public async sendMessage(queueUrl: string, title: string, author: string, message: any): Promise<string> {
		let messageId = '';

		try {
			const result = await this.sqsClient.send(new SendMessageCommand(
				this.msgParams(queueUrl, message, title, author)
			));
			if (result?.MessageId)
				messageId = result.MessageId;
		} catch (error) {
			this.logger.error('Send Error:', error);
		}

		return messageId;
	}

	public async getMessages(queueUrl: string): Promise<Array<Message>> {
		const messages: Array<Message> = [];

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
		}

		return isDeleted;
	}
}
