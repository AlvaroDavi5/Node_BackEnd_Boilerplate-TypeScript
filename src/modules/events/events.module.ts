import { Module, Global } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import WebSocketServer from '@modules/events/webSocket/server/WebSocketServer';
import WebSocketClient from '@modules/events/webSocket/client/WebSocketClient';
import EventsQueueConsumer from '@modules/events/queue/consumers/EventsQueueConsumer';
import EventsQueueProducer from '@modules/events/queue/producers/EventsQueueProducer';


@Global()
@Module({
	imports: [
		SqsModule.register({
			consumers: [
				{
					name: process.env.AWS_SQS_EVENTS_QUEUE_NAME || 'eventsQueue.fifo',
					queueUrl: process.env.AWS_SQS_EVENTS_QUEUE_URL || 'http://localhost:4566/000000000000/eventsQueue.fifo',
					region: process.env.AWS_REGION || 'us-east-1',
					batchSize: 10,
					shouldDeleteMessages: true,
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
