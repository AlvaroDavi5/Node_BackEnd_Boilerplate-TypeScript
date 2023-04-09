import webSocketEventsEnum from 'src/domain/enums/webSocketEventsEnum';
import { WebSocketServerInterface } from 'src/interface/webSocket/server/Server';
import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	saveConnectionsService,
	deleteConnectionsService,
	logger,
	formatMessageAfterReceiveHelper,
	formatMessageBeforeSendHelper,
}: ContainerInterface) => {

	const register = (server: WebSocketServerInterface) => {
		// listen connect event from client
		server.on(
			webSocketEventsEnum.CONNECT,
			async (socket) => {
				logger.info(`Client connected: ${socket.id}`);
				saveConnectionsService.execute(socket.id, {
					connectionId: socket.id,
				});

				// listen disconnect event from client
				socket.on(
					webSocketEventsEnum.DISCONNECT,
					async (msg) => {
						logger.info(`Client disconnected: ${socket.id}`);
						deleteConnectionsService.execute(socket.id);
					},
				);

				// listen reconnect event from client
				socket.on(
					webSocketEventsEnum.RECONNECT,
					async (msg) => {
						logger.info(`Client reconnected: ${socket.id}`);
						saveConnectionsService.execute(socket.id, {
							connectionId: socket.id,
							...formatMessageAfterReceiveHelper.execute(msg),
						});
					},
				);

				// listen broadcast order event from client
				socket.on(
					webSocketEventsEnum.BROADCAST,
					async (msg) => {
						socket.broadcast.emit(webSocketEventsEnum.EMIT, msg); // emit to all clients, except the sender
					},
				);

				// listen emit privately order event from client
				socket.on(
					webSocketEventsEnum.EMIT_PRIVATE,
					async (msg) => {
						msg = formatMessageAfterReceiveHelper.execute(msg);
						const payload = formatMessageBeforeSendHelper.execute(msg?.payload);

						server.to(msg?.targetSocketId).emit(
							String(webSocketEventsEnum.EMIT),
							String(payload),
						); // emit to single client
					},
				);
			},
		);
	};

	return register;
};
