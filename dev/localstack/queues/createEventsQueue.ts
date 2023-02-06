import SqsClient from '../../../src/infra/integration/aws/SqsClient';


export default async ({ logger, configs }: any) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const sqsClient = new SqsClient({
		logger,
		configs,
	});
	const queue = configs.integration.aws.sqs.defaultQueue;
	let hasCreated = false;

	try {
		sqsClient.createQueue(queue.queueName).then(() => {
			hasCreated = true;
			logger.info('Created Events Queue');
		});
	} catch (error) {
		sqsClient.deleteQueue(queue.queueUrl).then(() => {
			sqsClient.createQueue(queue.queueName).then(() => {
				hasCreated = true;
				logger.info('Created Events Queue');
			});
		});
	}

	return hasCreated;
};
