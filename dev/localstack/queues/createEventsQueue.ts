import SqsClient from '../../../src/infra/integration/aws/sqs/SqsClient';


export default async ({ formatMessageBeforeSendHelper, logger, configs }) => {
	const sqsClient = new SqsClient({
		formatMessageBeforeSendHelper,
		logger,
		configs,
	});
	const queue = configs.integration.queues.sqs.orderEvents;
	let hasCreated = false;

	try {
		sqsClient.createQueue(queue.name).then(() => {
			hasCreated = true;
			logger.log('Created Order Events Queue');
		});
	} catch (error) {
		sqsClient.deleteQueue(queue.url).then(() => {
			sqsClient.createQueue(queue.name).then(() => {
				hasCreated = true;
				logger.log('Created Order Events Queue');
			});
		});
	}

	return hasCreated;
};
