import dotenv from 'dotenv';
import SqsClient from '../../../src/infra/integration/aws/sqs/SqsClient';
import order from './templates/orderPayload.json';
dotenv.config();


export default ({ formatMessageBeforeSendHelper, logger, config }) => {
	const sqsClient = new SqsClient({
		formatMessageBeforeSendHelper,
		logger,
		config,
	});
	const queueUrl = process.env.AWS_SQS_SUBSCRIPTION_ORDER_EVENTS_QUEUE_URL || 'http://localhost:4566/000000000000/DEFAULT_QUEUE.fifo';
	const orderOrigin = process.env.MOCKED_EVENT_ORIGIN || 'UBER_EATS';
	const eventAndStatus =  process.env.MOCKED_EVENT_FLOW || 'PLACED';

	order.origin = orderOrigin;
	order.originStatus = eventAndStatus;
	order.status = eventAndStatus;

	const payload = {
		event: eventAndStatus,
		order,
	};

	sqsClient.sendMessage(
		`${queueUrl}`,
		'mocked_message',
		'backend',
		{
			timestamp: new Date().toString(),
			payload,
		},
	).then(() => {
		logger.log('Sended message to Order Events Queue');
	});
};
