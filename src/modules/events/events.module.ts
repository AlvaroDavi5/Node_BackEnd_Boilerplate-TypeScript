import { Module } from '@nestjs/common';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import GetSubscriptionUseCase from '@app/subscription/usecases/GetSubscription.usecase';
import ServerEventsController from './api/controllers/ServerEvents.controller';
import EventEmitterClient from './emitter/EventEmitter.client';
import WebSocketServer from './websocket/server/WebSocket.server';
import { sqsConsumersFactory } from './sqsConsumers.factory';
import EventsQueueHandler from './queue/handlers/EventsQueue.handler';
import EventsQueueConsumer from './queue/consumers/EventsQueue.consumer';
import SqsModule from './queue/sqs/Sqs.module';
import EventsQueueProducer from './queue/producers/EventsQueue.producer';

@Module({
	imports: [SqsModule.register({ consumers: sqsConsumersFactory() })],
	controllers: [ServerEventsController],
	providers: [GetSubscriptionUseCase, SubscriptionService, EventEmitterClient, WebSocketServer, EventsQueueHandler, EventsQueueConsumer, EventsQueueProducer],
	exports: [EventEmitterClient, WebSocketServer, EventsQueueConsumer],
})
export default class EventsModule {}
