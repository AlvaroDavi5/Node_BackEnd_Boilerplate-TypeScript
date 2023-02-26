import dotenv from 'dotenv';
import SqsClient from '../../../src/infra/integration/aws/SqsClient';
import eventPayload from '../../../tests/support/integration/payloads/templates/EventPayload.json';
dotenv.config();


export default ({ logger, configs }: any) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const sqsClient = new SqsClient({
		logger,
		configs,
	});
	const queueUrl = process.env.AWS_SQS_DEFAULT_QUEUE_URL || 'http://localhost:4566/000000000000/DEFAULT_QUEUE';

	const message = {
		event: 'CREATE',
		...eventPayload,
		timestamp: new Date().toString(),
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
