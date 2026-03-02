import { ModuleRef } from '@nestjs/core';
import { OnModuleInit, UseFilters, UseGuards } from '@nestjs/common';
import {
	WebSocketGateway, SubscribeMessage, MessageBody,
	WebSocketServer as Server, ConnectedSocket,
	OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server as SocketIoServer, Socket } from 'socket.io';
import LoggerService from '@core/logging/Logger.service';
import { EmitterEventsEnum, QueueSchemasEnum, WebSocketEventsEnum, WebSocketRoomsEnum } from '@domain/enums/events.enum';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import EventEmitterClient from '@events/emitter/EventEmitter.client';
import EventsQueueProducer from '@events/queue/producers/EventsQueue.producer';
import EventsGuard from '@events/websocket/guards/Events.guard';
import WebSocketExceptionsFilter from '@events/websocket/filters/WebSocketExceptions.filter';
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
		private readonly eventEmitterClient: EventEmitterClient,
		private readonly eventsQueueProducer: EventsQueueProducer,
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) { }

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
	}

	public afterInit(server: SocketIoServer): void {
		server.setMaxListeners(5);
		if (!this.server)
			this.server = server;
		this.server.setMaxListeners(5);
		this.logger.debug('Started Websocket Server');

		this.setInternalListenners(server);
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

	// NOTE - listen 'connection' event from client
	public async handleConnection(socket: Socket, ...args: unknown[]): Promise<void> {
		this.logger.info(`Client connected: ${socket.id} - ${args}`);

		await this.saveAndDispatchConnection(socket.id);
	}

	// NOTE - listen 'disconnect' event from client
	public async handleDisconnect(socket: Socket): Promise<void> {
		this.logger.info(`Client disconnected: ${socket.id}`);
		await socket.leave(WebSocketRoomsEnum.NEW_CONNECTIONS);

		await this.deleteConnection(socket.id);
	}

	// NOTE - listen 'reconnect' event from client
	@SubscribeMessage(WebSocketEventsEnum.RECONNECT)
	public async handleReconnect(
		@ConnectedSocket() socket: Socket,
		@MessageBody() msg: string,
	): Promise<void> {
		this.logger.info(`Client reconnected: ${socket.id}`);

		await this.updateConnection(socket, msg);
	}

	private formatMessageAfterReceiveHelper(message: string): object | string | null {
		try {
			return this.dataParserHelper.toObject(message);
		} catch (error) {
			this.logger.error(error);
			return message;
		}
	}

	private formatMessageBeforeSendHelper(message: unknown): string {
		return this.dataParserHelper.toString(message);
	}

	private getSocketIdsOrRooms(socketIdsOrRooms: unknown): string | string[] | null {
		if (typeof socketIdsOrRooms === 'string')
			return socketIdsOrRooms;

		if (Array.isArray(socketIdsOrRooms) && socketIdsOrRooms.every((item) => typeof item === 'string'))
			return socketIdsOrRooms;

		return null;
	}

	private setInternalListenners(server: SocketIoServer): void {
		this.logger.info('Setting internal listenners for Websocket Server');

		this.eventEmitterClient.listen(EmitterEventsEnum.BROADCAST, (msg: unknown): void => {
			this.logger.info('Broadcasting message to all clients');
			server.emit(WebSocketEventsEnum.EMIT, this.formatMessageBeforeSendHelper(msg));
		});

		this.eventEmitterClient.listen(EmitterEventsEnum.EMIT_PRIVATE, (socketIdsOrRooms: unknown, msg: unknown): void => {
			const validSocketIdsOrRooms = this.getSocketIdsOrRooms(socketIdsOrRooms);
			if (!validSocketIdsOrRooms) {
				this.logger.warn('Invalid socket IDs or Rooms to emit:', socketIdsOrRooms);
				return;
			}

			this.logger.info(`Emiting message to: ${socketIdsOrRooms}`);
			server?.to(validSocketIdsOrRooms).emit(
				WebSocketEventsEnum.EMIT,
				this.formatMessageBeforeSendHelper(msg),
			);
		});
	}

	private async saveAndDispatchConnection(socketId: string): Promise<void> {
		await this.subscriptionService.save(socketId, {
			subscriptionId: socketId,
		});

		await this.eventsQueueProducer.dispatch({
			title: 'New Client Connected',
			author: 'Websocket Server',
			schema: QueueSchemasEnum.NEW_CONNECTION,
			payload: {
				subscriptionId: socketId,
				event: QueueSchemasEnum.NEW_CONNECTION,
			},
		});
	}

	private async updateConnection(socket: Socket, message: string): Promise<void> {
		const data = this.formatMessageAfterReceiveHelper(message);

		if (typeof data === 'object' && data) {
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
