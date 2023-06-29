import { Module, Global } from '@nestjs/common';
import WebSocketServer from '@modules/events/webSocket/server/WebSocketServer';
import WebSocketClient from '@modules/events/webSocket/client/WebSocketClient';


@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		WebSocketServer,
		WebSocketClient,
	],
	exports: [
		WebSocketServer,
		WebSocketClient,
	],
})
export default class EventsModule { }
