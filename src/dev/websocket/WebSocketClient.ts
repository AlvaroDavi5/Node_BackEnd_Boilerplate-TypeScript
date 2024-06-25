import { io, Socket as ClientSocket } from 'socket.io-client';
import { ConfigsInterface } from 'src/modules/core/configs/configs.config';
import { dataParserHelperMock } from '../mocks/mockedModules';


export default class WebSocketClient {
	private readonly clientSocket!: ClientSocket;
	private readonly logger: Console;

	constructor({
		configs,
		logger,
	}: any) {
		const appConfigs: ConfigsInterface['application'] = configs.application;
		const socketUrl = appConfigs.url;

		this.logger = logger;
		if (appConfigs.socketEnv) {
			this.clientSocket = io(socketUrl, {
				autoConnect: true,
				closeOnBeforeunload: true,
				reconnectionAttempts: 3,
				timeout: (1 * 1000),
				ackTimeout: (2 * 1000),
			});
		}
	}

	private formatMessageBeforeSend(data: unknown): string {
		return dataParserHelperMock.toString(data);
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
