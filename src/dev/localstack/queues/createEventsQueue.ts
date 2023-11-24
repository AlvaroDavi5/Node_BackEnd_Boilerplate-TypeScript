import SqsClient from './SqsClient';


export default ({ logger, configs }: any): void => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const sqsClient = new SqsClient({ logger, configs });
	const queue = configs.integration.aws.sqs.eventsQueue;

	try {
		sqsClient.createQueue(queue.queueName).then((queueUrl) => {
			logger.info('Queue URL:', queueUrl);
		});
	} catch (error) {
		sqsClient.deleteQueue(queue.queueUrl).then((deleted) => {
			if (deleted)
				sqsClient.createQueue(queue.queueName).then((queueUrl) => {
					logger.info('Queue URL:', queueUrl);
				});
		});
	}
};
