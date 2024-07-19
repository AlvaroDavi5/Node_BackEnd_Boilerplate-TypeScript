import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import WebSocketServer from './websocket/server/WebSocket.server';
import WebSocketClient from './websocket/client/WebSocket.client';
import EventsQueueConsumer, { eventsQueueConsumerConfigs } from './queue/consumers/EventsQueue.consumer';
import EventsQueueProducer from './queue/producers/EventsQueue.producer';
import EventsQueueHandler from './queue/handlers/EventsQueue.handler';


@Module({
	imports: [
		SqsModule.register({
			consumers: [
				eventsQueueConsumerConfigs,
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
