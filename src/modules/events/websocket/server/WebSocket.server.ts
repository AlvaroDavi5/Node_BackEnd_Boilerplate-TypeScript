import {
	WebSocketGateway, SubscribeMessage, MessageBody,
	WebSocketServer as Server, ConnectedSocket,
	OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server as SocketIoServer, Socket } from 'socket.io';
import { Logger } from 'winston';
import { WebSocketEventsEnum } from '@app/domain/enums/webSocketEvents.enum';
import SubscriptionService from '@app/services/Subscription.service';
import EventsQueueProducer from '@events/queue/producers/EventsQueue.producer';
import EventsQueueProducerAdapter from '@common/adapters/EventsQueueProducer.adapter';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


@WebSocketGateway({
	cors: {
		origin: '*',
		allowedHeaders: '*',
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	}
})
export default class WebSocketServer implements OnGatewayInit<SocketIoServer>, OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
	@Server()
	private server: SocketIoServer | undefined;

	private readonly eventsQueueProducer: EventsQueueProducer;
	private readonly logger: Logger;

	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly eventsQueueProducerAdapter: EventsQueueProducerAdapter,
		private readonly loggerGenerator: LoggerGenerator,
		private readonly dataParserHelper: DataParserHelper,
	) {
		this.eventsQueueProducer = this.eventsQueueProducerAdapter.getProvider();
		this.logger = this.loggerGenerator.getLogger();
	}

	private formatMessageAfterReceiveHelper(message: string): object | string | null {
		return this.dataParserHelper.toObject(message);
	}

	private formatMessageBeforeSendHelper(message: unknown): string {
		return this.dataParserHelper.toString(message) || '{}';
	}

	public afterInit(server: SocketIoServer): void {
		server.setMaxListeners(5);
		if (!this.server)
			this.server = server;
		this.server.setMaxListeners(5);
		this.logger.debug('Started Websocket Server');
	}

	// listen 'connection' event from client
	public async handleConnection(socket: Socket, ...args: unknown[]): Promise<void> {
		this.logger.info(`Client connected: ${socket.id} - ${args}`);
		await this.subscriptionService.save(socket.id, {
			subscriptionId: socket.id,
		});
		await this.eventsQueueProducer.dispatch({
			title: 'New Client Connected',
			author: 'Websocket Server',
			payload: {
				subscriptionId: socket.id,
			},
			schema: WebSocketEventsEnum.CONNECT,
		});
	}

	// listen 'disconnect' event from client
	public async handleDisconnect(socket: Socket): Promise<void> {
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
		@ConnectedSocket() socket: Socket,
		@MessageBody() msg: string,
	): Promise<void> { // listen reconnect event from client
		this.logger.info(`Client reconnected: ${socket.id}`);

		const message = this.formatMessageAfterReceiveHelper(msg);
		if (message && typeof message === 'object')
			await this.subscriptionService.save(socket.id, {
				...message,
				subscriptionId: socket.id,
			});
	}

	@SubscribeMessage(WebSocketEventsEnum.BROADCAST)
	public broadcast(
		@ConnectedSocket() socket: Socket,
		@MessageBody() msg: string,
	): void { // listen 'broadcast' event from client
		this.logger.info('Emiting message to all clients');
		socket.broadcast.emit(WebSocketEventsEnum.EMIT, msg); // emit to all clients, except the sender
	}

	@SubscribeMessage(WebSocketEventsEnum.EMIT_PRIVATE)
	public emitPrivate(
		@ConnectedSocket() socket: Socket,
		@MessageBody() msg: string,
	): void { // listen 'emit-private' order event from client
		const message: any = this.formatMessageAfterReceiveHelper(msg);
		const payload = this.formatMessageBeforeSendHelper(message?.payload);

		this.logger.info(`Emiting message to: ${message?.targetSocketId}`);
		this.server?.to(message?.targetSocketId).emit(
			String(WebSocketEventsEnum.EMIT),
			String(payload),
		); // emit to single client
	}
}
