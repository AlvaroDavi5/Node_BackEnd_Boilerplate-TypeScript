import { ConfigService } from '@nestjs/config';
import {
	SQSClient, Message,
	ListQueuesCommand, CreateQueueCommand, DeleteQueueCommand,
	SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand,
	CreateQueueCommandInput, SendMessageCommandInput, ReceiveMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { ConfigsInterface } from '@core/configs/envs.config';
import { LoggerInterface } from '@core/logging/logger';


export default class SqsClient {
	private readonly messageGroupId: string;
	private readonly sqsClient: SQSClient;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: { generateUuid: () => string },
		private readonly logger: LoggerInterface,
		private readonly dataParserHelper: { toString: (data: unknown) => string },
	) {
		const { sqs: { apiVersion, maxAttempts }, credentials: {
			region, endpoint, accessKeyId, secretAccessKey, sessionToken,
		} } = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		const showExternalLogs = this.configService.get<ConfigsInterface['application']['showExternalLogs']>('application.showExternalLogs')!;

		this.messageGroupId = 'DefaultGroup';

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
		const isFifoQueue: boolean = queueName?.includes('.fifo');

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

	private msgParams(queueUrl: string, message: unknown, title: string, author: string): SendMessageCommandInput {
		const isFifoQueue: boolean = queueUrl?.includes('.fifo');
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
			MessageDeduplicationId: isFifoQueue ? this.cryptographyService.generateUuid() : undefined,
			MessageGroupId: isFifoQueue ? this.messageGroupId : undefined, // Required for FIFO queues
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
				throw new Error('Queue not created');

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

	public async sendMessage(queueUrl: string, title: string, author: string, message: unknown): Promise<string> {
		try {
			const result = await this.sqsClient.send(new SendMessageCommand(
				this.msgParams(queueUrl, message, title, author)
			));

			if (!result?.MessageId)
				throw new Error('Message not sended');

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
		return new Error((error as Error)?.message ?? '');
	}
}
