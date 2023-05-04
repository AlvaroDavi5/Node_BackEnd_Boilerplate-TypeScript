import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Logger } from 'winston';
import { ContainerInterface } from 'src/types/_containerInterface';


interface MessagesInterface {
	[key: string]: any,
}

interface SocketInterface {
	id: string;
	on: (event: string, callback: (msg: MessagesInterface | string | any) => void) => void;
	broadcast: {
		emit: (event: string, msg: string) => void
	};
}

export interface WebSocketServerInterface {
	on: (event: string, callback: (socket: SocketInterface) => void) => void;
	to: (socketId: string) => {
		emit: (event: string, msg: string) => void
	};
}

export default class WebSocketServer {
	private httpServer: HttpServer;
	private webSocketServer: Server;
	private socketEventsRegister: (server: WebSocketServerInterface) => void;
	private logger: Logger;

	constructor({ httpServer, socketEventsRegister, logger }: ContainerInterface) {
		const corsConfig = {
			origin: '*',
			methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
		};

		this.httpServer = httpServer.getServer();
		this.webSocketServer = new Server(this.httpServer, {
			cors: corsConfig,
		});
		this.socketEventsRegister = socketEventsRegister;
		this.logger = logger;
	}

	async getSocketsIds() {
		const socketsList: Array<any> = await this.webSocketServer.sockets.fetchSockets();

		return socketsList?.map(socket => socket?.id) || [];
	}

	async disconnectAllSockets() {
		const disconnectSockets = this.webSocketServer.disconnectSockets();

		return disconnectSockets;
	}

	start() {
		this.socketEventsRegister(this.webSocketServer);

		this.logger.info('WebSocket started with HTTP server');
	}
}
