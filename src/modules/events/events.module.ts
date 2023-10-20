import { Module, Global } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import WebSocketServer from '@events/websocket/server/WebSocket.server';
import WebSocketClient from '@events/websocket/client/WebSocket.client';
import EventsQueueConsumer from '@events/queue/consumers/EventsQueue.consumer';
import EventsQueueProducer from '@events/queue/producers/EventsQueue.producer';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import configs from '@core/configs/configs.config';
import SqsClient from 'src/dev/localstack/queues/SqsClient';


@Global()
@Module({
	imports: [
		SqsModule.register({
			consumers: [
				{
					sqs: new SqsClient({
						logger: console,
						configs: configs(),
					}).getClient(),
					name: process.env.AWS_SQS_EVENTS_QUEUE_NAME || 'eventsQueue.fifo',
					queueUrl: process.env.AWS_SQS_EVENTS_QUEUE_URL || 'http://localhost:4566/000000000000/eventsQueue.fifo',
					region: process.env.AWS_REGION || 'us-east-1',
					batchSize: 10,
					shouldDeleteMessages: false,
					handleMessageTimeout: 1000,
					waitTimeSeconds: 20,
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
		EventsQueueProducer,
		WebSocketServer,
		WebSocketClient,
	],
})
export default class EventsModule { }
