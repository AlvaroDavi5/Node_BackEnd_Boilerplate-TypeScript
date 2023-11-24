import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';
import { Logger } from 'winston';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { ConfigsInterface } from '@core/configs/configs.config';


@Injectable()
export default class WebSocketClient {
	private readonly clientSocket!: Socket;
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const configs: ConfigsInterface['application'] = this.configService.get<any>('application');
		const socketUrl = configs.url || 'http://localhost:3000';
		const isSocketEnvEnabled = configs?.socketEnv === 'enabled';

		this.logger = this.loggerGenerator.getLogger();
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

	private formatMessageBeforeSend(message: unknown): string {
		return this.dataParserHelper.toString(message) || '{}';
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
