import { io, Socket } from 'socket.io-client';
import { Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/configs.config';


export default class WebSocketClient {
	private readonly clientSocket!: Socket;
	private readonly logger: Logger;

	constructor({
		configs,
		logger,
	}: any) {
		const appConfigs: ConfigsInterface['application'] = configs.application;
		const socketUrl = appConfigs.url;
		const isSocketEnvEnabled = appConfigs.socketEnv === 'enabled';

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

	private formatMessageBeforeSend(data: unknown): string {
		let result = '';

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
			result = (JSON.stringify(data) || data?.toString()) ?? '';
			break;
		case 'symbol':
			result = data.toString();
			break;
		default:
			result = '{}';
			break;
		}

		return result;
	}

	public send(event: string, msg: unknown): void {
		this.clientSocket.emit(
			String(event),
			this.formatMessageBeforeSend(msg),
		);
	}

	public listen(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Listenned event '${event}' from the WebSocket server`);

		this.clientSocket.on(
			String(event),
			callback,
		);
	}

	public ignore(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Ignored event '${event}' from the WebSocket server`);

		this.clientSocket.off(
			String(event),
			callback,
		);
	}

	public isConnected(): boolean {
		return this.clientSocket.connected;
	}

	public connect(): void {
		this.clientSocket.connect();
	}

	public disconnect(): void {
		this.clientSocket.disconnect();
	}
}
