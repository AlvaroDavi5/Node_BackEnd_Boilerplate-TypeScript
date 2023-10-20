import { Injectable } from '@nestjs/common';
import WebSocketServer from '@events/websocket/server/WebSocket.server';


@Injectable()
export default class WebSocketServerAdapter {
	constructor(
		private readonly webSocketServer: WebSocketServer,
	) { }

	public getProvider(): WebSocketServer {
		return this.webSocketServer;
	}
}
