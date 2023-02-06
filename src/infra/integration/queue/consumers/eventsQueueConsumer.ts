import { Consumer } from 'sqs-consumer';
import { SQSClient } from '@aws-sdk/client-sqs';
import { ContainerInterface } from 'src/container';


export default ({
	configs,
	eventsQueueMessageHandler,
	logger,
}: ContainerInterface) => {
	const { credentials, sqs } = configs.integration.aws;

	const consumer = Consumer.create({
		queueUrl: sqs.defaultQueue.queueUrl,
		batchSize: 10,
		handleMessageBatch: eventsQueueMessageHandler,
		sqs: new SQSClient({
			apiVersion: sqs.apiVersion,
			region: credentials.region,
		}),
	});

	consumer.on('error', (err) => {
		logger.error(err.message);
	});

	consumer.on('processing_error', (err) => {
		logger.error(err.message);
	});

	return consumer;
};
