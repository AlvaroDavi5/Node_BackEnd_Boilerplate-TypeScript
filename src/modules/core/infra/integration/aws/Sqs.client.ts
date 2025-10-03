import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	SQSClient, Message,
	ListQueuesCommand, CreateQueueCommand, DeleteQueueCommand,
	SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand,
	CreateQueueCommandInput, SendMessageCommandInput, ReceiveMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


type ISendParams = {
	queueUrl: string;
	title: string;
	author: string;
	message: unknown;
	messageGroupId: string;
	messageDeduplicationId: string;
};

@Injectable()
export default class SqsClient {
	private readonly sqsClient: SQSClient;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const { sqs: { apiVersion, maxAttempts }, credentials: {
			region, endpoint, accessKeyId, secretAccessKey, sessionToken,
		} } = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		const showExternalLogs = this.configService.get<ConfigsInterface['application']['showExternalLogs']>('application.showExternalLogs')!;

		this.sqsClient = new SQSClient({
			endpoint, region, apiVersion, maxAttempts,
			credentials: { accessKeyId, secretAccessKey, sessionToken },
			logger: showExternalLogs ? this.logger : undefined,
		});
	}


	private formatMessageBeforeSend(message: unknown = {}): string {
		return this.dataParserHelper.toString(message);
	}

	private createParams(queueName: string): CreateQueueCommandInput {
		const isFifoQueue = queueName?.endsWith('.fifo');

		const params: CreateQueueCommandInput = {
			QueueName: queueName,
			Attributes: {
				FifoQueue: String(isFifoQueue),
				DelaySeconds: '10', // Unused in FIFO queues
				MessageRetentionPeriod: '3600',
				VisibilityTimeout: '20',
			}
		};

		return params;
	}

	private msgParams(params: ISendParams): SendMessageCommandInput {
		const { message, title, author, queueUrl, messageGroupId, messageDeduplicationId } = params;
		const isFifoQueue: boolean = queueUrl?.endsWith('.fifo');
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
			// NOTE - required for FIFO queues
			MessageDeduplicationId: isFifoQueue ? messageDeduplicationId : undefined,
			MessageGroupId: isFifoQueue ? messageGroupId : undefined,
		};
	}

	private receiveParam(queueUrl: string): ReceiveMessageCommandInput {
		return {
			QueueUrl: queueUrl,
			AttributeNames: ['CreatedTimestamp'],
			MessageAttributeNames: ['All'],
			MaxNumberOfMessages: 10,
			WaitTimeSeconds: 0,
			VisibilityTimeout: 10,
		};
	}

	public getClient(): SQSClient {
		return this.sqsClient;
	}

	public destroy(): void {
		this.sqsClient.destroy();
	}

	public async listQueues(max = 200): Promise<string[]> {

		try {
			const result = await this.sqsClient.send(new ListQueuesCommand({
				MaxResults: max,
			}));

			return result?.QueueUrls ?? [];
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async createQueue(queueName: string): Promise<string> {
		try {
			const result = await this.sqsClient.send(new CreateQueueCommand(
				this.createParams(queueName)
			));

			if (!result?.QueueUrl)
				throw this.exceptions.internal({ message: 'Queue not created' });

			return result.QueueUrl;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async deleteQueue(queueUrl: string): Promise<boolean> {
		try {
			const result = await this.sqsClient.send(new DeleteQueueCommand({
				QueueUrl: queueUrl,
			}));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async sendMessage(params: ISendParams): Promise<string> {
		try {
			const result = await this.sqsClient.send(new SendMessageCommand(this.msgParams(params)));

			if (!result?.MessageId)
				throw this.exceptions.internal({ message: 'Message not sended' });

			return result.MessageId;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async getMessages(queueUrl: string): Promise<Message[]> {
		const messages: Message[] = [];

		try {
			const result = await this.sqsClient.send(new ReceiveMessageCommand(
				this.receiveParam(queueUrl)
			));

			if (result?.Messages?.length)
				result.Messages.forEach((message) => {
					messages.push(message);
					this.deleteMessage(queueUrl, message);
				});
		} catch (error) {
			throw this.caughtError(error);
		}

		return messages;
	}

	public async deleteMessage(queueUrl: string, message: Message): Promise<boolean> {
		try {
			const result = await this.sqsClient.send(new DeleteMessageCommand({
				QueueUrl: queueUrl,
				ReceiptHandle: `${message?.ReceiptHandle}`,
			}));
			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	private caughtError(error: unknown): Error {
		this.logger.error(error);
		return this.exceptions.integration(error as Error);
	}
}
