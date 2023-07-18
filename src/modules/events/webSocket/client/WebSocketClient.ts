import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';
import { Logger } from 'winston';
import LoggerGenerator from '@infra/logging/LoggerGenerator';
import DataParserHelper from '@modules/utils/helpers/DataParserHelper';
import { ConfigsInterface } from '@configs/configs';


@Injectable()
export default class WebSocketClient {
	private clientSocket!: Socket;
	private logger: Logger;

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

	private formatMessageBeforeSend(message: any = {}): string {
		return this.dataParserHelper.toString(message);
	}

	// send message to server
	public send(event: string, msg: any) {

		this.clientSocket?.emit(
			String(event),
			this.formatMessageBeforeSend(msg),
		);
	}

	// listen event messages from the server
	public listen(event: string, callback: any) {
		this.logger.info(`Listenned event '${event}' from the WebSocket server`);

		this.clientSocket?.on(
			String(event),
			callback,
		);
	}

	// ignore listenned event messages from the server
	public ignore(event: string, callback: any) {
		this.logger.info(`Ignored event '${event}' from the WebSocket server`);

		this.clientSocket?.off(
			String(event),
			callback,
		);
	}

	public isConnected() {
		return this.clientSocket.connected;
	}

	public connect() {
		this.clientSocket.connect();
	}

	public disconnect() {
		this.clientSocket.disconnect();
	}
}
