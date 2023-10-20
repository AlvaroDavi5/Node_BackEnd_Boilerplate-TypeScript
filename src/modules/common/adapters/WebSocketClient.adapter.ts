import { Injectable } from '@nestjs/common';
import WebSocketClient from '@events/websocket/client/WebSocket.client';


@Injectable()
export default class WebSocketClientAdapter {
	constructor(
		private readonly webSocketClient: WebSocketClient,
	) { }

	public getProvider(): WebSocketClient {
		return this.webSocketClient;
	}
}
