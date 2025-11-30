import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import GetSubscriptionUseCase from '@app/subscription/usecases/GetSubscription.usecase';
import RequestMiddleware from '@api/middlewares/Request.middleware';
import ServerEventsController from './api/controllers/ServerEvents.controller';
import EventEmitterClient from './emitter/EventEmitter.client';
import WebSocketClient from './websocket/client/WebSocket.client';
import WebSocketServer from './websocket/server/WebSocket.server';
import { sqsConsumersFactory } from './sqsConsumers.factory';
import EventsQueueHandler from './queue/handlers/EventsQueue.handler';
import EventsQueueConsumer from './queue/consumers/EventsQueue.consumer';
import EventsQueueProducer from './queue/producers/EventsQueue.producer';


@Module({
	imports: [
		SqsModule.register({
			consumers: sqsConsumersFactory(),
			producers: [],
		}),
	],
	controllers: [
		ServerEventsController,
	],
	providers: [
		GetSubscriptionUseCase,
		SubscriptionService,
		EventEmitterClient,
		WebSocketClient,
		WebSocketServer,
		EventsQueueHandler,
		EventsQueueConsumer,
		EventsQueueProducer,
	],
	exports: [
		EventEmitterClient,
		WebSocketClient,
		WebSocketServer,
		EventsQueueConsumer,
	],
})
export default class EventsModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestMiddleware)
			.forRoutes(
				ServerEventsController,
			);
	}
}
