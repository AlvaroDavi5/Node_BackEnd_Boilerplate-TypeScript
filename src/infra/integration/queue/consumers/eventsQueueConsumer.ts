import { Consumer } from 'sqs-consumer';
import { ContainerInterface } from 'src/container';


export default ({
	sqsClient,
	eventsQueueMessageHandler,
	configs,
	logger,
}: ContainerInterface) => {
	const { sqs } = configs.integration.aws;

	const consumer = Consumer.create({
		queueUrl: sqs.defaultQueue.queueUrl,
		batchSize: 10,
		handleMessageBatch: eventsQueueMessageHandler,
		sqs: sqsClient.getClient(),
	});

	consumer.on('error', (err) => {
		logger.error(err.message);
	});

	consumer.on('processing_error', (err) => {
		logger.error(err.message);
	});

	return consumer;
};
