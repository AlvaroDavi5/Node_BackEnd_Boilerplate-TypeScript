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
			consumers: [],
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
