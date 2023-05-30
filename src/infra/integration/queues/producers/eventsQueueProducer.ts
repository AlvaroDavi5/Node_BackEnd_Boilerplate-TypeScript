import { v4 as uuidV4 } from 'uuid';
import { Logger } from 'winston';
import SqsClient from 'src/infra/integration/aws/SqsClient';
import { ContainerInterface } from 'src/types/_containerInterface';


export default class EventsQueueProducer {
	private sqsClient: SqsClient;
	private logger: Logger;
	private credentials: {
		queueName: string;
		queueUrl: string;
	};

	constructor({
		sqsClient,
		logger,
		configs,
	}: ContainerInterface) {
		this.sqsClient = sqsClient;
		this.logger = logger;
		this.credentials = configs.integration.aws.sqs.defaultQueue;
	}

	private _buildMessageBody({ event, schema }: { event: any, schema: string | null | undefined }) {
		return {
			id: uuidV4(),
			schema: schema || 'DEFAULT_EVENTS',
			schemaVersion: 1.0,
			payload: event,
			source: 'BOILERPLATE',
			timestamp: new Date(),
		};
	}

	async send({ event, schema, author, title }: { event: any, schema?: string, author: string, title?: string }) {
		const message = this._buildMessageBody({ event, schema });

		try {
			const messageId = await this.sqsClient.sendMessage(
				this.credentials.queueUrl,
				title || 'new event',
				author,
				message,
			);
			this.logger.info('Sended message to Events Queue');
		} catch (error) {
			this.logger.error(`Error to send message to Events Queue: ${error}`);
		}
	}
}
