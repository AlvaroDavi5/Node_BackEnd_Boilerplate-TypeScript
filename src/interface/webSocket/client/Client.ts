import { io, Socket } from 'socket.io-client';
import { Logger } from 'winston';
import { ContainerInterface } from 'src/container';


export interface WebSocketClientInterface {
	emit: (event: string, callback: any) => void,
	on: (event: string, callback: any) => void,
	off: (event: string, callback: any) => void,
	connected: boolean,
	connect: () => void,
	disconnect: () => void,
}

export default class WebSocketClient {
	private clientSocket!: Socket;
	private logger: Logger;

	constructor({ logger, configs }: ContainerInterface) {
		const socketUrl = configs.application.url;
		const isSocketEnvEnabled = configs?.application?.socketEnv === 'enabled';

		this.logger = logger;
		if (isSocketEnvEnabled) {
			this.clientSocket = io(socketUrl);
		}
	}

	_formatMessageBeforeSend(message: any = {}): string {
		let msg = '';

		try {
			msg = JSON.stringify(message);
		}
		catch (error) {
			msg = String(message);
		}

		return msg;
	}

	_formatMessageAfterReceive(message: string): any {
		let msg = '';

		try {
			msg = JSON.parse(message);
		}
		catch (error) {
			msg = String(message);
		}

		return msg;
	}

	// send message to server
	send(event: string, msg: object) {

		this.clientSocket?.emit(
			String(event),
			this._formatMessageBeforeSend(msg),
		);
	}

	// listen/ignore event messages from the server
	listen(event: string, callback: any) {
		this.logger.info('Listenned event from the WebSocket server');

		this.clientSocket?.on(
			String(event),
			callback,
		);
	}

	ignore(event: string, callback: any) {
		this.logger.info('Ignored event from the WebSocket server');

		this.clientSocket?.off(
			String(event),
			callback,
		);
	}

	isConnected() {
		return this.clientSocket.connected;
	}

	connect() {
		this.clientSocket.connect();
	}

	disconnect() {
		this.clientSocket.disconnect();
	}
}
