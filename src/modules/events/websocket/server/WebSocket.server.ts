import { ModuleRef } from '@nestjs/core';
import { Inject, OnModuleInit, UseGuards } from '@nestjs/common';
import {
	WebSocketGateway, SubscribeMessage, MessageBody,
	WebSocketServer as Server, ConnectedSocket,
	OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server as SocketIoServer, Socket as ServerSocket } from 'socket.io';
import { Logger } from 'winston';
import { EventsEnum } from '@domain/enums/events.enum';
import { WebSocketEventsEnum, WebSocketRoomsEnum } from '@domain/enums/webSocketEvents.enum';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import EventsQueueProducer from '@events/queue/producers/EventsQueue.producer';
import EventsGuard from '@events/websocket/guards/Events.guard';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.provider';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { HttpMethodsEnum } from '@common/enums/httpMethods.enum';


@WebSocketGateway({
	cors: {
		origin: '*',
		allowedHeaders: '*',
		methods: Object.values(HttpMethodsEnum),
	}
})
@UseGuards(EventsGuard)
export default class WebSocketServer implements OnModuleInit, OnGatewayInit<SocketIoServer>, OnGatewayConnection<ServerSocket>, OnGatewayDisconnect<ServerSocket> {
	@Server()
	private server!: SocketIoServer;

	private subscriptionService!: SubscriptionService;
	private readonly logger: Logger;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly eventsQueueProducer: EventsQueueProducer,
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
		private readonly dataParserHelper: DataParserHelper,
	) {
		this.logger = this.loggerProvider.getLogger(WebSocketServer.name);
	}

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
	}

	private formatMessageAfterReceiveHelper(message: string): object | string | null {
		return this.dataParserHelper.toObject(message) ?? message;
	}

	private formatMessageBeforeSendHelper(message: unknown): string {
		return this.dataParserHelper.toString(message);
	}

	public afterInit(server: SocketIoServer): void {
		server.setMaxListeners(5);
		if (!this.server)
			this.server = server;
		this.server.setMaxListeners(5);
		this.logger.debug('Started Websocket Server');
	}

	// listen 'connection' event from client
	public async handleConnection(socket: ServerSocket, ...args: unknown[]): Promise<void> {
		this.logger.info(`Client connected: ${socket.id} - ${args}`);
		await this.subscriptionService.save(socket.id, {
			subscriptionId: socket.id,
		});
		await this.eventsQueueProducer.dispatch({
			title: 'New Client Connected',
			author: 'Websocket Server',
			payload: {
				subscriptionId: socket.id,
				event: EventsEnum.NEW_CONNECTION,
			},
			schema: WebSocketEventsEnum.CONNECT,
		});
	}

	// listen 'disconnect' event from client
	public async handleDisconnect(socket: ServerSocket): Promise<void> {
		this.logger.info(`Client disconnected: ${socket.id}`);
		await socket.leave(WebSocketRoomsEnum.NEW_CONNECTIONS);
		await this.subscriptionService.delete(socket.id);
	}

	public disconnect(): void {
		this.server?.close();
	}

	public async getSocketsIds(): Promise<string[]> {
		const socketsList = await this.server?.sockets.fetchSockets();
		return socketsList?.map((socket) => socket?.id) ?? [];
	}

	public disconnectAllSockets(): void {
		this.server?.disconnectSockets();
	}

	@SubscribeMessage(WebSocketEventsEnum.RECONNECT)
	public async handleReconnect(
		@ConnectedSocket() socket: ServerSocket,
		@MessageBody() msg: string,
	): Promise<void> { // listen reconnect event from client
		this.logger.info(`Client reconnected: ${socket.id}`);

		const message = this.formatMessageAfterReceiveHelper(msg);
		if (message && typeof message === 'object') {
			const subscription = await this.subscriptionService.save(socket.id, {
				...message,
				subscriptionId: socket.id,
			});

			if (subscription?.newConnectionsListen === true)
				await socket.join(WebSocketRoomsEnum.NEW_CONNECTIONS);
		}
	}

	@SubscribeMessage(WebSocketEventsEnum.BROADCAST)
	public broadcast(
		@ConnectedSocket() socket: ServerSocket,
		@MessageBody() msg: string,
	): void { // listen 'broadcast' event from client
		this.logger.info('Emiting message to all clients');
		socket.broadcast.emit(WebSocketEventsEnum.EMIT, msg); // emit to all clients, except the sender
	}

	@SubscribeMessage(WebSocketEventsEnum.EMIT_PRIVATE)
	public emitPrivate(
		@ConnectedSocket() socket: ServerSocket,
		@MessageBody() msg: string,
	): void { // listen 'emit_private' order event from client
		const { socketIdsOrRooms, ...message }: { [key: string]: any, socketIdsOrRooms?: string | string[] } = this.formatMessageAfterReceiveHelper(msg) as any;
		const msgContent = this.formatMessageBeforeSendHelper(message);

		if (!socketIdsOrRooms) {
			this.logger.warn('Invalid socketIds or Rooms to emit');
			return;
		}

		this.logger.info(`Emiting message to: ${socketIdsOrRooms}`);
		this.server?.to(socketIdsOrRooms).emit(
			String(WebSocketEventsEnum.EMIT),
			String(msgContent),
		); // emit to specific clients or rooms
	}
}
