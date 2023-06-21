import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidV4 } from 'uuid';
import { Logger } from 'winston';
import {
	SNSClient, SNSClientConfig, Topic,
	ListTopicsCommand, CreateTopicCommand, DeleteTopicCommand,
	SubscribeCommand, UnsubscribeCommand, PublishCommand,
	CreateTopicCommandInput, SubscribeCommandInput, PublishCommandInput,
} from '@aws-sdk/client-sns';
import { ConfigsInterface } from '@configs/configs';
import LoggerGenerator from '@infra/logging/logger';


export type protocolType = 'email' | 'sms' | 'http' | 'https' | 'sqs' | 'lambda' | 'application'

@Injectable()
export default class SnsClient {
	private readonly awsConfig: SNSClientConfig;
	private readonly messageGroupId: string;
	private readonly sns: SNSClient;
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
		const { endpoint, apiVersion } = awsConfigs.sns;

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
		this.sns = new SNSClient(this.awsConfig);
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
			MessageDeduplicationId: isFifoTopic ? uuidV4() : undefined,
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

	public getClient(): SNSClient {
		return this.sns;
	}

	public async listTopics(): Promise<Topic[]> {
		let list: Topic[] = [];

		try {
			const result = await this.sns.send(new ListTopicsCommand({}));
			if (result?.Topics)
				list = result?.Topics;
		} catch (error) {
			this.logger.error('List Error:', error);
		}

		return list;
	}

	public async createtopic(topicName: string): Promise<string> {
		let topicArn = '';

		try {
			const result = await this.sns.send(new CreateTopicCommand(
				this._createParams(topicName)
			));
			if (result?.TopicArn)
				topicArn = result.TopicArn;
		} catch (error) {
			this.logger.error('Create Error:', error);
		}

		return topicArn;
	}

	public async deletetopic(topicArn: string): Promise<boolean> {
		let isDeleted = false;

		try {
			const result = await this.sns.send(new DeleteTopicCommand({
				TopicArn: topicArn,
			}));
			if (result.$metadata?.httpStatusCode && String(result.$metadata?.httpStatusCode)[2] === '2')
				isDeleted = true;
		} catch (error) {
			this.logger.error('Delete Error:', error);
		}

		return isDeleted;
	}

	public async subscribeTopic(protocol: protocolType, topicArn: string, to: string): Promise<string> {
		let subscriptionArn = '';

		try {
			const result = await this.sns.send(new SubscribeCommand(
				this._subscribeParams(protocol, topicArn, to)
			));
			if (result?.SubscriptionArn)
				subscriptionArn = result.SubscriptionArn;
		} catch (error) {
			this.logger.error('Subscribe Error:', error);
		}

		return subscriptionArn;
	}

	public async unsubscribeTopic(subscriptionArn: string): Promise<number> {
		let httpStatusCode = 0;

		try {
			const result = await this.sns.send(new UnsubscribeCommand({
				SubscriptionArn: subscriptionArn
			}));
			if (result?.$metadata?.httpStatusCode)
				httpStatusCode = result.$metadata.httpStatusCode;
		} catch (error) {
			this.logger.error('Unsubscribe Error:', error);
		}

		return httpStatusCode;
	}

	public async publishMessage(protocol: protocolType, topicArn: string, topicName: string, msgData: string): Promise<string> {
		let messageId = '';

		try {
			const result = await this.sns.send(new PublishCommand(
				this._publishParams(protocol, topicArn, topicName, msgData)
			));
			if (result?.MessageId)
				messageId = result.MessageId;
		} catch (error) {
			this.logger.error('Publish Error:', error);
		}

		return messageId;
	}
}
