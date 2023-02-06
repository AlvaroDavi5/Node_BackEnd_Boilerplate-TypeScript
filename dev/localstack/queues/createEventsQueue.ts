import SqsClient from '../../../src/infra/integration/aws/SqsClient';


export default async ({ logger, configs }: any) => {
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
			logger.log('Created Events Queue');
		});
	} catch (error) {
		sqsClient.deleteQueue(queue.queueUrl).then(() => {
			sqsClient.createQueue(queue.queueName).then(() => {
				hasCreated = true;
				logger.log('Created Events Queue');
			});
		});
	}

	return hasCreated;
};
