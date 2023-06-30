import {
	WebSocketGateway, SubscribeMessage, MessageBody,
	WebSocketServer as Server, ConnectedSocket,
	OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server as SocketIoServer, Socket } from 'socket.io';
import { Logger } from 'winston';
import { WebSocketEventsEnum } from '@modules/app/domain/enums/webSocketEventsEnum';
import SubscriptionService from '@modules/app/services/SubscriptionService';
import EventsQueueProducer from '@modules/events/queue/producers/EventsQueueProducer';
import LoggerGenerator from '@infra/logging/LoggerGenerator';
import DataParserHelper from '@modules/utils/helpers/DataParserHelper';


@WebSocketGateway({
	namespace: 'WebSocketServer',
	cors: {
		origin: '*',
		allowedHeaders: '*',
		methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	}
})
export default class WebSocketServer implements OnGatewayInit<SocketIoServer>, OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
	@Server()
	private server: SocketIoServer | undefined;

	private readonly logger: Logger;

	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly eventsQueueProducer: EventsQueueProducer,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly dataParserHelper: DataParserHelper,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	private formatMessageAfterReceiveHelper(message: string): any {
		return this.dataParserHelper.toObject(message);
	}

	private formatMessageBeforeSendHelper(message: any): string {
		return this.dataParserHelper.toString(message);
	}

	public afterInit(server: SocketIoServer): void {
		this.logger.debug(`this.server: ${this.server} - server: ${server}`);
		if (!this.server)
			this.server = server;
	}

	// listen connect event from client
	public async handleConnection(socket: Socket, ...args: any[]): Promise<void> {
		this.logger.debug(`${WebSocketEventsEnum.CONNECT} - ${socket}: ${args}`);
		this.logger.info(`Client connected: ${socket.id}`);
		this.eventsQueueProducer.dispatch({
			title: 'New client connected',
			event: {
				subscriptionId: socket.id,
			},
			author: 'Websocket Server',
		});
		await this.subscriptionService.save(socket.id, {
			subscriptionId: socket.id,
		});
	}

	// listen disconnect event from client
	public async handleDisconnect(socket: Socket): Promise<void> {
		this.logger.debug(`${WebSocketEventsEnum.DISCONNECT} - ${socket}`);
		this.logger.info(`Client disconnected: ${socket.id}`);
		await this.subscriptionService.delete(socket.id);
	}

	public async getSocketsIds(): Promise<string[]> {
		const socketsList = await this.server?.sockets.fetchSockets();
		return socketsList?.map(socket => socket?.id) || [];
	}

	public disconnectAllSockets(): void {
		this.server?.disconnectSockets();
	}

	@SubscribeMessage(WebSocketEventsEnum.RECONNECT)
	public async handleReconnect(
		@MessageBody() msg: string,
		@ConnectedSocket() socket: Socket,
	): Promise<void> { // listen reconnect event from client
		this.logger.info(`Client reconnected: ${socket.id}`);
		await this.subscriptionService.save(socket.id, {
			...this.formatMessageAfterReceiveHelper(msg),
			subscriptionId: socket.id,
		});
	}

	@SubscribeMessage(WebSocketEventsEnum.BROADCAST)
	public broadcast(
		@MessageBody() msg: string,
		@ConnectedSocket() socket: Socket,
	): void { // listen broadcast order event from client
		socket.broadcast.emit(WebSocketEventsEnum.EMIT, msg); // emit to all clients, except the sender
	}

	@SubscribeMessage(WebSocketEventsEnum.EMIT_PRIVATE)
	public emitPrivate(
		@MessageBody() msg: string,
		@ConnectedSocket() socket: Socket,
	): void { // listen emit privately order event from client
		this.logger.debug(`${msg} - ${socket}`);
		socket.emit('events', { name: 'Nest' });
		const message = this.formatMessageAfterReceiveHelper(msg);
		const payload = this.formatMessageBeforeSendHelper(message?.payload);

		this.server?.to(message?.targetSocketId).emit(
			String(WebSocketEventsEnum.EMIT),
			String(payload),
		); // emit to single client
	}
}
