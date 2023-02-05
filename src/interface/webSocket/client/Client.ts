import { io, Socket } from 'socket.io-client';
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
	formatMessageBeforeSendHelper: any;
	clientSocket!: Socket;
	logger: any;

	/**
	@param {Object} ctx - Dependency Injection.
	@param {import('src/interface/webSocket/helpers/formatMessageBeforeSendHelper')} ctx.formatMessageBeforeSendHelper
	@param {import('src/infra/logging/logger')} ctx.logger
	@param {import('configs/configs')} ctx.configs
	**/
	constructor({ formatMessageBeforeSendHelper, logger, config }: ContainerInterface) {
		const socketUrl = config.application.url;
		const isSocketEnvEnabled = config?.application?.socketEnv === 'enabled';

		this.formatMessageBeforeSendHelper = formatMessageBeforeSendHelper;
		this.logger = logger;

		if (isSocketEnvEnabled) {
			this.clientSocket = io(socketUrl);
		}
	}

	// send message to server
	send(event: string, msg: object) {

		this.clientSocket?.emit(
			String(event),
			this.formatMessageBeforeSendHelper.execute(msg),
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
