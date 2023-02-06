import uuid from 'uuid';
import { Logger } from 'winston';
import AWS, { SQS } from 'aws-sdk';
import { ContainerInterface, genericType } from 'src/container';


export default class SqsClient {
	private awsConfig: genericType;
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
		return {
			QueueName: queueName,
			Attributes: {
				DelaySeconds: '10', // Unused in FIFO queues
				MessageRetentionPeriod: '86400',
				FifoQueue: String(queueName?.includes('.fifo')),
			}
		};
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

	async listQueues(): Promise<any> {
		try {
			return this.sqs.listQueues({});
		} catch (error) {
			this.logger.error('List Error:', error);
			return null;
		}
	}

	async createQueue(queueName: string): Promise<any> {
		try {
			return this.sqs.createQueue(this._createParams(queueName));
		} catch (error) {
			this.logger.error('Create Error:', error);
			return null;
		}
	}

	async deleteQueue(queueUrl: string): Promise<any> {
		try {
			return this.sqs.deleteQueue({ QueueUrl: queueUrl });
		} catch (error) {
			this.logger.error('Delete Error:', error);
			return null;
		}
	}

	async sendMessage(queueUrl: string, title: string, author: string, message: any): Promise<any> {
		try {
			return this.sqs.sendMessage(this._msgParams(queueUrl, message, title, author));
		} catch (error) {
			this.logger.error('Send Error:', error);
			return null;
		}
	}

	async getMessages(queueUrl: string): Promise<any> {
		const logger = this.logger;

		try {
			return this.sqs.receiveMessage(this._receiveParam(queueUrl), (err: AWS.AWSError, data: SQS.ReceiveMessageResult) => {
				if (err) {
					logger.error('Receive Error:', err);
				}
				else if (data?.Messages) {
					logger.info(`Messages (${Array(data?.Messages).length}):`);

					for (const message of data?.Messages) {
						logger.info('----- Message -----');
						logger.info(message);
						logger.info('----- Message End -----');

						const deleteParams: SQS.DeleteMessageRequest = {
							QueueUrl: queueUrl,
							ReceiptHandle: `${message.ReceiptHandle}`
						};
						this.sqs.deleteMessage(deleteParams, (err: AWS.AWSError, data: any) => {
							if (err) {
								logger.error('Error to Delete Message:', err);
							}
							else {
								logger.info('Message Deleted:', { queueUrl, requestId: data?.ResponseMetadata?.RequestId });
							}
						});
					}
				}
			});
		} catch (error) {
			logger.error(error);
			return null;
		}
	}
}
