import uuid from 'uuid';
import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';
import {
	SQSClient, SQSClientConfig, Message,
	ListQueuesCommand, CreateQueueCommand, DeleteQueueCommand,
	SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand,
	CreateQueueCommandInput, SendMessageCommandInput, ReceiveMessageCommandInput, DeleteMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { ContainerInterface } from 'src/types/_containerInterface';


export default class SqsClient {
	private awsConfig: SQSClientConfig;
	private messageGroupId: string;
	private sqs: SQSClient;
	private logger: Logger;

	constructor({
		logger,
		configs,
	}: ContainerInterface) {
		const {
			region, sessionToken,
			accessKeyId, secretAccessKey,
		} = configs.integration.aws.credentials;
		const { endpoint, apiVersion } = configs.integration.aws.sqs;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId,
				secretAccessKey,
				sessionToken,
			},
			logger: configs.application.logging === 'true' ? logger : undefined,
		};
		this.messageGroupId = 'DefaultGroup';
		this.sqs = new SQSClient(this.awsConfig);
		this.logger = logger;
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
				MessageRetentionPeriod: '7200',
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
			MessageDeduplicationId: isFifoQueue ? uuid.v4() : undefined,
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
			this.sqs.send(new ListQueuesCommand({
				MaxResults: 200,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('List Error:', err);
				}
				else {
					list = data?.QueueUrls || [];
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return list;
	}

	async createQueue(queueName: string): Promise<string> {
		let queueUrl = '';

		try {
			this.sqs.send(new CreateQueueCommand(
				this._createParams(queueName)
			), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Create Error:', err);
				}
				else {
					queueUrl = data?.QueueUrl || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return queueUrl;
	}

	async deleteQueue(queueUrl: string): Promise<boolean> {
		let isDeleted = false;

		try {
			this.sqs.send(new DeleteQueueCommand({
				QueueUrl: queueUrl,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Delete Error:', err);
				}
				else {
					isDeleted = true;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return isDeleted;
	}

	async sendMessage(queueUrl: string, title: string, author: string, message: any): Promise<string> {
		let messageId = '';

		try {
			this.sqs.send(new SendMessageCommand(
				this._msgParams(queueUrl, message, title, author)
			), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Send Error:', err);
				}
				else {
					messageId = data?.MessageId || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return messageId;
	}

	async getMessages(queueUrl: string): Promise<Array<Message>> {
		const messages: Array<Message> = [];

		try {
			this.sqs.send(new ReceiveMessageCommand(
				this._receiveParam(queueUrl)
			), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Receive Error:', err);
				}
				else if (data?.Messages) {
					this.logger.info(`Messages (${Array(data?.Messages).length}):`);

					for (const message of data?.Messages) {
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
			});
		} catch (error) {
			this.logger.error(error);
		}

		return messages;
	}
}
