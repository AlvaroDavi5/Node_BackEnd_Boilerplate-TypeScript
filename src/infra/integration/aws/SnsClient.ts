import uuid from 'uuid';
import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';
import {
	SNSClient, SNSClientConfig, Topic,
	ListTopicsCommand, CreateTopicCommand, DeleteTopicCommand,
	SubscribeCommand, UnsubscribeCommand, PublishCommand,
	CreateTopicCommandInput, SubscribeCommandInput, PublishCommandInput,
} from '@aws-sdk/client-sns';
import { ContainerInterface } from 'src/types/_containerInterface';


export type protocolType = 'email' | 'sms' | 'http' | 'https' | 'sqs' | 'lambda' | 'application'

export default class SnsClient {
	private awsConfig: SNSClientConfig;
	private messageGroupId: string;
	private sns: SNSClient;
	private logger: Logger;

	constructor({
		logger,
		configs,
	}: ContainerInterface) {
		const {
			region, sessionToken,
			accessKeyId, secretAccessKey,
		} = configs.integration.aws.credentials;
		const { endpoint, apiVersion } = configs.integration.aws.sns;

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
		this.sns = new SNSClient(this.awsConfig);
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

	private _createParams(topicName: string): CreateTopicCommandInput {
		const isFifoTopic: boolean = topicName?.includes('.fifo');

		const params: CreateTopicCommandInput = {
			Name: topicName,
			Attributes: {
				FifoTopic: String(isFifoTopic),
				ContentBasedDeduplication: String(isFifoTopic),
			}
		};

		return params;
	}

	private _subscribeParams(protocol: protocolType, topicArn: string, to: string): SubscribeCommandInput {
		const endpoint = to || this.awsConfig.endpoint;

		return {
			Protocol: protocol,
			TopicArn: topicArn,
			Endpoint: String(endpoint),
		};
	}

	private _publishParams(protocol: protocolType, topicArn: string, topicName: string, { message, subject, phoneNumber }: any): PublishCommandInput {
		const isFifoTopic: boolean = topicName?.includes('.fifo');
		const messageBody = this._formatMessageBeforeSend(message);

		const publishData: PublishCommandInput = {
			TopicArn: topicArn,
			Message: messageBody,
			MessageDeduplicationId: isFifoTopic ? uuid.v4() : undefined,
			MessageGroupId: isFifoTopic ? this.messageGroupId : undefined, // Required for FIFO topics
		};

		switch (protocol) {
		case 'email':
			publishData.Subject = subject;
			break;
		case 'sms':
			publishData.PhoneNumber = phoneNumber;
			break;
		default: // application | sqs | lambda | http(s)
			publishData.TopicArn = topicArn;
			publishData.TargetArn = topicArn;
			break;
		}

		return publishData;
	}

	getClient(): SNSClient {
		return this.sns;
	}

	async listTopics(): Promise<Topic[]> {
		let list: Topic[] = [];

		try {
			this.sns.send(new ListTopicsCommand({}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('List Error:', err);
				}
				else {
					list = data?.Topics || [];
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return list;
	}

	async createtopic(topicName: string): Promise<string> {
		let topicArn = '';

		try {
			this.sns.send(new CreateTopicCommand(
				this._createParams(topicName)
			), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Create Error:', err);
				}
				else {
					topicArn = data?.TopicArn || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return topicArn;
	}

	async deletetopic(topicArn: string): Promise<boolean> {
		let isDeleted = false;

		try {
			this.sns.send(new DeleteTopicCommand({
				TopicArn: topicArn,
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

	async subscribeTopic(protocol: protocolType, topicArn: string, to: string): Promise<string> {
		let subscriptionArn = '';

		try {
			this.sns.send(new SubscribeCommand(
				this._subscribeParams(protocol, topicArn, to)
			), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Subscribe Error:', err);
				}
				else {
					subscriptionArn = data?.SubscriptionArn || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return subscriptionArn;
	}

	async unsubscribeTopic(subscriptionArn: string): Promise<number> {
		let httpStatusCode = 0;

		try {
			this.sns.send(new UnsubscribeCommand({
				SubscriptionArn: subscriptionArn
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Unsubscribe Error:', err);
				}
				else {
					httpStatusCode = data?.$metadata?.httpStatusCode || 0;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return httpStatusCode;
	}

	async publishMessage(protocol: protocolType, topicArn: string, topicName: string, msgData: string): Promise<string> {
		let messageId = '';

		try {
			this.sns.send(new PublishCommand(
				this._publishParams(protocol, topicArn, topicName, msgData)
			), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Publish Error:', err);
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
}
