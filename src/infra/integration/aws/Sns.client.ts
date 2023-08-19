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
import { ConfigsInterface } from '@configs/configs.config';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import DataParserHelper from '@modules/utils/helpers/DataParser.helper';


export type protocolType = 'email' | 'sms' | 'http' | 'https' | 'sqs' | 'lambda' | 'application'

@Injectable()
export default class SnsClient {
	private readonly awsConfig: SNSClientConfig;
	private readonly messageGroupId: string;
	private readonly snsClient: SNSClient;
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
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
		this.snsClient = new SNSClient(this.awsConfig);
	}


	private formatMessageBeforeSend(message: any = {}): string {
		return this.dataParserHelper.toString(message);
	}

	private createParams(topicName: string): CreateTopicCommandInput {
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

	private subscribeParams(protocol: protocolType, topicArn: string, to: string): SubscribeCommandInput {
		const endpoint = to || this.awsConfig.endpoint;

		return {
			Protocol: protocol,
			TopicArn: topicArn,
			Endpoint: String(endpoint),
		};
	}

	private publishParams(protocol: protocolType, topicArn: string, topicName: string, { message, subject, phoneNumber }: any): PublishCommandInput {
		const isFifoTopic: boolean = topicName?.includes('.fifo');
		const messageBody = this.formatMessageBeforeSend(message);

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
		return this.snsClient;
	}

	public async listTopics(): Promise<Topic[]> {
		let list: Topic[] = [];

		try {
			const result = await this.snsClient.send(new ListTopicsCommand({}));
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
			const result = await this.snsClient.send(new CreateTopicCommand(
				this.createParams(topicName)
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
			const result = await this.snsClient.send(new DeleteTopicCommand({
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
			const result = await this.snsClient.send(new SubscribeCommand(
				this.subscribeParams(protocol, topicArn, to)
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
			const result = await this.snsClient.send(new UnsubscribeCommand({
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
			const result = await this.snsClient.send(new PublishCommand(
				this.publishParams(protocol, topicArn, topicName, msgData)
			));
			if (result?.MessageId)
				messageId = result.MessageId;
		} catch (error) {
			this.logger.error('Publish Error:', error);
		}

		return messageId;
	}
}
