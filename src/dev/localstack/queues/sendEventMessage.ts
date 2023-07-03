import dotenv from 'dotenv';
import { v4 as uuidV4 } from 'uuid';
import SqsClient from './SqsClient';
import eventPayload from 'tests/support/integration/payloads/templates/EventPayload.json';
dotenv.config();


export default ({ logger, configs }: any): void => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const sqsClient = new SqsClient({
		logger,
		configs,
	});
	const queueUrl = process.env.AWS_SQS_DEFAULT_QUEUE_URL || 'http://localhost:4566/000000000000/DEFAULT_QUEUE';

	const message = {
		id: uuidV4(),
		timestamp: new Date().toString(),
		payload: eventPayload,
	};

	sqsClient.sendMessage(
		queueUrl,
		'mocked_message',
		'backend',
		message,
	).then(() => {
		logger.info('Sended message to Events Queue');
	});
};
