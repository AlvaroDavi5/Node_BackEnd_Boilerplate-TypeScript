import { Injectable } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { Logger } from 'winston';
import { ConfigsInterface } from '@configs/configs.config';


@Injectable()
export default class WebSocketClient {
	private clientSocket!: Socket;
	private logger: Logger;

	constructor({
		configs,
		logger,
	}: any) {
		const appConfigs: ConfigsInterface['application'] = configs.application;
		const socketUrl = appConfigs.url || 'http://localhost:3000';
		const isSocketEnvEnabled = appConfigs?.socketEnv === 'enabled';

		this.logger = logger;
		if (isSocketEnvEnabled) {
			this.clientSocket = io(socketUrl, {
				autoConnect: true,
				closeOnBeforeunload: true,
				reconnectionAttempts: 3,
				timeout: 1000,
				ackTimeout: (2 * 1000),
			});
		}
	}

	private formatMessageBeforeSend(data: any = {}): string {
		let result = null;

		switch (typeof data) {
		case 'bigint':
			result = data.toString();
			break;
		case 'number':
			result = data.toString();
			break;
		case 'boolean':
			result = data.toString();
			break;
		case 'string':
			result = data;
			break;
		case 'object':
			try {
				result = JSON.stringify(data);
			} catch (error) {
				result = '';
				this.logger.warn('Object:String parse error');
			}
			break;
		case 'symbol':
			result = data.toString();
			break;
		default:
			result = '';
			break;
		}

		return result;
	}

	// send message to server
	send(event: string, msg: any) {

		this.clientSocket?.emit(
			String(event),
			this.formatMessageBeforeSend(msg),
		);
	}

	// listen/ignore event messages from the server
	listen(event: string, callback: any) {
		this.logger.info(`Listenned event '${event}' from the WebSocket server`);

		this.clientSocket?.on(
			String(event),
			callback,
		);
	}

	ignore(event: string, callback: any) {
		this.logger.info(`Ignored event '${event}' from the WebSocket server`);

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
