import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import RedisClient from '@infra/cache/Redis.client';
import WebSocketServer from '@modules/events/websocket/server/WebSocket.server';
import WebSocketClient from '@modules/events/websocket/client/WebSocket.client';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import connection, { testConnection, syncConnection } from '@infra/database/connection';


@Injectable()
export default class SyncCronTask {
	public readonly name: string;
	private readonly logger: Logger;

	constructor(
		private readonly redisClient: RedisClient,
		private readonly webSocketServer: WebSocketServer,
		private readonly webSocketClient: WebSocketClient,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.name = SyncCronTask.name;
		this.logger = this.loggerGenerator.getLogger();
	}

	public async execute(): Promise<void> {
		this.logger.info(`Running ${this.name}`);

		let isDatabaseActive = false;
		let isCacheActive = false;
		let isWebsocketActive = false;

		try {
			isDatabaseActive = await testConnection(connection, this.logger);
			isCacheActive = this.redisClient.isConnected();
			isWebsocketActive = this.webSocketClient.isConnected();

			if (!isDatabaseActive) {
				await syncConnection(connection, this.logger);
				isDatabaseActive = await testConnection(connection);
			}
		} catch (error) {
			this.logger.error(error);
		}

		if (!isCacheActive || !isDatabaseActive || !isWebsocketActive) {
			this.logger.warn('Unavailable Backing Services, disconnecting all sockets');
			this.webSocketServer.disconnectAllSockets();
		}
	}
}
