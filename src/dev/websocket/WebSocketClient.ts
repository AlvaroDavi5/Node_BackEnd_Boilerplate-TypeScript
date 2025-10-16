import { io, Socket as ClientSocket } from 'socket.io-client';
import { ConfigsInterface } from '@core/configs/envs.config';
import { LoggerInterface } from '@core/logging/logger';
import { secondsToMilliseconds } from '@common/utils/dates.util';
import { dataParserHelperMock } from '../mocks/mockedModules';


export default class WebSocketClient {
	private readonly clientSocket!: ClientSocket;
	private readonly logger: LoggerInterface;

	constructor({ configs, logger }: { configs: ConfigsInterface, logger: LoggerInterface }) {
		const appConfigs = configs.application;
		const socketUrl = appConfigs.url;

		this.logger = logger;
		if (appConfigs.socketEnv) {
			this.clientSocket = io(socketUrl, {
				autoConnect: true,
				closeOnBeforeunload: true,
				reconnectionAttempts: 3,
				timeout: secondsToMilliseconds(1),
				ackTimeout: secondsToMilliseconds(2),
			});
		}
	}

	private formatMessageBeforeSend(message: unknown): string {
		return dataParserHelperMock.toString(message);
	}

	public send(event: string, msg: unknown): void {
		this.clientSocket.emit(
			String(event),
			this.formatMessageBeforeSend(msg),
		);
	}

	public listen(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Listenning event '${event}' from the WebSocket server`);

		this.clientSocket.on(String(event), callback);
	}

	public ignore(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Ignoring event '${event}' from the WebSocket server`);

		this.clientSocket.off(String(event), callback);
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
