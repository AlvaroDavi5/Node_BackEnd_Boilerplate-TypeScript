import { ModuleRef } from '@nestjs/core';
import { OnModuleInit, UseFilters, UseGuards } from '@nestjs/common';
import {
	WebSocketGateway, SubscribeMessage, MessageBody,
	WebSocketServer as Server, ConnectedSocket,
	OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server as SocketIoServer, Socket } from 'socket.io';
import LoggerService from '@core/logging/Logger.service';
import { WebSocketEventsEnum, WebSocketRoomsEnum } from '@domain/enums/events.enum';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import EventsQueueProducer from '@events/queue/producers/EventsQueue.producer';
import EventsGuard from '@events/websocket/guards/Events.guard';
import { WebSocketExceptionsFilter } from '@events/websocket/filters/WebSocketExceptions.filter';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { HttpMethodsEnum } from '@common/enums/httpMethods.enum';
import { getObjValues } from '@common/utils/dataValidations.util';


@WebSocketGateway({
	cors: {
		origin: '*',
		allowedHeaders: '*',
		methods: getObjValues<HttpMethodsEnum>(HttpMethodsEnum),
	}
})
@UseFilters(WebSocketExceptionsFilter)
@UseGuards(CustomThrottlerGuard, EventsGuard)
export default class WebSocketServer implements OnModuleInit, OnGatewayInit<SocketIoServer>, OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
	@Server()
	private server!: SocketIoServer;

	private subscriptionService!: SubscriptionService;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly eventsQueueProducer: EventsQueueProducer,
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) { }

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
	}

	private formatMessageAfterReceiveHelper(message: string): object | string | null {
		return this.dataParserHelper.toObject(message).data ?? message;
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
	public async handleConnection(socket: Socket, ...args: unknown[]): Promise<void> {
		this.logger.info(`Client connected: ${socket.id} - ${args}`);

		await this.saveAndDispatchConnection(socket.id);
	}

	// listen 'disconnect' event from client
	public async handleDisconnect(socket: Socket): Promise<void> {
		this.logger.info(`Client disconnected: ${socket.id}`);
		await socket.leave(WebSocketRoomsEnum.NEW_CONNECTIONS);

		await this.deleteConnection(socket.id);
	}

	public disconnect(): void {
		this.server?.close();
	}

	public disconnectAllSockets(): void {
		this.server?.disconnectSockets();
	}

	public async getSocketsIds(): Promise<string[]> {
		const socketsList = await this.server?.sockets.fetchSockets();
		return socketsList?.map((socket) => socket?.id) ?? [];
	}

	@SubscribeMessage(WebSocketEventsEnum.RECONNECT)
	public async handleReconnect(
		@ConnectedSocket() socket: Socket,
		@MessageBody() msg: string,
	): Promise<void> { // listen reconnect event from client
		this.logger.info(`Client reconnected: ${socket.id}`);

		await this.updateConnection(socket, msg);
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
		@ConnectedSocket() _socket: Socket,
		@MessageBody() msg: string,
	): void { // listen 'emit_private' order event from client
		const { socketIdsOrRooms, ...message } = this.formatMessageAfterReceiveHelper(msg) as { [key: string]: unknown, socketIdsOrRooms?: string | string[] };
		const msgContent = this.formatMessageBeforeSendHelper(message);

		if (!socketIdsOrRooms) {
			this.logger.warn('Invalid socket IDs or Rooms to emit');
			return;
		}

		this.logger.info(`Emiting message to: ${socketIdsOrRooms}`);
		this.server?.to(socketIdsOrRooms).emit(
			WebSocketEventsEnum.EMIT,
			String(msgContent),
		); // emit to specific clients or rooms
	}

	private async saveAndDispatchConnection(socketId: string): Promise<void> {
		await this.subscriptionService.save(socketId, {
			subscriptionId: socketId,
		});

		await this.eventsQueueProducer.dispatch({
			title: 'New Client Connected',
			author: 'Websocket Server',
			payload: {
				subscriptionId: socketId,
				event: WebSocketEventsEnum.NEW_CONNECTION,
			},
			schema: WebSocketEventsEnum.CONNECT,
		});
	}

	private async updateConnection(socket: Socket, message: string): Promise<void> {
		const data = this.formatMessageAfterReceiveHelper(message);

		if (typeof data === 'object' && !!data) {
			const subscription = await this.subscriptionService.save(socket.id, {
				...data,
				subscriptionId: socket.id,
			});

			if (subscription.newConnectionsListen === true)
				await socket.join(WebSocketRoomsEnum.NEW_CONNECTIONS);
			else
				await socket.leave(WebSocketRoomsEnum.NEW_CONNECTIONS);
		}
	}

	private async deleteConnection(socketId: string): Promise<void> {
		await this.subscriptionService.delete(socketId);
	}
}
