import { SqsConsumerOptions } from '@ssut/nestjs-sqs/dist/sqs.types';
import { SQSClient } from '@aws-sdk/client-sqs';
import envsConfig from '@core/configs/envs.config';
import { secondsToMilliseconds } from '@common/utils/dates.util';
import { QueueNamesEnum } from '@common/enums/queueNames.enum';


export function sqsConsumersFactory(): SqsConsumerOptions[] {
	const appConfigs = envsConfig();

	const {
		application: { showExternalLogs },
		integration: {
			aws: {
				credentials: { region: awsRegion, accessKeyId, secretAccessKey, sessionToken, endpoint },
				sqs: { apiVersion, maxAttempts, eventsQueue: { queueUrl: eventsQueueUrl } },
			}
		},
	} = appConfigs;

	const sqsClient = new SQSClient({
		endpoint, region: awsRegion, apiVersion, maxAttempts,
		credentials: { accessKeyId, secretAccessKey, sessionToken },
		logger: showExternalLogs ? console : undefined,
	});

	const globalSqsConsumerOptions: Partial<SqsConsumerOptions> = {
		sqs: sqsClient,
		region: awsRegion,
		batchSize: 10,
		shouldDeleteMessages: false,
		suppressFifoWarning: true,
		pollingWaitTimeMs: 10,
		waitTimeSeconds: 20,
		visibilityTimeout: 20,
		handleMessageTimeout: secondsToMilliseconds(1),
		authenticationErrorTimeout: secondsToMilliseconds(10),
	};

	return [
		{
			...globalSqsConsumerOptions,
			name: QueueNamesEnum.EVENTS_QUEUE,
			queueUrl: eventsQueueUrl,
		},
	];
}
