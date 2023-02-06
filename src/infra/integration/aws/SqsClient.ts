import uuid from 'uuid';
import { Logger } from 'winston';
import AWS, { SQS } from 'aws-sdk';
import { ContainerInterface } from 'src/container';


export default class SqsClient {
	private awsConfig: any;
	private messageGroupId: string;
	private sqs: SQS;
	private logger: Logger;

	constructor({
		logger,
		configs,
	}: ContainerInterface) {
		const {
			region, messageGroupId,
			accessKeyId, secretAccessKey,
		} = configs.integration.aws.credentials;
		const { endpoint, apiVersion } = configs.integration.aws.sqs;

		this.awsConfig = {
			endpoint,
			accessKeyId,
			secretAccessKey,
			region,
			apiVersion,
		};
		this.messageGroupId = messageGroupId || 'DefaultGroup';
		this.sqs = new AWS.SQS(this.awsConfig);
		this.logger = logger;
	}


	private _formatMessageBeforeSend(message: any = {}) {
		let msg = '';

		try {
			msg = JSON.stringify(message);
		}
		catch (error) {
			msg = String(message);
		}

		return msg;
	}

	private _createParams(queueName: string) {
		const isFifoQueue: boolean = queueName?.includes('.fifo');

		const params: any = {
			QueueName: queueName,
			Attributes: {
				DelaySeconds: '10', // Unused in FIFO queues
				MessageRetentionPeriod: '86400',
			}
		};
		if (isFifoQueue) {
			params.Attributes.FifoQueue = String(isFifoQueue);
		}

		return params;
	}

	_msgParams(queueUrl: string, message: any, title: string, author: string) {

		const extraParams: any = {};
		if (queueUrl?.includes('.fifo')) {
			extraParams.MessageDeduplicationId = uuid.v4(); // Required for FIFO queues
			extraParams.MessageGroupId = this.messageGroupId; // Required for FIFO queues
		}
		const messageBody = this._formatMessageBeforeSend(message);

		return {
			MessageHeader: {
				title: {
					DataType: 'String',
					StringValue: String(title)
				},
				author: {
					DataType: 'String',
					StringValue: String(author)
				},
			},
			MessageBody: messageBody,
			...extraParams,
			QueueUrl: queueUrl,
		};
	}

	_receiveParam(queueUrl: string) {
		return {
			AttributeNames: [
				'SentTimestamp'
			],
			MaxNumberOfMessages: 10,
			MessageAttributeNames: [
				'All'
			],
			QueueUrl: queueUrl,
			VisibilityTimeout: 20,
			WaitTimeSeconds: 0,
		};
	}

	async listQueues(): Promise<SQS.QueueUrlList> {
		let list: SQS.QueueUrlList = [];

		try {
			this.sqs.listQueues({}, (err, data) => {
				if (err) {
					this.logger.error('List Error:', err);
				}
				else {
					list = data.QueueUrls || [];
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return list;
	}

	async createQueue(queueName: string): Promise<string> {
		let queueUrl: string = '';

		try {
			this.sqs.createQueue(this._createParams(queueName), (err, data) => {
				if (err) {
					this.logger.error('Create Error:', err);
				}
				else {
					queueUrl = data.QueueUrl || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return queueUrl;
	}

	async deleteQueue(queueUrl: string): Promise<boolean> {
		let isDeleted: boolean = false;

		try {
			this.sqs.deleteQueue({ QueueUrl: queueUrl }, (err, data) => {
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
		let messageId: string = '';

		try {
			this.sqs.sendMessage(this._msgParams(queueUrl, message, title, author), (err, data) => {
				if (err) {
					this.logger.error('Send Error:', err);
				}
				else {
					messageId = data.MessageId || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return messageId;
	}

	async getMessages(queueUrl: string): Promise<Array<SQS.Message>> {
		let messages: Array<SQS.Message> = [];

		try {
			this.sqs.receiveMessage(this._receiveParam(queueUrl), (err, data) => {
				if (err) {
					this.logger.error('Receive Error:', err);
				}
				else if (data?.Messages) {
					this.logger.info(`Messages (${Array(data?.Messages).length}):`);

					for (const message of data?.Messages) {
						messages.push(message);

						const deleteParams: SQS.DeleteMessageRequest = {
							QueueUrl: queueUrl,
							ReceiptHandle: `${message.ReceiptHandle}`
						};
						this.sqs.deleteMessage(deleteParams, (err: AWS.AWSError, data: any) => {
							if (err) {
								this.logger.error('Error to Delete Message:', err);
							}
							else {
								this.logger.info('Message Deleted:', { queueUrl, requestId: data?.ResponseMetadata?.RequestId });
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
