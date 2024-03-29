import dotenv from 'dotenv';
import { v4 as uuidV4 } from 'uuid';
import SqsClient from './SqsClient';
import eventPayload from 'src/dev/templates/payloads/EventPayload.json';


dotenv.config();
export default ({ logger, configs }: any): void => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const sqsClient = new SqsClient({
		logger,
		configs,
	});
	const queueUrl = process.env.AWS_SQS_EVENTS_QUEUE_URL || 'http://localhost:4566/000000000000/eventsQueue.fifo';

	const message = {
		id: uuidV4(),
		schema: 'INVALID',
		schemaVersion: 1,
		payload: eventPayload,
		source: 'TEST',
		timestamp: new Date(),
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
