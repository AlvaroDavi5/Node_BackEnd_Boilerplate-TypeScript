import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { v4 as uuidV4 } from 'uuid';
import { AWSError } from 'aws-sdk';
import {
	SQSClient, SQSClientConfig, Message,
	ListQueuesCommand, CreateQueueCommand, DeleteQueueCommand,
	SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand,
	CreateQueueCommandInput, SendMessageCommandInput, ReceiveMessageCommandInput, DeleteMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { ConfigsInterface } from '@configs/configs';
import LoggerGenerator from '@infra/logging/logger';


@Injectable()
export default class SqsClient {
	private readonly awsConfig: SQSClientConfig;
	private readonly messageGroupId: string;
	private readonly sqs: SQSClient;
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
		private readonly loggerGenerator: LoggerGenerator,
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
		this.sqs = new SQSClient(this.awsConfig);
	}


	private _formatMessageBeforeSend(message: any = {}): string {
		let msg = '';

		try {
			msg = JSON.stringify(message);
		}
		catch (error) {
			msg = String(message);
		}

		return msg;
	}

	private _createParams(queueName: string): CreateQueueCommandInput {
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

	private _msgParams(queueUrl: string, message: any, title: string, author: string): SendMessageCommandInput {
		const isFifoQueue: boolean = queueUrl?.includes('.fifo');
		const messageBody = this._formatMessageBeforeSend(message);

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
			MessageDeduplicationId: isFifoQueue ? uuidV4() : undefined,
			MessageGroupId: isFifoQueue ? this.messageGroupId : undefined, // Required for FIFO queues
		};
	}

	private _receiveParam(queueUrl: string): ReceiveMessageCommandInput {
		return {
			QueueUrl: queueUrl,
			AttributeNames: [
				'SentTimestamp'
			],
			MaxNumberOfMessages: 10,
			MessageAttributeNames: [
				'All'
			],
			VisibilityTimeout: 20,
			WaitTimeSeconds: 0,
		};
	}

	getClient(): SQSClient {
		return this.sqs;
	}

	async listQueues(): Promise<string[]> {
		let list: string[] = [];

		try {
			const result = await this.sqs.send(new ListQueuesCommand({
				MaxResults: 200,
			}));
			if (result?.QueueUrls)
				list = result.QueueUrls;
		} catch (error) {
			this.logger.error('List Error:', error);
		}

		return list;
	}

	async createQueue(queueName: string): Promise<string> {
		let queueUrl = '';

		try {
			const result = await this.sqs.send(new CreateQueueCommand(
				this._createParams(queueName)
			));
			if (result?.QueueUrl)
				queueUrl = result.QueueUrl;
		} catch (error) {
			this.logger.error('Create Error:', error);
		}

		return queueUrl;
	}

	async deleteQueue(queueUrl: string): Promise<boolean> {
		let isDeleted = false;

		try {
			const result = await this.sqs.send(new DeleteQueueCommand({
				QueueUrl: queueUrl,
			}));
			if (result.$metadata?.httpStatusCode && String(result.$metadata?.httpStatusCode)[2] === '2')
				isDeleted = true;
		} catch (error) {
			this.logger.error('Delete Error:', error);
		}

		return isDeleted;
	}

	async sendMessage(queueUrl: string, title: string, author: string, message: any): Promise<string> {
		let messageId = '';

		try {
			const result = await this.sqs.send(new SendMessageCommand(
				this._msgParams(queueUrl, message, title, author)
			));
			if (result?.MessageId)
				messageId = result.MessageId;
		} catch (error) {
			this.logger.error('Send Error:', error);
		}

		return messageId;
	}

	async getMessages(queueUrl: string): Promise<Array<Message>> {
		const messages: Array<Message> = [];

		try {
			const result = await this.sqs.send(new ReceiveMessageCommand(
				this._receiveParam(queueUrl)
			));
			if (result?.Messages) {
				for (const message of result?.Messages) {
					messages.push(message);

					const deleteParams: DeleteMessageCommandInput = {
						QueueUrl: queueUrl,
						ReceiptHandle: `${message?.ReceiptHandle}`,
					};
					this.sqs.send(new DeleteMessageCommand(
						deleteParams
					), (err: AWSError, data) => {
						if (err) {
							this.logger.error('Error to Delete Message:', err);
						}
						else {
							this.logger.info('Message Deleted:', { queueUrl, requestId: data?.$metadata?.requestId });
						}
					});
				}
			}
		} catch (error) {
			this.logger.error('Receive Error:', error);
		}

		return messages;
	}
}
