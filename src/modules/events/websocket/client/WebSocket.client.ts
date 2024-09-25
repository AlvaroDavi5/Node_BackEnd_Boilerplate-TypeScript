import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket as ClientSocket } from 'socket.io-client';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { ConfigsInterface } from '@core/configs/envs.config';


@Injectable()
export default class WebSocketClient {
	private readonly clientSocket!: ClientSocket;

	constructor(
		private readonly configService: ConfigService,
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const configs = this.configService.get<ConfigsInterface['application']>('application')!;
		const socketUrl = configs.url;

		if (configs.socketEnv) {
			this.clientSocket = io(socketUrl, {
				autoConnect: true,
				closeOnBeforeunload: true,
				reconnectionAttempts: 3,
				timeout: (1 * 1000),
				ackTimeout: (2 * 1000),
			});
		}
	}

	private formatMessageBeforeSend(message: unknown): string {
		return this.dataParserHelper.toString(message);
	}

	// send message to server
	public send(event: string, msg: unknown): void {
		this.clientSocket.emit(
			String(event),
			this.formatMessageBeforeSend(msg),
		);
	}

	// listen event messages from the server
	public listen(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Listenned event '${event}' from the WebSocket server`);

		this.clientSocket.on(
			String(event),
			callback,
		);
	}

	// ignore listenned event messages from the server
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
