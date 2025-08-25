import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import WebSocketServer from './websocket/server/WebSocket.server';
import WebSocketClient from './websocket/client/WebSocket.client';
import { sqsConsumersFactory } from './sqsConsumers.factory';
import EventsQueueConsumer from './queue/consumers/EventsQueue.consumer';
import EventsQueueProducer from './queue/producers/EventsQueue.producer';
import EventsQueueHandler from './queue/handlers/EventsQueue.handler';
import EventEmitterClient from './emitter/EventEmitter.client';


@Module({
	imports: [
		SqsModule.register({
			consumers: sqsConsumersFactory(),
			producers: [],
		}),
	],
	controllers: [],
	providers: [
		EventsQueueConsumer,
		EventsQueueProducer,
		EventsQueueHandler,
		EventEmitterClient,
		WebSocketServer,
		WebSocketClient,
	],
	exports: [
		EventsQueueConsumer,
		EventEmitterClient,
		WebSocketServer,
		WebSocketClient,
	],
})
export default class EventsModule { }
