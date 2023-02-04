import uuid from 'uuid';
import { Logger } from 'winston';
import AWS, { SQS } from 'aws-sdk';
import { ConfigsInterface } from 'configs/configs';
import { ContainerInterface, genericType } from 'src/types/_containerInterface';


export default class SqsClient {
	awsConfig: genericType;
	messageGroupId: string;
	sqs: SQS;
	logger: Logger;
	configs: ConfigsInterface;

	/**
		@param {Object} ctx - Dependency Injection.
		@param {import('src/infra/logging/logger')} ctx.logger
		@param {import('configs/configs')} ctx.configs
		**/
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
		this.configs = configs;
	}


	_formatMessageBeforeSend(message: any = {}) {
		let msg = '';

		try {
			msg = JSON.stringify(message);
		}
		catch (error) {
			msg = String(message);
		}

		return msg;
	}

	_createParams(queueName: string) {
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

	listQueues() {
		try {
			return this.sqs.listQueues({});
		} catch (error) {
			this.logger.error('List Error:', error);
			return null;
		}
	}

	createQueue(queueName: string) {
		try {
			return this.sqs.createQueue(this._createParams(queueName));
		} catch (error) {
			this.logger.error('Create Error:', error);
			return null;
		}
	}

	async deleteQueue(queueUrl: string) {
		try {
			return this.sqs.deleteQueue({ QueueUrl: queueUrl });
		} catch (error) {
			this.logger.error('Delete Error:', error);
			return null;
		}
	}

	async sendMessage(queueUrl: string, title: string, author: string, message: any) {
		try {
			return this.sqs.sendMessage(this._msgParams(queueUrl, message, title, author));
		} catch (error) {
			this.logger.error('Send Error:', error);
			return null;
		}
	}

	async getMessages(queueUrl: string) {
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
