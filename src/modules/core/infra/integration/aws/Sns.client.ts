import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	SNSClient, Topic,
	ListTopicsCommand, CreateTopicCommand, DeleteTopicCommand,
	SubscribeCommand, UnsubscribeCommand, PublishCommand,
	CreateTopicCommandInput, SubscribeCommandInput, PublishCommandInput,
} from '@aws-sdk/client-sns';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


interface EmailPublishTargets {
	protocol: 'email';
	subject: string;
}
interface SmsPublishTargets {
	protocol: 'sms';
	phoneNumber: string;
}
interface SqsPublishTargets {
	protocol: 'sqs';
	targetArn?: string;
}
interface LambdaPublishTargets {
	protocol: 'lambda';
	targetArn?: string;
}

export type IPublishTargetsOptions =
	| EmailPublishTargets
	| SmsPublishTargets
	| SqsPublishTargets
	| LambdaPublishTargets;
export type protocolType = IPublishTargetsOptions['protocol'];

type IPublishParams = IPublishTargetsOptions & {
	topicArn: string;
	message: unknown;
	messageGroupId: string;
	messageDeduplicationId: string;
};

@Injectable()
export default class SnsClient {
	private readonly snsClient: SNSClient;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const { sns: { apiVersion, maxAttempts }, credentials: {
			region, endpoint, accessKeyId, secretAccessKey, sessionToken,
		} } = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		const showExternalLogs = this.configService.get<ConfigsInterface['application']['showExternalLogs']>('application.showExternalLogs')!;

		this.snsClient = new SNSClient({
			endpoint, region, apiVersion, maxAttempts,
			credentials: { accessKeyId, secretAccessKey, sessionToken },
			logger: showExternalLogs ? this.logger : undefined,
		});
	}


	private formatMessageBeforeSend(message: unknown = {}): string {
		return this.dataParserHelper.toString(message);
	}

	private createParams(topicName: string): CreateTopicCommandInput {
		const isFifoTopic = topicName?.endsWith('.fifo');

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
		return {
			Protocol: protocol,
			TopicArn: topicArn,
			Endpoint: to,
		};
	}

	private publishParams(params: IPublishParams): PublishCommandInput {
		const { message, protocol, topicArn, messageGroupId, messageDeduplicationId } = params;
		const isFifoTopic = topicArn?.endsWith('.fifo');
		const messageBody = this.formatMessageBeforeSend(message);

		const publishData: PublishCommandInput = {
			Message: messageBody,
			// NOTE - required for FIFO topics
			MessageDeduplicationId: isFifoTopic ? messageDeduplicationId : undefined,
			MessageGroupId: isFifoTopic ? messageGroupId : undefined,
		};

		switch (protocol) {
			case 'sms':
				publishData.PhoneNumber = params.phoneNumber;
				break;
			case 'email':
				publishData.TopicArn = topicArn;
				publishData.Subject = params.subject;
				break;
			case 'lambda':
			case 'sqs':
				if (params.targetArn) {
					publishData.TargetArn = params.targetArn;
				} else {
					publishData.TopicArn = topicArn;
				}
				break;
			default:
				publishData.TopicArn = topicArn;
				break;
		}

		return publishData;
	}

	public getClient(): SNSClient {
		return this.snsClient;
	}

	public destroy(): void {
		this.snsClient.destroy();
	}

	public async listTopics(): Promise<Topic[]> {
		try {
			const result = await this.snsClient.send(new ListTopicsCommand({}));

			return result?.Topics ?? [];
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async createTopic(topicName: string): Promise<string> {
		try {
			const result = await this.snsClient.send(new CreateTopicCommand(this.createParams(topicName)));

			if (!result?.TopicArn)
				throw this.exceptions.internal({ message: 'Topic not created' });

			return result.TopicArn;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async deleteTopic(topicArn: string): Promise<boolean> {
		try {
			const result = await this.snsClient.send(new DeleteTopicCommand({
				TopicArn: topicArn,
			}));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async subscribeTopic(protocol: protocolType, topicArn: string, to: string): Promise<string> {
		try {
			const result = await this.snsClient.send(new SubscribeCommand(
				this.subscribeParams(protocol, topicArn, to)
			));

			if (!result?.SubscriptionArn)
				throw this.exceptions.internal({ message: 'Not Subscribed in topic' });

			return result.SubscriptionArn;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async unsubscribeTopic(subscriptionArn: string): Promise<boolean> {
		try {
			const result = await this.snsClient.send(new UnsubscribeCommand({
				SubscriptionArn: subscriptionArn
			}));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async publishMessage(params: IPublishParams): Promise<string> {
		try {
			const result = await this.snsClient.send(new PublishCommand(this.publishParams(params)));

			if (!result?.MessageId)
				throw this.exceptions.internal({ message: 'Message not published' });

			return result.MessageId;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	private caughtError(error: unknown): Error {
		this.logger.error(error);
		return this.exceptions.integration(error as Error);
	}
}
