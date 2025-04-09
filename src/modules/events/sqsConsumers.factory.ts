import { ConfigService } from '@nestjs/config';
import { SqsConsumerOptions } from '@ssut/nestjs-sqs/dist/sqs.types';
import envsConfig from '@core/configs/envs.config';
import { secondsToMilliseconds } from '@common/utils/dates.util';
import SqsClientMock from '@dev/localstack/queues/SqsClient';
import { configServiceMock, cryptographyServiceMock, dataParserHelperMock, loggerProviderMock } from '@dev/mocks/mockedModules';
import { EVENTS_QUEUE_NAME } from './queue/consumers/EventsQueue.consumer';


export function sqsConsumersFactory(): SqsConsumerOptions[] {
	const appConfigs = envsConfig();
	const { region: awsRegion } = appConfigs.integration.aws.credentials;
	const { queueUrl: eventsQueueUrl } = appConfigs.integration.aws.sqs.eventsQueue;
	const sqsClientMock = new SqsClientMock(
		configServiceMock as unknown as ConfigService,
		cryptographyServiceMock,
		loggerProviderMock,
		dataParserHelperMock,
	);

	const globalSqsConsumerOptions: Partial<SqsConsumerOptions> = {
		sqs: sqsClientMock.getClient(),
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
			name: EVENTS_QUEUE_NAME,
			queueUrl: eventsQueueUrl,
		},
	];
}
