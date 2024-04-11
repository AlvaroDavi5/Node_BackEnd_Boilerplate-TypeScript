import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import WebSocketServer from '@events/websocket/server/WebSocket.server';
import WebSocketClient from '@events/websocket/client/WebSocket.client';
import EventsQueueConsumer from '@events/queue/consumers/EventsQueue.consumer';
import EventsQueueProducer from '@events/queue/producers/EventsQueue.producer';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import configs from '@core/configs/configs.config';
import SqsClient from '@dev/localstack/queues/SqsClient';
import { configServiceMock, cryptographyServiceMock, dataParserHelperMock, loggerProviderMock } from '@dev/mocks/mockedModules';


const appConfigs = configs();
const { region: awsRegion } = appConfigs.integration.aws.credentials;
const { queueName: eventsQueueName, queueUrl: eventsQueueUrl } = appConfigs.integration.aws.sqs.eventsQueue;

@Module({
	imports: [
		SqsModule.register({
			consumers: [
				{
					sqs: new SqsClient(
						configServiceMock as any,
						cryptographyServiceMock,
						loggerProviderMock,
						dataParserHelperMock,
					).getClient(),
					name: eventsQueueName,
					queueUrl: eventsQueueUrl,
					region: awsRegion,
					batchSize: 10,
					shouldDeleteMessages: false,
					handleMessageTimeout: 1000,
					waitTimeSeconds: 20,
					authenticationErrorTimeout: 10000,
				},
			],
			producers: [],
		}),
	],
	controllers: [],
	providers: [
		EventsQueueConsumer,
		EventsQueueProducer,
		EventsQueueHandler,
		WebSocketServer,
		WebSocketClient,
	],
	exports: [
		WebSocketServer,
		WebSocketClient,
	],
})
export default class EventsModule { }
